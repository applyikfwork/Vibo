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
- For `FIREBASE_PRIVATE_KEY` locally, you must Base64 encode it to match the production setup. Follow the instructions below.

---

## 🚀 Production Deployment (Vercel/Netlify)

For your live website to connect to Firebase, you **must** add your environment variables to your hosting provider's dashboard.

### Step 1: Base64 Encode Your Private Key

The `FIREBASE_PRIVATE_KEY` from the downloaded JSON file contains newline characters (`\n`) that can cause parsing errors in serverless environments. To prevent this, you **must** encode it into a single-line Base64 string.

**On macOS / Linux:**

1.  Open your downloaded Firebase service account JSON file in a text editor.
2.  Copy the **entire private key value**, starting from `-----BEGIN PRIVATE KEY-----` and ending with `-----END PRIVATE KEY-----\n`.
3.  Open your terminal and run the following command, pasting your key **exactly as copied** inside the single quotes:
    ```bash
    echo 'PASTE_YOUR_ENTIRE_PRIVATE_KEY_HERE' | base64
    ```
4.  The command will output a long, single-line string. This is your Base64 encoded key. Copy it.

**On Windows (PowerShell):**

1.  Open your downloaded Firebase service account JSON file and copy the entire private key value.
2.  Open PowerShell and run the following command, pasting your key inside the single quotes. Make sure the newlines are preserved when you paste.
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
4.  For the `FIREBASE_PRIVATE_KEY` variable, paste the **new Base64 encoded string** you generated in the previous step.

**This is the most critical step.** Your deployed site will not work without these variables set correctly in the hosting provider's dashboard.

### Step 3: Redeploy

After adding or changing environment variables, you **must** redeploy your project for the changes to take effect.

---

## 📦 Installation & Running Locally

1.  **Clone & Install Dependencies:**
    ```bash
    git clone <your-repo-url>
    cd vibee-os
    npm install
    ```
2.  **Configure Environment:**
    - Create the `.env.local` file as described above and fill in your keys. Make sure to use the Base64 encoded key for `FIREBASE_PRIVATE_KEY`.
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The app will start on http://localhost:5000.

---

## 🚨 Troubleshooting

### "Firebase Admin SDK failed to initialize" or "Invalid PEM formatted message"

This error almost always means there is a problem with the `FIREBASE_PRIVATE_KEY` environment variable on Vercel/Netlify.

1.  **Re-encode your key:** Carefully follow the Base64 encoding instructions again. This is the most common point of failure.
2.  **Check `FIREBASE_CLIENT_EMAIL` and `NEXT_PUBLIC_FIREBASE_PROJECT_ID`:** Ensure they are correct and have no extra spaces.
3.  **Redeploy:** After updating environment variables in your provider's dashboard, you **must** redeploy your project.

By following these updated instructions carefully, you will resolve the connection issues.