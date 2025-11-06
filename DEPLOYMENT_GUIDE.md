# Firebase Admin SDK Deployment Guide

This guide explains how to properly configure Firebase Admin SDK credentials for Vercel and Netlify deployments.

## The Problem

When you copy/paste a multi-line private key into environment variable fields on deployment platforms, the newline characters get corrupted, causing the "Invalid PEM formatted message" error.

## The Solution

Convert your private key to a **single line with `\n` as literal text characters**.

---

## Required Environment Variables

You need to add these 3 environment variables to your deployment platform:

### 1. FIREBASE_PROJECT_ID
```
studio-165909115-9ff76
```

### 2. FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-fbsvc@studio-165909115-9ff76.iam.gserviceaccount.com
```

### 3. FIREBASE_PRIVATE_KEY

**IMPORTANT:** Paste this exact format (all on ONE line):

```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDUbKLnMMPp1Mx8\nDLIjXDRDDcDF7YvJ59HCoODAFW7X1ySGpjLEBqxvoU5XKs/zTdheCmWd90u26Y/Y\n0aHgU680j+HxSqGKEpgIa8/fevGC1Mngw9+Lu5uZeYFANiSM/4BU0tzxw7Yb6R2c\nIycKH85+ZCjiBVIVfFK65G/clNTgnjf3u3bDsUktofrN7CBfRp7oBClgEHF9HoB5\nZuaiWsla9RNk6zOFgXXFB9Lerto8X1xFo8bl/xg9M39emvrjwlV+72Cd4q/MEiui\nxdY3EOmwgLvQi8gFSCg2lMMrP0JPhZNldSawhZsY/bFl0lmGqzwGi0NoCId2macN\n8gO9JN5lAgMBAAECggEAHeIQgqyCCw2UHKlekAnjEkHHijCSNzuk7xfZtjvtpXCP\nI2ATCS+VJ3kOP8X2jhg35XbZ98B3xsoRoeNPvfKX1bGeC+c/VWCrQZgFHL+7ZPfR\nVIzJkGs6hvsoWyOivbEd2RD24w3wuvlu4G2zisGRt4cYlz8/XmVocAE92U6YqeZm\nSfPnxEDYa6nj61O8faK9vM0YbRgJqgmCLhfE3OiiiaW1Xe96+HGeW/QzR+4I+oKj\nEdJlqgy6ZQc4vT1/rlYqINq7ArckFmTvpi08Angyz7AhR39RbZEXO0SiGloSDdTC\nvrjZMOik9HjoqtK6cDxYynVxSmYXLlvZhLxqMzfoOwKBgQD9tUW1FXKj8fzSD/0l\n3uA+W5bo3Yc56pWR8J3HazbaGZlPgnaB+QQKLsvTuU6X7X6QgpngVB+t7LTjfrKX\nlcHUI+0KNcCaQM+OvxxoxgrdgRtT0alqDaeREGJamuKxIYgqEu1Ql25azPUY/bOy\nnEQWSWeIeOXbSAq13JW9bq/eAwKBgQDWV+QR1xngddKgLThi4dQlACMwwriRIi8S\nK7YWtrP+Ez5/hIYF3bhx6m/U4XLWfJf5YnOHEN6AIeJQR4dJv+Ey3vL1TmcQPU2U\nZz12nOdpnHQcIcyAn75VsR7AuaymgfMCrmjn8firWa9Y+tvLjjUxhHzpYRTiSaiI\nd2CbrFI5dwKBgQC7FJ5QR35/kgNByvR6pnxovxTqpd//PxIHyYwu7spFzTaVwLgu\nYzctYxB+EVj5AvGfEg7xslah47gHQPfke1OwYMV8D+L0W/Ixao9CWzbL21YRWrs4\nLtVvTMuZ0Dh1MSq9C7PfB6siXZwmT33gqQY0APDNW4jzR45OSFhKlYItjQKBgAeO\nFYXjdRAKVyA6N9CUcSvUs2jWlDbZY5taWxK14eZEu2E3RJoUVJn/T23LfIa+4YRy\nyeuq1ozhpN57hvM8hi2K2jl3R/60inV+phX2NdntH9KWBmVKPCU9Fv5oDQPZdL1V\ndHEogEFZ6epS/UhRfOJ/7v8y4s+PFReqTYdvLX7FAoGAbpsRFH8tVCOeQOTOpR/L\nf59YQvG15tWcYYejAp8jBxknK3zbXMj6IODIrvfQ2urG2KbR6q/SqISlElRWkEWL\nFeGf0ifnw04bUjoX98+ZqwSfFo8JTj9fBq/TanyU0PF3iGgXFCgb565wG0WBvjCe\nxUf95JtpSqXrRqGmfPimXn8=\n-----END PRIVATE KEY-----
```

**Notice:** 
- It's all on ONE line
- `\n` appears as literal text (backslash + n), not as actual line breaks
- Copy the entire line including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

---

## Deployment Instructions

### For Vercel:

1. Open your project on Vercel
2. Go to **Settings** → **Environment Variables**
3. Add each of the 3 variables above
4. Make sure to add them for all environments (Production, Preview, Development)
5. Click **Save**
6. Go to **Deployments** and click **Redeploy** on your latest deployment

### For Netlify:

1. Open your site on Netlify
2. Go to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add each of the 3 variables above
5. Click **Save**
6. Go to **Deploys** and click **Trigger deploy** → **Deploy site**

---

## Verification

After redeploying, your Firebase Admin SDK should work correctly. If you still see the "Invalid PEM formatted message" error:

1. Double-check that you copied the FIREBASE_PRIVATE_KEY exactly as shown (with `\n` as text)
2. Make sure there are no extra spaces or line breaks
3. Verify all 3 environment variables are set
4. Redeploy again after making changes

---

## How It Works

The code in `src/firebase/admin.ts` automatically handles the conversion:
- When it sees `\n` as text in the environment variable, it converts them to actual newlines
- This ensures the private key is in the correct PEM format that Firebase expects

This approach works on all deployment platforms (Replit, Vercel, Netlify, etc.).
