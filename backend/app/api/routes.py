"""
API routes for the test case generator
"""
from fastapi import APIRouter, HTTPException, Response
from app.models.schemas import UserStoryRequest, TestCaseResponse, HealthResponse
from app.models.schemas import AdoptResponse, StoredMetadata, AdoptRequest
from app.services.llm_service import LLMService
from app.services.storage_service import StorageService

router = APIRouter()
llm_service = LLMService()
storage = StorageService()


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



@router.post("/adopt-test-cases")
async def adopt_test_cases(request: AdoptRequest, project: str | None = None):
    """Persist generated test cases for a user story into the backend data folder.

    This endpoint expects the same request as `/generate-test-cases` and will
    generate test cases (using the LLM or mock) and then save them to disk.
    Returns metadata containing the saved file paths.
    """
    try:
        # If the client provided an explicit subset of test_cases, use them.
        if request.test_cases:
            # already validated as List[TestCase]
            to_save = [tc.model_dump() for tc in request.test_cases]
        else:
            test_cases = await llm_service.generate_test_cases(
                user_story=request.user_story,
                num_cases=request.num_test_cases
            )
            to_save = [tc.model_dump() for tc in test_cases]

        result = storage.save_user_story(
            project=project or "default",
            user_story_title=request.user_story[:80],
            user_story_text=request.user_story,
            test_cases=to_save,
        )

        return {"status": "saved", "result": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to adopt test cases: {e}")



@router.get("/projects")
async def list_projects():
    """List available projects"""
    return {"projects": storage.list_projects()}


@router.get("/projects/{project}/user-stories")
async def list_user_stories(project: str):
    return {"user_stories": storage.list_user_stories(project)}


@router.get("/projects/{project}/{us}/metadata", response_model=StoredMetadata)
async def get_metadata(project: str, us: str):
    m = storage.load_metadata(project, us)
    if m is None:
        raise HTTPException(status_code=404, detail="Metadata not found")
    return m


@router.get("/projects/{project}/{us}/testcases")
async def get_testcases(project: str, us: str):
    t = storage.load_testcases(project, us)
    if t is None:
        raise HTTPException(status_code=404, detail="Testcases not found")
    return t


@router.post("/projects/{project}/{us}/status")
async def update_status(project: str, us: str, status: str):
    ok = storage.update_status(project, us, status)
    if not ok:
        raise HTTPException(status_code=404, detail="User story not found")
    return {"status": "updated"}


@router.delete("/projects/{project}/{us}")
async def delete_user_story(project: str, us: str):
    ok = storage.delete_user_story(project, us)
    if not ok:
        raise HTTPException(status_code=404, detail="User story not found")
    return {"status": "deleted"}


@router.get("/projects/{project}/{us}/export/csv")
async def export_testcases_csv(project: str, us: str):
    tcs = storage.get_testcases_for_export(project, us)
    if tcs is None:
        raise HTTPException(status_code=404, detail="Testcases not found")

    # Build CSV content
    import io
    import csv

    buf = io.StringIO()
    # Define CSV columns: title, description, preconditions, steps, expected_result, priority
    writer = csv.writer(buf)
    writer.writerow(["title", "description", "preconditions", "steps", "expected_result", "priority"])
    for tc in tcs:
        writer.writerow([
            tc.get("title", ""),
            tc.get("description", ""),
            " | ".join(tc.get("preconditions", [])),
            " | ".join(tc.get("steps", [])),
            tc.get("expected_result", ""),
            tc.get("priority", ""),
        ])

    return Response(content=buf.getvalue(), media_type="text/csv")
