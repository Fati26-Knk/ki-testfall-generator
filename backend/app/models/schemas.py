"""
Data models for the test case generator API
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class UserStoryRequest(BaseModel):
    """Request model for user story input"""
    user_story: str = Field(..., min_length=10, description="User story to generate test cases from")
    num_test_cases: Optional[int] = Field(default=5, ge=1, le=20, description="Number of test cases to generate")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_story": "As a user, I want to log in to the system so that I can access my dashboard",
                "num_test_cases": 5
            }
        }


class TestCase(BaseModel):
    """Model for a single test case"""
    title: str = Field(..., description="Title of the test case")
    description: str = Field(..., description="Description of what the test case validates")
    preconditions: List[str] = Field(default_factory=list, description="Pre-conditions for the test")
    steps: List[str] = Field(..., description="Steps to execute the test")
    expected_result: str = Field(..., description="Expected outcome of the test")
    priority: str = Field(default="Medium", description="Priority level (High, Medium, Low)")


class TestCaseResponse(BaseModel):
    """Response model for generated test cases"""
    user_story: str = Field(..., description="Original user story")
    test_cases: List[TestCase] = Field(..., description="Generated test cases")
    generated_count: int = Field(..., description="Number of test cases generated")


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="API status")
    version: str = Field(..., description="API version")
