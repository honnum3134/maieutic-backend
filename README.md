# Maieutic Edutech — Backend API

## Folder Structure
```
maieutic-backend/
├── server.js                  ← main entry point
├── package.json
├── .env                       ← your secret keys (edit this)
├── models/
│   ├── Contact.js             ← contact form schema
│   ├── Enquiry.js             ← enquiry form schema
│   └── Application.js        ← job application schema
├── routes/
│   ├── contactRoutes.js       ← POST /api/contact
│   ├── enquiryRoutes.js       ← POST /api/enquiry
│   └── applicationRoutes.js  ← POST /api/application
├── middleware/
│   ├── upload.js              ← multer resume upload handler
│   └── mailer.js              ← nodemailer email sender
└── uploads/                   ← resume files saved here
```

---

## STEP 1 — Install Node.js
Download from https://nodejs.org (LTS version)

---

## STEP 2 — Install dependencies
Open terminal inside this folder and run:
```bash
npm install
```

---

## STEP 3 — Setup MongoDB Atlas (free)
1. Go to https://www.mongodb.com/atlas and sign up
2. Create a FREE cluster (M0)
3. Under "Database Access" → Add a new user (username + password)
4. Under "Network Access" → Add IP: 0.0.0.0/0 (allow all)
5. Under "Databases" → Connect → "Connect your application"
6. Copy the connection string — looks like:
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/maieuticDB

---

## STEP 4 — Setup Gmail App Password
1. Go to your Gmail → Google Account → Security
2. Enable 2-Step Verification
3. Search for "App Passwords" → Create one for "Mail"
4. Copy the 16-character password

---

## STEP 5 — Fill in your .env file
Open the .env file and replace the values:
```
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/maieuticDB
RESEND_API_KEY=re_xxxxxxxx           ← from https://resend.com/api-keys (required, server exits without it)
HR_EMAIL=hr@maieuticedutech.com
FRONTEND_URL=https://maieuticedutech.com,https://www.maieuticedutech.com
```

---

## STEP 6 — Run the backend
```bash
npm run dev
```
You should see:
✅ MongoDB connected
✅ Server running on http://localhost:5000

---

## STEP 7 — Update your frontend forms

### ContactPage.jsx — handleSubmit
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (data.success) {
      toast({ title: 'Message Sent!', description: "We'll get back to you soon." });
      setFormData({ name: '', email: '', subject: '', message: '' });
    }
  } catch (err) {
    toast({ title: 'Error', description: 'Something went wrong.' });
  }
};
```

### EnquireNow.jsx — handleSubmit
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('http://localhost:5000/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) {
      toast({ title: 'Enquiry Submitted!', description: 'We will contact you within 24 hours.' });
      setIsOpen(false);
    }
  } catch (err) {
    toast({ title: 'Error', description: 'Something went wrong.' });
  }
};
```

### CareersPage.jsx — handleSubmit (Apply Now with resume)
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  const formDataObj = new FormData();
  formDataObj.append('fullName',    form.fullName);
  formDataObj.append('email',       form.email);
  formDataObj.append('phone',       form.phone);
  formDataObj.append('role',        form.role);
  formDataObj.append('experience',  form.experience);
  formDataObj.append('linkedin',    form.linkedin);
  formDataObj.append('coverLetter', form.coverLetter);
  formDataObj.append('resume',      form.resume);  // File object

  try {
    const res = await fetch('http://localhost:5000/api/application', {
      method: 'POST',
      body: formDataObj,  // NO Content-Type header — browser sets it automatically for FormData
    });
    const data = await res.json();
    if (data.success) {
      toast({ title: 'Application Submitted!', description: 'Our HR team will contact you in 3-5 days.' });
      onClose();
    }
  } catch (err) {
    toast({ title: 'Error', description: 'Something went wrong.' });
  }
};
```

---

## API Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/contact | Submit contact form |
| GET  | /api/contact | Get all contact submissions |
| POST | /api/enquiry | Submit enquiry form |
| GET  | /api/enquiry | Get all enquiries |
| POST | /api/application | Submit job application + resume |
| GET  | /api/application | Get all applications |

---

## Deployment on Railway
1. Go to https://railway.app and sign in.
2. New Project → Deploy from GitHub repo → pick the backend repo.
3. Service → Variables: add MONGO_URI, RESEND_API_KEY, HR_EMAIL and FRONTEND_URL
   (comma-separated list of allowed site origins). PORT is injected by Railway.
4. Service → Settings → Networking → Generate Domain. Copy the public URL
   (e.g. https://backend-production-xxxx.up.railway.app).
5. Confirm it is alive: open <that URL>/health — it must return
   {"status":"ok","service":"maieutic-backend","db":"connected"}.
6. Put that URL in the frontend as VITE_API_BASE_URL (frontend/.env.example)
   or as the default in frontend/src/lib/api.js, rebuild and redeploy the frontend.

If the Railway domain ever changes, only step 6 needs repeating — the frontend
reads the backend URL from one place.
