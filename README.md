# 🔗 LinkedIn Post Tracker

A full-stack MERN application that allows users to track LinkedIn profiles and view their latest posts in a centralized feed. Built with MongoDB, Express.js, React, and Node.js, integrated with Apify's LinkedIn Post Scraper.

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## ✨ Features

-  **User Authentication** - Secure JWT-based registration and login
-  **Profile Tracking** - Add and manage LinkedIn profiles to track
-  **Auto Post Fetching** - Fetch latest posts via Apify's LinkedIn Post Scraper
-  **Post Feed** - View all posts from tracked profiles in one place
-  **Profile Filtering** - Filter posts by specific profiles with URL persistence
-  **Post Caching** - MongoDB caching to reduce API calls
-  **Time-based Filtering** - View posts from the last 24 hours (customizable)
-  **Engagement Metrics** - See likes, comments, and shares for each post
-  **Responsive Design** - Works seamlessly on desktop and mobile

## 🏗️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client for Apify API

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Styling

### External Services
- **Apify** - LinkedIn post scraping service

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Local Installation](https://www.mongodb.com/try/download/community) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Apify Account** - [Sign up](https://apify.com/) and get API token from [Console](https://console.apify.com/account/integrations)

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone [https://github.com/pamusanzika/linkedin-post-tracker]
cd linkedin-post-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/linkedin-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this
APIFY_TOKEN=your-apify-api-token
APIFY_LINKEDIN_POST_SCRAPER_ACTOR_ID=apify/linkedin-post-scraper
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas:**
- Create a free cluster
- Update `MONGODB_URI` in backend `.env` with your connection string

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Usage

### 1. Register/Login
- Create a new account or login with existing credentials
- Passwords are securely hashed with bcrypt

### 2. Add LinkedIn Profiles
- Enter LinkedIn profile URLs (e.g., `https://www.linkedin.com/in/username`)
- Add optional labels for easy identification
- Supports both personal profiles and company pages

### 3. Fetch Posts
- Click "Refresh Posts" to scrape latest posts via Apify
- Posts are cached in MongoDB for performance
- Wait 10-60 seconds for Apify to complete scraping

### 4. Filter by Profile
- Click any profile card to filter posts
- View posts from specific profiles only
- URL updates for shareable/bookmarkable filters
- Click "Show All Posts" to reset filter

### 5. View Post Details
- See post text, images, and engagement metrics
- Click "Open on LinkedIn" to view original post
- Posts auto-refresh when new data is fetched

## 🗂️ Project Structure

```
linkedin-post-tracker/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth & error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Apify integration
│   ├── .env.example     # Environment variables template
│   └── server.js        # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context
│   │   ├── pages/       # Page components
│   │   ├── utils/       # API helpers
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── .env.example     # Environment variables template
│   └── vite.config.js   # Vite configuration
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
```

### Profiles (Protected)
```
GET    /api/profiles         - Get all tracked profiles
POST   /api/profiles         - Add new profile
DELETE /api/profiles/:id     - Delete profile
```

### Posts (Protected)
```
POST   /api/posts/refresh    - Fetch posts from Apify
GET    /api/posts/latest     - Get cached posts (query: ?hours=24)
```

## 🗄️ Database Schema

### User
```javascript
{
  email: String,
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date
}
```

### TrackedProfile
```javascript
{
  userId: ObjectId,
  profileUrl: String,
  label: String,
  createdAt: Date,
  updatedAt: Date
}
```

### PostCache
```javascript
{
  userId: ObjectId,
  profileUrl: String,
  urn: String,
  postUrl: String,
  text: String,
  authorFullName: String,
  authorTitle: String,
  image: String,
  images: [String],
  postedAtISO: String,
  postedAtTimestamp: Number,
  numLikes: Number,
  numComments: Number,
  numShares: Number,
  raw: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ Environment variables for sensitive data
- ✅ CORS configuration
- ✅ Input validation
- ✅ MongoDB injection prevention

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB service
mongod
```

### Apify Rate Limiting
- Free tier has usage limits
- Wait between refresh requests
- Consider upgrading Apify plan for heavy usage

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=5001
```

### CORS Errors
- Ensure backend is running
- Check VITE_API_URL in frontend/.env
- Verify CORS is enabled in backend

## 🚀 Deployment

### Backend (Heroku, Railway, Render)
1. Set environment variables
2. Use production MongoDB (MongoDB Atlas)
3. Update CORS origins for production frontend URL

### Frontend (Vercel, Netlify)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Set VITE_API_URL to production backend URL

### Environment Variables for Production
- Use strong JWT_SECRET (32+ characters)
- Use MongoDB Atlas connection string
- Keep Apify token secure
- Enable HTTPS


## 👤 Author

**Pamuda Sansika**
- GitHub: [@Pamusanzika][(https://github.com/pamusanzika)]
- Email: Pamuda.info@gmail.com

## 🙏 Acknowledgments

- [Apify](https://apify.com/) for LinkedIn Post Scraper API
- [MongoDB](https://www.mongodb.com/) for database
- [React](https://react.dev/) for frontend framework
- [Express.js](https://expressjs.com/) for backend framework

## 📚 Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev/)
- [Apify Documentation](https://docs.apify.com/)
- [JWT Best Practices](https://jwt.io/introduction)

## 📈 Roadmap

- [ ] Multi-profile selection filtering
- [ ] Advanced search and keyword filtering
- [ ] Export posts to CSV/PDF
- [ ] Email notifications for new posts
- [ ] Dark mode
- [ ] Post analytics dashboard
- [ ] Scheduled auto-refresh
- [ ] Mobile app (React Native)

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ using MERN Stack**
