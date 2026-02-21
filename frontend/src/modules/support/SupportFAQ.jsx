import React, { useState, useEffect } from 'react';
import { Plus, Search, ThumbsUp, ThumbsDown, Edit, Trash2, Eye, Star } from 'lucide-react';
import supportService from '@/services/supportService';
import { toast } from 'react-hot-toast';

const SupportFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    is_published: '',
    is_featured: ''
  });

  const [newFAQ, setNewFAQ] = useState({
    category: '',
    question: '',
    answer: '',
    keywords: [],
    is_published: true,
    is_featured: false,
    sort_order: 0
  });

  useEffect(() => {
    fetchFAQs();
  }, [filters]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.is_published) params.is_published = filters.is_published;
      if (filters.is_featured) params.is_featured = filters.is_featured;
      
      const response = await supportService.getFAQs(params);
      setFaqs(response.data?.faqs || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFAQ = async (e) => {
    e.preventDefault();
    try {
      await supportService.createFAQ(newFAQ);
      toast.success('FAQ created successfully');
      setShowCreateModal(false);
      setNewFAQ({
        category: '',
        question: '',
        answer: '',
        keywords: [],
        is_published: true,
        is_featured: false,
        sort_order: 0
      });
      fetchFAQs();
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast.error('Failed to create FAQ');
    }
  };

  const handleVote = async (id, helpful) => {
    try {
      await supportService.voteFAQ(id, helpful);
      toast.success('Thank you for your feedback!');
      fetchFAQs();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to submit vote');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    
    try {
      await supportService.deleteFAQ(id);
      toast.success('FAQ deleted successfully');
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  const categories = [...new Set(faqs.map(faq => faq.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600">Manage frequently asked questions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New FAQ
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filters.is_published}
            onChange={(e) => setFilters({ ...filters, is_published: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
          <select
            value={filters.is_featured}
            onChange={(e) => setFilters({ ...filters, is_featured: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">All FAQs</option>
            <option value="true">Featured Only</option>
          </select>
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading FAQs...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
            <p className="text-gray-600">Create your first FAQ to get started</p>
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {faq.is_featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                  </div>
                  {faq.category && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {faq.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    faq.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {faq.is_published ? 'Published' : 'Draft'}
                  </span>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mb-4 whitespace-pre-wrap">{faq.answer}</p>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {faq.view_count || 0} views
                  </span>
                  <span className="flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {faq.helpful_count || 0} helpful
                  </span>
                  <span className="flex items-center">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {faq.not_helpful_count || 0} not helpful
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleVote(faq.id, true)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Helpful
                  </button>
                  <button
                    onClick={() => handleVote(faq.id, false)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Not Helpful
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create FAQ Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New FAQ</h2>
            <form onSubmit={handleCreateFAQ} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newFAQ.category}
                  onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Getting Started, Billing, Technical"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={newFAQ.question}
                  onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="What is your question?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
                <textarea
                  required
                  rows={6}
                  value={newFAQ.answer}
                  onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Provide a detailed answer..."
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newFAQ.is_published}
                    onChange={(e) => setNewFAQ({ ...newFAQ, is_published: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Publish immediately</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newFAQ.is_featured}
                    onChange={(e) => setNewFAQ({ ...newFAQ, is_featured: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Feature this FAQ</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
                >
                  Create FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportFAQ;
