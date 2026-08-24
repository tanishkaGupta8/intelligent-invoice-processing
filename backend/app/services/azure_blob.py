import os
import logging
from azure.storage.blob import BlobServiceClient
from app.config import settings

logger = logging.getLogger(__name__)

class AzureBlobService:
    def __init__(self):
        cloud_conn = getattr(settings, 'AZURE_STORAGE_CONNECTION_STRING', '').strip()
        if cloud_conn and "your_azure" not in cloud_conn and "your-storage-account" not in cloud_conn:
            self.connection_string = cloud_conn
            logger.info("Configured for Live Azure Cloud Blob Storage.")
        else:
            self.connection_string = settings.AZURITE_CONNECTION_STRING
            logger.info("Configured for Local Azurite Blob Storage Emulator.")

        self.container_name = settings.AZURE_CONTAINER_NAME
        self.local_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
        self._client = None

    def _get_client(self):
        if not self._client:
            self._client = BlobServiceClient.from_connection_string(
                self.connection_string,
                connection_timeout=3
            )
            container_client = self._client.get_container_client(self.container_name)
            if not container_client.exists():
                container_client.create_container()
        return self._client

    def upload_file(self, file_bytes: bytes, filename: str) -> str:
        """
        Uploads raw file bytes to Azure Blob Storage (Azurite) container.
        Falls back to local disk storage if Azurite is offline.
        """
        try:
            client = self._get_client()
            blob_client = client.get_blob_client(container=self.container_name, blob=filename)
            blob_client.upload_blob(file_bytes, overwrite=True)
            return blob_client.url
        except Exception as e:
            logger.warning(f"Azurite storage unavailable ({e}). Saving to local directory '{self.local_dir}'...")
            os.makedirs(self.local_dir, exist_ok=True)
            local_path = os.path.join(self.local_dir, filename)
            with open(local_path, "wb") as f:
                f.write(file_bytes)
            return f"/uploads/{filename}"

    def download_file(self, filename: str) -> bytes:
        """
        Downloads binary file bytes from Azurite blob container.
        Falls back to local disk storage if Azurite is unreachable or file is local.
        """
        try:
            client = self._get_client()
            blob_client = client.get_blob_client(container=self.container_name, blob=filename)
            download_stream = blob_client.download_blob()
            return download_stream.readall()
        except Exception as e:
            logger.warning(f"Fetching '{filename}' from local fallback directory...")
            local_path = os.path.join(self.local_dir, filename)
            if os.path.exists(local_path):
                with open(local_path, "rb") as f:
                    return f.read()
            raise FileNotFoundError(f"File '{filename}' not found in blob storage or local disk.")

    def delete_file(self, filename: str) -> bool:
        """
        Deletes binary file from Azurite blob container or local fallback disk.
        """
        deleted = False
        try:
            client = self._get_client()
            blob_client = client.get_blob_client(container=self.container_name, blob=filename)
            if blob_client.exists():
                blob_client.delete_blob()
                deleted = True
                logger.info(f"Deleted '{filename}' from Azurite blob container.")
        except Exception as e:
            logger.warning(f"Azurite delete warning for '{filename}': {e}")

        local_path = os.path.join(self.local_dir, filename)
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
                deleted = True
                logger.info(f"Deleted '{filename}' from local uploads directory.")
            except Exception as ex:
                logger.warning(f"Local file delete warning for '{filename}': {ex}")

        return deleted

blob_service = AzureBlobService()
