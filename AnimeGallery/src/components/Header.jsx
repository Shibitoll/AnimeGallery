import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = ({ favoriteCount, watchedCount, currentTab, setCurrentTab }) => {
    
    const handleNavClick = (tabName) => {
        setCurrentTab(tabName);
    };

    return (
        <header className="main-header">
            <div className="header-content">
                <div className="logo">AnimeGallery</div>
                <nav className="main-nav">
                    <NavLink 
                        to="/" 
                        end
                        className={({ isActive }) => `nav-link ${isActive && currentTab === 'home' ? 'active' : ''}`}
                        onClick={() => handleNavClick('home')}
                    >
                        Головна
                    </NavLink>
                    
                    <NavLink to="/popular" 
                        className={`nav-link ${currentTab === 'popular' ? 'active' : ''}`}
                        onClick={() => handleNavClick('popular')}>
                        Популярні
                    </NavLink>

                    <NavLink to="/favorite"
                        className={`nav-link ${currentTab === 'favorite' ? 'active' : ''}`}
                        onClick={() => handleNavClick('favorite')}>
                        Улюблені {favoriteCount > 0 && `(${favoriteCount})`}
                    </NavLink>

                    <NavLink to="/watched"
                        className={`nav-link ${currentTab === 'watched' ? 'active' : ''}`}
                        onClick={() => handleNavClick('watched')}>
                        Переглянуті {watchedCount > 0 && `(${watchedCount})`}
                    </NavLink>

                    <NavLink to="/my-anime"
                        className={`nav-link ${currentTab === 'my-anime' ? 'active' : ''}`}
                        onClick={() => handleNavClick('my-anime')}
                    >
                        + Мої аніме
                    </NavLink>

                    <NavLink 
                        to="/about" 
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setCurrentTab('')} // Скидаємо фільтр головної
                    >
                        Про застосунок
                    </NavLink>
                </nav>   
            </div>
        </header>
    );
};

export default Header;