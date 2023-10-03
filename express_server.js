const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
    const result = Math.random().toString(36).slice(7); //Function to generate a random 6 character alpha-numeric string.
    return result;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {       //Route to /urls.json shows all urls in urlDatabase.
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

app.get("/urls", (req, res) => {
    const templateVars = {urls: urlDatabase };  //Route to /urls shows all urls in urlDatabase, but formatted with html 
    res.render("urls_index", templateVars);     //from "urls_index.ejs". templeVars has been defined so the ejs file can access
});                                             //those variabls.

app.get("/urls/new", (req, res) => {            //Route to /urls/new for the page for creating new short urls.
    res.render("urls_new");
});

app.post("/urls", (req, res) => {                   //Route after the POST submission of the new short url. User gets redirected to
    const randomString = generateRandomString();    // /urls/randomString which will show the long url entered and the 6 character
    urlDatabase[randomString] = req.body.longURL;   //alpha-numeric string.
    res.redirect(`/urls/${randomString}`);
});

app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body.longURL;
    res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {            //Route to /urls/:id, ":id" being a place holder for Express to see what path
    const templateVars = {                      //matches this pattern.
        id: req.params.id, 
        longURL: urlDatabase[req.params.id]
    };
    res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {               //Route to /u/:id which will redirect the user to the long url by using the short
    const longURL = urlDatabase[req.params.id]; //url.
    console.log(req.params.id);
    res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});