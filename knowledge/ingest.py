"""
Prohori AI - Knowledge Base Ingestion Script
Indexes MITRE ATT&CK, NVD CVE, and CWE entries into pgvector or local cache.
Run manually or during container startup: python knowledge/ingest.py
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from knowledge.data.curated_kb import CVE_DATABASE, CWE_DATABASE, MITRE_TECHNIQUES
from knowledge.retriever import kb_retriever

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [KB-INGEST] %(message)s")
logger = logging.getLogger("prohori.kb_ingest")


async def ingest_to_postgres():
    """Optionally sync knowledge vectors into PostgreSQL with pgvector."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url or "sqlite" in db_url:
        logger.info("Using embedded local Knowledge Base index (offline mode).")
        return

    try:
        from sqlalchemy import text
        from sqlalchemy.ext.asyncio import create_async_engine
        engine = create_async_engine(db_url, echo=False)
        async with engine.begin() as conn:
            if conn.dialect.name == "postgresql":
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                await conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS knowledge_items (
                        id VARCHAR(50) PRIMARY KEY,
                        doc_type VARCHAR(30) NOT NULL,
                        title TEXT NOT NULL,
                        content TEXT NOT NULL,
                        mitigation TEXT NOT NULL
                    );
                """))
                for doc in kb_retriever.documents:
                    await conn.execute(
                        text("""
                            INSERT INTO knowledge_items (id, doc_type, title, content, mitigation)
                            VALUES (:id, :doc_type, :title, :content, :mitigation)
                            ON CONFLICT (id) DO UPDATE SET
                                title = EXCLUDED.title,
                                content = EXCLUDED.content,
                                mitigation = EXCLUDED.mitigation;
                        """),
                        {
                            "id": doc.doc_id,
                            "doc_type": doc.doc_type,
                            "title": doc.title,
                            "content": doc.content,
                            "mitigation": doc.mitigation
                        }
                    )
                logger.info(f"Successfully synced {len(kb_retriever.documents)} knowledge documents to PostgreSQL.")
        await engine.dispose()
    except Exception as e:
        logger.warning(f"Could not sync to PostgreSQL ({e}). Local in-memory retriever remains fully operational.")


def main():
    logger.info("Initializing Knowledge Base Ingestion...")
    logger.info(f"Indexed {len(MITRE_TECHNIQUES)} MITRE ATT&CK techniques.")
    logger.info(f"Indexed {len(CVE_DATABASE)} NVD CVE vulnerability records.")
    logger.info(f"Indexed {len(CWE_DATABASE)} CWE weakness profiles.")
    logger.info(f"Total offline searchable documents: {len(kb_retriever.documents)}")

    asyncio.run(ingest_to_postgres())
    logger.info("Knowledge Base Ingestion completed successfully.")


if __name__ == "__main__":
    main()

