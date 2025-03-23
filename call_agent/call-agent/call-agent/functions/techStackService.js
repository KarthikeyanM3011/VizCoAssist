const axios = require('axios');

module.exports = async (args) => {
    try {
        const { query } = args;

        if (!query || typeof query !== 'string') {
            return "I can help you understand how to use our Tech Stack Analysis service. Please ask a specific question about this feature.";
        }

        const apiUrl = 'http://127.0.0.1:5000/service_usage';
        const response = await axios.post(apiUrl, { 
            service: "tech_stack_analysis",
            question: query
        });
        
        if (response?.data?.response) {
            return response.data.response;
        }

        // Fallback response
        return "Our Tech Stack Analysis feature helps you understand the technologies used in your project. It identifies frameworks, libraries, and tools along with version information and recommendations. To get started, navigate to the 'Tech Stack Analysis' section in the dashboard and select your project. For more specific help, please ask a detailed question.";
    } catch (error) {
        console.error("Error in TechStackService:", error.message);
        return "I'm having trouble connecting to our information service right now. The Tech Stack Analysis feature helps you identify and evaluate the technologies used in your project. Please try asking your specific question again later.";
    }
};