import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { ticketAPI } from '../utils/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats only for admin/agent
      const statsResponse = (user.role === 'admin' || user.role === 'agent') 
        ? await ticketAPI.getStats() 
        : null;

      // Fetch tickets - backend will filter based on user role
      const ticketsResponse = await ticketAPI.getAll();
      
      console.log('All tickets:', ticketsResponse.data);
      setAllTickets(ticketsResponse.data);

      if (statsResponse) {
        setStats(statsResponse.data);
      }
      
      // Show recent tickets (max 5, but show all if less than 5)
      const recentTicketsToShow = ticketsResponse.data.slice(0, 5);
      console.log('Recent tickets to show:', recentTicketsToShow);
      setRecentTickets(recentTicketsToShow);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSlaStatus = (slaDeadline) => {
    if (!slaDeadline) return 'normal';
    
    const now = new Date();
    const deadline = new Date(slaDeadline);
    const timeRemaining = deadline - now;

    if (timeRemaining < 0) return 'breached';
    if (timeRemaining < 2 * 60 * 60 * 1000) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#ef4444';
      case 'pending': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, {user.name}! Here's your support dashboard.</p>
      </div>

      {/* Stats Grid for Admin */}
      {(user.role === 'admin') && stats && (
        <div className="stats-grid grid grid-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#3b82f6' }}>📊</div>
            <div className="stat-info">
              <div className="stat-number">{stats.totalTickets}</div>
              <div className="stat-label">Total Tickets</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ef4444' }}>🔴</div>
            <div className="stat-info">
              <div className="stat-number">{stats.openTickets}</div>
              <div className="stat-label">Open</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b' }}>🟡</div>
            <div className="stat-info">
              <div className="stat-number">{stats.pendingTickets}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b981' }}>🟢</div>
            <div className="stat-info">
              <div className="stat-number">{stats.resolvedTickets}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#8b5cf6' }}>⏱️</div>
            <div className="stat-info">
              <div className="stat-number">{stats.avgResolutionTime}m</div>
              <div className="stat-label">Avg. Resolution Time</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#06b6d4' }}>✅</div>
            <div className="stat-info">
              <div className="stat-number">{stats.slaComplianceRate}%</div>
              <div className="stat-label">SLA Compliance</div>
            </div>
          </div>
        </div>
      )}

      {/* Agent-specific stats - ONLY this section shows for agents */}
      {user.role === 'agent' && (
        <div className="stats-grid grid grid-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#3b82f6' }}>📊</div>
            <div className="stat-info">
              <div className="stat-number">{allTickets.length}</div>
              <div className="stat-label">Assigned Tickets</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ef4444' }}>🔴</div>
            <div className="stat-info">
              <div className="stat-number">
                {allTickets.filter(ticket => ticket.status === 'open').length}
              </div>
              <div className="stat-label">Open</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b' }}>🟡</div>
            <div className="stat-info">
              <div className="stat-number">
                {allTickets.filter(ticket => ticket.status === 'pending').length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b981' }}>🟢</div>
            <div className="stat-info">
              <div className="stat-number">
                {allTickets.filter(ticket => ticket.status === 'resolved' || ticket.status === 'closed').length}
              </div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#8b5cf6' }}>⏱️</div>
            <div className="stat-info">
              <div className="stat-number">
                {stats ? `${stats.avgResolutionTime}m` : '0m'}
              </div>
              <div className="stat-label">Avg. Resolution Time</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#06b6d4' }}>✅</div>
            <div className="stat-info">
              <div className="stat-number">
                {stats ? `${stats.slaComplianceRate}%` : '0%'}
              </div>
              <div className="stat-label">SLA Compliance</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b' }}>⏰</div>
            <div className="stat-info">
              <div className="stat-number">
                {allTickets.filter(ticket => getSlaStatus(ticket.slaDeadline) === 'warning').length}
              </div>
              <div className="stat-label">Urgent</div>
            </div>
          </div>
        </div>
      )}

      {/* User-specific stats for regular users */}
      {user.role === 'user' && (
        <div className="stats-grid grid grid-3">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#3b82f6' }}>📊</div>
            <div className="stat-info">
              <div className="stat-number">{allTickets.length}</div>
              <div className="stat-label">My Tickets</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ef4444' }}>🔴</div>
            <div className="stat-info">
              <div className="stat-number">
                {allTickets.filter(ticket => ticket.status === 'open').length}
              </div>
              <div className="stat-label">Open</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b' }}>🟡</div>
            <div className="stat-info">
              <div className="stat-number">
                {allTickets.filter(ticket => ticket.status === 'pending').length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b981' }}>🟢</div>
            <div className="stat-info">
              <div className="stat-number">
                {allTickets.filter(ticket => ticket.status === 'resolved' || ticket.status === 'closed').length}
              </div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b' }}>⏰</div>
            <div className="stat-info">
              <div className="stat-number">
                {allTickets.filter(ticket => getSlaStatus(ticket.slaDeadline) === 'warning').length}
              </div>
              <div className="stat-label">Urgent</div>
            </div>
          </div>

          <div className="stat-card">
            <Link to="/tickets/create" className="stat-card-link">
              <div className="stat-icon" style={{ background: '#10b981' }}>➕</div>
              <div className="stat-info">
                <div className="stat-number">Create</div>
                <div className="stat-label">New Ticket</div>
              </div>
            </Link>
          </div>
        </div>
      )}

      <div className="dashboard-content grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3>
              {user.role === 'user' ? 'My Recent Tickets' : 
               user.role === 'agent' ? 'My Assigned Tickets' : 'Recent Tickets'}
            </h3>
            <Link to="/tickets" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          <div className="ticket-list">
            {recentTickets.map(ticket => (
              <div key={ticket._id} className="ticket-item">
                <div className="ticket-main">
                  <Link to={`/tickets/${ticket._id}`} className="ticket-title">
                    {ticket.title}
                  </Link>
                  <div className="ticket-meta">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(ticket.status) }}
                    >
                      {ticket.status}
                    </span>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                  <div className="ticket-description">
                    {ticket.description.substring(0, 80)}...
                  </div>
                </div>
                <div className="ticket-sla">
                  <span className={`sla-indicator sla-${getSlaStatus(ticket.slaDeadline)}`}>
                    {getSlaStatus(ticket.slaDeadline)}
                  </span>
                  <div className="ticket-date">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            
            {recentTickets.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🎫</div>
                <h3>No tickets found</h3>
                <p>
                  {user.role === 'user' 
                    ? "You haven't created any tickets yet." 
                    : user.role === 'agent'
                    ? "No tickets have been assigned to you yet."
                    : "There are no tickets in the system."
                  }
                </p>
                {user.role === 'user' && (
                  <Link to="/tickets/create" className="btn btn-primary">
                    Create Your First Ticket
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Charts and Analytics Section */}
        <div className="analytics-sidebar">
          {/* Priority Distribution for Admin/Agent */}
          {stats && (user.role === 'admin' || user.role === 'agent') && (
            <div className="card">
              <div className="card-header">
                <h3>Priority Distribution</h3>
              </div>
              <div className="chart-container">
                {stats.priorityStats?.map(stat => (
                  <div key={stat._id} className="chart-item">
                    <div className="chart-label">
                      <span className="priority-dot" style={{ backgroundColor: getPriorityColor(stat._id) }}></span>
                      {stat._id}
                    </div>
                    <div className="chart-bar">
                      <div 
                        className="chart-fill"
                        style={{ 
                          width: `${(stat.count / stats.totalTickets) * 100}%`,
                          backgroundColor: getPriorityColor(stat._id)
                        }}
                      ></div>
                    </div>
                    <div className="chart-count">{stat.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Distribution for Admin/Agent */}
          {stats && (user.role === 'admin' || user.role === 'agent') && (
            <div className="card">
              <div className="card-header">
                <h3>Status Overview</h3>
              </div>
              <div className="status-chart">
                {stats.statusStats?.map(stat => (
                  <div key={stat._id} className="status-item">
                    <div className="status-info">
                      <span 
                        className="status-dot"
                        style={{ backgroundColor: getStatusColor(stat._id) }}
                      ></span>
                      <span className="status-name">{stat._id}</span>
                    </div>
                    <div className="status-count">{stat.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User-specific info panel */}
          {user.role === 'user' && (
            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions">
                <Link to="/tickets/create" className="quick-action-item">
                  <div className="action-icon">➕</div>
                  <div className="action-content">
                    <div className="action-title">Create New Ticket</div>
                    <div className="action-description">
                      Report a new issue or request assistance
                    </div>
                  </div>
                </Link>
                
                <Link to="/tickets" className="quick-action-item">
                  <div className="action-icon">📋</div>
                  <div className="action-content">
                    <div className="action-title">View All Tickets</div>
                    <div className="action-description">
                      Check the status of all your submitted tickets
                    </div>
                  </div>
                </Link>

                <div className="quick-action-item info-item">
                  <div className="action-icon">📞</div>
                  <div className="action-content">
                    <div className="action-title">Support Hours</div>
                    <div className="action-description">
                      Mon-Fri: 9AM-6PM<br/>
                      Response time: 2-4 hours
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Agent-specific info panel */}
          {user.role === 'agent' && (
            <div className="card">
              <div className="card-header">
                <h3>Agent Information</h3>
              </div>
              <div className="quick-actions">
                <div className="quick-action-item info-item">
                  <div className="action-icon">ℹ️</div>
                  <div className="action-content">
                    <div className="action-title">Your Responsibilities</div>
                    <div className="action-description">
                      Work on tickets assigned to you by admin<br/>
                      Update status and add comments
                    </div>
                  </div>
                </div>
                
                <div className="quick-action-item info-item">
                  <div className="action-icon">⏱️</div>
                  <div className="action-content">
                    <div className="action-title">SLA Guidelines</div>
                    <div className="action-description">
                      Resolve tickets within 24 hours<br/>
                      Urgent tickets within 2 hours
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLA Status for all users */}
          <div className="card">
            <div className="card-header">
              <h3>SLA Status</h3>
            </div>
            <div className="sla-overview">
              <div className="sla-item">
                <div className="sla-indicator sla-normal"></div>
                <span>On Track</span>
              </div>
              <div className="sla-item">
                <div className="sla-indicator sla-warning"></div>
                <span>Urgent (2h)</span>
              </div>
              <div className="sla-item">
                <div className="sla-indicator sla-breached"></div>
                <span>Breached</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;