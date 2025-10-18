import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export async function generateTestCases(userStory, numTestCases = 5) {
  const resp = await api.post(`/generate-test-cases`, {
    user_story: userStory,
    num_test_cases: numTestCases,
  });
  return resp.data;
}

export async function adoptTestCases(userStory, numTestCases = 5, project = "default", testCases = null) {
  const payload = {
    user_story: userStory,
    num_test_cases: numTestCases,
  };
  if (testCases) payload.test_cases = testCases;

  const resp = await api.post(`/adopt-test-cases?project=${encodeURIComponent(project)}`, payload);
  return resp.data;
}

export async function healthCheck() {
  const resp = await api.get(`/health`);
  return resp.data;
}

export async function deleteUserStory(project, usFolder) {
  const resp = await api.delete(`/projects/${encodeURIComponent(project)}/${encodeURIComponent(usFolder)}`);
  return resp.data;
}

export async function exportTestcasesCsv(project, usFolder) {
  const resp = await api.get(`/projects/${encodeURIComponent(project)}/${encodeURIComponent(usFolder)}/export/csv`);
  return resp.data; // will be CSV string
}

export default api;
