import React from 'react';

const Header = ({ favoriteCount, watchedCount }) => {
    return (
        <header className="main-header">
            <div className="header-content">
                <div className="logo">
                    AnimeGallery
                </div>
                <nav className="main-nav">
                    <a href="/" className="nav-link active">Головна</a>
                    <a href="/top" className="nav-link">Популярні</a>
                    <a href="/favorite" className="nav-link">
                        Улюблені {favoriteCount > 0 && `(${favoriteCount})`}
                    </a>                    
                    <a href="/watchlist" className="nav-link">
                        Переглянуті {watchedCount > 0 && `(${watchedCount})`}
                    </a>
                </nav>   
            </div>
        </header>
    );
};

export default Header;