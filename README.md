# SimpleBlog - Full Stack Blog Application

A modern, full-stack blog application built with Next.js and Node.js featuring a comprehensive admin panel, rich text editing, and content moderation system.

## ✨ Features

### User Features
- 🔐 User authentication (register/login) with JWT
- 👤 User profiles with avatar support and bio functionality
- 📝 Create, edit, and delete blog posts with WYSIWYG editor
- 💬 Comment system with nested replies and report functionality
- ❤️ Like posts and comments
- 🔍 Search functionality across posts
- 📱 Responsive design with Tailwind CSS
- 🏷️ Tagging system for posts
- 📊 User dashboard with personal statistics
- 🚨 Report inappropriate content (blogs/comments) with validation
- 📝 Submit general complaints and feedback
- 👥 Clickable author names to view user profiles
- 🛡️ Self-reporting prevention and login requirements for reporting

### Admin Features
- 🛡️ Comprehensive admin panel with role-based access
- 👥 User management (view, delete, role management)
- 📰 Blog management (view, edit, delete all posts)
- 💬 Comment moderation (view, delete comments)
- 🚨 Enhanced report management with type filtering and content links
- 📊 Dashboard with system statistics
- 🔒 Admin-only routes with middleware protection
- 🔗 Clickable links to reported content for easy moderation

### Technical Features
- 🎨 Rich text editor with React Quill (replaces markdown)
- 🖼️ Avatar upload and display system with bio management
- 📱 Sticky footer layout
- 🔄 Real-time updates and notifications
- 🛡️ Enhanced input validation and sanitization
- 🗄️ MongoDB with Mongoose ODM and virtual field support
- 🔐 Secure password hashing with bcryptjs
- 🚫 Self-reporting prevention and authorization checks

## 🛠️ Tech Stack

### Frontend
- **Next.js 13** - React framework with SSR/SSG
- **React 18** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling
- **React Quill** - WYSIWYG rich text editor
- **React Hot Toast** - Toast notifications
- **date-fns** - Date formatting utilities
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd simple-blog
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment Setup**

Create `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/simpleblog
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

Create `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. **Start MongoDB**
Make sure MongoDB is running on your system:
```bash
# For local MongoDB installation
mongod
```

6. **Run the application**

Start the backend server:
```bash
cd backend
npm start
# Server will run on http://localhost:5000
```

Start the frontend development server:
```bash
cd frontend
npm run dev
# Frontend will run on http://localhost:3000
```

## 👨‍💼 Admin Access

### Creating an Admin User

Since there's no admin seeding script, you need to create an admin user manually:

1. **Register a regular user** through the frontend at `http://localhost:3000/register`

2. **Update user role in MongoDB** using MongoDB Compass, CLI, or any MongoDB client:
```javascript
// Connect to your MongoDB database
use simpleblog

// Update the user role to admin (replace 'your-email@example.com' with actual email)
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

3. **Alternative: Create admin user via MongoDB CLI**
```javascript
// Connect to MongoDB
mongo

// Switch to your database
use simpleblog

// Create admin user directly
db.users.insertOne({
  username: "admin",
  email: "admin@simpleblog.com",
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: "password"
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Admin Login Credentials
After creating the admin user:
- **Email**: `admin@simpleblog.com`
- **Password**: `password`

### Accessing Admin Panel
1. Login with admin credentials at `http://localhost:3000/login`
2. Access admin panel at `http://localhost:3000/admin/dashboard`
3. Navigate through different admin sections:
   - **Dashboard**: `http://localhost:3000/admin/dashboard`
   - **Users**: `http://localhost:3000/admin/users`
   - **Blogs**: `http://localhost:3000/admin/blogs`
   - **Comments**: `http://localhost:3000/admin/comments`
   - **Reports**: `http://localhost:3000/admin/reports`

## 📁 Project Structure

```
simple-blog/
├── backend/
│   ├── controllers/          # Route controllers
│   │   ├── authController.js
│   │   ├── blogController.js
│   │   ├── commentController.js
│   │   ├── reportController.js
│   │   └── adminController.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js
│   │   └── adminAuth.js
│   ├── models/              # Mongoose models
│   │   ├── User.js
│   │   ├── Blog.js
│   │   ├── Comment.js
│   │   └── Report.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── blogs.js
│   │   ├── comments.js
│   │   ├── reports.js
│   │   └── admin.js
│   ├── uploads/             # File uploads directory
│   ├── .env                 # Environment variables
│   ├── server.js            # Express server setup
│   └── package.json
├── frontend/
│   ├── components/          # Reusable components
│   │   ├── Layout.js
│   │   ├── RichTextEditor.js
│   │   ├── ReportModal.js
│   │   ├── UserProfileModal.js
│   │   └── CommentSection.js
│   ├── lib/                 # Utility functions
│   │   ├── auth.js
│   │   └── useAuth.js
│   ├── pages/               # Next.js pages
│   │   ├── admin/           # Admin panel pages
│   │   │   ├── dashboard.js
│   │   │   ├── users.js
│   │   │   ├── blogs.js
│   │   │   ├── comments.js
│   │   │   └── reports.js
│   │   ├── blog/            # Blog-related pages
│   │   │   ├── create.js
│   │   │   ├── edit/[id].js
│   │   │   └── [slug].js
│   │   ├── index.js         # Home page
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── dashboard.js
│   │   ├── profile.js       # User profile settings
│   │   └── complaint.js
│   ├── styles/              # CSS styles
│   │   └── globals.css
│   ├── .env.local           # Frontend environment variables
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile (bio and avatar)
- `GET /api/auth/user/:id` - Get user profile by ID

### Blogs
- `GET /api/blogs` - Get all blogs (with pagination)
- `GET /api/blogs/:slug` - Get single blog
- `POST /api/blogs` - Create new blog (auth required)
- `PUT /api/blogs/:id` - Update blog (auth required)
- `DELETE /api/blogs/:id` - Delete blog (auth required)
- `POST /api/blogs/:id/like` - Like/unlike blog (auth required)

### Comments
- `GET /api/comments/blog/:blogId` - Get blog comments
- `POST /api/comments` - Create comment (auth required)
- `PUT /api/comments/:id` - Update comment (auth required)
- `DELETE /api/comments/:id` - Delete comment (auth required)
- `POST /api/comments/:id/like` - Like/unlike comment (auth required)

### Reports
- `POST /api/reports` - Submit report (auth required)
- `GET /api/reports/my` - Get user's reports (auth required)

### Admin (Admin role required)
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/blogs` - Get all blogs
- `DELETE /api/admin/blogs/:id` - Delete any blog
- `GET /api/admin/comments` - Get all comments
- `DELETE /api/admin/comments/:id` - Delete any comment
- `GET /api/admin/reports` - Get all reports
- `PUT /api/admin/reports/:id/status` - Update report status

## 🎯 Usage Guide

### For Regular Users
1. **Register/Login**: Create account or login at `/login`
2. **Create Posts**: Use the rich text editor at `/blog/create`
3. **Interact**: Like, comment, and reply to posts
4. **Report Content**: Use report buttons on inappropriate content (with validation)
5. **Submit Complaints**: Use `/complaint` page for general feedback only
6. **Manage Profile**: Update profile, bio, and avatar at `/profile`
7. **View Author Profiles**: Click on author names to view their profiles and bios

### For Administrators
1. **Access Admin Panel**: Login and visit `/admin/dashboard`
2. **Monitor System**: View statistics and system health
3. **Manage Users**: View, delete users, change roles
4. **Moderate Content**: Review and manage all posts and comments
5. **Handle Reports**: Review user reports with enhanced filtering and direct content links
6. **System Maintenance**: Monitor and maintain the platform
7. **Content Moderation**: Click on article/comment links in reports for quick access

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs
- **Enhanced Input Validation** with express-validator
- **Role-based Access Control** for admin features
- **CORS Configuration** for cross-origin requests
- **File Upload Security** with multer restrictions
- **XSS Protection** through input sanitization
- **Self-reporting Prevention** - users cannot report their own content
- **Authorization Checks** - login required for reporting functionality

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 or similar process manager
3. Configure reverse proxy (nginx)
4. Set up MongoDB Atlas for production database

### Frontend Deployment
1. Build the Next.js application: `npm run build`
2. Deploy to Vercel, Netlify, or similar platform
3. Update API URL in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify database permissions

2. **Admin Access Issues**
   - Verify user role is set to "admin" in database
   - Clear browser cache and cookies
   - Check JWT token validity

3. **File Upload Issues**
   - Ensure `uploads` directory exists in backend
   - Check file size limits
   - Verify multer configuration

4. **CORS Errors**
   - Verify frontend URL in CORS configuration
   - Check API URL in frontend environment variables

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.

---

**Built with ❤️ using Next.js and Node.js**