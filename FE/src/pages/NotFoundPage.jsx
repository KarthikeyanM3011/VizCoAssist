import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl font-bold text-blue-500 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFoundPage;