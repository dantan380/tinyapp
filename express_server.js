const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());

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

const users = {
    uyh87l: {
      id: "uyh87l",
      email: "a@a.com",
      password: "1234",
    },
    nb32s0: {
      id: "nb32s0",
      email: "b@b.com",
      password: "5678",
    },
  };

const generateRandomString = function() {
    const result = Math.random().toString(36).slice(7); //Function to generate a random 6 character alpha-numeric string.
    return result;
}

const urlsForUser = function(id) {
    
    const filteredUrls = {};

    Object.keys(urlDatabase).forEach(key => {
        const url = urlDatabase[key];
        if (url.userID === id) {
            filteredUrls[key] = url;
        }
    });
    return filteredUrls
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {       //Route to /urls.json shows all urls in urlDatabase.
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

app.get("/register", (req, res) =>{
    const templateVars = {
        user: users[req.cookies["user_id"]],
    }
    if (!templateVars.user){
        return res.render("urls_register", templateVars);
    }
    console.log("redirected to urls");
    res.redirect("/urls");
});

app.post("/register", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).send("Please provide a valid email address and a password");
    }

    let foundUser = null;

    for (const userId in users) {
        const user = users[userId];
        if (user.email === email) {
            foundUser = user;
        }
    }

    if (foundUser) {
        return res.status(400).send("This email is currently registered with an account. Please enter a different email");
    }

    const id = generateRandomString();

    const user = {
        id: id,
        email: email,
        password: password
    };

    users[id] = user;
    res.cookie("user_id", id);
    console.log(users);
    res.redirect("/urls");
});

app.get("/urls", (req, res) => {
    const templateVars = {
        urls: urlsForUser(req.cookies["user_id"]),
        user: users[req.cookies["user_id"]]
    };
    if (!templateVars.user) {
        return res.status(401).send("Must be logged in to see short URLs.");
    }

    //urlsForUser(templateVars.user);
    res.render("urls_index", templateVars);         
});                                                 

app.get("/urls/new", (req, res) => {            
    const templateVars = {
        user: users[req.cookies["user_id"]],
    }

    if (!templateVars.user) {
        return res.redirect("/login");
    }

    res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {                   //Route after the POST submission of the new short url. User gets redirected to
    console.log("this is a test");
    const user = users[req.cookies["user_id"]];
    if (!user) {
        return res.status(401).send("Must be logged in to shorten URLs");
    }
    const randomString = generateRandomString();
    urlDatabase[randomString] = {}    // /urls/randomString which will show the long url entered and the 6 character
    urlDatabase[randomString].longURL = req.body.longURL; 
    urlDatabase[randomString].userID = user.id;  //alpha-numeric string.
    res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {            //Route to /urls/:id, ":id" being a place holder for Express to see what path
    const templateVars = {  
        user: users[req.cookies["user_id"]],                    //matches this pattern.
        id: req.params.id, 
        longURL: urlDatabase[req.params.id].longURL
    };
    console.log(templateVars);
    res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {                       //Route to /u/:id which will redirect the user to the long url by using the short
    const longURL = urlDatabase[req.params.id].longURL; //url.
    if (!longURL) {
        return res.status(400).send("Short URL does not exist");
    }
    res.redirect(longURL);
});

app.get("/login", (req, res) => {
    const templateVars = {
        user: users[req.cookies["user_id"]]
    }
    if (!templateVars.user){
        return res.render("urls_login", templateVars);
    }
    console.log("Redirected to /urls");
    res.redirect("/urls");
})

app.post("/login", (req, res) => {
   const email = req.body.email;
    const password = req.body.password;
    
    if (!email || !password) {
        return res.status(400).send("No user with that email address found");
    }

    let foundUser = null;

    for (const userId in users) {
        const user = users[userId];
        if (user.email === email) {
            foundUser = user;
        }
    }

    if (!foundUser) {
        return res.status(400).send("No user with that email exists.");
    }

    if (foundUser.password !== password) {
        return res.status(400).send("Passwords do not match");
    }

    res.cookie("user_id", foundUser.id);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie("user_id")
    console.log(users);
    res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});