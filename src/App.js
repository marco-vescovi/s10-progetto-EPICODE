import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from './components/logometeo.png';

const Search = ({ setCity, searchWeather, handleCitySearch, matchingCities, handleCitySelect }) => (
  <div className="input-group mt-4">
    <input
      type="text"
      className="form-control"
      placeholder="Inserisci la città"
      onChange={(e) => setCity(e.target.value)}
      onFocus={handleCitySearch}
    />
    <div className="input-group-append">
      <button className="btn btn-primary" type="button" onClick={searchWeather}>
        Cerca
      </button>
    </div>
    {matchingCities.length > 0 && (
      <div className="dropdown mt-2">
        <button
          className="btn btn-secondary dropdown-toggle"
          type="button"
          id="cityDropdown"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Città Corrispondenti
        </button>
        <div className="dropdown-menu" aria-labelledby="cityDropdown">
          {matchingCities.map((city) => (
            <button
              key={city.id}
              className="dropdown-item"
              type="button"
              onClick={() => handleCitySelect(city)}
            >
              {city.name}, {city.sys.country}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

const Weather = ({ weather, handleAddToFavorites }) => (
  weather && (
    <div className="card mt-4">
      <div className="card-body">
        <h5 className="card-title">
          {weather.name}
          <button className="btn btn-outline-warning ml-2" onClick={() => handleAddToFavorites(weather)}>
            <i className="bi bi-star"></i> Aggiungi ai Preferiti
          </button>
        </h5>
        <p className="card-text">{weather.weather[0].description}</p>
        <p className="card-text">{Math.round(weather.main.temp - 273.15)}°C</p>
      </div>
    </div>
  )
);

const FavoritesPage = ({ favorites, handleRemoveFromFavorites, handleGoToHome }) => (
  <div className="mt-4">
    <h2>Preferiti</h2>
    <ul className="list-group">
      {favorites.map((city) => (
        <li key={city.id} className="list-group-item d-flex justify-content-between align-items-center">
          {city.name}
          <button className="btn btn-outline-danger" onClick={() => handleRemoveFromFavorites(city)}>
            Rimuovi
          </button>
        </li>
      ))}
    </ul>
  </div>
);


const App = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [weeklyForecast, setWeeklyForecast] = useState(null);
  const [matchingCities, setMatchingCities] = useState([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  const searchWeather = async () => {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=c886cddfe88aadccc844718bcf5a9b9f`);
      setWeather(response.data);
      setCity('');
      getWeeklyForecast();
    } catch (error) {
      console.error(error);
    }
  };

  const getWeeklyForecast = async () => {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&cnt=7&appid=c886cddfe88aadccc844718bcf5a9b9f`);
      setWeeklyForecast(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCitySearch = async () => {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/find?q=${city}&appid=c886cddfe88aadccc844718bcf5a9b9f`);
      setMatchingCities(response.data.list);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity.name);
    setMatchingCities([]);
  };

  const handleAddToFavorites = (cityToAdd) => {
    if (!favorites.find((city) => city.id === cityToAdd.id)) {
      const updatedFavorites = [...favorites, cityToAdd];
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
  };

  const handleRemoveFromFavorites = (cityToRemove) => {
    const updatedFavorites = favorites.filter((city) => city.id !== cityToRemove.id);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const handleGoToHome = () => {
    setWeather(null);
  };

  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <Link to="/" className="navbar-brand">
          App Meteo
        </Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/favorites" className="nav-link">
                Preferiti
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div className="container">
              <img src={logo} alt="Logo Meteo" className="d-block mx-auto mt-5" />
              <Search setCity={setCity} searchWeather={searchWeather} handleCitySearch={handleCitySearch} matchingCities={matchingCities} handleCitySelect={handleCitySelect} />
              {weeklyForecast && <WeeklyForecast forecast={weeklyForecast} />}
              <Weather weather={weather} handleAddToFavorites={handleAddToFavorites} />
            </div>
          }
        />
        <Route
          path="/favorites"
          element={<FavoritesPage favorites={favorites} handleRemoveFromFavorites={handleRemoveFromFavorites} handleGoToHome={handleGoToHome} />}
        />
      </Routes>
    </Router>
  );
};

const WeeklyForecast = ({ forecast }) => (
  <div className="mt-4">
    <h2>Previsioni Settimanali</h2>
    <ul className="list-group">
      {forecast.list.map((dailyForecast, index) => (
        <li key={index} className="list-group-item">
          Giorno {index + 1}: {Math.round(dailyForecast.main.temp - 273.15)}°C, {dailyForecast.weather[0].description}
        </li>
      ))}
    </ul>
  </div>
);

export default App;

//prova