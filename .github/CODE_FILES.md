# Code Files to Create

This document lists all files that need to be created with their respective code.
Each file is numbered and contains the complete implementation.

## File Structure

```
ticket_system/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── server.js
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleCheck.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Ticket.js
│   │   ├── EventSettings.js
│   │   └── TicketHistory.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tickets.js
│   │   ├── scanner.js
│   │   ├── admin.js
│   │   └── settings.js
│   ├── utils/
│   │   ├── emailService.js
│   │   ├── qrGenerator.js
│   │   ├── ageCalculator.js
│   │   └── passwordHash.js
│   └── templates/
│       └── ticketEmail.js
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── SellerView.jsx
│   │   │   ├── TicketForm.jsx
│   │   │   ├── ScannerView.jsx
│   │   │   ├── TicketDisplay.jsx
│   │   │   ├── AdminView.jsx
│   │   │   ├── TicketList.jsx
│   │   │   ├── EditTicket.jsx
│   │   │   ├── SettingsPanel.jsx
│   │   │   └── Statistics.jsx
│   │   └── utils/
│   │       └── api.js
└── database/
    └── schema.sql
```

## Implementation Order

Follow this order when creating files:

### Phase 1: Database & Backend Core (Files 1-8)
1. database/schema.sql
2. backend/package.json
3. backend/.env.example
4. backend/config/database.js
5. backend/utils/passwordHash.js
6. backend/middleware/auth.js
7. backend/middleware/roleCheck.js
8. backend/server.js

### Phase 2: Backend Models (Files 9-12)
9. backend/models/User.js
10. backend/models/EventSettings.js
11. backend/models/TicketHistory.js
12. backend/models/Ticket.js

### Phase 3: Backend Utils (Files 13-16)
13. backend/utils/ageCalculator.js
14. backend/utils/qrGenerator.js
15. backend/templates/ticketEmail.js
16. backend/utils/emailService.js

### Phase 4: Backend Routes (Files 17-21)
17. backend/routes/auth.js
18. backend/routes/settings.js
19. backend/routes/tickets.js
20. backend/routes/scanner.js
21. backend/routes/admin.js

### Phase 5: Frontend Setup (Files 22-28)
22. frontend/package.json
23. frontend/.env.example
24. frontend/vite.config.js
25. frontend/tailwind.config.js
26. frontend/postcss.config.js
27. frontend/index.html
28. frontend/src/index.css

### Phase 6: Frontend Core (Files 29-31)
29. frontend/src/utils/api.js
30. frontend/src/contexts/AuthContext.jsx
31. frontend/src/App.jsx

### Phase 7: Frontend Components (Files 32-42)
32. frontend/src/components/Login.jsx
33. frontend/src/components/TicketForm.jsx
34. frontend/src/components/SellerView.jsx
35. frontend/src/components/TicketDisplay.jsx
36. frontend/src/components/ScannerView.jsx
37. frontend/src/components/Statistics.jsx
38. frontend/src/components/SettingsPanel.jsx
39. frontend/src/components/EditTicket.jsx
40. frontend/src/components/TicketList.jsx
41. frontend/src/components/AdminView.jsx
42. frontend/src/main.jsx

Total: 42 files

## Testing Checklist

After implementation, test these scenarios:

### Seller Tests
- [ ] Login as seller
- [ ] Create ticket with valid data
- [ ] Verify email sent
- [ ] Check ticket appears in database
- [ ] Try invalid birthdate format
- [ ] Try invalid class selection

### Scanner Tests
- [ ] Login as scanner
- [ ] Scan valid ticket (simulate QR)
- [ ] Verify age calculation
- [ ] Verify color coding
- [ ] Try scanning same ticket twice
- [ ] Try invalid ticket number

### Admin Tests
- [ ] Login as admin
- [ ] View all tickets
- [ ] Edit ticket owner
- [ ] Configure allowed classes
- [ ] Set event date
- [ ] View statistics
- [ ] Export data

### Security Tests
- [ ] Try accessing routes without auth
- [ ] Try seller accessing admin routes
- [ ] Try SQL injection
- [ ] Try XSS attacks
- [ ] Verify password hashing

## Next Steps After Implementation

1. Create default admin user (run SQL manually):
```sql
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@example.com', '$2a$10$...', 'admin');
```

2. Configure event settings:
   - Set event date
   - Add allowed classes
   - Configure age color ranges

3. Create seller and scanner accounts via admin panel

4. Test full workflow: Sell → Scan → Verify

5. Deploy to production
