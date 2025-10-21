"""
Data models for the test case generator API – upgraded
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal


# ===== Requests =====

class UserStoryRequest(BaseModel):
    """Request model for user story input"""
    user_story: str = Field(..., min_length=10, description="User story to generate test cases from")
    # 0 = 'comprehensive' bleibt bestehen
    num_test_cases: Optional[int] = Field(default=5, ge=0, description="Number of test cases to generate; 0 means comprehensive")
    # Neu: optionale Akzeptanzkriterien/NFR/Rollen – steigert Präzision
    acceptance_criteria: Optional[List[str]] = Field(default=None, description="Explicit acceptance criteria for traceability/coverage mapping")
    non_functional_reqs: Optional[List[str]] = Field(default=None, description="NFRs like performance, security, accessibility")
    roles: Optional[List[str]] = Field(default=None, description="Known roles/permissions to seed role-based tests")
    # Seed für deterministischere Ausgaben (wenn Modell es unterstützt)
    seed: Optional[int] = Field(default=None, description="Deterministic generation seed")


# ===== Analysis / Design Plan =====

DimensionType = Literal[
    "Boundary", "Negative", "Roles", "State", "i18n", "Accessibility",
    "Performance", "ErrorHandling", "Security"
]

class Extraction(BaseModel):
    """US-Extraktion (Analyse)"""
    summary: str
    preconditions: List[str] = []
    entities: List[str] = []
    constraints: List[str] = []
    acceptance_criteria: List[str] = []
    primary_feature: str

class DesignPlanItem(BaseModel):
    """Plan für Testdimensionen – zwingt Varianz"""
    dimension: DimensionType
    notes: str


# ===== Testfälle =====

Priority = Literal["High", "Medium", "Low"]
TestType = Literal["Functional", "NonFunctional"]

class GWT(BaseModel):
    """Given/When/Then – klarer, importierbar"""
    given: str
    when: str
    then: str

class TestCaseV2(BaseModel):
    """Richer test case model (kompatibel erweiterbar)"""
    id: Optional[str] = Field(None, description="Stable identifier like US-123-TC-001")
    title: str
    description: str
    type: TestType = "Functional"
    priority: Priority = "Medium"

    # Neu: Dimension zur Varianz-Steuerung
    dimension: Optional[DimensionType] = None

    # Entweder strukturierte Steps ODER dein bisheriges Plain-Array
    gwt: Optional[GWT] = None
    steps: Optional[List[str]] = Field(default=None, description="Optional plain steps for legacy consumers")

    expected_result: str
    data: Optional[Dict[str, object]] = Field(default=None, description="Concrete input data set for this case")
    preconditions: List[str] = []
    postconditions: List[str] = []
    tags: List[str] = []
    # Traceability (z. B. AC-IDs oder Texte)
    traceability: List[str] = Field(default_factory=list, description="Links to ACs/US parts (e.g., ['AC-1','AC-3'])")


# ===== Coverage & Dedup =====

class CoverageItem(BaseModel):
    ac: str
    test_ids: List[str]

class DedupInfo(BaseModel):
    """Ergebnis der Duplikaterkennung"""
    removed_count: int = 0
    near_duplicates: List[List[str]] = Field(default_factory=list, description="Groups of similar test IDs")
    similarity_threshold: float = 0.9


# ===== Responses =====

class TestCase(BaseModel):
    """
    Legacy model (dein bisheriges). Bleibt drin, falls ältere Clients es erwarten.
    Empfohlen: künftig TestCaseV2 nutzen.
    """
    title: str
    description: str
    type: str = "functional"
    preconditions: List[str] = []
    steps: List[str]
    expected_result: str
    covers: List[str] = []
    priority: str = "Medium"

class GenerationMeta(BaseModel):
    """Transparenz über Kosten/Model/Token"""
    model: Optional[str] = None
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    cost_estimate: Optional[float] = None
    generated_by: Optional[str] = Field(default=None, description="Source: 'openai' | 'mock' | provider name")
    seed: Optional[int] = None

class TestCaseResponse(BaseModel):
    """Response model for generated test cases (erweitert, abwärtskompatibel)"""
    user_story: str
    # Legacy-Ausgabe – falls du sie weiter bedienen willst
    test_cases: List[TestCase] = Field(default_factory=list, description="Legacy test cases")

    # Neue, reichere Ausgabe
    extraction: Optional[Extraction] = None
    design_plan: Optional[List[DesignPlanItem]] = None
    test_cases_v2: Optional[List[TestCaseV2]] = None
    coverage_map: Optional[List[CoverageItem]] = None

    # Qualität/Operation
    dedup: Optional[DedupInfo] = None
    warnings: Optional[List[str]] = None

    generated_count: int
    meta: Optional[GenerationMeta] = None


# Health & Storage bleiben wie gehabt

class HealthResponse(BaseModel):
    status: str
    version: str

class StoredMetadata(BaseModel):
    project: str
    user_story_title: str
    user_story: str
    count: int
    created_at: str
    status: str

class AdoptRequest(BaseModel):
    """Request model for adopting test cases (selective adoption)"""
    user_story: str
    num_test_cases: Optional[int] = 5
    test_cases: Optional[List[TestCase]] = None  # legacy
    # Neu: auch V2-Fälle adoptieren
    test_cases_v2: Optional[List[TestCaseV2]] = None

class AdoptResponse(BaseModel):
    status: str
    result: dict
