import json
import os
import tempfile

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.mark.integration
def test_adopt_test_cases_saves_files(monkeypatch):
    with tempfile.TemporaryDirectory() as tmpdir:
        # Monkeypatch StorageService base path by setting environment variable or patching the class
        # The storage service was created at import time; to inject tmpdir, we'll replace the storage
        # object on the routes module with a new instance pointing to tmpdir.
        from app.services.storage_service import StorageService
        import app.api.routes as routes

        routes.storage = StorageService(base_path=tmpdir)

        client = TestClient(app)

        payload = {"user_story": "Als Benutzer möchte ich mich einloggen", "num_test_cases": 2}
        resp = client.post("/api/v1/adopt-test-cases", json=payload)

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "saved"

        result = data["result"]
        assert os.path.isdir(result["folder"]) is True
        assert os.path.isfile(result["meta_path"]) is True
        assert os.path.isfile(result["testcases_path"]) is True

        with open(result["meta_path"], "r", encoding="utf-8") as f:
            meta = json.load(f)

        assert meta["status"] == "new"
        assert meta["count"] == 2
