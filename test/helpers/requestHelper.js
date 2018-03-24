"use strict";
const request = require("supertest");
const app = require("../../");
const noop = () => {};

function put(path, payload, callback, done = noop, contentTypeRegExp = /application\/json/) {
  request(app)
    .put(path)
    .send(payload)
    .set("Host", "api.example.com")
    .expect("Content-Type", contentTypeRegExp)
    .end((err, res) => {
      if (err) return done(err);
      callback(res); //eslint-disable-line callback-return
      done();
    });
}

function get(path, callback, done = noop, contentTypeRegExp = /application\/json/, contentType = "application/json") {
  request(app)
    .get(path)
    .set("Content-Type", contentType)
    .set("Host", "api.example.com")
    .expect("Content-Type", contentTypeRegExp)
    .end((err, res) => {
      if (err) return done(err);
      callback(res); //eslint-disable-line callback-return
      done();
    });
}

function post(path, payload, callback, done = noop, contentType = "application/json") {
  request(app)
    .post(path)
    .set("Content-Type", contentType)
    .send(payload)
    .set("Host", "api.example.com")
    .end((err, res) => {
      if (err) return done(err);
      callback(res); //eslint-disable-line callback-return
      done();
    });
}

function del(path, callback, done = noop, contentTypeRegExp = /application\/json/) {
  request(app)
    .del(path)
    .set("Host", "api.example.com")
    .expect("Content-Type", contentTypeRegExp)
    .end((err, res) => {
      if (err) return done(err);
      callback(res); //eslint-disable-line callback-return
      done();
    });
}

function head(path, callback, done = noop, contentType = "application/json") {
  request(app)
    .head(path)
    .set("Content-Type", contentType)
    .set("Host", "api.example.com")
    .end((err, res) => {
      if (err) return done(err);
      callback(res); //eslint-disable-line callback-return
      done();
    });
}

module.exports = {
  get,
  put,
  post,
  del,
  head
};
