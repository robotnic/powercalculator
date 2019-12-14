var express = require('express');
var request = require('request');
var app = express();
const compression = require('compression')
app.use(compression());


const PORT = process.env.PORT || 3000
const baseUrl = 'https://entsoe.herokuapp.com'
//const baseUrl = 'https://entsoeapi.azurewebsites.net'



app.all('/api/**', function(req, res) {
  console.log(req.url);
  var options = {
    uri: baseUrl + req.url,
    method: req.method
  }
  console.log(options);
  request(options, function(err, response, body) {
    res.send(body);
  });
})


app.use(express.static('dist/powercalculator'));

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/dist/powercalculator/index.html');
});


app.listen(PORT, function () {
  console.log('Example app listening on port ' + PORT + '!');
});
