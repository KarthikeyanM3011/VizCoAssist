import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ChatInterface from '../components/Chatbot/ChatInterface';
import Loader from '../components/common/Loader';
import { getSessionStatus } from '../api/sessionApi';
import { isChatbotInitialized, getChatbotInitProgress } from '../api/chatbotApi';

const ChatbotPage = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if session is ready
        const statusResponse = await getSessionStatus(sessionId);
        if (statusResponse.status !== 'ready' && statusResponse.status !== 'completed') {
          setError(`Cannot use chatbot. Current status: ${statusResponse.status}`);
          setLoading(false);
          return;
        }
        
        // Check if chatbot is initialized
        const initialized = await isChatbotInitialized(sessionId);
        setIsInitialized(initialized);
        
        if (!initialized) {
          // Check initialization progress
          const progressResponse = await getChatbotInitProgress(sessionId);
          if (progressResponse.status === 'in_progress') {
            setInitProgress(progressResponse.progress || 0);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load chatbot data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [sessionId]);
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <Loader text="Loading chatbot..." />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">AI Codebase Assistant</h1>
            <p className="text-gray-600">
              Chat with our AI to get insights about your codebase
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <ChatInterface sessionId={sessionId} />
          </div>
          
          <div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Example Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="font-medium text-blue-800">"What are the main components in this codebase?"</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="font-medium text-blue-800">"Explain how the file processing works in this system."</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="font-medium text-blue-800">"What technologies are used in the frontend and backend?"</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="font-medium text-blue-800">"How does the rendering system work for the diagrams?"</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>The AI assistant has been trained on the structure and content of your codebase. It can answer questions about architecture, implementation details, and technologies used.</p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatbotPage;