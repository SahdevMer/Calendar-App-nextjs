'use client';

import { useState, useEffect } from 'react';
import { getCalendarDays, getMonthName, getWeekdayName, isSameDay } from '@/lib/calendar';
import { getEventsForDate, Event, getCategoryColor } from '@/lib/events';
import Link from 'next/link';

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDays = getCalendarDays(year, month);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  // Refresh events when page becomes visible (e.g., after creating an event)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchEvents();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all events - we need all events to properly calculate recurring events
      // The client-side logic will filter which events to show for each date
      const response = await fetch('/api/events');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch events');
      }
      
      const data = await response.json();
      
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setEvents(data);
        console.log(`Loaded ${data.length} events`);
      } else {
        console.error('Invalid response format:', data);
        setEvents([]);
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]); // Set to empty array on error
      setError(error instanceof Error ? error.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get week dates for week view
  const getWeekDates = (date: Date): Date[] => {
    const week: Date[] = [];
    const day = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - day);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setCurrentDate(new Date(year, newMonth, 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setCurrentDate(new Date(newYear, month, 1));
  };

  const today = new Date();
  
  // Generate year options (current year ± 10 years)
  const currentYear = today.getFullYear();
  const years = [];
  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    years.push(i);
  }

  // Month names for dropdown
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <select
              value={month}
              onChange={handleMonthChange}
              className="px-4 py-2 text-lg font-semibold text-gray-800 bg-white border-2 border-gray-300 rounded-lg hover:border-black-5000 focus:outline-none focus:border-blue-600 transition cursor-pointer"
            >
              {monthNames.map((monthName, index) => (
                <option key={index} value={index}>
                  {monthName}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={handleYearChange}
              className="px-4 py-2 text-lg font-semibold text-gray-800 bg-white border-2 border-gray-300 rounded-lg hover:border-black-500 focus:outline-none focus:border-blue-600 transition cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded transition ${
                  viewMode === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded transition ${
                  viewMode === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => {
                  setViewMode('day');
                  setSelectedDate(currentDate);
                }}
                className={`px-4 py-2 rounded transition ${
                  viewMode === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Day
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              Today
            </button>
            <div className="flex space-x-2">
              <button
                onClick={viewMode === 'month' ? goToPreviousMonth : () => {
                  const newDate = new Date(currentDate);
                  if (viewMode === 'week') {
                    newDate.setDate(newDate.getDate() - 7);
                  } else {
                    newDate.setDate(newDate.getDate() - 1);
                  }
                  setCurrentDate(newDate);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                ← Prev
              </button>
              <button
                onClick={viewMode === 'month' ? goToNextMonth : () => {
                  const newDate = new Date(currentDate);
                  if (viewMode === 'week') {
                    newDate.setDate(newDate.getDate() + 7);
                  } else {
                    newDate.setDate(newDate.getDate() + 1);
                  }
                  setCurrentDate(newDate);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">Loading events...</div>
            <div className="text-sm text-gray-400">Please wait</div>
          </div>

        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={fetchEvents}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        ) : viewMode === 'month' ? (
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(events, day.date);
              const isToday = isSameDay(day.date, today);
              const isSelected = selectedDate && isSameDay(day.date, selectedDate);

              return (
                <div
                  key={index}
                  className={`min-h-24 border rounded-lg p-2 ${
                    day.isCurrentMonth
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-50 border-gray-100 text-gray-400'
                  } ${
                    isToday
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : ''
                  } ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300'
                      : ''
                  } hover:bg-gray-50 transition cursor-pointer`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <div
                    className={`text-sm font-semibold mb-1 ${
                      isToday
                        ? 'text-blue-600'
                        : day.isCurrentMonth
                        ? 'text-gray-800'
                        : 'text-gray-400'
                    }`}
                  >
                    {day.dayNumber}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const eventColor = event.color || getCategoryColor(event.category);
                      return (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="block text-xs px-2 py-1 rounded truncate transition text-white font-medium"
                          style={{ backgroundColor: eventColor }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {event.title}
                        </Link>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'week' ? (
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, index) => {
              const dayEvents = getEventsForDate(events, date);
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const dayName = getWeekdayName(date.getDay()).slice(0, 3);

              return (
                <div
                  key={index}
                  className={`min-h-32 border rounded-lg p-3 ${
                    isToday
                      ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50'
                      : 'bg-white border-gray-200'
                  } ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300'
                      : ''
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`text-sm font-semibold ${
                        isToday
                          ? 'text-blue-600'
                          : 'text-gray-800'
                      }`}
                    >
                      {dayName}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        isToday
                          ? 'text-blue-600'
                          : 'text-gray-800'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => {
                      const eventColor = event.color || getCategoryColor(event.category);
                      return (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="block text-xs px-2 py-1 rounded truncate transition text-white font-medium"
                          style={{ backgroundColor: eventColor }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {new Date(event.startDate).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })} - {event.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate || currentDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setSelectedDate(newDate);
                  setCurrentDate(newDate);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition mr-2"
              >
                ← Previous Day
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate || currentDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setSelectedDate(newDate);
                  setCurrentDate(newDate);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                Next Day →
              </button>
            </div>
            {selectedDate && (
              <div className="space-y-3">
                {getEventsForDate(events, selectedDate).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No events on this date</p>
                ) : (
                  getEventsForDate(events, selectedDate)
                    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .map((event) => {
                      const eventColor = event.color || getCategoryColor(event.category);
                      return (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="block p-4 rounded-lg border-l-4 hover:shadow-md transition"
                          style={{ borderLeftColor: eventColor }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-lg text-gray-800 mb-1">
                                {event.title}
                              </div>
                              {event.description && (
                                <div className="text-sm text-gray-600 mb-2">{event.description}</div>
                              )}
                              <div className="text-sm text-gray-500">
                                {new Date(event.startDate).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}{' '}
                                -{' '}
                                {new Date(event.endDate).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                            {event.category && (
                              <span
                                className="px-3 py-1 rounded-full text-xs font-semibold text-white ml-4"
                                style={{ backgroundColor: eventColor }}
                              >
                                {event.category}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })
                )}
              </div>
            )}
          </div>
        )}

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">
              Events on {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            {getEventsForDate(events, selectedDate).length === 0 ? (
              <p className="text-gray-500">No events on this date</p>
            ) : (
              <div className="space-y-2">
                {getEventsForDate(events, selectedDate).map((event) => {
                  const eventColor = event.color || getCategoryColor(event.category);
                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block p-3 bg-white rounded border-l-4 hover:shadow-md transition"
                      style={{ borderLeftColor: eventColor }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(event.startDate).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(event.endDate).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                            {event.isRecurring && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded">
                                {event.frequency}
                              </span>
                            )}
                          </div>
                        </div>
                        {event.category && (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-semibold text-white ml-2"
                            style={{ backgroundColor: eventColor }}
                          >
                            {event.category}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 

