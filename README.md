<<<<<<< HEAD
# Campus Companion 🎓
### One Platform for Every Student Need.

Campus Companion is a robust full-stack web application designed to support at least 1000+ students in a college. It integrates academic resource sharing, corporate placement listings, central college event calendars, high-precision attendance safety trackers, and an AI-powered scholastic doubts solver powered securely by Google Gen AI APIs.

---

## 🎨 Creative & Aesthetic Features
- **Dynamic Cosmic slate Theme:** Supports full-device dark mode toggling, beautifully persisting theme choices under browser local configurations.
- **Micro-interactions & Bento Grid Layout:** Features sleek visual layouts, loading progress bars, circular gauge indicators, and smooth card scale effects.
- **Autonomous Database seeding:** On first initialization, the platform automatically populates sample placement opportunities (such as Microsoft and Google roles) and verified notes if directories are cleared.

---

## 🚀 Step-by-Step Local Setup Instructions

### Prerequisites
- **Node.js** v18 or newer
- **npm** or **yarn**

### 1. Close and Run Installation
Ensure you install all client packages and backend runners:
```bash
npm install
```

### 2. Configure Local Secrets
Construct a `.env` file in your root workspace:
```env
# Google Gen AI SDK authentication key
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# App deployment host locator
APP_URL="http://localhost:3000"
```

### 3. Launch Development Server
Boot up the Express API router combined with Vite's asset compiling middleware:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser to check the student logs!

---

## ☁️ Deployment Instructions

### 1. Build Compilation
Compile the frontend bundle inside `/dist/` and pack the Node backend:
```bash
npm run build
```

### 2. Deploying on Vercel (Full-Stack Support)
To host on Vercel with serverless API route compatibility, define a `vercel.json` file pointing your API endpoints:
```json
{
  "version": 2,
  "builds": [
    { "src": "server.ts", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server.ts" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```
Run the Vercel deployment tool:
```bash
vercel --prod
```

### 3. Deploying on Firebase Hosting & Cloud Run
Firebase Hosting is ideal for the static frontend assets, combined with Cloud Run (or Cloud Functions) for the Express backend endpoints:
1. Initialize Firebase:
   ```bash
   firebase init
   ```
2. Choose **Hosting** and select modern frameworks or the `/dist` output directory.
3. Choose **Firestore** to deploy active security credentials (`firestore.rules`).
4. To integrate with Cloud Functions/Run, rewrite API calls inside `firebase.json`:
   ```json
   "hosting": {
     "public": "dist",
     "rewrites": [
       {
         "source": "/api/**",
         "function": "app"
       }
     ]
   }
   ```
5. Build and Deploy:
   ```bash
   npm run build
   firebase deploy
   ```

---

## 🛡️ Firestore Secure Rules (`firestore.rules`)
To prevent unauthorized access, secure your database partitions using standard student validators:
- Users profile editing: All students can create Profiles.
- Study planner / Bookmarks: Authorized to user owners only.
- Notes / Placements / Events: Open globally for reads, requires student logs for contributions.
=======
# BVRITH-campus-companion
>>>>>>> 032d0189a41a50ea5214e9773f52d6b4faf21784
