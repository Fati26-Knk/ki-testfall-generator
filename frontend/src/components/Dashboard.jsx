import React, { useState } from "react";
import api from "../services/api";
import Toast from "./Toast";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [generated, setGenerated] = useState(null);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  async function onGenerate(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.generateTestCases(`${title}\n\n${description}`, 3);
      setGenerated(res.test_cases || []);
      // reset selection
      setSelected({});
    } catch (err) {
      console.error(err);
      alert("Fehler beim Generieren");
    } finally {
      setLoading(false);
    }
  }

  async function onAdoptAll() {
    if (!title || !description) return alert("Bitte Title und Description ausfüllen");
    setLoading(true);
    try {
      await api.adoptTestCases(`${title}\n\n${description}`, 5, "frontendProject");
      setToast('Alle Testfälle übernommen');
      // reset selection and generated
      setSelected({});
      setGenerated(null);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Übernehmen");
    } finally {
      setLoading(false);
    }
  }

  async function onAdoptSelected() {
    if (!title || !description) return alert("Bitte Title und Description ausfüllen");
    const selectedIndexes = Object.keys(selected).filter((k) => selected[k]).map((s) => parseInt(s, 10));
    if (selectedIndexes.length === 0) return alert("Bitte mindestens einen Testfall auswählen");
    const subset = selectedIndexes.map((i) => generated[i]);
    setLoading(true);
    try {
      await api.adoptTestCases(`${title}\n\n${description}`, subset.length, "frontendProject", subset);
      setToast('Ausgewählte Testfälle übernommen');
      // remove selected items from list
      const remaining = generated.filter((_, idx) => !selectedIndexes.includes(idx));
      setGenerated(remaining.length ? remaining : null);
      setSelected({});
    } catch (err) {
      console.error(err);
      alert("Fehler beim Übernehmen");
    } finally {
      setLoading(false);
    }
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
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Generieren...' : '✨ Testfälle generieren'}</button>
            <button className="btn-primary" type="button" onClick={onAdoptAll} disabled={loading} style={{ background: '#10b981' }}>{'Merken / Übernehmen'}</button>
            <button className="btn-primary" type="button" onClick={onAdoptSelected} disabled={loading} style={{ background: '#f59e0b' }}>{'Adopt selected'}</button>
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
