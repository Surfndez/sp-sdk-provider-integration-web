![Logo](../../image/ZenKey_rgb.png)

# ZenKey Example Application in Node.js

This is an example application that demonstrates how to integrate ZenKey into a Node.js web application. If you have not read the [Web Integration Guide](https://git.xcijv.net/mobiledevelopment/providerintegration-web/blob/master/README.md), read it before continuing.

## 1.0 Background

The example application is built using [Express](https://github.com/expressjs/express), a popular framework for building web application in Node.js. It uses [Passport](https://github.com/jaredhanson/passport) as authentication middleware and [openid-client](https://github.com/panva/node-openid-client) as the OpenID client.

Users can sign in using ZenKey via web browser. When authenticated, they can see their name and account balance.

The application also exposes endpoints that can be used by native clients (iOS, Android, etc) to authenticate and make other API requests.

## 2.0 Getting Started

The ZenKey example application uses a few Node.js packages. To run the application, install the dependencies, then configure environment variables.

### 2.1 Dependencies
- [Express](https://github.com/expressjs/express)
- [Passport](https://github.com/jaredhanson/passport)
- [openid-client](https://github.com/panva/node-openid-client)

### 2.2 Installation

Install dependencies using [Yarn](https://yarnpkg.com/).

```
yarn install
```

### 2.3 Configure Environment

Storing [configuration in the environment](http://12factor.net/config) is one of the tenets of a [twelve-factor app](http://12factor.net).

If running locally, create and configure a `.env` file based on `.env.example`.

```
cp .env.example .env
```

Otherwise, configure the environment variables in your server environment.

| Parameter        | Description  |
| ------------- | ------------- |  
|`CLIENT_ID` | Your ZenKey `clientId` obtained from the SP Portal. |  
|`CLIENT_SECRET` | Your ZenKey `Client_Secret` obtained from the SP Portal.|
|`SECRET_KEY_BASE` | A randomly-generated key to encrypt sessions. |  
|`BASE_URL=`   |  The base domain of this application/ |
|  |  Example: For auth.myapp.com, use `maypp.com` as the domain value |  
|`DISCOVERY_URL` | https://discoveryui.myzenkey.com/ui/visual-code?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&state=STATE |  

## 3.0 Start the Server

Start the server using the start script:

```
yarn start
```

## Support

For technical questions, contact [support](mailto:techsupport@mobileauthtaskforce.com).

## License

Copyright 2019 XCI JV, LLC.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

NOTICE: © 2019 XCI JV, LLC. ZENKEY IS A TRADEMARK OF XCI JV, LLC. ALL RIGHTS RESERVED. THE INFORMATION CONTAINED HEREIN IS NOT AN OFFER, COMMITMENT, REPRESENTATION OR WARRANTY AND IS SUBJECT TO CHANGE

## Revision History

| Date      | Version | Description                                   |
| --------- | ------- | --------------------------------------------- |
| 8.30.2019 | 0.9.2  |  Added section numbers; Added revision history; Clarified variables. |

<sub> Last Update:
Document Version 0.9.2 - August 30, 2019</sub>
