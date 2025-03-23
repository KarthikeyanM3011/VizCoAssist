const axios = require('axios');

module.exports = async (args) => {
    try {
        const { query } = args;

        if (!query || typeof query !== 'string') {
            return "I can help you understand how to use our Codebase Overview chatbot. Please ask a specific question about this feature.";
        }

        const apiUrl = 'http://127.0.0.1:5000/service_usage';
        const response = await axios.post(apiUrl, { 
            service: "codebase_overview",
            question: query
        });
        
        if (response?.data?.response) {
            return response.data.response;
        }

        // Fallback response
        return "Our Codebase Overview feature provides an interactive chatbot interface to explore and understand your codebase. You can ask questions about your code and receive AI-generated answers. To get started, navigate to the 'Codebase Overview' section in the dashboard, select your project, and start asking questions. For more specific help, please ask a detailed question.";
    } catch (error) {
        console.error("Error in CodebaseOverviewService:", error.message);
        return "I'm having trouble connecting to our information service right now. The Codebase Overview feature lets you ask questions about your code using a chatbot interface. Please try asking your specific question again later.";
    }
};