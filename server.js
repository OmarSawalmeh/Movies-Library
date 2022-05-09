"use strict";

const express = require("express");
const app = express();
const axios = require("axios").default;

const { json } = require("express/lib/response");
app.use(express.json());

const cors = require("cors");
app.use(cors());

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

const movieData = require("./Movie Data/data.json");

require('dotenv').config();
const apiKey = process.env.API_KEY;
const apiKey2 = "a70154502a88b5d3146c6d6a216a09ea";
const port = 3000;
const databaseURL = "postgres://omarsawalmeh:omarynwa10@localhost:5432/movies";

const { Client } = require('pg');
const client = new Client(databaseURL);

// get .....
app.get("/", handleServer);
app.get("/favorite", handleFavorite);
app.get("/error", (req, res)=>res.send(error()));
app.get("/trending", handleTrend);
app.get("/search", handleSearch);
// TASK 13 & TASK 14 ----->
//CRUD:
app.post("/addMovie", handleAddMovies);               // Create
app.get("/getMovies", handleGetMovies);               // Read
app.put("/UPDATE/:movieName", handleUpdate);          // Update   ---> // UPDATE with params
app.delete("/DELETE/:movieName", handleDelete);       // Delete   ---> // DELETE with params
app.get("/getMovie/:movieName", handleGetMovieByName); 


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
    let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey2}&language=en-US`;
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
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey2}&language=en-US&query=${movieName}&page=2`;
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


// TASK 13 ----->
//dbs:
function handleAddMovies(req ,res){
    const name = req.body.name;
    const myComments = req.body.myComments;

    let sql = `INSERT INTO favMovies (name, myComments) VALUES ($1, $2) RETURNING *`;
    let values = [name, myComments];

    client.query(sql, values)
          .then(result=>{
              console.log(result.rows);
              res.status(201).json(result.rows[0]);
          })
          .catch(error=>{
              console.log(error);
          });
}

function handleGetMovies(req, res){
    let sql = `SELECT * FROM favMovies`;
    client.query(sql)
          .then(result=>{
            console.log(result.rows);
            res.status(201).json(result.rows);
          })
          .catch(error=>{
              console.log(error);
          });
}

// TASK 14 ----->
//dbs:
function handleUpdate(req, res){
    const movieName = req.params.movieName;
    const {name, myComments} = req.body;

    let sql = `UPDATE favMovies SET name = $1, myComments = $2 WHERE name = $3 RETURNING *;`
    let values = [name, myComments, movieName];

    client.query(sql, values)
          .then(result=>{
              res.json(result.rows[0]);
          })
          .catch(error=>{
            console.log(error);
        });
}

function handleDelete(req, res){
    const movieName = req.params.movieName;
    let sql = `DELETE FROM favMovies WHERE name = $1;`
    let values = [movieName];

    client.query(sql, values)
          .then(result=>{
              res.json(result.rows[0]);
          })
          .catch(error=>{
            console.log(error);
        });
}

function handleGetMovieByName(req, res){
    const movieName = req.params.movieName;
    let sql = `SELECT * FROM favMovies WHERE name = $1`;
    let values = [movieName];

    client.query(sql, values)
    .then(result=>{
        console.log(result.rows);
        res.status(201).json(result.rows);
    })
    .catch(error=>{
      console.log(error);
    });
}

client.connect().then(() => {
    app.listen(port, function(){
        console.log(`Server on port ${port}`);
    });
})

// Constructors  ...
function Movie(title, path, overview){
    this.title = title;
    this.path = path;
    this.overview = overview;
}

// Constructor  For Trend Movies ...
function Trend(id, title, releaseDate, posterPath, overview){
    this.id = id;
    this.title = title;
    this.releaseDate = releaseDate;
    this.posterPath = posterPath;
    this.overview = overview;
}

// Constructor  For Search Movies ..
function Search(id, title, overview, popularity, vote_average, vote_count){
    this.id = id;
    this.title = title;
    this.overview = overview;
    this.popularity = popularity;
    this.vote_average = vote_average;
    this.vote_count = vote_count;
}

