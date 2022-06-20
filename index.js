// @ts-check
// import "express";
// import "http";
// import "path";
const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const server = new http.Server(app);

const port = 8000;

server.listen(port, function() {
    console.log("Starting server on port " + port);
});

app.set("port", port);
app.use("/static", express.static(__dirname + "/static"));


// http routing
app.get("/", function(request, response) {
    response.sendFile(path.join(__dirname, "static/views/index.html"));
});