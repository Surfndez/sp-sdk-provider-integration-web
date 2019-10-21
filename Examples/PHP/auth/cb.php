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

require __DIR__ . "/../vendor/autoload.php";

use \League\OAuth2\Client\Provider\GenericProvider;

$dotenv = Dotenv\Dotenv::create(__DIR__ . "/..");
$dotenv->load();

try {
    if (isset($_GET["error"])) {
        throw new Exception($_GET["error"]);
    }

    // Authorize
    if (isset($_GET["mccmnc"]) && isset($_GET["state"])) {
        checkState($_GET["state"]);

        $provider = discoverProvider($_SERVER["CLIENT_ID"], $_SERVER["CLIENT_SECRET"], "{$_SERVER["BASE_URL"]}/auth/cb.php", $_GET["mccmnc"]);

        $authorizationUrl = "{$provider->getAuthorizationUrl()}&login_hint_token={$_GET["login_hint_token"]}&scope=openid profile";

        $xciSession = new stdClass();
        $xciSession->mccmnc = $_GET["mccmnc"];
        $xciSession->state = $provider->getState();

        $_SESSION["xci"] = json_encode($xciSession);

        header("Location: {$authorizationUrl}");
        return;
    }

    // Token
    if (isset($_GET["code"]) && isset($_GET["state"])) {
        checkState($_GET["state"]);

        $xciSession = json_decode($_SESSION["xci"]);

        $provider = discoverProvider($_SERVER["CLIENT_ID"], $_SERVER["CLIENT_SECRET"], "{$_SERVER["BASE_URL"]}/auth/cb.php", $xciSession->mccmnc);

        $accessToken = $provider->getAccessToken("authorization_code", [
            "code" => $_GET["code"]
        ]);

        $resourceOwner = $provider->getResourceOwner($accessToken);

        $_SESSION["signedIn"] = true;
        $_SESSION["name"] = $resourceOwner->toArray()["name"];

        header("Location: /");
        return;
    }

    // Discovery

    $xciSession = new stdClass();
    $xciSession->state = random();

    $_SESSION["xci"] = json_encode($xciSession);

    header("Location: https://discoveryui.myzenkey.com/ui/visual-code?client_id={$_SERVER["CLIENT_ID"]}&redirect_uri={$_SERVER["BASE_URL"]}/auth/cb.php&state={$xciSession->state}");
} catch (Exception $e) {
    echo $e->getMessage();
}

function checkState($state)
{
    $xciSession = json_decode($_SESSION["xci"]);

    if ($state !== $xciSession->state) {
        throw new Exception("state mismatch");
    }
}

function discoverProvider($clientId, $clientSecret, $redirectUri, $mccmnc)
{
    $openIdConfiguration = openIdConfiguration($mccmnc);

    $provider = new GenericProvider([
        "clientId" => $clientId,
        "clientSecret" => $clientSecret,
        "redirectUri" => $redirectUri,
        "urlAuthorize" => $openIdConfiguration->authorization_endpoint,
        "urlAccessToken" => $openIdConfiguration->token_endpoint,
        "urlResourceOwnerDetails" => $openIdConfiguration->userinfo_endpoint
    ]);

    return $provider;
}

function openIdConfiguration($mccmnc)
{
    $url = "https://discoveryissuer.myzenkey.com/.well-known/openid_configuration?client_id={$_SERVER["CLIENT_ID"]}&mccmnc=${mccmnc}";
    $contents = file_get_contents($url);
    $decoded = json_decode($contents);

    return $decoded;
}

function random($length = 32)
{
    return bin2hex(random_bytes($length / 2));
}

?>
