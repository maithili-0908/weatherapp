//src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; 

import { Routes, Route, Link } from "react-router-dom";
import Favorites from "./Favorites";

const apikey = process.env.REACT_APP_WEATHER_API_KEY;

function App() {
 const [suggestions, setSuggestions] = useState([]);
 const [uvIndex, setUvIndex] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const weatherType = weatherData?.weather?.[0]?.main;
  const [recentCities, setRecentCities] = useState(
  JSON.parse(localStorage.getItem("recentCities")) || []
);

  
  useEffect(() => {
  if (weatherType === "Rain") {
    document.body.classList.add("rainy");
  } else {
    document.body.classList.remove("rainy");
  }
}, [weatherType]);

 useEffect(() => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chennaiUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=Chennai&appid=${apikey}&units=metric`;

  fetchWeatherData(chennaiUrl);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const locationUrl =
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}&units=metric`;

        fetchWeatherData(locationUrl);
      }
    );
  }
}, []);
  
const fetchSuggestions = async (value) => {
  if (!value.trim()) {
    setSuggestions([]);
    return;
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${apikey}`
    );

    setSuggestions(response.data);
  } catch (err) {
    console.error(err);
  }
};
const fetchUVIndex = async (lat, lon) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apikey}`
    );

    setUvIndex(response.data.value);
  } catch (error) {
    console.log(error);
  }
};
  const fetchWeatherData = async (url) => {
    try {
      const response = await axios.get(url);
      const data = response.data;
      console.log(data);
      weatherReport(data);
      setWeatherData(data);
      fetchUVIndex(
  data.coord.lat,
  data.coord.lon
);

      // Send data to backend for storage
      saveWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const searchByCity = async () => {
  try {
    setLoading(true);
    setError("");

    const urlsearch = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=metric`;

    const response = await axios.get(urlsearch);

    const data = response.data;

    weatherReport(data);
    setWeatherData(data);
    saveWeatherData(data);
const updatedCities = [
  data.name,
  ...recentCities.filter(c => c !== data.name)
].slice(0, 9);

setRecentCities(updatedCities);

localStorage.setItem(
  "recentCities",
  JSON.stringify(updatedCities)
);
  } catch (error) {
    setError("No cities found");
  } finally {
    setLoading(false);
  }

  setCity("");
};
const addFavorite = () => {
  if (!weatherData) return;

  const cityName = weatherData.name;

  const favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

  const updatedFavorites = [
    ...new Set([...favorites, cityName])
  ];

  localStorage.setItem(
    "favorites",
    JSON.stringify(updatedFavorites)
  );

  alert(`${cityName} added to favorites`);
};
  const saveWeatherData = async (data) => {
    try {
      const response = await axios.post('https://weatherapp-4k1c.onrender.com/api/weather', {
        city: data.name,
        country: data.sys.country,
        temperature: Math.floor(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      });
      console.log('Weather data saved to database:', response.data);
    } catch (error) {
      console.error('Error saving weather data to database:', error);
    }
  };

  const weatherReport = async (data) => {
  const urlcast = `https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&appid=${apikey}&units=metric`;

  try {
    const response = await axios.get(urlcast);
    const forecast = response.data;

    hourForecast(forecast);
    dayForecast(forecast);

    const cityElement = document.getElementById("city");

if (cityElement) {
  cityElement.innerText =
    `${data.name}, ${data.sys.country}`;
}
const temperatureElement = document.getElementById("temperature");

if (temperatureElement) {
  temperatureElement.innerText =
 `${Math.floor(data.main.temp)} °C`;
}

    const cloudElement = document.getElementById("clouds");

if (cloudElement) {
  cloudElement.innerText =
 data.weather[0].description;
}


    const iconurl =
      `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

    document.getElementById("img").src = iconurl;

  } catch (error) {
    console.error("Error fetching forecast data:", error);
  }
};

  const hourForecast = (forecast) => {
    document.querySelector('.templist').innerHTML = '';
    for (let i = 0; i < 5; i++) {
      var date = new Date(forecast.list[i].dt * 1000);
      console.log((date.toLocaleTimeString(undefined, 'Asia/Kolkata')).replace(':00', ''));

      let hourR = document.createElement('div');
      hourR.setAttribute('class', 'next');

      let div = document.createElement('div');
      let time = document.createElement('p');
      time.setAttribute('class', 'time');
      time.innerText = (date.toLocaleTimeString(undefined, 'Asia/Kolkata')).replace(':00', '');

      let temp = document.createElement('p');
     temp.innerText = `${Math.floor(
  forecast.list[i].main.temp_max
)} °C / ${Math.floor(
  forecast.list[i].main.temp_min
)} °C`;
      div.appendChild(time);
      div.appendChild(temp);

      let desc = document.createElement('p');
      desc.setAttribute('class', 'desc');
      desc.innerText = forecast.list[i].weather[0].description;

      hourR.appendChild(div);
      hourR.appendChild(desc);
      document.querySelector('.templist').appendChild(hourR);
    }
  };


  const dayForecast = (forecast) => {
    document.querySelector('.weekF').innerHTML = '';
    for (let i = 8; i < forecast.list.length; i += 8) {
      console.log(forecast.list[i]);
      let div = document.createElement('div');
      div.setAttribute('class', 'dayF');

      let day = document.createElement('p');
      day.setAttribute('class', 'date');
      day.innerText = new Date(forecast.list[i].dt * 1000).toDateString(undefined, 'Asia/Kolkata');
      div.appendChild(day);

      let temp = document.createElement('p');
      temp.innerText = `${Math.floor(
  forecast.list[i].main.temp_max
)} °C / ${Math.floor(
  forecast.list[i].main.temp_min
)} °C`;
      div.appendChild(temp);

      let description = document.createElement('p');
      description.setAttribute('class', 'desc');
      description.innerText = forecast.list[i].weather[0].description;
      div.appendChild(description);

      document.querySelector('.weekF').appendChild(div);
    }
  };

  const HomePage = (
  <div>
    <div>
    <div className="header">
      <h1>WEATHER APP</h1>

      <div>
        <input
          id="input"
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchByCity();
            }
          }}
        />

        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  setCity(item.name);
                  setSuggestions([]);
                }}
              >
                {item.name}, {item.country}
              </li>
            ))}
          </ul>
        )}

        <button id="search" onClick={searchByCity}>
          Search
        </button>
<button
  className="favorite-btn"
  onClick={addFavorite}
>
  ❤️ Add to Favorites
</button>
       <Link to="/favorites" className="favorites-link">
  ❤️ View Favorites
</Link>

       

        {error && (
          <p className="error">{error}</p>
        )}
      </div>
    </div>

    <div className="recent-container">
      <h3 className="recent-title">
        Recent Searches
      </h3>

      <div className="recent-searches">
        {recentCities.length === 0 ? (
          <p>No recent searches</p>
        ) : (
          recentCities.map((cityName, index) => (
            <button
              key={index}
              onClick={() => {
                setCity(cityName);
              }}
            >
              {cityName}
            </button>
          ))
        )}
      </div>
    </div>

    {loading && (
      <p className="loading">
        Loading weather data...
      </p>
    )}

    <main>
      <div className="weather">
       <h2 id="city">Loading...</h2>


        <div className="temp-box">
          <img
            src="/weathericon.png"
            alt=""
            id="img"
          />

          <p id="temperature">-- °C</p>
         
        </div>

        <span id="clouds">Loading weather...</span>
        <div className="weather-details">

  <div className="detail-card">
    <h4>💧 Humidity</h4>
    <p>{weatherData?.main?.humidity || "--"}%</p>
  </div>

  <div className="detail-card">
    <h4>💨 Wind Speed</h4>
    <p>{weatherData?.wind?.speed || "--"} m/s</p>
  </div>

  <div className="detail-card">
    <h4>👁 Visibility</h4>
    <p>
      {weatherData?.visibility
        ? (weatherData.visibility / 1000).toFixed(1)
        : "--"} km
    </p>
  </div>

  <div className="detail-card">
    <h4>🌅 Sunrise</h4>
    <p>
      {weatherData?.sys?.sunrise
        ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString()
        : "--"}
    </p>
  </div>

  <div className="detail-card">
    <h4>🌇 Sunset</h4>
    <p>
      {weatherData?.sys?.sunset
        ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()
        : "--"}
    </p>
  </div>
<div className="detail-card">
  <h4>☀️ UV Index</h4>
  <p>{uvIndex || "--"}</p>
</div>
</div>
      </div>

      <div className="divider1"></div>

      <div className="forecstH">
        <p className="cast-header">
          Upcoming Forecast
        </p>

        <div className="templist"></div>
      </div>
    </main>

    <div className="forecstD">
      <div className="divider2"></div>

      <p className="cast-header">
        Next 4 Days Forecast
      </p>

      <div className="weekF"></div>
    </div>
  </div>
<div className="weather-map">
  <h2>Live Weather Map</h2>
 <iframe
    title="weather-map"
    width="100%"
    height="400"
    src="https://openweathermap.org/weathermap?basemap=map&cities=true&layer=wind"
  ></iframe>
  
</div>
  </div>
);

return (
  <Routes>
    <Route
      path="/"
      element={HomePage}
    />

    <Route
      path="/favorites"
      element={<Favorites />}
    />
  </Routes>
);
}

export default App;