# Calendar App - Recurring Events

A Next.js web application that allows users to create, update, delete, and list one-time and recurring events (Daily, Weekly, Monthly). Weekly events support selecting specific weekdays. Events are displayed in a beautiful monthly calendar UI.

## Features

- ✅ **Event Management (CRUD)**
  - Create, read, update, and delete events
  - Support for one-time and recurring events
  - Recurrence types: Daily, Weekly, Monthly
  - Weekly events with weekday selection (e.g., Monday, Wednesday)

- ✅ **Calendar View**
  - Monthly calendar grid with event display
  - Previous/next month navigation
  - Today highlighting
  - Click on dates to view events for that day

- ✅ **Frontend Pages**
  - `/` - Calendar view
  - `/events` - List all events
  - `/events/new` - Create new event
  - `/events/[id]/edit` - Edit event
  - `/events/[id]` - Event details

- ✅ **Form Validation**
  - Required field validation
  - Date/time validation
  - Recurrence validation (weekday selection for weekly events)

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (via Prisma)
- **Backend**: Next.js Route Handlers (`/app/api`)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd calendar-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following content:
   ```
   DATABASE_URL="file:./dev.db"
   ```
   
   Or copy from `env.example.txt`:
   ```bash
   copy env.example.txt .env
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses Prisma with SQLite. The Event model includes:

- `id` - Auto-incrementing integer
- `title` - Event title (required)
- `description` - Event description (optional)
- `startDate` - Event start date and time
- `endDate` - Event end date and time
- `isRecurring` - Boolean flag for recurring events
- `frequency` - Recurrence frequency: "daily", "weekly", or "monthly"
- `daysOfWeek` - JSON string array for weekly events (e.g., "[1,3,5]" for Mon, Wed, Fri)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Usage

### Creating an Event

1. Click "New Event" in the navigation or go to `/events/new`
2. Fill in the event details:
   - Title (required)
   - Description (optional)
   - Start date and time (required)
   - End date and time (required)
3. For recurring events:
   - Check "Recurring Event"
   - Select frequency (Daily, Weekly, Monthly)
   - For weekly events, select the weekdays
4. Click "Create Event"

### Viewing Events

- **Calendar View**: Navigate to `/` to see events displayed in a monthly calendar
- **List View**: Navigate to `/events` to see all events in a list
- **Event Details**: Click on any event to view its details

### Editing an Event

1. Navigate to the event details page
2. Click "Edit" button
3. Modify the event details
4. Click "Save Changes"

### Deleting an Event

1. Navigate to the event details page or events list
2. Click "Delete" button
3. Confirm the deletion

## Project Structure

```
calendar-app/
├── app/
│   ├── api/
│   │   └── events/
│   │       ├── route.ts          # GET, POST /api/events
│   │       └── [id]/
│   │           └── route.ts      # GET, PUT, DELETE /api/events/[id]
│   ├── events/
│   │   ├── page.tsx              # Events list page
│   │   ├── new/
│   │   │   └── page.tsx          # Create event page
│   │   └── [id]/
│   │       ├── page.tsx          # Event details page
│   │       └── edit/
│   │           └── page.tsx      # Edit event page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Calendar view page
├── lib/
│   ├── calendar.ts               # Calendar utility functions
│   ├── events.ts                 # Event utility functions
│   └── prisma.ts                 # Prisma client setup
├── prisma/
│   └── schema.prisma             # Database schema
├── .env.example                  # Environment variables example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Recurring Events Logic

### Daily Events
Events repeat every day between the start and end date.

### Weekly Events
Events repeat on selected weekdays (e.g., Monday, Wednesday, Friday) between the start and end date.

### Monthly Events
Events repeat on the same day of the month (e.g., 15th of every month) between the start and end date.

## Screenshots

*Note: Add screenshots of your calendar and event forms here*

## Future Enhancements (Bonus Features)

- [ ] Use FullCalendar.js for enhanced calendar UI
- [ ] Add recurrence end date option
- [ ] Authentication with NextAuth.js
- [ ] Filters/search by date or keyword
- [ ] Server Actions for form handling
- [ ] Export events as ICS calendar file

## License

This project is created for interview/assessment purposes.
