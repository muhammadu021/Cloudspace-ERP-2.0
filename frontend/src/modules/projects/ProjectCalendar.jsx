/**
 * ProjectCalendar Component - Calendar Grid View
 * 
 * Displays projects in a traditional monthly calendar grid format.
 * 
 * Features:
 * - Monthly calendar grid
 * - Project events on dates
 * - Month navigation
 * - Clean, minimal design
 * 
 * Requirements: 4.1
 */

import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "react-query";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutDashboard,
  FolderKanban,
  FileText,
  BarChart2,
  TrendingUp,
  Archive,
  Eye,
  Plus,
} from "lucide-react";
import { projectService } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { selectApiData } from "@/services/api";
import toast from 'react-hot-toast';

const ProjectCalendar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch projects
  const {
    data: projectsData,
    isLoading,
  } = useQuery(
    ["projects"],
    () => projectService.getProjects({ limit: 100 }),
    {
      enabled: isAuthenticated && !!token,
      select: selectApiData,
      keepPreviousData: true,
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.error('Projects API error:', error);
        toast.error('Failed to load projects');
      },
    }
  );

  const projects = projectsData?.projects || [];

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, events: [] });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Find projects with events on this date
      const events = projects.filter(project => {
        const start = new Date(project.start_date);
        const end = new Date(project.end_date);
        return date >= start && date <= end;
      }).slice(0, 3); // Limit to 3 events per day
      
      days.push({ date, day, events });
    }
    
    return days;
  }, [currentDate, projects]);

  // Navigation handlers
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Buttons */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/projects"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <Link
            to="/projects/kanban"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <FolderKanban className="h-3.5 w-3.5" />
            Kanban Board
          </Link>
          <Link
            to="/projects/calendar"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            Calendar View
          </Link>
          <Link
            to="/projects/templates"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Templates
          </Link>
          <Link
            to="/projects/reports"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Reports
          </Link>
          <Link
            to="/projects/analytics"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Analytics
          </Link>
          <Link
            to="/projects/archive"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Archive className="h-3.5 w-3.5" />
            Archived
          </Link>
          <Link
            to="/projects/list"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            List View
          </Link>
          <Link
            to="/projects/new"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Link>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{monthYear}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Week Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {weekDays.map(day => (
              <div
                key={day}
                className="px-4 py-3 text-center text-sm font-medium text-slate-600 bg-slate-50"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {isLoading ? (
              <div className="col-span-7 p-12 text-center text-slate-500">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : (
              calendarDays.map((dayData, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] border-r border-b border-slate-200 p-2 ${
                    !dayData.date ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                  } ${
                    dayData.date && dayData.date.toDateString() === new Date().toDateString()
                      ? 'bg-green-50'
                      : ''
                  }`}
                >
                  {dayData.date && (
                    <>
                      <div className="text-sm font-medium text-slate-700 mb-1">
                        {dayData.day}
                      </div>
                      <div className="space-y-1">
                        {dayData.events.map(event => (
                          <button
                            key={event.id}
                            onClick={() => navigate(`/projects/${event.id}`)}
                            className="w-full text-left px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors truncate"
                            title={event.name}
                          >
                            {event.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCalendar;
