"""
API routes for the test case generator
"""
from fastapi import APIRouter, HTTPException, Response
from app.models.schemas import UserStoryRequest, TestCaseResponse, HealthResponse
from app.models.schemas import AdoptResponse, StoredMetadata, AdoptRequest
from app.services.llm_service import LLMService
from app.services.storage_service import StorageService

from fastapi import Request
import json
import os

router = APIRouter()


def _get_services(request: Request):
    """Helper to retrieve services from app.state (initialized on startup)."""
    llm_service = getattr(request.app.state, "llm_service", None)
    storage = getattr(request.app.state, "storage", None)
    # allow tests to set module-level storage (e.g., `routes.storage = StorageService(...)`)
    if storage is None:
        storage = globals().get('storage', None)
    # Lazy fallback: if not present, create local instances (safe fallback)
    if llm_service is None:
        llm_service = LLMService()
        request.app.state.llm_service = llm_service
    if storage is None:
        storage = StorageService()
        request.app.state.storage = storage
    return llm_service, storage


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="1.0.0"
    )


@router.get("/openai/test")
async def openai_test(request: Request):
    """Test OpenAI connectivity (safe): returns ok:true if client configured and reachable."""
    try:
        llm_service, _ = _get_services(request)
        res = await llm_service.test_connection()
        return res
    except Exception as e:
        return {"ok": False, "error": str(e)}


@router.options("/generate-test-cases")
async def generate_test_cases_options():
    """Handle CORS preflight for generate-test-cases"""
    return Response(status_code=200)


@router.post("/generate-test-cases", response_model=TestCaseResponse)
async def generate_test_cases(request: Request):
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
        # Read raw body to provide clearer parse errors
        raw = await request.body()
        try:
            # Debug: log headers and raw body to help diagnose malformed requests
            try:
                headers = dict(request.headers)
                print("DEBUG: request.headers=", headers)
            except Exception:
                pass
            print("DEBUG: raw body repr=", repr(raw))
            payload = json.loads(raw.decode('utf-8') if isinstance(raw, (bytes, bytearray)) else raw)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON body: {e}")

        # Validate against pydantic model
        try:
            # Pydantic v2 validation entry
            body = UserStoryRequest.model_validate(payload)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Schema validation error: {e}")

        llm_service, _ = _get_services(request)
        try:
            test_cases = await llm_service.generate_test_cases(
                user_story=body.user_story,
                num_cases=body.num_test_cases
            )
        except HTTPException:
            # preserve HTTPExceptions raised by the service
            raise
        except Exception as e:
            import traceback
            print("ERROR during generate_test_cases call:")
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Generation error: {e}")

        # Debug: log what the service returned to help diagnose issues
        try:
            print(f"DEBUG: generate_test_cases returned type={type(test_cases)}, len={len(test_cases) if test_cases is not None else 'None'}")
            if test_cases and len(test_cases) > 0:
                print("DEBUG: sample test_case repr=", repr(test_cases[0]))
        except Exception:
            # non-fatal logging error
            pass
        
        if not test_cases:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate test cases"
            )
        
        generated_by = getattr(llm_service, 'last_generation_source', None)
        return TestCaseResponse(
            user_story=body.user_story,
            test_cases=test_cases,
            generated_count=len(test_cases),
            generated_by=generated_by,
        )
        
    except Exception as e:
        # If the handler already raised an HTTPException, re-raise it so the
        # original status code/detail are preserved (avoid wrapping as 500).
        if isinstance(e, HTTPException):
            raise
        import traceback
        traceback.print_exc()
        # include repr(e) so empty-string exceptions are visible
        raise HTTPException(
            status_code=500,
            detail=f"Error generating test cases: {repr(e)}"
        )


@router.options("/adopt-test-cases")
async def adopt_test_cases_options():
    """Handle CORS preflight for adopt-test-cases"""
    return Response(status_code=200)


@router.post("/adopt-test-cases")
async def adopt_test_cases(body: AdoptRequest, project: str | None = None, request: Request = None):
    """Persist generated test cases for a user story into the backend data folder.

    This endpoint expects the same request as `/generate-test-cases` and will
    generate test cases (using the LLM or mock) and then save them to disk.
    Returns metadata containing the saved file paths.
    """
    try:
        # If the client provided an explicit subset of test_cases, use them.
        if body.test_cases:
            # client provided test cases
            to_save = [tc.model_dump() for tc in body.test_cases]
            generated_by = "client"
            model_used = None
        else:
            llm_service, _ = _get_services(request)
            test_cases = await llm_service.generate_test_cases(
                user_story=body.user_story,
                num_cases=body.num_test_cases
            )
            to_save = [tc.model_dump() for tc in test_cases]
            # determine whether a real LLM was used or fallback mock (use tracked last_generation_source)
            generated_by = getattr(llm_service, "last_generation_source", "mock") or "mock"
            model_used = getattr(llm_service, "model", None)

        _, storage = _get_services(request)
        # Ensure project exists if provided to avoid arbitrary names being used.
        proj_name = project or "default"
        available = storage.list_projects()
        project_names = [p.get('name') if isinstance(p, dict) else p for p in available]
        if proj_name not in project_names and proj_name != "default":
            raise HTTPException(status_code=400, detail=f"Project '{proj_name}' does not exist. Create it first.")
        result = storage.save_user_story(
            project=proj_name,
            user_story_title=body.user_story[:80],
            user_story_text=body.user_story,
            test_cases=to_save,
            meta_extra={"generated_by": generated_by, "model": model_used},
        )

        # Return sanitized folder identifiers to help the frontend navigate
        return {"status": "saved", "result": result, "project_folder": result.get('project_folder'), "us_folder": result.get('us_folder')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to adopt test cases: {e}")



@router.get("/projects")
async def list_projects(request: Request):
    """List available projects with metadata"""
    _, storage = _get_services(request)
    projects = storage.list_projects()
    return {"projects": projects}


@router.options("/projects")
async def create_project_options():
    """Handle CORS preflight for projects"""
    return Response(status_code=200)


@router.post("/projects")
async def create_project(request: Request):
    """Create a new project. JSON body: { "project": "Name" }"""
    try:
        raw = await request.body()
        payload = json.loads(raw.decode('utf-8') if isinstance(raw, (bytes, bytearray)) else raw)
        project = payload.get('project')
        if not project:
            raise HTTPException(status_code=400, detail="Missing 'project' field")
        _, storage = _get_services(request)
        proj_folder = storage.create_project(project)
        return {"status": "created", "project_folder": proj_folder}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put('/projects/{project}/rename')
async def rename_project(project: str, request: Request):
    try:
        raw = await request.body()
        payload = json.loads(raw.decode('utf-8') if isinstance(raw, (bytes, bytearray)) else raw)
        new_name = payload.get('new_name')
        if not new_name:
            raise HTTPException(status_code=400, detail="Missing 'new_name' field")
        _, storage = _get_services(request)
        new_proj = storage.rename_project(project, new_name)
        return {"status": "renamed", "project_folder": new_proj}
    except HTTPException:
        raise
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except FileExistsError:
        raise HTTPException(status_code=400, detail="Target project name already exists")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete('/projects/{project}')
async def delete_project(project: str, request: Request):
    try:
        _, storage = _get_services(request)
        ok = storage.delete_project(project)
        if not ok:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"status": "deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.options("/projects/{project}/{us}/adopt-selected")
async def adopt_selected_options(project: str, us: str):
    """Handle CORS preflight for adopt-selected"""
    return Response(status_code=200)


@router.post("/projects/{project}/{us}/adopt-selected")
async def adopt_selected_to_project(project: str, us: str, request: Request):
    """Save selected test cases into an existing project/us folder.

    Expects JSON body: { "test_cases": [ ... ] }
    """
    try:
        raw = await request.body()
        payload = json.loads(raw.decode('utf-8') if isinstance(raw, (bytes, bytearray)) else raw)
        tcs = payload.get('test_cases')
        if not tcs:
            raise HTTPException(status_code=400, detail="Missing 'test_cases' in body")

        _, storage = _get_services(request)
        # ensure project and us exist
        available_projects = storage.list_projects()
        project_names = [p.get('name') if isinstance(p, dict) else p for p in available_projects]
        if project not in project_names:
            raise HTTPException(status_code=400, detail=f"Project '{project}' does not exist")

        # Save under the provided project/us folder (overwrites or creates)
        result = storage.save_user_story(
            project=project,
            user_story_title=us,
            user_story_text=payload.get('user_story', us),
            test_cases=tcs,
            meta_extra={"generated_by": "client", "model": None},
        )
        return {"status": "saved", "result": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/staging')
async def get_staging(request: Request):
    """Get all test cases from staging area (database-backed)."""
    try:
        _, storage = _get_services(request)
        test_cases = storage.get_staging()
        return {"test_cases": test_cases}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.options('/staging')
async def post_staging_options():
    """Handle CORS preflight for staging"""
    return Response(status_code=200)


@router.post('/staging')
async def post_staging(request: Request):
    """Append provided test_cases to staging (database-backed). Body: { test_cases: [...] }"""
    try:
        raw = await request.body()
        payload = json.loads(raw.decode('utf-8') if isinstance(raw, (bytes, bytearray)) else raw)
        tcs = payload.get('test_cases') or []
        user_story_text = payload.get('user_story')
        
        # Debug: Log incoming test cases
        for i, tc in enumerate(tcs[:3]):  # Log first 3
            print(f"DEBUG POST /staging: TC[{i}] user_story = '{tc.get('user_story', 'MISSING')}'")
        
        _, storage = _get_services(request)
        # Get existing and add new
        existing = storage.get_staging()
        all_tcs = existing + tcs
        storage.clear_staging()
        count = storage.save_to_staging(all_tcs, user_story_text)
        return {"status": "ok", "count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put('/staging')
async def put_staging(request: Request):
    """Replace staging with provided test_cases (database-backed). Body: { test_cases: [...] }"""
    try:
        raw = await request.body()
        payload = json.loads(raw.decode('utf-8') if isinstance(raw, (bytes, bytearray)) else raw)
        tcs = payload.get('test_cases') or []
        
        _, storage = _get_services(request)
        count = storage.update_staging(tcs)
        return {"status": "ok", "count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete('/staging')
async def clear_staging(request: Request):
    """Clear all test cases from staging (database-backed)."""
    try:
        _, storage = _get_services(request)
        storage.clear_staging()
        return {"status": "cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/projects/{project}/user-stories")
async def list_user_stories(project: str, request: Request):
    _, storage = _get_services(request)
    return {"user_stories": storage.list_user_stories(project)}


@router.get("/projects/{project}/{us}/metadata", response_model=StoredMetadata)
async def get_metadata(project: str, us: str, request: Request):
    _, storage = _get_services(request)
    m = storage.load_metadata(project, us)
    if m is None:
        raise HTTPException(status_code=404, detail="Metadata not found")
    return m


@router.get("/projects/{project}/{us}/testcases")
async def get_testcases(project: str, us: str, request: Request):
    _, storage = _get_services(request)
    t = storage.load_testcases(project, us)
    if t is None:
        raise HTTPException(status_code=404, detail="Testcases not found")
    return t


@router.options("/projects/{project}/{us}/status")
async def update_status_options(project: str, us: str):
    """Handle CORS preflight for status update"""
    return Response(status_code=200)


@router.post("/projects/{project}/{us}/status")
async def update_status(project: str, us: str, status: str, request: Request):
    _, storage = _get_services(request)
    ok = storage.update_status(project, us, status)
    if not ok:
        raise HTTPException(status_code=404, detail="User story not found")
    return {"status": "updated"}


@router.delete("/projects/{project}/{us}")
async def delete_user_story(project: str, us: str, request: Request):
    _, storage = _get_services(request)
    ok = storage.delete_user_story(project, us)
    if not ok:
        raise HTTPException(status_code=404, detail="User story not found")
    return {"status": "deleted"}


@router.get("/projects/{project}/{us}/export/csv")
async def export_testcases_csv(project: str, us: str, format: str | None = "generic", request: Request = None):
    """Export test cases as CSV. Supports optional format mapping: generic, jira, azure

    Query params:
      - format: 'generic' (default), 'jira', or 'azure'
    """
    _, storage = _get_services(request)
    tcs = storage.get_testcases_for_export(project, us)
    if tcs is None:
        raise HTTPException(status_code=404, detail="Testcases not found")

    import io
    import csv

    buf = io.StringIO()

    fmt = (format or "generic").lower()

    # Define headers per target format
    if fmt == "jira":
        # Jira-style import: Summary, Description, Preconditions, Test Steps, Expected Result, Priority
        headers = ["Summary", "Description", "Preconditions", "Test Steps", "Expected Result", "Priority"]
        writer = csv.writer(buf)
        writer.writerow(headers)
        for tc in tcs:
            writer.writerow([
                tc.get("title", ""),
                tc.get("description", ""),
                "\n".join(tc.get("preconditions", [])),
                "\n".join(tc.get("steps", [])),
                tc.get("expected_result", ""),
                tc.get("priority", ""),
            ])

    elif fmt == "azure":
        # Azure DevOps (Test Plans) simplified mapping: Title, Steps, Expected Result, Preconditions, Priority
        headers = ["Title", "Steps", "Expected Result", "Preconditions", "Priority"]
        writer = csv.writer(buf)
        writer.writerow(headers)
        for tc in tcs:
            writer.writerow([
                tc.get("title", ""),
                "\n".join(tc.get("steps", [])),
                tc.get("expected_result", ""),
                "\n".join(tc.get("preconditions", [])),
                tc.get("priority", ""),
            ])

    else:
        # Generic mapping (backwards compatible)
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

    filename = f"{project}_{us}_{fmt}.csv"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return Response(content=buf.getvalue(), media_type="text/csv", headers=headers)
