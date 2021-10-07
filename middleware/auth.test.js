"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureUserAccess,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");


describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});


describe("ensureUserAccess", function () {
  test("works for matching user", function () {
    expect.assertions(1);
    const req = { params: { username: "u1" } };
    const res = { locals: { user: { username: "u1", isAdmin:false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    console.log('setup works')
    ensureUserAccess(req, res, next);
  });
  test("works for admin", function () {
    expect.assertions(1);
    const req = { params: { username: "u1" } };
    const res = { locals: { user: { username: "admin1", isAdmin:true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureUserAccess(req, res, next);
  });

  test("unauth if username does not match login", function () {
    expect.assertions(1);
    const req = { params: { username: "u2" } };
    const res = { locals: { user: { username: "u1", isAdmin:false } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureUserAccess(req, res, next);
  });

  test("unauth if no user logged in", function () {
    expect.assertions(1);
    const req = { params: { username: "u1" } };
    const res = {};
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureUserAccess(req, res, next);
  });


});
