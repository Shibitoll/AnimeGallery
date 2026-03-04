import React from 'react';
import { animeList } from './data/data';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import './styles/App.css';

function App() {
  return (
    <>
      <Header />
      <Main data={animeList} />
      <Footer />
    </>
  );
}

export default App;