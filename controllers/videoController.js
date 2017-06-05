//This Controller deals with all functionalities of a Video
 
function videoController () {
	var YouTubeAPIKey = "Put your youtube api key here";
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
 
  // Fetching Details of Video
  this.getVideo = function (req, res, next) {
	  //console.log(req.params.artist);
	  //console.log(req.params.album);
	var artist = req.params.artist;
	var tracktitle = req.params.title;
	
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
	artist = artist.replace(/Various Artists/g, "");
	artist = artist.replace(/various artists/g, "");
	artist = artist.replace(/Various/g, "");
	artist = artist.replace(/various/g, "");
	tracktitle = tracktitle.replace(/ \/ /g, " - ");
	tracktitle = tracktitle.trim();
	
	console.log(artist);
	console.log(tracktitle);
	
	//console.log(artist);
	//console.log(l_artist);
	//console.log(album);
	//console.log(l_album);
	
	//Example Query URL
	//https://www.googleapis.com/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=adele+hello&type=video&maxResults=1
	YTcache.findOne({l_artist_name: l_artist, l_title: l_album, country: "US", format_type: "CD"}, function(err, result) {
		if (err) {
			console.log(err);
		}
		if (!result) {				
			var searchurl = 'https://www.googleapis.com/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + artist + '+' + tracktitle + '&type=video&maxResults=1';
			
			var requesteddata = https.get(searchurl, function(response) {
				var buffer = "";
				var data;
				var videoid;
				
				response.on("data", function (chunk) {
					buffer += chunk;
				});
				
				response.on("end", function (err) {
					//console.log(buffer);
					data = JSON.parse(buffer);
					videoid = data.items[0].id.videoId;
					return res.send({'videoid':videoid});
				});
			});
		}
		if (result) {
			var thetracketag = result.etag;
			var options = {
				host: 'https://www.googleapis.com/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + artist + '+' + tracktitle + '&type=video&maxResults=1',
				headers: {'etag': thetracketag}
			};	
				
			var searchurl = 'https://www.googleapis.com/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + artist + '+' + tracktitle + '&type=video&maxResults=1';
			
			var requesteddata = https.get(searchurl, function(response) {
				var buffer = "";
				var data;
				var videoid;
				
				response.on("data", function (chunk) {
					buffer += chunk;
				});
				
				response.on("end", function (err) {
					//console.log(buffer);
					data = JSON.parse(buffer);
					videoid = data.items[0].id.videoId;
					return res.send({'videoid':videoid});
				});
			});
		}
	});
		
	
  };
 
return this;
 
};
 
module.exports = new videoController();