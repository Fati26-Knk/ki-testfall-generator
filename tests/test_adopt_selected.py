import json
import os
import tempfile

from fastapi.testclient import TestClient

from app.main import app


def test_adopt_selected_persists_subset():
    with tempfile.TemporaryDirectory() as tmpdir:
        from app.services.storage_service import StorageService
        import app.api.routes as routes

        routes.storage = StorageService(base_path=tmpdir)

        client = TestClient(app)

        # Create a fake set of generated testcases in the request body
        test_cases = [
            {
                "title": "TC 1",
                "description": "First",
                "preconditions": [],
                "steps": ["s1"],
                "expected_result": "ok",
                "priority": "Low",
            },
            {
                "title": "TC 2",
                "description": "Second",
                "preconditions": [],
                "steps": ["s1"],
                "expected_result": "ok",
                "priority": "Low",
            },
        ]

        payload = {
            "user_story": "Als Benutzer möchte ich X",
            "num_test_cases": 2,
            "test_cases": [test_cases[1]]  # adopt only the second one
        }

        r = client.post("/api/v1/adopt-test-cases?project=selProject", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "saved"

        meta_path = data["result"]["meta_path"]
        tc_path = data["result"]["testcases_path"]

        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)

        assert meta["count"] == 1

        with open(tc_path, "r", encoding="utf-8") as f:
            tcs = json.load(f)

        assert len(tcs.get("test_cases", [])) == 1
