import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';

const Header = () => {
  const location = useLocation();
  const { session } = useSession();
  
  return (
    <header className="bg-gray-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">VizCoAssist</Link>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link 
                to="/" 
                className={`hover:text-blue-300 ${location.pathname === '/' ? 'text-blue-300' : ''}`}
              >
                Home
              </Link>
            </li>
            
            {session?.id && (
              <>
                <li>
                  <Link 
                    to={`/project/${session.id}`} 
                    className={`hover:text-blue-300 ${location.pathname.includes('/project/') ? 'text-blue-300' : ''}`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    to={`/project/${session.id}/diagrams`} 
                    className={`hover:text-blue-300 ${location.pathname.includes('/diagrams') ? 'text-blue-300' : ''}`}
                  >
                    Diagrams
                  </Link>
                </li>
                <li>
                  <Link 
                    to={`/project/${session.id}/techstack`} 
                    className={`hover:text-blue-300 ${location.pathname.includes('/techstack') ? 'text-blue-300' : ''}`}
                  >
                    Tech Stack
                  </Link>
                </li>
                <li>
                  <Link 
                    to={`/project/${session.id}/chatbot`} 
                    className={`hover:text-blue-300 ${location.pathname.includes('/chatbot') ? 'text-blue-300' : ''}`}
                  >
                    Chatbot
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;