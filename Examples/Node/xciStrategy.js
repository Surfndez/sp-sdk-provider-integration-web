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
const passport = require("passport-strategy");

const constants = require("./constants");
const utilities = require("./utilities");

function verified(error, user) {
  if (error) {
    this.error(error);
  } else {
    this.success(user);
  }
}

class XciStrategy extends passport.Strategy {
  constructor(clientId, clientSecret, redirectUri, scope, verify) {
    super();

    this.name = "xci";
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
    this.scope = scope;
    this.verify = verify;
    this.state = utilities.random();
  }

  async authenticate(req) {
    try {
      const {
        code,
        error,
        login_hint_token: loginHintToken,
        mccmnc,
        state
      } = req.query;

      if (error) {
        throw new Error(error);
      }

      // Authorize
      if (mccmnc && state) {
        if (state !== this.state) {
          throw new Error("state mismatch");
        }

        req.session.xci = {
          mccmnc,
          state: utilities.random()
        };

        const client = await utilities.discoverClient(
          this.clientId,
          this.clientSecret,
          this.redirectUri,
          mccmnc
        );

        const params = {
          login_hint_token: loginHintToken,
          redirect_uri: this.redirectUri,
          response_type: "code",
          scope: this.scope,
          state: req.session.xci.state
        };

        const authorizationUrl = client.authorizationUrl(params);

        this.redirect(authorizationUrl);
        return;
      }

      // Token
      if (code && state) {
        const client = await utilities.discoverClient(
          this.clientId,
          this.clientSecret,
          this.redirectUri,
          req.session.xci.mccmnc
        );

        const reqParams = client.callbackParams(req);

        const checks = {
          response_type: "code",
          state: req.session.xci.state
        };

        const tokenSet = await client.authorizationCallback(
          this.redirectUri,
          reqParams,
          checks
        );

        const userInfo = await client.userinfo(tokenSet);

        try {
          delete req.session.xci;
        } catch (e) {} // eslint-disable-line no-empty

        this.verify(tokenSet, userInfo, verified.bind(this));
        return;
      }

      // Discovery
      const discoveryUrl = `${constants.discoveryEndpoint}?client_id=${
        this.clientId
      }&redirect_uri=${this.redirectUri}&state=${this.state}`;

      this.redirect(discoveryUrl);
    } catch (e) {
      this.error(e);
    }
  }
}

module.exports = XciStrategy;
