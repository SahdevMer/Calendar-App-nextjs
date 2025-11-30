'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { EVENT_CATEGORIES } from '@/lib/events';

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isRecurring: false,
    frequency: 'daily',
    daysOfWeek: [] as number[],
    recurringEndDate: '',
    category: '',
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const defaultTime = '09:00';
    setFormData(prev => ({
      ...prev,
      startDate: prev.startDate || today,
      startTime: prev.startTime || defaultTime,
      endDate: prev.endDate || today,
      endTime: prev.endTime || defaultTime,
    }));
  }, []);

  const weekdays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      // Validation
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      if (!formData.startDate || !formData.startTime) {
        throw new Error('Start date and time are required');
      }

      if (!formData.endDate || !formData.endTime) {
        throw new Error('End date and time are required');
      }

      if (endDateTime <= startDateTime) {
        throw new Error('End date/time must be after start date/time');
      }

      if (formData.isRecurring && formData.frequency === 'weekly' && formData.daysOfWeek.length === 0) {
        throw new Error('Please select at least one weekday for weekly recurring events');
      }

      if (formData.isRecurring && formData.recurringEndDate) {
        const recurringEnd = new Date(formData.recurringEndDate);
        if (recurringEnd <= startDateTime) {
          throw new Error('Recurring end date must be after start date');
        }
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          isRecurring: formData.isRecurring,
          frequency: formData.isRecurring ? formData.frequency : null,
          daysOfWeek: formData.isRecurring && formData.frequency === 'weekly' ? formData.daysOfWeek : null,
          recurringEndDate: formData.isRecurring && formData.recurringEndDate ? formData.recurringEndDate : null,
          category: formData.category || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create event');
      }

      toast.success('Event created successfully!', {
        position: "top-right",
        autoClose: 3000,
      });

      // Small delay to show toast before navigation
      setTimeout(() => {
        router.push('/events');
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDayOfWeek = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Event</h1>
        <p className="text-gray-600">Fill in the details below to create a new event</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="font-bold">⚠</span>
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-400"
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 placeholder-gray-400 resize-none"
            placeholder="Enter event description (optional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="startDate"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700 mb-2">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="startTime"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="endDate"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700 mb-2">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="endTime"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 bg-white"
          >
            <option value="">Select a category (optional)</option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            <span className="text-base font-semibold text-gray-700">Recurring Event</span>
          </label>
        </div>

        {formData.isRecurring && (
          <>
            <div>
              <label htmlFor="frequency" className="block text-sm font-semibold text-gray-700 mb-2">
                Frequency <span className="text-red-500">*</span>
              </label>
              <select
                id="frequency"
                required
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value, daysOfWeek: [] })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900 bg-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {formData.frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Weekdays <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {weekdays.map((day) => (
                    <label
                      key={day.value}
                      className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                        formData.daysOfWeek.includes(day.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.daysOfWeek.includes(day.value)}
                        onChange={() => toggleDayOfWeek(day.value)}
                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                      />
                      <span className={`text-sm font-medium ${
                        formData.daysOfWeek.includes(day.value) ? 'text-blue-700' : 'text-gray-700'
                      }`}>{day.label}</span>
                    </label>
                  ))}
                </div>
                {formData.daysOfWeek.length === 0 && (
                  <p className="text-sm text-red-600 mt-3 font-medium">⚠ Please select at least one weekday</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="recurringEndDate" className="block text-sm font-semibold text-gray-700 mb-2">
                Recurring End Date (Optional)
              </label>
              <input
                type="date"
                id="recurringEndDate"
                value={formData.recurringEndDate}
                onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                min={formData.startDate}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
                placeholder="Leave empty for no end date"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if the event should recur indefinitely</p>
            </div>
          </>
        )}

        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}

