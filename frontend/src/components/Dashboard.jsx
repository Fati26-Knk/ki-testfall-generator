import React, { useState } from "react";
import * as api from "../services/api";
import Toast from "./Toast";

export default function Dashboard({ setView, activeProject }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [generated, setGenerated] = useState(null);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [comprehensive, setComprehensive] = useState(true);

  async function onGenerate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // If comprehensive is selected, send 0 to indicate backend should generate a comprehensive set
      const requested = comprehensive ? 0 : 3;
      const res = await api.generateTestCases(`${title}\n\n${description}`, requested);
      setGenerated(res.test_cases || []);
      // reset selection
      setSelected({});
    } catch (err) {
      console.error('Generate error', err);
      // Try to extract a useful message from the axios error
      const msg = err?.response?.data?.detail || err?.response?.data || err?.message || JSON.stringify(err);
      alert(`Fehler beim Generieren: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function onAdoptAll() {
    // deprecated: replaced by onMerken
    return;
  }

  async function onAdoptSelected() {
    // deprecated: replaced by onMerken
    return;
  }

  async function onRememberSelected() {
    // send selected generated testcases to staging area
    if (!generated) return alert('Keine generierten Testfälle');
    const selectedIndexes = Object.keys(selected).filter((k) => selected[k]).map((s) => parseInt(s, 10));
    if (selectedIndexes.length === 0) return alert('Bitte mindestens einen Testfall auswählen');
    // Füge user_story Feld hinzu
    const subset = selectedIndexes.map((i) => ({ ...generated[i], user_story: title }));
    setLoading(true);
    try {
      const resp = await api.postStaging(subset);
      setToast(`In Testplan gemerkt (${resp.count || subset.length})`);
      if (setView) setView('testplan');
    } catch (e) {
      console.error(e);
      alert('Fehler beim Merken');
    } finally {
      setLoading(false);
    }
  }

  async function onMerken() {
    // send selected if any, otherwise all generated testcases to staging
    if (!generated || generated.length === 0) return alert('Keine generierten Testfälle');
    const selectedIndexes = Object.keys(selected).filter((k) => selected[k]).map((s) => parseInt(s, 10));
    // Füge user_story Feld hinzu
    const subset = (selectedIndexes.length > 0)
      ? selectedIndexes.map((i) => ({ ...generated[i], user_story: title }))
      : generated.map((tc) => ({ ...tc, user_story: title }));
    setLoading(true);
    try {
      const resp = await api.postStaging(subset);
      setToast(`In Testplan gemerkt (${resp.count || subset.length})`);
      // optionally clear selection but keep generated visible
      setSelected({});
      if (setView) setView('testplan');
    } catch (e) {
      console.error(e);
      alert('Fehler beim Merken');
    } finally {
      setLoading(false);
    }
  }

  function onNewUserStory() {
    // Clear form and generated results to create a fresh US
    setTitle("");
    setDescription("");
    setGenerated(null);
    setSelected({});
    setToast('Neue User Story bereit');
  }

  return (
    <div className="container">
      <div className="input-section card-subtle">
        <h3>User Story</h3>
        <form onSubmit={onGenerate}>
          <div className="form-group">
            <label>Titel</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Beschreibung</label>
            <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
          </div>

            <div className="form-row">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={comprehensive} onChange={(e) => setComprehensive(e.target.checked)} />
              <span style={{ fontSize: 14 }}>Comprehensive</span>
            </label>
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Generieren...' : '✨ Testfälle generieren'}</button>
            <button className="btn-primary" type="button" onClick={onMerken} disabled={loading} style={{ background: '#10b981' }}>{'Merken'}</button>
            <button className="btn-ghost" type="button" onClick={onNewUserStory} style={{ marginLeft: 8 }}>Neue User Story</button>
          </div>
        </form>
      </div>

      <div className="results-section" style={{ marginTop: 8 }}>
        <div className="results-header">
          <h2>Generierte Testfälle</h2>
          <div className="results-count">{generated ? generated.length : 0}</div>
        </div>

        <div className="test-cases">
          {!generated && <div className="loading-state"><p style={{ color: '#6b7280' }}>Keine generierten Testfälle</p></div>}
          {generated && generated.map((tc, i) => (
            <div className="tc-card" key={i}>
              <div>
                <h4>{tc.title}</h4>
                <div style={{ color: '#6b7280' }}>{tc.description}</div>
                {tc.preconditions && tc.preconditions.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Preconditions:</strong>
                    <ul style={{ marginTop: 4 }}>
                      {tc.preconditions.map((p, idx) => (
                        <li key={idx} style={{ color: '#6b7280' }}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {tc.steps && tc.steps.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Steps:</strong>
                    <ol style={{ marginTop: 4 }}>
                      {tc.steps.map((s, idx) => (
                        <li key={idx} style={{ color: '#374151' }}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {tc.expected_result && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Expected result:</strong>
                    <div style={{ color: '#064e3b' }}>{tc.expected_result}</div>
                  </div>
                )}
                {tc.priority && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}><strong>Priority:</strong> {tc.priority}</div>
                )}
              </div>
              <div className="controls">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={!!selected[i]} onChange={() => setSelected(prev => ({...prev, [i]: !prev[i]}))} />
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Auswählen</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
