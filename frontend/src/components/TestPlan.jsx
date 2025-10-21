import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TestCaseCard from './TestCaseCard';
import Toast from './Toast';
import * as XLSX from 'xlsx';

function EditableTestCase({ testCase, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTc, setEditedTc] = useState(testCase);

  const handleSave = () => {
    onUpdate(editedTc);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTc(testCase);
    setIsEditing(false);
  };

  const addStep = () => {
    setEditedTc(prev => ({
      ...prev,
      steps: [...(prev.steps || []), '']
    }));
  };

  const updateStep = (index, value) => {
    setEditedTc(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }));
  };

  const deleteStep = (index) => {
    setEditedTc(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const addPrecondition = () => {
    setEditedTc(prev => ({
      ...prev,
      preconditions: [...(prev.preconditions || []), '']
    }));
  };

  const updatePrecondition = (index, value) => {
    setEditedTc(prev => ({
      ...prev,
      preconditions: prev.preconditions.map((pc, i) => i === index ? value : pc)
    }));
  };

  const deletePrecondition = (index) => {
    setEditedTc(prev => ({
      ...prev,
      preconditions: prev.preconditions.filter((_, i) => i !== index)
    }));
  };

  if (!isEditing) {
    return (
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 12, background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{testCase.title}</div>
            {testCase.description && (
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{testCase.description}</div>
            )}
            {testCase.preconditions && testCase.preconditions.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Vorbedingungen:</div>
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
                  {testCase.preconditions.map((pc, i) => <li key={i}>{pc}</li>)}
                </ul>
              </div>
            )}
            {testCase.steps && testCase.steps.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Schritte:</div>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
                  {testCase.steps.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            )}
            {testCase.expected_result && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Erwartetes Ergebnis:</div>
                <div style={{ fontSize: 13 }}>{testCase.expected_result}</div>
              </div>
            )}
            {testCase.priority && (
              <div style={{ fontSize: 12, color: '#64748b' }}>
                <strong>Priorität:</strong> {testCase.priority}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{ 
                padding: '6px 12px', 
                background: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: 4, 
                cursor: 'pointer', 
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ✏️ Bearbeiten
            </button>
            <button
              onClick={onDelete}
              style={{ 
                padding: '6px 12px', 
                background: '#fee2e2', 
                color: '#b91c1c', 
                border: 'none', 
                borderRadius: 4, 
                cursor: 'pointer', 
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ border: '2px solid #3b82f6', borderRadius: 6, padding: 16, background: '#eff6ff' }}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Titel:</label>
        <input
          type="text"
          value={editedTc.title || ''}
          onChange={(e) => setEditedTc({ ...editedTc, title: e.target.value })}
          style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 14 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Beschreibung:</label>
        <textarea
          value={editedTc.description || ''}
          onChange={(e) => setEditedTc({ ...editedTc, description: e.target.value })}
          style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 14, minHeight: 60 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Vorbedingungen:</label>
        {(editedTc.preconditions || []).map((pc, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              value={pc}
              onChange={(e) => updatePrecondition(idx, e.target.value)}
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 14 }}
            />
            <button
              onClick={() => deletePrecondition(idx)}
              style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addPrecondition}
          style={{ padding: '6px 12px', background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
        >
          + Vorbedingung hinzufügen
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Schritte:</label>
        {(editedTc.steps || []).map((step, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span style={{ padding: '8px', fontWeight: 600, color: '#64748b' }}>{idx + 1}.</span>
            <input
              type="text"
              value={step}
              onChange={(e) => updateStep(idx, e.target.value)}
              style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 14 }}
            />
            <button
              onClick={() => deleteStep(idx)}
              style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addStep}
          style={{ padding: '6px 12px', background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
        >
          + Schritt hinzufügen
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Erwartetes Ergebnis:</label>
        <textarea
          value={editedTc.expected_result || ''}
          onChange={(e) => setEditedTc({ ...editedTc, expected_result: e.target.value })}
          style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 14, minHeight: 60 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Priorität:</label>
        <select
          value={editedTc.priority || 'medium'}
          onChange={(e) => setEditedTc({ ...editedTc, priority: e.target.value })}
          style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 14 }}
        >
          <option value="low">Niedrig</option>
          <option value="medium">Mittel</option>
          <option value="high">Hoch</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={handleCancel}
          style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
        >
          💾 Speichern
        </button>
      </div>
    </div>
  );
}

export default function TestPlan() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [globalTestCases, setGlobalTestCases] = useState([]);
  const [groupedGlobalTestCases, setGroupedGlobalTestCases] = useState({});
  const [openUsGroups, setOpenUsGroups] = useState({});
  const [selectedUserStory, setSelectedUserStory] = useState(null);
  
  const [projectUserStories, setProjectUserStories] = useState([]);
  const [loadingProjectUs, setLoadingProjectUs] = useState(false);
  const [openProjectUsGroups, setOpenProjectUsGroups] = useState({});
  const [projectUsTestCases, setProjectUsTestCases] = useState({});
  
  // Separate state für Dropdown-Auswahl (unabhängig von selectedProject)
  const [dropdownProject, setDropdownProject] = useState('');
  
  // State für Projekt-Management
  const [showRenameProject, setShowRenameProject] = useState(false);
  const [projectToRename, setProjectToRename] = useState(null);
  const [newRenamedProjectName, setNewRenamedProjectName] = useState('');
  const [hoveredProject, setHoveredProject] = useState(null);

  useEffect(() => {
    loadProjects();
    loadGlobalTestCases();
  }, []);
  
  useEffect(() => {
    if (selectedProject) {
      loadProjectUserStories(selectedProject);
    } else {
      setProjectUserStories([]);
    }
  }, [selectedProject]);

  async function loadGlobalTestCases() {
    try {
      const data = await api.getStaging();
      const arr = (data && (data.test_cases ?? data)) || [];
      setGlobalTestCases(Array.isArray(arr) ? arr : []);
      
      const grouped = {};
      arr.forEach((tc, idx) => {
        const us = tc.user_story || tc.userStoryTitle || tc.us_title;
        if (!us || us.trim() === '' || us.toLowerCase().includes('unbekannt')) return;
        if (!grouped[us]) grouped[us] = [];
        grouped[us].push({ ...tc, _globalIdx: idx });
      });
      setGroupedGlobalTestCases(grouped);
      
      const open = {};
      Object.keys(grouped).forEach(us => { open[us] = true; });
      setOpenUsGroups(open);
    } catch (e) {
      console.error('loadGlobalTestCases', e);
      setToast({ message: 'Globale Testfälle konnten nicht geladen werden', type: 'error' });
    }
  }

  async function loadProjects() {
    try {
      setLoading(true);
      const resp = await api.get('/projects');
      const data = resp.data || resp;
      const projectList = (data.projects || []).map(p => {
        const name = typeof p === 'string' ? p : p.name || p;
        return name === 'default' ? 'Hauptseite' : name;
      });
      setProjects(projectList);
      if (projectList.length > 0 && !selectedProject) {
        setSelectedProject(projectList[0]);
      }
    } catch (e) {
      console.error('loadProjects', e);
      setToast({ message: 'Projekte konnten nicht geladen werden', type: 'error' });
    } finally {
      setLoading(false);
    }
  }
  
  async function loadProjectUserStories(projectName) {
    if (!projectName) return;
    try {
      setLoadingProjectUs(true);
      // Konvertiere "Hauptseite" zurück zu "default" für API-Aufruf
      const apiProjectName = projectName === 'Hauptseite' ? 'default' : projectName;
      
      const resp = await api.get(`/projects/${encodeURIComponent(apiProjectName)}/user-stories`);
      const data = resp.data || resp;
      const usList = data.user_stories || [];
      setProjectUserStories(usList);
      
      // Lade Testfälle für jede User Story
      const testCasesMap = {};
      for (const us of usList) {
        try {
          const tcResp = await api.get(`/projects/${encodeURIComponent(apiProjectName)}/${encodeURIComponent(us)}/testcases`);
          const tcData = tcResp.data || tcResp;
          testCasesMap[us] = tcData.test_cases || [];
        } catch (e) {
          console.error(`Failed to load testcases for ${us}:`, e);
          testCasesMap[us] = [];
        }
      }
      setProjectUsTestCases(testCasesMap);
      
      // Öffne alle User Stories standardmäßig
      const openState = {};
      usList.forEach(us => { openState[us] = true; });
      setOpenProjectUsGroups(openState);
    } catch (e) {
      console.error('loadProjectUserStories', e);
      setToast({ message: 'User Stories konnten nicht geladen werden', type: 'error' });
      setProjectUserStories([]);
      setProjectUsTestCases({});
    } finally {
      setLoadingProjectUs(false);
    }
  }

  async function createProject() {
    if (!newProjectName) return setToast({ message: 'Bitte Projektnamen eingeben', type: 'error' });
    try {
      await api.post('/projects', { project: newProjectName });
      setToast({ message: 'Projekt erstellt', type: 'info' });
      await loadProjects();
      setNewProjectName('');
      setShowCreateProject(false);
    } catch (e) {
      console.error('createProject', e);
      setToast({ message: 'Fehler beim Erstellen', type: 'error' });
    }
  }
  
  async function renameProject() {
    if (!newRenamedProjectName || !projectToRename) {
      return setToast({ message: 'Bitte neuen Namen eingeben', type: 'error' });
    }
    
    if (projectToRename === 'Hauptseite') {
      return setToast({ message: 'Die Hauptseite kann nicht umbenannt werden', type: 'error' });
    }
    
    try {
      await api.put(`/projects/${encodeURIComponent(projectToRename)}/rename`, { 
        new_name: newRenamedProjectName 
      });
      setToast({ message: `Projekt erfolgreich umbenannt`, type: 'success' });
      
      // Wenn das umbenannte Projekt aktuell ausgewählt ist, update die Auswahl
      if (selectedProject === projectToRename) {
        setSelectedProject(newRenamedProjectName);
      }
      
      await loadProjects();
      setShowRenameProject(false);
      setProjectToRename(null);
      setNewRenamedProjectName('');
    } catch (e) {
      console.error('renameProject', e);
      const errorMsg = e.response?.data?.detail || 'Fehler beim Umbenennen';
      setToast({ message: errorMsg, type: 'error' });
    }
  }
  
  async function deleteProject(projectName) {
    if (projectName === 'Hauptseite') {
      return setToast({ message: 'Die Hauptseite kann nicht gelöscht werden', type: 'error' });
    }
    
    if (!window.confirm(`Projekt "${projectName}" wirklich löschen? Alle User Stories und Testfälle gehen verloren!`)) {
      return;
    }
    
    try {
      await api.delete(`/projects/${encodeURIComponent(projectName)}`);
      setToast({ message: 'Projekt gelöscht', type: 'info' });
      
      // Wenn das gelöschte Projekt aktuell ausgewählt ist, wähle ein anderes
      if (selectedProject === projectName) {
        setSelectedProject('Hauptseite');
      }
      
      await loadProjects();
    } catch (e) {
      console.error('deleteProject', e);
      const errorMsg = e.response?.data?.detail || 'Fehler beim Löschen';
      setToast({ message: errorMsg, type: 'error' });
    }
  }
  
  function openRenameDialog(projectName) {
    if (projectName === 'Hauptseite') {
      return setToast({ message: 'Die Hauptseite kann nicht umbenannt werden', type: 'error' });
    }
    setProjectToRename(projectName);
    setNewRenamedProjectName(projectName);
    setShowRenameProject(true);
  }

  async function deleteUsFromGlobal(us) {
    if (!window.confirm(`User Story "${us}" und alle zugehörigen Testfälle wirklich aus der globalen Auswahl entfernen?`)) return;
    try {
      const remaining = globalTestCases.filter(tc => {
        const tcUs = tc.user_story || tc.userStoryTitle || tc.us_title;
        return tcUs !== us;
      });
      await api.putStaging(remaining);
      setToast({ message: 'User Story aus globaler Auswahl entfernt', type: 'info' });
      await loadGlobalTestCases();
    } catch (err) {
      console.error('deleteUsFromGlobal', err);
      setToast({ message: 'Entfernen fehlgeschlagen', type: 'error' });
    }
  }

  async function adoptUserStoryToProject() {
    if (!dropdownProject) {
      setToast({ message: 'Bitte zuerst ein Projekt auswählen', type: 'error' });
      return;
    }
    
    if (!selectedUserStory) {
      setToast({ message: 'Bitte zuerst eine User Story auswählen', type: 'error' });
      return;
    }
    
    try {
      const usTestCases = groupedGlobalTestCases[selectedUserStory] || [];
      if (usTestCases.length === 0) {
        setToast({ message: 'Keine Testfälle gefunden', type: 'error' });
        return;
      }
      
      // Konvertiere "Hauptseite" zurück zu "default" für API-Aufruf
      const apiProjectName = dropdownProject === 'Hauptseite' ? 'default' : dropdownProject;
      
      console.log('Adopting entire User Story:', { project: apiProjectName, usTitle: selectedUserStory, count: usTestCases.length });
      
      await api.adoptSelectedToProject(apiProjectName, selectedUserStory, usTestCases, selectedUserStory);
      
      const remaining = globalTestCases.filter(tc => {
        const tcUs = tc.user_story || tc.userStoryTitle || tc.us_title;
        return tcUs !== selectedUserStory;
      });
      await api.putStaging(remaining);
      
      setToast({ message: `User Story "${selectedUserStory}" mit ${usTestCases.length} Testfällen erfolgreich zu "${dropdownProject}" übernommen`, type: 'success' });
      setSelectedUserStory(null);
      setDropdownProject('');
      await loadGlobalTestCases();
      // Lade auch die Projekt-User-Stories neu, falls das aktuelle Projekt das Ziel war
      if (selectedProject && selectedProject === dropdownProject) {
        await loadProjectUserStories(selectedProject);
      }
    } catch (e) {
      console.error('adoptUserStoryToProject error:', e);
      const errorMsg = e.response?.data?.detail || e.message || 'Unbekannter Fehler';
      setToast({ message: `Ableiten fehlgeschlagen: ${errorMsg}`, type: 'error' });
    }
  }
  
  async function adoptUsDirectly(usTitle) {
    if (!selectedProject) {
      setToast({ message: 'Bitte zuerst ein Projekt auswählen', type: 'error' });
      return;
    }
    
    try {
      const usTestCases = groupedGlobalTestCases[usTitle] || [];
      if (usTestCases.length === 0) {
        setToast({ message: 'Keine Testfälle gefunden', type: 'error' });
        return;
      }
      
      // Konvertiere "Hauptseite" zurück zu "default" für API-Aufruf
      const apiProjectName = selectedProject === 'Hauptseite' ? 'default' : selectedProject;
      
      console.log('Adopting US directly:', { project: apiProjectName, usTitle, count: usTestCases.length });
      
      await api.adoptSelectedToProject(apiProjectName, usTitle, usTestCases, usTitle);
      
      const remaining = globalTestCases.filter(tc => {
        const tcUs = tc.user_story || tc.userStoryTitle || tc.us_title;
        return tcUs !== usTitle;
      });
      await api.putStaging(remaining);
      
      setToast({ message: `User Story "${usTitle}" mit ${usTestCases.length} Testfällen erfolgreich zu "${selectedProject}" übernommen`, type: 'success' });
      await loadGlobalTestCases();
      await loadProjectUserStories(selectedProject);
    } catch (e) {
      console.error('adoptUsDirectly error:', e);
      const errorMsg = e.response?.data?.detail || e.message || 'Unbekannter Fehler';
      setToast({ message: `Ableiten fehlgeschlagen: ${errorMsg}`, type: 'error' });
    }
  }

  async function deleteTestCaseFromProject(usTitle, testCaseIndex) {
    if (!selectedProject) return;
    
    const testCases = projectUsTestCases[usTitle] || [];
    if (!window.confirm(`Testfall "${testCases[testCaseIndex]?.title}" wirklich löschen?`)) return;
    
    try {
      const updatedTestCases = testCases.filter((_, idx) => idx !== testCaseIndex);
      
      // Konvertiere "Hauptseite" zurück zu "default" für API-Aufruf
      const apiProjectName = selectedProject === 'Hauptseite' ? 'default' : selectedProject;
      
      // Speichere aktualisierte Testfälle
      await api.adoptSelectedToProject(apiProjectName, usTitle, updatedTestCases, usTitle);
      
      setToast({ message: 'Testfall gelöscht', type: 'info' });
      await loadProjectUserStories(selectedProject);
    } catch (e) {
      console.error('deleteTestCaseFromProject error:', e);
      setToast({ message: 'Löschen fehlgeschlagen', type: 'error' });
    }
  }
  
  async function updateTestCase(usTitle, testCaseIndex, updatedTestCase) {
    if (!selectedProject) return;
    
    try {
      const testCases = [...(projectUsTestCases[usTitle] || [])];
      testCases[testCaseIndex] = updatedTestCase;
      
      // Konvertiere "Hauptseite" zurück zu "default" für API-Aufruf
      const apiProjectName = selectedProject === 'Hauptseite' ? 'default' : selectedProject;
      
      // Speichere aktualisierte Testfälle
      await api.adoptSelectedToProject(apiProjectName, usTitle, testCases, usTitle);
      
      setToast({ message: 'Testfall aktualisiert', type: 'success' });
      await loadProjectUserStories(selectedProject);
    } catch (e) {
      console.error('updateTestCase error:', e);
      setToast({ message: 'Aktualisierung fehlgeschlagen', type: 'error' });
    }
  }
  
  async function deleteUserStoryFromProject(usTitle) {
    if (!selectedProject) return;
    
    if (!window.confirm(`User Story "${usTitle}" mit allen Testfällen wirklich aus dem Projekt löschen?`)) return;
    
    try {
      // Konvertiere "Hauptseite" zurück zu "default" für API-Aufruf
      const apiProjectName = selectedProject === 'Hauptseite' ? 'default' : selectedProject;
      
      await api.deleteUserStory(apiProjectName, usTitle);
      setToast({ message: 'User Story gelöscht', type: 'info' });
      await loadProjectUserStories(selectedProject);
    } catch (e) {
      console.error('deleteUserStoryFromProject error:', e);
      setToast({ message: 'Löschen fehlgeschlagen', type: 'error' });
    }
  }
  
  function exportUserStory(usTitle, testCases) {
    try {
      // Erstelle Excel-Daten im JIRA/Azure DevOps kompatiblen Format
      const excelData = [];
      
      // Nur Testfälle Header (JIRA/Azure DevOps Standard)
      excelData.push([
        'Test Case ID',
        'Title',
        'Description',
        'Preconditions',
        'Test Steps',
        'Expected Result',
        'Priority',
        'User Story'
      ]);
      
      // Testfälle
      testCases.forEach((tc, index) => {
        const preconditions = (tc.preconditions || []).join('\n');
        const steps = (tc.steps || []).map((step, i) => `${i + 1}. ${step}`).join('\n');
        
        excelData.push([
          `TC-${index + 1}`,
          tc.title || '',
          tc.description || '',
          preconditions,
          steps,
          tc.expected_result || '',
          tc.priority || 'Medium',
          usTitle
        ]);
      });
      
      // Erstelle Worksheet mit korrekter UTF-8 Kodierung
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Setze Spaltenbreiten für bessere Lesbarkeit
      ws['!cols'] = [
        { wch: 12 },  // Test Case ID
        { wch: 35 },  // Title
        { wch: 45 },  // Description
        { wch: 35 },  // Preconditions
        { wch: 45 },  // Test Steps
        { wch: 45 },  // Expected Result
        { wch: 12 },  // Priority
        { wch: 30 }   // User Story
      ];
      
      // Erstelle Workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');
      
      // Bereinige Dateiname (ersetze ungültige Zeichen)
      const sanitizedUsTitle = usTitle.replace(/[<>:"/\\|?*]/g, '-');
      const filename = `${sanitizedUsTitle}_TestCases.xlsx`;
      
      // Exportiere als Excel mit UTF-8 Unterstützung für Umlaute
      XLSX.writeFile(wb, filename, { bookType: 'xlsx', type: 'binary' });
      
      setToast({ message: `${testCases.length} Testfälle als Excel exportiert`, type: 'success' });
    } catch (e) {
      console.error('exportUserStory error:', e);
      setToast({ message: 'Export fehlgeschlagen', type: 'error' });
    }
  }

  return (
    <div>
      <div style={{ padding: 16, maxWidth: 1400, margin: '0 auto' }}>
        <h2>TestPlan - Globale User Stories verwalten</h2>
        <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>
          Hier siehst du alle gespeicherten User Stories. Wähle ein Projekt und übernimm ganze User Stories auf einmal.
        </p>
        <div style={{ display: 'flex', gap: 16 }}>
          <aside style={{ width: 220, borderRight: '1px solid #e5e7eb', paddingRight: 16 }}>
          <h4 style={{ marginTop: 0 }}>Ziel-Projekte</h4>
          {loading && <div style={{ color: '#6b7280' }}>Loading...</div>}
          {!loading && projects.length === 0 && <div style={{ color: '#6b7280', fontSize: 13 }}>Noch keine Projekte vorhanden</div>}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {projects.map((p) => (
              <li 
                key={p} 
                style={{ marginBottom: 8, position: 'relative' }}
                onMouseEnter={() => setHoveredProject(p)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <button
                  onClick={() => setSelectedProject(p)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    background: p === selectedProject 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : '#f3f4f6',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 8,
                    fontWeight: 600,
                    color: p === selectedProject ? 'white' : '#374151',
                    fontSize: 14,
                    transition: 'all 0.2s ease',
                    boxShadow: p === selectedProject 
                      ? '0 2px 8px rgba(16, 185, 129, 0.3)' 
                      : '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseOver={(e) => {
                    if (p !== selectedProject) {
                      e.currentTarget.style.background = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateX(2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (p !== selectedProject) {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  {p}
                </button>
                
                {/* Hover-Aktionen für Projekte (außer Hauptseite) */}
                {hoveredProject === p && p !== 'Hauptseite' && (
                  <div style={{ 
                    position: 'absolute', 
                    right: 10, 
                    top: 8, 
                    display: 'flex', 
                    gap: 6,
                    zIndex: 10,
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRenameDialog(p);
                      }}
                      title="Projekt umbenennen"
                      style={{
                        background: 'white',
                        color: '#3b82f6',
                        border: '2px solid #3b82f6',
                        borderRadius: 6,
                        padding: '4px 10px',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(p);
                      }}
                      title="Projekt löschen"
                      style={{
                        background: 'white',
                        color: '#ef4444',
                        border: '2px solid #ef4444',
                        borderRadius: 6,
                        padding: '4px 10px',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <button 
            onClick={() => setShowCreateProject(true)} 
            style={{ 
              marginTop: 16, 
              width: '100%',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
            }}
          >
            + Neues Projekt
          </button>
        </aside>

        <main style={{ flex: 1 }}>
          {/* Projektspezifische User Stories - NICHT auf Hauptseite anzeigen */}
          {selectedProject && selectedProject !== 'Hauptseite' && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginTop: 0, color: '#1f2937' }}>
                  Ausgewählte User Stories
                </h4>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, minHeight: 150, background: '#fafafa' }}>
                  {loadingProjectUs && (
                    <div style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>
                      Lade User Stories...
                    </div>
                  )}
                  {!loadingProjectUs && projectUserStories.length === 0 && (
                    <div style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>
                      Noch keine User Stories in diesem Projekt. Übernimm User Stories von der Hauptseite.
                    </div>
                  )}
                  {!loadingProjectUs && projectUserStories.length > 0 && (
                    <div>
                      {projectUserStories.map((us) => (
                        <div key={us} style={{ marginBottom: 16, border: '1px solid #e0e7ef', borderRadius: 6, background: 'white', overflow: 'hidden' }}>
                          <div
                            style={{ 
                              cursor: 'pointer', 
                              padding: '12px 16px', 
                              fontWeight: 600, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              fontSize: 16,
                              background: '#f0f9ff',
                              borderBottom: openProjectUsGroups[us] ? '1px solid #e0e7ef' : 'none',
                            }}
                          >
                            <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                              <span 
                                style={{ fontSize: 18, marginRight: 8, display: 'inline-block', width: 20 }} 
                                onClick={() => setOpenProjectUsGroups(prev => ({ ...prev, [us]: !prev[us] }))}
                              >
                                {openProjectUsGroups[us] ? '▼' : '▶'}
                              </span>
                              <strong style={{ color: '#1f2937' }}>📋 {us}</strong>
                              <span style={{ color: '#64748b', fontWeight: 400, fontSize: 14, marginLeft: 8 }}>
                                ({(projectUsTestCases[us] || []).length} Testfälle)
                              </span>
                            </span>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                title="User Story mit Testfällen exportieren"
                                style={{ 
                                  background: '#dbeafe', 
                                  color: '#1e40af', 
                                  border: 'none', 
                                  borderRadius: 4, 
                                  padding: '6px 12px', 
                                  cursor: 'pointer', 
                                  fontSize: 14,
                                  fontWeight: 600,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportUserStory(us, projectUsTestCases[us] || []);
                                }}
                              >
                                📥 Export
                              </button>
                              <button
                                title="User Story aus Projekt löschen"
                                style={{ 
                                  background: '#fee2e2', 
                                  color: '#b91c1c', 
                                  border: 'none', 
                                  borderRadius: 4, 
                                  padding: '6px 12px', 
                                  cursor: 'pointer', 
                                  fontSize: 14,
                                  fontWeight: 600,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteUserStoryFromProject(us);
                                }}
                              >
                                🗑️ Löschen
                              </button>
                            </div>
                          </div>
                          {openProjectUsGroups[us] && (
                            <div style={{ padding: '12px 16px' }}>
                              {(projectUsTestCases[us] || []).length === 0 && (
                                <div style={{ color: '#6b7280', textAlign: 'center', padding: 20 }}>
                                  Keine Testfälle vorhanden
                                </div>
                              )}
                              {(projectUsTestCases[us] || []).map((tc, idx) => (
                                <div key={idx} style={{ marginBottom: 12 }}>
                                  <EditableTestCase 
                                    testCase={tc} 
                                    onUpdate={(updated) => updateTestCase(us, idx, updated)}
                                    onDelete={() => deleteTestCaseFromProject(us, idx)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Globale User Stories - NUR auf Hauptseite anzeigen */}
          {selectedProject === 'Hauptseite' && (
            <>
              <h4 style={{ marginTop: 0 }}>Globale User Stories</h4>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, minHeight: 200, background: '#fafafa' }}>
                {Object.keys(groupedGlobalTestCases).length === 0 && (
                  <div style={{ color: '#6b7280', textAlign: 'center', padding: 40 }}>
                    Keine User Stories vorhanden. Erstelle Testfälle im Dashboard und merke sie hier.
                  </div>
                )}
                {Object.entries(groupedGlobalTestCases).map(([us, tcs]) => (
              <div key={us} style={{ marginBottom: 16, border: '1px solid #e0e7ef', borderRadius: 6, background: 'white', overflow: 'hidden' }}>
                <div
                  style={{ 
                    cursor: 'pointer', 
                    padding: '12px 16px', 
                    fontWeight: 600, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    fontSize: 16,
                    background: selectedUserStory === us ? '#eef2ff' : '#f8fafc',
                    borderBottom: openUsGroups[us] ? '1px solid #e0e7ef' : 'none',
                  }}
                  onClick={() => setSelectedUserStory(us)}
                >
                  <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <span 
                      style={{ fontSize: 18, marginRight: 8, display: 'inline-block', width: 20 }} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenUsGroups(prev => ({ ...prev, [us]: !prev[us] }));
                      }}
                    >
                      {openUsGroups[us] ? '▼' : '▶'}
                    </span>
                    <strong style={{ color: selectedUserStory === us ? '#3b82f6' : '#1f2937' }}>{us}</strong> 
                    <span style={{ color: '#64748b', fontWeight: 400, fontSize: 14, marginLeft: 8 }}>({tcs.length} Testfälle)</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      title="User Story und alle zugehörigen Testfälle aus der globalen Auswahl entfernen"
                      style={{ 
                        background: '#fee2e2', 
                        color: '#b91c1c', 
                        border: 'none', 
                        borderRadius: 4, 
                        padding: '6px 12px', 
                        cursor: 'pointer', 
                        fontSize: 14,
                        fontWeight: 600,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUsFromGlobal(us);
                      }}
                    >
                      🗑️ Löschen
                    </button>
                  </span>
                </div>
                {openUsGroups[us] && (
                  <ul id={`us-group-${us}`} style={{ listStyle: 'none', margin: 0, padding: '12px 16px' }}>
                    {tcs.map((tc, idx) => (
                      <li key={tc.id || tc._globalIdx || idx} style={{ marginBottom: 12 }}>
                        <TestCaseCard testCase={tc} index={tc._globalIdx} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          
          {/* Hilfe-Sektion - nur auf Hauptseite */}
          {selectedProject === 'Hauptseite' && Object.keys(groupedGlobalTestCases).length > 0 && (
            <div style={{ marginTop: 16, padding: 16, background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 8 }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>So funktioniert's:</h5>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                1. ✓ Projekt ist ausgewählt: <strong style={{ color: '#3b82f6' }}>{selectedProject}</strong><br />
                2. 📋 Wähle User Story im Dropdown unten<br />
                3. ✅ Klicke auf "In Projekt übernehmen"
              </div>
            </div>
          )}
          
          {/* Dropdown-Bereich für Projekt- und User Story-Auswahl - nur auf Hauptseite */}
          {selectedProject === 'Hauptseite' && Object.keys(groupedGlobalTestCases).length > 0 && (
            <div style={{ marginTop: 16, padding: 20, background: 'white', border: '2px solid #3b82f6', borderRadius: 8 }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>User Story in Projekt übernehmen</h4>
              <div style={{ marginBottom: 16, color: '#64748b', fontSize: 14 }}>
                Wähle ein Ziel-Projekt und eine User Story aus, um sie zu übernehmen.
              </div>
              
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <select 
                  value={dropdownProject} 
                  onChange={(e) => setDropdownProject(e.target.value)}
                  style={{ 
                    padding: '10px 12px', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: 4, 
                    fontSize: 14,
                    minWidth: 200,
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Projekt auswählen...</option>
                  {projects.filter(p => p !== 'Hauptseite').map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                <select 
                  value={selectedUserStory || ''} 
                  onChange={(e) => setSelectedUserStory(e.target.value)}
                  style={{ 
                    padding: '10px 12px', 
                    border: '1px solid #cbd5e1', 
                    borderRadius: 4, 
                    fontSize: 14,
                    minWidth: 250,
                    cursor: 'pointer'
                  }}
                >
                  <option value="">User Story auswählen...</option>
                  {Object.keys(groupedGlobalTestCases).map(us => (
                    <option key={us} value={us}>{us}</option>
                  ))}
                </select>

                <button
                  onClick={adoptUserStoryToProject}
                  disabled={!dropdownProject || !selectedUserStory}
                  style={{ 
                    background: dropdownProject && selectedUserStory ? '#10b981' : '#cbd5e1', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: 6, 
                    padding: '10px 24px', 
                    cursor: dropdownProject && selectedUserStory ? 'pointer' : 'not-allowed', 
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ✓ In Projekt übernehmen
                </button>
              </div>

              {selectedUserStory && groupedGlobalTestCases[selectedUserStory] && (
                <div style={{ marginTop: 12, padding: 12, background: '#f0fdf4', borderRadius: 4, fontSize: 13, color: '#15803d' }}>
                  ✅ {groupedGlobalTestCases[selectedUserStory].length} Testfall(e) ausgewählt - bereit zum Übernehmen!
                </div>
              )}
            </div>
          )}
            </>
          )}
        </main>
      </div>

      {showCreateProject && (
        <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, width: 420, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0 }}>Neues Projekt erstellen</h3>
            <input 
              value={newProjectName} 
              onChange={(e) => setNewProjectName(e.target.value)} 
              placeholder="Projektname eingeben..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: 14 }} 
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button 
                onClick={() => setShowCreateProject(false)}
                style={{ padding: '8px 16px', background: '#e5e7eb', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
              >
                Abbrechen
              </button>
              <button 
                onClick={createProject}
                style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showRenameProject && (
        <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 12, width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <span style={{ fontSize: 24 }}>✏️</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: '#1f2937' }}>Projekt umbenennen</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>
                  Aktueller Name: <strong>{projectToRename}</strong>
                </p>
              </div>
            </div>
            
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
              Neuer Projektname
            </label>
            <input 
              value={newRenamedProjectName} 
              onChange={(e) => setNewRenamedProjectName(e.target.value)} 
              placeholder="Neuen Namen eingeben..."
              autoFocus
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                border: '2px solid #e5e7eb', 
                borderRadius: 6, 
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s',
              }} 
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button 
                onClick={() => {
                  setShowRenameProject(false);
                  setProjectToRename(null);
                  setNewRenamedProjectName('');
                }}
                style={{ 
                  padding: '10px 20px', 
                  background: '#f3f4f6', 
                  border: 'none', 
                  borderRadius: 6, 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: 14,
                }}
              >
                Abbrechen
              </button>
              <button 
                onClick={renameProject}
                disabled={!newRenamedProjectName || newRenamedProjectName === projectToRename}
                style={{ 
                  padding: '10px 20px', 
                  background: newRenamedProjectName && newRenamedProjectName !== projectToRename 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                    : '#cbd5e1',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 6, 
                  cursor: newRenamedProjectName && newRenamedProjectName !== projectToRename ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: newRenamedProjectName && newRenamedProjectName !== projectToRename 
                    ? '0 2px 8px rgba(59, 130, 246, 0.3)' 
                    : 'none',
                }}
              >
                ✓ Umbenennen
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message || toast} type={toast.type || 'info'} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
