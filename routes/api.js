/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const expect = require('chai').expect;
const ObjectID = require('mongodb').ObjectID;

function inputsToDatabaseObject(inputs) {
  const DBObj = {};
  
  for (let key in inputs) {
    switch (key) {
      case '_id':
        if (isValidIdString(inputs[key])) {
          DBObj[key] = ObjectID(inputs[key])
          break;
        } 
        
        return new Error('invalid _id');
      case 'title':
        if (inputs[key] && inputs[key] !== '') {
          DBObj[key] = sanitizeInputs(inputs[key]);
          break;
        }
        
        return new Error('missing title');
      default:
        DBObj[key] = sanitizeInputs(inputs[key]);
    }
  }
  
  return DBObj;
}

function isValidIdString(string) {
  // Determine if an input string can be converted to a valid mongodb.ObjectID
  
  try {
    return ObjectID(string) instanceof ObjectID;
  } catch(err) {
    return false;
  }
}

function sanitizeInputs(inputs) {
  return inputs        
    .replace(/\</gm, '&lt')
    .replace(/\>/gm, '&gt');
}

module.exports = (app, db) => {

  app.route('/api/books')
  
    .all((req, res, next) => {
      let inputs;
    
      if (Object.keys(req.body).length > 0) {
        inputs = req.body;
      } else {
        inputs = req.query;
      }
      
      const databaseObj = inputsToDatabaseObject(inputs);
    
      if (databaseObj instanceof Error) {
        return res.send(databaseObj.message);
      }
    
      req.databaseObj = databaseObj;
      next();
    })
  
    .get((req, res) => {
      const query = req.databaseObj;
    
      db.collection('books').find(query).toArray()
        .then(result => {
          if (result.length === 0) {
            return res.send('no book exists');
          } else if (Object.keys(query).length === 0) {
            return res.json(result.map(obj => {
              return {
                _id: obj._id,
                title: obj.title,
                commentcount: obj.comments.length
              };
            }));
          } else {
            return res.json(result[0]);
          }
        })
        .catch(err => {
          console.error(err);
          res.send('error retrieving book list');
        });
    })
    
    .post((req, res) => {
      const document = req.databaseObj;
    
      document.comments = [];
    
      db.collection('books').insertOne(document)
        .then(result => res.json(result.ops[0]))
        .catch(err => {
          console.error(err);
          res.send('Could not add book');
        });
    })
    
    .delete((req, res) => {
      //if successful response will be 'complete delete successful'
      const deleteQuery = req.databaseObj;
    
      console.log(deleteQuery);
    });



  app.route('/api/books/:id')
    .get((req, res) => {
      const bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post((req, res) => {
      const bookid = req.params.id;
      const comment = req.body.comment;
      //json res format same as .get
    })
    
    .delete((req, res) => {
      const bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
  
};
