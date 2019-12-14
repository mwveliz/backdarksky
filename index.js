//set up dependencies
const express = require("express");
const redis = require("redis");
const bodyParser = require("body-parser");
const credentials = require('./apiCredentials.json'); //credentials for Darksy API
const unirest = require('unirest');
const retry = require('retry');
const cors = require('cors');

// configuration
const operation = retry.operation({
  retries: 3,           // try 1 time and retry 2 times if needed, total = 10
  minTimeout: 1 * 1000, // the number of milliseconds before starting the first retry
  maxTimeout: 3 * 1000  // the maximum number of milliseconds between two retries
});

//count number of calls 
calls = 0;


//setup port constants
const port_redis = process.env.PORT || 6379;
const port = process.env.PORT || 5000;

//configure redis client on port 6379
const redis_client = redis.createClient(port_redis);

//configure express server
const app = express();

//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('*', function(req, res, next) {
res.header("Access-Control-Allow-Origin", "http://localhost:3600");
res.header("Access-Control-Allow-Headers", "X-Requested-With");
res.header('Access-Control-Allow-Headers', 'Content-Type');
res.header('Access-Control-Allow-Credentials', true);
next(); 
});

//enable pre-flight
app.options('*', cors());

//Middleware Function to Check Cache
checkCache = (req, res, next) => {
  const { lat ,lon } = req.params;
  const ahora = Math.floor(new Date() / 10000000).toString()+'0000';//cada 10k seg
  redis_client.get(lat+','+lon+','+ahora,
                                 (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
    if (data != null) {
      console.log("Found cache")
      res.send(
      JSON.stringify({
           lat: lat,
           lon: lon,
           temp: data,
         })
      
      );
    } else {
      next();
    }
  });
};



//lamado del api
callApi = (req, res) =>{
    const { lat, lon } = req.params;
    console.log(`call number ${calls}`)
    let request = unirest.get(`https://${credentials.host}/${credentials.apiKey}/${lat},${lon}`);
    calls = calls + 1
    request.end(response => {
        //si hay error o ocurrio 10% dde probabilidad
        if (response.error || Math.random()<0.1) return response.error;
        
        const temperature = response.body.currently.temperature; 
    //add data to Redis
    const ahora = Math.floor(new Date() / 10000000).toString()+'0000'; //cada 2.7h
     //redis_client.geoadd('locations', lat, lon,  +lat+','+lon+','+ ahora);
     redis_client.set(lat+','+lon+','+ ahora, temperature)
     const data = JSON.stringify({
           lat: lat,
           lon: lon,
           temp: temperature,
         })
     
    //res.json(data);
     return data;    
    });
    
}

//tolerante a fallos
faultTolerantApiCall = (input, callback) => {
  operation.attempt( (currentAttempt) => {
    callApi(input, (err, result) => {
      console.log('Current attempt: ' + currentAttempt);
      if (operation.retry(err)) {  // retry if needed
          return;
      }
      callback(err ? operation.mainError() : null, result);
    });
  });
}



//  Endpoint:  GET /darksky/:lat:lon
//  @desc Return lat lon temp json
app.get("/darksky/:lat/:lon", checkCache,  (req, res) => {

  try {
    faultTolerantApiCall(req, (err, result) => {
        console.log(err, result);
        return res.status(200).json(result)
      });      
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

app.listen(port, '0.0.0.0', () => console.log(`Server running on Port ${port}`));
