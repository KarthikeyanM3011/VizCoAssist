import React from 'react';

const PlantUMLViewer = ({ code }) => {
  const encodedCode = code ? btoa(unescape(encodeURIComponent(code))) : '';
  const plantUmlUrl = `https://www.plantuml.com/plantuml/img/${encodedCode}`;

  return (
    <div className="p-4 flex justify-center overflow-auto">
      {code ? (
        <img 
          src={plantUmlUrl} 
          alt="PlantUML Diagram" 
          className="max-w-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjhmOCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPkVycm9yIHJlbmRlcmluZyBkaWFncmFtPC90ZXh0Pjwvc3ZnPg==';
            console.error('Error loading PlantUML diagram');
          }}
        />
      ) : (
        <div className="text-center text-gray-500">No PlantUML code available</div>
      )}
    </div>
  );
};

export default PlantUMLViewer;