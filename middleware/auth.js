"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError, NotFoundError } = require("../expressError");
const User = require('../models/user');


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when user must be admin.
 *
 * If not, raises Unauthorized.
 */

async function ensureIsAdmin(req, res, next) {

  console.log("res.locals.user", res.locals.user);
  try {
    if (!res.locals.user) throw new UnauthorizedError();

    const user = await User.get(res.locals.user.username);

    if (user.isAdmin === false) throw new UnauthorizedError("Access denied");

    return next();

  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when user must be admin OR user in params.
 *
 * If not, raises Unauthorized.
 */

async function ensureUserAccess(req, res, next) {

  try {
    if (!res.locals.user) throw new UnauthorizedError();

    //checks if username from url is in database
    const searchUser = await User.get(req.params.username);
    if (searchUser === undefined) throw new NotFoundError();

    const user = res.locals.user;
    if (user.isAdmin === false && searchUser.username !== user.username) throw new UnauthorizedError("Access denied");

    return next();

  } catch (err) {
    return next(err);
  }
}




module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureUserAccess
};
