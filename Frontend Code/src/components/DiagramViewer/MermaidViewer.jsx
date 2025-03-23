import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

const MermaidViewer = ({ code }) => {
  const containerRef = useRef(null);
  const mermaidId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (!code) return;
    
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
    
    try {
      // Render the diagram
      mermaid.render(mermaidId, code)
        .then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        })
        .catch(error => {
          console.error('Mermaid rendering error:', error);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<div class="p-4 text-red-500">Error rendering diagram: ${error.message}</div>`;
          }
        });
    } catch (error) {
      console.error('Mermaid error:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `<div class="p-4 text-red-500">Error rendering diagram: ${error.message}</div>`;
      }
    }
  }, [code, mermaidId]);

  return (
    <div className="p-4 flex justify-center overflow-auto">
      <div ref={containerRef} className="mermaid-container w-full"></div>
    </div>
  );
};

export default MermaidViewer;