const tools = [
  {
    type: 'function',
    function: {
      name: 'codeSummaryService',
      say: 'Let me explain how to use our Code Summary feature.',
      description: 'Provides information about how to use the Code Summary service.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The user\'s question about the Code Summary service.',
          },
        },
        required: ['query'],
      },
      returns: {
        type: 'string',
        description: 'Information about how to use the Code Summary service.',
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'architectureAnalysisService',
      say: 'Let me explain how to use our Architecture Analysis feature.',
      description: 'Provides information about how to use the Architecture Analysis service.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The user\'s question about the Architecture Analysis service.',
          },
        },
        required: ['query'],
      },
      returns: {
        type: 'string',
        description: 'Information about how to use the Architecture Analysis service.',
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'techStackService',
      say: 'Let me explain how to use our Tech Stack Analysis feature.',
      description: 'Provides information about how to use the Tech Stack Analysis service.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The user\'s question about the Tech Stack Analysis service.',
          },
        },
        required: ['query'],
      },
      returns: {
        type: 'string',
        description: 'Information about how to use the Tech Stack Analysis service.',
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'codebaseOverviewService',
      say: 'Let me explain how to use our Codebase Overview chatbot.',
      description: 'Provides information about how to use the Codebase Overview service.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The user\'s question about the Codebase Overview service.',
          },
        },
        required: ['query'],
      },
      returns: {
        type: 'string',
        description: 'Information about how to use the Codebase Overview service.',
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'companyInfoService',
      say: 'Let me provide information about our company.',
      description: 'Provides information about the company.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The user\'s question about the company.',
          },
        },
        required: ['query'],
      },
      returns: {
        type: 'string',
        description: 'Information about the company.',
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'pricingInfoService',
      say: 'Let me tell you about our pricing options.',
      description: 'Provides information about pricing plans and options.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The user\'s question about pricing.',
          },
        },
        required: ['query'],
      },
      returns: {
        type: 'string',
        description: 'Information about pricing plans and options.',
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'handleGeneralQueries',
      say: '',
      description: 'Handles general queries and routes them to the appropriate service.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The user\'s general query.',
          },
        },
        required: ['query'],
      },
      returns: {
        type: 'string',
        description: 'A response to the user\'s query.',
      },
    },
  },
];

module.exports = tools;