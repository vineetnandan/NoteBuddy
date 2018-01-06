var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var path = require("path");
var SummaryTool = require("node-summary");
var wikipedia = require("node-wikipedia");
var apiai = require('apiai');
var say = require('say');

var appApi = apiai("cf798e34d2d8486a99ad5f06e55ef850");

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(express.static(path.join(__dirname, "dist")));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Accept-Encoding ,authorization,content-type, enctype"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,HEAD,DELETE,PATCH");
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  if (req.method == "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.post("/summariseNote", function(req, res) {
  console.log("request",req.body);
  // Prepare output in JSON format
  let title = req.body.title;
  let content = req.body.content;
  summariseContent(title, content).then(
    result => {
      response = {
        content: result,
        title : title,
        summaryLength: result.length,
        originalLength: title.length + content.length,
        summaryRatio:
          100 - 100 * (result.length / (title.length + content.length))
      };
      res.end(JSON.stringify(response));
    },
    error => {
      console.log(error);
      res.end(
        JSON.stringify({
          error: error,
          message: "error in summarising the note"
        })
      );
    }
  );
});

app.post("/reviseChat", function(req,res){
  let input = req.body.question;
  responseFromAlexa(input).then(result =>{
    let response = {
      answer : result
    }
    res.end(JSON.stringify(response));
  },error =>{
    console.log(error);
    res.end(JSON.stringify({
      error: error,
      message: "error in replying to the query"
    }));
  });
});

app.post("/addIntent", function(req,res){
  let options = req.body;
  createIntent(options).then(result=>{
    let response = {
      message : result
    }
    res.end(JSON.stringify(response));
  },error =>{
    console.log(error);
    res.end(JSON.stringify({
      error: error,
      message: "error in adding intent"
    }));
  })
})

var summariseContent = function(title, content) {
  return new Promise((resolve, reject) => {
    SummaryTool.summarize(title, content, function(err, summary) {
      if (err) {
        reject(err);
        console.log("Something went wrong man!",err);
      } else {
        console.log(summary);
        console.log("Original Length " + (title.length + content.length));
        console.log("Summary Length " + summary.length);
        console.log(
          "Summary Ratio: " +
            (100 - 100 * (summary.length / (title.length + content.length)))
        );
        resolve(summary);
      }
    });
  });
};

/*>>>>>>>>>>>>>>>>>>>Api.ai>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

var responseFromAlexa = function (input) {
  return new Promise((resolve,reject) =>{
    var request = appApi.textRequest(input, {
      sessionId: '124'
    });
    request.on('response', function (response) {
        console.log(response);
        resolve(response.result.fulfillment.speech);
      //  say.speak(response.result.fulfillment.speech, 'Alex', 1.5, (err) => {
      //      if (err) {
      //          return console.error(err);
      //      }

      //      console.log('Text has been spoken.');
      //  });
    });

    request.on('error', function (error) {
        console.log(error);
        reject(error);
    });
    request.end();
  })
}

function createIntent(options) {
  return new Promise((resolve, reject) => {
    let request = appApi.intentPostRequest(options);
    request.on('response', function (response) { return resolve(response); });
    request.on('error', (error) => { return reject(error); });
    request.end();
  })
}

/*>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});
