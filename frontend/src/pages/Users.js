import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { userAPI } from '../utils/api';
import '../styles/Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAgents();
      setUsers(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { label: 'Admin', class: 'role-admin' },
      agent: { label: 'Agent', class: 'role-agent' },
      user: { label: 'User', class: 'role-user' }
    };

    const config = roleConfig[role] || { label: role, class: 'role-user' };
    return <span className={`role-badge ${config.class}`}>{config.label}</span>;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage agents and administrators</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="card">
        <div className="users-header">
          <h3>Team Members ({users.length})</h3>
          <div className="users-stats">
            <div className="stat">
              <span className="stat-number">
                {users.filter(u => u.role === 'admin').length}
              </span>
              <span className="stat-label">Admins</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {users.filter(u => u.role === 'agent').length}
              </span>
              <span className="stat-label">Agents</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {users.filter(u => u.role === 'user').length}
              </span>
              <span className="stat-label">Users</span>
            </div>
          </div>
        </div>

        <div className="users-list">
          {users.map(userItem => (
            <div key={userItem._id} className="user-card">
              <div className="user-avatar">
                {getInitials(userItem.name)}
              </div>
              <div className="user-info">
                <div className="user-name">{userItem.name}</div>
                <div className="user-email">{userItem.email}</div>
                <div className="user-meta">
                  {getRoleBadge(userItem.role)}
                  <span className="user-date">
                    Joined: {new Date(userItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="user-status">
                <span className={`status-indicator ${userItem.isActive ? 'active' : 'inactive'}`}>
                  {userItem.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No users found</h3>
            <p>There are no agents or administrators in the system yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;