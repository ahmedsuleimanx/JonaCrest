# Test Accounts for Jona Crest Properties

## Overview
The following test accounts have been created for testing all user roles in the application.

---

## Test Accounts

| Role | Email | Password | Dashboard URL |
|------|-------|----------|---------------|
| **Admin** | admin@jonacrest.com | Admin@123 | /admin |
| **Landlord** | landlord@jonacrest.com | Landlord@123 | /landlord |
| **Agent** | agent@jonacrest.com | Agent@123 | /agent |
| **User/Tenant** | user@jonacrest.com | User@123 | /dashboard |

---

## Login Steps

1. Navigate to: **http://localhost:5173/login**
2. Enter the email and password from the table above
3. Click "Sign In"
4. You will be redirected to the appropriate dashboard based on your role

---

## Payment Status

All test accounts have been created with `isPaid: true`, allowing immediate access without going through the Paystack payment flow.

---

## Role Features

### Admin (admin@jonacrest.com)
- Full system access
- User management
- Property approvals
- System analytics

### Landlord (landlord@jonacrest.com)
- Property listing management
- Viewing request handling
- Tenant communications

### Agent (agent@jonacrest.com)
- Lead management
- Property listings
- Client tracking
- Performance analytics

### User/Tenant (user@jonacrest.com)
- Property browsing
- Service requests
- Saved properties
- Viewing scheduling

---

## Re-creating Accounts

If you need to recreate the test accounts, run:

```bash
cd backend
node scripts/seed_test_accounts.js
```

Note: The script will skip accounts that already exist.

---

## Updating Payment Status

To manually update payment status for accounts:

```bash
mongosh jona_crest_db --eval "db.users.updateMany({email: {'\$in': ['admin@jonacrest.com', 'landlord@jonacrest.com', 'agent@jonacrest.com', 'user@jonacrest.com']}}, {'\$set': {isPaid: true}})"
```

---

## Verification

All accounts have been verified to work correctly:
- ✅ Admin login successful
- ✅ Landlord login successful  
- ✅ Agent login successful
- ✅ User login successful

Date: January 5, 2026
