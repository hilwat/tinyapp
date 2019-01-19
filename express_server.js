var express = require("express");
var app = express();
var PORT = 8080;// default port 8080

app.set("view engine", "ejs");
app.use(express.static("public"))

// External Requirements

var express = require('express')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['testproject'],
}));
const bcrypt = require('bcrypt');

// Data

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
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

// Higher order functions

function generateRandomString() {
   let text = "";
   let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function matchEmailPassword(email, password) {
  for(user_id in users){
    if(users[user_id].email === email && bcrypt.compareSync(password, users[user_id].password)){
      return user_id
    }
  }
  return false;
}

// Welcome Message

app.get("/", (req, res)  => {
  res.redirect(`/welcome`)
});

app.post("/", (req, res) => {
  res.redirect(`/welcome`)
});

app.get("/welcome", (req, res)  => {
  let templateVars = {
                      users : null
  }
  res.render("welcome", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// URLs page

app.get("/urls", (req, res) => {
  if(req.session.user_id in users){
     let templateVars = {
      urls: urlDatabase[req.session.user_id],
      users: users[`${req.session.user_id}`]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect(`/login`)
  }
});

// Re-routing

app.get("/u/:shortURL", (req,res) =>{
 for(user in urlDatabase){
    for(shortURL in urlDatabase[user]){
     if(shortURL == req.params.shortURL){
      var LongURL = urlDatabase[user][shortURL]
      res.redirect(LongURL);
      return;
      }
     }
    }
    res.status(400).send('No ShortURL Found~!');
});

//Add New Page

app.get("/urls/new", (req, res) => {
  if(req.session.user_id in users){
     let templateVars = { urls: urlDatabase,
                      users: users[`${req.session.user_id}`]
                      };
  res.render("urls_new", templateVars);
  } else {
  res.redirect(`/login`);
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  userURLs = urlDatabase[req.session.user_id]
  if (userURLs) {
    userURLs[shortURL] = longURL
  } else {
    urlDatabase[req.session.user_id] = {[shortURL]: longURL}
  }
  res.redirect(`/urls/`);
});

//Edit route

app.get("/urls/:id", (req, res) => {
  if(req.session.user_id in users){
     let templateVars = { ShortURL: req.params.id,
                      LongURL: urlDatabase[req.session.user_id][req.params.id],
                      users: users[`${req.session.user_id}`]
                      };
  res.render("urls_show", templateVars);
  } else {
  res.redirect(`/login`);
  }
});

app.post("/urls/:id", (req,res) => {
  let longURL = req.body.longURL;
  let shortURL = req.params.id;
  console.log("shortURL", shortURL)
  console.log("longURL", longURL)

  if (urlDatabase[req.session.user_id][shortURL]) {
    urlDatabase[req.session.user_id][shortURL] = longURL
  }
  return res.redirect(`/urls`);
});

//  Delete

app.get("/urls/:id/delete", (req, res) => {
  if(req.session.user_id in users){
     let templateVars = { urls: urlDatabase,
                      users: users[`${req.session.user_id}`]
                      };
  res.render("urls_new", templateVars);
  } else {
  res.redirect(`/urls`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const url_ID=req.params.id;
  delete urlDatabase[req.session.user_id][url_ID];
  res.redirect(`/urls`);
});



app.post("/logout", (req,res) => {
  req.session = null
  res.redirect(`/urls`);        // Respond with 'Ok' (we will replace this)
});

//register

app.get("/register", (req, res) => {
  let templateVars = {
                      users : null
  }
  res.render("register", templateVars)
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let passwordthere = req.body.password
  let password = bcrypt.hashSync(req.body.password,10)
  let user_id = generateRandomString()
  //check not currently in database
  console.log("body: ", req.body)
  if (email === "" || passwordthere === "" || email === undefined || passwordthere === undefined ){
   res.status(400).send('Please Enter Username & Password');
   res.redirect()
  } else if(matchEmailPassword(email,password)){
    req.session.user_id = req.body.username;
    res.redirect(`/urls`);
  } else {
  //if email not in database add details
      users[user_id] = {
        id: user_id,
        email: email,
        password: password
      }
    req.session.user_id = user_id;
    console.log("users db: ", users)
    res.redirect(`/urls`);
  }
});

app.get("/login", (req,res) => {
  let templateVars = {
                      users : null
  }
  res.render("login", templateVars);
});

app.post("/login", (req,res) => {
  let email = req.body.email;
  let password = req.body.password;
  //check not currently in database
  console.log("body: ", req.body)
  let user_id = matchEmailPassword(email,password)
  if(user_id){
  req.session.user_id = user_id;
  res.redirect(`/urls`);
  } else {
   res.status(400).send('Please Enter a Valid Email Address (Username) & Password');
  }
});


//Should be last
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
