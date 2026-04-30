import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

import "./AdminPanel.css";

import { api } from "../../api";

function AdminPanel() {
  const [userRole, setUserRole] = useState('');
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(true);

  const handleRoleChange = (userId, currentRole) => {
    setEditingId(userId);
    setSelectedRole(currentRole);
  };

  const saveRole = async (userId) => {
    try {
      await api.updateUser(userId, { role: selectedRole });
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: selectedRole } : u)),
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId) => {
    const deleteConfirm = window.confirm(
      "Вы уверены, что хотите удалить пользователя?",
    );
    if (!deleteConfirm) return;

    try {
      await api.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => setEditingId(null);

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
  
  const checkRole = async () => {
    try {
      const data = await api.checkUser();
      role = data.role
      setUserRole(data.role);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const data = await api.checkUser();
        const role = data.role;
        setUserRole(role);

        if (role === 'admin') {
          await fetchUsers();
        }
      } catch (err) {
        console.error(err);
        setUserRole('');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="admin-panel__message">Проверка прав доступа...</div>
    );
  }

  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
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
                <td>
                  {editingId === u.id ? (
                    <>
                      <button
                        className="btn btn-save"
                        onClick={() => saveRole(u.id)}
                      >
                        Сохранить
                      </button>
                      <button className="btn btn-cancel" onClick={cancelEdit}>
                        Отмена
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-edit"
                        onClick={() => handleRoleChange(u.id, u.role)}
                      >
                        Изменить роль
                      </button>
                      <button
                        className="btn btn-cancel"
                        onClick={() => deleteUser(u.id)}
                      >
                        Удалить
                      </button>
                    </>
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
