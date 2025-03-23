const axios = require('axios');

module.exports = async (args) => {
    try {
        const { query } = args;

        if (!query || typeof query !== 'string') {
            return "I can provide information about our company, including contact details, our mission, and our team. Please ask a specific question.";
        }

        const apiUrl = 'http://127.0.0.1:5000/company_info';
        const response = await axios.post(apiUrl, { question: query });
        
        if (response?.data?.response) {
            return response.data.response;
        }

        // Fallback response
        return "CodeAnalytic AI specializes in AI-powered code analysis tools. We were founded in 2023 and are headquartered in San Francisco. Our mission is to make codebases more accessible and understandable for all developers. For more specific information, please ask a detailed question.";
    } catch (error) {
        console.error("Error in CompanyInfoService:", error.message);
        return "I'm having trouble connecting to our information service right now. CodeAnalytic AI provides AI-powered code analysis tools to help developers understand and improve their codebases. Please try asking your specific question again later.";
    }
};