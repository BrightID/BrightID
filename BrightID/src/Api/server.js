// @flow

import Config from 'react-native-config';
import { Alert } from 'react-native';
import api from './BrightIdApi';

class Server {
  constructor(seedURL: string) {

    // for now set the baseURL to the seedURL since there is only one server

    this.baseURL = seedURL;
    this.apiURL = this.baseURL + '/brightid';
    this.profileURL = this.baseURL + '/profile';

    // TODO: get a list of nodes from the seed node through an API call
    //  https://github.com/BrightID/BrightID/issues/191
    // TODO: select the best server to use through a "promise race"
    //  https://github.com/BrightID/BrightID/issues/202

    api.setBaseUrl(this.apiUrl);
  }

  switch(){
    // TODO: blacklist the current server and choose another
  }

  getIp(){
    return api.ip().then( data => data.ip ).
      catch((error) => {
        Alert.alert("Couldn't get ip address of server.", error.stack);
    });
  }

  get baseUrl(){
    return this.baseURL;
  }

  get apiUrl(){
    return this.apiURL;
  }

  get profileUrl(){
    return this.profileURL;
  }
}

const server = new Server(Config.SEED_URL);

export default server;
