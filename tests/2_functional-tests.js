/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', (done) => {
     chai.request(server)
      .get('/api/books')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', () => {


    suite('POST /api/books with title => create book object/expect book object', () => {
      
      test('Test POST /api/books with title', (done) => {
        const title = 'POST Unit Test 1';
        chai.request(server)
          .post('/api/books')
          .send({ title })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Object should have an _id');
            assert.property(res.body, 'title', 'Object should have a title');
            assert.property(res.body, 'comments', 'Object should have a "comments" property');
            assert.isArray(res.body.comments, 'The comments property should be an array');
            assert.lengthOf(res.body.comments, 0, 'The comments array should have a length of 0');
            done();
          });
      });
      
      test('Test POST /api/books with no title given', (done) => {
        chai.request(server)
          .post('/api/books')
          .send({ title: '' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing title', 'Response should be "missing title"');
            done();
          });
      });
    });


    suite('GET /api/books => array of books', () => {
      
      test('Test GET /api/books', (done) => {
        chai.request(server)
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'Response should be an array of books');
            assert.property(res.body[0], '_id', 'Each book should have an _id');
            assert.property(res.body[0], 'title', 'Each book should have a title');
            assert.property(res.body[0], 'commentcount', 'Each book should have a commentcount property');
            done();
          });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', () => {
      
      test('Test GET /api/books/[id] with id not in db', (done) => {
        chai.request(server)
          .get('/api/books')
          .query({ _id: '5c4f9fe37389b3006d148114' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db', (done) => {
        chai.request(server)
          .get('/api/books')
          .query({ _id: '5c4fbd618eaf5f6d11f67539' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'Response should be an object');
            assert.property(res.body, '_id', 'Response should have an _id');
            assert.property(res.body, 'title', 'Response should have a title');
            assert.property(res.body, 'comments', 'Response should have a comments property');
            assert.isArray(res.body.comments, '"comments" should be an array');
            done();
          });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', () => {
      
      test('Test POST /api/books/[id] with comment', (done) => {
        //done();
      });
      
    });

  });

});
