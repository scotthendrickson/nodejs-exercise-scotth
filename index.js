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

function retrieveAllPeople(req, res, next) {
    const url = base_url + "people/";
    request(url, handleApiResponse(res, next));
}

// function retrieveAllPlanets(req, res, next) {
//     const url = base_url + "planets/";
//     request(url, handleApiResponse(res, next));
// }

async function retrieveAllPlanets(req, res, next) {
    const url = base_url + "planets/";
    await getAllPlanets(url, res, next);
}

async function getAllPlanets(url, res, next){
    let all = [];
    // let data = await retrievePlanets(url, res, next);
    // all = all.push.apply(all, JSON.parse(data).results)
    // let keepGoing = true
    // while(keepGoing) {
    //     console.log("Blarg Blarg Blarg");
    //     let data = await retrievePlanets(data.results.next, res, next);
    //     // data = await request(data.results.next, handleApiResponse(res, next));
    //     await all.push.apply(all, JSON.parse(data).results)
    //     if (JSON.parse(data).next !== null){
    //         keepGoing = false;
    //     }
    // }
    for (i = 1; i < 8; i++) {
        console.log(i);
        let data = await request(base_url + "planets/?page=" + i, handleApiResponse(res, next));
        await all.push.apply(all, JSON.parse(data).results);
    };
    res.locals.results = all;
    return next();
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
    console.log("This is the one");
    return res.json(res.locals);
}

const server = app.listen(3000, () => {
  const host = server.address().address,
    port = server.address().port;

  console.log('API listening at http://%s:%s', host, port);
});