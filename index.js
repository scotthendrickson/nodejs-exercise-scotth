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

app.get('/people/:sortby/',
    retrieveAllPeople,
    jsonResponse
);

app.get('/people/:sortby/:order',
    retrieveAllPeople,
    jsonResponse
);

app.get('/planets',
    retrieveAllPlanets,
    jsonResponse
);

async function retrieveAllPeople(req, res, next) {
    const url = base_url + "people/";
    await getAllPeople(url, req, res, next);
}

async function retrieveAllPlanets(req, res, next) {
    const url = base_url + "planets/";
    await getAllPlanets(url, res, next);
}

async function getAllPeople(url, req, res, next) {
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
    if (req.params.sortby && !req.params.order) {
        all.sort(compareValues(req.params.sortby));
    } else if (req.params.sortby && req.params.order) {
        all.sort(compareValues(req.params.sortby, req.params.order));
    } else {
        all.sort(compareValues("name"));
    }
    res.locals.results = all;
    return next();
}

async function getAllPlanets(url, res, next){
    let all = [];
    let data = await request(url, handleApiResponse(res, next));
    data = JSON.parse(data);
    data = await getResidentsNames(data, res, next);
    await all.push.apply(all, data.results);
    let keepGoing = true
    while(keepGoing) {
        data = await request(data.next, handleApiResponse(res, next));
        data = JSON.parse(data);
        data = await getResidentsNames(data, res, next);
        await all.push.apply(all, data.results)
        if (data.next == null){
            keepGoing = false;
        }
    }
    res.locals.results = all;
    return next();
}

async function getResidentsNames(data, res, next){
    for (i = 0; i < data.results.length; i++) {
        for (x = 0; x < data.results[i].residents.length; x++) {
            let person = await request(data.results[i].residents[x], handleApiResponse(res, next));
            data.results[i].residents[x] = JSON.parse(person).name;
        }
    }
    return data;
}

function compareValues(key, order = 'asc') {
    return function (a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            return 0;
        }

        const varA = (typeof a[key] === 'string') ?
            a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string') ?
            b[key].toUpperCase() : b[key];

        let comparison = 0;
        if (varA > varB) {
            comparison = 1;
        } else if (varA < varB) {
            comparison = -1;
        }
        return (
            (order == 'desc') ? (comparison * -1) : comparison
        );
    };
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