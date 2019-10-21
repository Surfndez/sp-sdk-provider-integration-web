/*
 * Copyright 2019 XCI JV, LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const { encode } = require("base64url");
const { randomBytes } = require("crypto");
const openIdClient = require("openid-client");

const constants = require("./constants");
const db = require("./db");

const { Issuer } = openIdClient;

const asyncUtil = fn =>
  function asyncUtilWrap(...args) {
    const fnReturn = fn(...args);
    const next = args[args.length - 1];

    return Promise.resolve(fnReturn).catch(next);
  };

function serializeUser(user, done) {
  if (user) {
    return done(null, user.id);
  }

  return done(new Error("Cannot serialize user."));
}

async function deserializeUser(id, done) {
  const user = await db.fetchUserById(id);

  if (user) {
    return done(null, user);
  }

  return done(new Error("Cannot deserialize user."));
}

function deserializeUserMiddleware(err, req, res, next) {
  if (err && err.message === "Cannot deserialize user.") {
    req.logout();
    res.redirect("/");
  } else {
    next();
  }
}

async function discoverClient(clientId, clientSecret, redirectUri, mccmnc) {
  const issuer = await Issuer.discover(
    `${
      constants.openIdConfigurationEndpoint
    }?client_id=${clientId}&mccmnc=${mccmnc}`
  );

  return new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [redirectUri],
    response_types: ["code"]
  });
}

function random(bytes = 32) {
  return encode(randomBytes(bytes));
}

function userMiddleware({ user }, { locals }, next) {
  // eslint-disable-next-line no-param-reassign
  locals.user = user;
  next();
}

module.exports = {
  asyncUtil,
  serializeUser,
  deserializeUser,
  deserializeUserMiddleware,
  discoverClient,
  random,
  userMiddleware
};
