# 🤖 AI Test Case Generator

Prototype for AI-based test case generation from user stories (Master Thesis Project – SDE26)

A full-stack application that leverages AI to automatically generate comprehensive test cases from user stories. This tool helps QA teams and developers quickly create test scenarios, improving testing coverage and efficiency.

## 🎯 Features

- **AI-Powered Generation**: Uses OpenAI's GPT models to generate intelligent test cases
- **User-Friendly Dashboard**: Clean React interface for inputting user stories
- **Comprehensive Test Cases**: Generates test cases with titles, descriptions, steps, preconditions, and expected results
- **Flexible Configuration**: Customize the number of test cases to generate
- **Docker Support**: Easy deployment with Docker and Docker Compose
- **RESTful API**: FastAPI backend with OpenAPI documentation
- **Mock Mode**: Works without API keys for development and testing

## 🏗️ Architecture

```
├── backend/              # FastAPI Python backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── models/      # Data models
│   │   ├── services/    # Business logic
│   │   └── main.py      # Application entry point
│   ├── tests/           # Backend tests
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   ├── App.jsx      # Main application
│   │   └── main.jsx     # Entry point
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
└── docker-compose.yml   # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.11 or higher)
- **Docker** and **Docker Compose** (optional, for containerized deployment)
- **OpenAI API Key** (optional, works in mock mode without it)

### Option 1: Local Development

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY (optional)
   ```

5. Run the backend:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. Access API documentation:
   - Swagger UI: http://localhost:8000/api/docs
   - ReDoc: http://localhost:8000/api/redoc

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser:
   - Frontend: http://localhost:5173

### Option 2: Docker Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/Fati26-Knk/ki-testfall-generator.git
   cd ki-testfall-generator
   ```

2. Create environment file (optional):
   ```bash
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   ```

3. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs

## 📖 Usage

1. **Enter a User Story**: Type or paste your user story in the text area
   - Example: "As a user, I want to log in to the system so that I can access my dashboard"

2. **Set Number of Test Cases**: Choose how many test cases to generate (1-20)

3. **Generate**: Click the "Generate Test Cases" button

4. **Review Results**: The generated test cases will appear below with:
   - Test case title and priority
   - Description
   - Preconditions
   - Step-by-step instructions
   - Expected results

## 🔧 Configuration

### Backend Configuration (`.env`)

```env
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

### Frontend Configuration (`.env`)

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api/v1
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Run All Tests

```bash
cd backend
pytest tests/ --cov=app
```

## 📚 API Documentation

The API provides the following endpoints:

### `GET /`
Root endpoint with API information

### `GET /api/v1/health`
Health check endpoint

### `POST /api/v1/generate-test-cases`
Generate test cases from a user story

**Request Body:**
```json
{
  "user_story": "As a user, I want to...",
  "num_test_cases": 5
}
```

**Response:**
```json
{
  "user_story": "As a user, I want to...",
  "test_cases": [
    {
      "title": "Test Case Title",
      "description": "What this test validates",
      "preconditions": ["Precondition 1"],
      "steps": ["Step 1", "Step 2"],
      "expected_result": "Expected outcome",
      "priority": "High"
    }
  ],
  "generated_count": 5
}
```

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **Python 3.11**: Programming language
- **Pydantic**: Data validation using Python type annotations
- **OpenAI API**: LLM integration for test case generation
- **Uvicorn**: ASGI server

### Frontend
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **CSS3**: Styling

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Web server for production

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is part of a Master Thesis Project (SDE26).

## 👥 Author

Master Thesis Project – SDE26

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- FastAPI for the excellent web framework
- React team for the UI library
