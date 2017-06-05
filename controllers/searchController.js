//This Controller deals with all functionalities of a Video
 
function searchController () {
	var Freedb = require('../models/freedbSchema');
	var Discogs = require('../models/discogsSchema');
	var Artists = require('../models/artistsSchema');
	var http = require('http');
	var https = require('https');
	var request = require('request');
	var	fs = require('fs');
	var path = require("path");
	var mkdirp = require('mkdirp');
	
	
	/* -------------- Example of creating records -------------
	// Creating New Student
	this.createStudent = function (req, res, next) {
		var name = req.params.name;
		var email = req.params.email;
		var age = req.params.age;
		var city = req.params.city;
		
		Student.create({name:name,email:email,age:age,city:city}, function(err, result) {
			if (err) {
				console.log(err);
				return res.send({'error':err});	
			}
			else {
        return res.send({'result':result,'status':'successfully saved'});
      }
		});
	}; 
	-------------- End example of creating records -------------
	*/
 
  // Fetching Details of a video
  this.getSearch = function (req, res, next) {
	  //console.log(req.params.artist);
	  //console.log(req.params.album);
	var searcherforward = [];
	var searcherreverse = [];
	var reversesearcher = [];
	var songsarray = [];
	var searchterm = req.params.q;
	searchterm = searchterm.toLowerCase().trim();
	var splitsearch = searchterm.split(" ");
	var textpush = 0;
	for (var i = 0; i < splitsearch.length; i++) {
			textpush = splitsearch.length - i;
			var stringbuild = '';
			for (var j = 0; j < textpush; j++) {
				stringbuild += splitsearch[j] + " ";
			}
			searcherforward[textpush - 1] = stringbuild.trim();
	}
	for (var i = splitsearch.length - 1; i > -1; i--) {
			textpush = (splitsearch.length - 1) - i;
			var stringbuild = [];
			for (var j = splitsearch.length; j > textpush; j--) {
				stringbuild.unshift(splitsearch[j - 1]);
			}
			searcherreverse[(splitsearch.length - 1) - textpush] = stringbuild;
	}
	
	for (var i = 0; i < searcherreverse.length; i++) {
		reversesearcher[i] = searcherreverse[i].join(" ");
	}
	var searchresp ={};
	
	//l_artist = artist.toLowerCase();
	//l_album = album.toLowerCase();
	//c_artist = artist;
	//c_album = album;
	
	//Example Replace
	//l_artist = l_artist.replace(/ +/g, " ");
	//l_album = l_album.replace(/ +/g, " ");
	//l_artist = l_artist.replace(/-/g, " ");
	//l_album = l_album.replace(/-/g, " ");
	//l_artist = l_artist.replace(/\'/g, "");
	//l_album = l_album.replace(/\'/g, "");
	//l_artist = l_artist.replace(/\+\+\+/g, " + ");
	//l_album = l_album.replace(/\+\+\+/g, " + ");

	
	console.log(searchterm);
	//console.log(searcherforward);
	//console.log(reversesearcher);
	
	//console.log(artist);
	//console.log(l_artist);
	//console.log(album);
	//console.log(l_album);
	
	//Example Query URL
	//https://www.googleapis.com/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=adele+hello&type=video&maxResults=1
	var regsearch = new RegExp('^' + searchterm + '.*');
	var songValue;
	var regsong;
	var songsdone = 0;
	var albumsdone = 0;
	var outputresults = {
		results: []
	};
	var artistsresults = {
		artist: []
	};
	var albumsresults = {
		albums: []
	};
	var songsresults = {
		songs: []
	};
	Artists.aggregate(
		[
		{ $match: {
			l_artist_name: regsearch
		}},
		{ $group: {
			_id: '$artist_name'
		}},
		{ $sort: {
			_id: 1
		}},
		{ $limit: 3 }
		],
		function(err, result) {
			if(err) {
				console.log(err);
			}
			
			if(!result) {
				artistscomplete();
			}
			
			if(result) {
				//console.log(result);
				for (var i = 0, len = result.length; i < len; i++) {
					artistsresults.artist.push({"artist": result[i]._id});
					outputresults.results.push({"artist": [{"artist": result[i]._id.replace(/ +(?= )/g,'')}]});
				}
				//console.log("artists complete");
				artistscomplete();
			}
		}
	);
	
	function artistscomplete() {
		var songcounter = 0;
		if(artistsresults.artist.length != 0) {
			for (var j = 0, songslen = artistsresults.artist.length; j < songslen; j++) {
				Discogs.findOne({l_artist_name: artistsresults.artist[j].artist.toLowerCase()}, function (err, songresult) {
					if(err) {
						console.log(err);
					}
					
					if(!songresult) {
						songcounter++;
						if (songcounter == songslen) {
							//console.log("songs complete");
							songsdone = 1;
							songscomplete();
						}
					}
					
					if(songresult) {
						songcounter++;
						//console.log(songresult.tracklist[0].track_title);
						outputresults.results.push({"song": [{"song": songresult.tracklist[0].track_title, "artist": songresult.artist_name, "album": songresult.title}]});
						if (songcounter == songslen) {
							//console.log("songs complete");
							songsdone = 1
							songscomplete();
						}
					}
					
				}).sort({year: -1});
			}
		}
		else {
			var songcounter = 0;
			var howmanycount = 0;
			var totalsongsearches = searcherforward.length * reversesearcher.length;
			for (var k = 0; k < searcherforward.length; k++) {
				for (var l = 0; l < reversesearcher.length; l++) {
					//console.log(reversesearcher[i]);
					//console.log("searched: " + searcherforward[k].toLowerCase() + " and " + reversesearcher[l]);
					Discogs.findOne({l_artist_name: searcherforward[k].toLowerCase(), "tracklist.track_title": new RegExp('^' + reversesearcher[l], 'gi'), $or: [
								{"formats.format_type": "CD"},
								{"formats.format_type": "Vinyl"}
							], format_descriptions: {$in: [{format_description: "Album"}]}}, function (err, songresult) {
						//format_descriptions: {$nin: [{format_description: "Promo"}]},
						////format_descriptions: {$nin: [{format_description: "Club Edition"}]},
						//format_descriptions: {$nin: [{format_description: "CD+G"}]},
						//format_descriptions: {$nin: [{format_description: "HDCD"}]},
						//format_descriptions: {$nin: [{format_description: "Reissue"}]}}, function (err, songresult) {
						howmanycount += 1;
						if(err) {
							console.log(err);
						}
						
						if(songresult && songresult != "") {
							songcounter += 1;
							console.log("found songs");
							//console.log(songresult.track_title);
							songsresults.songs.push(songresult);
							//outputresults.results.push({"song": [{"song": songsresults.songs[i].tracklist[k].track_title, "artist": songsresults.songs[i].artist_name, "album": songsresults.songs[i].title}]});
							//console.log(songsresults.songs.length);
						}
						
						if (howmanycount == totalsongsearches) {
							console.log("song searching done");
							//console.log(songsarray.length);
							songsdone = 1;
							songscompletego();
						}
						
					});
				
				}
				
			}
			
		}
	}
	
	function songscompletego() {
		//console.log(songsresults.songs.length);
		if (songsresults.songs.length != 0) {
			for (var i = 0; i < songsresults.songs.length; i++) {
				//console.log(songsresults.songs[i]);
				for (var j = 0; j < reversesearcher.length; j++) {
					for (var k = 0; k < songsresults.songs[i].tracklist.length; k++) {
						var regsongmatch = new RegExp('^' + reversesearcher[j], 'gi');
						if(regsongmatch.test(songsresults.songs[i].tracklist[k].track_title)) {
							//console.log(reversesearcher[j] + " with " + songsresults.songs[i].tracklist[k].track_title);
							outputresults.results.push({"song": [{"song": songsresults.songs[i].tracklist[k].track_title, "artist": songsresults.songs[i].artist_name, "album": songsresults.songs[i].title}]});
							//console.log("song matched");
						}
						//console.log(reversesearcher[j]);
					}
				}
				//console.log("i is " + i + " songs array is " + songsresults.songs.length);
				if(i + 1 == songsresults.songs.length) {
					console.log("songscomplete");
					songscomplete();
				}
			}
		}
		else {
			if(songsresults.songs.length == 0) {
				console.log("nothing songscomplete");
				songscomplete();
			}
		}
	}
	
	function songscomplete() {
		var albumcounter = 0;
		if(artistsresults.artist.length != 0 && songsdone == 1) {
			for (var k = 0, artistslen = artistsresults.artist.length; k < artistslen; k++) {
				Discogs.aggregate(
					[
					{ $match: {
						l_artist_name: artistsresults.artist[k].artist.toLowerCase(),
						$or: [
							{"formats.format_type": "CD"},
							{"formats.format_type": "Vinyl"}
						],
						year: {$exists: true},
						$and: [
							{format_descriptions: {$in: [{format_description: "Album"}]}},
							{format_descriptions: {$nin: [{format_description: "Single"}]}},
							{format_descriptions: {$nin: [{format_description: "Promo"}]}},
							{format_descriptions: {$nin: [{format_description: "Club Edition"}]}},
							{format_descriptions: {$nin: [{format_description: "CD+G"}]}},
							{format_descriptions: {$nin: [{format_description: "Reissue"}]}},
							{format_descriptions: {$nin: [{format_description: "Remastered"}]}},
							{format_descriptions: {$nin: [{format_description: "Compilation"}]}},
							{format_descriptions: {$nin: [{format_description: "Comp"}]}},
							{format_descriptions: {$nin: [{format_description: "RE"}]}},
							{format_descriptions: {$nin: [{format_description: "LP"}]}},
							{format_descriptions: {$nin: [{format_description: "Unofficial Release"}]}},
							{l_title: {$not: new RegExp('^Live', "gi")}},
							{l_title: {$not: new RegExp('Live$', "gi")}},
							{l_title: {$not: new RegExp('^Live!', "gi")}},
							{l_title: {$not: new RegExp('Live!$', "gi")}},
							{l_title: {$not: new RegExp('at the bbc', "gi")}},
							{l_title: {$not: new RegExp('tour', "gi")}},
							{l_title: {$not: new RegExp('\\d{2},[ ]\\d{4}', "gi")}},
							{l_title: {$not: new RegExp('\\d{1},[ ]\\d{4}', "gi")}},
							{l_title: {$not: new RegExp('.*live.*in.*\\d{4}', "gi")}},
							{l_title: {$not: new RegExp('live at', "gi")}},
							{l_title: {$not: new RegExp('live from', "gi")}},
							{l_title: {$not: new RegExp('instrumentals only', "gi")}},
							{l_title: {$not: new RegExp('[^\\x00-\\x7F]+', "gi")}}
						]
					}},
					{ $project: {
						title: 1,
						year: 1,
						artist_name: 1
					}},
					{ $group: {
						//_id: {title: '$title', year: '$year', format_type: '$format_type'},
						_id: '$title',
						year: { $min: "$year" },
						artist: { $first: "$artist_name"}
					}},
					{ $sort: {
						year: -1
					}},
					{ $limit: 30}
					],
					function(err, albumresult) {
						if(err) {
							console.log(err);
						}
						
						if(!albumresult){
							albumcounter++;
							if (albumcounter == artistsresults.artist.length) {
								albumsdone = 1;
								complete();
							}
						}
						
						if(albumresult) {
							albumcounter++;
							//console.log(albumresult);
							for (var i = 0, len = albumresult.length; i < len; i++) {
								outputresults.results.push({"album": [{"album": albumresult[i]._id, "year": albumresult[i].year, "artist": albumresult[i].artist}]});
							}
							if (albumcounter == artistsresults.artist.length) {
								//console.log("albums complete");
								albumsdone = 1;
								complete();
							}
						}
					}
				);
			}
		}
		else {
			if (artistsresults.artist.length == 0 && songsdone == 1) {
				var albumcounter = 0;
				var albumhowmany = 0;
				var albumfoundcounter = 0;
				var totalsearches = searcherforward.length * reversesearcher.length;
				console.log("total searches " + totalsearches);
				for (var l = 0; l < searcherforward.length; l++) {
					//console.log("sf: " + searcherforward[l]);
					for (var m = 0; m < reversesearcher.length; m++) {
						//console.log("sr: " + reversesearcher[m]);
						var regexTitle = reversesearcher[m];
						Discogs.aggregate(
							[
							{ $match: {
								l_artist_name: searcherforward[l].toLowerCase(),
								l_title: new RegExp('^' + reversesearcher[m].toLowerCase(), "gi"),
								$or: [
									{"formats.format_type": "CD"},
									{"formats.format_type": "Vinyl"}
								],
								year: {$exists: true},
								$and: [
									{format_descriptions: {$in: [{format_description: "Album"}]}},
									{format_descriptions: {$nin: [{format_description: "Single"}]}},
									{format_descriptions: {$nin: [{format_description: "Promo"}]}},
									{format_descriptions: {$nin: [{format_description: "Club Edition"}]}},
									{format_descriptions: {$nin: [{format_description: "CD+G"}]}},
									{format_descriptions: {$nin: [{format_description: "Reissue"}]}},
									{format_descriptions: {$nin: [{format_description: "Remastered"}]}},
									{format_descriptions: {$nin: [{format_description: "Compilation"}]}},
									{format_descriptions: {$nin: [{format_description: "Comp"}]}},
									{format_descriptions: {$nin: [{format_description: "RE"}]}},
									{format_descriptions: {$nin: [{format_description: "LP"}]}},
									{format_descriptions: {$nin: [{format_description: "Unofficial Release"}]}},
									{l_title: {$not: new RegExp('^Live', "gi")}},
									{l_title: {$not: new RegExp('Live$', "gi")}},
									{l_title: {$not: new RegExp('^Live!', "gi")}},
									{l_title: {$not: new RegExp('Live!$', "gi")}},
									{l_title: {$not: new RegExp('at the bbc', "gi")}},
									{l_title: {$not: new RegExp('tour', "gi")}},
									{l_title: {$not: new RegExp('\\d{2},[ ]\\d{4}', "gi")}},
									{l_title: {$not: new RegExp('\\d{1},[ ]\\d{4}', "gi")}},
									{l_title: {$not: new RegExp('.*live.*in.*\\d{4}', "gi")}},
									{l_title: {$not: new RegExp('live at', "gi")}},
									{l_title: {$not: new RegExp('live from', "gi")}},
									{l_title: {$not: new RegExp('instrumentals only', "gi")}}
								]
							}},
							{ $project: {
								title: 1,
								year: 1,
								artist_name: 1
							}},
							{ $group: {
								//_id: {title: '$title', year: '$year', format_type: '$format_type'},
								_id: '$title',
								year: { $min: "$year" },
								artist: { $first: "$artist_name"}
							}},
							{ $sort: {
								year: -1
							}},
							{ $limit: 1}
							],
							function(err, albumresult) {
								albumhowmany += 1;
								if(err) {
									console.log(err);
								}
								
								if(albumresult && albumresult != "") {
									albumfoundcounter++;
									//console.log(albumresult);
									//console.log(albumresult[0].year);
									outputresults.results.push({"album": [{"album": albumresult[0]._id, "year": albumresult[0].year, "artist": albumresult[0].artist}]});
								}
								
								if (albumhowmany == totalsearches) {
									console.log(outputresults.results);
									//console.log("albums complete");
									albumsdone = 1;
									complete();
								}
							}
						);
					}
				}
			}
		}
	}
	
	function albumscompletego() {
		//console.log(albumsresults.albums.length);
		if (albumsresults.albums.length != 0 && songsdone == 1 && albumsdone == 1) {
			for (var i = 0; i < albumsresults.albums.length; i++) {
				//console.log(songsresults.songs[i]);
				for (var j = 0; j < reversesearcher.length; j++) {
					var regalbummatch = new RegExp('^' + reversesearcher[j] + '$', 'i');
					if(regalbummatch.test(albumsresults.albums[i].title)) {
						//console.log(reversesearcher[j] + " with " + albumsresults.albums[i].title);
						outputresults.results.push({"album": [{"album": albumsresults.albums[i].title, "artist": albumsresults.albums[i].artist_name}]});
						//console.log("album matched");
					}
					//console.log(reversesearcher[j]);
				}
				
				if(i == albumsresults.albums.length - 1) {
					console.log("albumslength: " + albumsresults.albums.length + " firing final complete");
					complete();
				}
			}
		}
		else {
			if (albumsresults.albums.length == 0 && songsdone == 1 && albumsdone == 1) {
				console.log("albumslength: " + albumsresults.albums.length + " firing final complete");
				complete();
			}
		}
	}
	
	function complete() {
		//console.log("get here");
		if(songsdone == 1 && albumsdone == 1) {
			console.log(outputresults.results.length);
			if(outputresults.results.length == 0) {
				return res.send({'result':"no results"});
			}
			else {
				return res.send({'result':outputresults});
			}
		}
	}
  };
 
return this;
 
};
 
module.exports = new searchController();