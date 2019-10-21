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

import java.util.Collection;
import java.util.Date;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.common.OAuth2AccessToken;

public abstract class BaseOidcUserDetails implements UserDetails {
  protected String userId;
  protected String username;
  protected OAuth2AccessToken accessToken;
  protected String idToken;
  protected Map<String, String> userInfo;

  public BaseOidcUserDetails(String idToken) {
    this.idToken = idToken;
  }

  public Boolean idTokenIsValid() {
    try {
      if (this.userInfo != null) {
        Object exp = this.userInfo.get("exp");
        if (exp != null) {
          Date tokenDate = new Date((int) exp * 1000L);
          Date now = new Date();
          return tokenDate.compareTo(now) > 0;
        }
      }
    } catch (ClassCastException ex) {
      System.out.println("Failed to cast expiration date to int");
    } catch (Exception ex) {
      System.out.println("Failed to parse id_token");
    }
    return false;

  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return null;
  }

  @Override
  public String getPassword() {
    return null;
  }

  @Override
  public String getUsername() {
    return this.userInfo.get("email");
  }

  public String getFullName() {
    return this.userInfo.get("name");
  }

  public String getUserId() {
    return this.userInfo.get("sub");
  }

  public Map<String, String> getUserInfo() {
    return this.userInfo;
  }

  @Override
  public boolean isAccountNonExpired() {
    return false;
  }

  @Override
  public boolean isAccountNonLocked() {
    return false;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return false;
  }

  @Override
  public boolean isEnabled() {
    return false;
  }

  public String getIdToken() {
    return this.idToken;
  }

  public OAuth2AccessToken getAccessToken() {
    return this.accessToken;
  }
}
