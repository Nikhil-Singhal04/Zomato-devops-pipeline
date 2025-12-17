import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { currentUser } from '../auth';

export default function Restaurant({ cart, setCart }) {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/restaurants/${id}`)
      .then(response => {
        setRestaurant(response.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(c => c.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(c => c.id === itemId ? { ...c, quantity } : c));
    }
  };

  const placeOrder = async () => {
    if (!currentUser()) {
      setOrderStatus({ type: 'error', message: 'Please login to place an order' });
      return;
    }
    if (!cart.length) {
      setOrderStatus({ type: 'error', message: 'Your cart is empty' });
      return;
    }
    
    try {
      const items = cart.map(c => ({ menuItemId: c.id, quantity: c.quantity }));
      const response = await api.post('/api/orders', { items });
      setOrderStatus({ type: 'success', message: `Order placed successfully! Order ID: ${response.data.id}` });
      setCart([]);
    } catch (error) {
      setOrderStatus({ type: 'error', message: 'Failed to place order. Please try again.' });
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="container">
        <div className="restaurant-detail">
          <div className="restaurant-info">
            <div className="skeleton" style={{ height: '2rem', width: '60%', marginBottom: '1rem' }}></div>
            <div className="skeleton" style={{ height: '1rem', width: '40%', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ height: '1rem', width: '30%', marginBottom: '2rem' }}></div>
            <div className="menu-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton" style={{ height: '150px', borderRadius: '16px' }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container">
        <div className="empty-state">
          <span style={{ fontSize: '4rem' }}>🍽️</span>
          <p>Restaurant not found</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/" style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        marginBottom: '1.5rem',
        fontSize: '0.95rem',
        transition: 'color 0.2s'
      }}>
        ← Back to restaurants
      </Link>

      <div className="restaurant-detail">
        <div className="restaurant-info">
          <div className="restaurant-header">
            <h2>{restaurant.name}</h2>
            <p className="restaurant-cuisine">{restaurant.cuisine}</p>
            <p className="location">📍 {restaurant.location}</p>
            <div className="rating">⭐ {restaurant.rating}/5.0</div>
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Menu ({restaurant.MenuItems?.length || 0} items)
          </h3>

          <div className="menu-grid">
            {restaurant.MenuItems?.map((item, index) => (
              <article 
                key={item.id} 
                className="menu-item-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="menu-item-name">{item.name}</div>
                {item.description && (
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-muted)',
                    marginBottom: '0.5rem'
                  }}>
                    {item.description}
                  </div>
                )}
                <div className="menu-item-price">₹{item.price}</div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => addToCart(item)}
                  style={{ marginTop: 'auto' }}
                >
                  Add to Cart
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="cart-container">
          <h3>🛒 Your Cart {itemCount > 0 && `(${itemCount})`}</h3>
          
          {orderStatus && (
            <div className={`alert ${orderStatus.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {orderStatus.message}
            </div>
          )}

          {cart.length > 0 ? (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">₹{item.price} each</div>
                    </div>
                    <div className="cart-item-controls">
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button 
                        className="btn btn-danger remove-btn"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="cart-total">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="cart-total" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>Delivery</span>
                  <span>Free</span>
                </div>
                <hr style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '0.75rem 0' }} />
                <div className="cart-total" style={{ fontSize: '1.1rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>₹{total}</span>
                </div>
              </div>

              <button 
                className="btn btn-success" 
                style={{ width: '100%', marginTop: '1.5rem' }} 
                onClick={placeOrder}
              >
                Place Order
              </button>
            </>
          ) : (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛒</span>
              <p style={{ marginBottom: '0.5rem' }}>Your cart is empty</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Add items from the menu to get started!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
