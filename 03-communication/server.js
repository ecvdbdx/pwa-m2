const express = require("express");

const app = express();

/* In real life, static files are better served by a web server like Apache or NginX */
app.use("/", express.static(__dirname + "/public"));

app.listen("8003", () => {
  console.log("App started on port 8003");
});
