var express = require("express");
var app = express();
var PORT = 8080;// default port 8080

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
   let text = "";
   let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var express = require('express')
var cookieParser = require('cookie-parser')
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Therefore, you need to pass along the urlDatabase to the template.
// In express_server.js, add a new route handler for "/urls" and use res.render() to pass the URL data to your template.

// Upon receiving the POST request to "/urls" (and generating our shortURL),
// we can add the new pair of shortURL and longURL strings to our URL database
// Add a new key-value pair to urlDatabase
// After you have added the new URL to your database,
// then your server will need to send a response back to the client.
// The typical response in this scenario would be a redirection to another page
// (which the client browser would automatically request as a GET).
// Respond with a redirection to http:

//localhost:8080/urls/<shortURL>, where <shortURL> indicates the random string you generated to represent the original URL.

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                      username: req.cookies.username
                      };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL
  // console.log(urlDatabase)
  // console.log(req.body);  // debug statement to see POST parameters
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/u/:shortURL", (req,res) =>{
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
  });

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id]
                      };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls/:id/delete", (req, res) => {
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req,res) => {
  let longURL = req.body.longURL;
  let urlId = req.params.id;
  urlDatabase[urlId] = longURL;
  res.redirect(`/urls`);         // Respond with 'Ok' (we will replace this)
});

app.post("/login", (req,res) => {
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);        // Respond with 'Ok' (we will replace this)
});


