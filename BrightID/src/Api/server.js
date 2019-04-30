// @flow

import { SEED_URL, SEED_URL_DEV } from 'react-native-dotenv';
import emitter from '../emitter';

let seedUrl = SEED_URL;
if (__DEV__) {
  seedUrl = SEED_URL_DEV;
}

class Server {
  baseURL: string;

  constructor(url: string) {
    // for now set the baseURL to the seedUrl since there is only one server

    this.baseURL = url;

    // TODO: get a list of nodes from the seed node through an API call
    //  https://github.com/BrightID/BrightID/issues/191
    // TODO: select the best server to use through a "promise race"
    //  https://github.com/BrightID/BrightID/issues/202
  }

  /**
   *  Switch servers if the current one is having problems--for example, if the
   *  user you're connecting with can't access it for a profile exchange.
   */
  // switch() {
  //   // TODO: temporarily blacklist the current server and choose another
  // }

  update(newBaseUrl: string) {
    this.baseURL = newBaseUrl;
    emitter.emit('serverUrlChange', newBaseUrl);
  }

  get baseUrl() {
    return this.baseURL;
  }

  get apiUrl() {
    return `${this.baseURL}/brightid`;
  }

  get profileUrl() {
    return `${this.baseURL}/profile`;
  }
}

const server = new Server(seedUrl);

export default server;
