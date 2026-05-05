import React, { useState } from 'react';
import { registerUser } from '../api/authApi';
import '../styles/AuthForms.css';

const Register = ({ onNavigate }) => {
    // ДОДАНО confirmPassword в стан
    const [formData, setFormData] = useState({ 
        username: '', 
        email: '', 
        password: '', 
        confirmPassword: '' 
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // ПЕРЕВІРКА ПАРОЛІВ
        if (formData.password !== formData.confirmPassword) {
            setError('Паролі не співпадають!');
            return;
        }

        setIsLoading(true);

        try {
            await registerUser(formData.username, formData.email, formData.password);
            alert('Реєстрація успішна! Тепер ви можете увійти.');
            onNavigate('login');
        } catch (err) {
            setError(err.message || 'Помилка під час реєстрації.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-panel">
                <h2 className="auth-title">Створити акаунт</h2>
                
                {error && <div className="auth-error">{error}</div>}
                
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label>Нікнейм</label>
                        <input 
                            type="text" 
                            name="username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            required 
                            placeholder="Ваш логін"
                        />
                    </div>
                    
                    <div className="auth-field">
                        <label>Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            placeholder="ваша@пошта.com"
                        />
                    </div>
                    
                    <div className="auth-field">
                        <label>Пароль</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            placeholder="Мінімум 8 символів"
                            minLength="8"
                        />
                    </div>

                    {/* ДОДАНО ПОЛЕ ПІДТВЕРДЖЕННЯ ПАРОЛЯ */}
                    <div className="auth-field">
                        <label>Підтвердження пароля</label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            value={formData.confirmPassword} 
                            onChange={handleChange} 
                            required 
                            placeholder="Повторіть пароль"
                            minLength="8"
                        />
                    </div>
                    
                    <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                        {isLoading ? 'Створення акаунта...' : 'Зареєструватися'}
                    </button>
                </form>
                
                <p className="auth-switch-text">
                    Вже маєте акаунт?{' '}
                    <span className="auth-switch-link" onClick={() => onNavigate('login')}>
                        Увійти
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Register;