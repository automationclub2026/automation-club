Automation Club Firebase Member Portal

Files:
- index.html, projects.html, chapters.html, join.html
- register.html, login.html
- dashboard.html, admin.html
- style.css, app.js, firebase-config.js

Firebase setup:
1. Go to https://console.firebase.google.com/
2. Create project.
3. Add Web App.
4. Copy Firebase config.
5. Open firebase-config.js and paste your config.
6. Authentication > Sign-in method > Enable Email/Password.
7. Firestore Database > Create database.
8. Upload all files to GitHub Pages.

Firestore collections used:
- members
- announcements
- projects

Basic security rules example:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /members/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /announcements/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /projects/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}

Note:
Admin role protection is a starter. For official use, improve rules with admin role checks.
