import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui';

const NotFound = () => (
  <div className="api-status-container">
    <Card>
      <h1>404</h1>
      <h2>Сторінку не знайдено</h2>
      <p>Схоже, ви заблукали в іншому вимірі.</p>
      <Link to="/" className="back-link">Повернутися на головну</Link>
    </Card>
  </div>
);

export default NotFound;