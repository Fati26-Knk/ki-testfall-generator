import json
import os
import tempfile

from app.services.storage_service import StorageService


def test_storage_service_saves_files():
    with tempfile.TemporaryDirectory() as tmpdir:
        storage = StorageService(base_path=tmpdir)

        project = "projX"
        title = "Als Benutzer möchte ich mich einloggen"
        user_story = "Als Benutzer möchte ich mich einloggen, damit ich Zugriff auf das Dashboard habe"
        test_cases = [
            {
                "title": "Happy Path - Login",
                "description": "User logs in successfully",
                "preconditions": ["System läuft"],
                "steps": ["Open login", "Enter credentials", "Submit"],
                "expected_result": "User is logged in",
                "priority": "High",
            }
        ]

        result = storage.save_user_story(project=project, user_story_title=title, user_story_text=user_story, test_cases=test_cases)

        # Assert returned paths exist
        assert os.path.isdir(result["folder"]) is True
        assert os.path.isfile(result["meta_path"]) is True
        assert os.path.isfile(result["testcases_path"]) is True

        # Validate content
        with open(result["meta_path"], "r", encoding="utf-8") as f:
            meta = json.load(f)

        assert meta["project"] == project
        assert meta["user_story_title"] == title
        assert meta["count"] == len(test_cases)

        with open(result["testcases_path"], "r", encoding="utf-8") as f:
            tcs = json.load(f)

        assert "test_cases" in tcs
        assert len(tcs["test_cases"]) == len(test_cases)
