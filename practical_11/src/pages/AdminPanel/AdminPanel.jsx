import { useState, useEffect } from "react";

import "./AdminPanel.css";

import { api } from "../../api";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="admin-panel__message">Загрузка пользователей...</div>
    );
  }

  return (
    <div className="admin-panel">
      <h1 className="admin-panel__title">Панель управления ролями</h1>
      <div className="admin-panel__table-container">
        <table className="admin-panel__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {editingId === u.id ? (
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="user">Пользователь</option>
                      <option value="seller">Продавец</option>
                      <option value="admin">Админ</option>
                    </select>
                  ) : u.role === "user" ? (
                    "Пользователь"
                  ) : u.role === "seller" ? (
                    "Продавец"
                  ) : (
                    "Админ"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanel;
