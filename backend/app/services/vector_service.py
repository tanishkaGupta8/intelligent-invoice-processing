import logging
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from app.config import settings

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL_NAME
        self.collection_name = settings.QDRANT_COLLECTION
        self.host = settings.QDRANT_HOST
        self.port = settings.QDRANT_PORT
        
        self._model = None
        self._qdrant_client = None

    def _get_model(self) -> SentenceTransformer:
        if self._model is None:
            logger.info(f"Loading SentenceTransformers model '{self.model_name}'...")
            self._model = SentenceTransformer(self.model_name)
        return self._model

    def _get_qdrant_client(self) -> QdrantClient:
        if self._qdrant_client is None:
            logger.info(f"Connecting to Qdrant Vector DB at http://{self.host}:{self.port}...")
            self._qdrant_client = QdrantClient(host=self.host, port=self.port, timeout=5.0)
            self._ensure_collection_exists()
        return self._qdrant_client

    def _ensure_collection_exists(self):
        try:
            collections = [c.name for c in self._qdrant_client.get_collections().collections]
            if self.collection_name not in collections:
                logger.info(f"Creating Qdrant collection '{self.collection_name}' (384-d Cosine)...")
                self._qdrant_client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
                )
        except Exception as e:
            logger.warning(f"Qdrant connection error during collection init: {e}")

    def generate_embedding(self, text: str) -> List[float]:
        """
        Converts text string into a 384-dimensional normalized dense vector.
        """
        model = self._get_model()
        vector = model.encode(text, normalize_embeddings=True)
        return vector.tolist()

    def upsert_invoice_vector(self, invoice_id: int, text: str, payload: Dict[str, Any]) -> bool:
        """
        Encodes invoice text and upserts vector + payload into Qdrant collection.
        """
        try:
            client = self._get_qdrant_client()
            vector = self.generate_embedding(text)
            
            point = PointStruct(
                id=invoice_id,
                vector=vector,
                payload=payload
            )
            
            client.upsert(
                collection_name=self.collection_name,
                points=[point]
            )
            logger.info(f"Successfully indexed vector for invoice #{invoice_id} in Qdrant.")
            return True
        except Exception as e:
            logger.warning(f"Failed to upsert vector to Qdrant for invoice #{invoice_id}: {e}")
            return False

    def search_similar_invoices(self, query: str, limit: int = 10, score_threshold: float = 0.4) -> List[Dict[str, Any]]:
        """
        Executes Cosine similarity search over Qdrant collection using query text vector.
        """
        try:
            client = self._get_qdrant_client()
            query_vector = self.generate_embedding(query)
            
            search_results = client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=limit,
                score_threshold=score_threshold
            )
            
            results = []
            for hit in search_results:
                results.append({
                    "invoice_id": hit.id,
                    "score": round(hit.score, 4),
                    "payload": hit.payload
                })
            return results
        except Exception as e:
            logger.warning(f"Qdrant vector search failed ({e}). Returning empty search results.")
            return []

vector_service = VectorService()
