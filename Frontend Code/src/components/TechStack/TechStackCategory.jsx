import React from 'react';
import './TechComponents.css';

const TechStackCategory = ({ title, technologies }) => {
  // If no technologies are found for this category
  if (!technologies || Object.keys(technologies).length === 0) {
    return null;
  }

  // Filter out "None identified" if there are other technologies
  const techEntries = Object.entries(technologies);
  const filteredTechs = techEntries.length > 1 && techEntries.some(([tech]) => tech === "None identified") 
    ? techEntries.filter(([tech]) => tech !== "None identified")
    : techEntries;

  return (
    <div className="tech-category">
      <h3 className="tech-category-title">{title}</h3>
      
      {filteredTechs.length === 0 ? (
        <div className="empty-message">No technologies identified</div>
      ) : (
        <div className="tech-list">
          {filteredTechs.map(([tech, details]) => (
            <div key={tech} className="tech-item">
              <div className="tech-header">
                <span className="tech-name">{tech}</span>
                {details.confidence && (
                  <span className={`confidence-badge confidence-${details.confidence.toLowerCase()}`}>
                    {details.confidence}
                  </span>
                )}
              </div>
              {details.evidence && (
                <p className="tech-evidence">
                  {details.evidence}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechStackCategory;