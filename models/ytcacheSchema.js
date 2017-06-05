//Restify looks for plural collection names
//freedb will look for freedbs
//ytcache will look for ytcaches

module.exports = (function ytcacheSchema () {
 
	var mongoose = require('../db').mongoose;
 
	var ytcacheschema = {
		_id: {type: String, required: true},
		videoid: {type: String, required: true},
		etagstats: {type: String, required: true}
	};
	var collectionName = 'ytcaches';
	var ytcacheSchema = mongoose.Schema(ytcacheschema);
	var YTcache = mongoose.model(collectionName, ytcacheSchema);
	
	return YTcache;
})();