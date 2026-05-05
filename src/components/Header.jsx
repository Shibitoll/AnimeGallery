import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header = ({ favoriteCount, watchingCount, watchedCount, plannedCount, currentTab, setCurrentTab, isAuthenticated, onLogout, userName }) => {
    const { theme, toggleTheme } = useTheme();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Стан для живого пошуку
    const [searchInput, setSearchInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchInput.trim().length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            setShowSuggestions(true);
            try {
                const response = await fetch(`http://localhost:8000/api/streaming/search/?q=${encodeURIComponent(searchInput.trim())}`);
                const data = await response.json();
                if (data.results) {
                    setSuggestions(data.results.slice(0, 5)); 
                }
            } catch (error) {
                console.error("Помилка живого пошуку:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchInput]);

    const navLinkClass = ({ isActive }) => 
        `nav-link ${isActive || (currentTab && isActive) ? 'active' : ''}`;

    const handleNavClick = (tabName) => {
        if (setCurrentTab) setCurrentTab(tabName);
        setIsDropdownOpen(false);
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
            setCurrentTab('search');
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (animeId) => {
        navigate(`/anime/${animeId}`);
        setSearchInput('');
        setShowSuggestions(false);
    };
    
    // ДОДАНО: Логіка для виходу
    const handleUserLogout = () => {
        setIsDropdownOpen(false);
        if (onLogout) onLogout();
    };

    return (
        <header className="main-header">
            <div className="header-container">
                
                <Link to="/" className="logo" onClick={() => handleNavClick('home')}>
                    <span className="logo-icon">⛩️</span>
                    Anime<span className="logo-highlight">Gallery</span>
                </Link>

                <nav className="main-nav">
                    <NavLink to="/" end className={navLinkClass} onClick={() => handleNavClick('home')}>
                        Головна
                    </NavLink>
                    <NavLink to="/popular" className={navLinkClass} onClick={() => handleNavClick('popular')}>
                        Популярні
                    </NavLink>
                    <NavLink to="/new" className={navLinkClass} onClick={() => handleNavClick('new')}>
                        Новинки
                    </NavLink>
                </nav>

                <div className="header-actions">
                    
                    {/* БЛОК ПОШУКУ */}
                    <div className="search-container" ref={searchRef}>
                        <form className="search-form" onSubmit={handleSearchSubmit}>
                            <input 
                                type="text" 
                                placeholder="Знайти аніме..." 
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onFocus={() => searchInput.trim().length >= 3 && setShowSuggestions(true)}
                                className="search-input"
                            />
                            <button type="submit" className="search-btn">🔍</button>
                        </form>

                        {/* ВИПАДАЮЧИЙ СПИСОК ПІДКАЗОК */}
                        {showSuggestions && searchInput.trim().length >= 3 && (
                            <div className="suggestions-dropdown">
                                {isSearching ? (
                                    <div className="suggestions-loading">Шукаємо... ⏳</div>
                                ) : suggestions.length > 0 ? (
                                    <>
                                        {suggestions.map(anime => (
                                            <div 
                                                key={anime.id} 
                                                className="suggestion-item"
                                                onClick={() => handleSuggestionClick(anime.id)}
                                            >
                                                <img 
                                                    src={anime.image || 'https://via.placeholder.com/40x60?text=No+Image'} 
                                                    alt={anime.title} 
                                                    className="suggestion-img"
                                                />
                                                <div className="suggestion-info">
                                                    <span className="suggestion-title">{anime.title}</span>
                                                    <span className="suggestion-meta">
                                                        {anime.year} • ★ {anime.rating ? parseFloat(anime.rating).toFixed(1) : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <button className="suggestion-view-all" onClick={handleSearchSubmit}>
                                            Всі результати для "{searchInput}" &rarr;
                                        </button>
                                    </>
                                ) : (
                                    <div className="suggestions-empty">Нічого не знайдено 😔</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ДОДАНО: Перевірка авторизації */}
                    {isAuthenticated ? (
                        <>
                            <NavLink 
                                to="/my-anime" 
                                className={`add-anime-btn ${currentTab === 'my-anime' ? 'active' : ''}`}
                                onClick={() => handleNavClick('my-anime')}
                            >
                                + Мої аніме
                            </NavLink>

                            <div className="user-menu-container" ref={dropdownRef}>
                                <button 
                                    className={`user-profile-btn ${isDropdownOpen ? 'active' : ''}`}
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName || 'User'}`} alt="Avatar" className="user-avatar" />
                                    {/* ‼️ ТУТ ТЕПЕР ВІДОБРАЖАЄТЬСЯ ІМ'Я КОРИСТУВАЧА ‼️ */}
                                    <span className="user-name">{userName || 'Мій профіль'}</span>
                                    <span className="dropdown-arrow">▼</span>
                                </button>

                                <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                                    <div className="dropdown-header">
                                        <NavLink to="/profile" className="dropdown-item" onClick={() => handleNavClick('profile')}>
                                            <span className="item-icon">👤</span> Мій профіль
                                         </NavLink>
                                    </div>
                                    
                                    <div className="dropdown-divider"></div>

                                    <NavLink to="/favorite" className="dropdown-item" onClick={() => handleNavClick('favorite')}>
                                        <span className="item-icon">❤️</span> 
                                        Улюблені {favoriteCount > 0 && <span className="badge">{favoriteCount}</span>}
                                    </NavLink>
                                    <NavLink to="/watched" className="dropdown-item" onClick={() => handleNavClick('watched')}>
                                        <span className="item-icon">✅</span> 
                                        Переглянуто {watchedCount > 0 && <span className="badge">{watchedCount}</span>}
                                    </NavLink>
                                    <NavLink to="/watching" className="dropdown-item" onClick={() => handleNavClick('watching')}>
                                        <span className="item-icon">▶️</span> 
                                        Дивлюся {watchingCount > 0 && <span className="badge blue">{watchingCount}</span>}
                                    </NavLink>
                                    <NavLink to="/planned" className="dropdown-item" onClick={() => handleNavClick('planned')}>
                                        <span className="item-icon">📅</span> 
                                        В планах {plannedCount > 0 && <span className="badge blue">{plannedCount}</span>}
                                    </NavLink>
                                    
                                    <div className="dropdown-divider"></div>

                                    <NavLink to="/about" className="dropdown-item" onClick={() => handleNavClick('about')}>
                                        <span className="item-icon">ℹ️</span> Про застосунок
                                    </NavLink>
                                    
                                    <button className="dropdown-item theme-toggle-btn" onClick={toggleTheme}>
                                        <span className="item-icon">{theme === 'light' ? '🌙' : '☀️'}</span> 
                                        {theme === 'light' ? 'Нічна тема' : 'Світла тема'}
                                    </button>

                                    <div className="dropdown-divider"></div>

                                    <button className="dropdown-item logout-btn" onClick={handleUserLogout}>
                                        <span className="item-icon">🚪</span> Вийти з акаунта
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <button className="login-btn" onClick={() => { navigate('/login'); setCurrentTab(''); }}>Увійти</button>
                            <button className="register-btn" onClick={() => { navigate('/register'); setCurrentTab(''); }}>Реєстрація</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;