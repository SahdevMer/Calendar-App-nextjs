export interface Event {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  frequency: string | null;
  daysOfWeek: string | null;
  recurringEndDate: string | null;
  category: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export const EVENT_CATEGORIES = [
  { value: 'work', label: 'Work', color: '#3B82F6' }, // Blue
  { value: 'personal', label: 'Personal', color: '#10B981' }, // Green
  { value: 'meeting', label: 'Meeting', color: '#F59E0B' }, // Amber
  { value: 'birthday', label: 'Birthday', color: '#EC4899' }, // Pink
  { value: 'holiday', label: 'Holiday', color: '#8B5CF6' }, // Purple
  { value: 'other', label: 'Other', color: '#6B7280' }, // Gray
] as const;

export function getCategoryColor(category: string | null): string {
  if (!category) return '#3B82F6'; // Default blue
  const cat = EVENT_CATEGORIES.find(c => c.value === category);
  return cat?.color || '#3B82F6';
}

export function shouldDisplayEventOnDate(event: Event, date: Date): boolean {
  const eventStartDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);
  const recurringEndDate = event.recurringEndDate ? new Date(event.recurringEndDate) : null;

  // Check if date is before the event start date
  if (date < eventStartDate) {
    return false;
  }

  // For recurring events, check if date is after recurring end date
  if (event.isRecurring && recurringEndDate && date > recurringEndDate) {
    return false;
  }

  // For non-recurring events, check if date is within the event's date range
  if (!event.isRecurring) {
    if (date > eventEndDate) {
      return false;
    }
    return (
      date.getFullYear() === eventStartDate.getFullYear() &&
      date.getMonth() === eventStartDate.getMonth() &&
      date.getDate() === eventStartDate.getDate()
    );
  }

  // Handle recurring events
  if (event.frequency === 'daily') {
    return true;
  }

  if (event.frequency === 'weekly') {
    const dayOfWeek = date.getDay();
    if (event.daysOfWeek) {
      try {
        const selectedDays = JSON.parse(event.daysOfWeek) as number[];
        return selectedDays.includes(dayOfWeek);
      } catch {
        return false;
      }
    }
    return dayOfWeek === eventStartDate.getDay();
  }

  if (event.frequency === 'monthly') {
    return date.getDate() === eventStartDate.getDate();
  }

  return false;
}

export function getEventsForDate(events: Event[], date: Date): Event[] {
  if (!Array.isArray(events)) {
    return [];
  }
  return events.filter(event => shouldDisplayEventOnDate(event, date));
}

