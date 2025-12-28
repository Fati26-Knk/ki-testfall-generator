import React from "react";
import Dashboard from "./components/Dashboard";
import TestPlan from "./components/TestPlan";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";

function App() {
  const [view, setView] = React.useState('dashboard');
  const [activeProject, setActiveProject] = React.useState(null);
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header__inner">
          <div className="header__brand" onClick={() => setView('dashboard')} style={{ cursor: 'pointer' }}>
            <div className="header__logo" role="img" aria-label="Logo"></div>
            <div className="header__titles">
              <h1>AI Test Case Generator</h1>
              <p className="header__subtitle">Erstelle umfassende Testfälle aus User Stories mit KI</p>
            </div>
          </div>

          <div className="header__actions">
            <button 
              className={view === 'dashboard' ? 'btn-nav active' : 'btn-nav'}
              onClick={() => setView('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={view === 'testplan' ? 'btn-nav active' : 'btn-nav'}
              onClick={() => setView('testplan')}
            >
              Testplan
            </button>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </header>

  {view === 'dashboard' ? <Dashboard setView={setView} activeProject={activeProject} /> : <TestPlan setView={setView} setActiveProject={setActiveProject} />}
    </div>
  );
}

export default App;
