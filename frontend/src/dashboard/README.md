# Dashboard Frontend

Custom admin dashboard for MiiZA Realtors built with React and TypeScript.

## Features

- **Overview Dashboard**: Real-time statistics and key metrics
- **Analytics**: Detailed property analytics with charts
- **Properties Management**: View and manage all properties
- **Users & Agents**: Manage user accounts and agents

## Access

1. First, log in to Django admin: `http://localhost:8000/admin/`
2. Then navigate to: `http://localhost:8080/dashboard`

## Pages

### `/dashboard`
Main overview page with:
- Statistics cards (properties, contacts, revenue)
- Recent activity feed
- Quick action buttons

### `/dashboard/analytics`
Analytics page with:
- Property type distribution (pie chart)
- Status distribution (bar chart)
- Monthly trend (line chart)
- Top cities
- Price statistics

### `/dashboard/properties`
Properties management page with:
- Search functionality
- Property listing table
- Quick links to Django admin

### `/dashboard/users`
Users and agents management with:
- User listing
- Agent listing
- Quick links to Django admin

## Components

- `StatCard`: Reusable statistics card component
- `Chart`: Simple chart component (bar, line, pie)
- `ActivityFeed`: Recent activity display
- `DashboardLayout`: Main layout with sidebar navigation

## API Integration

The dashboard uses:
- `dashboardApi.ts`: API service for dashboard endpoints
- `useDashboardStats.ts`: React Query hooks for data fetching
- Automatic refetching every 30-60 seconds

## Authentication

Currently uses session-based authentication. Make sure you're logged into Django admin first.

