import React from 'react';

const Header = ({ favoriteCount, watchedCount, currentTab, setCurrentTab }) => {
    
    const handleNavClick = (e, tabName) => {
        e.preventDefault();
        setCurrentTab(tabName);
    };

    return (
        <header className="main-header">
            <div className="header-content">
                <div className="logo">
                    AnimeGallery
                </div>
                <nav className="main-nav">
                    <a href="#home" 
                       className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
                       onClick={(e) => handleNavClick(e, 'home')}>
                        Головна
                    </a>
                    
                    <a href="#popular" 
                       className={`nav-link ${currentTab === 'popular' ? 'active' : ''}`}
                       onClick={(e) => handleNavClick(e, 'popular')}>
                        Популярні
                    </a>
                    
                    <a href="#favorite" 
                       className={`nav-link ${currentTab === 'favorite' ? 'active' : ''}`}
                       onClick={(e) => handleNavClick(e, 'favorite')}>
                        Улюблені {favoriteCount > 0 && `(${favoriteCount})`}
                    </a>                    
                    
                    <a href="#watched" 
                       className={`nav-link ${currentTab === 'watched' ? 'active' : ''}`}
                       onClick={(e) => handleNavClick(e, 'watched')}>
                        Переглянуті {watchedCount > 0 && `(${watchedCount})`}
                    </a>

                    <a href="#my-anime" 
                        className={`nav-link ${currentTab === 'my-anime' ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, 'my-anime')}
                    >
                            + Мої аніме
                    </a>
                </nav>   
            </div>
        </header>
    );
};

export default Header;