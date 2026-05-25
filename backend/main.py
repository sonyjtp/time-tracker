"""
Backwards-compatible entry point for the FastAPI application.

This file imports and re-exports the app from app.main to maintain
backwards compatibility with existing deployment scripts and configurations.

The actual app code is in: src/app/main.py

Imports are resolved via pythonpath = ["src"] in pytest.ini and pyproject.toml
so imports use: from app.database import get_db (not from src.app.database)
"""

import sys
from pathlib import Path

# Add src to path so app can be imported (must be before app imports)
sys.path.insert(0, str(Path(__file__).parent / "src"))

# noqa: E402 - path manipulation required before app imports
from app.main import app  # noqa: E402

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
