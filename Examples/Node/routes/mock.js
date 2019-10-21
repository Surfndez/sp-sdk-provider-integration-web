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
const path = require("path");

const router = express.Router();

// TODO: Remove
router.get("/config", (req, res) => {
  return res.json({
    configfile: {
      privacy_policy_url:
        "https://www.t-mobile.com/responsibility/privacy/privacy-policy",
      minimum_android_app_version: "0.0.0",
      Authorize_url: "https://mno.com/ccid/auth",
      authorize_url: "https://mno.com/ccid/auth",
      history_url: "https://mno.com/ccid/history",
      profile_url: "",
      email_otp_expiration: 30,
      authsvs_url: "https://mno.com/ccid/authsvs",
      services_url: "https://mno.com/ccid/services",
      response_type: "token",
      configuration_version: "1.0.0",
      client_id: "ccidapp01",
      maximum_pin_length: 15,
      email_otp_length: 6,
      device_url: "https://device.xcijv.com/devices/v1/device",
      pin_requirements: [
        "Must contain more then 1 number",
        "Cannot include the last 4 of your social",
        "Cannot include the last 4 of your phone number"
      ],
      screens: [
        {
          screen: "welcome",
          Title: "Welcome to ZenKey",
          confirm_Label: "Get Started",
          body: "The easy, more secure way to access your apps and services",
          confirm_action: "screen:tos"
        },
        {
          screen: "tos",
          confirm_label: "I agree",
          title: "Terms & Conditions",
          deny_action: "screen:welcome",
          deny_label: "Cancel"
        },
        {
          title: "My Services",
          screen: "services",
          loading_title: "Loading Services"
        },
        {
          title: "My Activity",
          screen: "activity",
          loading_title: "Loading Activities"
        },
        {
          confirm_label: "enable",
          confirm_action: "https://mno.com/ccid/auth",
          screen: "authorize_scope",
          Title: "Enable ZenKey for",
          body: "<client name>/br<friendly_name>/br",
          consent: "<error_content>",
          deny_action: "<client_deny_url>",
          deny_label: "Cancel"
        },
        {
          Deny_label: "Deney",
          Consent: "<error_content>",
          Screen: "authorize_context",
          Confirm_label: "Confirm",
          Deny_action: "<client_deny_url>",
          Title: "Sign in with ZenKey",
          Confirm_action: "https://mno.com/ccid/auth",
          Body: "<client name>/br<friendly_name>/br"
        },
        {
          Deny_label: "Deny",
          Consent: "<error_content>",
          Screen: "authroize",
          Confirm_label: "Confirm",
          Deny_action: "<client_deny_url>",
          Title: "Confirm with ZenKey",
          Confirm_action: "https://mno.com/ccid/auth",
          Body: "<client name>/br<friendly_name>/br"
        },
        {
          Deny_label: "---",
          Consent: "<error_content>",
          Screen: "pin",
          Confirm_label: "",
          Deny_action: "---",
          Title: "Authenticate your account",
          Confirm_action: "https://mno.com/ccid/auth",
          Body: "Enter your pin"
        },
        {
          Deny_label: "---",
          Consent: "<error_content>",
          Confirm_label: "---",
          Deny_action: "---",
          screen: "error",
          Title:
            "For your protection your Account has been locked, try again later",
          Confirm_action: "----",
          Body: "Enter your pin"
        },
        {
          Deny_label: "---",
          Consent: "<error_content>",
          Confirm_label: "---",
          Deny_action: "---",
          screen: "webview",
          Title:
            "For your protection your Account has been locked, try again later",
          Confirm_action: "----",
          Body: "Enter your pin"
        }
      ],
      minimum_android_version: "7.0",
      terms_url:
        "https://www.t-mobile.com/templates/popup.aspx?PAsset=Ftr_Ftr_TermsAndConditions",
      carrier_logo_small: "https://static.raizlabs.xyz/placeholder.png",
      melinoe_url: "",
      sp_url: "https://sp-dev.xcijv.com/sp/v1/sp",
      minimum_pin_length: 6,
      debug_logging_enabled: false,
      remembered_device_url: "https://jv.com/ccid/device",
      allow_bio: "",
      Authsvsurl: "https://tmobile-latest-android.com/ccid/authsvs",
      is_pin_alpha_numeric: false,
      userinfo_url: "",
      profile_mgmt_url: "https://mno.com/ccid/profilmgmt",
      minimum_ios_version: "11.0",
      is_email_otp_alpha_numeric: false,
      service_url: "https://mno.com/ccid/services",
      carrier: "T-Mobile",
      error_configuration: [
        {
          error_title: "Error",
          error_description: "Please try again",
          error_code: 1
        },
        {
          error_title: "Invalid Code",
          error_description:
            "The code that you entered is incorrect, Please try again.",
          error_code: 8001
        },
        {
          error_title: "Expired Code",
          error_description:
            "The code that you entered is expired, Please request a new code and try again.",
          error_code: 8002
        },
        {
          error_title: "Account Error",
          error_description:
            "The account you logged into doesn't match account associated with SIM",
          error_code: 10
        }
      ],
      consent_url: "",
      logging: "debug",
      Activity_url: "https://mno.com/ccid/activity",
      minimum_ios_app_version: "0.0.0",
      scopes: "TMO_ID_profile consents openid",
      prompt: "login",
      Profilemgmt_url: "https://mno.com/ccid/profilmgmt",
      redirect_url: "https://localhost",
      configuration_name: "configuration_name"
    }
  });
});

// TODO: Remove
router.get("/generate", (req, res) => {
  const code = new Date();

  const expiresAt = new Date(code);
  expiresAt.setSeconds(expiresAt.getSeconds() + 60);

  const codeNum = code.getTime();
  const expiresAtNum = expiresAt.getTime();

  res.json({
    code: codeNum,
    expiresAt: expiresAtNum,
    image: `${process.env.BASE_URL}/mock/generate/${codeNum}.png`
  });
});

// TODO: Remove
router.get("/generate/:code", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/images/code.png"));
});

// TODO: Remove
router.get("/link", (req, res) => {
  const { code: codeStr } = req.query;

  const codeNum = Number.parseInt(codeStr, 10);
  const code = new Date(codeNum);

  if (!+code) {
    res.status(422).json({
      message: "code is invalid"
    });

    return;
  }

  const expiresAt = new Date(code);
  expiresAt.setSeconds(expiresAt.getSeconds() + 60);

  const validAt = new Date(code);
  validAt.setSeconds(validAt.getSeconds() + 10);

  const now = new Date();

  if (expiresAt < now) {
    res.status(422).json({
      message: "code is expired"
    });
  } else if (now < validAt) {
    res.status(204).send();
  } else {
    res.json({
      code: "foo",
      mccmnc: "310007"
    });
  }
});

module.exports = router;
