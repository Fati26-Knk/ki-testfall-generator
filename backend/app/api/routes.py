"""
API routes for the test case generator
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import UserStoryRequest, TestCaseResponse, HealthResponse
from app.services.llm_service import LLMService

router = APIRouter()
llm_service = LLMService()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="1.0.0"
    )


@router.post("/generate-test-cases", response_model=TestCaseResponse)
async def generate_test_cases(request: UserStoryRequest):
    """
    Generate test cases from a user story
    
    Args:
        request: UserStoryRequest containing the user story and optional parameters
        
    Returns:
        TestCaseResponse with generated test cases
        
    Raises:
        HTTPException: If test case generation fails
    """
    try:
        test_cases = await llm_service.generate_test_cases(
            user_story=request.user_story,
            num_cases=request.num_test_cases
        )
        
        if not test_cases:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate test cases"
            )
        
        return TestCaseResponse(
            user_story=request.user_story,
            test_cases=test_cases,
            generated_count=len(test_cases)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating test cases: {str(e)}"
        )
