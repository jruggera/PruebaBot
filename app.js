var restify = require('restify');
var builder = require('botbuilder');
var config = require('config');
var botConfig = config.get('bot');
var qnaConfig = config.get('qna');
var cognitiveservices = require('botbuilder-cognitiveservices');
var feedbackTool = require('./feedbackTool');


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3333, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || botConfig.microsoftAppId,
    appPassword: process.env.MICROSOFT_APP_PASSWORD || botConfig.microsoftAppPassword
});

// Listen for messages from users 
var bot = new builder.UniversalBot(connector);
bot.set('storage', new builder.MemoryBotStorage()); // Register in-memory state storage
server.post('/api/messages', connector.listen());


var recognizer = new cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: process.env.KBID || qnaConfig.knowledgeBaseId,
    authKey: process.env.AUTHORIZATION_KEY || qnaConfig.authKey,
	endpointHostName: process.env.ENDPOINT || qnaConfig.endPoint,
	top: process.env.TP || qnaConfig.top
});

var feedbackTool = new feedbackTool.FeedbackTool();
bot.library(feedbackTool.createLibrary());


	var basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
    defaultMessage: 'No se encontro pregunta! por favor intente nuevamente!',
    qnaThreshold: 0.4,
});

bot.dialog('/', basicQnAMakerDialog);
   