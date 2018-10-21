// app.js
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const config = require('./config/config');
const bodyParser = require('body-parser');
const NodeCache = require('node-cache');
const dataCache = new NodeCache(config.node_cache);

// BodyParser Middleware
app.use(bodyParser.json({ limit: '6mb' }));

// use a templating library
app.use(express.static(__dirname + '/node_modules'));

app.get('/', function(req, res, next) {
  res.send('BrightID socket server');
});

app.get('/test', function(req, res, next) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/upload', function(req, res, next) {
  const data = req.body.data;
  // save data in cache
  const id = req.body.uuid;
  console.log(`recieved data: ${id}`);
  dataCache.set(id, data, function(err, success) {
    if (err) {
      console.log(err);
    }
    io.to(id).emit('upload', 'ready');
    res.send({ success: 1 });
  });
});

app.get('/download/:uuid', function(req, res, next) {
  var data = dataCache.get(req.params.uuid);
  res.send({
    data: data || null,
  });
});

io.on('connection', function(client) {
  console.log('Client connected...');

  client.on('join', function(uuid) {
    client.join(uuid);
    if (dataCache.keys().contains(uuid)) io.to(id).emit('upload', 'ready');
  });
});

const port = config.port || 3000;
console.log('Listening on port: ', port);
server.listen(port);
