"""
Database configuration and models for PostgreSQL storage.
Replaces the filesystem-based JSON storage with a proper relational database.
"""
import os
from datetime import datetime
from typing import List, Optional

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment or default for local development
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://testgen:testgen_secret@localhost:5432/testgen_db")

# Create engine
engine = create_engine(DATABASE_URL, echo=False)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# ============================================================================
# Database Models
# ============================================================================

class Project(Base):
    """
    Ein Projekt enthält mehrere User Stories.
    Beispiel: "Verbrenn", "KidWeb", "AUGE"
    """
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship: Ein Projekt hat viele User Stories
    user_stories = relationship("UserStory", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project(id={self.id}, name='{self.name}')>"


class UserStory(Base):
    """
    Eine User Story gehört zu einem Projekt und enthält mehrere Testfälle.
    Beispiel: "Als Benutzer möchte ich mich anmelden..."
    """
    __tablename__ = "user_stories"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    folder_name = Column(String(255), nullable=False, index=True)  # Sanitized name for compatibility
    status = Column(String(50), default="new")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="user_stories")
    test_cases = relationship("TestCase", back_populates="user_story", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<UserStory(id={self.id}, title='{self.title[:50]}...')>"


class TestCase(Base):
    """
    Ein Testfall gehört zu einer User Story.
    Enthält alle Details wie Schritte, erwartetes Ergebnis, Priorität.
    """
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    user_story_id = Column(Integer, ForeignKey("user_stories.id", ondelete="CASCADE"), nullable=False)
    
    # Testfall-Details
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    test_type = Column(String(100), default="functional")  # functional, negative, edge-case, etc.
    priority = Column(String(50), default="Medium")  # High, Medium, Low
    
    # Strukturierte Daten als JSON
    preconditions = Column(JSON, default=list)  # Liste von Vorbedingungen
    steps = Column(JSON, default=list)  # Liste von Testschritten
    expected_result = Column(Text, nullable=True)
    covers = Column(JSON, default=list)  # Was wird abgedeckt (AC references)
    
    # Metadaten
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user_story = relationship("UserStory", back_populates="test_cases")

    def __repr__(self):
        return f"<TestCase(id={self.id}, title='{self.title[:30]}...')>"

    def to_dict(self):
        """Convert to dictionary for API response."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "type": self.test_type,
            "priority": self.priority,
            "preconditions": self.preconditions or [],
            "steps": self.steps or [],
            "expected_result": self.expected_result,
            "covers": self.covers or [],
        }


class StagingTestCase(Base):
    """
    Temporärer Speicher für generierte Testfälle, die noch nicht
    einem Projekt zugeordnet wurden (Staging-Bereich).
    """
    __tablename__ = "staging_test_cases"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), index=True)  # Um verschiedene Sessions zu unterscheiden
    
    # Testfall-Details (gleiche Struktur wie TestCase)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    test_type = Column(String(100), default="functional")
    priority = Column(String(50), default="Medium")
    preconditions = Column(JSON, default=list)
    steps = Column(JSON, default=list)
    expected_result = Column(Text, nullable=True)
    covers = Column(JSON, default=list)
    
    # Original User Story (für Kontext)
    user_story_text = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        """Convert to dictionary for API response."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "type": self.test_type,
            "priority": self.priority,
            "preconditions": self.preconditions or [],
            "steps": self.steps or [],
            "expected_result": self.expected_result,
            "covers": self.covers or [],
            "user_story": self.user_story_text,
        }


# ============================================================================
# Database Utilities
# ============================================================================

def get_db():
    """
    Dependency für FastAPI: Erstellt eine DB-Session pro Request.
    Verwendung: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Erstellt alle Tabellen in der Datenbank.
    Wird beim Start der Anwendung aufgerufen.
    """
    Base.metadata.create_all(bind=engine)
    print("DATABASE: Tables created successfully")


def drop_db():
    """
    Löscht alle Tabellen (nur für Development/Testing!).
    """
    Base.metadata.drop_all(bind=engine)
    print("DATABASE: All tables dropped")


# ============================================================================
# Export
# ============================================================================

__all__ = [
    "engine",
    "SessionLocal",
    "Base",
    "Project",
    "UserStory",
    "TestCase",
    "StagingTestCase",
    "get_db",
    "init_db",
    "drop_db",
]
