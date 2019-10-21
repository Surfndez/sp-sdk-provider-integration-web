# Copyright 2019 XCI JV, LLC.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
from flask import Flask, jsonify, render_template, redirect, request
from flask.helpers import url_for
from flask_pyoidc.flask_pyoidc import OIDCAuthentication
from flask_pyoidc.provider_configuration import ProviderConfiguration, ClientMetadata, ProviderMetadata
from flask_pyoidc.pyoidc_facade import PyoidcFacade
from flask_pyoidc.user_session import UserSession
import flask
import json
import logging
import os
import requests
import binascii
import urllib.parse

PORT = os.getenv('PORT')
BASE_URL_SUBDOMAIN = os.getenv('BASE_URL_SUBDOMAIN')
BASE_URL_DOMAIN = os.getenv('BASE_URL_DOMAIN')
state_key = ''
port_is_valid = not bool(PORT == None)
combo = '%s.%s' % (BASE_URL_SUBDOMAIN, BASE_URL_DOMAIN)
BASE_URL = BASE_URL_DOMAIN if BASE_URL_SUBDOMAIN == None else combo
if port_is_valid:
    BASE_URL += ':%s' % (PORT)

# no session cookies on localhost
session_cookie_domain = None if BASE_URL_DOMAIN == 'localhost' else BASE_URL_DOMAIN

application = Flask(__name__)
application.config.update({'SERVER_NAME': BASE_URL,
                           'SESSION_COOKIE_DOMAIN': session_cookie_domain,
                           'SECRET_KEY': os.getenv('CLIENT_SECRET_BASE')})

auth_params = {'scope': ['openid', 'profile']}
PROVIDER_NAME = 'xci'

openid = OIDCAuthentication({})


@application.route('/')
def index():
    return render_template('home.html')


@application.route('/auth')
def discovery():
    client_id = os.getenv('CLIENT_ID')
    url = url_for('login', _external=True, _scheme='https')
    global state_key
    state_key = urllib.parse.quote(binascii.b2a_hex(os.urandom(20)))
    return redirect('https://discoveryui.myzenkey.com/ui/visual-code?client_id=%s&redirect_uri=%s&state=%s' % (client_id,
                        url, state_key))


@application.route('/login')
def login():
    login_hint_token = request.args.get('login_hint_token')
    state = request.args.get('state')
    mccmnc = request.args.get('mccmnc')

    name = getNameForCurrentSession()
    if state != state_key:
        return redirect('/')
    elif name != None:
         return redirect('/logged-in')
    else:
        provider_metadata = get_provider_metadata(login_hint_token, mccmnc)
        client_metadata = get_client_metadata()
        if provider_metadata != None and client_metadata != None:
            # configure provider (i.e. MNO) and client
            config = ProviderConfiguration(
                client_metadata=client_metadata,
                auth_request_params=auth_params,
                provider_metadata=provider_metadata)
            # TODO: once dynamic discovery with XCI providers is working, touch this up / ensure this works to manage logging in with different providers
            url = url_for('login', _external=True)
            # use pyoidc internals to add provider / client to session, no need to store
            UserSession(flask.session, PROVIDER_NAME)
            # instantiate OIDC through facade
            client = PyoidcFacade(config, url)
            # authenticate
            return openid._authenticate(client)
        return render_template('home.html', error='Could not build a valid configuration for the selected provider. Error detail: MCC=%s, MNC=%s' % (mcc, mnc))


@application.route('/logged-in')
def loginGoogle():
    name = getNameForCurrentSession()
    if name != None:
        return render_template('logged-in.html', name=name)
    else:
        return redirect('/')


@application.route('/logout')
def logout():
    try:
        openid._logout()
        return redirect('/')
    except:
        # already logged out
        return redirect('/')


def getNameForCurrentSession():
    try:
        user_session = UserSession(flask.session, PROVIDER_NAME)
        if (user_session):
            info = user_session.userinfo
            if info:
                name = info['name']
                return name
        return None
    except Exception as e:
        logging.log(40, e)
        return None


def get_provider_metadata(login_hint_token, mccmnc):
    client_id = os.getenv('CLIENT_ID')
    d_url = os.getenv('DISCOVERY_URL')
    url = '%s?config=true&client_id=%s&login_hint_token=%s&mccmnc=%s' % (
        d_url, client_id, login_hint_token, mccmnc)
    response = requests.get(url)
    response_json = response.json()
    if (response_json == {} or response_json['issuer'] == None):
        return None

    metadata = ProviderMetadata(
        issuer=response_json['issuer'],
        authorization_endpoint=response_json['authorization_endpoint'],
        jwks_uri=response_json['jwks_uri'],
        token_endpoint=response_json['token_endpoint'],
        userinfo_endpoint=response_json['userinfo_endpoint'])
    return metadata


def get_client_metadata():
    client_id = os.getenv('CLIENT_ID')
    client_secret = os.getenv('CLIENT_SECRET')
    if client_id == None or client_secret == None:
        return None
    else:
        return ClientMetadata(client_id, client_secret)
