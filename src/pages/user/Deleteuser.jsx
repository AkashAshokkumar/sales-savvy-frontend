import React, { useEffect, useState } from 'react';

export default function Deleteuser() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8080/getAllUser', { credentials: 'include' }); // ✅ FIXED
      setUsers(await res.json());
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/user/${id}`, {
        method: 'DELETE',
        credentials: 'include',          // ✅ FIXED
      });
      setMessage(await res.text());
      fetchUsers();
    } catch {
      setMessage('Failed to delete user');
    }
  };

  return (
    <div>
      <h3>All Users</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th><th>Username</th><th>Email</th><th>Gender</th><th>DOB</th><th>Role</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td><td>{u.username}</td><td>{u.email}</td>
              <td>{u.gender}</td><td>{u.dob}</td><td>{u.role}</td>
              <td>
                <button onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {message && (
        <p style={{ color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>
      )}
    </div>
  );
}
