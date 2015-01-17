var express = require('express'),
	request = require('request'),
	cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser());
app.set('port', (process.env.PORT || 1234));
app.get('/auto/', function (req, res) {
	var url = 'http://www.auto24.ee/kasutatud/nimekiri.php?' + req.param('search');
	request.get(url).pipe(res);
});
app.get('/', function(req, res, next) {
	if (String(req.cookies.pwd).toLowerCase() !== 'eero') {
		res.sendfile('./static/login.html');
	} else {
		next();
	}
});

app.use(express.static(__dirname +'/static'));
app.listen(app.get('port'));