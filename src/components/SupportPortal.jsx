import React, { useState } from 'react';

const SupportPortal = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [tickets, setTickets] = useState([
    { id: 1, title: 'Login Issue', status: 'Open', priority: 'High', category: 'Technical issue' },
    { id: 2, title: 'Payroll Question', status: 'In progress', priority: 'Medium', category: 'HR issue' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const createTicket = (ticketData) => {
    const newTicket = { ...ticketData, id: Date.now(), status: 'Open' };
    setTickets([...tickets, newTicket]);
    setActiveTab('home');
  };

  const updateTicketStatus = (id, status) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <div className="support-portal">
      <nav className="nav-tabs">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'active' : ''}>
          Home
        </button>
        <button onClick={() => setActiveTab('create')} className={activeTab === 'create' ? 'active' : ''}>
          Create Ticket
        </button>
        <button onClick={() => setActiveTab('knowledge')} className={activeTab === 'knowledge' ? 'active' : ''}>
          Knowledge Base
        </button>
        <button onClick={() => setActiveTab('support')} className={activeTab === 'support' ? 'active' : ''}>
          Live Support
        </button>
      </nav>

      {activeTab === 'home' && (
        <div className="home-tab">
          <h2>Support Dashboard</h2>
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          <div className="tickets-grid">
            {tickets.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())).map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <h3>{ticket.title}</h3>
                <span className={`status ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                  {ticket.status}
                </span>
                <p>Priority: {ticket.priority}</p>
                <p>Category: {ticket.category}</p>
                <select onChange={(e) => updateTicketStatus(ticket.id, e.target.value)} value={ticket.status}>
                  <option value="Open">Open</option>
                  <option value="In progress">In progress</option>
                  <option value="On hold">On hold</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create' && <CreateTicketForm onSubmit={createTicket} />}
      {activeTab === 'knowledge' && <KnowledgeBase />}
      {activeTab === 'support' && <LiveSupport />}
    </div>
  );
};

const CreateTicketForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '', category: 'Technical issue', priority: 'Medium', description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: '', category: 'Technical issue', priority: 'Medium', description: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="create-ticket-form">
      <h2>Create New Ticket</h2>
      <input
        type="text"
        placeholder="Ticket Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      >
        <option value="Technical issue">Technical issue</option>
        <option value="HR issue">HR issue</option>
        <option value="Finance issue">Finance issue</option>
        <option value="Access request">Access request</option>
        <option value="Others">Others</option>
      </select>
      <select
        value={formData.priority}
        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </select>
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        required
      />
      <button type="submit">Create Ticket</button>
    </form>
  );
};

const KnowledgeBase = () => {
  const articles = [
    { id: 1, title: 'How to reset password', category: 'Account' },
    { id: 2, title: 'Troubleshooting login issues', category: 'Technical' },
    { id: 3, title: 'Submit expense reports', category: 'Finance' }
  ];

  return (
    <div className="knowledge-base">
      <h2>Knowledge Base</h2>
      <input type="text" placeholder="Search articles..." className="search-bar" />
      <div className="articles-list">
        {articles.map(article => (
          <div key={article.id} className="article-item">
            <h3>{article.title}</h3>
            <span className="category">{article.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LiveSupport = () => (
  <div className="live-support">
    <h2>Live Support Options</h2>
    <div className="support-options">
      <button className="chat-btn">Start Live Chat</button>
      <button className="call-btn">Request Call Back</button>
      <button className="session-btn">Schedule Session</button>
    </div>
  </div>
);

export default SupportPortal;
