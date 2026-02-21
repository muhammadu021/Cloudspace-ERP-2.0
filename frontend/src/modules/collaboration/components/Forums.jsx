import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Users,
  Eye,
  MessageCircle,
  Clock,
  TrendingUp,
  Star,
  Pin,
  Lock,
  Globe,
  Hash,
  Edit3,
  Trash2,
  Reply,
  ChevronRight,
  Home,
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Send,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Share2,
  Bookmark,
  X,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import collaborationService from '../../../services/collaborationService';

const Forums = () => {
  const [view, setView] = useState('forums'); // forums, topics, posts
  const [forums, setForums] = useState([]);
  const [topics, setTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modals
  const [showCreateForumModal, setShowCreateForumModal] = useState(false);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  
  // Forms
  const [newForum, setNewForum] = useState({
    name: '',
    description: '',
    forum_type: 'general',
    category: '',
    visibility: 'public',
    access_level: 'full_access',
    department_id: '',
    project_id: '',
    icon: '',
    color: '#3498db'
  });
  
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: '',
    topic_type: 'discussion',
    priority: 'normal',
    tags: [],
    department_id: '',
    project_id: ''
  });
  
  const [newPost, setNewPost] = useState({
    content: '',
    reply_to_post_id: null,
    mentions: []
  });

  useEffect(() => {
    if (view === 'forums') {
      fetchForums();
    } else if (view === 'topics' && selectedForum) {
      fetchTopics(selectedForum.id);
    } else if (view === 'posts' && selectedTopic) {
      fetchPosts(selectedTopic.id);
    }
  }, [view, selectedForum, selectedTopic, currentPage, searchTerm, typeFilter, categoryFilter, sortBy]);

  const fetchForums = async () => {
    try {
      setLoading(true);
      const params = {
        ...(typeFilter && { type: typeFilter }),
        ...(categoryFilter && { category: categoryFilter })
      };

      const response = await collaborationService.getForums(params);

      if (response.data.success) {
        setForums(response.data.data.forums);
      } else {
        setError('Failed to fetch forums');
      }
    } catch (error) {
      console.error('Error fetching forums:', error);
      setError(error.response?.data?.message || 'Failed to fetch forums');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (forumId) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        sort: sortBy,
        ...(searchTerm && { search: searchTerm })
      };

      const response = await collaborationService.getForumTopics(forumId, params);

      if (response.data.success) {
        setTopics(response.data.data.topics);
        setTotalPages(response.data.data.pagination.pages);
      } else {
        setError('Failed to fetch topics');
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
      setError(error.response?.data?.message || 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (topicId) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20
      };

      const response = await collaborationService.getForumPosts(topicId, params);

      if (response.data.success) {
        setPosts(response.data.data.posts);
        setTotalPages(response.data.data.pagination.pages);
      } else {
        setError('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createForum = async () => {
    try {
      const response = await collaborationService.createForum(newForum);

      if (response.data.success) {
        setForums([...forums, response.data.data.forum]);
        setShowCreateForumModal(false);
        setNewForum({
          name: '',
          description: '',
          forum_type: 'general',
          category: '',
          visibility: 'public',
          access_level: 'full_access',
          department_id: '',
          project_id: '',
          icon: '',
          color: '#3498db'
        });
      } else {
        setError('Failed to create forum');
      }
    } catch (error) {
      console.error('Error creating forum:', error);
      setError(error.response?.data?.message || 'Failed to create forum');
    }
  };

  const createTopic = async () => {
    try {
      const response = await collaborationService.createForumTopic(
        selectedForum.id,
        newTopic,
        null // files - can be added later if needed
      );

      if (response.data.success) {
        setTopics([response.data.data.topic, ...topics]);
        setShowCreateTopicModal(false);
        setNewTopic({
          title: '',
          content: '',
          topic_type: 'discussion',
          priority: 'normal',
          tags: [],
          department_id: '',
          project_id: ''
        });
      } else {
        setError('Failed to create topic');
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      setError(error.response?.data?.message || 'Failed to create topic');
    }
  };

  const createPost = async () => {
    try {
      const response = await collaborationService.createForumPost(
        selectedTopic.id,
        newPost,
        null // files - can be added later if needed
      );

      if (response.data.success) {
        setPosts([...posts, response.data.data.post]);
        setShowCreatePostModal(false);
        setNewPost({
          content: '',
          reply_to_post_id: null,
          mentions: []
        });
      } else {
        setError('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.message || 'Failed to create post');
    }
  };

  const navigateToTopics = (forum) => {
    setSelectedForum(forum);
    setView('topics');
    setCurrentPage(1);
  };

  const navigateToPosts = (topic) => {
    setSelectedTopic(topic);
    setView('posts');
    setCurrentPage(1);
  };

  const navigateBack = () => {
    if (view === 'posts') {
      setView('topics');
      setSelectedTopic(null);
    } else if (view === 'topics') {
      setView('forums');
      setSelectedForum(null);
    }
    setCurrentPage(1);
  };

  const getForumIcon = (type) => {
    switch (type) {
      case 'general':
        return <MessageSquare className="h-5 w-5" />;
      case 'department':
        return <Users className="h-5 w-5" />;
      case 'project':
        return <Hash className="h-5 w-5" />;
      case 'announcement':
        return <MessageCircle className="h-5 w-5" />;
      case 'qa':
        return <Info className="h-5 w-5" />;
      case 'social':
        return <Users className="h-5 w-5" />;
      case 'technical':
        return <Hash className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getForumTypeColor = (type) => {
    switch (type) {
      case 'general':
        return 'text-primary';
      case 'department':
        return 'text-green-600';
      case 'project':
        return 'text-purple-600';
      case 'announcement':
        return 'text-orange-600';
      case 'qa':
        return 'text-yellow-600';
      case 'social':
        return 'text-pink-600';
      case 'technical':
        return 'text-gray-600';
      default:
        return 'text-primary';
    }
  };

  const getTopicTypeIcon = (type) => {
    switch (type) {
      case 'discussion':
        return <MessageSquare className="h-4 w-4" />;
      case 'question':
        return <Info className="h-4 w-4" />;
      case 'announcement':
        return <MessageCircle className="h-4 w-4" />;
      case 'poll':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-primary-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading && (forums.length === 0 && topics.length === 0 && posts.length === 0)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading forums...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {view !== 'forums' && (
            <button
              onClick={navigateBack}
              className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
              <Home className="h-4 w-4" />
              <span>Forums</span>
              {selectedForum && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span>{selectedForum.name}</span>
                </>
              )}
              {selectedTopic && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span>{selectedTopic.title}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {view === 'forums' && 'Discussion Forums'}
              {view === 'topics' && selectedForum?.name}
              {view === 'posts' && selectedTopic?.title}
            </h1>
            <p className="text-gray-600 mt-1">
              {view === 'forums' && 'Join the conversation and share knowledge'}
              {view === 'topics' && selectedForum?.description}
              {view === 'posts' && 'Join the discussion'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {view === 'forums' && (
            <button
              onClick={() => setShowCreateForumModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Forum</span>
            </button>
          )}
          {view === 'topics' && (
            <button
              onClick={() => setShowCreateTopicModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Topic</span>
            </button>
          )}
          {view === 'posts' && (
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <Reply className="h-4 w-4" />
              <span>Reply</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {(view === 'topics' || view === 'forums') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={`Search ${view}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {view === 'forums' && (
              <>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="general">General</option>
                  <option value="department">Department</option>
                  <option value="project">Project</option>
                  <option value="announcement">Announcement</option>
                  <option value="qa">Q&A</option>
                  <option value="social">Social</option>
                  <option value="technical">Technical</option>
                </select>

                <input
                  type="text"
                  placeholder="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </>
            )}

            {view === 'topics' && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="latest">Latest</option>
                <option value="popular">Popular</option>
                <option value="oldest">Oldest</option>
              </select>
            )}

            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('');
                setCategoryFilter('');
                setSortBy('latest');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {view === 'forums' && (
        <div className="grid grid-cols-1 gap-4">
          {forums.length > 0 ? (
            forums.map((forum) => (
              <div
                key={forum.id}
                onClick={() => navigateToTopics(forum)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${getForumTypeColor(forum.forum_type)} bg-opacity-10`}>
                      {getForumIcon(forum.forum_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{forum.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          forum.visibility === 'public' ? 'bg-green-100 text-green-800' :
                          forum.visibility === 'private' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {forum.visibility}
                        </span>
                        {forum.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{forum.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{forum.topic_count} topics</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{forum.post_count} posts</span>
                        </div>
                        {forum.last_activity_at && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Last activity {formatRelativeTime(forum.last_activity_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle forum actions
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forums found</h3>
              <p className="text-gray-500">
                {searchTerm || typeFilter || categoryFilter
                  ? 'Try adjusting your filters to see more results.'
                  : 'No forums have been created yet.'}
              </p>
            </div>
          )}
        </div>
      )}

      {view === 'topics' && (
        <div className="space-y-4">
          {topics.length > 0 ? (
            topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => navigateToPosts(topic)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {topic.is_sticky && <Pin className="h-4 w-4 text-yellow-600" />}
                      {topic.is_locked && <Lock className="h-4 w-4 text-red-600" />}
                      <div className="flex items-center space-x-1">
                        {getTopicTypeIcon(topic.topic_type)}
                        <span className="text-sm text-gray-600 capitalize">{topic.topic_type}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(topic.priority)}`}>
                        {topic.priority}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{topic.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {topic.creator?.first_name} {topic.creator?.last_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatRelativeTime(topic.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{topic.post_count} replies</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{topic.view_count} views</span>
                      </div>
                    </div>
                    {topic.tags && Array.isArray(topic.tags) && topic.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {topic.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {topic.last_post_at && (
                      <div className="text-right text-sm text-gray-500">
                        <div>Last post</div>
                        <div>{formatRelativeTime(topic.last_post_at)}</div>
                        {topic.lastPostBy && (
                          <div>by {topic.lastPostBy.first_name}</div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle topic actions
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No topics found</h3>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search to see more results.'
                  : 'No topics have been created in this forum yet.'}
              </p>
            </div>
          )}
        </div>
      )}

      {view === 'posts' && (
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {post.creator?.first_name?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">
                          {post.creator?.first_name} {post.creator?.last_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          #{post.post_number}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(post.created_at)}
                        </span>
                        {post.is_edited && (
                          <span className="text-xs text-gray-500 italic">edited</span>
                        )}
                      </div>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {post.replyToPost && (
                      <div className="bg-gray-50 border-l-4 border-gray-300 p-3 mb-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Replying to #{post.replyToPost.post_number} by {post.replyToPost.creator?.first_name}
                        </div>
                        <div className="text-sm text-gray-700 line-clamp-2">
                          {post.replyToPost.content}
                        </div>
                      </div>
                    )}
                    
                    <div className="prose max-w-none mb-4">
                      <div className="whitespace-pre-wrap text-gray-900">
                        {post.content}
                      </div>
                    </div>
                    
                    {post.attachments && Array.isArray(post.attachments) && post.attachments.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Attachments:</div>
                        <div className="space-y-1">
                          {post.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-primary">
                              <Paperclip className="h-4 w-4" />
                              <span>{attachment.originalname}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-primary">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Like</span>
                      </button>
                      <button
                        onClick={() => {
                          setNewPost({ ...newPost, reply_to_post_id: post.id });
                          setShowCreatePostModal(true);
                        }}
                        className="flex items-center space-x-1 text-gray-500 hover:text-primary"
                      >
                        <Reply className="h-4 w-4" />
                        <span>Reply</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-primary">
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600">
                        <Flag className="h-4 w-4" />
                        <span>Report</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">Be the first to start the discussion!</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Forum Modal */}
      {showCreateForumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create Forum</h3>
              <button
                onClick={() => setShowCreateForumModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newForum.name}
                  onChange={(e) => setNewForum({ ...newForum, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter forum name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newForum.description}
                  onChange={(e) => setNewForum({ ...newForum, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter forum description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newForum.forum_type}
                    onChange={(e) => setNewForum({ ...newForum, forum_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newForum.category}
                    onChange={(e) => setNewForum({ ...newForum, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Optional category"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visibility
                  </label>
                  <select
                    value={newForum.visibility}
                    onChange={(e) => setNewForum({ ...newForum, visibility: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Level
                  </label>
                  <select
                    value={newForum.access_level}
                    onChange={(e) => setNewForum({ ...newForum, access_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="full_access">Full Access</option>
                    <option value="post_only">Post Only</option>
                    <option value="read_only">Read Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForumModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createForum}
                disabled={!newForum.name}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Forum
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Topic Modal */}
      {showCreateTopicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create Topic</h3>
              <button
                onClick={() => setShowCreateTopicModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter topic title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={newTopic.content}
                  onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter topic content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newTopic.topic_type}
                    onChange={(e) => setNewTopic({ ...newTopic, topic_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="discussion">Discussion</option>
                    <option value="question">Question</option>
                    <option value="announcement">Announcement</option>
                    <option value="poll">Poll</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTopic.priority}
                    onChange={(e) => setNewTopic({ ...newTopic, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateTopicModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createTopic}
                disabled={!newTopic.title || !newTopic.content}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {newPost.reply_to_post_id ? 'Reply to Post' : 'Create Post'}
              </h3>
              <button
                onClick={() => setShowCreatePostModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your post content"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreatePostModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createPost}
                disabled={!newPost.content}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{newPost.reply_to_post_id ? 'Reply' : 'Post'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forums;