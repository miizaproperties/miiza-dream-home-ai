# Dashboard API

Custom admin dashboard API endpoints for MiiZA Realtors.

## Endpoints

All endpoints require admin authentication (`IsAdminUser` permission).

### 1. Dashboard Statistics
**GET** `/api/dashboard/stats/`

Returns overall dashboard statistics including:
- Property counts (total, available, sold, rented, featured)
- Contact and viewing statistics
- User and agent counts
- Revenue information
- Growth percentages

### 2. Property Analytics
**GET** `/api/dashboard/analytics/`

Returns detailed analytics data:
- Property type distribution
- Status distribution
- Properties by city and country
- Price statistics (avg, min, max)
- Monthly trend data (last 12 months)

### 3. Recent Activity
**GET** `/api/dashboard/activity/`

Returns recent activity feed:
- Recent properties
- Recent contacts
- Recent viewing requests

### 4. Top Performers
**GET** `/api/dashboard/top-performers/`

Returns top performing:
- Featured properties
- Agents

## Authentication

All endpoints require:
- User must be authenticated
- User must have `is_staff=True` or `is_superuser=True`

## Frontend Access

The dashboard frontend is available at:
- Development: `http://localhost:8080/dashboard`
- Requires admin login via Django admin first

## Usage

1. Log in to Django admin: `http://localhost:8000/admin/`
2. Navigate to dashboard: `http://localhost:8080/dashboard`
3. The dashboard will use your admin session for authentication

