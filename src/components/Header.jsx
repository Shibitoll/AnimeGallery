import React from 'react';

/**
 * Компонент верхньої панелі (Header) застосунку.
 * * Містить логотип та систему навігації по вкладках. Відображає динамічні лічильники
 * для категорій "Улюблені" та "Переглянуті", а також керує станом активної вкладки.
 * * @component
 * @param {Object} props - Властивості компонента.
 * @param {number} props.favoriteCount - Кількість аніме, доданих в обране.
 * @param {number} props.watchedCount - Кількість переглянутих аніме.
 * @param {string} props.currentTab - Назва поточної активної вкладки ('home', 'popular', 'favorite', 'watched', 'my-anime').
 * @param {Function} props.setCurrentTab - Функція для зміни активної вкладки в головному стані App.
 */
const Header = ({ favoriteCount, watchedCount, currentTab, setCurrentTab }) => {
    
    /**
     * Обробник кліку по посиланнях навігації.
     * Запобігає стандартній поведінці браузера (перезавантаженню сторінки) 
     * та перемикає вкладку.
     * * @function handleNavClick
     * @memberof Header
     * @inner
     * @param {React.MouseEvent} e - Подія кліку миші.
     * @param {string} tabName - Назва вкладки, на яку здійснюється перехід.
     */
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