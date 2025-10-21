import React from 'react';


const TestCaseCard = ({ testCase, index }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#dc2626';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={styles.index} title="Testfall-Nummer">{typeof index === 'number' ? `#${index + 1}` : ''}</span>
          <span style={styles.title}>{testCase.title}</span>
        </div>
        <span
          style={{
            ...styles.priority,
            backgroundColor: getPriorityColor(testCase.priority),
          }}
          title="Priorität"
        >
          {testCase.priority ? <span style={{ fontWeight: 700 }}>{testCase.priority}</span> : '–'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
        {testCase.user_story && (
          <span style={{ fontSize: 13, color: '#2563eb', background: '#eff6ff', borderRadius: 4, padding: '2px 8px' }} title="User Story">📝 {testCase.user_story}</span>
        )}
        {testCase.status && (
          <span style={{ fontSize: 13, color: '#7c3aed', background: '#ede9fe', borderRadius: 4, padding: '2px 8px' }} title="Status">📋 {testCase.status}</span>
        )}
        {testCase.source && (
          <span style={{ fontSize: 13, color: '#0d9488', background: '#ccfbf1', borderRadius: 4, padding: '2px 8px' }} title="Quelle">🔗 {testCase.source}</span>
        )}
      </div>

      {testCase.description && (
        <p style={styles.description}>{testCase.description}</p>
      )}

      {testCase.preconditions && testCase.preconditions.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Vorbedingungen</h4>
          <ul style={styles.list}>
            {testCase.preconditions.map((precondition, idx) => (
              <li key={idx} style={styles.listItem}>
                {precondition}
              </li>
            ))}
          </ul>
        </div>
      )}

      {testCase.steps && testCase.steps.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Schritte</h4>
          <ol style={styles.list}>
            {testCase.steps.map((step, idx) => (
              <li key={idx} style={styles.listItem}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {testCase.expected_result && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Erwartetes Ergebnis</h4>
          <p style={styles.expectedResult}>{testCase.expected_result}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '18px 20px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.07)',
    border: '1px solid #e5e7eb',
    transition: 'box-shadow 0.2s',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    gap: '8px',
  },
  title: {
    margin: '0',
    fontSize: '17px',
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    lineHeight: '1.3',
    wordBreak: 'break-word',
  },
  index: {
    color: '#64748b',
    fontWeight: 'bold',
    marginRight: '8px',
    fontSize: '15px',
    minWidth: '32px',
    textAlign: 'right',
    letterSpacing: '0.5px',
  },
  priority: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
    marginLeft: '12px',
    minWidth: '60px',
    textAlign: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  description: {
    color: '#334155',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '14px',
    marginTop: 0,
  },
  section: {
    marginBottom: '14px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: '6px',
    marginTop: '0',
    letterSpacing: '0.2px',
  },
  list: {
    margin: '0',
    paddingLeft: '24px',
    color: '#334155',
    fontSize: '14px',
  },
  listItem: {
    marginBottom: '3px',
    lineHeight: '1.5',
  },
  expectedResult: {
    margin: '0',
    padding: '10px',
    backgroundColor: '#f0fdf4',
    borderLeft: '3px solid #10b981',
    borderRadius: '4px',
    color: '#047857',
    fontSize: '14px',
    lineHeight: '1.5',
  },
};

export default TestCaseCard;
