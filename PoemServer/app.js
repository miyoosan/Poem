var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var user = require('./routers/user');
var poem = require('./routers/poem');
var pimage = require('./routers/pimage');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded

app.use('/images', express.static('images'));

app.get('/', function(req, res){
  res.send('hello world');
});

app.use('/user', user);
app.use('/poem', poem);
app.use('/pimage', pimage);


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});