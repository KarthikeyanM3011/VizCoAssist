import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/common/Loader';

// Lazy-loaded page components for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectUploadPage = lazy(() => import('./pages/ProjectUploadPage'));
const ProjectDashboardPage = lazy(() => import('./pages/ProjectDashboardPage'));
const CodeSummaryPage = lazy(() => import('./pages/CodeSummaryPage'));
const DiagramPage = lazy(() => import('./pages/DiagramPage'));
const TechStackPage = lazy(() => import('./pages/TechStackPage'));
const ChatbotPage = lazy(() => import('./pages/ChatbotPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <Loader text="Loading page..." size="large" />
  </div>
);

/**
 * Not Found Page Component
 */
const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6 text-gray-600">The page you're looking for doesn't exist.</p>
      <a 
        href="/"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
      >
        Go Home
      </a>
    </div>
  );
};

/**
 * Application routes configuration
 */
const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<ProjectUploadPage />} />
        
        {/* Project-specific routes */}
        <Route path="/project/:sessionId" element={<ProjectDashboardPage />} />
        <Route path="/project/:sessionId/summary" element={<CodeSummaryPage />} />
        <Route path="/project/:sessionId/diagrams" element={<DiagramPage />} />
        <Route path="/project/:sessionId/techstack" element={<TechStackPage />} />
        <Route path="/project/:sessionId/chatbot" element={<ChatbotPage />} />
        
        {/* Redirect and 404 routes */}
        <Route path="/project" element={<Navigate to="/upload" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;