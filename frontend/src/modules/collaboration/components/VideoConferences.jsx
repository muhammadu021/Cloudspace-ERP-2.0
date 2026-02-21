import React, { useState, useEffect } from 'react';
import { Video, Calendar, X, Users, Clock } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const VideoConferences = () => {
  const { user } = useAuth();
  const [showVideo, setShowVideo] = useState(false);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Jitsi script
    if (!document.getElementById('jitsi-script')) {
      console.log('Loading Jitsi script...');
      const script = document.createElement('script');
      script.id = 'jitsi-script';
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        console.log('Jitsi script loaded successfully');
      };
      script.onerror = () => {
        console.error('Failed to load Jitsi script');
        toast.error('Failed to load video system');
      };
      document.body.appendChild(script);
    }
  }, []);

  const startMeeting = () => {
    console.log('Starting meeting...');
    setLoading(true);
    const newRoomName = 'meeting-' + Date.now();
    setRoomName(newRoomName);
    setShowVideo(true);
    
    // Wait for DOM to update
    setTimeout(() => {
      initJitsi(newRoomName);
    }, 100);
  };

  const initJitsi = (room) => {
    console.log('Initializing Jitsi for room:', room);
    
    // Check if Jitsi API is loaded
    if (typeof window.JitsiMeetExternalAPI === 'undefined') {
      console.log('Jitsi API not loaded yet, retrying...');
      setTimeout(() => initJitsi(room), 500);
      return;
    }

    // Check if container exists
    const container = document.querySelector('#jitsi-container');
    if (!container) {
      console.error('Jitsi container not found!');
      toast.error('Video container not ready');
      setTimeout(() => initJitsi(room), 500);
      return;
    }

    console.log('Container found, creating Jitsi instance...');

    const displayName = user?.Employee 
      ? `${user.Employee.first_name} ${user.Employee.last_name}`
      : user?.email || 'User';

    const domain = 'meet.jit.si';
    const options = {
      roomName: room,
      width: '100%',
      height: '100%',
      parentNode: container,
      userInfo: {
        displayName: displayName
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'recording',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'tileview'
        ]
      }
    };

    try {
      console.log('Creating JitsiMeetExternalAPI instance...');
      const api = new window.JitsiMeetExternalAPI(domain, options);
      setJitsiApi(api);
      setLoading(false);
      
      api.addEventListener('videoConferenceJoined', () => {
        console.log('Video conference joined');
        toast.success('Meeting started!');
      });

      api.addEventListener('readyToClose', () => {
        console.log('Ready to close');
        closeMeeting();
      });

      api.addEventListener('errorOccurred', (error) => {
        console.error('Jitsi error:', error);
      });

      console.log('Jitsi initialized successfully');
    } catch (error) {
      console.error('Error creating Jitsi instance:', error);
      toast.error('Failed to start meeting: ' + error.message);
      setLoading(false);
      setShowVideo(false);
    }
  };

  const closeMeeting = () => {
    console.log('Closing meeting...');
    if (jitsiApi) {
      try {
        jitsiApi.dispose();
      } catch (error) {
        console.error('Error disposing Jitsi:', error);
      }
      setJitsiApi(null);
    }
    setShowVideo(false);
    setRoomName('');
    setLoading(false);
  };

  if (showVideo) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={closeMeeting}
            className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 shadow-lg"
            title="Leave Meeting"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-5">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Starting meeting...</p>
            </div>
          </div>
        )}
        <div id="jitsi-container" className="w-full h-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Video Meetings</h1>
        <p className="text-xl text-gray-600">Start a secure video call instantly</p>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
        {/* Start Meeting Card */}
        <div className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 transition-transform cursor-pointer">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
            <Video className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-3">New Meeting</h2>
          <p className="text-primary-100 mb-6">Start an instant video call</p>
          <button
            onClick={startMeeting}
            disabled={loading}
            className="w-full bg-white text-primary px-6 py-4 rounded-xl hover:bg-primary-50 transition-colors font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting...' : 'Start Now'}
          </button>
        </div>

        {/* Schedule Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 transition-transform cursor-pointer">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Schedule</h2>
          <p className="text-green-100 mb-6">Plan a meeting for later</p>
          <button
            onClick={() => toast.info('Scheduling feature coming soon!')}
            className="w-full bg-white text-green-600 px-6 py-4 rounded-xl hover:bg-green-50 transition-colors font-semibold text-lg shadow-lg"
          >
            Schedule
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">HD Video</h3>
          <p className="text-sm text-gray-600">Crystal clear video quality</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Unlimited Users</h3>
          <p className="text-sm text-gray-600">No participant limits</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No Time Limit</h3>
          <p className="text-sm text-gray-600">Meet as long as needed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Screen Share</h3>
          <p className="text-sm text-gray-600">Share your screen easily</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Click Start Now</h4>
              <p className="text-gray-700">Begin an instant video meeting</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Camera Activates</h4>
              <p className="text-gray-700">Your camera and mic turn on</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Share Link</h4>
              <p className="text-gray-700">Invite others to join</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Collaborate</h4>
              <p className="text-gray-700">Use controls to manage the call</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConferences;
