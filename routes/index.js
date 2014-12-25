var express = require('express');
var router = express.Router();
var http = require('http');

/* GET home page. */
router.get('/', function(req, res) {
	var authed = req.session.authenticated;
	var success = req.session.successCode;
	var error = req.session.errorCode;

  	sendRequest(statusOptions, '#!' + security_token + '@', 
  	function (json) {
  		if (authed)
  		{
  			res.render('index', { authenticated: authed, error: error, success: success, leftOpen: json.leftOpen });
  		} else {
  			res.render('index', { authenticated: authed, error: error, success: success });
  		}
  	}, function (e) {
  		if (authed)
  		{
  			res.render('index', { authenticated: authed, error: error, success: success, errorCode: 'failed-to-connect'});
  		} else {
  			res.render('index', { authenticated: authed, error: error, success: success,});
  		}
  	});

  	req.session.successCode = null;
  	req.session.errorCode = null;
  });

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
var app_password = "merrychristmas!";

router.post('/login', function (req, res) {
	var password = req.body.password;

	if (password == app_password)
	{
		req.session.authenticated = true;
	} else {
		req.session.authenticated = false;
		req.session.errorCode = "incorrect-login";
	}

	res.redirect('/');
});

router.post('/left', function (req, res) {
  var sec_token = req.body.security_token;

  // authorized
  if (sec_token == security_token)
  {
  	sendRequest(leftOptions, '#!' + security_token + '@', function (json) {
  		req.session.successCode = true;
 		res.redirect('/');
	 });
  }

  // unauthorized
  else 
  {
  	req.session.errorCode = "failed-to-connect";
 	res.redirect('/');
  }
});

router.post('/right', function (req, res) {
  var sec_token = req.body.security_token;

  // authorized
  if (sec_token == security_token)
  {
  	sendRequest(rightOptions, '#!' + security_token + '@', function (json) {
  		req.session.successCode = true;
 		res.redirect('/');
	 });
  }

  // unauthorized
  else 
  {
  	req.session.errorCode = "failed-to-connect";
  	res.redirect('/');
  }
});



module.exports = router;
