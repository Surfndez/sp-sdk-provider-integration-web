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
import java.util.Arrays;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.resource.ResourceServerProperties;
import org.springframework.boot.autoconfigure.security.oauth2.resource.UserInfoTokenServices;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.OAuth2ClientContext;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.filter.OAuth2ClientAuthenticationProcessingFilter;
import org.springframework.security.oauth2.client.token.AccessTokenRequest;
import org.springframework.security.oauth2.client.token.grant.code.AuthorizationCodeResourceDetails;
import org.springframework.security.oauth2.common.AuthenticationScheme;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.token.ResourceServerTokenServices;
import org.springframework.web.client.RestTemplate;

public class OidcFilter extends OAuth2ClientAuthenticationProcessingFilter {
  @Autowired
  ResourceServerTokenServices tokenServices;
  private OAuth2ClientContext oauth2ClientContext;
  private String clientId;
  private String discoveryUrl;
  private String state;
  private String baseUrl;
  private String redirectUrl;
  private String clientSecret;

  public OidcFilter(String defaultFilterProcessesUrl, String clientId, String discoveryUrl, String state, 
		  OAuth2ClientContext oauth2ClientContext, String redirectUrl, String baseUrl, String clientSecret) {
	this(defaultFilterProcessesUrl);
	this.clientId = clientId;
	this.discoveryUrl = discoveryUrl;
	this.state = state;
	this.oauth2ClientContext = oauth2ClientContext;
	this.baseUrl = baseUrl;
	this.redirectUrl = redirectUrl;
	this.clientSecret = clientSecret;
  }

  public OidcFilter(String defaultFilterProcessesUrl) {
    super(defaultFilterProcessesUrl);
  }

  @Override
  public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
      throws AuthenticationException, IOException, ServletException {
	    String mccmnc = request.getParameter("mccmnc");
	    String loginHintToken = request.getParameter("login_hint_token");
	    String state = request.getParameter("state");
	    String scope = request.getParameter("scope");
	    if (scope == null) {
	    	try {
		    	if (!state.equals(this.state)) {
		    		throw new Exception("state mismatch");
		    	} else {
		    	    AccessTokenRequest req = this.oauth2ClientContext.getAccessTokenRequest();
		    	    req.setStateKey(null);
		    	}
	    	} catch (Exception e) {
	    		e.printStackTrace();
	  	      	return null;
	    	}

	    }
	    final String uri = String.format("%s?config=true&client_id=%s&mccmnc=%s&login_hint_token=%s", this.discoveryUrl, this.clientId, mccmnc, loginHintToken);
	    RestTemplate discoveryRestTemplate = new RestTemplate();
	    Discovery discovery = discoveryRestTemplate.getForObject(uri, Discovery.class);
		// rest template
		OAuth2RestTemplate template = new OAuth2RestTemplate(carrier(mccmnc), oauth2ClientContext);
		super.setRestTemplate(template);
		// add clientId to tokenServices
		UserInfoTokenServices tokenServices = new UserInfoTokenServices(carrierResource(mccmnc).getUserInfoUri(),
				carrier(mccmnc).getClientId());
		tokenServices.setRestTemplate(template);
		super.setTokenServices(tokenServices);
	    Authentication result = super.attemptAuthentication(request, response);
	    // get access / id tokens
	    OAuth2AccessToken accessToken = restTemplate.getAccessToken();
	    Object idToken = accessToken.getAdditionalInformation().get("id_token");
	    CarrierOidcUserDetails user;
	    try {
	      if (idToken == null) {
	        throw new Exception("id_token is null");
	      }
	      // set user details
	      user = new CarrierOidcUserDetails(idToken.toString(), discovery.jwks_uri);
	      return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
	    } catch (Exception e) {
	      e.printStackTrace();
	      return null;
	    }
    }
  
  @Bean
  public AuthorizationCodeResourceDetails carrier(String mccmnc) {
	  // discovery
	  RestTemplate restTemplate = new RestTemplate();
	  Discovery result = restTemplate.getForObject(String.format("%s?client_id=%s&mccmnc=%s", this.discoveryUrl, this.clientId, mccmnc), Discovery.class);
	  AuthorizationCodeResourceDetails details = new AuthorizationCodeResourceDetails();
	  // set endpoints from discovery
	  details.setClientId(this.clientId);
	  details.setClientSecret(this.clientSecret);
	  details.setUserAuthorizationUri(result.authorization_endpoint);
	  details.setAccessTokenUri(result.token_endpoint);
	  details.setTokenName("oauth_token");
	  details.setAuthenticationScheme(AuthenticationScheme.query);
	  details.setClientAuthenticationScheme(AuthenticationScheme.form);
	  details.setScope(Arrays.asList("openid", "email", "profile"));
	  details.setUseCurrentUri(false);
	  details.setPreEstablishedRedirectUri(String.format("%s%s", this.baseUrl, this.redirectUrl));
	  return details;
  }
	
  @Bean
  public ResourceServerProperties carrierResource(String mccmnc) {
	  // discovery
	  ResourceServerProperties properties = new ResourceServerProperties();
	  RestTemplate restTemplate = new RestTemplate();
	  // set user info endpoint
	  Discovery result = restTemplate.getForObject(String.format("%s?client_id=%s&mccmnc=%s", this.discoveryUrl, this.clientId, mccmnc), Discovery.class);
	  properties.setUserInfoUri(result.userinfo_endpoint);
	  return properties;
  }
}
