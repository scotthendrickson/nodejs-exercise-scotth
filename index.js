const express = require('express');
const request = require('request-promise');
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

// function retrieveAllPeople(req, res, next) {
//     const url = base_url + "people/";
//     request(url, handleApiResponse(res, next));
// }

// function retrieveAllPlanets(req, res, next) {
//     const url = base_url + "planets/";
//     request(url, handleApiResponse(res, next));
// }

async function retrieveAllPeople(req, res, next) {
    const url = base_url + "people/";
    await getAllPeople(url, res, next);
}

async function retrieveAllPlanets(req, res, next) {
    const url = base_url + "planets/";
    await getAllPlanets(url, res, next);
}

async function getAllPeople(url, res, next) {
    let all = [];
    let data = await request(url, handleApiResponse(res, next));
    await all.push.apply(all, JSON.parse(data).results);
    let keepGoing = true
    while (keepGoing) {
        data = await request(JSON.parse(data).next, handleApiResponse(res, next));
        await all.push.apply(all, JSON.parse(data).results)
        if (JSON.parse(data).next == null) {
            keepGoing = false;
        }
    }
    res.locals.results = all;
    return next();
}

async function getAllPlanets(url, res, next){
    let all = [];
    let data = await request(url, handleApiResponse(res, next));
    data = JSON.parse(data);
    data = await getIndividualPeople(data, res, next);
    await all.push.apply(all, data.results);
    let keepGoing = true
    while(keepGoing) {
        data = await request(data.next, handleApiResponse(res, next));
        data = JSON.parse(data);
        data = await getIndividualPeople(data, res, next);
        await all.push.apply(all, data.results)
        if (data.next == null){
            keepGoing = false;
        }
    }
    res.locals.results = all;
    return next();
}

async function getIndividualPeople(data, res, next){
    for (i = 0; i < data.results.length; i++) {
        for (x = 0; x < data.results[i].residents.length; x++) {
            let person = await request(data.results[i].residents[x], handleApiResponse(res, next));
            data.results[i].residents[x] = JSON.parse(person).name;
        }
    }
    return data;
}

function handleApiResponse(res, next) {
    return (err, response, body) => {
      if (err || body[0] === '<') {
        res.locals = {
          success: false,
          error: err || 'Invalid request. Please check your state variable.'
        };
        return next();
      }
        res.locals = {
            success: true,
            results: JSON.parse(body).results
        };
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