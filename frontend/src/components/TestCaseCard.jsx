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
        <h3 style={styles.title}>
          <span style={styles.index}>#{index + 1}</span> {testCase.title}
        </h3>
        <span
          style={{
            ...styles.priority,
            backgroundColor: getPriorityColor(testCase.priority),
          }}
        >
          {testCase.priority}
        </span>
      </div>

      <p style={styles.description}>{testCase.description}</p>

      {testCase.preconditions && testCase.preconditions.length > 0 && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>Preconditions</h4>
          <ul style={styles.list}>
            {testCase.preconditions.map((precondition, idx) => (
              <li key={idx} style={styles.listItem}>
                {precondition}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Steps</h4>
        <ol style={styles.list}>
          {testCase.steps.map((step, idx) => (
            <li key={idx} style={styles.listItem}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Expected Result</h4>
        <p style={styles.expectedResult}>{testCase.expected_result}</p>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  title: {
    margin: '0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  index: {
    color: '#6b7280',
    fontWeight: 'normal',
    marginRight: '8px',
  },
  priority: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
    marginLeft: '12px',
  },
  description: {
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  section: {
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    marginTop: '0',
  },
  list: {
    margin: '0',
    paddingLeft: '24px',
    color: '#4b5563',
    fontSize: '14px',
  },
  listItem: {
    marginBottom: '4px',
    lineHeight: '1.5',
  },
  expectedResult: {
    margin: '0',
    padding: '12px',
    backgroundColor: '#f0fdf4',
    borderLeft: '3px solid #10b981',
    borderRadius: '4px',
    color: '#047857',
    fontSize: '14px',
    lineHeight: '1.5',
  },
};

export default TestCaseCard;
