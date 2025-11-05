# 🚀 Vibee OS Setup Instructions

Complete setup guide for running Vibee OS with all advanced features enabled, including local development and production deployment on platforms like Vercel or Netlify.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase project created
- Google Cloud project with Gemini API access
- Git installed

---

## 🔑 Required Environment Variables

For the application to run, you need to create a `.env.local` file in the root directory. This file is **for local development only** and should **never** be committed to GitHub.

### 1. Create the `.env.local` File

Copy the following block into a new file named `.env.local`:

```env
# ----------------------------------------------------
# FIREBASE CLIENT CONFIG (PUBLIC)
# ----------------------------------------------------
# Found in: Firebase Console > Project Settings > General > Your apps > Web app
# Click the config icon (</>) to get these values.
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-firebase-project-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-firebase-app-id"
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your-measurement-id"

# ----------------------------------------------------
# FIREBASE ADMIN SDK (PRIVATE - SERVER-SIDE ONLY)
# ----------------------------------------------------
# Found in: Firebase Console > Project Settings > Service Accounts
# Click "Generate new private key" to get a JSON file.
#
# IMPORTANT: The private key must be Base64 encoded for deployment.
# See "Deployment Instructions" below for how to do this.
# For local development, you can use the raw key, but Base64 is safer.
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="YOUR_BASE64_ENCODED_PRIVATE_KEY"

# ----------------------------------------------------
# GOOGLE GENERATIVE AI (GEMINI)
# ----------------------------------------------------
# Found in: Google AI Studio > "Get API Key"
GOOGLE_GENAI_API_KEY="your-gemini-api-key"
```

### 2. Fill in the Values for Local Development

- Replace all the `"your-..."` placeholders with your actual keys from Firebase and Google AI Studio.
- For `FIREBASE_PRIVATE_KEY` locally, you can choose to Base64 encode it or just use the raw string with `\n` characters. Base64 is recommended to match the production setup.

---

## 🚀 Production Deployment (Vercel/Netlify)

For your live website to connect to Firebase, you **must** add your environment variables to your hosting provider's dashboard.

### Step 1: Base64 Encode Your Private Key

The `FIREBASE_PRIVATE_KEY` is a multi-line string. To ensure it's read correctly by the server, you **must** encode it into a single line of text using Base64.

**On macOS / Linux:**

1.  Open your downloaded Firebase service account JSON file.
2.  Copy the entire private key, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines.
3.  Open your terminal and run the following command, pasting your key inside the single quotes:
    ```bash
    echo 'PASTE_YOUR_ENTIRE_PRIVATE_KEY_HERE' | base64
    ```
4.  The command will output a long, single-line string. This is your Base64 encoded key. Copy it.

**On Windows:**

1.  Open your downloaded Firebase service account JSON file and copy the entire private key.
2.  Open PowerShell and run the following command, pasting your key inside the single quotes:
    ```powershell
    [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes('PASTE_YOUR_ENTIRE_PRIVATE_KEY_HERE'))
    ```
3.  This will output your Base64 encoded key. Copy it.

### Step 2: Add Environment Variables to Your Hosting Provider

1.  Go to your project dashboard on Vercel or Netlify.
2.  Navigate to the environment variables settings:
    - **Vercel**: Project > Settings > Environment Variables
    - **Netlify**: Site settings > Build & deploy > Environment > Environment variables
3.  Add each variable from your `.env.local` file one by one.
    - **Key**: e.g., `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    - **Value**: The corresponding value.
4.  For the `FIREBASE_PRIVATE_KEY`, paste the **Base64 encoded string** you generated in the previous step.

**This is the most critical step.** Your deployed site will not work without these variables.

---

## 📦 Installation & Running Locally

1.  **Clone & Install Dependencies:**
    ```bash
    git clone <your-repo-url>
    cd vibee-os
    npm install
    ```
2.  **Configure Environment:**
    - Create the `.env.local` file as described above and fill in your keys.
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The app will start on http://localhost:5000.

---

## 🚨 Troubleshooting

### "Firebase Admin SDK failed to initialize" in Production

This error almost always means there is a problem with your environment variables on Vercel/Netlify.

1.  **Check `FIREBASE_PRIVATE_KEY`:**
    - Did you Base64 encode it? It **must** be encoded.
    - Did you copy the entire encoded string?
2.  **Check `FIREBASE_CLIENT_EMAIL` and `NEXT_PUBLIC_FIREBASE_PROJECT_ID`:**
    - Are they correct?
    - Are there any extra spaces or characters?
3.  **Redeploy:** After adding or changing environment variables in your provider's dashboard, you often need to redeploy your project for the changes to take effect.

By following these instructions carefully, especially the Base64 encoding and setting variables in your deployment environment, you will resolve the connection issues.
