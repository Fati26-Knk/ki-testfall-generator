import json
import os
import tempfile

from fastapi.testclient import TestClient

from app.main import app


def test_testplan_flow(monkeypatch):
    with tempfile.TemporaryDirectory() as tmpdir:
        from app.services.storage_service import StorageService
        import app.api.routes as routes

        routes.storage = StorageService(base_path=tmpdir)

        client = TestClient(app)

        payload = {"user_story": "Als Benutzer möchte ich mich einloggen", "num_test_cases": 2}
        r = client.post("/api/v1/adopt-test-cases?project=demoProject", json=payload)
        assert r.status_code == 200
        data = r.json()
        folder = data["result"]["folder"]
        # list projects
        r2 = client.get("/api/v1/projects")
        assert r2.status_code == 200
        projects = r2.json()["projects"]
        assert "demoProject" in projects

        # list user stories
        r3 = client.get("/api/v1/projects/demoProject/user-stories")
        assert r3.status_code == 200
        us_list = r3.json()["user_stories"]
        assert len(us_list) == 1

        us_folder = us_list[0]

        # metadata
        r4 = client.get(f"/api/v1/projects/demoProject/{us_folder}/metadata")
        assert r4.status_code == 200
        meta = r4.json()
        assert meta["status"] == "new"

        # update status
        r5 = client.post(f"/api/v1/projects/demoProject/{us_folder}/status?status=active")
        assert r5.status_code == 200
        r6 = client.get(f"/api/v1/projects/demoProject/{us_folder}/metadata")
        assert r6.json()["status"] == "active"
