const axios = require('axios');

module.exports = async (args) => {
    try {
        const { query } = args;

        if (!query || typeof query !== 'string') {
            return "I provide information about our code analysis services including code summary, architecture analysis, tech stack analysis, and interactive codebase exploration. How can I help you today?";
        }

        const q = `You are an intelligent code analysis assistant that helps users with the following services: code summary, architecture analysis (high-level and low-level), tech stack analysis, and interactive codebase exploration through a chatbot.
        When a user asks a question, check if it aligns with these services. If it does, provide a concise and clear response. If the query is outside these services, politely inform the user about the services you offer without providing unrelated answers.

        Input: ${query}
        Output: (If the query matches the services, provide a relevant response. If not, reply: 'I'm here to assist with code analysis services including code summary, architecture analysis, tech stack analysis, and codebase exploration. Let me know how I can help!')`;

        const apiUrl = 'http://127.0.0.1:5000/llm_query';
        const response = await axios.post(apiUrl, { query: q });

        if (response?.data?.result) {
            return response.data.result;
        }

        return "We offer a suite of code analysis services including:\n\n" +
               "1. Code Summary - Get comprehensive summaries of your entire codebase or specific files\n" +
               "2. Architecture Analysis - Both high-level and detailed low-level architecture visualization and explanation\n" +
               "3. Tech Stack Analysis - Detailed breakdown of technologies used and recommendations\n" +
               "4. Interactive Codebase Exploration - Chat with an AI that understands your codebase\n\n" +
               "How can I assist you with any of these services today?";
    } catch (error) {
        console.error("Error:", error.message);
        return "An error occurred while processing your query. Please try again later.";
    }
};