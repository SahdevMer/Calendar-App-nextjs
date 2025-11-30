'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Event, EVENT_CATEGORIES, getCategoryColor } from '@/lib/events';

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      const data = await response.json();
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      toast.success(`Event "${event?.title || 'Event'}" deleted successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });

      // Small delay to show toast before navigation
      setTimeout(() => {
        router.push('/events');
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete event';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading event...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error: {error || 'Event not found'}</div>
        <Link
          href="/events"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">{event.title}</h1>
          <div className="flex items-center space-x-2">
            <Link
              href={`/events/${event.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        {event.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Start Date & Time</h2>
            <p className="text-gray-600">
              {startDate.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">End Date & Time</h2>
            <p className="text-gray-600">
              {endDate.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>

          {event.isRecurring && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Recurrence</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {event.frequency?.toUpperCase()}
                </span>
                {event.frequency === 'weekly' && event.daysOfWeek && (
                  <span className="text-gray-600">
                    Every {JSON.parse(event.daysOfWeek)
                      .map((d: number) => weekdays[d])
                      .join(', ')}
                  </span>
                )}
                {/* {event.recurringEndDate && (
                  <span className="text-gray-600">
                    until {new Date(event.recurringEndDate).toLocaleDateString()}
                  </span>
                )} */}
              </div>
            </div>
          )}

          {event.category && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Category</h2>
              <span
                className="px-4 py-2 rounded-full text-sm font-semibold text-white inline-block"
                style={{ backgroundColor: getCategoryColor(event.category) }}
              >
                {EVENT_CATEGORIES.find(c => c.value === event.category)?.label || event.category}
              </span>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            <p>Created: {new Date(event.createdAt).toLocaleString('en-US')}</p>
            <p>Last updated: {new Date(event.updatedAt).toLocaleString('en-US')}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-800 transition"
          >
            ← Back to Events
          </Link>
          <button
            onClick={() => {
              window.location.href = `/api/events/export?ids=${event.id}`;
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            📥 Export to Calendar
          </button>
        </div>
      </div>
    </div>
  );
}

