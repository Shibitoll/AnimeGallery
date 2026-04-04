import React from 'react';
import { Card } from '../components/ui';

const About = () => (
  <div className="page-container">
    <Card>
      <h2>Вітаємо в AnimeGallery!</h2>
      <p>
        Ваш персональний простір для відстеження улюблених історій. Ми поєднали зручність локального списку 
        з потужністю глобальної бази даних аніме.
      </p>
      <p>
        Наша місія — допомогти вам структурувати свій список переглядів та відкривати для себе 
        нові шедеври японської анімації в один клік.
      </p>
    </Card>
  </div>
);

export default About;