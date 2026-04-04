import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui';

const Header = ({ favoriteCount, watchedCount,}) => {
    const { theme, toggleTheme } = useTheme();

    const navLinkClass = ({ isActive }) => 
        `nav-link ${isActive ? 'active' : ''}`;

    return (
        <header className="main-header">
            <div className="header-content">
                <div className="logo">AnimeGallery</div>
                <nav className="main-nav">
                    {/* Використовуємо спрощену логіку активності без setCurrentTab */}
                    <NavLink to="/" end className={navLinkClass}>
                        Головна
                    </NavLink>
                    
                    <NavLink to="/popular" className={navLinkClass}>
                        Популярні
                    </NavLink>

                    <NavLink to="/favorite" className={navLinkClass}>
                        Улюблені {favoriteCount > 0 && `(${favoriteCount})`}
                    </NavLink>

                    <NavLink to="/watched" className={navLinkClass}>
                        Переглянуті {watchedCount > 0 && `(${watchedCount})`}
                    </NavLink>

                    <NavLink to="/my-anime" className={navLinkClass}>
                        + Мої аніме
                    </NavLink>

                    <NavLink to="/about" className={navLinkClass}>
                        Про застосунок
                    </NavLink>

                    {/* Замінюємо звичайну кнопку на UI-компонент Button */}
                    <Button 
                        onClick={toggleTheme} 
                        variant="secondary" 
                        className="theme-toggle-btn"
                        title="Змінити тему"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </Button>
                </nav>   
            </div>
        </header>
    );
};

export default Header;