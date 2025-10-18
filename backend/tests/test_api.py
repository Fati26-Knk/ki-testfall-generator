"""
Tests for API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data


def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/api/v1/health")
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
    
    response = client.post("/api/v1/generate-test-cases", json=request_data)
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
    
    response = client.post("/api/v1/generate-test-cases", json=request_data)
    assert response.status_code == 422  # Validation error
