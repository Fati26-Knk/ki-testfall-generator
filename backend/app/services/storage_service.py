"""
Database-backed storage service for test cases.
Replaces the filesystem JSON storage with PostgreSQL.
"""
from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import Project, UserStory, TestCase, StagingTestCase, SessionLocal


def _sanitize(name: str) -> str:
    """Sanitize a string for use as a folder name (kept for compatibility)."""
    s = re.sub(r"[^\w\- ]+", "", name)
    s = re.sub(r"\s+", "-", s).strip("-_")
    return s[:200]


class StorageService:
    """
    Service für Datenbankoperationen.
    Ersetzt die Dateisystem-basierte JSON-Speicherung.
    """

    def __init__(self):
        """Initialize the storage service."""
        pass

    def _get_db(self) -> Session:
        """Get a database session."""
        return SessionLocal()

    # ========================================================================
    # Project Operations
    # ========================================================================

    def create_project(self, project_name: str) -> str:
        """Create a new project. Returns the sanitized project name."""
        db = self._get_db()
        try:
            sanitized = _sanitize(project_name or "default")
            
            # Check if project already exists
            existing = db.query(Project).filter(Project.name == sanitized).first()
            if existing:
                return sanitized
            
            # Create new project
            project = Project(
                name=sanitized,
                description=project_name,
            )
            db.add(project)
            db.commit()
            return sanitized
        finally:
            db.close()

    def list_projects(self) -> List[Dict[str, Any]]:
        """Return a list of all projects with metadata."""
        db = self._get_db()
        try:
            projects = db.query(Project).all()
            results = []
            
            for project in projects:
                # Count total test cases for this project
                test_count = db.query(func.count(TestCase.id))\
                    .join(UserStory)\
                    .filter(UserStory.project_id == project.id)\
                    .scalar() or 0
                
                results.append({
                    "name": project.name,
                    "project": project.description or project.name,
                    "test_case_count": test_count,
                    "created_at": project.created_at.isoformat() + "Z" if project.created_at else None,
                    "updated_at": project.updated_at.isoformat() + "Z" if project.updated_at else None,
                    "last_modified": project.updated_at.isoformat() + "Z" if project.updated_at else None,
                })
            
            return results
        finally:
            db.close()

    def rename_project(self, old_name: str, new_name: str) -> str:
        """Rename a project. Returns new sanitized name."""
        db = self._get_db()
        try:
            old_sanitized = _sanitize(old_name)
            new_sanitized = _sanitize(new_name)
            
            project = db.query(Project).filter(Project.name == old_sanitized).first()
            if not project:
                raise FileNotFoundError(f"Project '{old_name}' not found")
            
            # Check if new name already exists
            existing = db.query(Project).filter(Project.name == new_sanitized).first()
            if existing and existing.id != project.id:
                raise FileExistsError(f"Project '{new_name}' already exists")
            
            project.name = new_sanitized
            project.description = new_name
            db.commit()
            return new_sanitized
        finally:
            db.close()

    def delete_project(self, project_name: str) -> bool:
        """Delete a project and all its user stories and test cases."""
        db = self._get_db()
        try:
            sanitized = _sanitize(project_name or "default")
            project = db.query(Project).filter(Project.name == sanitized).first()
            if project:
                db.delete(project)
                db.commit()
                return True
            return False
        finally:
            db.close()

    # ========================================================================
    # User Story Operations
    # ========================================================================

    def list_user_stories(self, project_name: str) -> List[str]:
        """Return a list of user story folder names for a project."""
        db = self._get_db()
        try:
            sanitized = _sanitize(project_name or "default")
            project = db.query(Project).filter(Project.name == sanitized).first()
            if not project:
                return []
            
            user_stories = db.query(UserStory).filter(UserStory.project_id == project.id).all()
            return [us.folder_name for us in user_stories]
        finally:
            db.close()

    def save_user_story(
        self,
        project: str,
        user_story_title: str,
        user_story_text: str,
        test_cases: List[Dict[str, Any]],
        meta_extra: Dict[str, Any] | None = None
    ) -> Dict[str, Any]:
        """
        Save a user story and its test cases.
        Creates the project if it doesn't exist.
        """
        db = self._get_db()
        try:
            proj_name = _sanitize(project or "default")
            us_folder = _sanitize(user_story_title or "untitled")
            
            # Get or create project
            proj = db.query(Project).filter(Project.name == proj_name).first()
            if not proj:
                proj = Project(name=proj_name, description=project)
                db.add(proj)
                db.flush()
            
            # Check if user story exists (update) or create new
            existing_us = db.query(UserStory).filter(
                UserStory.project_id == proj.id,
                UserStory.folder_name == us_folder
            ).first()
            
            if existing_us:
                # Update existing user story
                existing_us.title = user_story_title
                existing_us.description = user_story_text
                existing_us.updated_at = datetime.utcnow()
                user_story = existing_us
                
                # Delete old test cases
                db.query(TestCase).filter(TestCase.user_story_id == user_story.id).delete()
            else:
                # Create new user story
                user_story = UserStory(
                    project_id=proj.id,
                    title=user_story_title,
                    description=user_story_text,
                    folder_name=us_folder,
                    status="new",
                )
                db.add(user_story)
                db.flush()
            
            # Add test cases
            for tc_data in test_cases:
                test_case = TestCase(
                    user_story_id=user_story.id,
                    title=tc_data.get("title", "Untitled"),
                    description=tc_data.get("description", ""),
                    test_type=tc_data.get("type", "functional"),
                    priority=tc_data.get("priority", "Medium"),
                    preconditions=tc_data.get("preconditions", []),
                    steps=tc_data.get("steps", []),
                    expected_result=tc_data.get("expected_result", ""),
                    covers=tc_data.get("covers", []),
                )
                db.add(test_case)
            
            # Update project timestamp
            proj.updated_at = datetime.utcnow()
            
            db.commit()
            
            return {
                "folder": f"{proj_name}/{us_folder}",
                "project_folder": proj_name,
                "us_folder": us_folder,
                "meta_path": None,  # Not applicable for DB
                "testcases_path": None,  # Not applicable for DB
            }
        finally:
            db.close()

    def load_metadata(self, project: str, us_folder: str) -> Dict[str, Any] | None:
        """Load metadata for a user story."""
        db = self._get_db()
        try:
            proj_name = _sanitize(project or "default")
            
            proj = db.query(Project).filter(Project.name == proj_name).first()
            if not proj:
                return None
            
            user_story = db.query(UserStory).filter(
                UserStory.project_id == proj.id,
                UserStory.folder_name == us_folder
            ).first()
            
            if not user_story:
                return None
            
            test_count = db.query(func.count(TestCase.id))\
                .filter(TestCase.user_story_id == user_story.id)\
                .scalar() or 0
            
            return {
                "project": proj.description or proj.name,
                "user_story_title": user_story.title,
                "user_story": user_story.description,
                "count": test_count,
                "created_at": user_story.created_at.isoformat() + "Z" if user_story.created_at else None,
                "status": user_story.status,
            }
        finally:
            db.close()

    def load_testcases(self, project: str, us_folder: str) -> Dict[str, Any] | None:
        """Load test cases for a user story."""
        db = self._get_db()
        try:
            proj_name = _sanitize(project or "default")
            
            proj = db.query(Project).filter(Project.name == proj_name).first()
            if not proj:
                return None
            
            user_story = db.query(UserStory).filter(
                UserStory.project_id == proj.id,
                UserStory.folder_name == us_folder
            ).first()
            
            if not user_story:
                return None
            
            test_cases = db.query(TestCase)\
                .filter(TestCase.user_story_id == user_story.id)\
                .all()
            
            return {
                "test_cases": [tc.to_dict() for tc in test_cases]
            }
        finally:
            db.close()

    def delete_user_story(self, project: str, us_folder: str) -> bool:
        """Delete a user story and its test cases."""
        db = self._get_db()
        try:
            proj_name = _sanitize(project or "default")
            
            proj = db.query(Project).filter(Project.name == proj_name).first()
            if not proj:
                return False
            
            user_story = db.query(UserStory).filter(
                UserStory.project_id == proj.id,
                UserStory.folder_name == us_folder
            ).first()
            
            if user_story:
                db.delete(user_story)
                db.commit()
                return True
            return False
        finally:
            db.close()

    def get_testcases_for_export(self, project: str, us_folder: str) -> List[Dict[str, Any]] | None:
        """Return list of test case dicts for export."""
        data = self.load_testcases(project, us_folder)
        if not data:
            return None
        return data.get("test_cases")

    def update_status(self, project: str, us_folder: str, status: str) -> bool:
        """Update the status of a user story."""
        db = self._get_db()
        try:
            proj_name = _sanitize(project or "default")
            
            proj = db.query(Project).filter(Project.name == proj_name).first()
            if not proj:
                return False
            
            user_story = db.query(UserStory).filter(
                UserStory.project_id == proj.id,
                UserStory.folder_name == us_folder
            ).first()
            
            if user_story:
                user_story.status = status
                user_story.updated_at = datetime.utcnow()
                db.commit()
                return True
            return False
        finally:
            db.close()

    # ========================================================================
    # Staging Operations (für temporäre Testfälle)
    # ========================================================================

    def get_staging(self, session_id: str = "default") -> List[Dict[str, Any]]:
        """Get all test cases from staging area."""
        db = self._get_db()
        try:
            staging = db.query(StagingTestCase)\
                .filter(StagingTestCase.session_id == session_id)\
                .all()
            return [tc.to_dict() for tc in staging]
        finally:
            db.close()

    def save_to_staging(self, test_cases: List[Dict[str, Any]], user_story_text: str = None, session_id: str = "default") -> int:
        """Save test cases to staging area. Returns count of saved items."""
        db = self._get_db()
        try:
            for tc_data in test_cases:
                # user_story kann aus dem einzelnen Testfall oder dem globalen Parameter kommen
                us_text = tc_data.get("user_story") or tc_data.get("userStoryTitle") or user_story_text
                print(f"DEBUG save_to_staging: title='{tc_data.get('title', '')[:30]}', user_story='{us_text}'")
                staging = StagingTestCase(
                    session_id=session_id,
                    title=tc_data.get("title", "Untitled"),
                    description=tc_data.get("description", ""),
                    test_type=tc_data.get("type", "functional"),
                    priority=tc_data.get("priority", "Medium"),
                    preconditions=tc_data.get("preconditions", []),
                    steps=tc_data.get("steps", []),
                    expected_result=tc_data.get("expected_result", ""),
                    covers=tc_data.get("covers", []),
                    user_story_text=us_text,
                )
                db.add(staging)
            db.commit()
            return len(test_cases)
        finally:
            db.close()

    def clear_staging(self, session_id: str = "default") -> int:
        """Clear all test cases from staging area. Returns count of deleted items."""
        db = self._get_db()
        try:
            count = db.query(StagingTestCase)\
                .filter(StagingTestCase.session_id == session_id)\
                .delete()
            db.commit()
            return count
        finally:
            db.close()

    def update_staging(self, test_cases: List[Dict[str, Any]], session_id: str = "default") -> int:
        """Replace all staging test cases with new ones."""
        db = self._get_db()
        try:
            # Clear existing
            db.query(StagingTestCase)\
                .filter(StagingTestCase.session_id == session_id)\
                .delete()
            
            # Add new
            for tc_data in test_cases:
                staging = StagingTestCase(
                    session_id=session_id,
                    title=tc_data.get("title", "Untitled"),
                    description=tc_data.get("description", ""),
                    test_type=tc_data.get("type", "functional"),
                    priority=tc_data.get("priority", "Medium"),
                    preconditions=tc_data.get("preconditions", []),
                    steps=tc_data.get("steps", []),
                    expected_result=tc_data.get("expected_result", ""),
                    covers=tc_data.get("covers", []),
                    user_story_text=tc_data.get("user_story"),  # User Story Titel beibehalten!
                )
                db.add(staging)
            
            db.commit()
            return len(test_cases)
        finally:
            db.close()


__all__ = ["StorageService"]
