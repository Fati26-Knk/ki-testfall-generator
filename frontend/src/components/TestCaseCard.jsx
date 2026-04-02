import React from 'react';

const TestCaseCard = ({ testCase, index }) => {
  const theme = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme')
    : 'dark';
  const isLightTheme = theme === 'light';
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

  const cardStyle = {
    ...styles.card,
    backgroundColor: isLightTheme ? '#e5e7eb' : styles.card.backgroundColor,
    color: isLightTheme ? '#111827' : styles.card.color,
  };

  const titleStyle = {
    ...styles.title,
    color: isLightTheme ? '#111827' : styles.title.color,
  };

  const descriptionStyle = {
    ...styles.description,
    color: isLightTheme ? '#374151' : styles.description.color,
  };

  const listStyle = {
    ...styles.list,
    color: isLightTheme ? '#111827' : styles.list.color,
  };

  const expectedResultStyle = {
    ...styles.expectedResult,
    color: isLightTheme ? '#065f46' : styles.expectedResult.color,
    backgroundColor: isLightTheme ? '#d1fae5' : styles.expectedResult.backgroundColor,
  };

  const sectionTitleStyle = {
    ...styles.sectionTitle,
    color: isLightTheme ? '#1d4ed8' : styles.sectionTitle.color,
  };

  // Text: von welcher KI / welchem Modell erzeugt
  const rawProvider = testCase.llm_provider || (testCase.source ? String(testCase.source) : null);
  const metaProvider = rawProvider;
  const metaModel = testCase.llm_model;
  let llmMetaText = null;
  if (metaProvider && metaModel) {
    llmMetaText = `Erstellt von ${metaProvider} (${metaModel})`;
  } else if (metaProvider) {
    llmMetaText = `Erstellt von ${metaProvider}`;
  } else if (metaModel) {
    llmMetaText = `Erstellt mit Modell ${metaModel}`;
  }

  return (
    <div style={cardStyle}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
          <span style={styles.index} title="Testfall-Nummer">{typeof index === 'number' ? `#${index + 1}` : ''}</span>
          <span style={titleStyle}>{testCase.title}</span>
          {llmMetaText && (
            <span
              style={{
                fontSize: 12,
                color: isLightTheme ? '#6b7280' : '#9ca3af',
                fontStyle: 'italic',
                marginLeft: 4,
              }}
            >
              {llmMetaText}
            </span>
          )}
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

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
        {testCase.status && (
          <span
            style={{
              fontSize: 14,
              color: '#ddd6fe',
              background: 'rgba(139, 92, 246, 0.25)',
              borderRadius: 6,
              padding: '4px 12px',
              border: '1px solid rgba(139, 92, 246, 0.5)',
              fontWeight: '500',
            }}
            title="Status"
          >
            📋 {testCase.status}
          </span>
        )}
        {/* Quelle-Badge nur verwenden, wenn kein spezieller LLM-Hinweis existiert */}
        {testCase.source && !testCase.llm_provider && !testCase.llm_model && (
          <span
            style={{
              fontSize: 14,
              color: '#99f6e4',
              background: 'rgba(20, 184, 166, 0.25)',
              borderRadius: 6,
              padding: '4px 12px',
              border: '1px solid rgba(20, 184, 166, 0.5)',
              fontWeight: '500',
            }}
            title="Quelle"
          >
            🔗 {testCase.source}
          </span>
        )}
      </div>

      {testCase.description && (
        <p style={descriptionStyle}>{testCase.description}</p>
      )}

      {testCase.preconditions && testCase.preconditions.length > 0 && (
        <div style={styles.section}>
          <h4 style={sectionTitleStyle}>Vorbedingungen</h4>
          <ul style={listStyle}>
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
          <h4 style={sectionTitleStyle}>Schritte</h4>
          <ol style={listStyle}>
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
          <h4 style={sectionTitleStyle}>Erwartetes Ergebnis</h4>
          <p style={expectedResultStyle}>{testCase.expected_result}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '20px 24px',
    marginBottom: '16px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  index: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
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
    color: '#e2e8f0',
    fontSize: '15px',
    lineHeight: '1.7',
    marginBottom: '14px',
    marginTop: 0,
    fontWeight: '400',
  },
  section: {
    marginBottom: '14px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#93c5fd',
    marginBottom: '8px',
    marginTop: '0',
    letterSpacing: '0.3px',
  },
  list: {
    margin: '0',
    paddingLeft: '24px',
    color: '#e2e8f0',
    fontSize: '15px',
    lineHeight: '1.8',
  },
  listItem: {
    marginBottom: '6px',
    lineHeight: '1.8',
  },
  expectedResult: {
    margin: '0',
    padding: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderLeft: '4px solid #34d399',
    borderRadius: '6px',
    color: '#a7f3d0',
    fontSize: '15px',
    lineHeight: '1.7',
    fontWeight: '500',
  },
};

export default TestCaseCard;
