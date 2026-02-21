import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ 
  selected, 
  onSelect, 
  className, 
  mode = 'single',
  ...props 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSelected = (day) => {
    if (!selected) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (selected instanceof Date) {
      return date.toDateString() === selected.toDateString();
    }
    return false;
  };

  const handleDayClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onSelect?.(date);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          className={cn(
            'p-2 text-sm hover:bg-gray-100 rounded-md transition-colors',
            isSelected(day) && 'bg-primary text-white hover:bg-primary-600'
          )}
          onClick={() => handleDayClick(day)}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className={cn('p-3 bg-white border rounded-lg shadow-sm', className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <h2 className="text-sm font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-xs font-medium text-gray-500 text-center">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default Calendar;