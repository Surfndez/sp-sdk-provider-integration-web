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

$dotenv = Dotenv\Dotenv::create(__DIR__);
$dotenv->load();

$xciSession = new stdClass();
$xciSession->state = random();

$_SESSION["xci"] = json_encode($xciSession);

header("Location: https://discoveryui.myzenkey.com/ui/visual-code?client_id={$_SERVER["CLIENT_ID"]}&redirect_uri={$_SERVER["BASE_URL"]}/auth/cb.php&state={$xciSession->state}");

function random($length = 32)
{
    return bin2hex(random_bytes($length / 2));
}
