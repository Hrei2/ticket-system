# Ticket System Implementation Guide

## Project Overview
A ticket management system for school events with three user roles: Seller, Scanner, and Admin.

## Tech Stack
- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (Supabase free tier)
- **Email**: Resend (free tier - 3000 emails/month)
- **Auth**: JWT tokens
- **QR Codes**: qrcode library
- **Deployment**: Vercel (frontend), Railway/Render (backend)

## Database Schema

### Table: users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('seller', 'scanner', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: tickets
```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    birthdate VARCHAR(6) NOT NULL,
    class VARCHAR(50) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    is_scanned BOOLEAN DEFAULT FALSE,
    scanned_at TIMESTAMP,
    scanned_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);
```

### Table: event_settings
```sql
CREATE TABLE event_settings (
    id SERIAL PRIMARY KEY,
    event_date DATE NOT NULL,
    allowed_classes JSONB NOT NULL,
    age_color_ranges JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: ticket_history
```sql
CREATE TABLE ticket_history (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id),
    action VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by INTEGER REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Steps

### Step 1: Project Setup
1. Create folder structure:
   - `backend/` - Node.js API
   - `frontend/` - React app
2. Initialize npm in both folders
3. Install dependencies (see DEPENDENCIES.md)

### Step 2: Backend Setup
1. Create `backend/server.js` - Express server setup
2. Create `backend/config/database.js` - PostgreSQL connection
3. Create `backend/middleware/auth.js` - JWT authentication middleware
4. Create `backend/middleware/roleCheck.js` - Role-based access control

### Step 3: Backend Models
1. `backend/models/User.js` - User CRUD operations
2. `backend/models/Ticket.js` - Ticket CRUD operations
3. `backend/models/EventSettings.js` - Settings management
4. `backend/models/TicketHistory.js` - Audit trail

### Step 4: Backend Utilities
1. `backend/utils/emailService.js` - Resend integration
2. `backend/utils/qrGenerator.js` - QR code generation
3. `backend/utils/ageCalculator.js` - Age calculation with color coding
4. `backend/utils/passwordHash.js` - bcrypt hashing

### Step 5: Backend Routes
1. `backend/routes/auth.js` - Login/logout/register
2. `backend/routes/tickets.js` - Ticket CRUD operations
3. `backend/routes/scanner.js` - Scan validation
4. `backend/routes/admin.js` - Admin operations
5. `backend/routes/settings.js` - Event settings

### Step 6: Frontend Setup
1. Create Vite React project
2. Install dependencies (React Router, Axios, TailwindCSS)
3. Setup routing in `frontend/src/App.jsx`
4. Create context for authentication

### Step 7: Frontend Components - Authentication
1. `frontend/src/components/Login.jsx` - Login form
2. `frontend/src/contexts/AuthContext.jsx` - Auth state management

### Step 8: Frontend Components - Seller View (Desktop)
1. `frontend/src/components/SellerView.jsx` - Main seller dashboard
2. `frontend/src/components/TicketForm.jsx` - Ticket creation form
3. `frontend/src/components/TicketConfirmation.jsx` - Success message

### Step 9: Frontend Components - Scanner View (Mobile)
1. `frontend/src/components/ScannerView.jsx` - Mobile-optimized scanner
2. `frontend/src/components/TicketDisplay.jsx` - Display scanned ticket info
3. `frontend/src/components/ManualInput.jsx` - Manual ticket number entry

### Step 10: Frontend Components - Admin View
1. `frontend/src/components/AdminView.jsx` - Admin dashboard
2. `frontend/src/components/TicketList.jsx` - All tickets table
3. `frontend/src/components/EditTicket.jsx` - Edit ticket modal
4. `frontend/src/components/SettingsPanel.jsx` - Event settings configuration
5. `frontend/src/components/Statistics.jsx` - Scanning statistics

### Step 11: Frontend Styling
1. Configure TailwindCSS
2. Create responsive layouts
3. Mobile-first design for scanner
4. Desktop-optimized for seller/admin

### Step 12: Email Templates
1. `backend/templates/ticketEmail.js` - HTML email template
2. Include QR code inline
3. Ticket details formatting

### Step 13: Environment Configuration
1. `.env.example` files for both frontend and backend
2. Configuration for database, email, JWT secret

### Step 14: Testing
1. Test seller workflow
2. Test scanner workflow
3. Test admin operations
4. Test email delivery
5. Test edge cases (duplicate scans, invalid tickets)

### Step 15: Deployment
1. Deploy PostgreSQL to Supabase
2. Deploy backend to Railway/Render
3. Deploy frontend to Vercel
4. Configure environment variables
5. Test production deployment

## Key Features Implementation Notes

### Birthdate Format (DDMMYY)
- Store as string in format: "040609" (June 4, 2009)
- Parse: day = chars 0-1, month = chars 2-3, year = chars 4-5
- Add "20" or "19" prefix based on logic (assume 20XX for years 00-25, 19XX for 26-99)

### Age Color Coding
Default ranges (configurable in admin):
```json
{
  "0-15": "#FF6B6B",
  "16-17": "#FFA500",
  "18+": "#4CAF50"
}
```

### Ticket Numbering
- Use PostgreSQL SERIAL for auto-increment
- Format: `TKT-{year}-{number}` (e.g., TKT-2025-00001)

### QR Code Content
- Encode ticket number as string
- Scanner decodes and validates against database

### Email Sending
- Send immediately after ticket creation
- Include: Ticket number, Name, QR code, Event details
- Handle errors gracefully (log failed sends)

### Scanner Validation
- Check if ticket exists
- Check if already scanned (prevent double-scan)
- Display age with color coding
- Mark as scanned with timestamp

### Admin Capabilities
- Change ticket owner (email)
- Edit name, surname, class, birthdate
- View scan history
- Configure allowed classes
- Set event date
- View statistics (total sold, scanned, pending)

## Security Considerations
1. Hash passwords with bcrypt (salt rounds: 10)
2. Use JWT with expiration (24h for sellers/scanners, 7d for admin)
3. Validate all inputs on backend
4. Rate limiting on API endpoints
5. CORS configuration
6. SQL injection prevention (use parameterized queries)
7. XSS prevention (sanitize inputs)

## Error Handling
1. Global error handler middleware
2. Proper HTTP status codes
3. User-friendly error messages
4. Backend logging for debugging

## Mobile Optimization (Scanner)
1. Large touch targets
2. Camera access for QR scanning
3. Offline capability (cache scanned tickets)
4. Auto-focus on manual input
5. Clear visual feedback

## Desktop Optimization (Seller/Admin)
1. Keyboard shortcuts
2. Bulk operations (admin)
3. Search and filter
4. Pagination for large datasets
5. Export functionality (CSV)
