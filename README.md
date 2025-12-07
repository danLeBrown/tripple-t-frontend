# Tripple T Dashboard

A production-ready Vue.js dashboard for managing preform and bottle blowing operations. Built with Vue 3, TypeScript, Tailwind CSS, and integrated with a NestJS backend API.

## Overview

The Tripple T Dashboard provides a comprehensive interface for monitoring production records, bottle blowing records, and managing business primitives including products, colors, sizes, units, suppliers, and customers.

## Features

- 🔐 **Authentication**: Session-based authentication with CSRF protection and JWT tokens
- 📊 **Data Management**: Full CRUD operations for all business entities
- 🔍 **Search & Pagination**: Real-time search with debouncing and paginated data display
- 📱 **Responsive Design**: Modern, clean UI built with Tailwind CSS
- ⚡ **Performance**: Optimized with Vue 3 Composition API and Pinia state management
- 🎨 **User Experience**: Loading states, auto-dismissing alerts, and intuitive navigation

## Tech Stack

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Icons**: Heroicons
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.vue          # Main layout wrapper
│   │   └── Sidebar.vue          # Navigation sidebar with collapsible sections
│   ├── common/
│   │   ├── Alert.vue            # Global alert/notification system
│   │   ├── DataTable.vue        # Reusable table component with CRUD
│   │   └── Modal.vue            # Reusable modal component
│   └── configuration/
│       ├── ColorsTable.vue      # Colors management table
│       ├── CustomersTable.vue   # Customers management table
│       ├── ProductsTable.vue    # Products management table
│       ├── SizesTable.vue       # Sizes management table
│       ├── SuppliersTable.vue   # Suppliers management table
│       └── UnitsTable.vue       # Units management table
├── services/
│   ├── base.api.ts              # Base API service with interceptors
│   ├── colors.service.ts        # Colors API service
│   ├── customers.service.ts     # Customers API service
│   ├── products.service.ts      # Products API service
│   ├── sizes.service.ts         # Sizes API service
│   ├── suppliers.service.ts     # Suppliers API service
│   └── units.service.ts         # Units API service
├── stores/
│   ├── alert.ts                 # Alert/notification store
│   ├── auth.ts                  # Authentication store
│   └── configuration.ts         # Configuration entities store
├── types/
│   └── index.ts                 # TypeScript type definitions
├── views/
│   ├── Dashboard.vue           # Main dashboard view
│   ├── Configuration.vue       # Configuration page (Products, Colors, Sizes, Units)
│   ├── Login.vue                # Login page
│   └── ThirdParties.vue         # Third Parties page (Suppliers, Customers)
├── router/
│   └── index.ts                 # Vue Router configuration
├── App.vue                      # Root component
└── main.ts                      # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tripple-t-frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=https://staging-api.danlebrown.com/tripple-t/v1
VITE_API_APP_BASE_URL=https://staging-api.danlebrown.com/tripple-t
```

### Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
pnpm build
```

The production build will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:
```bash
pnpm preview
```

### Linting

Run ESLint to check code quality:
```bash
pnpm lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for API v1 endpoints | `https://staging-api.danlebrown.com/tripple-t/v1` |
| `VITE_API_APP_BASE_URL` | Base URL for app endpoints (CSRF, health) | `https://staging-api.danlebrown.com/tripple-t` |

## Authentication Flow

The application uses a multi-step authentication process:

1. **Session Key**: Generated client-side or provided externally
2. **CSRF Token**: Fetched from `/csrf-token` endpoint using session key
3. **JWT Token**: Obtained after successful login at `/auth/login`
4. **Refresh Token**: Used to refresh expired access tokens

### Key Points

- CSRF token must be included in **ALL** requests, including login
- Session ID is sent via `X-Session-ID` header
- CSRF token is sent via `X-CSRF-TOKEN` header
- JWT token is sent via `Authorization: Bearer <token>` header
- Tokens are stored in localStorage
- Automatic token refresh on 401 errors
- Redirect to login if refresh token expires

## API Integration

### Base Service

The `base.api.ts` service provides:
- Two Axios instances: `api` (v1 endpoints) and `appApi` (non-v1 endpoints)
- Request interceptors for automatic header injection
- Response interceptors for error handling and token refresh
- Global error alerting

### Module Services

Each entity has its own service file (e.g., `products.service.ts`) that:
- Extends the base API service
- Provides type-safe methods: `search()`, `getById()`, `create()`, `update()`, `delete()`
- Uses the `/search` endpoint with pagination and optional query parameter

### Search & Pagination

All list endpoints use the `/search` endpoint with:
- `query` (optional): Search term
- `page`: Page number (0-indexed)
- `limit`: Items per page
- `order_by`: Field to sort by
- `order_direction`: `asc` or `desc`

Response format:
```typescript
{
  data: T[],
  total: number,
  limit: number,
  page: number
}
```

## Key Features

### Data Tables

All tables include:
- **Search**: Real-time search with 300ms debouncing
- **Pagination**: Display showing "X to Y of Z results" with Previous/Next buttons
- **Loading States**: Visual feedback during API calls
- **Button Disabling**: Prevents duplicate actions during operations
- **Auto-refresh**: Automatically refetches data after create/update operations

### Product Management

The Products table features:
- **Dropdown Selects**: Size, Colour, and Unit fields populated from API
- **Sorted Options**: 
  - Sizes sorted by value (ascending)
  - Colors sorted alphabetically
  - Units sorted alphabetically
- **Type Selection**: Preform, Cap, Bottle, Nylon, Other

### Navigation

- **Collapsible Sections**: Configuration and Third Parties sections can be expanded/collapsed
- **Auto-expand**: Sections automatically expand when navigating to their routes
- **Icons**: Heroicons for visual navigation cues

### Alerts & Modals

- **Auto-dismissing Alerts**: Success/error messages auto-dismiss after 5 seconds
- **High Z-index**: Alerts appear above modals (z-100)
- **Modal Overlay**: 30% opacity for better visibility
- **Loading Indicators**: Spinner animations during form submissions

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/login` | Login | Login page with redirect tracking |
| `/` | Dashboard | Main dashboard view |
| `/configuration` | Configuration | Redirects to `/configuration/products` |
| `/configuration/:tab` | Configuration | Products, Colors, Sizes, Units tabs |
| `/third-parties` | ThirdParties | Redirects to `/third-parties/suppliers` |
| `/third-parties/:tab` | ThirdParties | Suppliers, Customers tabs |

## Type Definitions

All entities extend `BaseEntity`:
```typescript
interface BaseEntity {
  id: string;
  created_at: number;  // Unix timestamp
  updated_at: number;  // Unix timestamp
}
```

Key entities:
- **Product**: `type`, `size`, `colour`, `unit`, `slug`
- **Colour**: `name`, `slug`
- **Size**: `value`
- **Unit**: `name`, `symbol`, `slug`
- **Supplier**: `first_name`, `last_name`, `email`, `phone_number`, `status`, `address`, `state`
- **Customer**: Same fields as Supplier

## Development Guidelines

### Code Style

- Use Vue 3 Composition API with `<script setup>`
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Follow Vue 3 best practices

### State Management

- Use Pinia stores for global state
- Keep component state local when possible
- Use computed properties for derived state

### API Calls

- Always use the service layer (not direct Axios calls)
- Handle errors in the base API service
- Use loading states for better UX

## API Documentation

Backend API documentation: https://staging-api.danlebrown.com/tripple-t/documentation

## License

[Add your license here]

## Contributing

[Add contributing guidelines here]
