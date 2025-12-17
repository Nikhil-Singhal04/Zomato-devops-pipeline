import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/restaurants')
      .then(res => {
        setRestaurants(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch restaurants:', err);
        setLoading(false);
      });
  }, []);

  // Filter restaurants by name or cuisine
  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(search.toLowerCase())
  );

  // Cuisine emoji mapping
  const cuisineEmojis = {
    'Indian': '🍛',
    'Italian': '🍝',
    'Fast Food': '🍔',
    'Japanese': '🍣',
    'Mexican': '🌮',
    'Thai': '🥘',
    'Chinese': '🥢',
    'Mediterranean': '🥙',
    'American': '🍟',
    'Seafood': '🦐'
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="container">
        <h1 className="page-title">🍕 Discover Restaurants</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Find your favorite food from the best restaurants
        </p>
        <div className="restaurants-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="restaurant-card">
              <div className="restaurant-card-image skeleton" style={{ background: 'var(--bg-tertiary)' }} />
              <div className="restaurant-card-body">
                <div className="skeleton" style={{ height: '24px', width: '70%', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: '16px' }} />
                <div className="skeleton" style={{ height: '40px', width: '100%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Hero Section */}
      <h1 className="page-title">🍕 Discover Restaurants</h1>
      <p style={{ 
        textAlign: 'center', 
        color: 'var(--text-secondary)', 
        marginBottom: '2rem',
        fontSize: '1.1rem'
      }}>
        Find your favorite food from the best restaurants in town
      </p>

      {/* Search Bar */}
      <div className="form-group" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
        <input
          type="text"
          placeholder="Search for restaurants or cuisines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search restaurants"
        />
      </div>

      {/* Results Count */}
      {search && (
        <p style={{ 
          textAlign: 'center', 
          color: 'var(--text-muted)', 
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}>
          Found {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} 
          {search && ` for "${search}"`}
        </p>
      )}

      {/* Restaurant Grid */}
      <div className="restaurants-grid">
        {filtered.length > 0 ? (
          filtered.map((restaurant, index) => (
            <article 
              key={restaurant.id} 
              className="restaurant-card"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              {/* Card Image */}
              <div className="restaurant-card-image">
                <span role="img" aria-label={restaurant.cuisine}>
                  {cuisineEmojis[restaurant.cuisine] || '🍽️'}
                </span>
              </div>

              {/* Card Body */}
              <div className="restaurant-card-body">
                <h3 className="restaurant-name">{restaurant.name}</h3>
                <p className="restaurant-cuisine">{restaurant.cuisine}</p>
                
                <div className="restaurant-meta">
                  <span className="rating">
                    ⭐ {restaurant.rating}
                  </span>
                  <span className="location">
                    {restaurant.location}
                  </span>
                </div>

                <Link 
                  to={`/r/${restaurant.id}`} 
                  className="btn btn-primary"
                  aria-label={`View menu for ${restaurant.name}`}
                >
                  View Menu
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>No restaurants found matching "{search}"</p>
            <button 
              className="btn btn-secondary" 
              onClick={() => setSearch('')}
              style={{ marginTop: '1rem', width: 'auto' }}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
