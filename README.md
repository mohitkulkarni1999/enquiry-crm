# Enquiry CRM - Professional Real Estate CRM System

A full-stack CRM application for managing real estate enquiries, sales teams, and customer interactions.

## Architecture

```
enquiry-crm/
├── backend/          # Node.js Express API (port 8080)
│   ├── src/
│   │   ├── server.js           # Main server entry point
│   │   ├── database.js         # SQLite database (sql.js)
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT authentication
│   │   └── routes/
│   │       ├── auth.js         # Authentication endpoints
│   │       ├── enquiries.js    # Enquiry management
│   │       ├── salesPersons.js # Sales team management
│   │       ├── salesActivities.js
│   │       ├── users.js
│   │       └── notifications.js
│   └── data/                   # SQLite DB file (auto-created)
└── frontend/         # React + Vite (port 5173)
    └── src/
        ├── components/
        ├── contexts/
        └── utils/
```

## Quick Start

### 1. Start Backend
```bash
# Double-click start-backend.bat
# OR run manually:
cd backend
node src/server.js
```

### 2. Start Frontend
```bash
# Double-click start-frontend.bat
# OR run manually:
cd frontend
npm run dev
```

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Super Admin | `superadmin` | `admin123` |
| CRM Admin | `crmadmin` | `admin123` |
| Sales Rep 1 | `sales1` | `sales123` |
| Sales Rep 2 | `sales2` | `sales123` |

> **Note:** Run `POST /api/v1/auth/create-test-users` to create the CRM Admin and Sales users.

## Roles & Access

- **Super Admin**: Full system access — user management, all enquiries, analytics
- **CRM Admin**: Enquiry management, sales team management, assignment, analytics
- **Sales**: View only their assigned enquiries, log activities

## API Endpoints

### Auth
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/register/super-admin`
- `POST /api/v1/auth/register/crm-admin` (requires SUPER_ADMIN token)
- `POST /api/v1/auth/register/sales` (requires SUPER_ADMIN/CRM_ADMIN token)

### Enquiries
- `GET /api/v1/enquiries`
- `POST /api/v1/enquiries` (public - customer portal)
- `PUT /api/v1/enquiries/:id`
- `DELETE /api/v1/enquiries/:id`
- `POST /api/v1/enquiries/:id/assign/:salesPersonId`
- `POST /api/v1/enquiries/:id/auto-assign`
- `PUT /api/v1/enquiries/:id/status`
- `PUT /api/v1/enquiries/:id/interest-level`
- `POST /api/v1/enquiries/:id/remarks`
- `POST /api/v1/enquiries/:id/schedule-follow-up`
- `GET /api/v1/enquiries/search`
- `GET /api/v1/enquiries/hot-leads`
- `GET /api/v1/enquiries/unassigned`

### Sales Persons
- Full CRUD at `/api/v1/sales-persons`
- `GET /api/v1/sales-persons/available`
- `PUT /api/v1/sales-persons/:id/availability`
- `GET /api/v1/sales-persons/:id/performance`

### Users
- Full management at `/api/v1/users` (SUPER_ADMIN/CRM_ADMIN only)
