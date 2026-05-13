import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { streamingApi } from '../api/streamingApi'; 

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

    // БЕЗПЕЧНИЙ ЖИВИЙ ПОШУК ЧЕРЕЗ ПРОКСІ
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
                // Використовуємо оновлений, надійний API-клієнт
                const response = await streamingApi.searchAnime(searchInput.trim());
                
                // Гнучке парсування результатів (на випадок змін у бекенді)
                const items = response?.items || response?.results || (Array.isArray(response) ? response : []);
                setSuggestions(items.slice(0, 5)); 
            } catch (error) {
                console.error("Помилка живого пошуку в хедері:", error);
                setSuggestions([]); // Якщо помилка - просто показуємо, що нічого не знайдено, без крашу
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
            if (setCurrentTab) setCurrentTab('search');
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (animeId) => {
        navigate(`/anime/${animeId}`);
        setSearchInput('');
        setShowSuggestions(false);
    };
    
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
                    {/* БЛОК ПОШУКУ */}
                    <div className="search-container" ref={searchRef} style={{ position: 'relative' }}>
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
                            <div className="suggestions-dropdown" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', zIndex: 1000, marginTop: '8px', background: 'var(--surface-card, #1e293b)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                                {isSearching ? (
                                    <div className="suggestions-loading">Шукаємо... ⏳</div>
                                ) : suggestions.length > 0 ? (
                                    <>
                                        {suggestions.map(anime => {
                                            const displayTitle = anime.title_ukrainian || anime.title_english || anime.title_original || anime.title;
                                            const poster = anime.poster_url || anime.image || anime.poster;
                                            
                                            return (
                                                <div 
                                                    key={`header-sugg-${anime.id}`} 
                                                    className="suggestion-item"
                                                    onClick={() => handleSuggestionClick(anime.id)}
                                                >
                                                    <img 
                                                        src={poster || 'https://via.placeholder.com/40x60?text=No+Image'} 
                                                        alt={displayTitle} 
                                                        className="suggestion-img"
                                                    />
                                                    <div className="suggestion-info">
                                                        <span className="suggestion-title">{displayTitle}</span>
                                                        <span className="suggestion-meta">
                                                            {anime.year || 'N/A'} • ★ {anime.rating ? parseFloat(anime.rating).toFixed(1) : '0.0'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
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

                    {/* БЛОК АВТОРИЗАЦІЇ */}
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
                            <button className="login-btn" onClick={() => { navigate('/login'); if(setCurrentTab) setCurrentTab(''); }}>Увійти</button>
                            <button className="register-btn" onClick={() => { navigate('/register'); if(setCurrentTab) setCurrentTab(''); }}>Реєстрація</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;