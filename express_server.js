const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require("./helpers.js");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'chocochippo',
  keys: ['laskdfjwoeiru'],
}));

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: {
    longURL:"http://www.lighthouselabs.ca",
    userID: "uyh87l"
  },
  sm5xK9: {
    longURL: "http://www.google.com",
    userID: "uyh87l"
  },

  sm7xK5: {
    longURL: "http://www.twitter.com",
    userID: "nb32s0"
  }
};

const users = {};

const generateRandomString = function() {
  const result = Math.random().toString(36).slice(7); //Function to generate a random 6 character alpha-numeric string.
  return result;
};

const urlsForUser = function(id) {
    
  const filteredUrls = {};

  Object.keys(urlDatabase).forEach(key => {
    const url = urlDatabase[key];
    if (url.userID === id) {
      filteredUrls[key] = url;
    } else {
      return "You are not the owner of this url";
    }
  });
  return filteredUrls;
};

app.get("/register", (req, res) =>{
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!templateVars.user) {
    return res.render("urls_register", templateVars);
  }
  console.log("Redirected to /urls");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Please provide a valid email address and a password");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("This email is currently registered with an account. Please enter a different email");
  }

  const id = generateRandomString();

  const hash = bcrypt.hashSync(password, 10);

  const user = {
    id: id,
    email: email,
    password: hash
  };

  users[id] = user;
  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  if (!templateVars.user) {
    return res.status(401).send("Must be logged in to see short URLs.");
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };

  if (!templateVars.user) {
    return res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send("Must be logged in to shorten URLs");
  }
  const randomString = generateRandomString();
  urlDatabase[randomString] = {};
  urlDatabase[randomString].longURL = req.body.longURL;
  urlDatabase[randomString].userID = user.id;
  res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(400).send("URL does not exist.");
  }

  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send("You must be logged in to edit this URL.");
  }
    
  if (user.id !== url.userID) {
    return res.status(401).send("You do not own this URL.");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(400).send("URL does not exist.");
  }

  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send("You must be logged in to edit this URL.");
  }

  if (user.id !== url.userID) {
    return res.status(401).send("You do not own this URL.");
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send("You are not logged in.");
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(401).send("URL does not exist.");
  }
    
  if (user.id !== url.userID) {
    return res.status(401).send("You are not the owner of this url.");
  }
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    return res.status(400).send("Short URL does not exist");
  }
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (!templateVars.user) {
    return res.render("urls_login", templateVars);
  }
  console.log("Redirected to /urls");
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = getUserByEmail(email, users);
    
  if (!email || !password) {
    return res.status(400).send("No user with that email address found");
  }

  if (!foundUser) {
    return res.status(400).send("No user with that email exists.");
  }

  const result = bcrypt.compareSync(password, foundUser.password);

  if (!result) {
    return res.status(400).send("Passwords do not match");
  }
  req.session.user_id = foundUser.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});