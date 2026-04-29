# MFA Implementation - Setup Guide

## ✅ Implementation Complete!

Your Hockey Coach Pro application now has full Multi-Factor Authentication (MFA) support with:
- ✅ Password-based authentication
- ✅ Open user registration
- ✅ TOTP (Authenticator App) support
- ✅ SMS verification support
- ✅ Backup codes for account recovery
- ✅ Account settings for MFA management
- ✅ Rate limiting on all auth endpoints
- ✅ JWT token-based sessions

---

## 🚀 Getting Started

### 1. Backend is Already Running
The backend server is running on `http://localhost:5000` with all new endpoints active.

### 2. Frontend Setup
The frontend has been updated to use the new authentication system (`AppV2`).

### 3. Test the Application
Open your browser to `http://localhost:5174/` and you should see the new login screen.

---

## 📝 Testing the Authentication Flow

### Register a New Account
1. Click "Register here" on the login screen
2. Fill in:
   - Email: `test@example.com`
   - Username: `testuser`
   - Full Name: `Test User`
   - Phone Number: `+15551234567` (optional, for SMS MFA)
   - Password: `SecurePass123!`
3. Click "Create Account"
4. You'll be logged in automatically

### Enable MFA (TOTP - Authenticator App)
1. After registration, you'll see an MFA setup prompt
2. Choose "Authenticator App"
3. Scan the QR code with Google Authenticator, Authy, or similar app
4. Enter the 6-digit code from your app
5. Save the backup codes shown (download them!)
6. Click "Done"

### Enable MFA (SMS)
1. Go to Account Settings (gear icon in header)
2. Click "Enable MFA"
3. Choose "SMS Text Message"
4. You'll receive a code via SMS (requires Twilio setup - see below)
5. Enter the 6-digit code
6. Save the backup codes
7. Click "Done"

### Login with MFA
1. Enter your email/username and password
2. Click "Sign In"
3. You'll be prompted for your MFA code
4. Enter the 6-digit code from your authenticator app or SMS
5. Click "Verify"

### Use Backup Codes
1. On the MFA verification screen, click "Use backup code"
2. Enter one of your backup codes
3. Click "Verify"
4. **Note:** Each backup code can only be used once

---

## 📱 SMS Setup (Twilio)

**⚠️ You need to set up Twilio for SMS MFA to work!**

### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your email and phone number
4. You'll get $15 in free credit (enough for ~500 SMS messages)

### Step 2: Get Your Credentials
1. Go to your Twilio Console: https://console.twilio.com/
2. Find your **Account SID** and **Auth Token**
3. Get a phone number:
   - Click "Get a Trial Number" or
   - Go to Phone Numbers → Buy a Number

### Step 3: Configure Backend
1. Open `backend/.env` (create it if it doesn't exist)
2. Add your Twilio credentials:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
```

### Step 4: Restart Backend
```bash
cd backend
npm start
```

### Step 5: Test SMS
1. Register with a phone number
2. Enable SMS MFA
3. You should receive a text message with a verification code

**Note:** With a trial account, you can only send SMS to verified phone numbers. Upgrade to send to any number.

---

## 🔐 Security Features

### Password Requirements
- Minimum 8 characters
- Password strength indicator shown during registration

### Rate Limiting
- **Login:** 5 attempts per 15 minutes
- **MFA Verification:** 5 attempts per 15 minutes
- **Registration:** 3 attempts per hour
- **SMS Codes:** 3 requests per 5 minutes

### Token Security
- JWT tokens expire after 24 hours
- Tokens stored in localStorage (consider httpOnly cookies for production)
- All MFA endpoints require valid authentication

### Backup Codes
- 10 codes generated per account
- Each code can be used only once
- Regenerate codes from Account Settings (requires password)

---

## 🎯 Available Endpoints

### Authentication
- `POST /api/auth/v2/register` - Create new account
- `POST /api/auth/v2/login` - Login with password
- `POST /api/auth/v2/verify-mfa` - Verify MFA code
- `POST /api/auth/v2/send-sms` - Send SMS verification code

### MFA Management (Requires Auth Token)
- `POST /api/auth/v2/mfa/start` - Start MFA enrollment
- `POST /api/auth/v2/mfa/complete` - Complete MFA enrollment
- `POST /api/auth/v2/mfa/disable` - Disable MFA (requires password)
- `GET /api/auth/v2/mfa/backup-codes` - Get backup codes
- `POST /api/auth/v2/mfa/regenerate-backup-codes` - Regenerate codes

---

## 🛠️ Account Settings

Access via the gear icon (⚙️) in the top right of the app:
- View account information
- Enable/disable MFA
- View remaining backup codes
- Download backup codes
- Regenerate backup codes
- Disable MFA (requires password confirmation)

---

## 🧪 Testing Without SMS

If you don't want to set up Twilio immediately:
1. Use TOTP (Authenticator App) method instead
2. Download Google Authenticator or Authy on your phone
3. Scan the QR code shown during setup
4. Use the 6-digit codes from the app

---

## 📊 Database Schema

New tables created:
- `accounts` - User accounts with passwords and MFA settings
- `login_attempts` - Rate limiting tracking
- `sessions` - Active sessions (future use)
- `mfa_attempts` - MFA verification tracking
- `sms_codes` - SMS verification codes with expiration

---

## 🔄 Migration from Old System

The old login system (username-only) is still available at `/api/auth/login` for backward compatibility. However, all new features use the v2 endpoints.

---

## 🐛 Troubleshooting

### "Failed to send SMS code"
- Check that Twilio credentials are correct in `.env`
- Verify your Twilio account is active
- Check that the phone number is verified (for trial accounts)

### "Invalid verification code"
- TOTP codes expire every 30 seconds - enter quickly
- SMS codes expire after 5 minutes
- Check your device's time is synchronized

### "Too many attempts"
- Wait 15 minutes and try again
- Rate limiting is in place for security

### Backend not starting
- Check that port 5000 is not in use
- Run `npm install` in the backend folder
- Check for any error messages in the console

---

## 🎉 Success!

Your application now has enterprise-grade authentication with MFA support. Users can:
1. ✅ Register new accounts
2. ✅ Login with password
3. ✅ Enable MFA (TOTP or SMS)
4. ✅ Use backup codes for recovery
5. ✅ Manage MFA settings

---

## 📞 Next Steps

**When you're ready to set up SMS:**
1. Create your Twilio account
2. Add credentials to `.env`
3. Restart the backend
4. Test SMS MFA

**For now, you can:**
- Test registration and login
- Enable TOTP MFA with an authenticator app
- Explore the account settings page
- Test backup codes

Enjoy your secure authentication system! 🏒🔐
