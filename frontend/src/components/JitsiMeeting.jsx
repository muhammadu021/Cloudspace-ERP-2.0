import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, Users, Settings } from 'lucide-react';

const JitsiMeeting = ({ 
  roomName, 
  displayName, 
  onClose, 
  config = {},
  interfaceConfig = {} 
}) => {
  const jitsiContainerRef = useRef(null);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [participants, setParticipants] = useState(1);

  useEffect(() => {
    // Load Jitsi Meet API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => initializeJitsi();
    document.body.appendChild(script);

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
      document.body.removeChild(script);
    };
  }, []);

  const initializeJitsi = () => {
    const domain = 'meet.jit.si';
    
    const defaultConfig = {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableWelcomePage: false,
      prejoinPageEnabled: false,
      disableDeepLinking: true,
      ...config
    };

    const defaultInterfaceConfig = {
      TOOLBAR_BUTTONS: [
        'microphone',
        'camera',
        'closedcaptions',
        'desktop',
        'fullscreen',
        'fodeviceselection',
        'hangup',
        'profile',
        'chat',
        'recording',
        'livestreaming',
        'etherpad',
        'sharedvideo',
        'settings',
        'raisehand',
        'videoquality',
        'filmstrip',
        'invite',
        'feedback',
        'stats',
        'shortcuts',
        'tileview',
        'videobackgroundblur',
        'download',
        'help',
        'mute-everyone',
        'security'
      ],
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: false,
      BRAND_WATERMARK_LINK: '',
      SHOW_POWERED_BY: false,
      ...interfaceConfig
    };

    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: defaultConfig,
      interfaceConfigOverwrite: defaultInterfaceConfig,
      userInfo: {
        displayName: displayName
      }
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    setJitsiApi(api);

    // Event listeners
    api.addEventListener('audioMuteStatusChanged', (event) => {
      setIsAudioMuted(event.muted);
    });

    api.addEventListener('videoMuteStatusChanged', (event) => {
      setIsVideoMuted(event.muted);
    });

    api.addEventListener('participantJoined', () => {
      setParticipants(prev => prev + 1);
    });

    api.addEventListener('participantLeft', () => {
      setParticipants(prev => Math.max(1, prev - 1));
    });

    api.addEventListener('readyToClose', () => {
      if (onClose) onClose();
    });
  };

  const toggleAudio = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleVideo');
    }
  };

  const toggleScreenShare = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleShareScreen');
    }
  };

  const hangUp = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('hangup');
    }
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">{roomName}</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <Users className="h-4 w-4" />
            <span>{participants} participant{participants !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <button
          onClick={hangUp}
          className="text-gray-300 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Jitsi Container */}
      <div ref={jitsiContainerRef} className="flex-1" />

      {/* Custom Controls (Optional - Jitsi has its own) */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-center space-x-4">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors ${
            isAudioMuted 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isAudioMuted ? 'Unmute' : 'Mute'}
        >
          {isAudioMuted ? (
            <MicOff className="h-5 w-5 text-white" />
          ) : (
            <Mic className="h-5 w-5 text-white" />
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${
            isVideoMuted 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isVideoMuted ? 'Start Video' : 'Stop Video'}
        >
          {isVideoMuted ? (
            <VideoOff className="h-5 w-5 text-white" />
          ) : (
            <Video className="h-5 w-5 text-white" />
          )}
        </button>

        <button
          onClick={toggleScreenShare}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          title="Share Screen"
        >
          <Monitor className="h-5 w-5 text-white" />
        </button>

        <button
          onClick={hangUp}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          title="Leave Meeting"
        >
          <PhoneOff className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default JitsiMeeting;
