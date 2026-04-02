# AI Test Case Generator - Architecture Diagram

## High-Level Architecture

```mermaid
flowchart LR
    subgraph U[User Layer]
        USER[QA Engineer / Tester]
    end

    subgraph FE[Frontend Layer - React + Vite]
        APP[App.jsx\nNavigation + Theme]
        DASH[Dashboard\nUser Story Input\nGeneration + Selection]
        PLAN[TestPlan\nProject/Test Case Management]
        APIJS[services/api.js\nAxios REST Client]
        LS[Local Storage\nUI State Persistence]

        APP --> DASH
        APP --> PLAN
        DASH --> APIJS
        PLAN --> APIJS
        DASH --> LS
    end

    subgraph BE[Backend Layer - FastAPI]
        MAIN[main.py\nApp Init + CORS + Lifecycle]
        ROUTES[routes.py\nREST Endpoints]
        LLM[LLMService\nPrompting + Tool Calls\nFiltering + Dedup]
        STOR[StorageService\nProject/UserStory/TestCase CRUD]

        MAIN --> ROUTES
        ROUTES --> LLM
        ROUTES --> STOR
    end

    subgraph EXT[External AI Provider]
        OPENAI[OpenAI / Azure OpenAI\nGPT-5.1-chat-latest]
    end

    subgraph DBL[Data Layer]
        PG[(PostgreSQL)]
        T1[projects]
        T2[user_stories]
        T3[test_cases]
        T4[staging_test_cases]

        PG --- T1
        PG --- T2
        PG --- T3
        PG --- T4
    end

    subgraph OPS[Deployment]
        DC[Docker Compose\nfrontend + backend + db]
    end

    USER -->|Browser UI| FE
    APIJS -->|HTTP JSON| ROUTES
    LLM -->|Model Calls| OPENAI
    STOR -->|SQLAlchemy ORM| PG
    DC -.runs.-> FE
    DC -.runs.-> BE
    DC -.runs.-> DBL
```

## Main Request Flow (Test Case Generation)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant F as Frontend (Dashboard)
    participant R as FastAPI routes.py
    participant L as LLMService
    participant O as OpenAI/Azure OpenAI

    U->>F: Enter user story + click "Generate"
    F->>R: POST /generate-test-cases
    R->>R: Validate payload (Pydantic)
    R->>L: generate_test_cases(user_story, num_cases)
    L->>L: Build prompt + model-specific call params
    L->>O: Chat completion (tools/function call)
    O-->>L: Structured JSON test cases
    L->>L: Relevance filter + dedup + renumber TC-1..n
    L-->>R: Final test case list
    R-->>F: TestCaseResponse JSON
    F-->>U: Render test case cards
```

## Notes for Thesis Presentation

- Layered architecture: presentation, orchestration, integration, persistence.
- Generation quality is enforced by a pipeline (prompting + filtering + dedup), not only by model output.
- Two-phase persistence pattern: staging (temporary) and project storage (durable).
- Provider abstraction allows switching between OpenAI and Azure OpenAI without frontend changes.
