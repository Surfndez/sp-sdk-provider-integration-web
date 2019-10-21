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
package com.xci.javademo;

import java.io.IOException;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.Map;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.security.jwt.Jwt;
import org.springframework.security.jwt.JwtHelper;
import org.springframework.security.jwt.crypto.sign.RsaVerifier;

public class CarrierOidcUserDetails extends BaseOidcUserDetails {
  private String certUrl;

  public CarrierOidcUserDetails(String idToken, String certUrl)
      throws JsonParseException, JsonMappingException, JwkException, IOException {
    super(idToken);
    this.certUrl = certUrl;
    this.setUserInfo();
  }

  public void setUserInfo() throws JwkException, JsonParseException, JsonMappingException, IOException {
    String kid = JwtHelper.headers(this.idToken).get("kid");
    JwkProvider provider = new UrlJwkProvider(new URL(certUrl));
    Jwk jwk = provider.get(kid);
    RSAPublicKey key = (RSAPublicKey) jwk.getPublicKey();
    RsaVerifier verifier = new RsaVerifier(key);
    Jwt tokenDecoded = JwtHelper.decodeAndVerify(this.idToken, verifier);
    this.userInfo = new ObjectMapper().readValue(tokenDecoded.getClaims(), Map.class);
  }
}
