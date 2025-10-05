import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { ticketAPI } from '../utils/api';
import '../styles/CreateTicket.css';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'technical',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is not a regular user
  useEffect(() => {
    if (user && user.role !== 'user') {
      navigate('/tickets');
    }
  }, [user, navigate]);

  // Show loading or redirect if user doesn't have permission
  if (!user || user.role !== 'user') {
    return (
      <div className="loading">
        Redirecting...
      </div>
    );
  }

  // Rest of the component remains the same...
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await ticketAPI.create(formData);
      navigate('/tickets');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket">
      <div className="page-header">
        <div>
          <h1>Create New Ticket</h1>
          <p>Submit a new support request</p>
        </div>
      </div>

      <div className="create-ticket-card card">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-control"
              placeholder="Brief description of the issue"
              required
              maxLength="100"
            />
            <div className="form-help">
              {formData.title.length}/100 characters
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="general">General</option>
              <option value="feature-request">Feature Request</option>
              <option value="bug">Bug Report</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority *</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="8"
              placeholder="Please provide detailed information about your issue..."
              required
            ></textarea>
            <div className="form-help">
              Be as detailed as possible to help us resolve your issue quickly.
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Ticket...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>

      <div className="info-card card">
        <h3>💡 Before Submitting</h3>
        <ul className="info-list">
          <li>Provide clear and concise title</li>
          <li>Include steps to reproduce for technical issues</li>
          <li>Add relevant error messages or screenshots in description</li>
          <li>Choose appropriate priority level</li>
          <li>Urgent issues will be addressed within 2 hours</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateTicket;