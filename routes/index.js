var express = require('express');
var router = express.Router();
var http = require('http');

/* GET home page. */
router.get('/', function(req, res) {
  	sendRequest(statusOptions, '#!' + security_token + '@', function (json) {
  		res.render('index', { leftOpen: json.leftOpen });
  	}, function (e) {
  		console.log("got error message");
  		res.render('index', { errorCode: 'failed-to-connect'})
  	}
)});

var garageServerAddress = 'garage.jpbuckley.com';
var garageServerPort = 3630;

var leftOptions = {
	  host: garageServerAddress,
	  port: garageServerPort,
	  path: '/l',
	  method: 'POST'
	};

var rightOptions = {
	  host: garageServerAddress,
	  port: garageServerPort,
	  path: '/r',
	  method: 'POST'
	};

var statusOptions = {
	host: garageServerAddress,
	port: garageServerPort,
	path: '/s',
	method: 'POST'
};

function sendRequest(options, body, callback, error)
{
	var response = "";
	var req = http.request(options, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
	  res.on('data', function (chunk) {
	  	response += chunk;
	  });

	  res.on('end', function (e) {
	  	var json = JSON.parse(response);

	  	callback(json);
	  	console.log(json);
	  });
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	  error(e);
	});

	// write data to request body
	req.write(body + '\n\n');
	req.end();
}

var security_token = "AhS1629H3Nn5%2h3&9xFpQL";

//router.use(express.bodyParser());

router.post('/left', function (req, res) {
  var sec_token = req.body.security_token;

  // authorized
  if (sec_token == security_token)
  {
  	sendRequest(leftOptions, '#!' + security_token + '@', function (json) {
  	  console.log()
  	  res.render('index', { leftOpen: json.leftOpen, success : true});
	 });
  }

  // unauthorized
  else 
  {
 	res.redirect('/');
  }
});

router.post('/right', function (req, res) {
  var sec_token = req.body.security_token;

  // authorized
  if (sec_token == security_token)
  {
  	sendRequest(rightOptions, '#!' + security_token + '@', function (json) {
  	  res.render('index', { leftOpen: json.leftOpen, success : true});
	 });
  }

  // unauthorized
  else 
  {
  	res.redirect('/');
  }
});



module.exports = router;
