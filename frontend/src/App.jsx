import React from "react";
import Dashboard from "./components/Dashboard";
import TestPlan from "./components/TestPlan";
import "./App.css";

function App() {
  const [view, setView] = React.useState('dashboard');

  return (
    <div className="app">
      <header className="header">
        <div className="header__inner">
          <div className="header__brand">
            <div className="header__logo" aria-hidden="true">🤖</div>
            <div className="header__titles">
              <h1>AI Test Case Generator</h1>
              <p className="header__subtitle">Generate comprehensive test cases from user stories using AI</p>
            </div>
          </div>

          <div className="header__actions">
            <button className="btn-ghost" onClick={() => setView('dashboard')}>Dashboard</button>
            <button className="btn-ghost" onClick={() => setView('testplan')}>Testplan</button>
          </div>
        </div>
      </header>

      {view === 'dashboard' ? <Dashboard /> : <TestPlan />}
    </div>
  );
}

export default App;
