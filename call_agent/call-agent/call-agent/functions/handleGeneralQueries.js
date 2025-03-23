const axios = require('axios');

module.exports = async (args) => {
    try {
        const { query } = args;

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return "Welcome to CodeAnalytic AI! I can help you learn how to use our code analysis services. Ask me about our Code Summary, Architecture Analysis, Tech Stack Analysis, or Codebase Overview features.";
        }

        // Check for greetings
        const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening', 'good afternoon'];
        const lowerQuery = query.toLowerCase().trim();
        
        if (greetings.some(greeting => lowerQuery.includes(greeting))) {
            return "Hello! I'm your assistant for CodeAnalytic AI. I can help you understand how to use our code analysis tools. What would you like to know about?";
        }

        // Check if query is about a specific service
        const serviceKeywords = {
            "code_summary": ["summary", "summarize", "code summary", "summarizing code"],
            "architecture_analysis": ["architecture", "structure", "design", "diagram", "high level", "low level"],
            "tech_stack_analysis": ["tech stack", "technology", "technologies", "framework", "library", "language"],
            "codebase_overview": ["chatbot", "question", "ask", "explore", "interactive", "codebase overview"]
        };

        for (const [service, keywords] of Object.entries(serviceKeywords)) {
            if (keywords.some(keyword => lowerQuery.includes(keyword))) {
                const apiUrl = 'http://127.0.0.1:5000/service_usage';
                const response = await axios.post(apiUrl, { 
                    service: service,
                    question: query
                });
                
                if (response?.data?.response) {
                    return response.data.response;
                }
            }
        }

        // Check if query is about pricing
        const pricingKeywords = ["price", "pricing", "cost", "subscription", "plan", "payment", "discount"];
        if (pricingKeywords.some(keyword => lowerQuery.includes(keyword))) {
            const apiUrl = 'http://127.0.0.1:5000/pricing_info';
            const response = await axios.post(apiUrl, { question: query });
            
            if (response?.data?.response) {
                return response.data.response;
            }
        }

        // Check if query is about company info
        const companyKeywords = ["company", "team", "founder", "contact", "email", "phone", "address", "about you"];
        if (companyKeywords.some(keyword => lowerQuery.includes(keyword))) {
            const apiUrl = 'http://127.0.0.1:5000/company_info';
            const response = await axios.post(apiUrl, { question: query });
            
            if (response?.data?.response) {
                return response.data.response;
            }
        }

        // If no specific category was detected, use the general handler
        const apiUrl = 'http://127.0.0.1:5000/handle_irrelevant';
        const response = await axios.post(apiUrl, { query: query });
        
        if (response?.data?.response) {
            return response.data.response;
        }

        // Fallback response
        return "We offer four main services: Code Summary, Architecture Analysis, Tech Stack Analysis, and Codebase Overview. Each helps you understand different aspects of your codebase. Can you tell me which service you'd like to learn more about?";
    } catch (error) {
        console.error("Error in HandleGeneralQueries:", error.message);
        return "I'm having trouble connecting to our information service right now. I'm here to help you understand how to use our code analysis tools. Please try asking your question again later.";
    }
};