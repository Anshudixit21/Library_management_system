const API_BASE = 'http://localhost:3000/api';

function showLogin() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('showLoginBtn').classList.remove('btn-secondary');
    document.getElementById('showLoginBtn').classList.add('btn-primary');
    document.getElementById('showRegisterBtn').classList.remove('btn-primary');
    document.getElementById('showRegisterBtn').classList.add('btn-secondary');
    clearMessages();
}

function showRegister() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
    document.getElementById('showRegisterBtn').classList.remove('btn-secondary');
    document.getElementById('showRegisterBtn').classList.add('btn-primary');
    document.getElementById('showLoginBtn').classList.remove('btn-primary');
    document.getElementById('showLoginBtn').classList.add('btn-secondary');
    clearMessages();
}

function clearMessages() {
    document.getElementById('loginErrorMessage').classList.remove('show');
    document.getElementById('registerErrorMessage').classList.remove('show');
    document.getElementById('registerSuccessMessage').classList.remove('show');
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            if (data.user.role !== userType) {
                showLoginError('Invalid login type for this user');
                return;
            }
            
            if (data.user.role === 'admin') {
                window.location.href = 'admin-home.html';
            } else {
                window.location.href = 'user-home.html';
            }
        } else {
            showLoginError(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showLoginError('Network error. Please check if the server is running.');
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (!name || !email || !username || !password || !confirmPassword) {
        showRegisterError('All fields are required');
        return;
    }
    
    if (password.length < 6) {
        showRegisterError('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showRegisterError('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, name, email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showRegisterSuccess(data.message || 'Account created successfully! You can now login.');
            document.getElementById('registerForm').reset();
            
            setTimeout(() => {
                showLogin();
            }, 2000);
        } else {
            showRegisterError(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showRegisterError('Network error. Please try again.');
    }
});

function showLoginError(message) {
    const errorDiv = document.getElementById('loginErrorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

function showRegisterError(message) {
    const errorDiv = document.getElementById('registerErrorMessage');
    const successDiv = document.getElementById('registerSuccessMessage');
    if (errorDiv) {
        successDiv.classList.remove('show');
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

function showRegisterSuccess(message) {
    const errorDiv = document.getElementById('registerErrorMessage');
    const successDiv = document.getElementById('registerSuccessMessage');
    if (successDiv) {
        errorDiv.classList.remove('show');
        successDiv.textContent = message;
        successDiv.classList.add('show');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && user.role) {
        if (user.role === 'admin') {
            window.location.href = 'admin-home.html';
        } else {
            window.location.href = 'user-home.html';
        }
    }
});

