# EDUASSESS - Student Skill Assessment System

A comprehensive full-stack web application that helps students discover their strengths, improve weak areas, and receive personalized feedback for skill and career growth.

## 🚀 Features

### For Students
- **Interactive Assessments**: Take online quizzes and text-based assessments across multiple skill categories
- **Performance Tracking**: View detailed results and track progress over time
- **Skill Analysis**: Get insights into strengths and areas for improvement
- **Personalized Dashboard**: Access a comprehensive overview of your learning journey
- **Real-time Feedback**: Receive immediate feedback and recommendations

### For Administrators
- **Assessment Management**: Create, edit, and manage assessments and questions
- **User Management**: View and manage student accounts
- **Analytics Dashboard**: Access comprehensive analytics and performance metrics
- **Skill Category Management**: Organize assessments by skill categories

## 🛠️ Tech Stack

### Frontend
- **React.js** with hooks and Context API
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API communication
- **Pure CSS** with Flexbox for responsive design

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

## 📁 Project Structure

```
eduassess/
├── backend/
│   ├── server.js              # Main server file
│   ├── database.sql           # Database schema and sample data
│   ├── config.js              # Configuration file
│   └── package.json           # Backend dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── services/          # API services
│   │   ├── styles/            # CSS files
│   │   └── utils/             # Utility functions
│   └── package.json           # Frontend dependencies
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eduassess
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Set up the Database**
   - Create a MySQL database named `eduassess`
   - Import the database schema:
   ```bash
   mysql -u root -p eduassess < database.sql
   ```

4. **Configure Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=eduassess
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the Backend Server**
   ```bash
   npm run dev
   ```

6. **Set up the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

7. **Start the Frontend Development Server**
   ```bash
   npm start
   ```

8. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔐 Demo Credentials

### Admin Account
- **Email**: admin@eduassess.com
- **Password**: admin123

### Student Account
- **Email**: student@eduassess.com
- **Password**: student123

## 📊 Database Schema

### Tables
- **users**: User accounts and authentication
- **assessments**: Assessment information and metadata
- **questions**: Individual questions for each assessment
- **assessment_results**: Student submission results and scores

### Sample Data
The database includes sample assessments in various skill categories:
- JavaScript Fundamentals
- React.js Concepts
- Problem Solving
- Communication Skills
- Mathematics Basics

## 🎯 Key Features Implementation

### Authentication System
- JWT-based authentication
- Role-based access control (Student/Admin)
- Secure password hashing with bcryptjs

### Assessment System
- Dynamic question rendering
- Real-time timer functionality
- Progress tracking
- Immediate result calculation

### Data Visualization
- Performance trend charts
- Skill distribution pie charts
- Score analytics with Recharts

### Responsive Design
- Mobile-first approach
- CSS Flexbox layouts
- Adaptive components for all screen sizes

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Assessments
- `GET /api/assessments` - Get all assessments
- `GET /api/assessments/:id` - Get specific assessment with questions
- `POST /api/assessments/:id/submit` - Submit assessment answers

### Results
- `GET /api/results` - Get user's assessment results
- `GET /api/skills/analysis` - Get skill analysis data

### Admin
- `GET /api/admin/assessments` - Get all assessments (admin)
- `POST /api/admin/assessments` - Create new assessment
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get analytics data

## 🎨 UI/UX Features

### Design Principles
- Clean, modern interface
- Intuitive navigation
- Consistent color scheme
- Accessible design patterns

### Responsive Breakpoints
- Mobile: < 480px
- Tablet: 480px - 768px
- Desktop: > 768px

### Component Architecture
- Reusable components
- Context-based state management
- Service layer for API calls
- Modular CSS architecture

## 🚀 Deployment

### Backend Deployment
1. Set up a MySQL database
2. Configure environment variables
3. Deploy to platforms like Heroku, DigitalOcean, or AWS

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

## 🔮 Future Enhancements

- Advanced analytics and reporting
- Integration with learning management systems
- Mobile app development
- AI-powered personalized recommendations
- Multi-language support
- Advanced question types (essay, coding challenges)
- Social features and peer comparison
- Gamification elements

---

**EDUASSESS** - Empowering students through comprehensive skill assessment and personalized learning paths.
