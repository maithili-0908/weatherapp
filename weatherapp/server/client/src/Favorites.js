import React, { useState } from "react";
import { Link } from "react-router-dom";

function Favorites() {
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );

  const removeFavorite = (city) => {
    const updatedFavorites = favorites.filter(
      (item) => item !== city
    );

    setFavorites(updatedFavorites);

    localStorage.setItem(
      "favorites",
      JSON.stringify(updatedFavorites)
    );
  };

  return (
    <div className="favorites-page">
      <h1>Favorite Cities ❤️</h1>

      <Link to="/">
        ← Back to Weather App
      </Link>

      {favorites.length === 0 ? (
        <p>No favorite cities added.</p>
      ) : (
        favorites.map((city, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              margin: "10px 0"
            }}
          >
            <h3>{city}</h3>

            <button
              onClick={() =>
                removeFavorite(city)
              }
            >
              ❌ Remove from ❤️
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Favorites;