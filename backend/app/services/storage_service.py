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

    def save_user_story(self, project: str, user_story_title: str, user_story_text: str, test_cases: List[Dict[str, Any]], meta_extra: Dict[str, Any] | None = None) -> Dict[str, Any]:
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

        # Merge any additional metadata provided by caller (e.g., generated_by, model)
        if meta_extra:
            try:
                meta.update(meta_extra)
            except Exception:
                pass

        meta_path = os.path.join(folder, "metadata.json")
        tc_path = os.path.join(folder, "testcases.json")

        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)

        with open(tc_path, "w", encoding="utf-8") as f:
            json.dump({"test_cases": test_cases}, f, ensure_ascii=False, indent=2)
        # Update project-level marker metadata (count, last_modified)
        try:
            self._update_project_marker(proj)
        except Exception:
            pass

        # Return both absolute paths and sanitized folder identifiers for client convenience
        return {
            "folder": folder,
            "meta_path": meta_path,
            "testcases_path": tc_path,
            "project_folder": proj,
            "us_folder": us,
        }

    def list_projects(self) -> List[str]:
        """Return a list of project metadata objects: { name, test_case_count, last_modified }."""
        try:
            results: List[Dict[str, Any]] = []
            for name in os.listdir(self.base_path):
                folder = os.path.join(self.base_path, name)
                if not os.path.isdir(folder):
                    continue
                marker = os.path.join(folder, 'project.json')
                if not os.path.exists(marker):
                    continue
                # read marker
                try:
                    with open(marker, 'r', encoding='utf-8') as f:
                        m = json.load(f)
                except Exception:
                    m = {}
                # compute test case count by summing all testcases in user-stories
                total = 0
                last_mod = m.get('updated_at') or m.get('created_at')
                try:
                    for us in os.listdir(folder):
                        us_folder = os.path.join(folder, us)
                        if not os.path.isdir(us_folder):
                            continue
                        tc_path = os.path.join(us_folder, 'testcases.json')
                        if os.path.exists(tc_path):
                            try:
                                with open(tc_path, 'r', encoding='utf-8') as f:
                                    d = json.load(f)
                                    total += len(d.get('test_cases', []))
                            except Exception:
                                continue
                except Exception:
                    pass

                results.append({
                    'name': name,
                    'test_case_count': total,
                    'last_modified': last_mod,
                    **(m or {}),
                })
            return results
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

    def create_project(self, project: str) -> str:
        """Create a project folder. Returns the sanitized project folder name."""
        proj = _sanitize(project or "default")
        folder = os.path.join(self.base_path, proj)
        os.makedirs(folder, exist_ok=True)
        # write a marker file so list_projects knows this was user-created
        marker = os.path.join(folder, 'project.json')
        try:
            from datetime import datetime
            meta = {"project": project, "created_at": datetime.utcnow().isoformat() + 'Z', 'updated_at': datetime.utcnow().isoformat() + 'Z'}
            with open(marker, 'w', encoding='utf-8') as f:
                json.dump(meta, f, ensure_ascii=False, indent=2)
        except Exception:
            pass
        return proj

    def _update_project_marker(self, proj: str) -> None:
        """Update the project's project.json marker with counts and updated_at."""
        folder = os.path.join(self.base_path, proj)
        marker = os.path.join(folder, 'project.json')
        now = None
        try:
            from datetime import datetime
            now = datetime.utcnow().isoformat() + 'Z'
        except Exception:
            now = None

        meta = {}
        if os.path.exists(marker):
            try:
                with open(marker, 'r', encoding='utf-8') as f:
                    meta = json.load(f) or {}
            except Exception:
                meta = {}

        # compute total test cases
        total = 0
        try:
            for us in os.listdir(folder):
                us_folder = os.path.join(folder, us)
                if not os.path.isdir(us_folder):
                    continue
                tc_path = os.path.join(us_folder, 'testcases.json')
                if os.path.exists(tc_path):
                    try:
                        with open(tc_path, 'r', encoding='utf-8') as f:
                            d = json.load(f)
                            total += len(d.get('test_cases', []))
                    except Exception:
                        continue
        except Exception:
            pass

        meta['test_case_count'] = total
        if now:
            meta['updated_at'] = now

        try:
            with open(marker, 'w', encoding='utf-8') as f:
                json.dump(meta, f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    def rename_project(self, old_name: str, new_name: str) -> str:
        """Rename a project folder. Returns new sanitized name."""
        old_proj = _sanitize(old_name)
        new_proj = _sanitize(new_name)
        old_folder = os.path.join(self.base_path, old_proj)
        new_folder = os.path.join(self.base_path, new_proj)
        if not os.path.isdir(old_folder):
            raise FileNotFoundError(old_folder)
        # if target exists, raise
        if os.path.exists(new_folder):
            raise FileExistsError(new_folder)
        os.rename(old_folder, new_folder)
        # update marker project name
        marker = os.path.join(new_folder, 'project.json')
        try:
            if os.path.exists(marker):
                with open(marker, 'r', encoding='utf-8') as f:
                    meta = json.load(f) or {}
        except Exception:
            meta = {}
        meta['project'] = new_name
        try:
            with open(marker, 'w', encoding='utf-8') as f:
                json.dump(meta, f, ensure_ascii=False, indent=2)
        except Exception:
            pass
        return new_proj

    def delete_project(self, project: str) -> bool:
        proj = _sanitize(project or 'default')
        folder = os.path.join(self.base_path, proj)
        if os.path.isdir(folder):
            shutil.rmtree(folder)
            return True
        return False

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
