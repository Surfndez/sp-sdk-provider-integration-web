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
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const createError = require("http-errors");
const express = require("express");
const helmet = require("helmet");
const logger = require("morgan");
const passport = require("passport");
const passportHttpBearer = require("passport-http-bearer");
const path = require("path");

const db = require("./db");
const utilities = require("./utilities");
const XciStrategy = require("./xciStrategy");

const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");
const mockRouter = require("./routes/mock");

const { Strategy: HttpBearerStrategy } = passportHttpBearer;

async function app() {
  passport.use(
    "bearer",
    new HttpBearerStrategy(async (token, done) => {
      const user = await db.fetchUserByToken(token);

      return done(null, user);
    })
  );

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const redirectUri = `${process.env.BASE_URL}/auth/cb`;
  const scope = "openid profile";

  passport.use(
    "xci",
    new XciStrategy(
      clientId,
      clientSecret,
      redirectUri,
      scope,
      async (tokenSet, userInfo, done) => {
        const { sub: xciId, name } = userInfo;
        const { id_token: xciIdToken } = tokenSet;

        let user = await db.fetchUserByXciId(xciId);

        if (!user) {
          user = await db.createUser(name, xciId, xciIdToken);
        }

        return done(null, user);
      }
    )
  );

  passport.serializeUser(utilities.serializeUser);
  passport.deserializeUser(utilities.deserializeUser);

  const app = express();
  app.use(helmet());

  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "pug");

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(
    cookieSession({
      name: "session",
      keys: [process.env.SECRET_KEY_BASE]
    })
  );
  app.use(express.static(path.join(__dirname, "public")));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(utilities.deserializeUserMiddleware);
  app.use(utilities.userMiddleware);

  app.use("/", indexRouter);
  app.use("/api", apiRouter);
  app.use("/mock", mockRouter);

  // start authentication request
  app.get("/auth", passport.authenticate("xci"));

  // authentication callback
  app.get(
    "/auth/cb",
    passport.authenticate("xci", {
      successRedirect: "/",
      failureRedirect: "/auth"
    })
  );

  app.get("/logout", function logout(req, res) {
    req.logout();
    res.redirect("/");
  });

  // catch 404 and forward to error handler
  app.use(function catch404(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function errorHandler(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

  return app;
}

module.exports = app;
