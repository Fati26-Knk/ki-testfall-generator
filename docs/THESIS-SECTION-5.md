## 5.1 System Overview

Architecture diagram for presentation:
- See `docs/ARCHITECTURE-DIAGRAM.md` (high-level architecture + request flow)

The developed artifact is an AI-enabled test engineering platform that transforms natural-language user stories into structured, executable software test cases. Conceptually, the system combines a web-based interaction layer, an API-driven orchestration layer, and a persistence/integration layer. Its primary objective is to reduce manual effort in test design while improving consistency, traceability, and maintainability of generated test assets.

From an architectural perspective, the solution follows a layered client-server model. The presentation layer is implemented as a React single-page application and provides two main workspaces: a generation-oriented dashboard and a planning-oriented test management view. The dashboard supports user story authoring, optional requirement enrichment, generation triggers, and selective adoption of generated test cases. The planning view organizes persisted assets by project and user story, enables inline refinement, and supports export to external test management formats. This separation of concerns reflects two distinct user intents: exploratory generation and controlled curation.

The backend is implemented with FastAPI and exposes a REST interface for all major workflows, including generation, staging, project lifecycle management, adoption, and export. Request validation is handled via Pydantic schemas, ensuring typed contracts between client and server. Service initialization is performed at application startup, enabling explicit lifecycle control and predictable dependency availability (LLM service and storage service). This architecture supports incremental extensibility because endpoint contracts and service responsibilities remain clearly bounded.

A central subsystem is the LLM integration service. It provides provider abstraction for both OpenAI and Azure OpenAI and adapts invocation behavior to model families. For modern reasoning models, the implementation switches to tool-based function interfaces and model-compatible token parameters, while avoiding unsupported sampling controls. Beyond prompt construction, the service executes post-processing steps such as relevance filtering and semantic deduplication, thereby moving from pure generation to generation-with-quality-guardrails. This is a critical design choice: output quality is treated as a pipeline property, not solely as a model property.

Persistent state is managed in PostgreSQL via SQLAlchemy. The data model distinguishes between long-lived domain entities (projects, user stories, test cases) and transient staging entities for intermediate selection workflows. This dual persistence pattern supports realistic QA operations in which generated artifacts are first reviewed and only then promoted into project-specific repositories. On the client side, local state persistence complements server-side storage by preserving in-progress dashboard context across view switches, reducing accidental loss of generated results during navigation.

Operationally, the system is containerized using Docker Compose and runs as a three-service topology (frontend, backend, database). This setup yields environment reproducibility, straightforward local deployment, and transparent integration boundaries. Overall, the system can be characterized as a pragmatic, modular AI-assisted test design platform: it combines generative capabilities with explicit governance mechanisms (validation, filtering, deduplication, staging, and structured persistence), which is essential for use in professional software quality workflows rather than ad-hoc text generation scenarios.

## 5.2 Architectural Design Decisions

This section explains the key architectural decisions that shaped the implemented system, including their rationale, expected benefits, and accepted trade-offs.

### 5.2.1 Layered Architecture with Clear Separation of Concerns

A layered architecture was selected to separate user interaction, application orchestration, and data/integration concerns. The frontend (React) handles presentation and interaction logic, the backend (FastAPI) governs workflows and API contracts, and dedicated services encapsulate LLM integration and persistence operations.

This decision was made to maximize maintainability and extensibility. Feature evolution (e.g., additional export formats or new generation workflows) can be introduced in one layer with minimal cross-layer coupling. In a thesis context, this structure also improves analytical clarity because responsibilities are explicitly partitioned and empirically inspectable.

The primary trade-off is additional integration complexity (more interfaces, more mapping objects). However, this is acceptable because the system's long-term value depends on controlled evolution rather than short-term implementation speed.

### 5.2.2 Backend API as Workflow Orchestrator (FastAPI)

FastAPI was chosen as the application backbone due to typed schema support (Pydantic), native OpenAPI generation, and efficient request handling. The backend does not merely proxy model calls; it orchestrates domain workflows such as generation, staging, selective adoption, project lifecycle operations, and export.

The explicit API-first approach provides two advantages:
1. Stable, testable contracts between frontend and backend.
2. Reproducible integration points for future external consumers (e.g., CI pipelines, test management connectors).

The trade-off is stricter schema management overhead. Nevertheless, this was intentionally accepted to ensure reliability and facilitate scientific reproducibility of the implemented workflows.

### 5.2.3 Service-Oriented Domain Encapsulation

Two core services were introduced:
- `LLMService` for prompt construction, model invocation, and output post-processing.
- `StorageService` for persistence and retrieval operations.

This design isolates volatile concerns (model-specific behavior, provider differences, output normalization) from stable domain operations (project and test-case management). As a result, architectural volatility is localized: changing a model family or provider affects mainly one service boundary instead of the full codebase.

The trade-off is one additional abstraction layer that can initially seem verbose. In practice, it significantly reduces regression risk when model APIs evolve.

### 5.2.4 Provider Abstraction and Model-Family Adaptation

A deliberate design decision was to support multiple LLM providers (OpenAI and Azure OpenAI) behind a single service interface controlled by environment configuration. More importantly, the implementation includes model-family-specific call semantics (e.g., tool-based invocation and compatible token parameters for modern reasoning models).

Rationale:
- Avoid vendor lock-in at the code level.
- Preserve operational flexibility (institutional constraints, cost, availability).
- Reduce downtime during model/API transitions.

Trade-off:
- Increased conditional logic in the integration layer.
- Additional compatibility testing burden per provider/model combination.

Given the rapid pace of LLM API changes, this decision is central for robustness.

### 5.2.5 Generation Pipeline with Quality Guardrails

The architecture intentionally treats generation as a pipeline, not a single model call. After model output, the system applies relevance filtering and semantic deduplication before returning results. This addresses a common failure mode in LLM systems: syntactically valid but operationally weak artifacts.

Rationale:
- Improve practical utility of generated test cases.
- Reduce manual cleanup effort for QA users.
- Increase consistency across runs and user stories.

Trade-off:
- Possible over-filtering in edge cases.
- Additional tuning effort for filtering thresholds and heuristics.

Despite this, the decision improves actionable quality, which is critical for industrial-style test workflows.

### 5.2.6 Relational Persistence Model (PostgreSQL + SQLAlchemy)

The storage layer was intentionally migrated to relational persistence rather than file-based JSON storage. The schema models `Project`, `UserStory`, `TestCase`, and `StagingTestCase`, enabling normalized, queryable, and durable data handling.

Rationale:
- Stronger data consistency and lifecycle management.
- Better suitability for multi-entity operations (rename, delete cascades, export views).
- Future-readiness for analytics and governance features.

Trade-off:
- Higher setup complexity and operational dependency (database service).
- Migration and schema evolution considerations.

For a production-oriented thesis artifact, these trade-offs are justified by significantly improved data integrity and scalability potential.

### 5.2.7 Two-Phase Persistence: Staging vs. Durable Project Storage

A two-phase model was chosen:
1. Temporary staging for candidate test cases.
2. Explicit adoption into project/user-story context.

This mirrors real QA workflows, where generated assets are reviewed before becoming canonical test artifacts. It prevents accidental persistence of low-quality outputs and supports selective curation.

Trade-off:
- Slightly more user flow complexity.
- Additional API/state transitions.

The decision improves governance and aligns the tool with professional quality-assurance practices.

### 5.2.8 Client-Side State Persistence for UX Continuity

To prevent loss of in-progress work during view navigation, dashboard state (including generated test cases) is persisted in local storage. This decision addresses workflow interruption risks and improves user trust.

Rationale:
- Preserve analytical context across view changes.
- Reduce accidental data loss and repetition.
- Improve perceived reliability without backend overhead for transient UI state.

Trade-off:
- Browser-scoped persistence may require explicit reset logic.
- Potential stale-state behavior if not managed carefully.

Given user workflow patterns, continuity was prioritized over strict ephemeral state behavior.

### 5.2.9 Containerized Deployment Topology

Docker Compose was selected for environment standardization across development and production-like setups. The architecture runs as a three-service topology (frontend, backend, database), with environment variables controlling provider/model behavior and runtime wiring.

Rationale:
- Reproducible setup for evaluation and demonstration.
- Reduced "works on my machine" variance.
- Clear infrastructure boundaries for future deployment migration.

Trade-off:
- Added local runtime overhead and container tooling dependency.

For a thesis artifact requiring repeatable verification, this was a strategically important decision.

### 5.2.10 Decision Summary

Overall, the architectural decisions prioritize:
- **evolvability** (provider/model abstraction, service boundaries),
- **operational quality** (pipeline guardrails, typed contracts),
- **data governance** (relational persistence, staging-adoption workflow),
- and **user continuity** (state persistence across UI transitions).

The accepted trade-offs (higher integration and operational complexity) are consistent with the project's target maturity: not a prototype script, but a maintainable AI-assisted test engineering platform suitable for real-world process integration.

## 5.3 Implementation

This section describes how the architectural decisions were realized in the implemented software artifact. The implementation follows a layered structure and operationalizes the generation workflow as a sequence of validated, reproducible processing steps from input capture to persistent storage and export.

### 5.3.1 Frontend Implementation

The frontend is implemented as a React single-page application with a clear separation between generation and planning views. The root component (`App.jsx`) controls view navigation (Dashboard vs. TestPlan) and global UI concerns such as theme state.

The `Dashboard` component implements user story acquisition and generation initiation. Users can provide title, description, optional acceptance criteria, and optional uploaded requirement documents. Before submission, these fields are consolidated into a structured prompt input. The component additionally persists key in-progress states (`title`, `description`, `acceptanceCriteria`, generated test cases, and selection state) in `localStorage` to avoid workflow interruption during view switches.

The `TestPlan` component implements project-centric curation and lifecycle operations. It consumes persisted artifacts from backend endpoints, supports inline editing of test case fields, and enables export in generic, Jira-compatible, and Azure-compatible CSV structures.

All frontend-backend interaction is centralized in `frontend/src/services/api.js` via Axios helper functions. This creates a stable client contract and avoids distributing transport logic across UI components.

### 5.3.2 Backend Implementation

The backend is implemented with FastAPI and exposes REST endpoints for health checks, generation, staging, project management, adoption, status updates, deletion, and export. Application startup (`main.py`) initializes CORS settings, database schema creation, and service instances (`LLMService`, `StorageService`) attached to application state.

The route layer (`routes.py`) validates incoming payloads using Pydantic models and then delegates business logic to dedicated services. This keeps request handling thin while preserving explicit API behavior and error mapping through HTTP exceptions.

The implementation includes explicit handling for malformed JSON input and schema-level validation errors, which improves debuggability and strengthens reproducibility during evaluation runs.

### 5.3.3 LLM Integration Pipeline

The LLM subsystem is implemented in `llm_service.py` and contains provider selection, prompt engineering, model invocation, and output post-processing.

Provider abstraction is realized through runtime configuration (`LLM_PROVIDER`) with support for both OpenAI and Azure OpenAI clients. The invocation layer adapts dynamically to model families: for GPT-5.x/o1/o3-style models, tool-based completion calls and compatible token parameters are used; for older models, legacy function-calling compatibility remains available. This ensures a consistent system-level behavior despite API differences across model generations.

Generation itself is implemented as a controlled pipeline:
1. Analyze user story complexity and derive target output size.
2. Construct a structured instruction prompt with quality constraints.
3. Invoke the model and parse structured tool/function output.
4. Apply relevance filtering to remove weakly justified cases.
5. Apply semantic deduplication based on token overlap similarity.
6. Renumber outputs into a stable `TC-1..n` format.

This pipeline design operationalizes quality controls beyond raw model output and was essential for producing evaluation-ready artifacts.

### 5.3.4 Persistence and Data Model

Persistent storage is implemented with PostgreSQL and SQLAlchemy ORM. The core entities are:
- `Project`
- `UserStory`
- `TestCase`
- `StagingTestCase`

`StorageService` encapsulates all database operations, including project CRUD, user story persistence, test case retrieval, status changes, staging synchronization, and export preparation. A two-phase persistence workflow is implemented: generated cases can first be accumulated in staging and then selectively adopted into project/user-story scope.

Compared to file-based persistence, this implementation provides stronger consistency guarantees, cleaner entity relationships, and improved support for longitudinal evaluation data.

### 5.3.5 Deployment and Runtime Configuration

The system is deployed as a three-service Docker Compose topology (`frontend`, `backend`, `db`) with dedicated development and production-like compose files. Runtime behavior is controlled through environment variables, including model/provider settings, CORS origins, and database connection configuration.

This containerized setup ensures reproducible execution across local environments and supports fair experimental reruns with consistent infrastructure boundaries.

### 5.3.6 Implementation Outcome

The final implementation translates the conceptual architecture into a functioning, testable, and extensible artifact. In particular, the combination of provider abstraction, structured generation pipeline, relational persistence, and containerized runtime enables both practical QA usage and methodologically robust evaluation in a research setting.
