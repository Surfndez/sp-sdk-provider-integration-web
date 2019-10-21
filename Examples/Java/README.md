![Logo](../../image/ZenKey_rgb.png)
# Example Application in Java

This example application is for developers integrating ZenKey into their Java web application. If you have not read the [Web Integration Guide](https://git.xcijv.net/mobiledevelopment/providerintegration-web/blob/master/README.md), read it before continuing.

## 1.0 Background

This example application is built on the Java Spring framework powered by Maven. A user can log in and log out using ZenKey as its authentication provider. Upon successful authentication, the application receives and parses the `id_token` from the authentication response to display the user's full name.

## 2.0 Getting Started

The ZenKey example application uses various Java libraries. To run the application, add the libraries, then install the dependencies and configure environment variables.

### 2.1 Libraries Used

- [Java Spring + Security](https://spring.io/)
- [Maven](https://maven.apache.org/)
- [Auth0](https://auth0.com/docs/jwks): used for parsing `jwks`

### 2.2 Installation

Requirements can be installed using Maven. There are several commands that will install dependencies for you, such as `mvn install`, `mvn package`, etc.

### 2.3 Environment Configuration

The `.env` file needs to be set up. Specific parameters can be found in the `.env.example` file, detailed below:

| Parameter        | Description  |
| ------------- | ------------- |  
|`CLIENT_ID` | Your ZenKey `clientId` obtained from the SP Portal. |  
|`CLIENT_SECRET` | Your ZenKey `Client_Secret` obtained from the SP Portal.|
|`SECRET_KEY_BASE` | A randomly-generated key to encrypt sessions. |  
|`BASE_URL=`   |  The base domain of this application/ |
|  |  Example: For auth.myapp.com, use `maypp.com` as the domain value |  
|`DISCOVERY_URL` | https://discoveryui.myzenkey.com/ui/visual-code?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&state=STATE |  

## 3.0 Running the Application

After installing the required dependencies and configuring the environment variables, use `JavademoApplication.java` as the entry point to run this application.

### 3.1 Parsing the `id_token`

After a user has successfully logged in, the `/user` endpoint in `UserController.java` is called to parse through the `id_token` in session. In the application, we demonstrate basic parsing by displaying the user's full name.

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
