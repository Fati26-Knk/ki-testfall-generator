"""
Tests for API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.schemas import TestCase

client = TestClient(app)


class FakeLLMService:
    provider = "mock"
    using_azure = False
    client_available = True
    model = "mock-model"
    last_generation_source = "mock"

    async def generate_test_cases(self, user_story, num_cases=5, **kwargs):
        return [
            TestCase(
                title="TC-1 - Login works",
                description="Verify that a user can log in successfully.",
                steps=["Open the login page", "Enter valid credentials", "Submit the form"],
                expected_result="The dashboard is displayed.",
                preconditions=["User has a valid account"],
                covers=["Authentication"],
                priority="High",
            )
        ]


@pytest.fixture(autouse=True)
def fake_llm_service():
    original_service = getattr(app.state, "llm_service", None)
    app.state.llm_service = FakeLLMService()
    yield
    if original_service is None:
        delattr(app.state, "llm_service")
    else:
        app.state.llm_service = original_service


def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data


def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_generate_test_cases():
    """Test the test case generation endpoint"""
    request_data = {
        "user_story": "As a user, I want to log in to the system so that I can access my dashboard",
        "num_test_cases": 3
    }
    
    response = client.post("/generate-test-cases", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "user_story" in data
    assert "test_cases" in data
    assert "generated_count" in data
    assert data["generated_count"] > 0
    assert len(data["test_cases"]) > 0
    
    # Verify test case structure
    test_case = data["test_cases"][0]
    assert "title" in test_case
    assert "description" in test_case
    assert "steps" in test_case
    assert "expected_result" in test_case


def test_generate_test_cases_invalid_input():
    """Test with invalid input"""
    request_data = {
        "user_story": "short",  # Too short
        "num_test_cases": 3
    }
    
    response = client.post("/generate-test-cases", json=request_data)
    assert response.status_code == 422  # Validation error
