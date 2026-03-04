import React from 'react';

const Header = () => {
    return (
        <header className="main-header">
            <div className="header-content">
                <div className="logo">
                    AnimeGallery
                </div>
                <nav className="main-nav">
                    <a href="/" className="nav-link active">Головна</a>
                    <a href="/top" className="nav-link">Популярні</a>
                    <a href="/favorite" className="nav-link">Улюблені</a>                    
                    <a href="/watchlist" className="nav-link">Переглянуті</a>
                </nav>   
            </div>
        </header>
    );
};

export default Header;