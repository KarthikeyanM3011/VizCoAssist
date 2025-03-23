import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white p-4 mt-auto">
      <div className="container mx-auto text-center">
        <p>VizCoAssist &copy; {year} - Codebase Analysis and Visualization Tool</p>
      </div>
    </footer>
  );
};

export default Footer;