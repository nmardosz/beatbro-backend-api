//Restify looks for plural collection names
//freedb will look for freedbs

module.exports = (function freedbSchema () {
 
	var mongoose = require('../db').mongoose;
 
	var freedbschema = {
		_id: {type: String, required: true},
		releaseid: {type: String},
		artist_name: {type: String, required: true},
		title: {type: String, required: true},
		ytsearchtime: {type: String},
		tracklist: []
	};
	var collectionName = 'freedbs';
	var freedbSchema = mongoose.Schema(freedbschema);
	var Freedb = mongoose.model(collectionName, freedbSchema);
	
	return Freedb;
})();