var builder = require("botbuilder");

var FeedbackTool = (function(){
    function AnswerFeedback(){
        this.lib = new builder.Library('FeedbackTool');
        this.lib.dialog('answerSelection',
            [sendQnaAnswers,getAnswerFeedback]
        );
    }
    
    AnswerFeedback.prototype.createLibrary = function () {
        return this.lib;
    };
    AnswerFeedback.prototype.answerSelector = function (session,      
    options) {
        session.beginDialog('FeedbackTool:answerSelection',
            options || {}
        );
    };
    return AnswerFeedback;
}());

function sendQnaAnswers(session, args){
    var qnaMakerResult = args;
    session.dialogData.qnaMakerAnswers = qnaMakerResult.answers; 
    var answerOptions = [];
    session.dialogData.qnaMakerAnswers.forEach(
        function (qna) { 
            answerOptions.push(qna.answer); 
        }
    );
    answerOptions.push("None of the above.");
    
    builder.Prompts.choice(
        session, 
        "Por favor ingrese el numero de la respuesta mas apropiada.", 
         answerOptions,
         {listStyle: builder.ListStyle.list}
    );
}

function getAnswerFeedback(session, results){
    var selectedAnswer =    
        session.dialogData.qnaMakerAnswers[results.response.index];
    if (selectedAnswer){
        session.send("Gracias por el feedback.");
        session.endDialogWithResult(selectedAnswer);
    }else{
        session.send("Lo siento, no puedo responder la pregunta")
        session.endDialog();
    }
}

exports.FeedbackTool = FeedbackTool;