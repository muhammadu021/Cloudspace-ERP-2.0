import React, { useState, useEffect } from "react";
import { Video, Calendar, X, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import collaborationService from "../../services/collaborationService";
import api from "../../services/api";

const VideoConferencing = () => {
  const location = useLocation();
  const [showVideo, setShowVideo] = useState(false);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scheduled, setScheduled] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [instantMeetingData, setInstantMeetingData] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduled_start: "",
    scheduled_end: "",
  });
  const [scheduledParticipants, setScheduledParticipants] = useState([]);

  useEffect(() => {
    // Load Jitsi script
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => console.log("✅ Jitsi loaded");
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // Fetch only future scheduled calls
    fetchFutureCalls();
    // Fetch employees for participant selection
    fetchEmployees();

    // Check if we should auto-join a meeting from a message link
    if (location.state?.autoJoin && location.state?.roomName) {
      console.log('🎬 Auto-joining meeting from message link:', location.state.roomName);
      toast.success('Joining meeting...');
      // Small delay to ensure Jitsi script is loaded
      setTimeout(() => {
        startMeeting(location.state.roomName);
      }, 500);
    }
  }, [location]);

  const fetchFutureCalls = async () => {
    try {
      const nowIso = new Date().toISOString();
      const { data } = await collaborationService.getVideoConferences({
        start_date: nowIso,
        end_date: "2999-12-31T23:59:59.999Z",
        status: "scheduled",
        limit: 20,
      });
      setScheduled(data?.data?.conferences || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load scheduled meetings");
    }
  };

  const fetchEmployees = async () => {
    try {
      console.log('🔍 Fetching employees for video conference...');
      const { data } = await api.get('/video-conferences/employees');
      console.log('📥 Employees response:', data);
      
      const employeeList = data?.data?.employees || [];
      console.log(`✅ Loaded ${employeeList.length} employees`);
      
      setEmployees(employeeList);
      
      if (employeeList.length === 0) {
        console.warn('⚠️ No employees found');
      }
    } catch (e) {
      console.error('❌ Failed to fetch employees:', e);
      console.error('Error details:', e.response?.data);
      toast.error('Failed to load employee list');
    }
  };

  const handleStartMeetingClick = () => {
    console.log("🎥 START MEETING CLICKED!");
    // Show participant selection modal
    setShowParticipantModal(true);
  };

  const handleStartInstantMeeting = async () => {
    try {
      setLoading(true);
      
      // Create instant meeting with selected participants
      const { data } = await collaborationService.createInstantMeeting({
        title: 'Instant Meeting',
        description: 'Quick video call',
        participant_ids: selectedParticipants
      });

      if (data.success) {
        const meetingData = data.data;
        setInstantMeetingData(meetingData);
        
        toast.success(
          `Meeting started! ${meetingData.invitations_sent > 0 
            ? `${meetingData.invitations_sent} invitation(s) sent` 
            : ''}`
        );
        
        // Close modal and start video
        setShowParticipantModal(false);
        setSelectedParticipants([]);
        
        // Start the Jitsi meeting
        startMeeting(meetingData.room_name);
      }
    } catch (error) {
      console.error('Failed to create instant meeting:', error);
      toast.error(error?.response?.data?.message || 'Failed to start meeting');
    } finally {
      setLoading(false);
    }
  };

  const startMeeting = (roomName) => {
    console.log("🎥 Starting Jitsi meeting with room:", roomName);
    setShowVideo(true);

    setTimeout(() => {
      const container = document.getElementById("jitsi-container");
      if (!container) {
        toast.error("Container not found");
        return;
      }

      if (typeof window.JitsiMeetExternalAPI === "undefined") {
        toast("Jitsi loading... retrying");
        setTimeout(() => startMeeting(roomName), 2000);
        return;
      }

      try {
        const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
          roomName: roomName,
          width: "100%",
          height: "100%",
          parentNode: container,
          userInfo: { displayName: "User" },
        });

        setJitsiApi(api);
        toast.success("Meeting started!");

        api.addEventListener("readyToClose", () => {
          closeMeeting();
        });
      } catch (error) {
        console.error("❌ Error:", error);
        toast.error("Error: " + error.message);
      }
    }, 100);
  };

  const closeMeeting = () => {
    if (jitsiApi) {
      jitsiApi.dispose();
      setJitsiApi(null);
    }
    setShowVideo(false);
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!form.title || !form.scheduled_start || !form.scheduled_end) {
        toast.error("Please fill title, start and end");
        return;
      }

      // Properly handle datetime-local string comparison
      // The datetime-local input returns strings in format "YYYY-MM-DDTHH:mm" in local timezone
      const startDateTime = form.scheduled_start;
      const endDateTime = form.scheduled_end;

      // Validate that both datetime values are provided
      if (!startDateTime || !endDateTime) {
        toast.error("Please provide both start and end times");
        return;
      }

      // Create Date objects from the datetime-local strings
      // These are interpreted as local time by the Date constructor
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      // Check if the dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast.error("Invalid date/time format");
        return;
      }

      // Compare the dates - ensure end time is after start time
      // Also ensure there's at least a 1-minute difference (60,000 ms)
      const minimumDuration = 60000; // 1 minute in milliseconds
      
      if (endDate <= startDate) {
        if (startDate.getTime() === endDate.getTime()) {
          toast.error("End time must be after start time - please select a different end time");
        } else {
          toast.error("End time must be after start time");
        }
        return;
      } else if (endDate.getTime() - startDate.getTime() < minimumDuration) {
        toast.error("Meeting must be at least 1 minute long");
        return;
      }

      const { data } = await collaborationService.createVideoConference({
        ...form,
        platform: "jitsi",
        participant_ids: scheduledParticipants
      });
      
      const invitationCount = data?.data?.invitations_sent || scheduledParticipants.length;
      toast.success(
        `Meeting scheduled${invitationCount > 0 ? ` and ${invitationCount} invitation(s) sent` : ''}`
      );
      
      setShowSchedule(false);
      setForm({
        title: "",
        description: "",
        scheduled_start: "",
        scheduled_end: "",
      });
      setScheduledParticipants([]);
      await fetchFutureCalls();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to schedule");
    } finally {
      setLoading(false);
    }
  };

  if (showVideo) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <button
          onClick={closeMeeting}
          className="absolute top-4 right-4 z-10 bg-red-600 text-white p-3 rounded-full hover:bg-red-700"
        >
          <X className="w-6 h-6" />
        </button>
        <div id="jitsi-container" className="w-full h-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Video Conferencing
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* START MEETING BUTTON */}
        <button
          onClick={handleStartMeetingClick}
          className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl shadow-2xl p-8 text-white hover:scale-105 transition-transform"
        >
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Video className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Start Meeting</h2>
          <p className="text-primary-100">Click to start instant video call</p>
        </button>

        {/* SCHEDULE BUTTON */}
        <button
          onClick={() => setShowSchedule(true)}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-2xl p-8 text-white hover:scale-105 transition-transform"
        >
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Schedule</h2>
          <p className="text-green-100">Plan a meeting for later</p>
        </button>
      </div>

      {/* Participant Selection Modal */}
      {showParticipantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative max-h-[80vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4"
              onClick={() => {
                setShowParticipantModal(false);
                setSelectedParticipants([]);
              }}
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Select Participants for Instant Meeting
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select employees to invite. They will receive an in-app message with the meeting link.
            </p>
            
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">
                Selected: {selectedParticipants.length} participant(s)
              </div>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                {employees.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading employees...
                  </div>
                ) : (
                  <div className="divide-y">
                    {employees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(emp.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedParticipants([...selectedParticipants, emp.id]);
                            } else {
                              setSelectedParticipants(
                                selectedParticipants.filter((id) => id !== emp.id)
                              );
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium">
                            {emp.first_name} {emp.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {emp.email || emp.User?.email}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border"
                onClick={() => {
                  setShowParticipantModal(false);
                  setSelectedParticipants([]);
                }}
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleStartInstantMeeting}
                className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Starting..." : "Start Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4"
              onClick={() => {
                setShowSchedule(false);
                setScheduledParticipants([]);
              }}
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-semibold mb-4">Schedule a meeting</h3>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.scheduled_start}
                    onChange={(e) =>
                      setForm({ ...form, scheduled_start: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End</label>
                  <input
                    type="datetime-local"
                    className="w-full border rounded-lg px-3 py-2"
                    value={form.scheduled_end}
                    onChange={(e) =>
                      setForm({ ...form, scheduled_end: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Participant Selection */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Invite Participants (Optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Selected participants will receive an in-app message with the meeting details and link.
                </p>
                <div className="text-sm font-medium mb-2">
                  Selected: {scheduledParticipants.length} participant(s)
                </div>
                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  {employees.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Loading employees...
                    </div>
                  ) : (
                    <div className="divide-y">
                      {employees.map((emp) => (
                        <label
                          key={emp.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={scheduledParticipants.includes(emp.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setScheduledParticipants([...scheduledParticipants, emp.id]);
                              } else {
                                setScheduledParticipants(
                                  scheduledParticipants.filter((id) => id !== emp.id)
                                );
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {emp.first_name} {emp.last_name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {emp.email || emp.User?.email}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border"
                  onClick={() => {
                    setShowSchedule(false);
                    setScheduledParticipants([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Schedule Meeting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming scheduled meetings */}
      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-3">Upcoming meetings</h3>
        {scheduled.length === 0 && (
          <p className="text-gray-500">No upcoming meetings</p>
        )}
        <ul className="space-y-3">
          {scheduled.map((conf) => (
            <li
              key={conf.id}
              className="border rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{conf.title}</div>
                <div className="text-sm text-gray-600">
                  {new Date(conf.scheduled_start).toLocaleString()} -{" "}
                  {new Date(conf.scheduled_end).toLocaleString()}
                </div>
                {conf.meeting_url && (
                  <a
                    className="text-primary text-sm"
                    href={conf.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {conf.meeting_url}
                  </a>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                  {conf.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VideoConferencing;
