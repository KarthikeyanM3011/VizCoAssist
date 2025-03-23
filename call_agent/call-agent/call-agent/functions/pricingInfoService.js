const axios = require('axios');

module.exports = async (args) => {
    try {
        const { query } = args;

        if (!query || typeof query !== 'string') {
            return "I can provide information about our pricing plans, including our pay-as-you-go options. Please ask a specific question.";
        }

        const apiUrl = 'http://127.0.0.1:5000/pricing_info';
        const response = await axios.post(apiUrl, { question: query });
        
        if (response?.data?.response) {
            return response.data.response;
        }

        // Fallback response with pay-as-you-go model
        return "VizCoAssist offers flexible pricing options including a pay-as-you-go model. With our pay-as-you-go plan, you only pay for what you use - $0.05 per file analyzed, with no monthly commitments. We also offer subscription plans: Basic ($49/month), Professional ($149/month), and Enterprise (custom pricing). All plans include a 14-day free trial. For more details about specific features or pricing options, please ask a more specific question.";
    } catch (error) {
        console.error("Error in PricingInfoService:", error.message);
        return "I'm having trouble connecting to our information service right now. We offer both pay-as-you-go pricing and monthly subscription plans starting at $49/month. All plans include a 14-day free trial. Please try asking your specific question again later.";
    }
};