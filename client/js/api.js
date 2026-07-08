class API {
    constructor() {
        this.baseURL = '/api';
        this.accessToken = localStorage.getItem('accessToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = { ...options.headers };
        
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        
        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            
            if (response.status === 401 && this.accessToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    headers['Authorization'] = `Bearer ${this.accessToken}`;
                    const retryResponse = await fetch(url, { ...options, headers });
                    return this.handleResponse(retryResponse);
                }
            }
            
            return this.handleResponse(response);
        } catch (error) {
            throw new Error(`Network error: ${error.message}`);
        }
    }

    async handleResponse(response) {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        return data;
    }

    async refreshAccessToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            this.logout();
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.setTokens(data.data.accessToken, data.data.refreshToken);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        this.logout();
        return false;
    }

    setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
    }

    logout() {
        localStorage.clear();
        window.location.href = '/views/login.html';
    }

    
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return data;
    }

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return data;
    }

    
    async getProfile() {
        return await this.request('/users/profile');
    }

    async updateProfile(data) {
        return await this.request('/users/profile', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async uploadAvatar(formData) {
        return await this.request('/users/avatar', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async getUserStats() {
        return await this.request('/users/stats');
    }

    async getNotifications() {
        return await this.request('/users/notifications');
    }

    async markNotificationRead(id) {
        return await this.request(`/users/notifications/${id}/read`, {
            method: 'PATCH'
        });
    }

    async getAllUsers() {
        return await this.request('/users');
    }

    
    async getAllCohorts(search = '') {
        const query = search ? `?search=${encodeURIComponent(search)}` : '';
        return await this.request(`/cohorts${query}`);
    }

    async getMyCohorts() {
        return await this.request('/cohorts/my-cohorts');
    }

    async getCohort(id) {
        return await this.request(`/cohorts/${id}`);
    }

    async enrollInCohort(id) {
        return await this.request(`/cohorts/${id}/enroll`, {
            method: 'POST'
        });
    }

    
    async getModules(cohortId) {
        return await this.request(`/modules/cohort/${cohortId}`);
    }

    async getModule(id) {
        return await this.request(`/modules/${id}`);
    }

    
    async getQuiz(moduleId) {
        return await this.request(`/quizzes/module/${moduleId}`);
    }

    async submitQuiz(id, answers) {
        return await this.request(`/quizzes/${id}/submit`, {
            method: 'POST',
            body: JSON.stringify({ answers })
        });
    }

    
    async createContentBlock(moduleId, data) {
        return await this.request(`/modules/${moduleId}/content`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async deleteContentBlock(blockId) {
        return await this.request(`/modules/content/${blockId}`, {
            method: 'DELETE'
        });
    }
    
    async getCertificates() {
        return await this.request('/certificates');
    }

    
async getCertificatePDF(id) {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Please log in first');
        }

        const response = await fetch(`${this.baseURL}/certificates/${id}/pdf`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        });

        if (!response.ok) {
            let errorMessage = 'Failed to download certificate';
            try {
                const data = await response.json();
                errorMessage = data.message || errorMessage;
            } catch (e) {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }

        
        const blob = await response.blob();
        
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 100);
        
        return true;
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
}

    
    async getDiscussions(cohortId) {
        return await this.request(`/discussions/cohort/${cohortId}`);
    }

    async createDiscussion(cohortId, data) {
        return await this.request(`/discussions/cohort/${cohortId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async addReply(discussionId, content) {
        return await this.request(`/discussions/${discussionId}/reply`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    }

    
    async getAnnouncements(cohortId) {
        return await this.request(`/announcements/cohort/${cohortId}`);
    }

    async updateUserRole(userId, role) {
        return await this.request(`/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role })
        });
    }

    async toggleUserStatus(userId) {
        return await this.request(`/users/${userId}/toggle-status`, {
            method: 'PATCH'
        });
    }

    async deleteUser(userId) {
        return await this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }

    async createCohort(data) {
        return await this.request('/cohorts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async deleteCohort(id) {
        return await this.request(`/cohorts/${id}`, {
            method: 'DELETE'
        });
    }
}

const api = new API();


window.showToast = function(icon, title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        
        const newContainer = document.createElement('div');
        newContainer.id = 'toastContainer';
        newContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; max-width: 400px; width: 100%;';
        document.body.appendChild(newContainer);
    }
    
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    
    const id = 'toast-' + Date.now();
    toast.id = id;
    
    toast.innerHTML = `
        <span style="font-size: 1.5rem;">${icon}</span>
        <div style="flex: 1;">
            <strong style="display: block;">${title}</strong>
            <span style="font-size: 0.9rem;">${message}</span>
        </div>
        <button class="toast-close" onclick="dismissToast('${id}')">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    
    setTimeout(() => {
        dismissToast(id);
    }, 5000);
};

window.dismissToast = function(id) {
    const toast = document.getElementById(id);
    if (toast) {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
};