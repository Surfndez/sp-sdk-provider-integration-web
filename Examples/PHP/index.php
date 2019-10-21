<?php
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
session_start();

require __DIR__ . "/vendor/autoload.php";

?>

<!DOCTYPE html>
<html>
<head>
    <title></title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <link rel="stylesheet" href="/stylesheets/style.css">
</head>
<body>
<nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top"><a class="navbar-brand" href="/">XCI-DemoApp-PHP</a>
    <ul class="navbar-nav ml-auto">
        <li class="nav-item">
            <?php if (isset($_SESSION["signedIn"])) : ?>
                <a class="nav-link" href="/logout.php">Sign Out</a>
            <?php else : ?>
                <a class="nav-link" href="/auth.php">Sign In</a>
            <?php endif ?>
        </li>
    </ul>
</nav>
<main class="container" role="main">
    <h1>Home</h1>
    <?php if (isset($_SESSION["signedIn"])) : ?>
        <p>Welcome, <?php echo $_SESSION["name"] ?>.</p>
    <?php else : ?>
        <p>Please <a href="/auth.php">sign in</a>.</p>
    <?php endif ?>
</main>
</body>
</html>
