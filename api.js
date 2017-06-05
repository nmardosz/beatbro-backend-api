var restify = require('restify');
var config = require('./config');
var api = restify.createServer({name:'REST-api'});

api.use(restify.CORS({
    origins: ['http://localhost:4200'],   // defaults to ['*']
    credentials: true,                 // defaults to false
    headers: ["authorization",
        "withcredentials",
        "x-requested-with",
        "x-forwarded-for",
        "x-real-ip",
        "x-customheader",
        "user-agent",
        "keep-alive",
        "host",
        "accept",
        "connection",
        "upgrade",
        "content-type",
        "dnt",
        "if-modified-since",
        "cache-control",
			"x-access-token"]
}));

api.use(restify.fullResponse());
api.use(restify.bodyParser());
api.use(restify.queryParser());

api.listen(config.port, function() {
	console.log('server listening on port number', config.port);
});

var routes = require('./routes')(api);
