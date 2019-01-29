'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const helmet      = require('helmet');
const MongoClient = require('mongodb').MongoClient;

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //USED FOR FCC TESTING PURPOSES ONLY!

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet({
  noCache: true,
  hidePoweredBy: {
    setTo: 'PHP 4.2.0'
  }
}));

const client = new MongoClient(process.env.DATABASE_URI, { useNewUrlParser: true });

client.connect()
  .then(() => {
    console.log('Successfully connected to database');
  
    const db = client.db('fcc');

    fccTestingRoutes(app);
    apiRoutes(app, db);  

    app.route('/')
    .get(function (req, res) {
      res.sendFile(process.cwd() + '/views/index.html');
    });
  
    app.use((req, res, next) => {
      res.status(404)
        .type('text')
        .send('Not Found');
    });

    //Start our server and tests!
    app.listen(process.env.PORT || 3000, () => {
      console.log("Listening on port " + process.env.PORT);
      if(process.env.NODE_ENV==='test') {
        console.log('Running Tests...');
        setTimeout(() => {
          try {
            runner.run();
          } catch(e) {
            const error = e;
              console.log('Tests are not valid:');
              console.log(error);
          }
        }, 1500);
      }
    });
  
  })
  .catch(err => {
    console.error('Error Connecting to database');
    console.error(err);
  });


module.exports = app; //for unit/functional testing
