import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateTestCases = async (userStory, numTestCases = 5) => {
  try {
    const response = await api.post('/generate-test-cases', {
      user_story: userStory,
      num_test_cases: numTestCases,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating test cases:', error);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default api;
