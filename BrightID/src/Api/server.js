// @flow

import Config from 'react-native-config';
import { Alert } from 'react-native';
import api from './BrightIdApi';

const SEED_URL = 'http://test.brightid.org';

class Server {
  constructor(seedURL: string) {
    // for now set the baseURL to the seedURL since there is only one server

    this.baseURL = seedURL;

    // TODO: get a list of nodes from the seed node through an API call
    //  https://github.com/BrightID/BrightID/issues/191
    // TODO: select the best server to use through a "promise race"
    //  https://github.com/BrightID/BrightID/issues/202

  }

  /**
   *  Switch servers if the current one is having problems--for example, if the
   *  user you're connecting with can't access it for a profile exchange.
   */
  switch() {
    // TODO: temporarily blacklist the current server and choose another
  }

  update(newBaseUrl) {
    this.baseURL = newBaseUrl;
    api.setBaseUrl(this.apiUrl);
  }

  getIp() {
    return api
      .ip()
      .then((data) => data.ip)
      .catch((error) => {
        Alert.alert("Couldn't get ip address of server.", error.stack);
      });
  }

  get baseUrl() {
    return this.baseURL;
  }

  get apiUrl() {
    return this.baseURL + '/brightid';
  }

  get profileUrl() {
    return this.baseURL + '/profile';
  }
}

const server = new Server(SEED_URL);

export default server;
