# AI Mock Interview

An AI-powered mock interview platform built with React, Express, MongoDB, TypeScript, Tailwind CSS, and Google Gemini AI.

## Features

- **Authentication**: Email/password signup, login, and logout with JWT tokens
- **AI-Powered Interviews**: Generate realistic interview questions based on job role, experience level, and difficulty
- **Interactive Interview Flow**: Answer questions one-by-one with previous/next navigation
- **AI Feedback**: Get detailed feedback on your answers including scores, strengths, and areas for improvement
- **Interview History**: Track all your past interviews and review your performance
- **Profile Management**: Update your personal information and change your password
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React UI rendered by Next.js, TypeScript, Tailwind CSS
- **Backend**: Express.js API
- **Database**: MongoDB Atlas
- **Authentication**: Custom JWT-based authentication (HTTP-only cookies)
- **AI**: Google Gemini 2.5 Flash for question generation and answer evaluation
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB Atlas cluster or compatible MongoDB server
- Google Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your actual values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `MONGODB_DB`: The database name to use
   - `MONGODB_DNS_SERVERS`: Optional comma-separated DNS resolvers for Atlas SRV lookups (for example, `1.1.1.1,8.8.8.8`)
   - `BACKEND_URL`: Express backend base URL, usually `http://localhost:5000`
   - `JWT_SECRET`: A secret key for JWT tokens
   - `GOOGLE_GENERATIVE_AI_API_KEY`: Your Google Gemini API key

5. Run the development servers:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following MongoDB collections:

- **users**: Stores user information, including email, password hash, name, and timestamps
- **interview_sessions**: Tracks interview sessions with the selected role, level, status, and timestamps
- **interview_questions**: Stores questions for each interview session
- **interview_answers**: Stores submitted answers for each question
- **interview_feedback**: Stores overall feedback for each interview session

## API Routes

- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `POST /api/generate-questions` - Generate interview questions using AI
- `POST /api/evaluate-interview` - Evaluate interview answers using AI
- `GET /api/history` - Get user's interview history
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## Project Structure

```
app/
├- (app)/
│  └- layout.tsx       # Main layout for authenticated routes
├- (auth)/
│  ├- layout.tsx       # Layout for auth routes
│  ├- login/
│  │  └- page.tsx      # Login page
│  └- register/
│     └- page.tsx      # Registration page
├- dashboard/
│  └- page.tsx         # Dashboard page
├- interview/
│  └- page.tsx         # Interview flow page
├- history/
│  └- page.tsx         # Interview history page
├- profile/
│  └- page.tsx         # User profile page
├- components/
│  └- Sidebar.tsx      # Sidebar navigation component
├- lib/
│  ├- jwt.ts           # JWT utility functions
│  └- password.ts      # Password hashing utilities
├- server/
│  └- index.js         # Express API server
├- db/
│  ├- schema.ts        # MongoDB document types and serializers
│  ├- index.ts         # MongoDB connection helpers
│  └- bootstrap.ts     # Collection index setup
├- middleware.ts       # Authentication middleware
├- layout.tsx          # Root layout
└- page.tsx            # Home page (redirects based on auth status)
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_DB` | Database name to use | `ai_mock_interview` |
| `BACKEND_URL` | Express backend URL used by the Next.js rewrite | `http://localhost:5000` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your-super-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key | `your-api-key-here` |
| `NEXTAUTH_URL` | Base URL for the application | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for NextAuth (not used but kept for compatibility) | `your-nextauth-secret` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## How It Works

1. **User Authentication**: Users can sign up, log in, and log out. Authentication is handled via JWT stored in HTTP-only cookies.

2. **Starting an Interview**: 
   - Users select a job role, experience level, and difficulty
   - The system uses Google Gemini AI to generate 5 tailored interview questions
   - Users answer each question one at a time

3. **Answer Evaluation**:
   - After answering all questions, the system uses Gemini AI to evaluate each answer
   - Feedback includes scores (1-10), strengths, areas for improvement, and suggestions
   - An overall score is calculated as the average of all question scores

4. **Progress Tracking**:
   - All interviews are saved to the user's history
   - Users can review past interviews to see their progress over time
   - The dashboard shows statistics like total interviews, average score, etc.

## Deployment

The easiest way to deploy this application is to [Vercel](https://vercel.com):

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add the environment variables in the Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org) for the incredible React framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [MongoDB](https://www.mongodb.com/) for the database
- [Google Gemini](https://ai.google.dev/gemini-api) for the powerful AI capabilities
- [Vercel](https://vercel.com) for the hosting platform
