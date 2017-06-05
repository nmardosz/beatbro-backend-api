//This Controller deals with all functionalities of a Video
 
function testController () {
	var YouTubeAPIKey = "Puy your youtube api key here";
	var http = require('http');
	var https = require('https');
	var request = require('request');
	var	fs = require('fs');
	var path = require("path");
	var mkdirp = require('mkdirp');
	var util = require('util');
	
	
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
 
  // Fetching Details of Student
  this.getTest = function (req, res, next) {

		/*var options = {
			host: 'www.googleapis.com',
			port: 443,
			path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=chris%20isaak+Wicked%20Game&type=video&maxResults=1',
			headers: {'If-None-Match': 'kiOs9cZLH2FUp6r6KJ8eyq_LIOk/kFx1yCS2SfI0yWc1eYxEURfASRE', 'x-album-id': '123456789', 'x-tracknumber': '12'},
			method: 'GET'
		};*/
		
		var options = {
			host: 'www.googleapis.com',
			port: 443,
			path: '/youtube/v3/videos?key=' + YouTubeAPIKey + '&part=statistics&id=5D3Nl1GZzuw',
			headers: {'If-None-Match': '"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/wzRbq1sfGAD7FmZgkEp0c4XDhhs"', 'x-album-id': '123456789', 'x-tracknumber': '12'},
			method: 'GET'
		};
			
		var requesteddata = https.get(options, function(response) {
			var buffer = "";
			var data;
			var videoid;
			
			response.on("data", function (chunk) {
				buffer += chunk;
			});
			
			response.on("end", function (err) {
				//console.log(buffer);
				//util.inspect(response.headers, false, null)
				//fs.writeFile("beatbro-api/log/response.txt", util.inspect(response, false, null), { flag : 'w' }, function(err) {
				//	if(err) {
				//		return console.log(err);
				//	}
				//	console.log("The file was saved!");
				//}); 
				//console.log(response.req.headers);
				console.log(response.req._headers);
				console.log("Status: " + response.statusCode);
			});
		});
	};
		/* if (result) {
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
		
	
  };*/
 
return this;
 
};
 
module.exports = new testController();