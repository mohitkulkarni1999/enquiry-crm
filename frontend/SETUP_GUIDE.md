# Enquiry CRM - Backend Frontend Connection Setup

## Prerequisites
- Java 17+ installed
- Maven installed
- Node.js and npm installed
- MySQL server running (localhost:3306)

## Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE enquiry_crm;
```

2. Update database credentials in `backend/src/main/resources/application.yml` if needed:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/enquiry_crm?createDatabaseIfNotExist=true
    username: root
    password: root
```

## Installation Steps

### 1. Install Frontend Dependencies
```bash
npm install react-router-dom react-hot-toast
```

### 2. Start Backend Server
Option A: Using batch file
```bash
./start-backend.bat
```

Option B: Manual command
```bash
cd backend
mvn spring-boot:run
```

The backend will start on: http://localhost:8080

### 3. Start Frontend Server
Option A: Using batch file
```bash
./start-frontend.bat
```

Option B: Manual command
```bash
npm run dev
```

The frontend will start on: http://localhost:5173

## API Endpoints
- Backend API Base: http://localhost:8080/api/v1
- Frontend Dev Server: http://localhost:5173
- Proxy configured: Frontend `/api/*` → Backend `http://localhost:8080/api/*`

## Key Features Configured
✅ CORS configuration for cross-origin requests
✅ Vite proxy for API calls during development
✅ React Context for state management
✅ API service utilities for backend communication
✅ React Router for navigation
✅ Toast notifications for user feedback
✅ Form validation and error handling

## Testing the Connection
1. Start both servers
2. Navigate to http://localhost:5173
3. Fill out the enquiry form
4. Submit - should see success toast and data saved to MySQL
5. Navigate to CRM Dashboard to view submitted enquiries

## Troubleshooting
- **Port 8080 in use**: Change backend port in `application.yml`
- **Port 5173 in use**: Vite will automatically use next available port
- **Database connection error**: Ensure MySQL is running and credentials are correct
- **CORS errors**: Check WebConfig.java CORS configuration
- **API not found**: Verify backend is running and endpoints are accessible

## File Structure
```
enquiry-crm/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/enquirycrm/
│   │   ├── config/WebConfig.java
│   │   └── ...
│   └── src/main/resources/application.yml
├── src/                     # React frontend
│   ├── components/
│   ├── contexts/AppContext.jsx
│   ├── utils/api.js
│   └── services/
├── vite.config.js          # Proxy configuration
├── start-backend.bat       # Backend startup script
└── start-frontend.bat      # Frontend startup script
```
