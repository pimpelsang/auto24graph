var express = require('express'),
	request = require('request'),
	app = express();

app.use(express.static(__dirname +'/static/'));
app.get('/auto/', function (req, res) {
	var url = 'http://www.auto24.ee/kasutatud/nimekiri.php?' + req.param('search');
	request.get(url).pipe(res);
});
app.listen(1234);