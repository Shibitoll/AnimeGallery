import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui';

/**
 * Компонент верхньої панелі (Header) застосунку.
 * * Містить логотип та систему навігації. Відображає динамічні лічильники
 * для категорій "Улюблені" та "Переглянуті", керує станом активної вкладки
 * через синхронізацію з Main та перемикає тему оформлення.
 * * @component
 * @param {Object} props - Властивості компонента.
 * @param {number} props.favoriteCount - Кількість аніме в обраному.
 * @param {number} props.watchedCount - Кількість переглянутих аніме.
 * @param {string} props.currentTab - ID поточної активної вкладки.
 * @param {Function} props.setCurrentTab - Функція для зміни активної вкладки.
 */
const Header = ({ favoriteCount, watchedCount, currentTab, setCurrentTab }) => {
    const { theme, toggleTheme } = useTheme();

    /**
     * Функція для визначення класів NavLink.
     * Додає клас 'active' автоматично при збігу маршруту або стану currentTab.
     */
    const navLinkClass = ({ isActive }) => 
        `nav-link ${isActive || (currentTab && isActive) ? 'active' : ''}`;

    /**
     * Обробник кліку по посиланнях навігації.
     * Оновлює стан для коректної фільтрації контенту в компоненті Main.
     */
    const handleNavClick = (tabName) => {
        if (setCurrentTab) {
            setCurrentTab(tabName);
        }
    };

    return (
        <header className="main-header">
            <div className="header-content">
                <div className="logo">AnimeGallery</div>
                <nav className="main-nav">
                    <NavLink 
                        to="/" 
                        end 
                        className={navLinkClass} 
                        onClick={() => handleNavClick('home')}
                    >
                        Головна
                    </NavLink>
                    
                    <NavLink 
                        to="/popular" 
                        className={navLinkClass} 
                        onClick={() => handleNavClick('popular')}
                    >
                        Популярні
                    </NavLink>

                    <NavLink 
                        to="/favorite" 
                        className={navLinkClass} 
                        onClick={() => handleNavClick('favorite')}
                    >
                        Улюблені {favoriteCount > 0 && `(${favoriteCount})`}
                    </NavLink>

                    <NavLink 
                        to="/watched" 
                        className={navLinkClass} 
                        onClick={() => handleNavClick('watched')}
                    >
                        Переглянуті {watchedCount > 0 && `(${watchedCount})`}
                    </NavLink>

                    <NavLink 
                        to="/my-anime" 
                        className={navLinkClass} 
                        onClick={() => handleNavClick('my-anime')}
                    >
                        + Мої аніме
                    </NavLink>

                    <NavLink 
                        to="/about" 
                        className={navLinkClass} 
                        onClick={() => handleNavClick('')}
                    >
                        Про застосунок
                    </NavLink>

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