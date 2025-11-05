# Body Composition Monitor

A Progressive Web App (PWA) for tracking and analyzing body composition over time.

## Features

- **Landing Page**: Google login with sample charts showcasing report capabilities
- **Dashboard**: Full-featured dashboard with navigation and reports
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Toggle between dark and light themes
- **User Authentication**: Google OAuth integration with Firebase Auth
- **Reports Section**: Visualize body composition trends with interactive charts

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Firebase Auth** for Google OAuth
- **PWA** support with Vite PWA plugin

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Firebase configuration:
   - Create a `.env` file in the root directory
   - Add your Firebase configuration values:
```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```
   - Get these values from Firebase Console > Project Settings > General

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── DashboardLayout.tsx
│   ├── Sidebar.tsx
│   └── TopBar.tsx
├── config/          # Configuration files
│   ├── api.ts       # API base URL configuration
│   └── firebase.ts  # Firebase configuration
├── services/        # Service layer
│   └── authService.ts # Authentication service
├── contexts/        # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── pages/          # Page components
│   ├── LandingPage.tsx
│   ├── DashboardHome.tsx
│   ├── Settings.tsx
│   └── ...
└── App.tsx         # Main app component
```

## API Configuration

The API base URL is configured in `src/config/api.ts`:
- Base URL: `https://api.body-composition.contactsunny.com`

Use the `getApiUrl()` helper function to construct full API URLs.

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication:
   - Go to Authentication > Sign-in method
   - Enable Google sign-in provider
3. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Copy the configuration values
4. Add the configuration to your `.env` file (see Installation step 2)

## Authentication Flow

The app uses Firebase Authentication with Google OAuth:

1. User clicks "Continue with Google" on the landing page
2. Firebase Auth popup opens for Google sign-in
3. After successful Google authentication, the ID token is sent to the backend API
4. Backend validates the token and returns user data + auth token
5. User data and token are stored in localStorage
6. User is redirected to the dashboard

The authentication token is automatically included in API requests (you may need to add this to your API service layer).

## Features to be Added

- Body composition entry form
- Historical data management
- Advanced reporting and analytics
- Export functionality
- Data synchronization

## License

MIT

