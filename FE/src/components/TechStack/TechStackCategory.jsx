import React from 'react';

const TechStackCategory = ({ title, technologies }) => {
  // If no technologies are found for this category
  if (!technologies || Object.keys(technologies).length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <div className="space-y-3">
        {Object.entries(technologies).map(([tech, details]) => (
          <div key={tech} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
            <div className="flex justify-between items-center">
              <span className="font-medium">{tech}</span>
              {details.confidence && (
                <span className={`text-xs px-2 py-1 rounded ${
                  details.confidence === 'High' 
                    ? 'bg-green-100 text-green-800' 
                    : details.confidence === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {details.confidence}
                </span>
              )}
            </div>
            {details.evidence && (
              <p className="text-sm text-gray-600 mt-1">
                {details.evidence}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStackCategory;