import api from './api'
import { getCompanyId } from '../utils/company'

export const collaborationService = {
  // Dashboard
  getCollaborationDashboard: () => {
    const company_id = getCompanyId();
    return api.get('/collaboration/dashboard', { params: { company_id } });
  },

  // Message Threads
  getMessageThreads: (params) => {
    const company_id = getCompanyId();
    return api.get('/collaboration/messages', { params: { ...params, company_id } });
  },
  createMessageThread: (threadData) => {
    const company_id = getCompanyId();
    return api.post('/collaboration/messages', { ...threadData, company_id });
  },
  getMessages: (threadId, params) => {
    const company_id = getCompanyId();
    return api.get(`/collaboration/messages/${threadId}`, { params: { ...params, company_id } });
  },
  getStaffList: (params) => {
    const company_id = getCompanyId();
    return api.get('/collaboration/staff', { params: { ...params, company_id } });
  },
  sendMessage: (threadId, messageData, files) => {
    const company_id = getCompanyId();
    const formData = new FormData();
    Object.keys(messageData).forEach(key => {
      if (Array.isArray(messageData[key])) {
        formData.append(key, JSON.stringify(messageData[key]));
      } else {
        formData.append(key, messageData[key]);
      }
    });
    formData.append('company_id', company_id);
    if (files) {
      files.forEach(file => formData.append('attachments', file));
    }
    return api.post(`/collaboration/messages/${threadId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateMessage: (threadId, messageId, messageData) => {
    const company_id = getCompanyId();
    return api.put(`/collaboration/messages/${threadId}/${messageId}`, { ...messageData, company_id });
  },
  deleteMessage: (threadId, messageId) => {
    const company_id = getCompanyId();
    return api.delete(`/collaboration/messages/${threadId}/${messageId}`, { params: { company_id } });
  },

  // Announcements
  getAnnouncements: (params) => {
    const company_id = getCompanyId();
    return api.get('/collaboration/announcements', { params: { ...params, company_id } });
  },
  createAnnouncement: (announcementData, files) => {
    console.log('=== createAnnouncement called ===');
    console.log('Input data:', announcementData);
    console.log('Files:', files);
    
    const company_id = getCompanyId();
    // ALWAYS use FormData because backend route has multer middleware
    const formData = new FormData();
    
    // Manually add each field to ensure they're added
    if (announcementData.title) {
      formData.append('title', announcementData.title);
      console.log('Added title:', announcementData.title);
    }
    if (announcementData.content) {
      formData.append('content', announcementData.content);
      console.log('Added content:', announcementData.content);
    }
    if (announcementData.announcement_type) {
      formData.append('announcement_type', announcementData.announcement_type);
    }
    if (announcementData.priority) {
      formData.append('priority', announcementData.priority);
    }
    if (announcementData.requires_acknowledgment !== undefined) {
      formData.append('requires_acknowledgment', String(announcementData.requires_acknowledgment));
    }
    if (announcementData.summary) {
      formData.append('summary', announcementData.summary);
    }
    formData.append('company_id', company_id);
    
    // Add files if present
    if (files && files.length > 0) {
      files.forEach(file => formData.append('attachments', file));
    }
    
    console.log('FormData created. Entries:');
    for (let pair of formData.entries()) {
      console.log('  ' + pair[0] + ': ' + pair[1]);
    }
    
    console.log('Sending POST request to /collaboration/announcements');
    return api.post('/collaboration/announcements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateAnnouncement: (announcementId, announcementData, files) => {
    const company_id = getCompanyId();
    // ALWAYS use FormData because backend route has multer middleware
    const formData = new FormData();
    
    Object.keys(announcementData).forEach(key => {
      const value = announcementData[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          // Convert boolean to string for FormData
          formData.append(key, String(value));
        }
      }
    });
    
    formData.append('company_id', company_id);
    
    // Add files if present
    if (files && files.length > 0) {
      files.forEach(file => formData.append('attachments', file));
    }
    
    console.log('Updating announcement as FormData');
    return api.put(`/collaboration/announcements/${announcementId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteAnnouncement: (announcementId) => {
    const company_id = getCompanyId();
    return api.delete(`/collaboration/announcements/${announcementId}`, { params: { company_id } });
  },
  acknowledgeAnnouncement: (announcementId) => {
    const company_id = getCompanyId();
    return api.post(`/collaboration/announcements/${announcementId}/acknowledge`, { company_id });
  },

  // Calendar Events
  getCalendarEvents: (params) => {
    const company_id = getCompanyId();
    return api.get('/collaboration/calendar/events', { params: { ...params, company_id } });
  },
  createCalendarEvent: (eventData, files) => {
    const company_id = getCompanyId();
    // If there are files, use FormData
    if (files && files.length > 0) {
      const formData = new FormData();
      Object.keys(eventData).forEach(key => {
        if (eventData[key] !== null && eventData[key] !== undefined && eventData[key] !== '') {
          if (Array.isArray(eventData[key])) {
            formData.append(key, JSON.stringify(eventData[key]));
          } else {
            formData.append(key, eventData[key]);
          }
        }
      });
      formData.append('company_id', company_id);
      files.forEach(file => formData.append('attachments', file));
      return api.post('/collaboration/calendar/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    // Otherwise, send as JSON (cleaner and better for validation)
    // Remove empty string values to avoid validation issues
    const cleanedData = {};
    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined && eventData[key] !== '') {
        cleanedData[key] = eventData[key];
      }
    });
    cleanedData.company_id = company_id;
    
    return api.post('/collaboration/calendar/events', cleanedData);
  },
  updateCalendarEvent: (eventId, eventData, files) => {
    const company_id = getCompanyId();
    // If there are files, use FormData
    if (files && files.length > 0) {
      const formData = new FormData();
      Object.keys(eventData).forEach(key => {
        if (eventData[key] !== null && eventData[key] !== undefined && eventData[key] !== '') {
          if (Array.isArray(eventData[key])) {
            formData.append(key, JSON.stringify(eventData[key]));
          } else {
            formData.append(key, eventData[key]);
          }
        }
      });
      formData.append('company_id', company_id);
      files.forEach(file => formData.append('attachments', file));
      return api.put(`/collaboration/calendar/events/${eventId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    // Otherwise, send as JSON
    const cleanedData = {};
    Object.keys(eventData).forEach(key => {
      if (eventData[key] !== null && eventData[key] !== undefined && eventData[key] !== '') {
        cleanedData[key] = eventData[key];
      }
    });
    cleanedData.company_id = company_id;
    
    return api.put(`/collaboration/calendar/events/${eventId}`, cleanedData);
  },
  deleteCalendarEvent: (eventId) => {
    const company_id = getCompanyId();
    return api.delete(`/collaboration/calendar/events/${eventId}`, { params: { company_id } });
  },

  // Shared Documents
  getSharedDocuments: (params) => {
    const company_id = getCompanyId();
    return api.get('/collaboration/documents', { params: { ...params, company_id } });
  },
  uploadSharedDocument: (documentData, file) => {
    const company_id = getCompanyId();
    const formData = new FormData();
    Object.keys(documentData).forEach(key => {
      if (Array.isArray(documentData[key])) {
        formData.append(key, JSON.stringify(documentData[key]));
      } else {
        formData.append(key, documentData[key]);
      }
    });
    formData.append('company_id', company_id);
    if (file) {
      formData.append('file', file);
    }
    return api.post('/collaboration/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadSharedDocument: (documentId) => {
    const company_id = getCompanyId();
    return api.get(`/collaboration/documents/${documentId}/download`, {
      params: { company_id },
      responseType: 'blob'
    });
  },

  // Forums
  getForums: (params) => {
    const company_id = getCompanyId();
    return api.get('/collaboration/forums', { params: { ...params, company_id } });
  },
  createForum: (forumData) => {
    const company_id = getCompanyId();
    return api.post('/collaboration/forums', { ...forumData, company_id });
  },
  updateForum: (forumId, forumData) => {
    const company_id = getCompanyId();
    return api.put(`/collaboration/forums/${forumId}`, { ...forumData, company_id });
  },
  deleteForum: (forumId) => {
    const company_id = getCompanyId();
    return api.delete(`/collaboration/forums/${forumId}`, { params: { company_id } });
  },

  // Forum Topics
  getForumTopics: (forumId, params) => {
    const company_id = getCompanyId();
    return api.get(`/collaboration/forums/${forumId}/topics`, { params: { ...params, company_id } });
  },
  createForumTopic: (forumId, topicData, files) => {
    const company_id = getCompanyId();
    if (files && files.length > 0) {
      const formData = new FormData();
      Object.keys(topicData).forEach(key => {
        if (Array.isArray(topicData[key])) {
          formData.append(key, JSON.stringify(topicData[key]));
        } else {
          formData.append(key, topicData[key]);
        }
      });
      formData.append('company_id', company_id);
      files.forEach(file => formData.append('attachments', file));
      return api.post(`/collaboration/forums/${forumId}/topics`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      return api.post(`/collaboration/forums/${forumId}/topics`, { ...topicData, company_id });
    }
  },
  updateForumTopic: (forumId, topicId, topicData) => {
    const company_id = getCompanyId();
    return api.put(`/collaboration/forums/${forumId}/topics/${topicId}`, { ...topicData, company_id });
  },
  deleteForumTopic: (forumId, topicId) => {
    const company_id = getCompanyId();
    return api.delete(`/collaboration/forums/${forumId}/topics/${topicId}`, { params: { company_id } });
  },

  // Forum Posts
  getForumPosts: (topicId, params) => {
    const company_id = getCompanyId();
    return api.get(`/collaboration/forums/topics/${topicId}/posts`, { params: { ...params, company_id } });
  },
  createForumPost: (topicId, postData, files) => {
    const company_id = getCompanyId();
    if (files && files.length > 0) {
      const formData = new FormData();
      Object.keys(postData).forEach(key => {
        if (Array.isArray(postData[key])) {
          formData.append(key, JSON.stringify(postData[key]));
        } else {
          formData.append(key, postData[key]);
        }
      });
      formData.append('company_id', company_id);
      files.forEach(file => formData.append('attachments', file));
      return api.post(`/collaboration/forums/topics/${topicId}/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      return api.post(`/collaboration/forums/topics/${topicId}/posts`, { ...postData, company_id });
    }
  },
  updateForumPost: (topicId, postId, postData) => {
    const company_id = getCompanyId();
    return api.put(`/collaboration/forums/topics/${topicId}/posts/${postId}`, { ...postData, company_id });
  },
  deleteForumPost: (topicId, postId) => {
    const company_id = getCompanyId();
    return api.delete(`/collaboration/forums/topics/${topicId}/posts/${postId}`, { params: { company_id } });
  },

  // Utility functions
  getMessageTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'text', label: 'Text Message', icon: 'message-circle' },
          { value: 'file', label: 'File Attachment', icon: 'file' },
          { value: 'image', label: 'Image', icon: 'image' },
          { value: 'video', label: 'Video', icon: 'video' },
          { value: 'audio', label: 'Audio', icon: 'mic' },
          { value: 'link', label: 'Link', icon: 'link' },
          { value: 'system', label: 'System Message', icon: 'settings' }
        ]
      }
    }
  }),

  getThreadTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'direct', label: 'Direct Message', icon: 'user', description: 'One-on-one conversation' },
          { value: 'group', label: 'Group Chat', icon: 'users', description: 'Multiple participants' },
          { value: 'channel', label: 'Channel', icon: 'hash', description: 'Public discussion channel' },
          { value: 'announcement', label: 'Announcement', icon: 'megaphone', description: 'Broadcast messages' }
        ]
      }
    }
  }),

  getAnnouncementTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'general', label: 'General', color: 'blue', icon: 'info' },
          { value: 'urgent', label: 'Urgent', color: 'red', icon: 'alert-triangle' },
          { value: 'policy', label: 'Policy', color: 'purple', icon: 'shield' },
          { value: 'event', label: 'Event', color: 'green', icon: 'calendar' },
          { value: 'system', label: 'System', color: 'gray', icon: 'settings' }
        ]
      }
    }
  }),

  getPriorityLevels: () => Promise.resolve({
    data: {
      data: {
        priorities: [
          { value: 'low', label: 'Low Priority', color: 'green' },
          { value: 'normal', label: 'Normal Priority', color: 'blue' },
          { value: 'high', label: 'High Priority', color: 'orange' },
          { value: 'urgent', label: 'Urgent', color: 'red' }
        ]
      }
    }
  }),

  getEventTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'meeting', label: 'Meeting', icon: 'users', color: 'blue' },
          { value: 'event', label: 'Event', icon: 'calendar', color: 'green' },
          { value: 'deadline', label: 'Deadline', icon: 'clock', color: 'red' },
          { value: 'reminder', label: 'Reminder', icon: 'bell', color: 'yellow' }
        ]
      }
    }
  }),

  getDocumentCategories: () => Promise.resolve({
    data: {
      data: {
        categories: [
          { value: 'general', label: 'General Documents', icon: 'file' },
          { value: 'project', label: 'Project Files', icon: 'folder' },
          { value: 'policy', label: 'Policies & Procedures', icon: 'shield' },
          { value: 'template', label: 'Templates', icon: 'copy' },
          { value: 'presentation', label: 'Presentations', icon: 'monitor' },
          { value: 'report', label: 'Reports', icon: 'bar-chart' },
          { value: 'training', label: 'Training Materials', icon: 'graduation-cap' },
          { value: 'reference', label: 'Reference Documents', icon: 'book' }
        ]
      }
    }
  }),

  getConferencePlatforms: () => Promise.resolve({
    data: {
      data: {
        platforms: [
          { value: 'zoom', label: 'Zoom', icon: 'video', color: 'blue' },
          { value: 'teams', label: 'Microsoft Teams', icon: 'users', color: 'purple' },
          { value: 'meet', label: 'Google Meet', icon: 'video', color: 'green' },
          { value: 'webex', label: 'Cisco Webex', icon: 'monitor', color: 'orange' },
          { value: 'custom', label: 'Custom Platform', icon: 'settings', color: 'gray' }
        ]
      }
    }
  }),

  getMeetingTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'instant', label: 'Instant Meeting', description: 'Start immediately' },
          { value: 'scheduled', label: 'Scheduled Meeting', description: 'Plan for later' },
          { value: 'recurring', label: 'Recurring Meeting', description: 'Repeating schedule' },
          { value: 'webinar', label: 'Webinar', description: 'Large audience presentation' }
        ]
      }
    }
  }),

  getForumTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'general', label: 'General Discussion', icon: 'message-circle' },
          { value: 'department', label: 'Department Forum', icon: 'building' },
          { value: 'project', label: 'Project Forum', icon: 'folder' },
          { value: 'announcement', label: 'Announcements', icon: 'megaphone' },
          { value: 'qa', label: 'Q&A Forum', icon: 'help-circle' },
          { value: 'social', label: 'Social', icon: 'coffee' },
          { value: 'technical', label: 'Technical Support', icon: 'tool' }
        ]
      }
    }
  }),

  getTopicTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'discussion', label: 'Discussion', icon: 'message-circle', color: 'blue' },
          { value: 'question', label: 'Question', icon: 'help-circle', color: 'green' },
          { value: 'announcement', label: 'Announcement', icon: 'megaphone', color: 'purple' },
          { value: 'poll', label: 'Poll', icon: 'bar-chart', color: 'orange' }
        ]
      }
    }
  }),

  getVisibilityOptions: () => Promise.resolve({
    data: {
      data: {
        options: [
          { value: 'public', label: 'Public', description: 'Visible to everyone', icon: 'globe' },
          { value: 'internal', label: 'Internal', description: 'Visible to organization members', icon: 'users' },
          { value: 'private', label: 'Private', description: 'Visible to specific users', icon: 'lock' },
          { value: 'restricted', label: 'Restricted', description: 'Limited access', icon: 'shield' }
        ]
      }
    }
  }),

  getAccessLevels: () => Promise.resolve({
    data: {
      data: {
        levels: [
          { value: 'view', label: 'View Only', description: 'Can only view content' },
          { value: 'download', label: 'View & Download', description: 'Can view and download' },
          { value: 'edit', label: 'Full Access', description: 'Can view, download, and edit' },
          { value: 'read_only', label: 'Read Only', description: 'Can read but not post' },
          { value: 'post_only', label: 'Post Only', description: 'Can post but not moderate' },
          { value: 'full_access', label: 'Full Access', description: 'Complete access and moderation' }
        ]
      }
    }
  }),

  // Helper functions
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  validateFileSize: (file, maxSizeMB) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  formatDate: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  },

  formatRelativeTime: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  },

  getFileIcon: (mimeType) => {
    if (mimeType.includes('pdf')) return 'file-text';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'file-text';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'file-spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'file-presentation';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('audio')) return 'music';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
    return 'file';
  },

  isImageFile: (mimeType) => {
    return mimeType && mimeType.startsWith('image/');
  },

  isVideoFile: (mimeType) => {
    return mimeType && mimeType.startsWith('video/');
  },

  isAudioFile: (mimeType) => {
    return mimeType && mimeType.startsWith('audio/');
  },

  generateMeetingUrl: (meetingId, platform = 'zoom') => {
    const baseUrls = {
      zoom: 'https://zoom.us/j/',
      teams: 'https://teams.microsoft.com/l/meetup-join/',
      meet: 'https://meet.google.com/',
      webex: 'https://webex.com/meet/',
      jitsi: 'https://meet.jit.si/',
      custom: 'https://meet.example.com/'
    };
    return `${baseUrls[platform] || baseUrls.custom}${meetingId}`;
  },

  formatDuration: (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  },

  getTimeUntilEvent: (eventDate) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffMs = event - now;
    
    if (diffMs < 0) return 'Past event';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    if (diffMinutes > 0) return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    return 'Starting now';
  },

  extractMentions: (content) => {
    const mentionRegex = /@\[([^\]]+)\]\((\d+)\)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push({
        name: match[1],
        id: parseInt(match[2])
      });
    }
    
    return mentions;
  },

  formatMentions: (content, mentions) => {
    let formattedContent = content;
    mentions.forEach(mention => {
      const mentionText = `@[${mention.name}](${mention.id})`;
      formattedContent = formattedContent.replace(mentionText, `<span class="mention">@${mention.name}</span>`);
    });
    return formattedContent;
  },

  // Simple toast replacement
  showToast: (message, type = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // You can implement a proper toast notification here
  },

  // Video Conferences
  getVideoConferences: (params) => {
    const company_id = getCompanyId();
    return api.get('/video-conferences', { params: { ...params, company_id } });
  },
  getVideoConference: (id) => {
    const company_id = getCompanyId();
    return api.get(`/video-conferences/${id}`, { params: { company_id } });
  },
  createVideoConference: (data) => {
    const company_id = getCompanyId();
    return api.post('/video-conferences', { ...data, company_id });
  },
  createInstantMeeting: (data) => {
    const company_id = getCompanyId();
    return api.post('/video-conferences/instant', { ...data, company_id });
  },
  updateVideoConference: (id, data) => {
    const company_id = getCompanyId();
    return api.put(`/video-conferences/${id}`, { ...data, company_id });
  },
  deleteVideoConference: (id, data) => {
    const company_id = getCompanyId();
    return api.delete(`/video-conferences/${id}`, { data: { ...data, company_id } });
  },
  startVideoConference: (id) => {
    const company_id = getCompanyId();
    return api.post(`/video-conferences/${id}/start`, { company_id });
  },
  endVideoConference: (id) => {
    const company_id = getCompanyId();
    return api.post(`/video-conferences/${id}/end`, { company_id });
  }
}

export default collaborationService;