module.exports = function(api) {

	var album = require('./controllers/albumController');
	var search = require('./controllers/searchController');
	var user = require('./controllers/userController');
	var verify = require('./controllers/verifyController');
	var remote = require('./controllers/remoteController');
	//var video = require('./controllers/videoController');
	//var test = require('./controllers/testController');

	api.get('/', function(req, res, next) {
		return res.send("WELCOME TO THE BEATBRO API");
	});

	api.get('/album', album.getAlbum);

	api.get('/albumimg', album.getAlbumImg);

	api.get('/search', search.getSearch);

	api.get('/user', user.createUser);

	api.get('/authenticate', user.authenticate);

	api.opts('/verify', function(req, res) {
    // taken care of the CORS stuff, so just return OK.
		res.header("Access-Control-Allow-Headers", "origin, content-type, x-access-token");
    res.send(200);
	});

	api.get('/verify', verify.verify);
	
	api.opts('/remotehost', function(req, res) {
    // taken care of the CORS stuff, so just return OK.
		res.header("Access-Control-Allow-Headers", "origin, content-type, x-access-token");
    res.send(200);
	});

	api.get('/remotehost', remote.remotehost);

	//api.get('/protected', function())

	//api.get('/video', video.getVideo);

	//api.get('/test', test.getTest);

};
