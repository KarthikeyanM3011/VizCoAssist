import React from 'react';

const LanguageDistribution = ({ languages }) => {
  // Sort languages by percentage in descending order
  const sortedLanguages = Object.entries(languages)
    .map(([name, data]) => ({
      name,
      percentage: data.percentage || 0,
      color: getLanguageColor(name),
      evidence: data.evidence || ''
    }))
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div>
      {sortedLanguages.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          No language data available
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bar chart */}
          <div className="h-8 w-full flex rounded-md overflow-hidden">
            {sortedLanguages.map((lang, index) => (
              <div
                key={lang.name}
                className="h-full" 
                style={{ 
                  width: `${lang.percentage}%`,
                  backgroundColor: lang.color,
                  minWidth: lang.percentage > 2 ? 'auto' : '8px'
                }}
                title={`${lang.name}: ${lang.percentage}%`}
              />
            ))}
          </div>
          
          {/* Languages list */}
          <div className="space-y-2">
            {sortedLanguages.map((lang, index) => (
              <div key={lang.name} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-sm mr-2" 
                  style={{ backgroundColor: lang.color }}
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-sm text-gray-600">{lang.percentage}%</span>
                  </div>
                  {lang.evidence && (
                    <p className="text-xs text-gray-500">{lang.evidence}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get a color for a language
function getLanguageColor(language) {
  const colorMap = {
    'JavaScript': '#f7df1e',
    'TypeScript': '#007acc',
    'Python': '#3776ab',
    'Java': '#b07219',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'C++': '#f34b7d',
    'C': '#555555',
    'Shell': '#89e051',
    'Other': '#8257e5'
  };

  // Return the color if found, otherwise generate one based on the name
  return colorMap[language] || `hsl(${hashString(language) % 360}, 70%, 60%)`;
}

// Simple hash function for strings
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export default LanguageDistribution;