import React from 'react';

/**
 * Компонент підвалу (Footer) сторінки.
 * * Відображає інформацію про авторські права та назву проєкту 
 * у нижній частині інтерфейсу застосунку AnimeGallery.
 * * @component
 * @returns {JSX.Element} Елемент розмітки підвалу сайту.
 */
const Footer = () => {
  return (
    <footer className="app-footer">
      <p>© 2026 AnimeGallery. Усі права захищено.</p>
    </footer>
  );
};

export default Footer;