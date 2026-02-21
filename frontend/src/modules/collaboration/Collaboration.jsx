import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CollaborationDashboard from './CollaborationDashboard';
import InternalMessaging from './InternalMessaging';
import TeamAnnouncements from './TeamAnnouncements';
import SharedCalendar from './SharedCalendar';
import DocumentSharing from './DocumentSharing';
import VideoConferencing from './VideoConferencing';
import DiscussionForums from './DiscussionForums';

const Collaboration = () => {
  return (
    <div className="collaboration-module">
      <Routes>
        {/* Default route - redirect to dashboard */}
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        
        {/* Main Dashboard */}
        <Route path="dashboard" element={<CollaborationDashboard />} />
        
        {/* Internal Messaging */}
        <Route path="messaging" element={<InternalMessaging />} />
        <Route path="messaging/:threadId" element={<InternalMessaging />} />
        
        {/* Team Announcements */}
        <Route path="announcements" element={<TeamAnnouncements />} />
        <Route path="announcements/create" element={<TeamAnnouncements />} />
        <Route path="announcements/:announcementId" element={<TeamAnnouncements />} />
        
        {/* Shared Calendar */}
        <Route path="calendar" element={<SharedCalendar />} />
        <Route path="calendar/create" element={<SharedCalendar />} />
        <Route path="calendar/event/:eventId" element={<SharedCalendar />} />
        
        {/* Document Sharing */}
        <Route path="documents" element={<DocumentSharing />} />
        <Route path="documents/upload" element={<DocumentSharing />} />
        <Route path="documents/:documentId" element={<DocumentSharing />} />
        
        {/* Video Conferencing */}
        <Route path="conferences" element={<VideoConferencing />} />
        <Route path="conferences/create" element={<VideoConferencing />} />
        <Route path="conferences/:conferenceId" element={<VideoConferencing />} />
        
        {/* Discussion Forums */}
        <Route path="forums" element={<DiscussionForums />} />
        <Route path="forums/:forumId" element={<DiscussionForums />} />
        <Route path="forums/:forumId/topics/:topicId" element={<DiscussionForums />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default Collaboration;