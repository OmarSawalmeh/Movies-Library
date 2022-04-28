"use strict";

const express = require("express");
const app = express();
const axios = require("axios").default;

const { json } = require("express/lib/response");

const cors = require("cors");
app.use(cors());

require('dotenv').config();
const apiKey = process.env.API_KEY;

const movieData = require("./Movie Data/data.json");
const port = 3000;


// get .....
app.get("/", handleServer);
app.get("/favorite", handleFavorite);
app.get("/error", (req, res)=>res.send(error()));
app.get("/trending", handleTrend);
app.get("/search", handleSearch);


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

// Function For Task 12.....
function handleTrend(req, res){
    let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US`;
    axios.get(url)
         .then(result =>{
             let moviesData = result.data.results;
             let trendMovies = moviesData.map(data =>{
                 return new Trend(data.id, data.title, data.release_date, data.poster_path, data.overview);
             })
            res.json(trendMovies);
         })
         .catch(error=>{
             console.log(error);
             res.send("Inside Catch");
         })
}

function handleSearch(req, res){
    let movieName = req.query.name;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${movieName}&page=2`;
    axios.get(url)
         .then(result =>{
             let movie = result.data.results;
             let searchMovies = movie.map(data =>{
                 return new Search(data.id, data.title, data.overview, data.popularity, data.vote_average, data.vote_count);
             })
             res.json(searchMovies);
         })
         .catch(error =>{
            console.log(error);
            res.send("Inside Catch");
         })
}


app.listen(port, function(){
    console.log(`Server on port ${port}`);
})

// Constructor  ...
function Movie(title, path, overview){
    this.title = title;
    this.path = path;
    this.overview = overview;
}

// Constructor  For Trend Movie ...
function Trend(id, title, releaseDate, posterPath, overview){
    this.id = id;
    this.title = title;
    this.releaseDate = releaseDate;
    this.posterPath = posterPath;
    this.overview = overview;
}

function Search(id, title, overview, popularity, vote_average, vote_count){
    this.id = id;
    this.title = title;
    this.overview = overview;
    this.popularity = popularity;
    this.vote_average = vote_average;
    this.vote_count = vote_count;
}
