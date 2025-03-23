const axios = require('axios');

module.exports = async (args) => {
    try {
        const { query } = args;

        if (!query || typeof query !== 'string') {
            return "I can help you understand how to use our Code Summary service. Please ask a specific question about this feature.";
        }

        const apiUrl = 'http://127.0.0.1:5000/service_usage';
        const response = await axios.post(apiUrl, { 
            service: "code_summary",
            question: query
        });
        
        if (response?.data?.response) {
            return response.data.response;
        }

        // Fallback response
        return "Our Code Summary feature helps you understand your codebase quickly. You can generate summaries of your entire project or specific files. To get started, navigate to the 'Code Summary' section in the dashboard and select your project. For more specific help, please ask a detailed question.";
    } catch (error) {
        console.error("Error in CodeSummaryService:", error.message);
        return "I'm having trouble connecting to our information service right now. The Code Summary feature helps you generate summaries of your codebase. Please try asking your specific question again later.";
    }
};