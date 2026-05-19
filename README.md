# AlumniNexus

AlumniNexus is a small alumni-student networking platform (React frontend + Express/MongoDB backend).

## Features
- Role-based auth (Admin / Alumni / Student)
- Mentorship requests, sessions, opportunities, blog posts
- Admin verification flow for alumni profiles

## Prerequisites
- Node.js (>=16)
- MongoDB running locally or accessible via URI

## Setup

1. Backend

```bash
cd server
npm install
# create a .env file with the following vars:
# MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN (e.g. 7d), PORT (optional), CLIENT_URL (e.g. http://localhost:5173)
npm run dev
```

2. Client

```bash
cd client
npm install
npm run dev
```

The client expects the API base URL in `VITE_API_URL` (optional). By default the client talks to `http://localhost:5000/api`.

## Admin account (quick)
If you need to create or reset an admin password from the server environment, run (replace `NEW_PASSWORD` and `admin@alumninexus.com` as needed):

```bash
cd server
node -e "const bcrypt=require('bcryptjs'); const mongoose=require('mongoose'); const User=require('./src/models/User'); mongoose.connect(process.env.MONGO_URI||'mongodb://localhost:27017/alumni-platform').then(async ()=>{ const h=await bcrypt.hash('NEW_PASSWORD',10); await User.updateOne({email:'admin@alumninexus.com'},{$set:{password:h,role:'ADMIN',isVerified:true}},{upsert:true}); console.log('admin password set'); process.exit() }).catch(err=>{ console.error(err); process.exit(1) });"
```

## Environment variables
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret for signing JWTs
- `JWT_EXPIRES_IN` — token expiry (e.g. `7d`)
- `CLIENT_URL` — client origin for CORS

## Contributing
Feel free to open issues or PRs. Keep changes small and focused.

## License
No license (add one if you plan to publish this repository).
