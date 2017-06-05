var mongoose = require('mongoose');
var config = require('./config');
 
mongoose.connect(config.dbPath);
var db = mongoose.connection;
 
db.on('error', function (err, result) {
	if(err) {
		console.log('error occured from db');
		console.log(err);
	}
});
 
db.once('open', function dbOpen() {
	console.log('successfully opened the db');
});
 
exports.mongoose = mongoose;