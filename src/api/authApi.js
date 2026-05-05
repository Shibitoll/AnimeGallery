// src/api/authApi.js

const BASE_URL = 'http://localhost:8000/api/users'; // Переконайся, що цей шлях збігається з твоїм urls.py

// Утиліти для роботи з токенами
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

// Реєстрація нового користувача
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
        throw new Error(errorData.detail || errorData.username?.[0] || 'Помилка реєстрації');
    }

    return await response.json();
};

// Вхід користувача (Отримання токенів)
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
    setTokens(data.access, data.refresh); // Зберігаємо JWT токени
    return data;
};