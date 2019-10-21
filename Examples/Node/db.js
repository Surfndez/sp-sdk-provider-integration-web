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
const sqlite3 = require("sqlite3");
const uuidv4 = require("uuid/v4");

let db;

function open() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database("./db.sqlite3", error => {
      if (error) {
        reject(error);
      }
      resolve(db);
    });
  });
}

function close() {
  return new Promise((resolve, reject) => {
    db.close(error => {
      if (error) {
        reject(error);
      }
      resolve(db);
    });
  });
}

async function get(query, params) {
  await open();

  const record = await new Promise((resolve, reject) => {
    db.get(query, params, (error, row) => {
      if (error) {
        reject(error);
      }
      resolve(row);
    });
  });

  await close();

  return record;
}

async function createUser(name, xciId, xciIdToken) {
  const id = uuidv4();
  const token = uuidv4();

  await get(
    "INSERT INTO users (id, token, name, xci_id, xci_id_token) VALUES ($id, $token, $name, $xciId, $xciIdToken)",
    {
      $id: id,
      $token: token,
      $name: name,
      $xciId: xciId,
      $xciIdToken: xciIdToken
    }
  );

  return {
    id,
    token,
    name,
    xciId,
    xciIdToken
  };
}

function fetchUserById(id) {
  return get("SELECT * FROM users WHERE id = $id", { $id: id });
}

function fetchUserByToken(token) {
  return get("SELECT * FROM users WHERE token = $token", { $token: token });
}

function fetchUserByXciId(xciId) {
  return get("SELECT * FROM users WHERE xci_id = $xciId", { $xciId: xciId });
}

module.exports = {
  createUser,
  fetchUserById,
  fetchUserByToken,
  fetchUserByXciId
};
