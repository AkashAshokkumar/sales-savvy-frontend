import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loadRazorpay from '../utils/loadRzp';
import '../styles/Cart.css';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoad] = useState(true);
  const [error, setErr] = useState('');
  const username = localStorage.getItem('username');
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) return;
    (async () => {
      try {
        const r = await fetch(`http://localhost:8080/getCart/${username}`, { credentials: 'include' }); // ✅ FIXED
        if (!r.ok) throw new Error('Failed to fetch cart');
        setItems(await r.json());
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoad(false);
      }
    })();
  }, [username]);

  const total = items.reduce((s, it) => s + it.product.price * it.quantity, 0);

  async function updateQuantity(productId, change) {
    try {
      const res = await fetch('http://localhost:8080/cart/updateQuantity', {
        method: 'POST',
        credentials: 'include',          // ✅ FIXED
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, productId, quantity: change }),
      });
      if (!res.ok) throw new Error(await res.text());
      setItems(await res.json());
    } catch (e) {
      alert('Failed to update quantity: ' + e.message);
    }
  }

  async function removeItem(productId) {
    try {
      const res = await fetch('http://localhost:8080/cart/removeItem', {
        method: 'POST',
        credentials: 'include',          // ✅ FIXED
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, productId }),
      });
      if (!res.ok) throw new Error(await res.text());
      setItems(await res.json());
    } catch (e) {
      alert('Failed to remove item: ' + e.message);
    }
  }

  async function payNow() {
    if (!items.length) return;
    const ok = await loadRazorpay();
    if (!ok) return alert('Razorpay SDK failed to load.');

    const res = await fetch('http://localhost:8080/payment/create', {
      method: 'POST',
      credentials: 'include',            // ✅ FIXED
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, amount: total * 100 }),
    });
    if (!res.ok) return alert(await res.text());
    const data = await res.json();

    const rzp = new window.Razorpay({
      key: data.key,
      amount: data.amount,
      currency: 'INR',
      name: 'Sales Savvy',
      description: 'Order Payment',
      order_id: data.orderId,
      handler: async (resp) => {
        const vr = await fetch('http://localhost:8080/payment/verify', {
          method: 'POST',
          credentials: 'include',        // ✅ FIXED
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            orderId: resp.razorpay_order_id,
            paymentId: resp.razorpay_payment_id,
            signature: resp.razorpay_signature,
          }),
        });
        if (!vr.ok) return alert(await vr.text());
        const orderId = await vr.text();
        navigate(`/order-summary/${orderId}`);
      },
      prefill: { name: username, email: localStorage.getItem('email') || '' },
      theme: { color: '#3399cc' },
    });
    rzp.open();
  }

  // ✅ FIXED: proper logout
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.clear();
      navigate('/', { replace: true });
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand" onClick={() => navigate('/')}>🛍️ Sales Savvy</div>
        <ul className="nav-links">
          <li onClick={() => navigate('/customer_home')}>Home</li>
          <li onClick={() => navigate('/cart')}>Cart</li>
          <li onClick={() => navigate('/orders')}>Orders</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </nav>

      <div className="container cart-view">
        <h2 className="text-center">🛒 Your Cart</h2>
        {loading && <p className="text-center">Loading…</p>}
        {error   && <p className="text-center text-danger">{error}</p>}
        {!loading && !error && items.length === 0 && <p className="text-center">Your cart is empty.</p>}

        {!loading && !error && items.length > 0 && (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Image</th><th>Product</th><th>Quantity</th>
                  <th>Unit Price</th><th>Total</th><th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><img src={item.product.photo} alt={item.product.name} className="cart-img" /></td>
                    <td>{item.product.name}</td>
                    <td>
                      <button onClick={() => updateQuantity(item.product.id, -1)}>−</button>
                      <span className="qty">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, 1)}>＋</button>
                    </td>
                    <td>₹{item.product.price}</td>
                    <td>₹{item.product.price * item.quantity}</td>
                    <td>
                      <button className="btn btn-danger" onClick={() => removeItem(item.product.id)}>❌</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="cart-summary">
              <h3>Total: ₹{total}</h3>
              <button className="btn btn-primary" onClick={payNow}>Pay with Razorpay</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
