import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/DeleteProduct.css';

export default function Delete_product() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/getAllProducts', { withCredentials: true }); // ✅ FIXED
      setProducts(res.data);
    } catch (err) {
      setError('Failed to fetch products.');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8080/deleteProduct?id=${id}`, { withCredentials: true }); // ✅ FIXED
      setMessage(res.data);
      setError('');
      fetchProducts();
    } catch (err) {
      setMessage('');
      setError('Failed to delete product.');
    }
  };

  return (
    <div className="delete-container">
      <h2>All Products</h2>
      {message && <p className="success">{message}</p>}
      {error   && <p className="error">{error}</p>}

      <table className="product-table">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Price</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>₹{product.price}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDelete(product.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={4}>No products found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
