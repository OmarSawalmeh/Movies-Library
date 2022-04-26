"use strict";

const express = require("express");
const { json } = require("express/lib/response");
const app = express();
const movieData = require("./Movie Data/data.json");
const port = 3000;


// get .....
app.get("/", handleServer);
app.get("/favorite", handleFavorite);
app.get("/error", (req, res)=>res.send(error()));


// --> functions
function handleServer(req, res){
    let result = [];
    let title = movieData.title;
    let path = movieData.poster_path;
    let overview = movieData.overview;
    let newMovie = new Movie(title, path, overview);
    result.push(newMovie);
    // json.send(result);
    res.send(result);
}

function handleFavorite(req, res){
    res.send("Welcome to Favorite Page");
}

// Handling 404
app.get('*', function(req, res){
    let msg = {
        "status": 404,
        "responseText": "Sorry, something went wrong Web Page Not Found , Try Again"
        }
    res.send(msg);
  });

// Handling 500
app.use(function(error, req, res, next) {
    let msg = {
        "status": 500,
        "responseText": "Sorry, something went wrong"
    }
    console.log(err.stack)
    res.type("text/plain")
    res.status(500)
    res.send(msg)
});


app.listen(port, function(){
    console.log(`Server on port ${port}`);
})

// Constructor  ...
function Movie(title, path, overview){
    this.title = title;
    this.path = path;
    this.overview = overview;
}
