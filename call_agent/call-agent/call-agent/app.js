// require('dotenv').config();
// require('colors');

// const express = require('express');
// const ExpressWs = require('express-ws');
// const { GptService } = require('./services/gpt-service');
// const { StreamService } = require('./services/stream-service');
// const { TranscriptionService } = require('./services/transcription-service');
// const { TextToSpeechService } = require('./services/tts-service');
// const { recordingService } = require('./services/recording-service');
// const bodyParser = require('body-parser');
// const VoiceResponse = require('twilio').twiml.VoiceResponse;

// const app = express();
// ExpressWs(app);

// const callerMap = new Map();

// const PORT = process.env.PORT || 3000;
// app.use(bodyParser.urlencoded({ extended: true }));

// app.post('/incoming', (req, res) => {
//   try {
//     console.log('Incoming request to /incoming');
//     const response = new VoiceResponse();
//     const connect = response.connect();
//     const callerNumber = req.body.From;
    
//     callerMap.set(req.body.CallSid, callerNumber);
    
//     connect.stream({ url: `wss://${process.env.SERVER}/connection` });
    
//     res.type('text/xml');
//     res.end(response.toString());
//     console.log('Response sent to Twilio');
//   } catch (err) {
//     console.error('Error in /incoming route:', err);
//   }
// });

// app.ws('/connection', (ws) => {
//   console.log('WebSocket connection initiated...');
//   try {
//     console.log('WebSocket connection established');
    
//     ws.on('error', (err) => {
//       console.error('WebSocket error:', err);
//     });

//     let streamSid;
//     let callSid;

//     const gptService = new GptService();
//     const streamService = new StreamService(ws);
//     const transcriptionService = new TranscriptionService();
//     const ttsService = new TextToSpeechService({});
  
//     let marks = [];
//     let interactionCount = 0;

//     ws.send(JSON.stringify({
//       type: 'gptreply',
//       text: 'Hello! How can I help you! What service are you looking for?'
//     }));
  
//     ws.on('message', function message(data) {
//       try {
//         const msg = JSON.parse(data);
        
//         if (msg.event === 'start') {
//           streamSid = msg.start.streamSid;
//           callSid = msg.start.callSid;
          
//           const callerNumber = callerMap.get(callSid);
          
//           streamService.setStreamSid(streamSid);
//           gptService.setCallSid(callSid, callerNumber);

//           callerMap.delete(callSid);

//           recordingService(ttsService, callSid).then(() => {
//             console.log(`Twilio -> Starting Media Stream for ${streamSid}`.underline.red);
//             ttsService.generate({
//               partialResponseIndex: null, 
//               partialResponse: 'Hello! How can I help you! What service are you looking for?'
//             }, 0);
//             console.log('Transcript done!');
//           }).catch(err => {
//             console.error('Recording Service Error:', err);
//           });
//         } else if (msg.event === 'media') {
//           transcriptionService.send(msg.media.payload);
//         } else if (msg.event === 'mark') {
//           const label = msg.mark.name;
//           console.log(`Twilio -> Audio completed mark (${msg.sequenceNumber}): ${label}`.red);
//           marks = marks.filter(m => m !== msg.mark.name);
//         } else if (msg.event === 'stop') {
//           console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red);
//         }
//       } catch (err) {
//         console.error('Error processing message:', err);
//       }
//     });
  
//     transcriptionService.on('utterance', async (text) => {
//       if (marks.length > 0 && text?.length > 5) {
//         console.log('Twilio -> Interruption, Clearing stream'.red);
//         ws.send(
//           JSON.stringify({
//             streamSid,
//             event: 'clear',
//           })
//         );
//       }
//     });
  
//     transcriptionService.on('transcription', async (text) => {
//       if (!text) { return; }
//       console.log(`Interaction ${interactionCount} – STT -> GPT: ${text}`.yellow);
//       ws.send(JSON.stringify({
//         type: 'transcription',
//         text: text
//       }));
//       gptService.completion(text, interactionCount);
//       interactionCount += 1;
//     });
    
//     gptService.on('gptreply', async (gptReply, icount) => {
//       console.log(`Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green);
//       ws.send(JSON.stringify({
//         type: 'gptreply',
//         text: gptReply.partialResponse
//       }));
//       ttsService.generate(gptReply, icount);
//     });
  
//     ttsService.on('speech', (responseIndex, audio, label, icount) => {
//       console.log(`Interaction ${icount}: TTS -> TWILIO: ${label}`.blue);
//       ws.send(JSON.stringify({
//         type: 'gptreply',
//         text: label
//       }));
//       streamService.buffer(responseIndex, audio);
//     });
  
//     streamService.on('audiosent', (markLabel) => {
//       console.log(`Audio sent: ${markLabel}`);
//       marks.push(markLabel);
//     });
//   } catch (err) {
//     console.error('Error in WebSocket connection:', err);
//   }
// });

// app.post('/api/simulate-speech', async (req, res) => {
//   try {
//       const { text } = req.body;
//       console.log(text);
//       if (!text) {
//           return res.status(400).json({ error: 'Text is required' });
//       }

//       const clients = Array.from(expressWs.getWss().clients).filter(client => client.readyState === 1);

//       if (clients.length === 0) {
//           return res.status(400).json({ error: 'No active WebSocket connections' });
//       }

//       for (const ws of clients) {
//           let session = testSessions.get(ws);
          
//           if (!session) {
//               const gptService = new GptService();
//               const streamService = new StreamService(ws);
//               const transcriptionService = new TranscriptionService();
//               const ttsService = new TextToSpeechService({});
              
//               session = {
//                   gptService,
//                   streamService,
//                   transcriptionService,
//                   ttsService,
//                   marks: [],
//                   interactionCount: 0,
//                   lastResponse: ''
//               };

//               transcriptionService.on('utterance', async(utteranceText) => {
//                   if (session.marks.length > 0 && utteranceText?.length > 5) {
//                       console.log('Test -> Interruption, Clearing stream'.red);
//                       ws.send(JSON.stringify({ event: 'clear' }));
//                   }
//                   ws.send(JSON.stringify({
//                       type: 'transcription',
//                       text: utteranceText
//                   }));
//               });

//               transcriptionService.on('transcription', async(transcriptionText) => {
//                   if (!transcriptionText) return;
                  
//                   if (session.lastResponse === transcriptionText) {
//                       console.log('Test: Duplicate response detected, skipping...'.yellow);
//                       return;
//                   }
                  
//                   console.log(`Test Interaction ${session.interactionCount} - STT -> GPT: ${transcriptionText}`.yellow);
                  
//                   ws.send(JSON.stringify({
//                       type: 'transcription',
//                       text: transcriptionText
//                   }));
                  
//                   const response = await gptService.completion(transcriptionText, session.interactionCount);
//                   if (response && response !== session.lastResponse) {
//                       session.lastResponse = response;
//                       session.interactionCount++;
//                   }
//               });

//               gptService.on('gptreply', async(gptReply, icount) => {
//                   if (gptReply.partialResponse === session.lastResponse) {
//                       console.log('Test: Duplicate response detected, skipping...'.yellow);
//                       return;
//                   }
                  
//                   session.lastResponse = gptReply.partialResponse;
//                   console.log(`Test Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green);
                  
//                   ws.send(JSON.stringify({
//                       type: 'gptreply',
//                       text: gptReply.partialResponse
//                   }));
                  
//                   ttsService.generate(gptReply, icount);
//               });

//               ttsService.on('speech', (responseIndex, audio, label, icount) => {
//                   console.log(`Test Interaction ${icount}: TTS -> TEST: ${label}`.blue);
//                   streamService.buffer(responseIndex, audio);
//               });

//               streamService.on('audiosent', (markLabel) => {
//                   console.log(`Test Audio sent: ${markLabel}`);
//                   session.marks.push(markLabel);
//               });

//               testSessions.set(ws, session);
//           }

//           // Process the text through transcription service
//           session.transcriptionService.emit('transcription', text);
//       }

//       res.json({ message: 'Speech simulation processed' });
//   } catch (err) {
//       console.error('Error in simulate-speech:', err);
//       res.status(500).json({ error: err.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// require('dotenv').config();
// require('colors');

// const express = require('express');
// const ExpressWs = require('express-ws');
// const { GptService } = require('./services/gpt-service');
// const { StreamService } = require('./services/stream-service');
// const { TranscriptionService } = require('./services/transcription-service');
// const { TextToSpeechService } = require('./services/tts-service');
// const { recordingService } = require('./services/recording-service');
// const bodyParser = require('body-parser');
// const VoiceResponse = require('twilio').twiml.VoiceResponse;

// const app = express();
// const expressWs = ExpressWs(app);

// // Track frontend connection
// let frontendWs = null;

// const callerMap = new Map();

// const PORT = process.env.PORT || 3000;
// app.use(bodyParser.json()); // Add JSON body parser
// app.use(bodyParser.urlencoded({ extended: true }));

// // Helper function to send messages to the frontend
// function sendToFrontend(message) {
//   try {
//     console.log("In Send");
//     if (!frontendWs) {
//       // If no dedicated frontend connection yet, use first available client
//       const clients = Array.from(expressWs.getWss().clients)
//         .filter(client => client.readyState === 1);
      
//       if (clients.length > 0) {
//         frontendWs = clients[0];
//         console.log('Using first available client as frontend');
//       }
//     }

//     if (frontendWs && frontendWs.readyState === 1) {
//       if (typeof message === 'string') {
//         console.log("Sending");
//         frontendWs.send(message);
//       } else {
//         frontendWs.send(JSON.stringify(message));
//       }
//     }
//   } catch (err) {
//     console.error('Error sending to frontend:', err);
//     frontendWs = null; // Reset on error
//   }
// }

// app.post('/incoming', (req, res) => {
//   try {
//     console.log('Incoming request to /incoming');
//     const response = new VoiceResponse();
//     const connect = response.connect();
//     const callerNumber = req.body.From;
    
//     callerMap.set(req.body.CallSid, callerNumber);
    
//     connect.stream({ url: `wss://${process.env.SERVER}/connection` });
    
//     res.type('text/xml');
//     res.end(response.toString());
//     console.log('Response sent to Twilio');
//   } catch (err) {
//     console.error('Error in /incoming route:', err);
//   }
// });

// // Add a frontend monitoring connection
// app.ws('/frontend', (ws) => {
//   console.log('Frontend monitoring connected');
//   frontendWs = ws;
  
//   ws.on('close', () => {
//     console.log('Frontend monitoring disconnected');
//     if (frontendWs === ws) {
//       frontendWs = null;
//     }
//   });
  
//   ws.on('error', (err) => {
//     console.error('Frontend WebSocket error:', err);
//     if (frontendWs === ws) {
//       frontendWs = null;
//     }
//   });
  
//   ws.send(JSON.stringify({
//     type: 'gptreply',
//     text: 'Frontend monitor connected'
//   }));
// });

// app.ws('/test', (req,res) => {
//   sendToFrontend({
//     type: 'gptreply',
//     text: "Hi from Test!"
//   });
// })

// app.ws('/connection', (ws) => {
//   console.log('WebSocket connection initiated...');
  
//   // If we don't have a frontend connection yet, use this one
//   if (!frontendWs) {
//     console.log('Setting first connection as frontend');
//     frontendWs = ws;
//   }
  
//   try {
//     console.log('WebSocket connection established');
    
//     ws.on('error', (err) => {
//       console.error('WebSocket error:', err);
//       if (frontendWs === ws) {
//         frontendWs = null;
//       }
//     });
    
//     ws.on('close', () => {
//       console.log('WebSocket connection closed');
//       if (frontendWs === ws) {
//         frontendWs = null;
//       }
//     });

//     let streamSid;
//     let callSid;

//     const gptService = new GptService();
//     const streamService = new StreamService(ws);
//     const transcriptionService = new TranscriptionService();
//     const ttsService = new TextToSpeechService({});
  
//     let marks = [];
//     let interactionCount = 0;

//     const initialGreeting = 'Hello! How can I help you! What service are you looking for?';
    
//     // Send initial greeting
//     ws.send(JSON.stringify({
//       type: 'gptreply',
//       text: initialGreeting
//     }));
    
//     // Also send to frontend
//     sendToFrontend({
//       type: 'gptreply',
//       text: initialGreeting
//     });
  
//     ws.on('message', function message(data) {
//       try {
//         const msg = JSON.parse(data);
        
//         if (msg.event === 'start') {
//           streamSid = msg.start.streamSid;
//           callSid = msg.start.callSid;
          
//           const callerNumber = callerMap.get(callSid);
//           console.log(`Call started: SID ${callSid}, caller ${callerNumber || 'unknown'}`);
          
//           streamService.setStreamSid(streamSid);
//           gptService.setCallSid(callSid, callerNumber);

//           callerMap.delete(callSid);
          
//           // Notify frontend about call start
//           sendToFrontend({
//             type: 'transcription',
//             text: `Call started: SID ${callSid}, caller ${callerNumber || 'unknown'}`
//           });

//           recordingService(ttsService, callSid).then(() => {
//             console.log(`Twilio -> Starting Media Stream for ${streamSid}`.underline.red);
//             ttsService.generate({
//               partialResponseIndex: null, 
//               partialResponse: initialGreeting
//             }, 0);
//             console.log('Transcript done!');
//           }).catch(err => {
//             console.error('Recording Service Error:', err);
//           });
//         } else if (msg.event === 'media') {
//           transcriptionService.send(msg.media.payload);
//         } else if (msg.event === 'mark') {
//           const label = msg.mark.name;
//           console.log(`Twilio -> Audio completed mark (${msg.sequenceNumber}): ${label}`.red);
//           marks = marks.filter(m => m !== msg.mark.name);
          
//           // Notify frontend about mark
//           sendToFrontend({
//             type: 'mark',
//             label: label,
//             sequenceNumber: msg.sequenceNumber
//           });
//         } else if (msg.event === 'stop') {
//           console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red);
          
//           // Notify frontend about call end
//           sendToFrontend({
//             type: 'transcription',
//             text: `Call ended: SID ${callSid || 'unknown'}`
//           });
//         }
//       } catch (err) {
//         console.error('Error processing message:', err);
//       }
//     });
  
//     transcriptionService.on('utterance', async (text) => {
//       // Send partial transcriptions to frontend
//       if (text && text.length > 0) {
//         sendToFrontend({
//           type: 'transcription',
//           text: text,
//           partial: true
//         });
//       }
      
//       if (marks.length > 0 && text?.length > 5) {
//         console.log('Twilio -> Interruption, Clearing stream'.red);
//         ws.send(
//           JSON.stringify({
//             streamSid,
//             event: 'clear',
//           })
//         );
//       }
//     });
  
//     transcriptionService.on('transcription', async (text) => {
//       if (!text) { return; }
//       console.log(`Interaction ${interactionCount} – STT -> GPT: ${text}`.yellow);
      
//       // Send to current connection
//       ws.send(JSON.stringify({
//         type: 'transcription',
//         text: text
//       }));
      
//       // Send to frontend
//       sendToFrontend({
//         type: 'transcription',
//         text: text,
//         partial: false,
//         interactionCount: interactionCount
//       });
      
//       gptService.completion(text, interactionCount);
//       interactionCount += 1;
//     });
    
//     gptService.on('gptreply', async (gptReply, icount) => {
//       console.log(`Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green);
      
//       // Send to current connection
//       ws.send(JSON.stringify({
//         type: 'gptreply',
//         text: gptReply.partialResponse
//       }));
      
//       // Send to frontend
//       sendToFrontend({
//         type: 'gptreply',
//         text: gptReply.partialResponse,
//         interactionCount: icount
//       });
      
//       ttsService.generate(gptReply, icount);
//     });
  
//     ttsService.on('speech', (responseIndex, audio, label, icount) => {
//       console.log(`Interaction ${icount}: TTS -> TWILIO: ${label}`.blue);
      
//       // Send to current connection
//       ws.send(JSON.stringify({
//         type: 'gptreply',
//         text: label
//       }));
      
//       // Send to frontend
//       sendToFrontend({
//         type: 'tts',
//         text: label,
//         responseIndex: responseIndex,
//         interactionCount: icount
//       });
      
//       streamService.buffer(responseIndex, audio);
//     });
  
//     streamService.on('audiosent', (markLabel) => {
//       console.log(`Audio sent: ${markLabel}`);
//       marks.push(markLabel);
      
//       // Send to frontend
//       sendToFrontend({
//         type: 'audiosent',
//         markLabel: markLabel
//       });
//     });
//   } catch (err) {
//     console.error('Error in WebSocket connection:', err);
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

require('dotenv').config();
require('colors');

const express = require('express');
const expressWs = require('express-ws');
const { GptService } = require('./services/gpt-service');
const { StreamService } = require('./services/stream-service');
const { TranscriptionService } = require('./services/transcription-service');
const { TextToSpeechService } = require('./services/tts-service');
const { recordingService } = require('./services/recording-service');
const bodyParser = require('body-parser');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

// Create express app
const app = express();
// Set up express-ws properly, and keep a reference to the instance
const wsInstance = expressWs(app);

const callerMap = new Map();

const PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: true }));

// Add basic route to confirm server is running
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.send('Server is running');
});

function sendToFrontend(message) {
  try {
    console.log("In Send to Frontend");
    if (!frontendWs) {
      // If no dedicated frontend connection yet, use first available client
      const clients = Array.from(wsInstance.getWss().clients)
        .filter(client => client.readyState === 1);
      
      if (clients.length > 0) {
        frontendWs = clients[0];
        console.log('Using first available client as frontend');
      }
    }

    if (frontendWs && frontendWs.readyState === 1) {
      if (typeof message === 'string') {
        console.log("Sending string to frontend");
        frontendWs.send(message);
      } else {
        console.log("Sending JSON to frontend:", JSON.stringify(message));
        frontendWs.send(JSON.stringify(message));
      }
    } else {
      console.log("No frontend connection available");
    }
  } catch (err) {
    console.error('Error sending to frontend:', err);
    frontendWs = null; // Reset on error
  }
}

app.post('/incoming', (req, res) => {
  console.log('Incoming request to /incoming');
  console.log('Request body:', req.body);
  
  try {
    const response = new VoiceResponse();
    const connect = response.connect();
    const callerNumber = req.body.From;
    
    console.log(`Caller number: ${callerNumber}`);
    console.log(`Call SID: ${req.body.CallSid}`);
    
    callerMap.set(req.body.CallSid, callerNumber);
    
    if (!process.env.SERVER) {
      console.error('SERVER environment variable not set');
      res.status(500).send('Server configuration error');
      return;
    }
    
    connect.stream({ url: `wss://${process.env.SERVER}/connection` });
    
    res.type('text/xml');
    const responseXml = response.toString();
    console.log('Response XML:', responseXml);
    res.send(responseXml);
    console.log('Response sent to Twilio');
  } catch (err) {
    console.error('Error in /incoming route:', err);
    res.status(500).send('Internal server error');
  }
});

app.ws('/connection', (ws, req) => {
  console.log('WebSocket connection initiated to /connection...');
  
  try {
    console.log('WebSocket connection established');
    
    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    let streamSid;
    let callSid;

    const gptService = new GptService();
    const streamService = new StreamService(ws);
    const transcriptionService = new TranscriptionService();
    const ttsService = new TextToSpeechService({});
  
    let marks = [];
    let interactionCount = 0;

    const initialGreeting = 'Hello! How can I help you! What service are you looking for?';
    console.log('Sending initial greeting');
    
    // ws.send(JSON.stringify({
    //   type: 'gptreply',
    //   text: initialGreeting
    // }));

    ws.on('message', function message(data) {
      
      try {
        const msg = JSON.parse(data);
        
        if (msg.event === 'start') {
          streamSid = msg.start.streamSid;
          callSid = msg.start.callSid;
          
          console.log(`Call started: StreamSID=${streamSid}, CallSID=${callSid}`);
          
          const callerNumber = callerMap.get(callSid);
          console.log(`Caller number for this call: ${callerNumber}`);
          
          streamService.setStreamSid(streamSid);
          gptService.setCallSid(callSid, callerNumber);

          callerMap.delete(callSid);

          recordingService(ttsService, callSid).then(() => {
            console.log(`Twilio -> Starting Media Stream for ${streamSid}`.underline.red);
            ttsService.generate({
              partialResponseIndex: null, 
              partialResponse: initialGreeting
            }, 0);
          }).catch(err => {
            console.error('Recording Service Error:', err);
          });
        } else if (msg.event === 'media') {
          transcriptionService.send(msg.media.payload);
        } else if (msg.event === 'mark') {
          const label = msg.mark.name;
          console.log(`Twilio -> Audio completed mark (${msg.sequenceNumber}): ${label}`.red);
          marks = marks.filter(m => m !== msg.mark.name);
        } else if (msg.event === 'stop') {
          console.log(`Twilio -> Media stream ${streamSid} ended.`.underline.red);
        } else {
          console.log(`Unhandled event type: ${msg.event}`);
        }
      } catch (err) {
        console.error('Error processing message:', err, 'Raw data:', data);
      }
    });
  
    transcriptionService.on('utterance', async (text) => {
      if (marks.length > 0 && text?.length > 5) {
        console.log('Twilio -> Interruption, Clearing stream'.red);
        ws.send(
          JSON.stringify({
            streamSid,
            event: 'clear',
          })
        );
      }
    });
  
    transcriptionService.on('transcription', async (text) => {
      if (!text) { 
        console.log('Empty transcription received');
        return; 
      }
      console.log(`Interaction ${interactionCount} – STT -> GPT: ${text}`.yellow);

      gptService.completion(text, interactionCount);
      interactionCount += 1;
    });
    
    gptService.on('gptreply', async (gptReply, icount) => {
      console.log(`Interaction ${icount}: GPT -> TTS: ${gptReply.partialResponse}`.green);

      ttsService.generate(gptReply, icount);
    });
  
    ttsService.on('speech', (responseIndex, audio, label, icount) => {
      console.log(`Interaction ${icount}: TTS -> TWILIO: ${label}`.blue);

      streamService.buffer(responseIndex, audio);
    });
  
    streamService.on('audiosent', (markLabel) => {
      console.log(`Audio sent: ${markLabel}`);
      marks.push(markLabel);
    });
  } catch (err) {
    console.error('Error in WebSocket connection:', err, err.stack);
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.green);
  console.log(`WebSocket server available at ws://localhost:${PORT}`.green);
  console.log(`HTTP endpoints available at http://localhost:${PORT}`.green);
});