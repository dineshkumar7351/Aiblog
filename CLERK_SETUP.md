# Clerk Authentication Implementation Guide

## Overview
This project now uses **Clerk** for authentication instead of traditional JWT. Clerk provides a comprehensive authentication solution with built-in sign-in/sign-up UI, session management, and secure token handling.

## Setup Instructions

### 1. Get Clerk Credentials
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or select an existing one
3. Copy your credentials:
   - **Publishable Key** (public, safe to share)
   - **Secret Key** (private, never share)

### 2. Client Setup

Update `.env.local` in `blog/blog/client/`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

The Clerk provider is already configured in `src/main.jsx`.

### 3. Server Setup

Update `.env` in `blog/blog/server/`:
```env
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

## How It Works

### Client Flow
1. **ClerkProvider** wraps the entire app (in `main.jsx`)
2. **AuthProvider** (in `src/context/AuthContext.jsx`) uses Clerk hooks:
   - `useAuth()` - for authentication state
   - `useUser()` - for user information
   - `useSession()` - for session/token management

3. **Login/Register Pages** use Clerk's built-in components:
   - `<SignIn />` - Sign-in form
   - `<SignUp />` - Registration form

### Server Flow
1. Client makes API requests with Clerk token in `Authorization` header
2. Server's `auth.js` middleware verifies the token using Clerk's `verifyToken()`
3. Token verification extracts user info and creates/updates database record
4. Request proceeds with authenticated user attached

### API Communication
- **Request Interceptor**: Automatically adds Clerk token to all API requests
- **Response Interceptor**: Handles 401 errors by redirecting to login

## Key Files Modified

### Client
- `src/main.jsx` - ClerkProvider setup
- `src/context/AuthContext.jsx` - Clerk integration
- `src/services/api.js` - Token interceptor
- `.env.local` - Clerk credentials

### Server
- `middleware/auth.js` - Clerk token verification
- `models/User.js` - Added `clerkId` field for Clerk user linking
- `.env` - Clerk credentials

## Database User Management

When a user authenticates via Clerk:
1. Server verifies Clerk token
2. If user doesn't exist in database, it's created automatically
3. User linked to Clerk via `clerkId` field
4. Subsequent requests use the database user record

User model now includes:
- `clerkId` - Links to Clerk user ID
- `email` - From Clerk
- `name` - From Clerk
- `image` - Optional user avatar from Clerk

## Testing

1. Start the application:
   ```bash
   npm run start
   ```

2. Visit `http://localhost:5174` (client)

3. Click Sign In or Sign Up

4. Use Clerk's test credentials or create a test account

5. After successful authentication:
   - User is created in MongoDB
   - Clerk token is used for all API requests
   - Protected routes are accessible

## Protected Routes

Routes using `<ProtectedRoute>` component require authentication:
- `/dashboard`
- `/editor`
- `/blogs`
- `/analytics`
- `/design`

Unauthenticated users are redirected to `/login`.

## API Endpoints with Clerk

All endpoints using the `protect` middleware now require valid Clerk tokens:

```javascript
// Example: Protected blog endpoint
router.get('/blogs', protect, getBlogList);
```

Token must be sent as:
```
Authorization: Bearer <clerk_token>
```

## Environment Variables

### Client (`.env.local`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

### Server (`.env`)
```env
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

## Troubleshooting

### 401 Unauthorized Errors
- Ensure Clerk credentials are correct
- Check if token is being sent in request headers
- Verify `clerkId` exists in database for the user

### Token Verification Fails
- Check that `CLERK_SECRET_KEY` is set on server
- Ensure token format is `Bearer <token>`

### User Not Found in Database
- The server should auto-create users on first request
- Check MongoDB connection
- Review server logs for errors

## Next Steps

1. **Customize Sign-In/Sign-Up UI**:
   ```jsx
   <SignIn appearance={{ theme: 'dark' }} />
   ```

2. **Add Social OAuth** (Google, GitHub, etc.):
   - Configure in Clerk Dashboard
   - Clerk handles the integration automatically

3. **User Profile Management**:
   - Access via `useUser()` hook
   - Clerk provides profile update functionality

4. **Session Management**:
   - Token auto-refreshed by Clerk
   - Session stored securely

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [React SDK Guide](https://clerk.com/docs/react/overview)
- [Node.js Backend Guide](https://clerk.com/docs/backend-requests/handling/nodejs)
