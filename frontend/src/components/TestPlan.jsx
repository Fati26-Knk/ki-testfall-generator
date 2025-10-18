import React, { useEffect, useState } from "react";
import api from "../services/api";
import Toast from "./Toast";

export default function TestPlan() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await api.get("/projects");
        setProjects(r.projects || []);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  async function loadUserStories(project) {
    setSelectedProject(project);
    try {
      setLoading(true);
      const r = await api.get(`/projects/${encodeURIComponent(project)}/user-stories`);
      setUserStories(r.user_stories || []);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  }

  async function onDelete(usFolder) {
    if (!confirm("User Story löschen?")) return;
    try {
      await api.deleteUserStory(selectedProject, usFolder);
      // refresh list
      await loadUserStories(selectedProject);
      setToast('User Story gelöscht');
    } catch (e) {
      console.error(e);
      setToast('Löschen fehlgeschlagen');
    }
  }

  async function onExport(usFolder) {
    try {
      const csv = await api.exportTestcasesCsv(selectedProject, usFolder);
      // trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject}_${usFolder}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setToast('CSV exportiert');
    } catch (e) {
      console.error(e);
      setToast('Export fehlgeschlagen');
    }
  }

  return (
    <div className="container">
      <div className="input-section">
        <h2>Testplan</h2>
        <div style={{ display: 'flex', gap: 20 }}>
          <aside style={{ minWidth: 220 }}>
            <h4>Projekte</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {projects.map((p) => (
                <button key={p} className="btn-primary" onClick={() => loadUserStories(p)}>{p}</button>
              ))}
            </div>
          </aside>

          <main style={{ flex: 1 }}>
            <h4>User Stories {selectedProject ? `in ${selectedProject}` : ''}</h4>
            {loading && <div className="loading-state"><p>Lade...</p></div>}
            {!loading && userStories.length === 0 && <p style={{ color: '#6b7280' }}>Keine User Stories</p>}
            {!loading && userStories.map((us) => (
              <div key={us} className="tc-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#111827' }}>{us}</div>
                <div>
                  <button className="btn-primary" onClick={() => onExport(us)} style={{ marginRight: 8 }}>Export CSV</button>
                  <button className="btn-primary" onClick={() => onDelete(us)} style={{ background: '#ef4444' }}>Löschen</button>
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
