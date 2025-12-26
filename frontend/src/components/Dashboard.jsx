import React, { useState } from "react";
import * as api from "../services/api";
import Toast from "./Toast";
import mammoth from "mammoth";

export default function Dashboard({ setView, activeProject }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
  const [generated, setGenerated] = useState(null);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [comprehensive, setComprehensive] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isRegenerate, setIsRegenerate] = useState(false);

  async function onGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setIsRegenerate(false);
    try {
      // If comprehensive is selected, send 0 to indicate backend should generate a comprehensive set
      const requested = comprehensive ? 0 : 3;
      
      // Combine text and uploaded files
      let fullUserStory = `${title}\n\n${description}`;
      
      // Add Acceptance Criteria if provided
      if (acceptanceCriteria && acceptanceCriteria.trim()) {
        fullUserStory += `\n\n=== AKZEPTANZKRITERIEN ===\n${acceptanceCriteria.trim()}`;
      }
      
      // If files are uploaded, extract text from them with enhanced analysis
      if (uploadedFiles.length > 0) {
        fullUserStory += "\n\n╔═══════════════════════════════════════════════════════════════════╗\n";
        fullUserStory += "║ 📁 HOCHGELADENE DOKUMENTE - DETAILLIERTE ANALYSE\n";
        fullUserStory += "╚═══════════════════════════════════════════════════════════════════╝\n\n";
        fullUserStory += `⚠️ WICHTIG: ${uploadedFiles.length} Dokument(e) hochgeladen!\n`;
        fullUserStory += "Analysiere JEDES Detail aus den Dokumenten für Testgenerierung:\n";
        fullUserStory += "• Alle Tabellen, Views, Felder\n";
        fullUserStory += "• Alle IDs, Nummernkreise, Formate\n";
        fullUserStory += "• Alle Entitäten und deren Beziehungen\n";
        fullUserStory += "• Alle technischen Spezifikationen\n";
        fullUserStory += "• Alle Anforderungen und Mappings\n\n";
        
        for (const file of uploadedFiles) {
          const text = await extractTextFromFile(file);
          fullUserStory += `${text}\n\n`;
        }
        
        fullUserStory += "╔═══════════════════════════════════════════════════════════════════╗\n";
        fullUserStory += "║ 🎯 TESTGENERIERUNG: Nutze ALLE Informationen aus den Dokumenten!\n";
        fullUserStory += "╚═══════════════════════════════════════════════════════════════════╝\n\n";
      }
      
      const res = await api.generateTestCases(fullUserStory, requested);
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

  async function onRegenerate(e) {
    e.preventDefault();
    if (!generated || generated.length === 0) {
      return alert('Keine Testfälle zum Re-Generieren vorhanden');
    }
    
    setLoading(true);
    setIsRegenerate(true);
    try {
      // Combine text and uploaded files
      let fullUserStory = `${title}\n\n${description}`;
      
      // Add Acceptance Criteria if provided
      if (acceptanceCriteria && acceptanceCriteria.trim()) {
        fullUserStory += `\n\n=== AKZEPTANZKRITERIEN ===\n${acceptanceCriteria.trim()}`;
      }
      
      // If files are uploaded, extract text from them
      if (uploadedFiles.length > 0) {
        fullUserStory += "\n\n--- Hochgeladene Dokumente ---\n";
        for (const file of uploadedFiles) {
          const text = await extractTextFromFile(file);
          fullUserStory += `\n\n=== ${file.name} ===\n${text}`;
        }
      }
      
      // Add comprehensive context from existing test cases for better regeneration
      fullUserStory += "\n\n=== KONTEXT: BEREITS GENERIERTE TESTFÄLLE (Detaillierte Analyse für Verbesserung) ===\n";
      fullUserStory += `📊 Anzahl bisheriger Tests: ${generated.length}\n`;
      fullUserStory += `📈 Ziel: MINDESTENS ${Math.ceil(generated.length * 2)} neue Tests (>100% mehr!)\n\n`;
      
      fullUserStory += "🔍 BEREITS ABGEDECKTE BEREICHE:\n";
      generated.forEach((tc, i) => {
        fullUserStory += `${i + 1}. ${tc.title}\n`;
        if (tc.description) {
          fullUserStory += `   → ${tc.description.substring(0, 100)}${tc.description.length > 100 ? '...' : ''}\n`;
        }
      });
      
      fullUserStory += "\n\n🎯 RE-GENERIERUNG: ERWEITERTE TESTABDECKUNG\n";
      fullUserStory += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
      fullUserStory += "⚠️ KRITISCHE ANFORDERUNGEN:\n\n";
      fullUserStory += `1. QUANTITÄT: Generiere MINDESTENS ${Math.ceil(generated.length * 2)} ZUSÄTZLICHE Testfälle\n`;
      fullUserStory += "   - Das sind >100% mehr als bisher!\n";
      fullUserStory += "   - Nutze die hochgeladenen Dokumente für JEDES Detail!\n\n";
      
      fullUserStory += "2. DOKUMENT-ANALYSE (SEHR WICHTIG!):\n";
      if (uploadedFiles.length > 0) {
        fullUserStory += `   ✅ ${uploadedFiles.length} Dokument(e) hochgeladen - Analysiere JEDES Detail!\n`;
        fullUserStory += "   - Extrahiere ALLE erwähnten Felder, Entitäten und Tabellen\n";
        fullUserStory += "   - Erstelle Tests für JEDE Tabelle/View (z.B. V_FMI_kth_gruppen)\n";
        fullUserStory += "   - Teste ALLE Mappings aus Felderlisten\n";
        fullUserStory += "   - Berücksichtige ALLE technischen Details (IDs, Nummernkreise, Formate)\n";
        fullUserStory += "   - Erstelle Tests für JEDE erwähnte Entität (TO, SO, KBE, etc.)\n\n";
      }
      
      fullUserStory += "3. NEUE TESTBEREICHE (nicht in bisherigen Tests):\n";
      fullUserStory += "   ✓ Grenzwert-Tests für ALLE Nummernkreise und ID-Formate\n";
      fullUserStory += "   ✓ Datenvalidierung für JEDES Feld aus Dokumenten\n";
      fullUserStory += "   ✓ Workflow-Tests für ALLE Prozessschritte\n";
      fullUserStory += "   ✓ Rollen- und Berechtigungstests\n";
      fullUserStory += "   ✓ Integrationstests zwischen ALLEN Entitäten\n";
      fullUserStory += "   ✓ Fehlerbehandlung für JEDEN möglichen Fehlerfall\n";
      fullUserStory += "   ✓ Performance-Tests (große Datenmengen, Bulk-Operationen)\n";
      fullUserStory += "   ✓ Konsistenz-Tests (Datenintegrität, Referenzen)\n";
      fullUserStory += "   ✓ UI/UX-Tests für Benutzerinteraktionen\n";
      fullUserStory += "   ✓ Migrations- und Synchronisations-Tests\n\n";
      
      fullUserStory += "4. TESTSCHRITTE - MAXIMALE DETAILTIEFE:\n";
      fullUserStory += "   ✓ Jeder Test: 7-12 detaillierte Schritte (nicht 4-6!)\n";
      fullUserStory += "   ✓ Verwende KONKRETE Daten aus Dokumenten (Tabellennamen, IDs, Formate)\n";
      fullUserStory += "   ✓ Jeder Schritt: Was, Wie, Wo, Erwartetes Ergebnis\n";
      fullUserStory += "   ✓ Schritt-für-Schritt so detailliert, dass jemand OHNE Vorkenntnisse testen kann\n\n";
      
      fullUserStory += "5. QUALITÄT > QUANTITÄT:\n";
      fullUserStory += "   ✓ Jeder Test muss EINZIGARTIG sein (keine Duplikate!)\n";
      fullUserStory += "   ✓ Jeder Test muss WERTVOLL sein (echte Abdeckung!)\n";
      fullUserStory += "   ✓ Jeder Test muss AUSFÜHRBAR sein (realistische Szenarien!)\n";
      fullUserStory += "   ✓ Nutze die User Story UND die Dokumente für JEDEN Test!\n\n";
      
      fullUserStory += "6. PRIORISIERUNG:\n";
      fullUserStory += "   ✓ High Priority: Kritische Geschäftslogik, Datenintegrität, Compliance\n";
      fullUserStory += "   ✓ Medium Priority: Standard-Workflows, Validierung, UI\n";
      fullUserStory += "   ✓ Low Priority: Edge Cases, Performance-Optimierung\n\n";
      
      fullUserStory += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
      fullUserStory += "💡 TIPP: Wenn Dokumente hochgeladen sind, nutze JEDES Detail daraus!\n";
      fullUserStory += "⚠️ WARNUNG: Weniger als " + Math.ceil(generated.length * 1.5) + " neue Tests = UNZUREICHEND!\n\n";
      
      // Request 100% more tests (double the current amount)
      const requested = Math.ceil(generated.length * 2);
      
      const res = await api.generateTestCases(fullUserStory, requested);
      
      // Merge with existing tests (avoid duplicates)
      const newTests = res.test_cases || [];
      setGenerated([...generated, ...newTests]);
      setToast(`${newTests.length} neue verbesserte Testfälle hinzugefügt!`);
      
      // reset selection
      setSelected({});
    } catch (err) {
      console.error('Regenerate error', err);
      const msg = err?.response?.data?.detail || err?.response?.data || err?.message || JSON.stringify(err);
      alert(`Fehler beim Re-Generieren: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function extractTextFromFile(file) {
    try {
      if (file.type.includes('text') || file.name.endsWith('.txt')) {
        // Plain text file with advanced parsing
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            let text = e.target.result;
            
            // Clean up text: remove excessive whitespace, normalize line breaks
            text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            text = text.replace(/\n{3,}/g, '\n\n'); // max 2 consecutive newlines
            
            // Enhanced structure detection
            const analyzedText = analyzeDocumentStructure(text, file.name);
            
            resolve(analyzedText);
          };
          reader.onerror = reject;
          reader.readAsText(file, 'UTF-8');
        });
      } else if (file.name.endsWith('.docx')) {
        // DOCX file using mammoth.js with MAXIMUM detail extraction
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const arrayBuffer = e.target.result;
              
              // Extract both HTML and raw text for maximum information
              const htmlResult = await mammoth.convertToHtml({ 
                arrayBuffer,
                styleMap: [
                  "p[style-name='Heading 1'] => h1:fresh",
                  "p[style-name='Heading 2'] => h2:fresh",
                  "p[style-name='Heading 3'] => h3:fresh"
                ]
              });
              const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
              
              let text = rawTextResult.value;
              
              // Clean up text
              text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
              text = text.replace(/\n{3,}/g, '\n\n');
              text = text.trim();
              
              // Advanced structure analysis
              const analyzedText = analyzeDocumentStructure(text, file.name);
              
              // Add rich metadata
              const metadata = `
╔═══════════════════════════════════════════════════════════════════╗
║ DOKUMENT-ANALYSE: ${file.name}
║ Größe: ${(file.size / 1024).toFixed(2)} KB
║ Typ: Microsoft Word (DOCX)
║ Extrahiert: ${new Date().toLocaleString('de-DE')}
║ Zeichen: ${text.length}
║ Wörter: ${text.split(/\s+/).filter(w => w.length > 0).length}
╚═══════════════════════════════════════════════════════════════════╝

`;
              
              resolve(metadata + analyzedText);
            } catch (err) {
              console.error('DOCX parse error:', err);
              resolve(`[❌ Fehler beim Lesen der DOCX-Datei: ${file.name}]\nFehlerdetails: ${err.message}`);
            }
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });
      } else if (file.name.endsWith('.pdf')) {
        // PDF: Enhanced message with guidance
        return `
╔═══════════════════════════════════════════════════════════════════╗
║ PDF-DOKUMENT: ${file.name}
║ Größe: ${(file.size / 1024).toFixed(2)} KB
╚═══════════════════════════════════════════════════════════════════╝

⚠️ PDF-Unterstützung in Entwicklung

📋 Empfohlene Vorgehensweise:
1. PDF → DOCX konvertieren (z.B. mit Adobe Acrobat, Word)
2. DOCX hier hochladen für optimale Analyse
3. Oder: PDF → TXT konvertieren für Text-Extraktion

💡 TIPP: DOCX-Format liefert die besten Ergebnisse mit:
   - Strukturerhaltung (Überschriften, Listen)
   - Tabellenextraktion
   - Formatierungsinformation
`;
      } else {
        // Unknown type: try reading as text with enhanced error handling
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              let text = e.target.result;
              text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
              text = text.replace(/\n{3,}/g, '\n\n');
              
              const analyzedText = analyzeDocumentStructure(text.trim(), file.name);
              resolve(analyzedText);
            } catch (err) {
              resolve(`[⚠️ Unbekannter Dateityp: ${file.name}]\nKonnte nicht als Text gelesen werden.\n${err.message}`);
            }
          };
          reader.onerror = () => resolve(`[❌ Fehler beim Lesen: ${file.name}]`);
          reader.readAsText(file, 'UTF-8');
        });
      }
    } catch (error) {
      console.error('File extraction error:', error);
      return `[❌ Fehler beim Lesen: ${file.name}]\nDetails: ${error.message}`;
    }
  }

  // Advanced document structure analysis
  function analyzeDocumentStructure(text, filename) {
    let analyzed = `📄 INHALT VON: ${filename}\n${'═'.repeat(70)}\n\n`;
    
    // Detect tables (simple pattern matching)
    const tablePatterns = /(?:Tabelle|Table|View|SELECT.*FROM)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;
    const tables = [...new Set([...text.matchAll(tablePatterns)].map(m => m[1]))];
    if (tables.length > 0) {
      analyzed += `📊 ERKANNTE TABELLEN/VIEWS (${tables.length}):\n`;
      tables.forEach(t => analyzed += `   • ${t}\n`);
      analyzed += '\n';
    }
    
    // Detect fields/columns (common patterns)
    const fieldPatterns = /(?:Feld|Field|Spalte|Column):\s*([a-zA-Z_][a-zA-Z0-9_]*)/gi;
    const fields = [...new Set([...text.matchAll(fieldPatterns)].map(m => m[1]))];
    if (fields.length > 0) {
      analyzed += `📋 ERKANNTE FELDER (${Math.min(fields.length, 20)}):\n`;
      fields.slice(0, 20).forEach(f => analyzed += `   • ${f}\n`);
      if (fields.length > 20) analyzed += `   ... und ${fields.length - 20} weitere\n`;
      analyzed += '\n';
    }
    
    // Detect IDs and number formats
    const idPatterns = /(?:TO|SO|GR|KBE|ID)[0-9]{2,7}/g;
    const ids = [...new Set([...text.matchAll(idPatterns)].map(m => m[0]))];
    if (ids.length > 0) {
      analyzed += `🔢 ERKANNTE ID-FORMATE (${Math.min(ids.length, 10)} Beispiele):\n`;
      ids.slice(0, 10).forEach(id => analyzed += `   • ${id}\n`);
      analyzed += '\n';
    }
    
    // Detect requirements/criteria
    const requirementPatterns = /(?:^|\n)[-•]\s*(.+?)(?:\n|$)/g;
    const requirements = [...text.matchAll(requirementPatterns)].map(m => m[1].trim());
    if (requirements.length > 0) {
      analyzed += `✓ ERKANNTE ANFORDERUNGEN/KRITERIEN (${requirements.length}):\n`;
      requirements.slice(0, 15).forEach(r => analyzed += `   • ${r}\n`);
      if (requirements.length > 15) analyzed += `   ... und ${requirements.length - 15} weitere\n`;
      analyzed += '\n';
    }
    
    // Detect entities (common business objects)
    const entityPatterns = /(?:Träger|Standort|Gruppe|Antragsteller|Tageseltern|Kindergarten|Betreiber|Kinderbetreuungseinrichtung)/gi;
    const entities = [...new Set([...text.matchAll(entityPatterns)].map(m => m[0]))];
    if (entities.length > 0) {
      analyzed += `🏢 ERKANNTE ENTITÄTEN:\n`;
      [...new Set(entities.map(e => e.toLowerCase()))].forEach(e => analyzed += `   • ${e}\n`);
      analyzed += '\n';
    }
    
    analyzed += `${'═'.repeat(70)}\n\n`;
    analyzed += text;
    
    return analyzed;
  }

  function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    const maxSizeInBytes = 50 * 1024 * 1024; // 50 MB
    
    const validFiles = [];
    const invalidFiles = [];
    
    for (const file of files) {
      if (file.size > maxSizeInBytes) {
        invalidFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      } else {
        validFiles.push(file);
      }
    }
    
    if (invalidFiles.length > 0) {
      alert(`Folgende Dateien sind zu groß (max. 50 MB):\n${invalidFiles.join('\n')}`);
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
    setToast(`${validFiles.length} Datei(en) hochgeladen`);
    
    // Reset input
    e.target.value = '';
  }

  function removeFile(index) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setToast('Datei entfernt');
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
    setAcceptanceCriteria("");
    setGenerated(null);
    setSelected({});
    setUploadedFiles([]);
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

          <div className="form-group">
            <label>Akzeptanzkriterien (optional, aber empfohlen für bessere Testabdeckung)</label>
            <textarea 
              className="input" 
              value={acceptanceCriteria} 
              onChange={(e) => setAcceptanceCriteria(e.target.value)} 
              rows={4}
              placeholder="Gib hier die Akzeptanzkriterien ein, z.B.:
- Benutzer kann Träger erfolgreich übernehmen
- Alle Felder werden korrekt befüllt
- Eine Aufgabe wird für das Team erstellt
..."
              style={{ fontSize: 14 }}
            />
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              💡 Tipp: Klare Akzeptanzkriterien führen zu besserer Testabdeckung und mehr detaillierten Testfällen
            </div>
          </div>

          <div className="form-group">
            <label>Dokumente hochladen (optional)</label>
            <div style={{ 
              border: '2px dashed rgba(71, 85, 105, 0.5)', 
              borderRadius: 12, 
              padding: 20, 
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.3)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
            onClick={() => document.getElementById('file-upload').click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#3b82f6'; }}
            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#d1d5db'; }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#d1d5db';
              const files = Array.from(e.dataTransfer.files);
              handleFileUpload({ target: { files } });
            }}
            >
              <input 
                id="file-upload"
                type="file" 
                multiple
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <div style={{ fontSize: 48, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 14, color: '#cbd5e1', marginBottom: 4 }}>
                Klicken oder Datei hierher ziehen
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                TXT, DOCX, PDF (max. 50 MB pro Datei)
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#e2e8f0' }}>
                  {uploadedFiles.length} Datei(en) hochgeladen:
                </div>
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '8px 12px', 
                    background: 'rgba(30, 41, 59, 0.5)', 
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    borderRadius: 8,
                    marginBottom: 6
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>📎</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{file.name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.8)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: 6,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: 12,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.8)'}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-row" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            marginTop: 20,
            flexWrap: 'wrap'
          }}>
            {/* Comprehensive Checkbox */}
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              marginRight: 'auto'
            }}>
              <input type="checkbox" checked={comprehensive} onChange={(e) => setComprehensive(e.target.checked)} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Comprehensive</span>
            </label>

            {/* Action Buttons Group */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* Primary: Generate Button */}
              <button 
                className="btn-primary" 
                type="submit" 
                disabled={loading}
                style={{
                  background: loading && !isRegenerate ? '#9333ea' : '#7c3aed',
                  minWidth: 180,
                  fontWeight: 600
                }}
              >
                {loading && !isRegenerate ? '⏳ Generieren...' : '✨ Testfälle generieren'}
              </button>

              {/* Secondary: Re-Generate Button (conditionally shown) */}
              {generated && generated.length > 0 && (
                <button 
                  className="btn-primary" 
                  type="button" 
                  onClick={onRegenerate} 
                  disabled={loading}
                  style={{ 
                    background: loading && isRegenerate ? '#ea580c' : '#f59e0b',
                    minWidth: 200,
                    fontWeight: 600,
                    boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)'
                  }}
                  title={`Generiert ${Math.ceil(generated.length * 2)} zusätzliche Tests mit maximaler Abdeckung`}
                >
                  {loading && isRegenerate ? '⏳ Re-Generieren...' : `🔄 Re-Generieren (×2 Tests!)`}
                </button>
              )}

              {/* Success: Save Button */}
              <button 
                className="btn-primary" 
                type="button" 
                onClick={onMerken} 
                disabled={loading}
                style={{ 
                  background: '#10b981',
                  minWidth: 100,
                  fontWeight: 600,
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
                }}
              >
                💾 Merken
              </button>

              {/* Ghost: New User Story Button */}
              <button 
                className="btn-ghost" 
                type="button" 
                onClick={onNewUserStory}
                style={{ 
                  minWidth: 140,
                  fontWeight: 500
                }}
              >
                📝 Neue User Story
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="results-section" style={{ marginTop: 8 }}>
        <div className="results-header" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2>Generierte Testfälle</h2>
            <div className="results-count">{generated ? generated.length : 0}</div>
          </div>
          
          {/* Select All / Deselect All Button */}
          {generated && generated.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const allSelected = generated.every((_, i) => selected[i]);
                if (allSelected) {
                  // Deselect all
                  setSelected({});
                } else {
                  // Select all
                  const newSelected = {};
                  generated.forEach((_, i) => {
                    newSelected[i] = true;
                  });
                  setSelected(newSelected);
                }
              }}
              style={{
                padding: '10px 18px',
                background: Object.keys(selected).length === 0 ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: Object.keys(selected).length === 0 ? '0 4px 12px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(239, 68, 68, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              {Object.keys(selected).length === 0 ? (
                <>
                  <span>☑️</span>
                  <span>Alle auswählen</span>
                </>
              ) : (
                <>
                  <span>❌</span>
                  <span>Alle abwählen ({Object.keys(selected).filter(k => selected[k]).length})</span>
                </>
              )}
            </button>
          )}
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
                    <strong style={{ color: '#93c5fd', fontSize: '15px' }}>Preconditions:</strong>
                    <ul style={{ marginTop: 4 }}>
                      {tc.preconditions.map((p, idx) => (
                        <li key={idx} style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: '1.7' }}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {tc.steps && tc.steps.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong style={{ color: '#93c5fd', fontSize: '15px' }}>Steps:</strong>
                    <ol style={{ marginTop: 4 }}>
                      {tc.steps.map((s, idx) => (
                        <li key={idx} style={{ color: '#e2e8f0', fontSize: '15px', lineHeight: '1.7', marginBottom: '4px' }}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {tc.expected_result && (
                  <div style={{ marginTop: 8 }}>
                    <strong style={{ color: '#93c5fd', fontSize: '15px' }}>Expected result:</strong>
                    <div style={{ color: '#a7f3d0', fontSize: '15px', lineHeight: '1.7', marginTop: '4px', padding: '8px', background: 'rgba(16, 185, 129, 0.2)', borderLeft: '3px solid #34d399', borderRadius: '4px' }}>{tc.expected_result}</div>
                  </div>
                )}
                {tc.priority && (
                  <div style={{ marginTop: 8, fontSize: 14 }}><strong style={{ color: '#93c5fd' }}>Priority:</strong> <span style={{ color: '#e2e8f0' }}>{tc.priority}</span></div>
                )}
              </div>
              <div className="controls">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 12px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', transition: 'all 0.2s' }}>
                  <input 
                    type="checkbox" 
                    checked={!!selected[i]} 
                    onChange={() => setSelected(prev => ({...prev, [i]: !prev[i]}))} 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      cursor: 'pointer',
                      accentColor: '#3b82f6'
                    }}
                  />
                  <span style={{ fontSize: 14, color: '#e2e8f0', fontWeight: '500' }}>Auswählen</span>
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
