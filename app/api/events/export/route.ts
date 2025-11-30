import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to format date for ICS
function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Helper function to escape text for ICS
function escapeICS(text: string | null): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// GET /api/events/export - Export events as ICS file
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventIds = searchParams.get('ids'); // Optional: comma-separated event IDs

    let where: any = {};
    if (eventIds) {
      const ids = eventIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (ids.length > 0) {
        where = { id: { in: ids } };
      }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        startDate: 'asc',
      },
    });

    // Generate ICS content
    let icsContent = 'BEGIN:VCALENDAR\r\n';
    icsContent += 'VERSION:2.0\r\n';
    icsContent += 'PRODID:-//Calendar App//EN\r\n';
    icsContent += 'CALSCALE:GREGORIAN\r\n';
    icsContent += 'METHOD:PUBLISH\r\n';

    for (const event of events) {
      icsContent += 'BEGIN:VEVENT\r\n';
      icsContent += `UID:event-${event.id}@calendar-app\r\n`;
      icsContent += `DTSTART:${formatICSDate(new Date(event.startDate))}\r\n`;
      icsContent += `DTEND:${formatICSDate(new Date(event.endDate))}\r\n`;
      icsContent += `SUMMARY:${escapeICS(event.title)}\r\n`;
      
      if (event.description) {
        icsContent += `DESCRIPTION:${escapeICS(event.description)}\r\n`;
      }

      if (event.category) {
        icsContent += `CATEGORIES:${escapeICS(event.category)}\r\n`;
      }

      // Add recurrence rule if applicable
      if (event.isRecurring && event.frequency) {
        let rrule = `RRULE:FREQ=${event.frequency.toUpperCase()}`;
        
        if (event.frequency === 'weekly' && event.daysOfWeek) {
          try {
            const days = JSON.parse(event.daysOfWeek) as number[];
            const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
            const byday = days.map(d => dayMap[d]).join(',');
            rrule += `;BYDAY=${byday}`;
          } catch {
            // Ignore parsing errors
          }
        }

        if (event.recurringEndDate) {
          rrule += `;UNTIL=${formatICSDate(new Date(event.recurringEndDate))}`;
        }

        icsContent += `${rrule}\r\n`;
      }

      icsContent += `DTSTAMP:${formatICSDate(new Date())}\r\n`;
      icsContent += 'END:VEVENT\r\n';
    }

    icsContent += 'END:VCALENDAR\r\n';

    // Return as downloadable file
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="calendar-export-${new Date().toISOString().split('T')[0]}.ics"`,
      },
    });
  } catch (error) {
    console.error('Error exporting events:', error);
    return NextResponse.json(
      { error: 'Failed to export events' },
      { status: 500 }
    );
  }
}

