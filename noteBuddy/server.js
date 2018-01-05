var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var path = require("path");
var SummaryTool = require("node-summary");

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
      console.log(response);
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

var summariseContent = function(title, content) {
  return new Promise((resolve, reject) => {
    SummaryTool.summarize(title, content, function(err, summary) {
      if (err) {
        reject(err);
        console.log("Something went wrong man!");
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

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});
