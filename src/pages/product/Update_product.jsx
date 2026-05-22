import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/UpdateProduct.css';

export default function Update_product() {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/getAllProducts', { withCredentials: true })
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleEditClick = (product) => setEditProduct({ ...product });

  const handleChange = (e) => {
    setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    axios.post('http://localhost:8080/updateProduct', editProduct, { withCredentials: true }) // ✅ FIXED: credentials
      .then(res => {
        alert(res.data);
        setEditProduct(null);
        // Refresh list
        axios.get('http://localhost:8080/getAllProducts', { withCredentials: true })
          .then(r => setProducts(r.data));
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="update-page">
      <h2 className="section-heading">Update Products</h2>

      {editProduct ? (
        <div className="update-form">
          <h3>Editing Product ID: {editProduct.id}</h3>
          {/* ✅ FIXED: removed 'brand' field which doesn't exist in Product entity */}
          <input type="text"   name="name"        value={editProduct.name || ''}        onChange={handleChange} placeholder="Name" />
          <input type="text"   name="category"    value={editProduct.category || ''}    onChange={handleChange} placeholder="Category" />
          <input type="number" name="price"        value={editProduct.price || ''}       onChange={handleChange} placeholder="Price" />
          <input type="text"   name="photo"        value={editProduct.photo || ''}       onChange={handleChange} placeholder="Photo URL" />
          <input type="text"   name="description"  value={editProduct.description || ''} onChange={handleChange} placeholder="Description" />
          <button onClick={handleUpdate}>Submit Update</button>
          <button onClick={() => setEditProduct(null)}>Cancel</button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((prod) => (
            <div key={prod.id} className="product-card">
              <img className="product-image" src={prod.photo} alt={prod.name} />
              <div className="product-info">
                <h4>#{prod.id} - {prod.name}</h4>
                <button onClick={() => handleEditClick(prod)}>Update</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
