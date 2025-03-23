// // import React from 'react';

// // const Footer = () => {
// //   const year = new Date().getFullYear();
  
// //   return (
// //     <footer className="bg-gray-800 text-white p-4 mt-auto">
// //       <div className="container mx-auto text-center">
// //         <p>VizCoAssist</p>
// //       </div>
// //     </footer>
// //   );
// // };

// // export default Footer;
// import React, { useState, useEffect } from 'react';

// const VizCoAssistButton = () => {
//   const [popupVisible, setPopupVisible] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [isRippling, setIsRippling] = useState(false);
  
//   // Auto-close popup after 8 seconds
//   useEffect(() => {
//     let timer;
//     if (popupVisible) {
//       timer = setTimeout(() => {
//         setPopupVisible(false);
//       }, 8000);
//     }
//     return () => clearTimeout(timer);
//   }, [popupVisible]);
  
//   // Create periodic ripple effect
//   useEffect(() => {
//     const rippleInterval = setInterval(() => {
//       if (!isRippling && !popupVisible) {
//         setIsRippling(true);
//         setTimeout(() => setIsRippling(false), 1200);
//       }
//     }, 6000);
    
//     return () => clearInterval(rippleInterval);
//   }, [isRippling, popupVisible]);
  
//   // Handle button click to toggle popup
//   const handleButtonClick = () => {
//     setPopupVisible(!popupVisible);
//     setIsRippling(true);
//     setTimeout(() => setIsRippling(false), 1200);
//   };

//   return (
//     <div className="fixed bottom-8 right-8 z-50">
//       {/* Main Button */}
//       <div className="relative">
//         <button
//           onClick={handleButtonClick}
//           onMouseEnter={() => setIsHovered(true)}
//           onMouseLeave={() => setIsHovered(false)}
//           className={`flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 bg-opacity-90 shadow-xl transition-all duration-300 ${
//             isHovered || popupVisible ? 'scale-110' : 'scale-100'
//           }`}
//           style={{ 
//             backgroundImage: 'radial-gradient(circle at center, #171927 0%, #0f0f14 100%)',
//             boxShadow: isHovered || popupVisible 
//               ? '0 0 20px rgba(59, 130, 246, 0.7), 0 0 30px rgba(139, 92, 246, 0.3)' 
//               : '0 0 15px rgba(59, 130, 246, 0.4)'
//           }}
//         >
//           {/* Logo */}
//           <span 
//             className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400"
//             style={{ 
//               backgroundSize: '200% 200%',
//               animation: 'gradientShift 3s ease infinite alternate'
//             }}
//           >
//             V
//           </span>
          
//           {/* Inner glow */}
//           <div className="absolute inset-0 rounded-full overflow-hidden">
//             <div
//               className={`absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-cyan-400/20 blur-sm transition-all duration-300 ${
//                 isHovered || popupVisible ? 'opacity-80' : 'opacity-40'
//               }`}
//             ></div>
//           </div>
          
//           {/* Hexagonal patterns */}
//           <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
//             {[...Array(15)].map((_, i) => (
//               <div 
//                 key={i}
//                 className="absolute bg-blue-500"
//                 style={{
//                   width: '6px',
//                   height: '6px',
//                   clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
//                   left: `${Math.random() * 100}%`,
//                   top: `${Math.random() * 100}%`,
//                   opacity: Math.random() * 0.5 + 0.2,
//                   transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.8 + 0.5})`
//                 }}
//               ></div>
//             ))}
//           </div>
//         </button>
        
//         {/* Energy ripple effect */}
//         {isRippling && (
//           <div className="absolute inset-0">
//             {[...Array(3)].map((_, i) => (
//               <div 
//                 key={i}
//                 className="absolute inset-0 border-2 border-cyan-400 rounded-full"
//                 style={{
//                   opacity: (0.6 - (i * 0.2)) * (isHovered ? 1.3 : 1),
//                   transform: `scale(${1 + (i * 0.15)})`,
//                   animation: 'rippleExpand 1.2s cubic-bezier(0, 0.2, 0.8, 1) forwards'
//                 }}
//               ></div>
//             ))}
//           </div>
//         )}
//       </div>
      
//       {/* Popup */}
//       {popupVisible && (
//         <div 
//           className="absolute bottom-20 right-0 w-72 p-4 bg-gray-900 bg-opacity-95 rounded-lg shadow-2xl border border-blue-500/30"
//           style={{ 
//             animation: 'fadeInUp 0.3s ease forwards',
//             backdropFilter: 'blur(8px)',
//             boxShadow: '0 0 25px rgba(59, 130, 246, 0.4), 0 0 15px rgba(139, 92, 246, 0.3)'
//           }}
//         >
//           {/* Background patterns */}
//           <div className="absolute inset-0 overflow-hidden rounded-lg opacity-20">
//             {/* Energy field lines */}
//             {[...Array(6)].map((_, i) => (
//               <div 
//                 key={i}
//                 className="absolute h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full"
//                 style={{ 
//                   top: `${15 + i * 15}%`,
//                   transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)`,
//                   opacity: 0.3 + (i * 0.1)
//                 }}
//               ></div>
//             ))}
//           </div>
          
//           {/* Header */}
//           <div className="relative mb-3">
//             <h3 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
//               ✨ VizCoAssist ✨
//             </h3>
            
//             {/* Glow effect */}
//             <div className="absolute -inset-3 -top-2 blur-md bg-gradient-to-r from-blue-400/30 via-purple-500/30 to-cyan-400/30 opacity-30"></div>
            
//             {/* Close button */}
//             <button 
//               onClick={() => setPopupVisible(false)}
//               className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 text-sm hover:bg-gray-700 hover:text-white transition-colors"
//               style={{
//                 boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)'
//               }}
//             >
//               ×
//             </button>
//           </div>
          
//           {/* Content */}
//           <div className="space-y-3">
//             <p className="text-sm text-cyan-100">
//               Your intelligent visualization co-pilot for data analysis and creative decision-making!
//             </p>
            
//             {/* Features with icons */}
//             <div className="space-y-2">
//               <div className="flex items-center text-xs text-gray-300">
//                 <div className="w-6 h-6 flex items-center justify-center mr-2 bg-blue-900/30 rounded-full text-blue-400">
//                   <span>📊</span>
//                 </div>
//                 <span>AI-powered data insights</span>
//               </div>
              
//               <div className="flex items-center text-xs text-gray-300">
//                 <div className="w-6 h-6 flex items-center justify-center mr-2 bg-purple-900/30 rounded-full text-purple-400">
//                   <span>👥</span>
//                 </div>
//                 <span>Real-time collaboration tools</span>
//               </div>
              
//               <div className="flex items-center text-xs text-gray-300">
//                 <div className="w-6 h-6 flex items-center justify-center mr-2 bg-cyan-900/30 rounded-full text-cyan-400">
//                   <span>🔄</span>
//                 </div>
//                 <span>Interactive visualization creation</span>
//               </div>
//             </div>
            
//             {/* Action button */}
//             <button
//               className="w-full py-2 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md text-sm font-medium text-white transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/20"
//             >
//               +19302220839
//             </button>
//           </div>
//         </div>
//       )}
      
//       {/* CSS Animations */}
//       <style jsx>{`
//         @keyframes gradientShift {
//           0% { background-position: 0% 50%; }
//           100% { background-position: 100% 50%; }
//         }
        
//         @keyframes rippleExpand {
//           0% { 
//             opacity: 0.6;
//             transform: scale(1);
//           }
//           100% { 
//             opacity: 0;
//             transform: scale(1.5);
//           }
//         }
        
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default VizCoAssistButton;

import React, { useState, useEffect } from "react";
import { FiHeadphones, FiPhoneCall } from "react-icons/fi";
import { AiOutlineCode, AiOutlineBarChart, AiOutlineCustomerService } from "react-icons/ai";

const VizCoAssistButton = () => {
    const [popupVisible, setPopupVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isRippling, setIsRippling] = useState(false);

    useEffect(() => {
        let timer;
        if (popupVisible) {
            timer = setTimeout(() => setPopupVisible(false), 8000);
        }
        return () => clearTimeout(timer);
    }, [popupVisible]);

    useEffect(() => {
        const rippleInterval = setInterval(() => {
            if (!isRippling && !popupVisible) {
                setIsRippling(true);
                setTimeout(() => setIsRippling(false), 1200);
            }
        }, 6000);

        return () => clearInterval(rippleInterval);
    }, [isRippling, popupVisible]);

    const handleButtonClick = () => {
        setPopupVisible(!popupVisible);
        setIsRippling(true);
        setTimeout(() => setIsRippling(false), 1200);
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            {/* Support Button */}
            <div className="relative">
                <button
                    onClick={handleButtonClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className={`flex items-center justify-center w-16 h-16 rounded-full bg-gray-900 shadow-xl transition-all duration-300 ${isHovered || popupVisible ? "scale-110" : "scale-100"
                        }`}
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at center, #171927 0%, #0f0f14 100%)",
                        boxShadow:
                            isHovered || popupVisible
                                ? "0 0 20px rgba(59, 130, 246, 0.7), 0 0 30px rgba(139, 92, 246, 0.3)"
                                : "0 0 15px rgba(59, 130, 246, 0.4)",
                    }}
                >
                    <FiHeadphones className="text-blue-400 text-2xl" />
                </button>

                {/* Ripple Effect */}
                {isRippling && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-full h-full border-2 border-cyan-400 rounded-full"
                                style={{
                                    opacity: 0.6 - i * 0.2,
                                    animation: "rippleExpand 1.2s cubic-bezier(0, 0.2, 0.8, 1) forwards",
                                }}
                            ></div>
                        ))}
                    </div>
                )}
            </div>

            {/* Popup */}
            {popupVisible && (
                <div
                    className="absolute bottom-20 right-0 w-80 p-4 bg-gray-900 rounded-lg shadow-2xl border border-blue-500"
                    style={{
                        animation: "fadeInUp 0.3s ease forwards",
                        backdropFilter: "blur(8px)",
                        boxShadow: "0 0 25px rgba(59, 130, 246, 0.4)",
                    }}
                >
                    {/* Header */}
                    <div className="relative mb-3">
                        <h3 className="text-xl font-bold text-center text-blue-400 flex items-center justify-center">
                            <FiHeadphones className="mr-2 text-2xl" />
                            AI Call Agent
                        </h3>
                        {/* Close Button */}
                        <button
                            onClick={() => setPopupVisible(false)}
                            className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            style={{
                                boxShadow: "0 0 8px rgba(59, 130, 246, 0.4)",
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Support Options */}
                    <p className="text-sm text-cyan-100 text-center mb-3">How can we assist you?</p>
                    <ul className="space-y-3">
                        <li className="flex items-center text-gray-300 text-sm">
                            <AiOutlineCode className="text-blue-400 text-xl mr-2" />
                            Codebase Analysis
                        </li>
                        <li className="flex items-center text-gray-300 text-sm">
                            <AiOutlineBarChart className="text-purple-400 text-xl mr-2" />
                            High & Low-Level Diagrams
                        </li>
                        <li className="flex items-center text-gray-300 text-sm">
                            <AiOutlineCustomerService className="text-cyan-400 text-xl mr-2" />
                            General Customer Support
                        </li>
                    </ul>

                    {/* Call Button */}
                    <a
                        href="tel:+19302220839"
                        className="mt-4 flex items-center justify-center w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md text-white font-medium text-sm transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/20"
                    >
                        <FiPhoneCall className="mr-2 text-lg" />
                        Call Support: +1 930 222 0839
                    </a>
                </div>
            )}

            {/* CSS Animations */}
            <style jsx>{`
        @keyframes rippleExpand {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
};

export default VizCoAssistButton;
