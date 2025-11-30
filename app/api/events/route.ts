import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/events - List all events
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // If no date range provided, return all events
    // If date range provided, return events that:
    // 1. Start within the range, OR
    // 2. Are recurring (they can appear in any month)
    let where: any = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      where = {
        OR: [
          // Events that start within the date range
          {
            startDate: {
              gte: start,
              lte: end,
            },
          },
          // Recurring events (they can appear in any month)
          {
            isRecurring: true,
          },
          // Events that span across the date range
          {
            AND: [
              {
                startDate: {
                  lte: end,
                },
              },
              {
                endDate: {
                  gte: start,
                },
              },
            ],
          },
        ],
      };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      isRecurring,
      frequency,
      daysOfWeek,
      recurringEndDate,
      category,
    } = body;

    // Validation
    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, start date, and end date are required' },
        { status: 400 }
      );
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    if (isRecurring && !frequency) {
      return NextResponse.json(
        { error: 'Frequency is required for recurring events' },
        { status: 400 }
      );
    }

    if (frequency === 'weekly' && (!daysOfWeek || daysOfWeek.length === 0)) {
      return NextResponse.json(
        { error: 'At least one weekday must be selected for weekly events' },
        { status: 400 }
      );
    }

    // Get color for category
    const { getCategoryColor } = await import('@/lib/events');
    const color = category ? getCategoryColor(category) : null;

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isRecurring: isRecurring || false,
        frequency: isRecurring ? frequency : null,
        daysOfWeek: frequency === 'weekly' && daysOfWeek ? JSON.stringify(daysOfWeek) : null,
        recurringEndDate: isRecurring && recurringEndDate ? new Date(recurringEndDate) : null,
        category: category || null,
        color: color,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

