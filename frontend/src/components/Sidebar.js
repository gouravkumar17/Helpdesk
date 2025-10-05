import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h2>HelpDesk</h2>
      </div>
      <div className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-item">
          <span>📊</span>
          Dashboard
        </NavLink>
        <NavLink to="/tickets" className="sidebar-item">
          <span>🎫</span>
          Tickets
        </NavLink>
        
        {/* Only Users can create tickets */}
        {user.role === 'user' && (
          <NavLink to="/tickets/create" className="sidebar-item">
            <span>➕</span>
            Create Ticket
          </NavLink>
        )}

        {/* Admin/Agent section */}
        {(user.role === 'admin' || user.role === 'agent') && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', paddingLeft: '16px' }}>
              SUPPORT TEAM
            </div>
            
            {/* Only Admin can manage users */}
            {user.role === 'admin' && (
              <NavLink to="/users" className="sidebar-item">
                <span>👥</span>
                Users
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;