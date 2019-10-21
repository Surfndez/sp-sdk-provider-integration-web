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
const express = require("express");
const passport = require("passport");

const db = require("../db");
const utilities = require("../utilities");

const router = express.Router();
const { asyncUtil } = utilities;

router.post(
  "/auth",
  asyncUtil(async (req, res) => {
    const { code, mccmnc } = req.body;

    // TODO: Return real token.
    return res.json({ token: "8d0b2a6b-11b5-4640-b632-424366aaa62c" });

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const redirectUri = `${process.env.BASE_URL}/auth/cb`;

    const client = await utilities.discoverClient(
      clientId,
      clientSecret,
      redirectUri,
      mccmnc
    );

    const reqParams = client.callbackParams(req);

    const checks = {
      response_type: "code"
    };

    const tokenSet = await client.authorizationCallback(redirectUri, reqParams, checks);
    const userInfo = await client.userinfo(tokenSet);

    const { sub: xciId, name } = userInfo;
    const { id_token: xciIdToken } = tokenSet;

    let user = await db.fetchUserByXciId(xciId);

    if (!user) {
      user = await db.createUser(name, xciId, xciIdToken);
    }

    return res.json({ token: user.token });
  })
);

router.get("/public", (req, res) => {
  res.json({ message: "Public" });
});

router.get("/private", passport.authenticate("bearer"), (req, res) => {
  res.json({ message: "Private" });
});

module.exports = router;
