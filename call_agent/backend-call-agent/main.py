# from flask import Flask, request, jsonify
# import os
# from dotenv import load_dotenv
# import openai
# from flask_cors import CORS

# # Load environment variables
# load_dotenv()

# app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes

# # Configure OpenAI API
# openai.api_key = os.getenv("OPENAI_API_KEY")

# # Company Information
# COMPANY_INFO = """
# VizCoAssist is a cutting-edge code analysis platform that helps developers understand complex codebases through visualization, summarization, and interactive exploration.

# COMPANY DETAILS:
# - Founded: 2023
# - Headquarters: Bangalore, India
# - Mission: To make understanding codebases simple, intuitive, and accessible for all developers

# CONTACT INFORMATION:
# - Phone: +91 866-770-5875
# - Email: karthikeyanmjnk13579@gmail.com
# - Address: 123 Tech Park, Electronic City Phase 1, Bangalore - 560100, India
# - Support Hours: Monday-Friday, 9am-6pm IST

# LEADERSHIP:
# - Karthikeyan M, Founder & CEO
# - Development Team of highly skilled engineers with expertise in code analysis and AI technologies

# Follow us on social media:
# - Twitter: @VizCoAssist
# - LinkedIn: linkedin.com/company/vizcoassist
# - GitHub: github.com/vizcoassist
# """

# # Pricing Information
# PRICING_INFO = """
# VizCoAssist offers flexible pricing plans designed to meet the needs of individual developers, teams, and enterprises:

# PAY-AS-YOU-GO PLAN:
# - No monthly commitment
# - Only pay for what you use
# - $0.05 per file analyzed
# - Basic code summary
# - High-level architecture diagram
# - Basic tech stack analysis
# - Pay with credit/debit card or account credits

# STARTER PLAN (Free):
# - Upload repositories up to 50MB
# - Basic code summary
# - High-level architecture diagram
# - Limited tech stack analysis
# - 10 chatbot interactions per project

# DEVELOPER PLAN (₹999/month or $12.99/month):
# - Upload repositories up to 200MB
# - Comprehensive code summary
# - High-level and component-level architecture diagrams
# - Detailed tech stack analysis
# - 100 chatbot interactions per project
# - Export diagrams and summaries
# - Up to 5 project sessions

# TEAM PLAN (₹4,999/month or $59.99/month):
# - Upload repositories up to 500MB
# - All Developer plan features
# - Advanced codebase visualization
# - Unlimited chatbot interactions
# - Team collaboration features
# - Custom diagram generation
# - Up to 20 project sessions
# - Priority support

# ENTERPRISE PLAN (Custom pricing):
# - Unlimited repository size
# - All Team plan features
# - On-premises deployment options
# - Custom integration with your workflow
# - Dedicated support representative
# - Advanced security features
# - Single sign-on (SSO) support
# - Custom reporting

# ALL PAID PLANS INCLUDE:
# - 14-day free trial
# - No credit card required for trial
# - Monthly or annual billing (15% discount for annual)

# EDUCATIONAL DISCOUNT:
# - 40% off for students and educational institutions

# For enterprise inquiries or custom requirements, please contact our sales team at sales@vizcoassist.com
# """

# # Code Summary Usage Information
# CODE_SUMMARY_USAGE = """
# # Code Summary Service

# The Code Summary feature provides detailed insights into your codebase structure and functionality, making it easier to understand complex projects without having to read through every line of code.

# ## WHAT IT DOES:

# Our advanced AI analyzes your codebase to generate:

# 1. **Overall Project Summary**: A comprehensive overview of your entire project that explains:
#    - Main purpose and functionality of the codebase
#    - Key components and their relationships
#    - Architectural patterns and design principles used
#    - Entry points and core execution flows

# 2. **Individual File Summaries**: Detailed explanations of each file including:
#    - File purpose and role in the larger system
#    - Key classes, functions, and methods
#    - Dependencies and relationships with other files
#    - Complex algorithms or business logic explained in plain language

# ## HOW TO USE:

# 1. **Upload Your Code**:
#    - From the dashboard, click on 'Upload Codebase'
#    - Choose either ZIP file upload or GitHub repository link
#    - Wait for the processing to complete (typically 1-5 minutes depending on codebase size)

# 2. **View Project Summary**:
#    - Once processing is complete, navigate to the 'Summary' tab
#    - The overall project summary appears at the top of the page
#    - You can bookmark important findings or export the summary as PDF/Markdown

# 3. **Explore File Summaries**:
#    - Scroll down to see the list of all analyzed files
#    - Click on any file to view its detailed summary
#    - Use the search function to find specific files
#    - Files are organized by directory structure for easy navigation

# 4. **Integration with Other Features**:
#    - Click on 'View Architecture' from any summary to see related diagrams
#    - Use 'Ask Chatbot' to inquire about specific parts mentioned in summaries
#    - Follow links to tech stack analysis for technologies mentioned

# ## BEST PRACTICES:

# - For large monorepos, consider analyzing specific directories separately
# - Use file summaries to onboard new team members to unfamiliar code
# - Compare summaries before and after major refactoring to document changes
# - Share summaries with product and design teams to improve cross-functional understanding

# Our code summary feature uses advanced large language models trained specifically on code analysis to provide intelligent and contextually aware summaries that go beyond simple documentation extraction.
# """

# # Architecture Analysis Usage Information
# ARCHITECTURE_ANALYSIS_USAGE = """
# # Architecture Analysis Service

# The Architecture Analysis service visualizes your codebase structure through interactive diagrams, making it easier to understand component relationships and system design.

# ## WHAT IT DOES:

# Our architecture analysis creates multiple visualization levels:

# 1. **High-Level Architecture Diagrams**:
#    - Shows major system components and their interactions
#    - Identifies architectural patterns (MVC, microservices, etc.)
#    - Visualizes data flow between main components
#    - Highlights external dependencies and integrations
#    - Provides an executive-level view of the system

# 2. **Component-Level Architecture Diagrams**:
#    - Detailed view of how components are structured
#    - Shows class/module relationships and hierarchies
#    - Visualizes inheritance patterns and composition
#    - Maps out key interfaces and their implementations
#    - Identifies dependency patterns and potential coupling issues

# ## HOW TO USE:

# 1. **Generate Diagrams**:
#    - After uploading your codebase, click on 'View Diagrams' in the dashboard
#    - If diagrams haven't been generated yet, click 'Generate Architecture Diagrams'
#    - Choose between high-level or component-level visualization
#    - Wait for the diagram generation to complete

# 2. **Interact with Diagrams**:
#    - Click on any component to highlight its connections
#    - Hover over connections to see the nature of the relationship
#    - Use zoom and pan controls to navigate large diagrams
#    - Toggle visibility of different component types using the legend

# 3. **Customize and Share**:
#    - Adjust layout using the arrangement controls
#    - Apply different visualization themes
#    - Export diagrams as SVG, PNG, or interactive HTML
#    - Share directly with team members via link (paid plans only)

# 4. **Analyze Architecture**:
#    - Review the auto-generated architecture notes
#    - Identify potential architectural smells or anti-patterns
#    - See suggestions for architectural improvements
#    - Compare with common architecture patterns

# ## DIAGRAM TYPES:

# - **Package Diagrams**: Show dependencies between packages/modules
# - **Class Diagrams**: Display class relationships and inheritance
# - **Component Diagrams**: Visualize higher-level components and their interfaces
# - **Sequence Diagrams**: For key processes and user flows (Professional plan and above)
# - **Layered Architecture View**: Organize components by their logical layers

# ## BEST PRACTICES:

# - Generate fresh diagrams after significant refactoring
# - Use high-level diagrams for stakeholder communication
# - Use component-level diagrams for developer onboarding
# - Add diagrams to your documentation repositories
# - Review diagrams periodically to identify architecture drift

# Our architecture visualization tool uses Mermaid format for maximum compatibility and can be easily embedded in documentation systems like Confluence, Notion, or GitHub wikis.
# """

# # Tech Stack Analysis Usage Information
# TECH_STACK_ANALYSIS_USAGE = """
# # Tech Stack Analysis Service

# The Tech Stack Analysis service identifies all technologies, frameworks, and libraries used in your codebase, providing insights into your technical dependencies and helping you make informed decisions about your technology choices.

# ## WHAT IT DOES:

# Our tech stack analyzer performs a comprehensive scan of your codebase to generate:

# 1. **Technology Inventory**:
#    - Complete list of programming languages used, with percentage breakdown
#    - All frameworks and libraries with their versions
#    - Database technologies and ORM layers
#    - Frontend technologies (UI frameworks, state management, etc.)
#    - Build tools and deployment configurations
#    - Testing frameworks and utilities

# 2. **Dependency Analysis**:
#    - Identifies outdated dependencies
#    - Highlights potential security vulnerabilities
#    - Shows dependency relationships and impact
#    - Suggests updates or alternatives where appropriate

# 3. **Technology Map**:
#    - Visual representation of your tech stack
#    - Categorization by layer (frontend, backend, data, infrastructure)
#    - Identification of core vs. peripheral technologies
#    - Comparison with industry standard stacks

# ## HOW TO USE:

# 1. **Generate Tech Stack Analysis**:
#    - After uploading your codebase, navigate to 'View Tech Stack' in the dashboard
#    - If analysis hasn't been performed yet, it will automatically start
#    - Wait for the analysis to complete (typically 1-3 minutes)

# 2. **Explore the Results**:
#    - Review the language distribution chart
#    - Examine the categorized list of technologies
#    - Check the 'Insights' tab for recommendations and observations
#    - Use filters to focus on specific technology categories

# 3. **Detailed Technology View**:
#    - Click on any technology to see where and how it's used
#    - View file-level breakdown of technology usage
#    - See compatibility information with other technologies
#    - Access documentation links and best practices

# 4. **Export and Share**:
#    - Download the complete tech stack report as PDF
#    - Export specific sections as CSV for further analysis
#    - Share analysis with team members via direct link (paid plans only)
#    - Compare with previous analyses to track tech stack evolution

# ## INSIGHTS PROVIDED:

# - **Modernization Opportunities**: Suggestions for updating legacy technologies
# - **Consistency Analysis**: Identification of multiple technologies serving the same purpose
# - **Complexity Assessment**: Evaluation of tech stack complexity and learning curve
# - **Performance Impact**: Insights into how technology choices may affect performance
# - **Maintainability Score**: Assessment of long-term maintainability based on technology choices

# ## BEST PRACTICES:

# - Run tech stack analysis quarterly to keep track of evolving dependencies
# - Share analysis with new team members during onboarding
# - Use insights to inform architectural decisions and refactoring efforts
# - Include tech stack reports in technical documentation
# - Reference analysis during planning sessions for new features or migrations

# Our tech stack analyzer continuously updates its technology database to stay current with the rapidly evolving software ecosystem.
# """

# # Codebase Overview Usage Information
# CODEBASE_OVERVIEW_USAGE = """
# # Codebase Overview Chatbot

# The Codebase Overview Chatbot allows you to have natural language conversations about your code, making it easy to understand complex codebases without having to manually search through files.

# ## WHAT IT DOES:

# Our AI-powered chatbot:

# 1. **Answers Questions About Your Code**:
#    - Explains what specific functions or classes do
#    - Describes how different components interact
#    - Clarifies complex algorithms or business logic
#    - Helps trace execution flows and data transformations
#    - Identifies entry points and key architectural patterns

# 2. **Assists With Navigation**:
#    - Helps you find where specific functionality is implemented
#    - Points you to relevant files for particular features
#    - Identifies dependencies and related components
#    - Tracks data flow through the system

# 3. **Provides Context and Explanations**:
#    - Explains why certain design decisions were made
#    - Clarifies complex or obscure code patterns
#    - Translates domain-specific logic into plain language
#    - Offers historical context based on code evolution

# ## HOW TO USE:

# 1. **Initialize the Chatbot**:
#    - After uploading your codebase, navigate to the 'Chat with Codebase' section
#    - If not already initialized, the system will prepare the chatbot
#    - This involves analyzing your codebase and may take a few minutes depending on size

# 2. **Ask Questions**:
#    - Type natural language questions in the chat interface
#    - Be specific about what you want to know
#    - You can reference specific files, functions, or components
#    - Ask follow-up questions for more details

# 3. **Effective Question Examples**:
#    - How does user authentication work in this codebase?
#    - What happens when a new order is created?
#    - Where is the database schema defined?
#    - Explain the algorithm in the recommendation engine

# 4. **Advanced Features**:
#    - Request code snippets with `Show me the code for...`
#    - Get file structure explanations with `Explain the structure of...`
#    - Compare components with `Compare ... and ... components`
#    - Find usages with `Where is ... used in the codebase?`

# ## BEST PRACTICES:

# - Start with broad questions, then narrow down with specifics
# - Reference specific file names or class names when possible
# - Ask one question at a time for the most accurate responses
# - Use the chat history to build context for complex inquiries
# - Save important conversations for future reference

# ## LIMITATIONS:

# - The chatbot can only analyze code that was included in your upload
# - Very recent changes to your local code wont be reflected until you re-upload
# - While comprehensive, the chatbot may not capture every nuance of highly complex codebases
# - For extremely large codebases, responses may take slightly longer

# Our codebase chatbot leverages advanced semantic code understanding models to provide context-aware responses that go beyond simple keyword matching or documentation lookups.
# """

# # API Details - For developer use only
# API_DETAILS = """
# # VizCoAssist API Documentation

# ## Upload Endpoints

# ### POST /upload
# Upload a ZIP file containing a codebase
# - Parameters: file (multipart/form-data)
# - Returns: session_id and upload status

# ### POST /upload/github
# Clone and analyze a GitHub repository
# - Parameters: github_url (form)
# - Returns: session_id and download status

# ## Session Management

# ### GET /sessions/{session_id}/status
# Check the status of a processing session
# - Parameters: session_id (path)
# - Returns: current processing status

# ### GET /sessions/{session_id}/data
# Get all data associated with a session
# - Parameters: session_id (path)
# - Returns: complete session data including directories, processed files, diagrams, and summaries

# ## Code Summary

# ### GET /sessions/{session_id}/summary
# Get the overall codebase summary
# - Parameters: session_id (path)
# - Returns: comprehensive summary of the codebase

# ### GET /sessions/{session_id}/filesummary
# Get summary for a specific file
# - Parameters: session_id (path), file_path (query)
# - Returns: detailed summary of the specified file

# ### GET /sessions/{session_id}/getfilesaccessed
# List all processed files
# - Parameters: session_id (path)
# - Returns: array of all processed file paths

# ## Architecture Analysis

# ### POST /sessions/{session_id}/generatearchitecture
# Generate architecture diagrams
# - Parameters: session_id (path), diagram_type (query, default: 'mermaid')
# - Returns: confirmation that diagram generation has started

# ## Tech Stack Analysis

# ### GET /sessions/{session_id}/techstack
# Get a complete tech stack analysis
# - Parameters: session_id (path), force_refresh (query, optional)
# - Returns: detailed breakdown of languages, frameworks, and technologies used

# ### GET /sessions/{session_id}/filetechstack
# Get tech stack analysis for a specific file
# - Parameters: session_id (path), file_path (query)
# - Returns: technologies used in the specified file

# ### GET /sessions/{session_id}/techstack/progress
# Check progress of tech stack analysis
# - Parameters: session_id (path)
# - Returns: current progress percentage and status

# ## Codebase Chatbot

# ### POST /sessions/{session_id}/chatbot/initialize
# Initialize the codebase chatbot
# - Parameters: session_id (path)
# - Returns: initialization status and estimated completion time

# ### GET /sessions/{session_id}/chatbot/initialize/progress
# Check chatbot initialization progress
# - Parameters: session_id (path)
# - Returns: detailed progress information and current step

# ### POST /sessions/{session_id}/chatbot/query
# Ask a question about the codebase
# - Parameters: session_id (path), query (form)
# - Returns: AI-generated response to the query

# ### GET /sessions/{session_id}/chatbot/history
# Get the chat history for a session
# - Parameters: session_id (path)
# - Returns: array of previous queries and responses with timestamps
# """

# def get_openai_response(prompt, model="gpt-4-turbo", max_tokens=1000):
#     """Generate a response using OpenAI API"""
#     try:
#         response = openai.chat.completions.create(
#             model=model,
#             messages=[{"role": "system", "content": prompt}],
#             max_tokens=max_tokens,
#         )
#         return response.choices[0].message.content
#     except Exception as e:
#         print(f"Error calling OpenAI API: {str(e)}")
#         return "Error generating response. Please try again later."

# @app.route('/service_usage', methods=['POST'])
# def service_usage():
#     """Endpoint for questions about how to use a specific service"""
#     data = request.json
#     service = data.get('service')
#     question = data.get('question')
    
#     if not service or not question:
#         return jsonify({"error": "Both service and question are required"}), 400
    
#     # Select the appropriate service usage information
#     service_info = ""
#     if service.lower() == "code_summary":
#         service_info = CODE_SUMMARY_USAGE
#     elif service.lower() == "architecture_analysis":
#         service_info = ARCHITECTURE_ANALYSIS_USAGE
#     elif service.lower() == "tech_stack_analysis":
#         service_info = TECH_STACK_ANALYSIS_USAGE
#     elif service.lower() == "codebase_overview":
#         service_info = CODEBASE_OVERVIEW_USAGE
#     else:
#         return jsonify({"error": "Unknown service"}), 400
    
#     prompt = f"""
#     You are a helpful customer service representative for VizCoAssist, a code analysis tool company. 
#     Answer the following question about how to use our "{service}" feature based on this information within 5 to 7 lines not more than that:
    
#     SERVICE INFO : {service_info}
    
#     User question: {question}
    
#     Provide a clear, helpful response that explains how to use the feature.
#     Be conversational and friendly, as if you're talking to the user directly.
#     If the question is outside the scope of how to use this specific feature, 
#     gently redirect them while providing some helpful information about the feature.
#     """
    
#     response = get_openai_response(prompt)
    
#     return jsonify({
#         "response": response
#     })

# @app.route('/pricing_info', methods=['POST'])
# def pricing_info():
#     """Endpoint for questions about pricing"""
#     data = request.json
#     question = data.get('question')
    
#     if not question:
#         return jsonify({"error": "Question is required"}), 400
    
#     prompt = f"""
#     You are a customer service representative for VizCoAssist, a code analysis tool company. 
#     Answer the following question about our pricing based on this information within 5 to 7 lines not more than that:
    
#     PRICING INFO : {PRICING_INFO}
    
#     User question: {question}
    
#     Provide a clear, helpful response about our pricing options.
#     Be conversational and friendly, as if you're talking to the user directly.
#     """
    
#     response = get_openai_response(prompt)
    
#     return jsonify({
#         "response": response
#     })

# @app.route('/company_info', methods=['POST'])
# def company_info():
#     """Endpoint for questions about the company"""
#     data = request.json
#     question = data.get('question')
    
#     if not question:
#         return jsonify({"error": "Question is required"}), 400
    
#     prompt = f"""
#     You are a customer service representative for VizCoAssist, a code analysis tool company. 
#     Answer the following question about our company based on this information within 5 to 7 lines not more than that:
    
#     COPANY DETAILS : {COMPANY_INFO}
    
#     User Query: {question}
    
#     Provide a clear, helpful response about our company.
#     Be conversational and friendly, as if you're talking to the user directly.
#     """
    
#     response = get_openai_response(prompt)
    
#     return jsonify({
#         "response": response
#     })

# @app.route('/handle_irrelevant', methods=['POST'])
# def handle_irrelevant():
#     """Endpoint for handling irrelevant or general queries"""
#     data = request.json
#     query = data.get('query')
    
#     if not query:
#         return jsonify({"error": "Query is required"}), 400
    
#     prompt = f"""
#     You are a customer service representative for VizCoAssist, a code analysis tool company.
#     The user has asked a question that might not be specifically about one of our services within 5 to 7 lines not more than that:
    
#     Our services include:
#     1. Code Summary - Generating summaries of codebases
#     2. Architecture Analysis - Analyzing software architecture
#     3. Tech Stack Analysis - Evaluating technology stacks
#     4. Codebase Overview - Interactive exploration of codebases
    
#     We also provide information about our pricing plans and company details.
    
#     User query: {query}
    
#     If the query is related to our services, provide a helpful overview and suggest which specific 
#     service they might want to learn more about.
    
#     If the query is completely unrelated to our services, politely explain that we specialize in 
#     code analysis services and mention our main features.
    
#     Be conversational and friendly, as if you're talking to the user directly.
#     """
    
#     response = get_openai_response(prompt)
    
#     return jsonify({
#         "response": response
#     })

# @app.route('/api_details', methods=['POST'])
# def api_details():
#     """Endpoint for developer queries about API details"""
#     data = request.json
#     question = data.get('question')
    
#     if not question:
#         return jsonify({"error": "Question is required"}), 400
    
#     prompt = f"""
#     You are a technical support representative for VizCoAssist, a code analysis tool company.
#     Answer the following question about our API based on this documentation within 5 to 7 lines not more than that:
    
#     {API_DETAILS}
    
#     Developer question: {question}
    
#     Provide a detailed and technical response that helps the developer understand our API.
#     Only provide this information if it appears to be a legitimate developer query.
#     """
    
#     response = get_openai_response(prompt)
    
#     return jsonify({
#         "response": response
#     })

# @app.route('/health', methods=['GET'])
# def health_check():
#     return jsonify({"status": "ok"})

# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', port=5000)
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv
import openai
import asyncio
from cachetools import TTLCache

# Load environment variables
load_dotenv()

app = FastAPI(title="VizCoAssist API", description="Service for explaining and analyzing codebases")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")

# Simple in-memory cache with TTL
response_cache = TTLCache(maxsize=100, ttl=3600)  # Cache for 1 hour

# Company Information
COMPANY_INFO = """
VizCoAssist is a cutting-edge code analysis platform that helps developers understand complex codebases through visualization, summarization, and interactive exploration.

COMPANY DETAILS:
- Founded: 2023
- Headquarters: Bangalore, India
- Mission: To make understanding codebases simple, intuitive, and accessible for all developers

CONTACT INFORMATION:
- Phone: +91 866-770-5875
- Email: karthikeyanmjnk13579@gmail.com
- Address: 123 Tech Park, Electronic City Phase 1, Bangalore - 560100, India
- Support Hours: Monday-Friday, 9am-6pm IST

LEADERSHIP:
- Karthikeyan M, Founder & CEO
- Development Team of highly skilled engineers with expertise in code analysis and AI technologies

Follow us on social media:
- Twitter: @VizCoAssist
- LinkedIn: linkedin.com/company/vizcoassist
- GitHub: github.com/vizcoassist
"""

# Pricing Information
PRICING_INFO = """
VizCoAssist offers flexible pricing plans designed to meet the needs of individual developers, teams, and enterprises:

PAY-AS-YOU-GO PLAN:
- No monthly commitment
- Only pay for what you use
- $0.05 per file analyzed
- Basic code summary
- High-level architecture diagram
- Basic tech stack analysis
- Pay with credit/debit card or account credits

STARTER PLAN (Free):
- Upload repositories up to 50MB
- Basic code summary
- High-level architecture diagram
- Limited tech stack analysis
- 10 chatbot interactions per project

DEVELOPER PLAN (₹999/month or $12.99/month):
- Upload repositories up to 200MB
- Comprehensive code summary
- High-level and component-level architecture diagrams
- Detailed tech stack analysis
- 100 chatbot interactions per project
- Export diagrams and summaries
- Up to 5 project sessions

TEAM PLAN (₹4,999/month or $59.99/month):
- Upload repositories up to 500MB
- All Developer plan features
- Advanced codebase visualization
- Unlimited chatbot interactions
- Team collaboration features
- Custom diagram generation
- Up to 20 project sessions
- Priority support

ENTERPRISE PLAN (Custom pricing):
- Unlimited repository size
- All Team plan features
- On-premises deployment options
- Custom integration with your workflow
- Dedicated support representative
- Advanced security features
- Single sign-on (SSO) support
- Custom reporting

ALL PAID PLANS INCLUDE:
- 14-day free trial
- No credit card required for trial
- Monthly or annual billing (15% discount for annual)

EDUCATIONAL DISCOUNT:
- 40% off for students and educational institutions

For enterprise inquiries or custom requirements, please contact our sales team at sales@vizcoassist.com
"""

# Code Summary Usage Information
CODE_SUMMARY_USAGE = """
# Code Summary Service

The Code Summary feature provides detailed insights into your codebase structure and functionality, making it easier to understand complex projects without having to read through every line of code.

## WHAT IT DOES:

Our advanced AI analyzes your codebase to generate:

1. **Overall Project Summary**: A comprehensive overview of your entire project that explains:
   - Main purpose and functionality of the codebase
   - Key components and their relationships
   - Architectural patterns and design principles used
   - Entry points and core execution flows

2. **Individual File Summaries**: Detailed explanations of each file including:
   - File purpose and role in the larger system
   - Key classes, functions, and methods
   - Dependencies and relationships with other files
   - Complex algorithms or business logic explained in plain language

## HOW TO USE:

1. **Upload Your Code**:
   - From the dashboard, click on 'Upload Codebase'
   - Choose either ZIP file upload or GitHub repository link
   - Wait for the processing to complete (typically 1-5 minutes depending on codebase size)

2. **View Project Summary**:
   - Once processing is complete, navigate to the 'Summary' tab
   - The overall project summary appears at the top of the page
   - You can bookmark important findings or export the summary as PDF/Markdown

3. **Explore File Summaries**:
   - Scroll down to see the list of all analyzed files
   - Click on any file to view its detailed summary
   - Use the search function to find specific files
   - Files are organized by directory structure for easy navigation

4. **Integration with Other Features**:
   - Click on 'View Architecture' from any summary to see related diagrams
   - Use 'Ask Chatbot' to inquire about specific parts mentioned in summaries
   - Follow links to tech stack analysis for technologies mentioned

## BEST PRACTICES:

- For large monorepos, consider analyzing specific directories separately
- Use file summaries to onboard new team members to unfamiliar code
- Compare summaries before and after major refactoring to document changes
- Share summaries with product and design teams to improve cross-functional understanding

Our code summary feature uses advanced large language models trained specifically on code analysis to provide intelligent and contextually aware summaries that go beyond simple documentation extraction.
"""

# Architecture Analysis Usage Information
ARCHITECTURE_ANALYSIS_USAGE = """
# Architecture Analysis Service

The Architecture Analysis service visualizes your codebase structure through interactive diagrams, making it easier to understand component relationships and system design.

## WHAT IT DOES:

Our architecture analysis creates multiple visualization levels:

1. **High-Level Architecture Diagrams**:
   - Shows major system components and their interactions
   - Identifies architectural patterns (MVC, microservices, etc.)
   - Visualizes data flow between main components
   - Highlights external dependencies and integrations
   - Provides an executive-level view of the system

2. **Component-Level Architecture Diagrams**:
   - Detailed view of how components are structured
   - Shows class/module relationships and hierarchies
   - Visualizes inheritance patterns and composition
   - Maps out key interfaces and their implementations
   - Identifies dependency patterns and potential coupling issues

## HOW TO USE:

1. **Generate Diagrams**:
   - After uploading your codebase, click on 'View Diagrams' in the dashboard
   - If diagrams haven't been generated yet, click 'Generate Architecture Diagrams'
   - Choose between high-level or component-level visualization
   - Wait for the diagram generation to complete

2. **Interact with Diagrams**:
   - Click on any component to highlight its connections
   - Hover over connections to see the nature of the relationship
   - Use zoom and pan controls to navigate large diagrams
   - Toggle visibility of different component types using the legend

3. **Customize and Share**:
   - Adjust layout using the arrangement controls
   - Apply different visualization themes
   - Export diagrams as SVG, PNG, or interactive HTML
   - Share directly with team members via link (paid plans only)

4. **Analyze Architecture**:
   - Review the auto-generated architecture notes
   - Identify potential architectural smells or anti-patterns
   - See suggestions for architectural improvements
   - Compare with common architecture patterns

## DIAGRAM TYPES:

- **Package Diagrams**: Show dependencies between packages/modules
- **Class Diagrams**: Display class relationships and inheritance
- **Component Diagrams**: Visualize higher-level components and their interfaces
- **Sequence Diagrams**: For key processes and user flows (Professional plan and above)
- **Layered Architecture View**: Organize components by their logical layers

## BEST PRACTICES:

- Generate fresh diagrams after significant refactoring
- Use high-level diagrams for stakeholder communication
- Use component-level diagrams for developer onboarding
- Add diagrams to your documentation repositories
- Review diagrams periodically to identify architecture drift

Our architecture visualization tool uses Mermaid format for maximum compatibility and can be easily embedded in documentation systems like Confluence, Notion, or GitHub wikis.
"""

# Tech Stack Analysis Usage Information
TECH_STACK_ANALYSIS_USAGE = """
# Tech Stack Analysis Service

The Tech Stack Analysis service identifies all technologies, frameworks, and libraries used in your codebase, providing insights into your technical dependencies and helping you make informed decisions about your technology choices.

## WHAT IT DOES:

Our tech stack analyzer performs a comprehensive scan of your codebase to generate:

1. **Technology Inventory**:
   - Complete list of programming languages used, with percentage breakdown
   - All frameworks and libraries with their versions
   - Database technologies and ORM layers
   - Frontend technologies (UI frameworks, state management, etc.)
   - Build tools and deployment configurations
   - Testing frameworks and utilities

2. **Dependency Analysis**:
   - Identifies outdated dependencies
   - Highlights potential security vulnerabilities
   - Shows dependency relationships and impact
   - Suggests updates or alternatives where appropriate

3. **Technology Map**:
   - Visual representation of your tech stack
   - Categorization by layer (frontend, backend, data, infrastructure)
   - Identification of core vs. peripheral technologies
   - Comparison with industry standard stacks

## HOW TO USE:

1. **Generate Tech Stack Analysis**:
   - After uploading your codebase, navigate to 'View Tech Stack' in the dashboard
   - If analysis hasn't been performed yet, it will automatically start
   - Wait for the analysis to complete (typically 1-3 minutes)

2. **Explore the Results**:
   - Review the language distribution chart
   - Examine the categorized list of technologies
   - Check the 'Insights' tab for recommendations and observations
   - Use filters to focus on specific technology categories

3. **Detailed Technology View**:
   - Click on any technology to see where and how it's used
   - View file-level breakdown of technology usage
   - See compatibility information with other technologies
   - Access documentation links and best practices

4. **Export and Share**:
   - Download the complete tech stack report as PDF
   - Export specific sections as CSV for further analysis
   - Share analysis with team members via direct link (paid plans only)
   - Compare with previous analyses to track tech stack evolution

## INSIGHTS PROVIDED:

- **Modernization Opportunities**: Suggestions for updating legacy technologies
- **Consistency Analysis**: Identification of multiple technologies serving the same purpose
- **Complexity Assessment**: Evaluation of tech stack complexity and learning curve
- **Performance Impact**: Insights into how technology choices may affect performance
- **Maintainability Score**: Assessment of long-term maintainability based on technology choices

## BEST PRACTICES:

- Run tech stack analysis quarterly to keep track of evolving dependencies
- Share analysis with new team members during onboarding
- Use insights to inform architectural decisions and refactoring efforts
- Include tech stack reports in technical documentation
- Reference analysis during planning sessions for new features or migrations

Our tech stack analyzer continuously updates its technology database to stay current with the rapidly evolving software ecosystem.
"""

# Codebase Overview Usage Information
CODEBASE_OVERVIEW_USAGE = """
# Codebase Overview Chatbot

The Codebase Overview Chatbot allows you to have natural language conversations about your code, making it easy to understand complex codebases without having to manually search through files.

## WHAT IT DOES:

Our AI-powered chatbot:

1. **Answers Questions About Your Code**:
   - Explains what specific functions or classes do
   - Describes how different components interact
   - Clarifies complex algorithms or business logic
   - Helps trace execution flows and data transformations
   - Identifies entry points and key architectural patterns

2. **Assists With Navigation**:
   - Helps you find where specific functionality is implemented
   - Points you to relevant files for particular features
   - Identifies dependencies and related components
   - Tracks data flow through the system

3. **Provides Context and Explanations**:
   - Explains why certain design decisions were made
   - Clarifies complex or obscure code patterns
   - Translates domain-specific logic into plain language
   - Offers historical context based on code evolution

## HOW TO USE:

1. **Initialize the Chatbot**:
   - After uploading your codebase, navigate to the 'Chat with Codebase' section
   - If not already initialized, the system will prepare the chatbot
   - This involves analyzing your codebase and may take a few minutes depending on size

2. **Ask Questions**:
   - Type natural language questions in the chat interface
   - Be specific about what you want to know
   - You can reference specific files, functions, or components
   - Ask follow-up questions for more details

3. **Effective Question Examples**:
   - How does user authentication work in this codebase?
   - What happens when a new order is created?
   - Where is the database schema defined?
   - Explain the algorithm in the recommendation engine

4. **Advanced Features**:
   - Request code snippets with `Show me the code for...`
   - Get file structure explanations with `Explain the structure of...`
   - Compare components with `Compare ... and ... components`
   - Find usages with `Where is ... used in the codebase?`

## BEST PRACTICES:

- Start with broad questions, then narrow down with specifics
- Reference specific file names or class names when possible
- Ask one question at a time for the most accurate responses
- Use the chat history to build context for complex inquiries
- Save important conversations for future reference

## LIMITATIONS:

- The chatbot can only analyze code that was included in your upload
- Very recent changes to your local code wont be reflected until you re-upload
- While comprehensive, the chatbot may not capture every nuance of highly complex codebases
- For extremely large codebases, responses may take slightly longer

Our codebase chatbot leverages advanced semantic code understanding models to provide context-aware responses that go beyond simple keyword matching or documentation lookups.
"""

# API Details - For developer use only
API_DETAILS = """
# VizCoAssist API Documentation

## Upload Endpoints

### POST /upload
Upload a ZIP file containing a codebase
- Parameters: file (multipart/form-data)
- Returns: session_id and upload status

### POST /upload/github
Clone and analyze a GitHub repository
- Parameters: github_url (form)
- Returns: session_id and download status

## Session Management

### GET /sessions/{session_id}/status
Check the status of a processing session
- Parameters: session_id (path)
- Returns: current processing status

### GET /sessions/{session_id}/data
Get all data associated with a session
- Parameters: session_id (path)
- Returns: complete session data including directories, processed files, diagrams, and summaries

## Code Summary

### GET /sessions/{session_id}/summary
Get the overall codebase summary
- Parameters: session_id (path)
- Returns: comprehensive summary of the codebase

### GET /sessions/{session_id}/filesummary
Get summary for a specific file
- Parameters: session_id (path), file_path (query)
- Returns: detailed summary of the specified file

### GET /sessions/{session_id}/getfilesaccessed
List all processed files
- Parameters: session_id (path)
- Returns: array of all processed file paths

## Architecture Analysis

### POST /sessions/{session_id}/generatearchitecture
Generate architecture diagrams
- Parameters: session_id (path), diagram_type (query, default: 'mermaid')
- Returns: confirmation that diagram generation has started

## Tech Stack Analysis

### GET /sessions/{session_id}/techstack
Get a complete tech stack analysis
- Parameters: session_id (path), force_refresh (query, optional)
- Returns: detailed breakdown of languages, frameworks, and technologies used

### GET /sessions/{session_id}/filetechstack
Get tech stack analysis for a specific file
- Parameters: session_id (path), file_path (query)
- Returns: technologies used in the specified file

### GET /sessions/{session_id}/techstack/progress
Check progress of tech stack analysis
- Parameters: session_id (path)
- Returns: current progress percentage and status

## Codebase Chatbot

### POST /sessions/{session_id}/chatbot/initialize
Initialize the codebase chatbot
- Parameters: session_id (path)
- Returns: initialization status and estimated completion time

### GET /sessions/{session_id}/chatbot/initialize/progress
Check chatbot initialization progress
- Parameters: session_id (path)
- Returns: detailed progress information and current step

### POST /sessions/{session_id}/chatbot/query
Ask a question about the codebase
- Parameters: session_id (path), query (form)
- Returns: AI-generated response to the query

### GET /sessions/{session_id}/chatbot/history
Get the chat history for a session
- Parameters: session_id (path)
- Returns: array of previous queries and responses with timestamps
"""

# Pydantic models for request validation
class QuestionRequest(BaseModel):
    question: str

class ServiceRequest(BaseModel):
    service: str
    question: str

class QueryRequest(BaseModel):
    query: str

def get_cached_response(cache_key):
    """Get cached response or None"""
    return response_cache.get(cache_key)

def cache_response(cache_key, response):
    """Cache a response"""
    response_cache[cache_key] = response

async def get_openai_response(prompt, model="gpt-3.5-turbo", max_tokens=1000):
    """Generate a response using OpenAI API asynchronously with caching"""
    # Create a cache key
    cache_key = f"{prompt}_{model}_{max_tokens}"
    
    # Check cache first
    cached = get_cached_response(cache_key)
    if cached:
        return cached
    
    try:
        # Determine model based on prompt length/complexity
        selected_model = model
        if len(prompt) < 1000 and model == "gpt-4-turbo":
            selected_model = "gpt-3.5-turbo"  # Use faster model for simpler queries
        
        # Convert synchronous OpenAI call to asynchronous using a thread pool
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: openai.chat.completions.create(
                model=selected_model,
                messages=[{"role": "system", "content": prompt}],
                max_tokens=max_tokens
            )
        )
        
        result = response.choices[0].message.content
        
        # Cache the result
        cache_response(cache_key, result)
        
        return result
    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        return "Error generating response. Please try again later."

@app.post("/service_usage")
async def service_usage(request: ServiceRequest):
    """Endpoint for questions about how to use a specific service"""
    service = request.service
    question = request.question
    
    # Select the appropriate service usage information
    service_info = ""
    if service.lower() == "code_summary":
        service_info = CODE_SUMMARY_USAGE
    elif service.lower() == "architecture_analysis":
        service_info = ARCHITECTURE_ANALYSIS_USAGE
    elif service.lower() == "tech_stack_analysis":
        service_info = TECH_STACK_ANALYSIS_USAGE
    elif service.lower() == "codebase_overview":
        service_info = CODEBASE_OVERVIEW_USAGE
    else:
        raise HTTPException(status_code=400, detail="Unknown service")
    
    prompt = f"""
    You are a helpful customer service representative for VizCoAssist, a code analysis tool company. 
    Answer the following question about how to use our "{service}" feature based on this information:
    
    {service_info}
    
    User question: {question}
    
    Provide a clear, helpful response that explains how to use the feature.
    Maximum allowed response content is only 5 lines not more than that. Strictly adhere to this context length.
    Be conversational and friendly, as if you're talking to the user directly.
    If the question is outside the scope of how to use this specific feature, 
    gently redirect them while providing some helpful information about the feature.
    """
    
    response = await get_openai_response(prompt)
    
    return {"response": response}

@app.post("/pricing_info")
async def pricing_info(request: QuestionRequest):
    """Endpoint for questions about pricing"""
    question = request.question
    
    prompt = f"""
    You are a customer service representative for VizCoAssist, a code analysis tool company. 
    Answer the following question about our pricing based on this information:
    
    {PRICING_INFO}
    
    User question: {question}
    
    Provide a clear, helpful response about our pricing options.
    Maximum allowed response content is only 5 lines not more than that. Strictly adhere to this context length.
    Be conversational and friendly, as if you're talking to the user directly.
    """
    
    response = await get_openai_response(prompt)
    
    return {"response": response}

@app.post("/company_info")
async def company_info(request: QuestionRequest):
    """Endpoint for questions about the company"""
    question = request.question
    
    prompt = f"""
    You are a customer service representative for VizCoAssist, a code analysis tool company. 
    Answer the following question about our company based on this information:
    
    {COMPANY_INFO}
    
    User question: {question}
    
    Provide a clear, helpful response about our company.
    Maximum allowed response content is only 5 lines not more than that. Strictly adhere to this context length.
    Be conversational and friendly, as if you're talking to the user directly.
    """
    
    response = await get_openai_response(prompt)
    
    return {"response": response}

@app.post("/handle_irrelevant")
async def handle_irrelevant(request: QueryRequest):
    """Endpoint for handling irrelevant or general queries"""
    query = request.query
    
    prompt = f"""
    You are a customer service representative for VizCoAssist, a code analysis tool company.
    The user has asked a question that might not be specifically about one of our services.
    
    Our services include:
    1. Code Summary - Generating summaries of codebases
    2. Architecture Analysis - Analyzing software architecture
    3. Tech Stack Analysis - Evaluating technology stacks
    4. Codebase Overview - Interactive exploration of codebases
    
    We also provide information about our pricing plans and company details.
    
    
    User query: {query}
    
    If the query is related to our services, provide a helpful overview and suggest which specific 
    service they might want to learn more about.
    
    Maximum allowed response content is only 5 lines not more than that. Strictly adhere to this context length.

    If the query is completely unrelated to our services, politely explain that we specialize in 
    code analysis services and mention our main features.
    
    Be conversational and friendly, as if you're talking to the user directly.
    """
    
    response = await get_openai_response(prompt)
    
    return {"response": response}

@app.post("/api_details")
async def api_details(request: QuestionRequest):
    """Endpoint for developer queries about API details"""
    question = request.question
    
    prompt = f"""
    You are a technical support representative for VizCoAssist, a code analysis tool company.
    Answer the following question about our API based on this documentation:
    
    {API_DETAILS}
    
    Developer question: {question}
    
    Provide a detailed and technical response that helps the developer understand our API.
    Maximum allowed response content is only 5 lines not more than that. Strictly adhere to this context length.
    Only provide this information if it appears to be a legitimate developer query.
    """
    
    response = await get_openai_response(prompt)
    
    return {"response": response}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)