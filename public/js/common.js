const API_BASE = 'http://localhost:3000/api';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.role) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

function showSuccess(elementId, message) {
    const successDiv = document.getElementById(elementId);
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.classList.add('show');
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 5000);
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function getDate15DaysLater() {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return formatDate(date);
}

function getTodayDate() {
    return formatDate(new Date());
}

