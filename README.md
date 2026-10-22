# Crop Doctor 🌾

Crop Doctor is an intelligent agricultural assistant designed to help farmers and gardeners diagnose crop diseases, monitor weather conditions, and access agronomic guidance.

---

## 👥 Role-Based Access Control (RBAC)

The platform supports two distinct user roles:

| Feature / Permission | Normal User (`user`) | Platform Administrator (`admin`) |
| :--- | :---: | :---: |
| **Target Audience** | Farmers, Gardeners, Agricultural Public | System Managers, Agronomic Supervisors |
| **Default Assignment** | ✅ **Default for all new accounts / logins** | ⚙️ Set via MongoDB or Admin Panel |
| **AI Plant Health Scanner** | ✅ Full Access | ✅ Full Access |
| **Crops & Diseases Guide** | ✅ Full Access | ✅ Full Access |
| **Live Agricultural Weather** | ✅ Full Access | ✅ Full Access |
| **Farm Care Shop** | ✅ Full Access | ✅ Full Access |
| **Agronomist Consultation** | ✅ Submit & View Personal Queries | ✅ Reply, Resolve & Manage All Queries |
| **Personal Farmer Dashboard** | ✅ Personal History & Scans | ✅ Personal History + Quick Admin Switcher |
| **Admin Portal (`/admin`)** | ❌ Blocked (`403 Forbidden` / Access Denied) | ✅ Full Management Access |
| **User & Role Management** | ❌ Unauthorized | ✅ Search, Promote, Demote & Delete Users |
| **Crop Catalog Management** | ❌ Read Only | ✅ Add, Edit & Delete Catalog Crops |
| **Platform-wide Scan Records** | ❌ Only Own Records | ✅ View All Platform Scans & Delete Invalid Records |

---

## 🔄 Dynamic Role Management (Zero Hardcoded Emails)

There are **zero hardcoded emails** in the code or environment:

1. **Default Role (`user`):**
   - Whenever any user registers or signs in (via Google or Email & Password), their role is assigned as `"user"` by default.
   - Normal users enjoy the entire farmer experience: leaf disease diagnosis, care remedies, crops guide, weather alerts, and personal dashboard.

2. **Upgrading to Administrator (`admin`) via MongoDB:**
   - Any user can be designated as an Administrator directly in the database:
   ```javascript
   // In MongoDB Shell / Compass:
   db.users.updateOne(
     { email: "your_user@example.com" },
     { $set: { role: "admin" } }
   );
   ```
   - The moment their document is updated, the user has full administrative privileges on their next session!

3. **Managing Roles from the Admin Panel:**
   - Authenticated Administrators can open the **Admin Portal (`/admin`) > Users Tab**.
   - Admins can search users, filter by role (`All Users`, `Normal Users`, `Admins`), and click **"Make Admin 🛡️"** or **"Demote to User 👤"** to promote or demote any account instantly.

---

## 🔬 AI Plant Health Scanner

The AI Vision diagnostic engine uses Google Gemini Multimodal Vision (`gemini-3.5-flash-lite` / `gemini-3.8-flash`):

- **High-Accuracy Leaf Pathology:** Detects plant species (e.g. Mango, Tomato, Wheat, Rice, Cotton, Chilli, Potato), diagnoses pathology (fungal, bacterial, viral, nutrient deficiency), calculates confidence scores, and determines severity ratings.
- **Actionable Treatment Protocol:** Delivers observed symptoms, immediate urgent precautions, specific fungicide/pesticide dosage instructions (chemical & organic), and long-term prevention guidelines.
- **Fail-Safe Agricultural Fallback:** If API quotas or network delays occur, the built-in plant pathology inference engine seamlessly provides full diagnostic remedies so users never experience failed scans.

---

## Project Structure

```
Crop-Doctor/
├── backend/          # Node.js / Express backend server
│   ├── server.js     # API endpoints, RBAC middleware, and AI inference integration
│   ├── package.json  # Backend dependencies and scripts
│   └── .env          # Server environment configurations
├── frontend/         # React + Vite frontend client
│   ├── public/       # Static assets
│   ├── src/          # React components, pages, context, and api client
│   │   ├── components/ # Navbar, Footer
│   │   ├── context/    # AuthContext (RBAC state & helpers)
│   │   ├── pages/      # Scanner, Admin, Dashboard, Login, Crops, etc.
│   │   └── api.js      # Central API fetch client
│   ├── index.html    # Vite entry HTML
│   ├── vite.config.js# Vite configuration
│   └── package.json  # Frontend dependencies and scripts
└── README.md
```

---

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend server runs on `http://localhost:5000` by default.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend application runs on `http://localhost:5173` by default.
