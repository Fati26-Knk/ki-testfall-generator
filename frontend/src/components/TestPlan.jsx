import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import Toast from './Toast';

// Compact defaults for collapsed card sizes (px)
const COMPACT_OUTER_MAX = 440;
const COMPACT_MAIN_MAX = 360;

export default function TestPlan() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [loading, setLoading] = useState(false);

  // { us, tcs }
  const [selectedUsTestcases, setSelectedUsTestcases] = useState(null);
  const [selectedTcsIdx, setSelectedTcsIdx] = useState({});

  const [newProjectName, setNewProjectName] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [toast, setToast] = useState(null);

  // optional: csv export format (generic/jira/xray/ado etc.)
  const [exportFormat, setExportFormat] = useState('generic');

  const outerRef = useRef(null);
  const mainRef = useRef(null);
  const contentRef = useRef(null);

  // ------- init: projects laden -------
  useEffect(() => {
    (async () => {
      try {
        const resp = await api.get('/projects');
        const data = resp.data || resp;
        const list = (data.projects || []).map(p => (typeof p === 'string' ? { name: p } : p));
        setProjects(list);
      } catch (err) {
        console.error('projects load failed', err);
        setToast('Fehler beim Laden der Projekte');
      }
    })();
  }, []);

  // ------- Projekte / User Stories -------
  async function loadUserStories(projectName) {
    if (!projectName) return setToast('Kein Projekt gewählt');
    setLoading(true);
    setSelectedProject(projectName);
    setSelectedUsTestcases(null);
    try {
      const resp = await api.get(`/projects/${encodeURIComponent(projectName)}/user-stories`);
      const data = resp.data || resp;
      setUserStories(data.user_stories || []);
    } catch (err) {
      console.error('loadUserStories', err);
      setToast('Fehler beim Laden der User Stories');
    } finally {
      setLoading(false);
      // reset compact heights
      try { if (mainRef.current) mainRef.current.style.maxHeight = COMPACT_MAIN_MAX + 'px'; } catch (e) {}
      try { if (outerRef.current) outerRef.current.style.maxHeight = COMPACT_OUTER_MAX + 'px'; } catch (e) {}
    }
  }

  async function createProject() {
    if (!newProjectName.trim()) return setToast('Bitte Projektnamen eingeben');
    try {
      await api.post('/projects', { project: newProjectName.trim() });
      setToast('Projekt erstellt');
      // Refresh project list
      const r2 = await api.get('/projects');
      const d2 = r2.data || r2;
      setProjects((d2.projects || []).map(p => (typeof p === 'string' ? { name: p } : p)));
      setNewProjectName('');
      setShowCreateProject(false);
    } catch (err) {
      console.error('createProject', err);
      setToast('Fehler beim Erstellen des Projekts');
    }
  }

  async function deleteUserStory(us) {
    if (!selectedProject) return setToast('Kein Projekt gewählt');
    if (!window.confirm('User Story löschen?')) return;
    try {
      await api.deleteUserStory(selectedProject, us);
      await loadUserStories(selectedProject);
      setToast('User Story gelöscht');
    } catch (err) {
      console.error('deleteUserStory', err);
      setToast('Entfernen fehlgeschlagen');
    }
  }

  // ------- CSV-Export: ganzes Projekt -------
  async function exportCsvProject() {
    if (!selectedProject) return setToast('Kein Projekt gewählt');
    try {
      // Format berücksichtigen (generic/jira/xray/ado …)
      const path = `/projects/${encodeURIComponent(selectedProject)}/export/csv` +
                   (exportFormat ? `?format=${encodeURIComponent(exportFormat)}` : '');
      const resp = await api.get(path);
      const csv = resp.data || resp;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject}_${exportFormat || 'generic'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setToast(`CSV exportiert (${exportFormat || 'generic'})`);
    } catch (err) {
      console.error('exportCsvProject', err);
      setToast('Export fehlgeschlagen');
    }
  }

  // Alias behalten (Funktion nicht löschen)
  async function exportCsv() {
    return exportCsvProject();
  }

  // ------- CSV-Export: einzelne US (ohne/mit Format) -------
  async function onExport(usFolder) {
    if (!selectedProject) return setToast('Kein Projekt gewählt');
    try {
      const path = `/projects/${encodeURIComponent(selectedProject)}/${encodeURIComponent(usFolder)}/export/csv`;
      const resp = await api.get(path);
      const csv = resp.data || resp;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject}_${usFolder}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setToast('CSV exportiert');
    } catch (err) {
      console.error('onExport', err);
      setToast('Export fehlgeschlagen');
    }
  }

  async function onExportWithFormat(usFolder) {
    if (!selectedProject) return setToast('Kein Projekt gewählt');
    try {
      const path = `/projects/${encodeURIComponent(selectedProject)}/${encodeURIComponent(usFolder)}/export/csv?format=${encodeURIComponent(exportFormat)}`;
      const resp = await api.get(path);
      const csv = resp.data || resp;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject}_${usFolder}_${exportFormat}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setToast(`CSV exportiert (${exportFormat})`);
    } catch (err) {
      console.error('onExportWithFormat', err);
      setToast('Export fehlgeschlagen');
    }
  }

  // ------- US expand/collapse + Testfälle laden & messen -------
  async function loadTestcasesForUs(us) {
    if (!selectedProject) return setToast('Kein Projekt gewählt');
    try {
      // collapse, wenn dieselbe US erneut geklickt wird
      if (selectedUsTestcases && selectedUsTestcases.us === us) {
        setSelectedUsTestcases(null);
        setSelectedTcsIdx({});
        try {
          if (mainRef.current) mainRef.current.style.maxHeight = COMPACT_MAIN_MAX + 'px';
          if (outerRef.current) outerRef.current.style.maxHeight = COMPACT_OUTER_MAX + 'px';
        } catch (e) {}
        return;
      }

      const resp = await api.get(`/projects/${encodeURIComponent(selectedProject)}/${encodeURIComponent(us)}/testcases`);
      const data = resp.data || resp;
      const tcs = data.test_cases || [];
      setSelectedUsTestcases({ us, tcs });
      setSelectedTcsIdx({});

      // nach dem Rendern messen und animieren
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            const contentEl = contentRef.current;
            const mainEl = mainRef.current;
            const outerEl = outerRef.current;
            if (!contentEl || !mainEl || !outerEl) return;
            const expandedBlock = contentEl.querySelector('.us-row .us-testcases');
            const contentHeight = expandedBlock ? expandedBlock.scrollHeight : contentEl.scrollHeight;
            const viewportCap = Math.max(window.innerHeight * 0.6, 480);
            const targetMain = Math.min(contentHeight + 120, viewportCap);
            mainEl.style.maxHeight = targetMain + 'px';
            const outerTarget = Math.min(targetMain + 160, window.innerHeight * 0.85);
            outerEl.style.maxHeight = outerTarget + 'px';
          } catch (e) { /* ignore measure errors */ }
        }, 60);
      });
    } catch (err) {
      console.error('loadTestcasesForUs', err);
      setToast('Fehler beim Laden der Testfälle');
    }
  }

  // ------- Auswahl togglen -------
  function toggleTcIdx(idx) {
    setSelectedTcsIdx(prev => ({ ...prev, [idx]: !prev[idx] }));
  }

  // ------- Render -------
  return (
    <div className="container">
      <div className={`input-section testplan ${selectedProject ? '' : 'no-project'}`}>
        <div className="testplan">
          {/* Sidebar: Projekte */}
          <div className="testplan-sidebar">
            <div className="projects-header">
              <h3>Projekte</h3>
              <div className="projects-actions">
                <button onClick={() => setShowCreateProject(true)}>Neues Projekt</button>
              </div>
            </div>
            <div className="projects-list">
              {projects.map((p) => (
                <div
                  key={p.name}
                  className={`project-row ${p.name === selectedProject ? 'active' : ''}`}
                  onClick={() => loadUserStories(p.name)}
                >
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main */}
          <div
            ref={outerRef}
            className="testplan-main"
            style={{ maxHeight: COMPACT_OUTER_MAX + 'px', transition: 'max-height 360ms ease' }}
          >
            <div className="testplan-header">
              <h2>TestPlan {selectedProject ? `— ${selectedProject}` : ''}</h2>
              <div className="testplan-actions">
                <select
                  aria-label="Export-Format"
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  style={{ marginRight: 8 }}
                >
                  <option value="generic">Generic CSV</option>
                  <option value="jira">Jira</option>
                  <option value="xray">Jira Xray</option>
                  <option value="ado">Azure DevOps</option>
                </select>
                <button onClick={exportCsvProject}>Export CSV</button>
              </div>
            </div>

            <div
              ref={mainRef}
              className="testplan-body"
              style={{ maxHeight: COMPACT_MAIN_MAX + 'px', transition: 'max-height 360ms ease', overflow: 'auto' }}
            >
              <div className="us-list" ref={contentRef}>
                {loading && <div className="loading-state"><p>Lade...</p></div>}
                {!loading && userStories.length === 0 && (
                  <p style={{ color: '#6b7280' }}>Keine User Stories</p>
                )}

                {!loading && userStories.map((us) => (
                  <div key={us} className="us-row">
                    <div className="us-row-header" onClick={() => loadTestcasesForUs(us)}>
                      <span className="us-title">{us}</span>
                      <div className="us-row-controls">
                        <button
                          title="CSV exportieren"
                          onClick={(e) => { e.stopPropagation(); onExportWithFormat(us); }}
                          className="icon-btn"
                          style={{ marginRight: 8 }}
                        >
                          ⬇️
                        </button>
                        <button
                          title="Löschen"
                          onClick={(e) => { e.stopPropagation(); deleteUserStory(us); }}
                          className="icon-btn"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {selectedUsTestcases && selectedUsTestcases.us === us && (
                      <div className="us-testcases">
                        {selectedUsTestcases.tcs.length === 0 && (
                          <div className="empty">Keine Testfälle</div>
                        )}
                        {selectedUsTestcases.tcs.map((tc, idx) => (
                          <div
                            key={idx}
                            className={`tc-row ${selectedTcsIdx[idx] ? 'selected' : ''}`}
                            onClick={() => toggleTcIdx(idx)}
                          >
                            <div className="tc-title">{tc.title}</div>
                            <div className="tc-steps">
                              {Array.isArray(tc.steps) ? tc.steps.join(' › ') : (tc.steps || '')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Projekt anlegen */}
        {showCreateProject && (
          <div className="modal">
            <div className="modal-body">
              <h3>Neues Projekt</h3>
              <input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Projektname"
              />
              <div className="modal-actions">
                <button onClick={createProject}>Erstellen</button>
                <button onClick={() => setShowCreateProject(false)}>Abbrechen</button>
              </div>
            </div>
          </div>
        )}

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
