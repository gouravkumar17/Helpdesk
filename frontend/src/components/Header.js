import React from 'react';
import { useAuth } from '../utils/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1>HelpDesk Mini</h1>
          <div className="user-info">
            <div className="user-avatar">
              {getInitials(user.name)}
            </div>
            <div>
              <div style={{ fontWeight: '600' }}>{user.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            </div>
            <button 
              onClick={logout}
              className="btn btn-outline"
              style={{ marginLeft: '16px' }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;