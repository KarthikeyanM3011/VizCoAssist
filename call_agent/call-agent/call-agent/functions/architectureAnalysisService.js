const axios = require('axios');

module.exports = async (args) => {
    try {
        const { query } = args;

        if (!query || typeof query !== 'string') {
            return "I can help you understand how to use our Architecture Analysis service. Please ask a specific question about this feature.";
        }

        const apiUrl = 'http://127.0.0.1:5000/service_usage';
        const response = await axios.post(apiUrl, { 
            service: "architecture_analysis",
            question: query
        });
        
        if (response?.data?.response) {
            return response.data.response;
        }

        // Fallback response
        return "Our Architecture Analysis feature helps you visualize and understand your software architecture. You can generate both high-level and low-level diagrams of your system. To get started, navigate to the 'Architecture Analysis' section in the dashboard and select your project. For more specific help, please ask a detailed question.";
    } catch (error) {
        console.error("Error in ArchitectureAnalysisService:", error.message);
        return "I'm having trouble connecting to our information service right now. The Architecture Analysis feature helps you visualize your software architecture at different levels of detail. Please try asking your specific question again later.";
    }
};