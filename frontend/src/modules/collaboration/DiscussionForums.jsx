import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Plus, Users, Pin, Lock, Eye, MessageCircle, ThumbsUp, User } from 'lucide-react';
import { collaborationService } from '../../services/collaborationService';
import toast from 'react-hot-toast';

const DiscussionForums = () => {
  const navigate = useNavigate();
  const { forumId, topicId } = useParams();
  const [loading, setLoading] = useState(true);
  const [forums, setForums] = useState([]);
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showCreateForumForm, setShowCreateForumForm] = useState(false);
  const [showCreateTopicForm, setShowCreateTopicForm] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  
  // Form data
  const [newForum, setNewForum] = useState({
    name: '',
    description: '',
    forum_type: 'general',
    visibility: 'public'
  });
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    topic_type: 'discussion',
    priority: 'normal'
  });
  const [newPost, setNewPost] = useState({
    content: ''
  });

  useEffect(() => {
    loadForums();
  }, []);

  useEffect(() => {
    if (forumId) {
      loadTopics(forumId);
      if (forums.length > 0) {
        const forum = forums.find(f => f.id === parseInt(forumId));
        if (forum) {
          setSelectedForum(forum);
        }
      }
    } else {
      setSelectedForum(null);
      setTopics([]);
    }
  }, [forumId, forums]);

  useEffect(() => {
    if (topicId) {
      loadPosts(topicId);
      if (topics.length > 0) {
        const topic = topics.find(t => t.id === parseInt(topicId));
        if (topic) {
          setSelectedTopic(topic);
        }
      }
    } else {
      setSelectedTopic(null);
      setPosts([]);
    }
  }, [topicId, topics]);

  const loadForums = async () => {
    try {
      setLoading(true);
      const response = await collaborationService.getForums();
      setForums(response.data?.data?.forums || []);
    } catch (error) {
      console.error('Load forums error:', error);
      toast.error('Failed to load forums');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForum = async () => {
    try {
      if (!newForum.name || !newForum.description) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const response = await collaborationService.createForum(newForum);
      
      if (response.data.success) {
        toast.success('Forum created successfully');
        setShowCreateForumForm(false);
        setNewForum({
          name: '',
          description: '',
          forum_type: 'general',
          visibility: 'public'
        });
        loadForums();
      }
    } catch (error) {
      console.error('Create forum error:', error);
      toast.error(error.response?.data?.message || 'Failed to create forum');
    }
  };

  const loadTopics = async (forumId) => {
    try {
      const response = await collaborationService.getForumTopics(forumId, { limit: 50 });
      setTopics(response.data?.data?.topics || []);
    } catch (error) {
      console.error('Load topics error:', error);
      toast.error('Failed to load topics');
    }
  };

  const loadPosts = async (topicId) => {
    try {
      const response = await collaborationService.getForumPosts(topicId, { limit: 50 });
      setPosts(response.data?.data?.posts || []);
    } catch (error) {
      console.error('Load posts error:', error);
      toast.error('Failed to load posts');
    }
  };

  const handleCreateTopic = async () => {
    try {
      if (!newTopic.title || !newTopic.content) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const currentForumId = forumId || selectedForum?.id;
      if (!currentForumId) {
        toast.error('Forum not found');
        return;
      }
      
      const response = await collaborationService.createForumTopic(
        currentForumId,
        newTopic,
        null
      );
      
      if (response.data.success) {
        toast.success('Topic created successfully');
        setShowCreateTopicForm(false);
        setNewTopic({
          title: '',
          content: '',
          topic_type: 'discussion',
          priority: 'normal'
        });
        loadTopics(currentForumId);
      }
    } catch (error) {
      console.error('Create topic error:', error);
      toast.error(error.response?.data?.message || 'Failed to create topic');
    }
  };

  const handleCreatePost = async () => {
    try {
      if (!newPost.content) {
        toast.error('Please enter a reply');
        return;
      }
      
      const currentTopicId = topicId || selectedTopic?.id;
      if (!currentTopicId) {
        toast.error('Topic not found');
        return;
      }
      
      const response = await collaborationService.createForumPost(
        currentTopicId,
        newPost,
        null
      );
      
      if (response.data.success) {
        toast.success('Reply posted successfully');
        setShowReplyForm(false);
        setNewPost({ content: '' });
        loadPosts(currentTopicId);
      }
    } catch (error) {
      console.error('Create post error:', error);
      toast.error(error.response?.data?.message || 'Failed to post reply');
    }
  };

  const getForumTypeColor = (type) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      department: 'bg-green-100 text-green-800',
      project: 'bg-purple-100 text-purple-800',
      announcement: 'bg-orange-100 text-orange-800',
      qa: 'bg-yellow-100 text-yellow-800',
      social: 'bg-pink-100 text-pink-800',
      technical: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.general;
  };

  const getTopicTypeIcon = (type) => {
    const icons = {
      discussion: MessageSquare,
      question: MessageCircle,
      announcement: Pin,
      poll: ThumbsUp
    };
    return icons[type] || MessageSquare;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-500',
      normal: 'text-primary',
      high: 'text-orange-500',
      urgent: 'text-red-500'
    };
    return colors[priority] || colors.normal;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine which view to show
  let content;

  if (topicId && selectedTopic) {
    // Posts view
    content = (
      <div className="space-y-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <button 
            onClick={() => navigate('/collaboration/forums')}
            className="hover:text-primary"
          >
            Forums
          </button>
          <span>/</span>
          <button 
            onClick={() => navigate(`/collaboration/forums/${forumId}`)}
            className="hover:text-primary"
          >
            {selectedForum?.name || 'Forum'}
          </button>
          <span>/</span>
          <span className="text-gray-900">{selectedTopic.title}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {selectedTopic.is_sticky && <Pin className="w-4 h-4 text-orange-500" />}
                {selectedTopic.is_locked && <Lock className="w-4 h-4 text-red-500" />}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getForumTypeColor(selectedTopic.topic_type)}`}>
                  {selectedTopic.topic_type}
                </span>
                <span className={`text-sm ${getPriorityColor(selectedTopic.priority)}`}>
                  {selectedTopic.priority} priority
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedTopic.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {selectedTopic.creator?.first_name} {selectedTopic.creator?.last_name}
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {selectedTopic.view_count || 0} views
                </div>
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {selectedTopic.post_count || 0} replies
                </div>
                <span>{collaborationService.formatRelativeTime(selectedTopic.created_at)}</span>
              </div>
            </div>
            <button 
              onClick={() => setShowReplyForm(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
            >
              Reply
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map((post, index) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {post.creator?.first_name} {post.creator?.last_name}
                      </span>
                      {index === 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Original Post
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {collaborationService.formatRelativeTime(post.created_at)}
                    </span>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-900">{post.content}</p>
                  </div>
                  {post.attachments && Array.isArray(post.attachments) && post.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {post.attachments.map((attachment, idx) => (
                        <div key={idx} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                          <span className="text-sm text-gray-700">{attachment.originalname}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Be the first to reply to this topic.</p>
          </div>
        )}
      </div>
    );
  } else if (forumId && selectedForum) {
    // Topics view
    content = (
      <div className="space-y-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <button 
            onClick={() => navigate('/collaboration/forums')}
            className="hover:text-primary"
          >
            Forums
          </button>
          <span>/</span>
          <span className="text-gray-900">{selectedForum.name}</span>
        </nav>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedForum.name}</h1>
              <p className="text-gray-600">{selectedForum.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{selectedForum.topic_count || 0} topics</span>
                <span>{selectedForum.post_count || 0} posts</span>
              </div>
            </div>
            <button 
              onClick={() => setShowCreateTopicForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
            >
              <Plus className="w-4 h-4" />
              New Topic
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {topics.map((topic) => {
              const TopicIcon = getTopicTypeIcon(topic.topic_type);
              return (
                <div
                  key={topic.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/collaboration/forums/${forumId}/topics/${topic.id}`)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TopicIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {topic.is_sticky && <Pin className="w-4 h-4 text-orange-500" />}
                        {topic.is_locked && <Lock className="w-4 h-4 text-red-500" />}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getForumTypeColor(topic.topic_type)}`}>
                          {topic.topic_type}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{topic.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {topic.creator?.first_name} {topic.creator?.last_name}
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {topic.view_count || 0} views
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {topic.post_count || 0} replies
                        </div>
                        <span>{collaborationService.formatRelativeTime(topic.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {topics.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No topics yet</h3>
              <p className="text-gray-600">Start the first discussion in this forum.</p>
            </div>
          )}
        </div>
      </div>
    );
  } else {
    // Forums list view
    content = (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discussion Forums</h1>
            <p className="text-gray-600">Engage in discussions and share knowledge with your team</p>
          </div>
          <button 
            onClick={() => setShowCreateForumForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
          >
            <Plus className="w-4 h-4" />
            New Forum
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forums.map((forum) => (
            <div
              key={forum.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/collaboration/forums/${forum.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getForumTypeColor(forum.forum_type)}`}>
                    {forum.forum_type}
                  </span>
                </div>
                {forum.visibility === 'private' && <Lock className="w-4 h-4 text-gray-400" />}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{forum.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{forum.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {forum.topic_count || 0} topics
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {forum.post_count || 0} posts
                  </div>
                </div>
                <span>{collaborationService.formatRelativeTime(forum.last_activity_at || forum.created_at)}</span>
              </div>
            </div>
          ))}
        </div>

        {forums.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forums yet</h3>
            <p className="text-gray-600">Create your first forum to start discussions.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {content}

      {/* Create Topic Modal */}
      {showCreateTopicForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Create New Topic</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Topic title"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  placeholder="Topic content"
                  rows={6}
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    value={newTopic.topic_type}
                    onChange={(e) => setNewTopic({ ...newTopic, topic_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  >
                    <option value="discussion">Discussion</option>
                    <option value="question">Question</option>
                    <option value="announcement">Announcement</option>
                    <option value="poll">Poll</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    value={newTopic.priority}
                    onChange={(e) => setNewTopic({ ...newTopic, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateTopicForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTopic}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Forum Modal */}
      {showCreateForumForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Create New Forum</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forum Name *</label>
                <input
                  type="text"
                  placeholder="Enter forum name"
                  value={newForum.name}
                  onChange={(e) => setNewForum({ ...newForum, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  placeholder="Describe the purpose of this forum"
                  rows={4}
                  value={newForum.description}
                  onChange={(e) => setNewForum({ ...newForum, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forum Type</label>
                  <select 
                    value={newForum.forum_type}
                    onChange={(e) => setNewForum({ ...newForum, forum_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="department">Department</option>
                    <option value="project">Project</option>
                    <option value="announcement">Announcement</option>
                    <option value="qa">Q&A</option>
                    <option value="social">Social</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                  <select 
                    value={newForum.visibility}
                    onChange={(e) => setNewForum({ ...newForum, visibility: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCreateForumForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateForum}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
                >
                  Create Forum
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Form Modal */}
      {showReplyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Reply to Topic</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
                <textarea
                  placeholder="Write your reply..."
                  rows={6}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowReplyForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
                >
                  Post Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DiscussionForums;
