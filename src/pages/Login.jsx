import React, { useState } from 'react';
import { loginUser } from '../api/authApi';
import '../styles/AuthForms.css';

const Login = ({ onNavigate, onLoginSuccess }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await loginUser(formData.username, formData.password);
            onLoginSuccess();
            onNavigate('home');
        } catch (err) {
            setError(err.message || 'Не вдалося увійти. Перевірте дані.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-panel">
                <h2 className="auth-title">Вхід в систему</h2>
                
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
                    
                    <div className="auth-field" style={{ position: 'relative' }}>
                        <label>Пароль</label>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            placeholder="Ваш пароль"
                            style={{ paddingRight: '40px' }}
                        />
                        <span 
                            onClick={() => setShowPassword(!showPassword)} 
                            style={{ position: 'absolute', right: '12px', top: '38px', cursor: 'pointer', userSelect: 'none' }}
                            title={showPassword ? "Приховати пароль" : "Показати пароль"}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </span>
                    </div>
                    
                    <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                        {isLoading ? 'Перевірка...' : 'Увійти'}
                    </button>
                </form>
                
                <p className="auth-switch-text">
                    Ще немає акаунта?{' '}
                    <span className="auth-switch-link" onClick={() => onNavigate('register')}>
                        Зареєструватися
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;