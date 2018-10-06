var development = {
  port: 3000,
  node_cache: {
    stdTTL: 300,
    checkperiod: 120
  }
};

var production = {
  port: 3001,
  node_cache: {
    stdTTL: 300,
    checkperiod: 120
  }
};

var env = "dev"; // default value
switch (process.env.NODE_ENV || env) {
  case 'dev':
    env = development;
    break;
  case 'prod':
    env = production;
    break;
}

if(env){
  for(var key in env){
    exports[key] = env[key];
  }
}
