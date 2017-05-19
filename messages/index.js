// For more information about this template visit http://aka.ms/azurebots-node-qnamaker

"use strict";
require('dotenv').config();
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var builder_cognitiveservices = require("botbuilder-cognitiveservices");
var useEmulator = true;
//var useEmulator = (process.env.NODE_ENV == 'development');

var environment = process.env['BotEnv'];
useEmulator = (environment == 'dev') ? true : false;

var connector = useEmulator ? new builder.ChatConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword']
}) : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

var recognizer = new builder_cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: process.env.QnAKnowledgebaseId,
    subscriptionKey: process.env.QnASubscriptionKey
});

var basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
    defaultMessage: '[Flux Bot] Sorry I could not understand your question. I am constantly learning, please change your question or contact a human at "msftflux@microsoft.com"',
    qnaThreshold: 0.3
}
);

if (!useEmulator) {
    bot.dialog('/', basicQnAMakerDialog);
    module.exports = { default: connector.listen() }
} 
else {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
    bot.dialog('/', basicQnAMakerDialog);
}

