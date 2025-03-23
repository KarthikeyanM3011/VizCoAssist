import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const features = [
    {
      title: "Architecture Visualization",
      description: "Generate interactive diagrams that visualize your codebase structure and data flow",
      icon: "diagram-icon"
    },
    {
      title: "AI-Powered Analysis",
      description: "Get intelligent insights about your code's structure, dependencies, and tech stack",
      icon: "ai-icon"
    },
    {
      title: "Code Exploration Chatbot",
      description: "Ask questions and get detailed answers about any part of your codebase",
      icon: "chat-icon"
    }
  ];
  
  useEffect(() => {
    // Auto transition for feature slides
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      {/* Animated background */}
      <div className="animated-bg">
        <div className="circles">
          <div className="circle1"></div>
          <div className="circle2"></div>
          <div className="circle3"></div>
        </div>
        <div className="grid-overlay"></div>
      </div>
      
      {/* Hero section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="glitch-text" data-text="VizCoAssist">VizCoAssist</h1>
            <p className="subtitle">Transform complex code into beautiful, interactive visualizations</p>
            
            <div className="hero-features">
              <div className="feature-cards">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className={`feature-card ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  >
                    <div className={`feature-icon ${feature.icon}`}></div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="slide-indicators">
                {features.map((_, index) => (
                  <button 
                    key={index}
                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  ></button>
                ))}
              </div>
            </div>
            
            <div className="cta-buttons">
              <Link to="/upload" className="btn-cta btn-primary">
                Start Visualizing
                <svg className="btn-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
             
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="code-visualization">
              <div className="code-mockup">
                <div className="mockup-header">
                  <div className="mockup-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="mockup-title">codebase-visualization.py</div>
                </div>
                <div className="mockup-content">
                  <pre><code><span className="code-keyword">class</span> <span className="code-function">Architecture</span>:
    <span className="code-keyword">def</span> <span className="code-function">analyze</span>(self, codebase):
        <span className="code-comment"># Analyze codebase structure</span>
        components = self.extract_components(codebase)
        relationships = self.map_relationships(components)
        
        <span className="code-keyword">return</span> 
            <span className="code-string">"components"</span>: components,
            <span className="code-string">"relationships"</span>: relationships,
            <span className="code-string">"complexity"</span>: self.measure_complexity(codebase);
        
    <span className="code-keyword">def</span> <span className="code-function">visualize</span>(self, analysis):
        <span className="code-comment"># Generate interactive diagram</span>
        diagram = DiagramBuilder(analysis)
        diagram.render()</code></pre>
                </div>
              </div>
              
              <div className="visualization-preview">
                <div className="diagram-nodes">
                  <div className="node node1">
                    <span className="node-label">API</span>
                  </div>
                  <div className="node node2">
                    <span className="node-label">Database</span>
                  </div>
                  <div className="node node3">
                    <span className="node-label">Services</span>
                  </div>
                  <div className="node node4">
                    <span className="node-label">UI</span>
                  </div>
                  <div className="node node5">
                    <span className="node-label">Auth</span>
                  </div>
                  
                  <svg className="diagram-connections" viewBox="0 0 400 300">
                    <path d="M100,50 C150,50 150,100 200,100" className="connection c1" />
                    <path d="M200,100 C250,100 250,150 300,150" className="connection c2" />
                    <path d="M200,100 C250,100 250,50 300,50" className="connection c3" />
                    <path d="M100,150 C150,150 150,100 200,100" className="connection c4" />
                    <path d="M100,250 C150,250 150,150 200,150" className="connection c5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="badge">Features</div>
            <h2>All-in-one code visualization platform</h2>
            <p>Understand complex codebases in minutes, not days</p>
          </div>
          
          <div className="feature-blocks">
            <div className="feature-block">
              <div className="feature-image">
                <div className="diagram-preview architecture-diagram">
                  <div className="diagram-content">
                    <div className="module mod1">Controller</div>
                    <div className="module mod2">Service</div>
                    <div className="module mod3">Repository</div>
                    <div className="module mod4">Database</div>
                    <div className="connector con1"></div>
                    <div className="connector con2"></div>
                    <div className="connector con3"></div>
                  </div>
                </div>
              </div>
              <div className="feature-info">
                <h3>Architecture Diagrams</h3>
                <p>Automatically generate high-level and low-level diagrams that clearly show your code structure and relationships.</p>
                <ul className="feature-bullets">
                  <li>Component relationships</li>
                  <li>Data flow visualization</li>
                  <li>Mermaid and PlantUML support</li>
                  <li>Interactive diagram exploration</li>
                </ul>
              </div>
            </div>
            
            <div className="feature-block reverse">
              <div className="feature-image">
                <div className="tech-stack-preview">
                  <div className="tech-stack-chart">
                    <div className="stack-bar" style={{"--percent": "65%", "--color": "#6366F1"}}>
                      <span className="stack-label">JavaScript</span>
                      <span className="stack-percent">65%</span>
                    </div>
                    <div className="stack-bar" style={{"--percent": "20%", "--color": "#8B5CF6"}}>
                      <span className="stack-label">Python</span>
                      <span className="stack-percent">20%</span>
                    </div>
                    <div className="stack-bar" style={{"--percent": "10%", "--color": "#EC4899"}}>
                      <span className="stack-label">HTML/CSS</span>
                      <span className="stack-percent">10%</span>
                    </div>
                    <div className="stack-bar" style={{"--percent": "5%", "--color": "#F59E0B"}}>
                      <span className="stack-label">Other</span>
                      <span className="stack-percent">5%</span>
                    </div>
                  </div>
                  <div className="tech-cards">
                    <div className="tech-card">React</div>
                    <div className="tech-card">Express</div>
                    <div className="tech-card">MongoDB</div>
                    <div className="tech-card">+12 more</div>
                  </div>
                </div>
              </div>
              <div className="feature-info">
                <h3>Tech Stack Analysis</h3>
                <p>Identify and analyze the technologies, frameworks, and languages used in your codebase with detailed breakdowns.</p>
                <ul className="feature-bullets">
                  <li>Language distribution</li>
                  <li>Framework identification</li>
                  <li>Library dependency analysis</li>
                  <li>Technology usage insights</li>
                </ul>
              </div>
            </div>
            
            <div className="feature-block">
              <div className="feature-image">
                <div className="chatbot-preview">
                  <div className="chat-header">
                    <div className="chat-title">Code Assistant</div>
                  </div>
                  <div className="chat-messages">
                    <div className="chat-message user">
                      <div className="message-bubble">What's the main purpose of the AuthService class?</div>
                    </div>
                    <div className="chat-message bot">
                      <div className="message-bubble">
                        <p>The AuthService class handles user authentication and authorization in the application. It has these key responsibilities:</p>
                        <ul>
                          <li>User login validation</li>
                          <li>JWT token generation and verification</li>
                          <li>Role-based access control</li>
                        </ul>
                        <p>It's used by the AuthController and interacts with the UserRepository.</p>
                      </div>
                    </div>
                  </div>
                  <div className="chat-input">
                    <input type="text" placeholder="Ask about your code..." />
                    <button className="send-button">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                        <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="feature-info">
                <h3>AI-Powered Chatbot</h3>
                <p>Ask questions about your codebase and get detailed answers from our intelligent AI assistant.</p>
                <ul className="feature-bullets">
                  <li>Natural language queries</li>
                  <li>Contextual code awareness</li>
                  <li>Implementation details extraction</li>
                  <li>Architecture understanding</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it works section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <div className="badge">Process</div>
            <h2>How It Works</h2>
            <p>Three simple steps to understand your codebase</p>
          </div>
          
          <div className="steps">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Upload Your Code</h3>
                <p>Upload a ZIP file containing your codebase or import directly from a GitHub repository.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>AI Analysis</h3>
                <p>Our system analyzes your code, identifies structures, dependencies, and technologies.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Explore & Interact</h3>
                <p>View visualizations, diagrams, and interact with the AI chatbot to understand your code.</p>
              </div>
            </div>
          </div>
          
          <div className="steps-cta">
            <Link to="/upload" className="btn-cta btn-primary">
              Start Now
              <svg className="btn-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default HomePage;