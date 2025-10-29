import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

export async function generateTestCases(userStory, numTestCases = 5) {
  const payload = { user_story: userStory, num_test_cases: numTestCases };
  const resp = await api.post(`/generate-test-cases`, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });
  return resp.data;
}

export async function adoptTestCases(userStory, numTestCases = 5, project = "default", testCases = null) {
  const payload = {
    user_story: userStory,
    num_test_cases: numTestCases,
  };
  if (testCases) payload.test_cases = testCases;

  const resp = await api.post(`/adopt-test-cases?project=${encodeURIComponent(project)}`, JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });
  return resp.data;
}

export async function getStaging() {
  const resp = await api.get(`/staging`);
  return resp.data;
}

export async function postStaging(testCases) {
  const payload = { test_cases: testCases };
  const resp = await api.post(`/staging`, JSON.stringify(payload), { headers: { "Content-Type": "application/json" } });
  return resp.data;
}

export async function putStaging(testCases) {
  const payload = { test_cases: testCases };
  const resp = await api.put(`/staging`, JSON.stringify(payload), { headers: { "Content-Type": "application/json" } });
  return resp.data;
}

export async function clearStaging() {
  const resp = await api.delete(`/staging`);
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

export async function exportTestcasesCsvWithFormat(project, usFolder, format = 'generic') {
  const resp = await api.get(`/projects/${encodeURIComponent(project)}/${encodeURIComponent(usFolder)}/export/csv?format=${encodeURIComponent(format)}`);
  return resp.data;
}

// Save a provided subset of test cases into a specific project/user-story folder
// Body matches backend route `/projects/{project}/{us}/adopt-selected`
export async function adoptSelectedToProject(project, usFolder, testCases, userStoryText = null) {
  const payload = { test_cases: testCases };
  if (userStoryText) payload.user_story = userStoryText;
  const resp = await api.post(
    `/projects/${encodeURIComponent(project)}/${encodeURIComponent(usFolder)}/adopt-selected`,
    JSON.stringify(payload),
    { headers: { "Content-Type": "application/json" } }
  );
  return resp.data;
}

// Attach helper functions to the default axios instance so existing components
// that import the default `api` object can call helper methods like
// `api.getStaging()` or `api.deleteUserStory()`.
api.generateTestCases = generateTestCases;
api.adoptTestCases = adoptTestCases;
api.getStaging = getStaging;
api.postStaging = postStaging;
api.putStaging = putStaging;
api.clearStaging = clearStaging;
api.healthCheck = healthCheck;
api.deleteUserStory = deleteUserStory;
api.exportTestcasesCsv = exportTestcasesCsv;
api.exportTestcasesCsvWithFormat = exportTestcasesCsvWithFormat;
api.adoptSelectedToProject = adoptSelectedToProject;

export default api;
