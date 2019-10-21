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
from app import openid, application
import logging
import os

PORT = os.getenv('PORT')
port_is_valid = not PORT == None

if __name__ == '__main__':
    logging.basicConfig(
        level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    openid.init_app(application)
    port = os.getenv('PORT')
    if (port_is_valid):
        application.run(port=PORT)
    else:
        application.run(host='0.0.0.0')
