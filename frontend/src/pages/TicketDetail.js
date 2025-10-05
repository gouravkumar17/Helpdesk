import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { ticketAPI, userAPI } from '../utils/api';
import '../styles/TicketDetail.css';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTicket();
    if (user.role === 'admin') {
      fetchAgents();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await ticketAPI.getById(id);
      setTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      if (error.response?.status === 403) {
        navigate('/tickets');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await userAPI.getAgents();
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await ticketAPI.update(id, { status: newStatus });
      setTicket(response.data);
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignment = async (agentId) => {
    try {
      setUpdating(true);
      const response = await ticketAPI.update(id, { 
        assignedTo: agentId || null 
      });
      setTicket(response.data);
    } catch (error) {
      console.error('Error assigning ticket:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setUpdating(true);
      await ticketAPI.addComment(id, {
        text: comment,
        isInternal
      });
      setComment('');
      setIsInternal(false);
      fetchTicket(); // Refresh ticket data
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getSlaStatus = (slaDeadline) => {
    const now = new Date();
    const deadline = new Date(slaDeadline);
    const timeRemaining = deadline - now;

    if (timeRemaining < 0) return 'breached';
    if (timeRemaining < 2 * 60 * 60 * 1000) return 'warning';
    return 'normal';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading ticket...</div>;
  }

  if (!ticket) {
    return <div className="error">Ticket not found</div>;
  }

  // Permission checks
  const canEditStatus = user.role === 'admin' || user.role === 'agent';
  const canAssign = user.role === 'admin';
  const canAddComments = user.role === 'admin' || user.role === 'agent' || user.id === ticket.createdBy._id;

  return (
    <div className="ticket-detail">
      <div className="page-header">
        <div>
          <button 
            onClick={() => navigate('/tickets')}
            className="btn btn-outline btn-sm"
            style={{ marginBottom: '16px' }}
          >
            ← Back to Tickets
          </button>
          <h1>{ticket.title}</h1>
          <p>Ticket #{ticket._id}</p>
        </div>
        
        <div className="ticket-actions">
          {canEditStatus && (
            <div className="action-group">
              <label>Status:</label>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="form-control"
              >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}

          {/* Only Admin can assign tickets to agents */}
          {canAssign && (
            <div className="action-group">
              <label>Assign to Agent:</label>
              <select
                value={ticket.assignedTo?._id || ''}
                onChange={(e) => handleAssignment(e.target.value)}
                disabled={updating}
                className="form-control"
              >
                <option value="">Unassigned</option>
                {agents.filter(agent => agent.role === 'agent').map(agent => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name} (Agent)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="ticket-content grid grid-2">
        <div className="ticket-main">
          <div className="card ticket-description-card">
            <h3>Description</h3>
            <p>{ticket.description}</p>
            
            <div className="ticket-meta-grid">
              <div className="meta-item">
                <label>Category:</label>
                <span className="category-tag">{ticket.category}</span>
              </div>
              <div className="meta-item">
                <label>Priority:</label>
                <span className={`priority-${ticket.priority}`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="meta-item">
                <label>Created:</label>
                <span>{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="meta-item">
                <label>SLA Deadline:</label>
                <span className={`sla-${getSlaStatus(ticket.slaDeadline)}`}>
                  {formatDate(ticket.slaDeadline)}
                </span>
              </div>
              <div className="meta-item">
                <label>Created By:</label>
                <span>{ticket.createdBy.name}</span>
              </div>
              {ticket.assignedTo && (
                <div className="meta-item">
                  <label>Assigned To:</label>
                  <span>{ticket.assignedTo.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card comments-section">
            <h3>Comments</h3>
            
            <div className="comments-list">
              {ticket.comments.map(comment => (
                <div 
                  key={comment._id} 
                  className={`comment ${comment.isInternal ? 'internal' : ''}`}
                >
                  <div className="comment-header">
                    <div className="comment-author">
                      {comment.user.name}
                      {comment.isInternal && (
                        <span className="internal-badge">Internal</span>
                      )}
                    </div>
                    <div className="comment-date">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                  <div className="comment-text">
                    {comment.text}
                  </div>
                </div>
              ))}

              {ticket.comments.length === 0 && (
                <div className="no-comments">
                  No comments yet. Be the first to add one!
                </div>
              )}
            </div>

            {canAddComments && (
              <form onSubmit={handleAddComment} className="comment-form">
                <div className="form-group">
                  <label className="form-label">Add Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-control"
                    rows="4"
                    placeholder="Type your comment here..."
                    required
                  ></textarea>
                </div>

                {(user.role === 'admin' || user.role === 'agent') && (
                  <div className="form-check">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="form-check-input"
                      id="internal-comment"
                    />
                    <label className="form-check-label" htmlFor="internal-comment">
                      Internal comment (visible only to agents and admins)
                    </label>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={updating || !comment.trim()}
                >
                  {updating ? 'Adding...' : 'Add Comment'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="ticket-sidebar">
          <div className="card sla-card">
            <h3>SLA Status</h3>
            <div className={`sla-indicator sla-${getSlaStatus(ticket.slaDeadline)}`}>
              <div className="sla-status">
                {getSlaStatus(ticket.slaDeadline).toUpperCase()}
              </div>
              <div className="sla-deadline">
                Deadline: {formatDate(ticket.slaDeadline)}
              </div>
            </div>
          </div>

          <div className="card activity-card">
            <h3>Activity</h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">📝</div>
                <div className="activity-content">
                  <div>Ticket created</div>
                  <div className="activity-date">
                    {formatDate(ticket.createdAt)}
                  </div>
                </div>
              </div>

              {ticket.comments.map(comment => (
                <div key={comment._id} className="activity-item">
                  <div className="activity-icon">💬</div>
                  <div className="activity-content">
                    <div>Comment added by {comment.user.name}</div>
                    <div className="activity-date">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
              ))}

              {ticket.resolvedAt && (
                <div className="activity-item">
                  <div className="activity-icon">✅</div>
                  <div className="activity-content">
                    <div>Ticket resolved</div>
                    <div className="activity-date">
                      {formatDate(ticket.resolvedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;