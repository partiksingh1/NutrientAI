# Google Sign-In Setup Guide with BetterAuth

This guide will help you set up Google Sign-In end-to-end using BetterAuth in your React Native Expo app with Express backend.

## Prerequisites

1. Google Cloud Console project
2. PostgreSQL database
3. Node.js and npm installed

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen:
   - Add your app name and logo
   - Add authorized domains
   - Add test users if in testing mode
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `exp://localhost:8081/--/auth/callback` (for Expo)
   - Note down the Client ID and Client Secret

## Step 2: Environment Variables

### Backend (.env in /workspace/server/.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-here"
REFRESH_SECRET="your-super-secret-refresh-key-here"

# BetterAuth
BETTER_AUTH_SECRET="your-better-auth-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Frontend (.env in /workspace/expo-starter-auth-nativewind/.env)
```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000

# Google OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Step 3: Database Setup

1. Run the Prisma migration to update your database schema:
```bash
cd /workspace/server
npx prisma db push
```

2. Generate the Prisma client:
```bash
npx prisma generate
```

## Step 4: Backend Setup

The backend is already configured with:
- BetterAuth with Google OAuth provider
- Prisma adapter for PostgreSQL
- Express routes for BetterAuth API endpoints
- Updated User model with OAuth support

## Step 5: Frontend Setup

The frontend is already configured with:
- BetterAuth React Native client
- Google Sign-In button component
- Updated AuthContext with Google OAuth methods
- Integration with existing login/register forms

## Step 6: Testing the Implementation

1. Start the backend server:
```bash
cd /workspace/server
npm run dev
```

2. Start the Expo development server:
```bash
cd /workspace/expo-starter-auth-nativewind
npm start
```

3. Test the Google Sign-In flow:
   - Open the app on your device/simulator
   - Go to the login or register screen
   - Tap "Sign in with Google" or "Sign up with Google"
   - Complete the OAuth flow
   - Verify that the user is authenticated and redirected

## Features Implemented

### Backend Features
- ✅ BetterAuth configuration with Google OAuth
- ✅ Prisma schema updates for OAuth support
- ✅ Express routes for BetterAuth API
- ✅ Session management
- ✅ User profile integration

### Frontend Features
- ✅ Google Sign-In button component
- ✅ BetterAuth React Native client
- ✅ Updated AuthContext with OAuth methods
- ✅ Integration with existing forms
- ✅ Session persistence with AsyncStorage
- ✅ Error handling and loading states

## API Endpoints

The following BetterAuth endpoints are available:
- `POST /api/auth/sign-in/email` - Email/password sign-in
- `POST /api/auth/sign-up/email` - Email/password sign-up
- `GET /api/auth/sign-in/google` - Google OAuth sign-in
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure the redirect URI in Google Cloud Console matches exactly
   - Check that the callback URL is properly configured

2. **"Client ID not found" error**
   - Verify the Google Client ID is correctly set in environment variables
   - Ensure the OAuth consent screen is properly configured

3. **Database connection issues**
   - Check the DATABASE_URL in your .env file
   - Ensure PostgreSQL is running and accessible

4. **CORS issues**
   - Verify the trustedOrigins in BetterAuth configuration
   - Check that the frontend URL is included in trusted origins

### Debug Steps

1. Check server logs for authentication errors
2. Verify environment variables are loaded correctly
3. Test the OAuth flow step by step
4. Check network requests in browser dev tools

## Security Considerations

1. **Environment Variables**: Never commit .env files to version control
2. **HTTPS**: Use HTTPS in production for OAuth callbacks
3. **Secrets**: Use strong, unique secrets for JWT and BetterAuth
4. **Redirect URIs**: Only add necessary redirect URIs to Google Console
5. **Session Management**: Implement proper session cleanup on logout

## Next Steps

1. Add more OAuth providers (Facebook, Apple, etc.)
2. Implement email verification
3. Add two-factor authentication
4. Set up proper error monitoring
5. Add comprehensive testing
6. Deploy to production with proper environment configuration

## Support

If you encounter issues:
1. Check the BetterAuth documentation
2. Review Google OAuth documentation
3. Check the console logs for detailed error messages
4. Verify all environment variables are correctly set