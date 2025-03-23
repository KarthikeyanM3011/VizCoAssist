import React from 'react';
import './TechComponents.css';

const LanguageDistribution = ({ languages }) => {
  // Sort languages by percentage in descending order
  const sortedLanguages = Object.entries(languages)
    .map(([name, data]) => ({
      name,
      percentage: data.percentage || 0,
      color: getLanguageColor(name),
      evidence: data.evidence || ''
    }))
    .filter(lang => lang.percentage > 0) // Only show languages with non-zero percentage
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="language-distribution">
      {sortedLanguages.length === 0 ? (
        <div className="no-data">
          No language data available
        </div>
      ) : (
        <>
          {/* Bar chart */}
          <div className="language-bar-container">
            {sortedLanguages.map((lang) => (
              <div
                key={lang.name}
                className="language-bar" 
                style={{ 
                  width: `${lang.percentage}%`,
                  backgroundColor: lang.color,
                  minWidth: lang.percentage > 2 ? 'auto' : '5px'
                }}
                title={`${lang.name}: ${lang.percentage}%`}
              />
            ))}
          </div>
          
          {/* Languages list */}
          <div className="language-list">
            {sortedLanguages.map((lang) => (
              <div key={lang.name} className="language-item">
                <div 
                  className="language-color" 
                  style={{ backgroundColor: lang.color }}
                />
                <div className="language-content">
                  <div className="language-header">
                    <span className="language-name">{lang.name}</span>
                    <span className="language-percentage">{lang.percentage}%</span>
                  </div>
                  {lang.evidence && (
                    <p className="language-evidence">{lang.evidence}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
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