module.exports = (function discogsSchema () {
 
	var mongoose = require('../db').mongoose;
 
	var discogsschema = {
		_id: {type: String, required: true},
		releaseid: {type: String},
		artist_name: {type: String, required: true},
		title: {type: String, required: true},
		formats_type: {type: String, required: true},
		format_descriptions: [],
		country: {type: String, required: true},
		tracklist: [],
		ytsearchtime: {type: String},
		"tracklist.duration": {type: String, required: true}
	};
	var collectionName = 'discogs';
	var discogsSchema = mongoose.Schema(discogsschema);
	var Discogs = mongoose.model(collectionName, discogsSchema);
	
	return Discogs;
})();