const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();

app.use(cors());

const base_url = "https://swapi.co/api/"

app.get('/people',
    retrieveAllPeople,
    jsonResponse
);

app.get('/planets',
    retrieveAllPlanets,
    jsonResponse
);

function retrieveAllPeople(req, res, next) {
    const url = base_url + "people/";
    request(url, handleApiResponse(res, next));
}

function retrieveAllPlanets(req, res, next) {
    const url = base_url + "planets/";
    request(url, handleApiResponse(res, next));
}


function handleApiResponse(res, next) {
  return (err, response, body) => {
    if (err || body[0] === '<') {
      res.locals = {
        success: false,
        error: err || 'Invalid request. Please check your parameters.'
      };
      return next();
    }
    res.locals = {
      success: true,
      results: JSON.parse(body).results
    };
    return next();
  };
}

function jsonResponse(req, res, next) {
  return res.json(res.locals);
}

const server = app.listen(3000, () => {
  const host = server.address().address,
    port = server.address().port;

  console.log('API listening at http://%s:%s', host, port);
});