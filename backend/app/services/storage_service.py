"""
Simple storage service to persist generated test cases to the filesystem.

This is intentionally lightweight for the MVP: it creates a data folder under
the backend root and writes a metadata JSON and a testcases JSON for each
user story. Filenames are sanitized to be filesystem-safe.
"""
from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, List
import shutil


def _sanitize(name: str) -> str:
    """Sanitize a string for use as a filesystem folder name."""
    # remove non-word characters, collapse spaces and trim
    s = re.sub(r"[^\w\- ]+", "", name)
    s = re.sub(r"\s+", "-", s).strip("-_")
    return s[:200]


class StorageService:
    def __init__(self, base_path: str | None = None):
        # default base path: backend/data
        root = base_path or os.path.join(os.path.dirname(__file__), "..", "..", "data")
        self.base_path = os.path.abspath(root)
        os.makedirs(self.base_path, exist_ok=True)

    def save_user_story(self, project: str, user_story_title: str, user_story_text: str, test_cases: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Persist a user story and its generated test cases.

        `test_cases` may be the full generated set or a client-provided subset.

        Returns metadata including the folder path where the data was saved.
        """
        proj = _sanitize(project or "default")
        us = _sanitize(user_story_title or "untitled")

        folder = os.path.join(self.base_path, proj, us)
        os.makedirs(folder, exist_ok=True)

        from datetime import datetime

        meta = {
            "project": project or "default",
            "user_story_title": user_story_title,
            "user_story": user_story_text,
            "count": len(test_cases),
            "created_at": datetime.utcnow().isoformat() + "Z",
            "status": "new",
        }

        meta_path = os.path.join(folder, "metadata.json")
        tc_path = os.path.join(folder, "testcases.json")

        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)

        with open(tc_path, "w", encoding="utf-8") as f:
            json.dump({"test_cases": test_cases}, f, ensure_ascii=False, indent=2)

        return {"folder": folder, "meta_path": meta_path, "testcases_path": tc_path}

    def list_projects(self) -> List[str]:
        """Return a list of project folder names."""
        try:
            return [name for name in os.listdir(self.base_path) if os.path.isdir(os.path.join(self.base_path, name))]
        except FileNotFoundError:
            return []

    def list_user_stories(self, project: str) -> List[str]:
        """Return a list of user story folder names for a project."""
        proj = _sanitize(project or "default")
        folder = os.path.join(self.base_path, proj)
        try:
            return [name for name in os.listdir(folder) if os.path.isdir(os.path.join(folder, name))]
        except FileNotFoundError:
            return []

    def load_metadata(self, project: str, us_folder: str) -> Dict[str, Any] | None:
        proj = _sanitize(project or "default")
        folder = os.path.join(self.base_path, proj, us_folder)
        meta_path = os.path.join(folder, "metadata.json")
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return None

    def load_testcases(self, project: str, us_folder: str) -> Dict[str, Any] | None:
        proj = _sanitize(project or "default")
        folder = os.path.join(self.base_path, proj, us_folder)
        tc_path = os.path.join(folder, "testcases.json")
        try:
            with open(tc_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return None

    def delete_user_story(self, project: str, us_folder: str) -> bool:
        """Delete a user story folder and its contents. Returns True if removed."""
        proj = _sanitize(project or "default")
        folder = os.path.join(self.base_path, proj, us_folder)
        if os.path.isdir(folder):
            shutil.rmtree(folder)
            # if project folder empty, remove it
            proj_folder = os.path.join(self.base_path, proj)
            try:
                if os.path.isdir(proj_folder) and not os.listdir(proj_folder):
                    os.rmdir(proj_folder)
            except Exception:
                pass
            return True
        return False

    def get_testcases_for_export(self, project: str, us_folder: str) -> List[Dict[str, Any]] | None:
        """Return list of test case dicts for export, or None if not found."""
        data = self.load_testcases(project, us_folder)
        if not data:
            return None
        return data.get("test_cases")

    def update_status(self, project: str, us_folder: str, status: str) -> bool:
        proj = _sanitize(project or "default")
        folder = os.path.join(self.base_path, proj, us_folder)
        meta_path = os.path.join(folder, "metadata.json")
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)

            meta["status"] = status

            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(meta, f, ensure_ascii=False, indent=2)

            return True
        except FileNotFoundError:
            return False


__all__ = ["StorageService"]
