import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Intelligent Invoice Processing & Semantic Search Engine"
    API_V1_STR: str = "/api/v1"
    
    # PostgreSQL Settings
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "invoicedb")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )

    # Qdrant Settings
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    QDRANT_COLLECTION: str = os.getenv("QDRANT_COLLECTION", "invoice_embeddings")

    # Azurite Storage Settings
    AZURITE_CONNECTION_STRING: str = os.getenv(
        "AZURITE_CONNECTION_STRING",
        "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8nsOM05zxdE60ZlwqsCXVneDPLU68Z0U3l5C0o9FutFQqs4fV35jT4bF6x9_DevAccountKey;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
    )
    AZURE_CONTAINER_NAME: str = os.getenv("AZURE_CONTAINER_NAME", "invoices-raw")

    # AI Model & Azure Document Intelligence Settings
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
    AZURE_DOC_INTEL_ENDPOINT: str = os.getenv("AZURE_DOC_INTEL_ENDPOINT", "")
    AZURE_DOC_INTEL_KEY: str = os.getenv("AZURE_DOC_INTEL_KEY", "")

    class Config:
        case_sensitive = True
        extra = "ignore"
        env_file = ".env"

settings = Settings()
