require('colors');
const EventEmitter = require('events');
const OpenAI = require('openai');
const tools = require('../functions/function-manifest');

const availableFunctions = {};
tools.forEach((tool) => {
  let functionName = tool.function.name;
  availableFunctions[functionName] = require(`../functions/${functionName}`);
});

class GptService extends EventEmitter {
  constructor() {
    super();
    this.openai = new OpenAI();
    let prompt = `You are a customer service agent for VizCoAssist, a platform that helps developers understand complex codebases. Your role is to explain how our services work and guide users on how to use them effectively. You do not perform any actual code analysis but rather educate users about our platform's capabilities.

Your primary responsibilities include:

1. Explaining our four core services:
   - Code Summary - How users can get detailed insights into their codebase structure and functionality
   - Architecture Analysis - How to generate and interact with visual diagrams of code structure
   - Tech Stack Analysis - How to access technology usage breakdowns and insights
   - Codebase Overview Chatbot - How to effectively query and explore codebases through natural language

2. Guiding users on:
   - How to upload their code (via ZIP file or GitHub repository link)
   - How to navigate the dashboard to access different features
   - Best practices for using each service effectively
   - Common troubleshooting tips for each feature

3. Answering questions about:
   - Pricing plans and included features
   - Company information and contact details
   - Account management basics
   - Service limitations and capabilities

Respond in a friendly, concise, and helpful manner. Focus on explaining the process clearly without technical jargon unless necessary. If users ask you to actually analyze code or perform functions beyond explaining services, politely clarify your role as a service explainer rather than a code analysis tool.

If users ask about services outside our core offerings, politely inform them about what VizCoAssist actually provides while maintaining a helpful attitude.

Always aim to leave users with a clear understanding of how to use the specific VizCoAssist feature they're inquiring about.`
    this.userContext = [
      { role: 'system', content: prompt },
    ],
    this.partialResponseIndex = 0;
  }

  setCallSid(callSid, callNum) {
    this.userContext.push({ 'role': 'system', 'content': `callSid: ${callSid}` });
    this.userContext.push({ 'role': 'system', 'content': `ContactNumber: ${callNum}` });
  }

  getCallNum() {
      const callerNumMsg = this.userContext.find(msg => msg.role === 'system' && msg.content.startsWith('ContactNumber:'));
      if (callerNumMsg) {
          return callerNumMsg.content.replace('ContactNumber: ', '');
      }
      console.log('Warning: Could not find caller number in context:', this.userContext);
      return null;
  }

  validateFunctionArgs (args) {
    try {
      return JSON.parse(args);
    } catch (error) {
      console.log('Warning: Double function arguments returned by OpenAI:', args);
      if (args.indexOf('{') != args.lastIndexOf('{')) {
        return JSON.parse(args.substring(args.indexOf(''), args.indexOf('}') + 1));
      }
    }
  }

  updateUserContext(name, role, text) {
    if (name !== 'user') {
      this.userContext.push({ 'role': role, 'name': name, 'content': text });
    } else {
      this.userContext.push({ 'role': role, 'content': text });
    }
  }

  async completion(text, interactionCount, role = 'user', name = 'user') {
    this.updateUserContext(name, role, text);

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: this.userContext,
      tools: tools,
      stream: true,
    });

    let completeResponse = '';
    let partialResponse = '';
    let functionName = '';
    let functionArgs = '';
    let finishReason = '';

    function collectToolInformation(deltas) {
      let name = deltas.tool_calls[0]?.function?.name || '';
      if (name != '') {
        functionName = name;
      }
      let args = deltas.tool_calls[0]?.function?.arguments || '';
      if (args != '') {
        functionArgs += args;
      }
    }

    for await (const chunk of stream) {
      let content = chunk.choices[0]?.delta?.content || '';
      let deltas = chunk.choices[0].delta;
      finishReason = chunk.choices[0].finish_reason;

      if (deltas.tool_calls) {
        collectToolInformation(deltas);
      }

      if (finishReason === 'tool_calls') {

        const functionToCall = availableFunctions[functionName];
        const validatedArgs = this.validateFunctionArgs(functionArgs);
        
        if(['raiseIssue', 'checkIssueStatus', 'checkOrderStatus'].includes(functionName)) {
          const callerNum = this.getCallNum();
          if (callerNum) {
            validatedArgs.callerNum = callerNum;
          }
        }
        const toolData = tools.find(tool => tool.function.name === functionName);
        const say = toolData.function.say;

        this.emit('gptreply', {
          partialResponseIndex: null,
          partialResponse: say
        }, interactionCount);

        let functionResponse = await functionToCall(validatedArgs);

        this.updateUserContext(functionName, 'function', functionResponse);
        
        await this.completion(functionResponse, interactionCount, 'function', functionName);
      } else {
        completeResponse += content;
        partialResponse += content;
        if (content.trim().slice(-1) === '•' || finishReason === 'stop') {
          const gptReply = { 
            partialResponseIndex: this.partialResponseIndex,
            partialResponse
          };

          this.emit('gptreply', gptReply, interactionCount);
          this.partialResponseIndex++;
          partialResponse = '';
        }
      }
    }
    this.userContext.push({'role': 'assistant', 'content': completeResponse});
    console.log(`GPT -> user context length: ${this.userContext.length}`.green);
  }
}

module.exports = { GptService };