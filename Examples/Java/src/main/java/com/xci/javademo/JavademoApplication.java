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

import java.security.Principal;

import javax.servlet.Filter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.oauth2.client.OAuth2ClientContext;
import org.springframework.security.oauth2.client.filter.OAuth2ClientContextFilter;
import org.springframework.security.oauth2.common.util.RandomValueStringGenerator;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableOAuth2Client;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

@SpringBootApplication
@RestController
@EnableOAuth2Client
@Configuration
public class JavademoApplication extends WebSecurityConfigurerAdapter {

	@Autowired
	OAuth2ClientContext oauth2ClientContext;

	@Value("${BASE_URL}")
	private String baseUrl;

	@Value("${CLIENT_ID}")
	private String clientId;

	@Value("${CLIENT_SECRET}")
	private String clientSecret;

	@Value("${DISCOVERY_URL}")
	private String discoveryUrl;
	
	private String state;
	private final int STATE_LENGTH = 40;

	private final String redirectUrl = "/auth/cb";

	@RequestMapping("/user")
	public String user(Principal principal) {
		// security context
		SecurityContext ctx = SecurityContextHolder.getContext();
		try {
			// session authentication
			Authentication auth = ctx.getAuthentication();
			// get user from session
			CarrierOidcUserDetails user = (CarrierOidcUserDetails) auth.getPrincipal();
			return user.idTokenIsValid() ? user.getFullName() : null;
		} catch (Exception ex) {
			SecurityContextHolder.getContext().setAuthentication(null);
			SecurityContextHolder.clearContext();
			return null;
		}
	}

	@RequestMapping("/auth")
	public ModelAndView auth() {
		String redirect_uri = String.format("%s%s", this.baseUrl, this.redirectUrl);
		return new ModelAndView(String.format("redirect:https://discoveryui.myzenkey.com/ui/visual-code?client_id=%s&redirect_uri=%s&state=%s", this.clientId, redirect_uri, this.state));
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.antMatcher("/**").authorizeRequests().antMatchers("/", "/user", "/auth**", "/css/**", "/error**", "/favicon.ico").permitAll()
				.anyRequest().authenticated().and().exceptionHandling()
				.authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/")).and().logout().invalidateHttpSession(true)
				.deleteCookies("JSESSIONID", "XSRF-TOKEN").logoutSuccessUrl("/").permitAll().and().csrf()
				.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()).and()
				.addFilterBefore(carrierSsoFilter(), BasicAuthenticationFilter.class);
	}

	public static void main(String[] args) {
		SpringApplication.run(JavademoApplication.class, args);
	}

	@Bean
	public FilterRegistrationBean<OAuth2ClientContextFilter> oauth2ClientFilterRegistration(
			OAuth2ClientContextFilter filter) {
		FilterRegistrationBean<OAuth2ClientContextFilter> registration = new FilterRegistrationBean<OAuth2ClientContextFilter>();
		registration.setFilter(filter);
		registration.setOrder(-100);
		return registration;
	}

	private Filter carrierSsoFilter() {
		// setup state
		RandomValueStringGenerator stateGenerator = new RandomValueStringGenerator(STATE_LENGTH);
		this.state = stateGenerator.generate();
		// setup callback url
		OidcFilter filter = new OidcFilter(this.redirectUrl, this.clientId, this.discoveryUrl, this.state, 
				oauth2ClientContext, this.baseUrl, this.redirectUrl, this.clientSecret);
		return filter;
	}
}
