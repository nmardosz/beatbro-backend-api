module.exports = (function artistsSchema () {
 
	var mongoose = require('../db').mongoose;
 
	var artistsschema = {
		_id: {type: String, required: true},
		artistid: {type: String},
		l_artist_name: {type: String, required: true},
		artist_name: {type: String, required: true},
		artist_real_name: {type: String, required: true},
		profile: {type: String, required: true}
	};
	var collectionName = 'discogsartists';
	var artistsSchema = mongoose.Schema(artistsschema);
	var Artists = mongoose.model(collectionName, artistsSchema);
	
	return Artists;
})();