# ITECA'27 — Symposium Registration Website

A mobile-first, glassmorphism-styled registration website for the ITECA'27 inter-college symposium.

**Tech Stack:** HTML + CSS + JavaScript + Firebase Firestore + PHPMailer (Gmail SMTP)

---

## 📁 File Structure

```
ITECA'27/
├── index.html          → Main registration page
├── style.css           → All styles (glassmorphism, dark mode, responsive)
├── app.js              → Frontend logic (form, validation, QR, countdown)
├── firebase.js         → Firebase initialization + Firestore helpers
├── admin.html          → Admin dashboard page
├── admin.js            → Admin logic (table, filter, delete, Excel export)
├── backend/
│   ├── sendmail.php    → PHPMailer SMTP email sender
│   ├── composer.json   → Composer dependency (PHPMailer)
│   └── vendor/         → (created by composer install)
└── README.md           → This file
```

---

## 🚀 Complete Setup Guide

### Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add Project** → Name it `ITECA27` → Continue
3. Disable Google Analytics (optional for this project) → Create Project
4. Once created, click **Continue**

---

### Step 2: Enable Firestore Database

1. In Firebase Console, go to **Build → Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select your preferred region → Click **Enable**

---

### Step 3: Get Firebase Config

1. In Firebase Console, click the **⚙️ gear icon** → **Project Settings**
2. Scroll down to **Your Apps** section
3. Click the **Web** icon (</>) to add a web app
4. Register app name: `ITECA27 Web`
5. **Don't** enable Firebase Hosting (we use GitHub Pages)
6. Click **Register App**
7. Copy the `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "iteca27.firebaseapp.com",
  projectId: "iteca27",
  storageBucket: "iteca27.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

8. Open `firebase.js` and replace the placeholder config with your values

---

### Step 4: Firestore Security Rules

1. In Firebase Console → **Firestore Database → Rules**
2. For development/college event, use these open rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /registrations/{document} {
      allow read, write: true;
    }
  }
}
```

3. Click **Publish**

> ⚠️ For production with better security:
> ```
> rules_version = '2';
> service cloud.firestore {
>   match /databases/{database}/documents {
>     match /registrations/{document} {
>       allow read: if true;
>       allow create: if request.resource.data.keys().hasAll(['competition', 'rollNumber', 'name', 'email']);
>       allow delete: if true;
>     }
>   }
> }
> ```

---

### Step 5: Gmail App Password Setup

1. Log into [Gmail](https://mail.google.com) with your sender account (e.g., `iteca27@gmail.com`)
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Enable **2-Step Verification** (required for App Passwords)
4. After enabling 2FA, go to [App Passwords](https://myaccount.google.com/apppasswords)
5. Select app: **Mail**, Select device: **Other** → type `ITECA27`
6. Click **Generate**
7. Copy the **16-character password** (looks like: `abcd efgh ijkl mnop`)
8. Open `backend/sendmail.php` and replace:
   ```php
   define('SMTP_EMAIL', 'iteca27@gmail.com');           // ← Your Gmail
   define('SMTP_APP_PASSWORD', 'abcdefghijklmnop');     // ← No spaces
   ```

---

### Step 6: PHPMailer Setup

1. Install [Composer](https://getcomposer.org/download/) (if not installed)
2. Open terminal in the `backend/` folder
3. Run:
   ```bash
   cd backend
   composer install
   ```
4. This creates the `vendor/` folder with PHPMailer

**Alternative (without Composer):**
1. Download PHPMailer from [GitHub](https://github.com/PHPMailer/PHPMailer/releases)
2. Extract and place in `backend/vendor/`
3. Replace `require 'vendor/autoload.php';` in `sendmail.php` with:
   ```php
   require 'vendor/PHPMailer/src/Exception.php';
   require 'vendor/PHPMailer/src/PHPMailer.php';
   require 'vendor/PHPMailer/src/SMTP.php';
   ```

---

### Step 7: XAMPP Local Testing

1. Start **Apache** in XAMPP Control Panel
2. Your files are already in `C:\xampp\htdocs\xampp\ITECA'27\`
3. Open browser and go to:
   - Frontend: `http://localhost/xampp/ITECA'27/`
   - Test email API: `http://localhost/xampp/ITECA'27/backend/sendmail.php`
4. Make sure the `PHP_BACKEND_URL` in `app.js` points to the correct local URL:
   ```javascript
   const PHP_BACKEND_URL = 'http://localhost/xampp/ITECA%2727/backend/sendmail.php';
   ```

---

### Step 8: GitHub Pages Deployment (Frontend)

1. Create a GitHub repository (e.g., `iteca27`)
2. Upload these files ONLY:
   - `index.html`
   - `style.css`
   - `app.js`
   - `firebase.js`
   - `admin.html`
   - `admin.js`
3. Do **NOT** upload the `backend/` folder
4. Go to **Settings → Pages**
5. Under **Source**, select `main` branch and `/ (root)`
6. Click **Save**
7. Your site will be live at: `https://yourusername.github.io/iteca27/`
8. **Important:** Update `PHP_BACKEND_URL` in `app.js` to your live PHP backend URL

---

### Step 9: InfinityFree Deployment (PHP Backend)

1. Sign up at [InfinityFree](https://www.infinityfree.com/)
2. Create a new account/hosting
3. Use File Manager or FTP to upload:
   - `backend/sendmail.php`
   - `backend/vendor/` (entire folder)
4. Your PHP endpoint will be: `https://your-subdomain.infinityfreeapp.com/sendmail.php`
5. Update `PHP_BACKEND_URL` in `app.js` with this URL
6. Update CORS in `sendmail.php`:
   ```php
   header("Access-Control-Allow-Origin: https://yourusername.github.io");
   ```

**Alternative: 000webhost**
1. Sign up at [000webhost](https://www.000webhost.com/)
2. Create a new site
3. Upload `sendmail.php` and `vendor/` folder via File Manager
4. Your URL: `https://your-site.000webhostapp.com/sendmail.php`

---

## 🔐 Admin Panel

- **URL:** `admin.html` (or click Admin button on main page)
- **Username:** `ITECA'27`
- **Password:** `iteca*27`

**Features:**
- View all registrations (from Firebase)
- Filter by competition
- Search by name/roll number
- Download as Excel (.xlsx)
- Delete individual registrations
- Live registration count

---

## 🏆 Competitions

| # | Competition | Team Size |
|---|-------------|-----------|
| 1 | Debugging | Solo |
| 2 | Blind Coding | Solo |
| 3 | Program Development | Solo |
| 4 | Web Design | Solo |
| 5 | Poster Making | Solo |
| 6 | PPT Presentation | Exactly 2 |
| 7 | Software Marketing | 2 to 4 |

---

## ✨ Features

- ✅ Mobile-first responsive design
- ✅ Glassmorphism UI with animations
- ✅ Dark/Light mode toggle (persisted)
- ✅ Countdown timer to event
- ✅ Registration closed timer
- ✅ Dynamic team member fields
- ✅ Auto-uppercase for roll numbers and names
- ✅ Auto-generated student email from roll number
- ✅ Duplicate registration prevention (via Firestore)
- ✅ Toast notifications
- ✅ QR code auto-generation
- ✅ Admin dashboard with stats
- ✅ Excel export
- ✅ Delete registrations
- ✅ Loading animations
- ✅ HTML confirmation emails via Gmail SMTP

---

## 📧 Email System

- Emails are auto-generated from roll numbers: `23SUCA027` → `23suca027@vhnsnc.edu.in`
- Sent via **Gmail SMTP** using PHPMailer with App Password
- Beautiful HTML email template with gradient header
- From: `iteca27@gmail.com`
- Subject: `ITECA'27 Registration Successful`

---

## 🔧 SMTP Troubleshooting

| Issue | Solution |
|-------|----------|
| `Authentication failed` | Check Gmail address and App Password in `sendmail.php` |
| `SMTP connect() failed` | Enable "Less secure apps" or regenerate App Password |
| `2-Step Verification not enabled` | You MUST enable 2FA before creating App Passwords |
| `CORS error in browser` | Check `Access-Control-Allow-Origin` header in `sendmail.php` |
| `Class 'PHPMailer' not found` | Run `composer install` in the `backend/` folder |
| `500 Internal Server Error` | Check PHP error logs; likely a syntax error or missing vendor |
| Email goes to spam | Add SPF/DKIM records (advanced); for college use, this is normal |

---

## ⚙️ Configuration Checklist

Before going live, make sure you've updated:

- [ ] `firebase.js` → Replace `firebaseConfig` with your Firebase project config
- [ ] `app.js` → Replace `PHP_BACKEND_URL` with your live PHP backend URL
- [ ] `backend/sendmail.php` → Replace `SMTP_EMAIL` with your Gmail address
- [ ] `backend/sendmail.php` → Replace `SMTP_APP_PASSWORD` with your App Password
- [ ] `backend/sendmail.php` → Replace CORS `*` with your GitHub Pages URL
- [ ] Firestore rules published
- [ ] `composer install` run in `backend/` folder

---

## ⚠️ Important Notes

1. Gmail has a daily sending limit of **500 emails/day** for regular accounts
2. Firestore free tier allows **50K reads/day** and **20K writes/day** (plenty for a college event)
3. Admin credentials are stored client-side (suitable for a college event)
4. Do NOT upload `backend/` folder or `sendmail.php` to GitHub Pages
5. The `vendor/` folder is created by Composer — do NOT commit it to Git
6. For InfinityFree, PHP version must be 7.4+ (PHPMailer requires it)
