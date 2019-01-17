var express = require("express");
var app = express();
var PORT = 8080;// default port 8080

app.set("view engine", "ejs");
app.use(express.static("public"))

var urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com",
  },
  "user2RandomID": {
    "c2xBn3": "http://www.disney.com",
  }
}

const users = {
  "F2": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple"
  },
 "F2": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

//higher order functions

function generateRandomString() {
   let text = "";
   let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function matchEmailPassword(email, password) {
  for(user_id in users){
    if(users[user_id].email === email && users[user_id].password === password){
      return user_id
    }
  }
  return false;
}

//end

var express = require('express')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieParser());
var cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['testproject'],
}))

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

  if(req.cookies.user_id in users){
     let templateVars = { urls: urlDatabase,
                      users: users[`${req.cookies.user_id}`]
                      };
  res.render("urls_index", templateVars);
  } else {
    res.redirect(`/login`)
  }
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
  let templateVars = { urls: urlDatabase,
                      users: users[`${req.cookie.user_id}`]
                      };
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL, templateVars);
  });

app.get("/urls/new", (req, res) => {
  if(req.cookies.user_id in users){
     let templateVars = { urls: urlDatabase,
                      users: users[`${req.cookies.user_id}`]
                      };
  res.render("urls_new", templateVars);
  } else {
  res.redirect(`/login`)
  res.render("urls_new", templateVars);
  }
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id],
                       users: users[`${req.cookie.user_id}`]
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

app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);        // Respond with 'Ok' (we will replace this)
});

app.get("/register", (req, res) => {
  let email =  req.body.email
  let password = req.body.password
  res.render("register")
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user_id = generateRandomString()
  //check not currently in database
  console.log("body: ", req.body)
  if (email === "" || password === "" || email === undefined || password === undefined ){
   res.status(400).send('Please Enter Username & Password');
   res.redirect()
  } else if(matchEmailPassword(email,password)){
    res.cookie('user_id', req.body.username);
    res.redirect(`/urls`);
  } else {
  //if email not in database add details
      users[user_id] = {
        id: user_id,
        email: email,
        password: password
      }
    res.cookie('user_id', user_id);
    console.log("users db: ", users)
    res.redirect(`/urls`);
  }
});

app.get("/login", (req,res) => {
  res.render("login");        // Respond with 'Ok' (we will replace this)
});

app.post("/login", (req,res) => {
  let email = req.body.email;
  let password = req.body.password;
  //check not currently in database
  console.log("body: ", req.body)
  let user_id = matchEmailPassword(email,password)
  if(user_id){
  res.cookie('user_id', user_id);
  res.redirect(`/urls`);
  } else {
   //(email === "" || password === "" || email === undefined || password === undefined || !matchEmailPassword(email,password)){
   res.status(400).send('Please Enter a Valid Email Address (Username) & Password');
  }
});
  //   res.cookie('user_id', user_id);
  //   console.log("users db: ", users)
  //   res.redirect(`/urls`);
  // });


