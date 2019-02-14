import expect from 'expect';
import request from 'supertest';
const {
  ObjectID
} = require('mongodb');
import User from '../modules/users/user.model';
import Post from '../modules/posts/post.model';
import app from '../src/index';
import slug from 'slug';

let user;
let postId;

before((done) => {
  User.remove({}, (err) => {
    done()
  });
})

before((done) => {
  Post.remove({}, (err) => {
    done()
  });
})

before((done) => {
  request(app)
    .post('/api/v1/users/signup')
    .send({
      email: "paulo23@me.com",
      password: "HelloWorld1",
      firstName: "pertamakali",
      lastName: "keduakali",
      userName: "PauloMan"
    })
    .end((err, response) => {
      user = response.body
      done()
    })
})

describe('POST new Post /post', () => {
  it('should create a new post', (done) => {

    request(app)
      .post('/api/v1/posts')
      .set('Authorization', user.token)
      .send({
        title: 'this is title baru ya',
        text: 'this is text baru'
      })
      .expect(201)
      .expect((res) => {
        postId = res.body._id
        expect(res.body.title).toBe('this is title baru ya');
        expect(res.body.text).toBe('this is text baru');
        expect(res.body.slug).toBe(slug('this is title baru ya'));
        expect(res.body.user).toBe(user._id);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
      });
    done()
  });

  it('should not create a new post with invalid data', (done) => {

    request(app)
      .post('/api/v1/posts')
      .set('Authorization', user.token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
      });
    done()
  });
})

describe('GET Post /post', () => {
    it('should get all posts', (done) => {
      request(app)
        .get('/api/v1/posts')
        .set('Authorization', user.token)
        .expect(200)
        .expect((res) => {
            expect(res.body.length).toBe(1);
          })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
        });
      done()
    });
  })


  describe('GET /post/:id', () => {
    it('should return todo doc', (done) => {
      request(app)
        .get(`/api/v1/posts/${postId}`)
        .set('Authorization', user.token)
        .expect(200)
        .expect((res) => {
            expect(res.body.title).toBe('this is title baru ya');
            expect(res.body.text).toBe('this is text baru');
            expect(res.body.slug).toBe(slug('this is title baru ya'));
            expect(res.body.user._id).toBe(user._id);
        })
        .end(done);
    });

    it('should not return post, if get by other user', (done) => {
        request(app)
          .get(`/api/v1/posts/${new ObjectID()}`)
          .set('Authorization', user.token)
          .expect(404)
          .end(done);
      });
})