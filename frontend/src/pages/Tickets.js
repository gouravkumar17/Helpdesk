import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { ticketAPI } from '../utils/api';
import '../styles/Tickets.css';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getAll();
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: ''
    });
  };

  // No need to filter by user role here - backend already does it
  const filteredTickets = tickets.filter(ticket => {
    return (
      (filters.status === '' || ticket.status === filters.status) &&
      (filters.priority === '' || ticket.priority === filters.priority) &&
      (filters.category === '' || ticket.category === filters.category)
    );
  });

  const getSlaStatus = (slaDeadline) => {
    if (!slaDeadline) return 'normal';
    
    const now = new Date();
    const deadline = new Date(slaDeadline);
    const timeRemaining = deadline - now;

    if (timeRemaining < 0) return 'breached';
    if (timeRemaining < 2 * 60 * 60 * 1000) return 'warning';
    return 'normal';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading tickets...</div>;
  }

  return (
    <div className="tickets-page">
      <div className="page-header">
        <div>
          <h1>
            {user.role === 'user' ? 'My Tickets' : 
             user.role === 'agent' ? 'My Assigned Tickets' : 'Tickets'}
          </h1>
          <p>
            {user.role === 'user' 
              ? 'View and track your support tickets' 
              : user.role === 'agent'
              ? 'Manage tickets assigned to you by admin'
              : 'Manage and track all support tickets'
            }
          </p>
        </div>
        {/* Only show Create Ticket button for Users */}
        {user.role === 'user' && (
          <Link to="/tickets/create" className="btn btn-primary">
            ➕ Create Ticket
          </Link>
        )}
      </div>

      <div className="filters-card card">
        <div className="filters-header">
          <h3>Filters</h3>
          <button onClick={clearFilters} className="btn btn-outline btn-sm">
            Clear All
          </button>
        </div>
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="general">General</option>
              <option value="feature-request">Feature Request</option>
              <option value="bug">Bug</option>
            </select>
          </div>
        </div>
      </div>

      <div className="tickets-list card">
        <div className="table-header">
          <div className="table-info">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </div>
          <button onClick={fetchTickets} className="btn btn-outline btn-sm">
            🔄 Refresh
          </button>
        </div>

        <div className="table-responsive">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Created</th>
                <th>SLA</th>
                {/* Only show Assigned To column for Admin/Agent */}
                {(user.role === 'admin' || user.role === 'agent') && <th>Assigned To</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket._id}>
                  <td>
                    <div className="ticket-info">
                      <Link to={`/tickets/${ticket._id}`} className="ticket-title">
                        {ticket.title}
                      </Link>
                      <div className="ticket-description">
                        {ticket.description.substring(0, 60)}...
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-${ticket.status}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-${ticket.priority}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className="category-tag">
                      {ticket.category}
                    </span>
                  </td>
                  <td>{formatDate(ticket.createdAt)}</td>
                  <td>
                    <span className={`sla-${getSlaStatus(ticket.slaDeadline)}`}>
                      {getSlaStatus(ticket.slaDeadline)}
                    </span>
                  </td>
                  {/* Only show Assigned To data for Admin/Agent */}
                  {(user.role === 'admin' || user.role === 'agent') && (
                    <td>
                      {ticket.assignedTo ? (
                        <div className="assigned-user">
                          {ticket.assignedTo.name || 'Unknown'}
                        </div>
                      ) : (
                        <span className="unassigned">Unassigned</span>
                      )}
                    </td>
                  )}
                  <td>
                    <Link 
                      to={`/tickets/${ticket._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>No tickets found</h3>
            <p>
              {user.role === 'user'
                ? "You haven't created any tickets yet or no tickets match your filters."
                : user.role === 'agent'
                ? "No tickets have been assigned to you yet or no tickets match your filters."
                : "No tickets match your current filters."
              }
            </p>
            <div className="empty-actions">
              <button onClick={clearFilters} className="btn btn-outline">
                Clear Filters
              </button>
              {user.role === 'user' && (
                <Link to="/tickets/create" className="btn btn-primary">
                  Create Your First Ticket
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;