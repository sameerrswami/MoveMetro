# Deployment Guide for MoveMetro

Follow these steps to deploy your application to the cloud.

## 1. Prepare for Production

### Database
Currently, the app uses **SQLite** (`database.sqlite`). Most cloud platforms (like Vercel or Render) use an ephemeral filesystem, meaning your database will be **deleted** every time the server restarts.
**Recommendation**: Use a hosted PostgreSQL database (e.g., [Supabase](https://supabase.com/) or [Neon](https://neon.tech/)).

### Environment Variables
You will need to set these in your hosting provider's dashboard:
- `NODE_ENV=production`
- `DATABASE_URL=Your_Postgres_Connection_String`
- `JWT_SECRET=Some_Random_Secure_String`
- `DB_DIALECT=postgres`

---

## 2. Push to GitHub
If you haven't already, push your code to a new GitHub repository:
```bash
git init
git add .
git commit -m "Initial commit for MoveMetro"
git branch -M main
git remote add origin https://github.com/yourusername/move-metro.git
git push -u origin main
```

---

## 3. Deploy Backend (Render.com - Recommended)
Render is great for Express apps and handles persistent services well.
1. Create a new **Web Service** on Render.
2. Link your GitHub repository.
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Add your Environment Variables (from your `.env`).

---

## 4. Deploy Frontend (Vercel)
Vercel is the best platform for React projects.
1. Import your repository in [Vercel](https://vercel.com/).
2. **Framework Preset**: Create React App
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `build`
6. **Environment Variables**:
   - `REACT_APP_API_URL=https://your-backend-url.onrender.com/api`

---

## 5. Connecting Frontend to Backend
1. Once your Backend is deployed on Render, copy its URL.
2. Update the `REACT_APP_API_URL` in your Vercel project settings.
3. Update `CORS_ORIGIN` in your Backend settings to allow your Vercel URL.
