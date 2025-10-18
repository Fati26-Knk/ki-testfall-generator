import React, { useState } from 'react';
import { generateTestCases } from './services/api';
import TestCaseCard from './components/TestCaseCard';
import './App.css';

function App() {
  const [userStory, setUserStory] = useState('');
  const [numTestCases, setNumTestCases] = useState(5);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userStory.trim() || userStory.length < 10) {
      setError('Please enter a user story with at least 10 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setTestCases([]);

    try {
      const response = await generateTestCases(userStory, numTestCases);
      setTestCases(response.test_cases);
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Failed to generate test cases. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const exampleStories = [
    "As a user, I want to log in to the system so that I can access my dashboard",
    "As an admin, I want to manage user accounts so that I can control access permissions",
    "As a customer, I want to add items to my shopping cart so that I can purchase them later"
  ];

  const loadExample = (story) => {
    setUserStory(story);
    setError(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 AI Test Case Generator</h1>
        <p>Generate comprehensive test cases from user stories using AI</p>
      </header>

      <main className="main">
        <div className="container">
          <div className="input-section">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="userStory">User Story</label>
                <textarea
                  id="userStory"
                  value={userStory}
                  onChange={(e) => setUserStory(e.target.value)}
                  placeholder="Enter your user story here... (e.g., As a user, I want to...)"
                  rows={6}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="numTestCases">Number of Test Cases</label>
                  <input
                    type="number"
                    id="numTestCases"
                    value={numTestCases}
                    onChange={(e) => setNumTestCases(parseInt(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Generating...
                    </>
                  ) : (
                    '✨ Generate Test Cases'
                  )}
                </button>
              </div>

              {error && (
                <div className="alert alert-error">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </form>

            <div className="examples">
              <p className="examples-title">Quick Examples:</p>
              {exampleStories.map((story, idx) => (
                <button
                  key={idx}
                  className="btn-example"
                  onClick={() => loadExample(story)}
                  type="button"
                >
                  {story}
                </button>
              ))}
            </div>
          </div>

          {testCases.length > 0 && (
            <div className="results-section">
              <div className="results-header">
                <h2>Generated Test Cases</h2>
                <span className="results-count">
                  {testCases.length} test case{testCases.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="test-cases">
                {testCases.map((testCase, index) => (
                  <TestCaseCard
                    key={index}
                    testCase={testCase}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Generating your test cases...</p>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Master Thesis Project – SDE26 | AI-Based Test Case Generator</p>
      </footer>
    </div>
  );
}

export default App;
