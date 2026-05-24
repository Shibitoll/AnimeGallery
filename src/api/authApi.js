// src/api/authApi.js

const BASE_URL = 'http://localhost:8000/api/users';

export const setTokens = (access, refresh) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
};

export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

export const registerUser = async (username, email, password) => {
    const response = await fetch(`${BASE_URL}/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.username) {
            const msg = errorData.username[0];
            if (msg.includes('already exists') || msg.includes('вже існує')) {
                throw new Error('Користувач з таким нікнеймом вже існує.');
            }
            throw new Error(msg);
        }
        
        if (errorData.email) {
            const msg = errorData.email[0];
            if (msg.includes('already exists') || msg.includes('вже існує')) {
                throw new Error('Користувач з такою поштою вже існує.');
            }
            throw new Error(msg);
        }

        throw new Error(errorData.detail || 'Помилка під час реєстрації.');
    }

    return await response.json();
};

export const loginUser = async (username, password) => {
    const response = await fetch(`${BASE_URL}/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error('Невірний логін або пароль');
    }

    const data = await response.json();
    setTokens(data.access, data.refresh);
    return data;
};