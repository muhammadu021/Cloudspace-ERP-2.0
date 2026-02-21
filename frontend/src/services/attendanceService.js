import api from './api';
import { getErrorMessage } from '../utils/errorHandler';
import { getCompanyId } from '../utils/company';

const attendanceService = {
  // Clock in/out operations
  clockIn: async (data) => {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/hr/attendance/checkin', { ...data, company_id });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  clockOut: async (data) => {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/hr/attendance/checkout', { ...data, company_id });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  startBreak: async () => {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/attendance/break/start', { company_id });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  endBreak: async () => {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/attendance/break/end', { company_id });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  // Attendance records
  getAttendance: async (params = {}) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/hr/attendance', { params: { ...params, company_id } });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  getAttendanceAnalytics: async (params = {}) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/attendance/analytics', { params: { ...params, company_id } });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  // Shift management
  getShifts: async (params = {}) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/attendance/shifts', { params: { ...params, company_id } });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  getShiftById: async (id) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get(`/attendance/shifts/${id}`, { params: { company_id } });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  createShift: async (data) => {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/attendance/shifts', { ...data, company_id });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  updateShift: async (id, data) => {
    try {
      const company_id = getCompanyId();
      const response = await api.put(`/attendance/shifts/${id}`, { ...data, company_id });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  deleteShift: async (id) => {
    try {
      const company_id = getCompanyId();
      const response = await api.delete(`/attendance/shifts/${id}`, { params: { company_id } });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  assignEmployeesToShift: async (shiftId, employeeIds) => {
    try {
      const company_id = getCompanyId();
      const response = await api.post(`/attendance/shifts/${shiftId}/assign-employees`, {
        employee_ids: employeeIds,
        company_id
      });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  getShiftStatistics: async (id, params = {}) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get(`/attendance/shifts/${id}/statistics`, { params: { ...params, company_id } });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  // Schedule management
  getSchedules: async (params = {}) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/attendance/schedules', { params: { ...params, company_id } });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  getScheduleById: async (id) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get(`/attendance/schedules/${id}`, { params: { company_id } });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  createSchedule: async (data) => {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/attendance/schedules', { ...data, company_id });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  createBulkSchedules: async (data) => {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/attendance/schedules/bulk', { ...data, company_id });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  updateSchedule: async (id, data) => {
    try {
      const company_id = getCompanyId();
      const response = await api.put(`/attendance/schedules/${id}`, { ...data, company_id });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  deleteSchedule: async (id) => {
    try {
      const company_id = getCompanyId();
      const response = await api.delete(`/attendance/schedules/${id}`, { params: { company_id } });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  getEmployeeScheduleCalendar: async (employeeId, params = {}) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get(`/attendance/schedules/employee/${employeeId}/calendar`, { params: { ...params, company_id } });
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  // Geolocation utilities
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  },

  // Device info utilities
  getDeviceInfo: () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
  }
};

export default attendanceService;