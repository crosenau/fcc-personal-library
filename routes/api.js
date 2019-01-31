/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const ObjectID = require('mongodb').ObjectID;

function validateInputs(req, res, next) {
  // Checks all user inputs and returns appropriate errors if any are invalid
  
  const inputSets = [req.query, req.body, req.params];
  
  for (let inputs of inputSets) {
    for (let key in inputs) {
      switch (key) {
        case '_id':
        case 'id':
          if (!ObjectID.isValid(inputs[key])) {
            return res.send('invalid _id');
            break;
          } 
        case 'title':
          if (req.method !== 'DELETE' && inputs[key] === '') {
            return res.send('missing title');
            break;
          }
      }
    }
  }
  
  next();
}

function sanitize(input) {
  // Strip out '<' and '>' characters to prevent HTML injection.
  
  return input      
    .replace(/\</gm, '&lt')
    .replace(/\>/gm, '&gt');
}


module.exports = (app, db) => {

  app.route('/api/books')
    .all(validateInputs)
  
    .get((req, res) => {
      db.collection('books').find({}).toArray()
        .then(result => {
          return res.json(result.map(obj => {
            return {
              _id: obj._id,
              title: obj.title,
              commentcount: obj.comments.length
            };
          }));
        })
        .catch(err => {
          console.error(err);
          res.send('error retrieving book list');
        });
    })
    
    .post((req, res) => {
      const document = {
        title: sanitize(req.body.title),
        comments: []
      };
    
      db.collection('books').insertOne(document)
        .then(result => res.json(result.ops[0]))
        .catch(err => {
          console.error(err);
          res.send('Could not add book');
        });
    })
    
    .delete((req, res) => {    
      db.collection('books').deleteMany({})
        .then(result => {
          if (result.deletedCount === 0) {
            res.send('no books found to delete');
          } else {
            res.send('complete delete successful');
          }
        })
        .catch(err => {
          console.error(err);
          res.send('Delete failed');
        });
    });


  app.route('/api/books/:id')
    .all(validateInputs)
  
    .get((req, res) => {
      const filter = { _id: ObjectID(req.params.id) };
    
      db.collection('books').findOne(filter)
        .then(result => {
          if (result) {
            return res.json(result);
          }
        
          res.send('no book exists');
        })
        .catch(err => {
          console.error(err);
          res.send('error finding book');
        });
    })
    
    .post((req, res) => {
      const filter = { _id: ObjectID(req.params.id) };
      const comment = sanitize(req.body.comment);
    
      db.collection('books').findOneAndUpdate(filter, {$push: { comments: comment } }, { returnOriginal: false })
        .then(result => {
          if (result.lastErrorObject.updatedExisting) {
              res.json(result.value);
            } else {
              res.send('could not add comment');
            }
        })
        .catch(err => {
          console.error(err);
          res.send('error adding comment');
        });
    })
    
    .delete((req, res) => {
      const bookid = ObjectID(req.params.id);
    
      db.collection('books').deleteOne({ _id: bookid })
        .then(result => {
          if (result.deletedCount > 0) {
            return res.send('delete successful');
          }
        
          res.send(`could not delete book with _id ${bookid}`);
        })
        .catch(err => {
          console.error(err);
          res.send('Error deleting book');
        });
    });
  
};
