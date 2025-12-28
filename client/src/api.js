const API_URL = 'http://localhost:3000/api';

export const api = {
    async request(endpoint, method = 'GET', body = null, token = null) {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API Request Failed');
        }
        return data;
    },

    login: (username, password) => api.request('/auth/login', 'POST', { username, password }),
    register: (username, password, role) => api.request('/auth/register', 'POST', { username, password, role }),
    getJobs: () => api.request('/jobs'),
    postJob: (title, description, token) => api.request('/jobs', 'POST', { title, description }, token),
    apply: (jobId, resumeText, token) => api.request('/applications', 'POST', { jobId, resumeText }, token),
    getJobApplications: (jobId, token) => api.request(`/jobs/${jobId}/applications`, 'GET', null, token),
    getMyApplications: (token) => api.request('/my-applications', 'GET', null, token),
    updateApplicationStatus: (id, status, token) => api.request(`/applications/${id}/status`, 'PUT', { status }, token),
    getAdminActivity: (token) => api.request('/admin/activity', 'GET', null, token),
    getProfile: (userId, token) => api.request(`/profile/${userId}`, 'GET', null, token),
    updateProfile: (data, token) => api.request('/profile', 'POST', data, token),
    getEmployerReports: (token) => api.request('/employer/reports', 'GET', null, token),
};
