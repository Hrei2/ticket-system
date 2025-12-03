# Dependencies Guide

## Backend Dependencies

### Production Dependencies
Install with: `npm install <package-name>`

```json
{
  "express": "^4.18.2",
  "pg": "^8.11.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5",
  "resend": "^3.0.0",
  "qrcode": "^1.5.3",
  "express-validator": "^7.0.1"
}
```

### Dev Dependencies
Install with: `npm install -D <package-name>`

```json
{
  "nodemon": "^3.0.2"
}
```

## Frontend Dependencies

### Production Dependencies
Install with: `npm install <package-name>`

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.21.0",
  "axios": "^1.6.2",
  "html5-qrcode": "^2.3.8",
  "date-fns": "^3.0.0"
}
```

### Dev Dependencies
Install with: `npm install -D <package-name>`

```json
{
  "@vitejs/plugin-react": "^4.2.1",
  "vite": "^5.0.8",
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.32",
  "autoprefixer": "^10.4.16",
  "eslint": "^8.56.0",
  "eslint-plugin-react": "^7.33.2"
}
```

## Installation Commands

### Backend Setup
```bash
cd backend
npm init -y
npm install express pg bcryptjs jsonwebtoken dotenv cors helmet express-rate-limit resend qrcode express-validator
npm install -D nodemon
```

### Frontend Setup
```bash
cd frontend
npm create vite@latest . -- --template react
npm install react-router-dom axios html5-qrcode date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Package Descriptions

### Backend Packages
- **express**: Web framework for Node.js
- **pg**: PostgreSQL client for Node.js
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting middleware
- **resend**: Email sending service
- **qrcode**: QR code generation
- **express-validator**: Input validation
- **nodemon**: Auto-restart server on file changes

### Frontend Packages
- **react**: UI library
- **react-dom**: React DOM rendering
- **react-router-dom**: Client-side routing
- **axios**: HTTP client
- **html5-qrcode**: QR code scanner
- **date-fns**: Date manipulation
- **vite**: Build tool
- **tailwindcss**: Utility-first CSS framework
- **postcss**: CSS processing
- **autoprefixer**: CSS vendor prefixing

## Environment Variables

### Backend `.env`
```env
PORT=3001
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-change-this
RESEND_API_KEY=re_your_api_key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3001
```
