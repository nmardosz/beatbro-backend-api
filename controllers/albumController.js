//This Controller deals with all functionalities of an Album
 
function albumController () {
	var YouTubeAPIKey = "Put your youtube api key here";
	var Freedb = require('../models/freedbSchema');
	var Discogs = require('../models/discogsSchema');
	var http = require('http');
	var https = require('https');
	var request = require('request');
	var	fs = require('fs');
	var path = require("path");
	var mkdirp = require('mkdirp');
	var mongoose = require('mongoose');
	var util = require('util');
	var zlib = require('zlib');
	
	
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
 
  // Fetching Details of Album
  this.getAlbum = function (req, res, next) {
	  //console.log(req.params.artist);
	  //console.log(req.params.album);
	var artist = req.params.artist;
	var album = req.params.album;
	
	var key;
	var count = 0;
	var urlsearcharray = [];
	var response = [];
	
	l_artist = artist.toLowerCase();
	l_album = album.toLowerCase();
	c_artist = artist;
	c_album = album;
	
	//Example Replace
	//l_artist = l_artist.replace(/ +/g, " ");
	//l_album = l_album.replace(/ +/g, " ");
	//l_artist = l_artist.replace(/-/g, " ");
	//l_album = l_album.replace(/-/g, " ");
	//l_artist = l_artist.replace(/\'/g, "");
	//l_album = l_album.replace(/\'/g, "");
	l_artist = l_artist.replace(/\+\+\+/g, " + ");
	l_album = l_album.replace(/\+\+\+/g, " + ");
	l_album = l_album.replace(/^[\+]$/g, "+");
	
	console.log(artist);
	console.log(l_artist);
	console.log(album);
	console.log(l_album);
	
	
	if(artist == "various artists"){
		l_artist = "various";
	}
	
		Freedb.findOne({l_artist_name: l_artist, l_title: l_album, "tracklist.4": {$exists: true}, year: {$exists: true, $ne: ""}}, function (err, result) {
			if (err) {
				console.log(err);
			}
			if (!result) {
				Freedb.findOne({l_artist_name: l_artist, l_title: new RegExp('^' + l_album + '.*'), "tracklist.4": {$exists: true}, year: {$exists: true, $ne: ""}}, function (err, result1) {
					if (err) {
						console.log(err);
					}
					if (!result1) {
						Discogs.findOne({l_artist_name: l_artist, l_title: new RegExp('^' + l_album + '.*'), "tracklist.track_duration":{$ne:null}, "tracklist.track_duration":{$ne:""}, format_type:{$ne:"Vinyl"}, country: "US"}, function (err, result2) {
							if (err) {
								console.log(err);
							}
							if (!result2) {
								Discogs.findOne({l_artist_name: l_artist, l_title: new RegExp('^' + l_album + '.*')}, function (err, result3) {
									if (err) {
										console.log(err);
									}
									if (!result3) {
										return res.send("null");
									}
									if (result3){
										console.log("Returned from discogs")
										var responsecounter = 0;
										var responsestatcounter = 0;
										var foundreleaseid = result3.releaseid;
										var prevytsearchtime = result3.ytsearchtime;
										var ytfullsearchtime = new Date().getTime();
										var yttimediff =  ytfullsearchtime - prevytsearchtime;
										//console.log(yttimediff);
										s = Math.floor(yttimediff / 1000);  
										m = Math.floor( s / 60 );
										h = Math.floor( m / 60 );
										s = Math.floor( s % 60 );
										m = Math.floor( m % 60 );
										//s = s >= 10 ? s : '0' + s;    
										console.log(h + " hours " + m + " minutes " + s + " seconds");
										//get new YT use 1 as default
										if (h >= 0 || prevytsearchtime == null) {
											console.log("Get New YT Results");
											Discogs.update({releaseid: foundreleaseid}, {$set: {ytsearchtime: ytfullsearchtime}}, function(err, yttimeupdated) {
													if (err) {
														console.log(err);
													}
											  });
											  
											  
											  
											for (var i = 0; i < result3.tracklist.length; i++) {
												
													var trackdurtoint;
													var trackdur = result3.tracklist[i].track_duration;
													if(trackdur) {
														var trackdurtoint = parseInt(trackdur.charAt(0));
													}
													if (trackdurtoint <= 3) {
														var options = {
															host: 'www.googleapis.com',
															port: 443,
															path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + encodeURIComponent(l_artist) + '+' + encodeURIComponent(result3.tracklist[i].track_title) + '&type=video&videoDuration=short&maxResults=1',
															headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
															method: 'GET'
														};
													}
													if (trackdurtoint >= 4) {
														var options = {
															host: 'www.googleapis.com',
															port: 443,
															path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + encodeURIComponent(l_artist) + '+' + encodeURIComponent(result3.tracklist[i].track_title) + '&type=video&videoDuration=medium&maxResults=1',
															headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
															method: 'GET'
														};
													}
													if (!trackdurtoint) {
														var options = {
															host: 'www.googleapis.com',
															port: 443,
															path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + encodeURIComponent(l_artist) + '+' + encodeURIComponent(result3.tracklist[i].track_title) + '&type=video&maxResults=1',
															headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
															method: 'GET'
														};
													}
													//urlsearcharray[i] = 'https://www.googleapis.com/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + l_artist + '+' + result.tracklist[i].track_title + '&type=video&maxResults=1';
													
													https.get(options, function(response) {
														var buffer = "";
														var data;
														var playlistid;
														var videoid;
														var gunzip = zlib.createGunzip();
														response.pipe(gunzip);
												
														gunzip.on("data", function (chunk) {
															buffer += chunk;
														});
														
														gunzip.on("end", function (err) {
															//console.log(buffer);
															responsecounter++;
															data = JSON.parse(buffer);
															playlistid = data.items[0].id.playlistId;
															videoid = data.items[0].id.videoId;
															if(playlistid) {
																var responsetracknum = response.req._headers['x-tracknumber'];
																var responsereleaseid = response.req._headers['x-album-id'];
																var thistracktitle = Discogs.findOne({releaseid: responsereleaseid});
																thistracktitle = thistracktitle.tracklist[responsetracknum].track_title;
																console.log(thistracktitle);
																var optionsplaylist = {
																	host: 'www.googleapis.com',
																	port: 443,
																	path: '/youtube/v3/playlistItems?part=snippet&playlistId=' + playlistid + '&key=' + YouTubeAPIKey,
																	headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
																	method: 'GET'
																};
																
																https.get(optionsplaylist, function(playlistresponse) {
																	var playlistbuffer = "";
																	var playlistdata;
																	var playlistvideoid;
																	var gunzip = zlib.createGunzip();
																	playlistresponse.pipe(gunzip);
															
																	gunzip.on("data", function (chunk) {
																		playlistbuffer += chunk;
																	});
																	
																	gunzip.on("end", function (err) {
																		playlistdata = JSON.parse(playlistbuffer);
																		console.log(playlistdata);
																	});
																});
																
															}
															if(videoid) {
																//fs.writeFile("/beatbro-api/log/response.txt", util.inspect(response.req._headers, false, null), { flag : 'a' }, function(err) {
																//	if(err) {
																//		return console.log(err);
																//	}
																//	console.log("The file was saved!");
																//}); 
																//console.log(response.req._headers['x-tracknumber']);
																var responsetracknum = response.req._headers['x-tracknumber'];
																var responsereleaseid = response.req._headers['x-album-id'];
																var set = {$set: {}};
																set.$set["tracklist." + responsetracknum + ".videoid"] = videoid;
																Discogs.update({releaseid: foundreleaseid}, set, function(err, done) {
																		if (err) {
																			console.log(err);
																		}
																		if (done) {
																			//console.log("done: " + JSON.stringify(done));
																			
																			var statsoptions = {
																				host: 'www.googleapis.com',
																				port: 443,
																				path: '/youtube/v3/videos?key=' + YouTubeAPIKey + '&part=statistics&id=' + videoid,
																				headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': responsereleaseid, 'x-tracknumber': responsetracknum},
																				method: 'GET'
																			};
																			
																			
																			https.get(statsoptions, function(responsestats) {
																				var bufferdat = "";
																				var datastats;
																				var viewcount;
																				var likecount;
																				var dislikecount;
																				var gunzip = zlib.createGunzip();
																				responsestats.pipe(gunzip);
																		
																				gunzip.on("data", function (chunk) {
																					bufferdat += chunk;
																				});
																				
																				gunzip.on("end", function (err) {
																					responsestatcounter++;
																					datastats = JSON.parse(bufferdat);
																					viewcount = datastats.items[0].statistics["viewCount"];
																					likecount = datastats.items[0].statistics["likeCount"];
																					dislikecount = datastats.items[0].statistics["dislikeCount"];
																					var responsestatstracknum = response.req._headers['x-tracknumber'];
																					var responsestatsreleaseid = response.req._headers['x-album-id'];
																					var statsset = {$set: {}};
																					statsset.$set["tracklist." + responsetracknum + ".playcount"] = viewcount;
																					statsset.$set["tracklist." + responsetracknum + ".likecount"] = likecount;
																					statsset.$set["tracklist." + responsetracknum + ".dislikecount"] = dislikecount;
																					Discogs.update({releaseid: foundreleaseid}, statsset, function(err, statsdone) {
																						if (err) {
																							console.log(err);
																						}
																						if (statsdone) {
																							if (responsestatcounter == result3.tracklist.length) {
																								Discogs.findOne({releaseid: foundreleaseid}, function (err, newresult) {
																									if (err) {
																										console.log(err);
																									}
																									else {
																										return res.send({'result':newresult});
																									}
																								});
																							}
																						}
																					});
																					
																				});
																				
																			});
																			
																		}
																});
															}
														});
													});
											}
										}
										else {
											console.log("Result YT updated less than an hour ago.");
											return res.send({'result':result3});
										}
									}
								});
							}
							if (result2){
								console.log("Returned from discogs")
								var responsecounter = 0;
								var responsestatcounter = 0;
								var foundreleaseid = result2.releaseid;
								var prevytsearchtime = result2.ytsearchtime;
								var ytfullsearchtime = new Date().getTime();
								var yttimediff =  ytfullsearchtime - prevytsearchtime;
								//console.log(yttimediff);
								s = Math.floor(yttimediff / 1000);  
								m = Math.floor( s / 60 );
								h = Math.floor( m / 60 );
								s = Math.floor( s % 60 );
								m = Math.floor( m % 60 );
								//s = s >= 10 ? s : '0' + s;    
								console.log(h + " hours " + m + " minutes " + s + " seconds");
								//get new YT use 1 as default
								if (h >= 0 || prevytsearchtime == null) {
									console.log("Get New YT Results");
									Discogs.update({releaseid: foundreleaseid}, {$set: {ytsearchtime: ytfullsearchtime}}, function(err, yttimeupdated) {
											if (err) {
												console.log(err);
											}
									  });
									  
									  
									  
									for (var i = 0; i < result2.tracklist.length; i++) {
										
											var trackdurtoint;
											var trackdur = result2.tracklist[i].track_duration;
											if(trackdur) {
												trackdurtoint = parseInt(trackdur.charAt(0));
											}
											if (trackdurtoint <= 3) {
												var options = {
													host: 'www.googleapis.com',
													port: 443,
													path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + encodeURIComponent(l_artist) + '+' + encodeURIComponent(result2.tracklist[i].track_title) + '&type=video&videoDuration=short&maxResults=1',
													headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
													method: 'GET'
												};
											}
											if (trackdurtoint >= 4) {
												var options = {
													host: 'www.googleapis.com',
													port: 443,
													path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + encodeURIComponent(l_artist) + '+' + encodeURIComponent(result2.tracklist[i].track_title) + '&type=video&videoDuration=medium&maxResults=1',
													headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
													method: 'GET'
												};
											}
											if (!trackdurtoint) {
												var options = {
													host: 'www.googleapis.com',
													port: 443,
													path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + encodeURIComponent(l_artist) + '+' + encodeURIComponent(result2.tracklist[i].track_title) + '&type=video&maxResults=1',
													headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
													method: 'GET'
												};
											}
											//urlsearcharray[i] = 'https://www.googleapis.com/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + l_artist + '+' + result.tracklist[i].track_title + '&type=video&maxResults=1';
											
											https.get(options, function(response) {
												var buffer = "";
												var data;
												var playlistid;
												var videoid;
												var gunzip = zlib.createGunzip();
												response.pipe(gunzip);
										
												gunzip.on("data", function (chunk) {
													buffer += chunk;
												});
												
												gunzip.on("end", function (err) {
													//console.log(buffer);
													responsecounter++;
													data = JSON.parse(buffer);
													playlistid = data.items[0].id.playlistId;
													videoid = data.items[0].id.videoId;
													if(playlistid) {
														var responsetracknum = response.req._headers['x-tracknumber'];
														var responsereleaseid = response.req._headers['x-album-id'];
														var thistracktitle = Discogs.findOne({releaseid: responsereleaseid});
														thistracktitle = thistracktitle.tracklist[responsetracknum].track_title;
														console.log(thistracktitle);
														var optionsplaylist = {
															host: 'www.googleapis.com',
															port: 443,
															path: '/youtube/v3/playlistItems?part=snippet&playlistId=' + playlistid + '&key=' + YouTubeAPIKey,
															headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
															method: 'GET'
														};
														
														https.get(optionsplaylist, function(playlistresponse) {
															var playlistbuffer = "";
															var playlistdata;
															var playlistvideoid;
															var gunzip = zlib.createGunzip();
															playlistresponse.pipe(gunzip);
													
															gunzip.on("data", function (chunk) {
																playlistbuffer += chunk;
															});
															
															gunzip.on("end", function (err) {
																playlistdata = JSON.parse(playlistbuffer);
																console.log(playlistdata);
															});
														});
														
													}
													if(videoid) {
														//fs.writeFile("/beatbro-api/log/response.txt", util.inspect(response.req._headers, false, null), { flag : 'a' }, function(err) {
														//	if(err) {
														//		return console.log(err);
														//	}
														//	console.log("The file was saved!");
														//}); 
														//console.log(response.req._headers['x-tracknumber']);
														var responsetracknum = response.req._headers['x-tracknumber'];
														var responsereleaseid = response.req._headers['x-album-id'];
														var set = {$set: {}};
														set.$set["tracklist." + responsetracknum + ".videoid"] = videoid;
														Discogs.update({releaseid: foundreleaseid}, set, function(err, done) {
																if (err) {
																	console.log(err);
																}
																if (done) {
																	//console.log("done: " + JSON.stringify(done));
																	
																	var statsoptions = {
																		host: 'www.googleapis.com',
																		port: 443,
																		path: '/youtube/v3/videos?key=' + YouTubeAPIKey + '&part=statistics&id=' + videoid,
																		headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': responsereleaseid, 'x-tracknumber': responsetracknum},
																		method: 'GET'
																	};
																	
																	
																	https.get(statsoptions, function(responsestats) {
																		var bufferdat = "";
																		var datastats;
																		var viewcount;
																		var likecount;
																		var dislikecount;
																		var gunzip = zlib.createGunzip();
																		responsestats.pipe(gunzip);
																
																		gunzip.on("data", function (chunk) {
																			bufferdat += chunk;
																		});
																		
																		gunzip.on("end", function (err) {
																			responsestatcounter++;
																			datastats = JSON.parse(bufferdat);
																			viewcount = datastats.items[0].statistics["viewCount"];
																			likecount = datastats.items[0].statistics["likeCount"];
																			dislikecount = datastats.items[0].statistics["dislikeCount"];
																			var responsestatstracknum = response.req._headers['x-tracknumber'];
																			var responsestatsreleaseid = response.req._headers['x-album-id'];
																			var statsset = {$set: {}};
																			statsset.$set["tracklist." + responsetracknum + ".playcount"] = viewcount;
																			statsset.$set["tracklist." + responsetracknum + ".likecount"] = likecount;
																			statsset.$set["tracklist." + responsetracknum + ".dislikecount"] = dislikecount;
																			Discogs.update({releaseid: foundreleaseid}, statsset, function(err, statsdone) {
																				if (err) {
																					console.log(err);
																				}
																				if (statsdone) {
																					if (responsestatcounter == result2.tracklist.length) {
																						Discogs.findOne({releaseid: foundreleaseid}, function (err, newresult) {
																							if (err) {
																								console.log(err);
																							}
																							else {
																								return res.send({'result':newresult});
																							}
																						});
																					}
																				}
																			});
																			
																		});
																		
																	});
																	
																}
														  });
													}
												});
												
											});
									}
								}
								else {
									console.log("Result YT updated less than an hour ago.");
									return res.send({'result':result2});
								}
							}
						});
					}
					if (result1) {
						console.log("Returned from freedb")
						
						var responsecounter = 0;
						var responsestatcounter = 0;
						var foundreleaseid = result1.releaseid;
						var prevytsearchtime = result1.ytsearchtime;
						var ytfullsearchtime = new Date().getTime();
						var yttimediff =  ytfullsearchtime - prevytsearchtime;
						//console.log(yttimediff);
						s = Math.floor(yttimediff / 1000);  
						m = Math.floor( s / 60 );
						h = Math.floor( m / 60 );
						s = Math.floor( s % 60 );
						m = Math.floor( m % 60 );
						//s = s >= 10 ? s : '0' + s;    
						console.log(h + " hours " + m + " minutes " + s + " seconds");
						//get new YT use 1 as default
						if (h >= 0 || prevytsearchtime == null) {
							console.log("Get New YT Results");
							Freedb.update({releaseid: foundreleaseid}, {$set: {ytsearchtime: ytfullsearchtime}}, function(err, yttimeupdated) {
									if (err) {
										console.log(err);
									}
							  });
							  
							  
							  
							for (var i = 0; i < result1.tracklist.length; i++) {
								
									var trackdurtoint;
									var trackdur = result1.tracklist[i].track_duration;
									if(trackdur) {
										trackdurtoint = parseInt(trackdur.charAt(0));
									}
									if (trackdurtoint <= 3) {
										var options = {
											host: 'www.googleapis.com',
											port: 443,
											path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + encodeURIComponent(l_artist) + '+' + encodeURIComponent(result1.tracklist[i].track_title) + '&type=video&videoDuration=short&maxResults=1',
											headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
											method: 'GET'
										};
									}
									if (trackdurtoint >= 4) {
										var options = {
											host: 'www.googleapis.com',
											port: 443,
											path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + encodeURIComponent(l_artist) + '+' + encodeURIComponent(result1.tracklist[i].track_title) + '&type=video&videoDuration=medium&maxResults=1',
											headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
											method: 'GET'
										};
									}
									if (!trackdurtoint) {
										var options = {
											host: 'www.googleapis.com',
											port: 443,
											path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + encodeURIComponent(l_artist) + '+' + encodeURIComponent(result1.tracklist[i].track_title) + '&type=video&maxResults=1',
											headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
											method: 'GET'
										};
									}
									//urlsearcharray[i] = 'https://www.googleapis.com/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + l_artist + '+' + result.tracklist[i].track_title + '&type=video&maxResults=1';
									
									https.get(options, function(response) {
										var buffer = "";
										var data;
										var gunzip = zlib.createGunzip();
										response.pipe(gunzip);
								
										gunzip.on("data", function (chunk) {
											buffer += chunk;
										});
										
										gunzip.on("end", function (err) {
											//console.log(buffer);
											responsecounter++;
											data = JSON.parse(buffer);
											if(data.items[0].id.kind == "youtube#playlist") {
												var playlistid = data.items[0].id.playlistId;
												console.log("there is a playlist");
												console.log(data.items[0]);
												var responsetracknum = response.req._headers['x-tracknumber'];
												var responsereleaseid = response.req._headers['x-album-id'];
												console.log(result1.tracklist[responsetracknum].track_title);
													var optionsplaylist = {
													host: 'www.googleapis.com',
													port: 443,
													path: '/youtube/v3/playlistItems?part=snippet&playlistId=' + playlistid + '&key=' + YouTubeAPIKey + '&maxResults=50',
													headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
													method: 'GET'
												};
												
												https.get(optionsplaylist, function(playlistresponse) {
													var playlistbuffer = "";
													var playlistdata;
													var playlistvideoid;
													var gunzip = zlib.createGunzip();
													playlistresponse.pipe(gunzip);
											
													gunzip.on("data", function (chunk) {
														playlistbuffer += chunk;
													});
													
													gunzip.on("end", function (err) {
														playlistdata = JSON.parse(playlistbuffer);
														//console.log(playlistdata.items.length);
														var titletotest = result1.tracklist[responsetracknum].track_title;
														var regexready = titletotest.replace(/\./g, "\\.").replace(/\#/g, "\\#").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\!/g, "\\!").replace(/\?/g, "\\?");
														var testit = new RegExp(regexready, "gi");
														for (var item = 0; item < playlistdata.items.length; item++) {
															if (testit.test(playlistdata.items[item].snippet.title)) {
															console.log(playlistdata.items[item].snippet.title);
															console.log(playlistdata.items[item].snippet.resourceId.videoId);
															var videoid = playlistdata.items[item].snippet.resourceId.videoId;
															var set = {$set: {}};
															set.$set["tracklist." + responsetracknum + ".videoid"] = videoid;
															Freedb.update({releaseid: foundreleaseid}, set, function(err, done) {
																	if (err) {
																		console.log(err);
																	}
																	if (done) {
																		//console.log("done: " + JSON.stringify(done));
																		
																		var statsoptions = {
																			host: 'www.googleapis.com',
																			port: 443,
																			path: '/youtube/v3/videos?key=' + YouTubeAPIKey + '&part=statistics&id=' + videoid,
																			headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': responsereleaseid, 'x-tracknumber': responsetracknum},
																			method: 'GET'
																		};
																		
																		
																		https.get(statsoptions, function(responsestats) {
																			var bufferdat = "";
																			var datastats;
																			var viewcount;
																			var likecount;
																			var dislikecount;
																			var gunzip = zlib.createGunzip();
																			responsestats.pipe(gunzip);
																	
																			gunzip.on("data", function (chunk) {
																				bufferdat += chunk;
																			});
																			
																			gunzip.on("end", function (err) {
																				responsestatcounter++;
																				datastats = JSON.parse(bufferdat);
																				viewcount = datastats.items[0].statistics["viewCount"];
																				likecount = datastats.items[0].statistics["likeCount"];
																				dislikecount = datastats.items[0].statistics["dislikeCount"];
																				var responsestatstracknum = response.req._headers['x-tracknumber'];
																				var responsestatsreleaseid = response.req._headers['x-album-id'];
																				var statsset = {$set: {}};
																				statsset.$set["tracklist." + responsetracknum + ".playcount"] = viewcount;
																				statsset.$set["tracklist." + responsetracknum + ".likecount"] = likecount;
																				statsset.$set["tracklist." + responsetracknum + ".dislikecount"] = dislikecount;
																				Freedb.update({releaseid: foundreleaseid}, statsset, function(err, statsdone) {
																					if (err) {
																						console.log(err);
																					}
																					if (statsdone) {
																						if (responsestatcounter == result1.tracklist.length) {
																							Freedb.findOne({releaseid: foundreleaseid}, function (err, newresult) {
																								if (err) {
																									console.log(err);
																								}
																								else {
																									return res.send({'result':newresult});
																								}
																							});
																						}
																					}
																				});
																				
																			});
																			
																		});
																		
																	}
															  });
															//console.log(result1.tracklist[responsetracknum].track_title);
															}
														}
													});
												});
											}
											if(data.items[0].id.kind == "youtube#video") {
												var videoid = data.items[0].id.videoId;
												//fs.writeFile("/beatbro-api/log/response.txt", util.inspect(response.req._headers, false, null), { flag : 'a' }, function(err) {
												//	if(err) {
												//		return console.log(err);
												//	}
												//	console.log("The file was saved!");
												//}); 
												//console.log(response.req._headers['x-tracknumber']);
												var responsetracknum = response.req._headers['x-tracknumber'];
												var responsereleaseid = response.req._headers['x-album-id'];
												var set = {$set: {}};
												set.$set["tracklist." + responsetracknum + ".videoid"] = videoid;
												Freedb.update({releaseid: foundreleaseid}, set, function(err, done) {
														if (err) {
															console.log(err);
														}
														if (done) {
															//console.log("done: " + JSON.stringify(done));
															
															var statsoptions = {
																host: 'www.googleapis.com',
																port: 443,
																path: '/youtube/v3/videos?key=' + YouTubeAPIKey + '&part=statistics&id=' + videoid,
																headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': responsereleaseid, 'x-tracknumber': responsetracknum},
																method: 'GET'
															};
															
															
															https.get(statsoptions, function(responsestats) {
																var bufferdat = "";
																var datastats;
																var viewcount;
																var likecount;
																var dislikecount;
																var gunzip = zlib.createGunzip();
																responsestats.pipe(gunzip);
														
																gunzip.on("data", function (chunk) {
																	bufferdat += chunk;
																});
																
																gunzip.on("end", function (err) {
																	responsestatcounter++;
																	datastats = JSON.parse(bufferdat);
																	viewcount = datastats.items[0].statistics["viewCount"];
																	likecount = datastats.items[0].statistics["likeCount"];
																	dislikecount = datastats.items[0].statistics["dislikeCount"];
																	var responsestatstracknum = response.req._headers['x-tracknumber'];
																	var responsestatsreleaseid = response.req._headers['x-album-id'];
																	var statsset = {$set: {}};
																	statsset.$set["tracklist." + responsetracknum + ".playcount"] = viewcount;
																	statsset.$set["tracklist." + responsetracknum + ".likecount"] = likecount;
																	statsset.$set["tracklist." + responsetracknum + ".dislikecount"] = dislikecount;
																	Freedb.update({releaseid: foundreleaseid}, statsset, function(err, statsdone) {
																		if (err) {
																			console.log(err);
																		}
																		if (statsdone) {
																			if (responsestatcounter == result1.tracklist.length) {
																				Freedb.findOne({releaseid: foundreleaseid}, function (err, newresult) {
																					if (err) {
																						console.log(err);
																					}
																					else {
																						return res.send({'result':newresult});
																					}
																				});
																			}
																		}
																	});
																	
																});
																
															});
															
														}
												  });
											}
										});
									});
							}
						}
						else {
							console.log("Result YT updated less than an hour ago.");
							return res.send({'result':result1});
						}
						
					}
				});
			}
			if (result) {
				console.log("Returned from freedb")
				var responsecounter = 0;
				var responsestatcounter = 0;
				var foundreleaseid = result.releaseid;
				var prevytsearchtime = result.ytsearchtime;
				var ytfullsearchtime = new Date().getTime();
				var yttimediff =  ytfullsearchtime - prevytsearchtime;
				//console.log(yttimediff);
				s = Math.floor(yttimediff / 1000);  
				m = Math.floor( s / 60 );
				h = Math.floor( m / 60 );
				s = Math.floor( s % 60 );
				m = Math.floor( m % 60 );
				//s = s >= 10 ? s : '0' + s;    
				console.log(h + " hours " + m + " minutes " + s + " seconds");
				//get new YT use 1 as default
				if (h >= 0 || prevytsearchtime == null) {
					console.log("Get New YT Results");
					Freedb.update({releaseid: foundreleaseid}, {$set: {ytsearchtime: ytfullsearchtime}}, function(err, yttimeupdated) {
							if (err) {
								console.log(err);
							}
					  });
					  
					  
					  
					for (var i = 0; i < result.tracklist.length; i++) {
						
							var trackdurtoint;	
							var trackdur = result.tracklist[i].track_duration;
							if(trackdur) {
								trackdurtoint = parseInt(trackdur.charAt(0));
							}
							if (trackdurtoint <= 3) {
								var options = {
									host: 'www.googleapis.com',
									port: 443,
									path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + encodeURIComponent(l_artist) + '+' + encodeURIComponent(result.tracklist[i].track_title) + '&type=video&videoDuration=short&maxResults=1',
									headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
									method: 'GET'
								};
							}
							if (trackdurtoint >= 4) {
								var options = {
									host: 'www.googleapis.com',
									port: 443,
									path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + encodeURIComponent(l_artist) + '+' + encodeURIComponent(result.tracklist[i].track_title) + '&type=video&videoDuration=medium&maxResults=1',
									headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
									method: 'GET'
								};
							}
							if (!trackdurtoint) {
								var options = {
									host: 'www.googleapis.com',
									port: 443,
									path: '/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + encodeURIComponent(l_artist) + '+' + encodeURIComponent(result.tracklist[i].track_title) + '&type=video&maxResults=1',
									headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
									method: 'GET'
								};
							}
							//urlsearcharray[i] = 'https://www.googleapis.com/youtube/v3/search?key=' + YouTubeAPIKey + '&part=id&q=' + l_artist + '+' + result.tracklist[i].track_title + '&type=video&maxResults=1';
							
							https.get(options, function(response) {
								var buffer = "";
								var data;
								var gunzip = zlib.createGunzip();
								response.pipe(gunzip);
								
						
								gunzip.on("data", function (chunk) {
									buffer += chunk;
								});
								
								gunzip.on("end", function (err) {
									responsecounter++;
									data = JSON.parse(buffer);
									if(data.items[0].id.kind == "youtube#playlist") {
										var playlistid = data.items[0].id.playlistId;
										console.log("there is a playlist");
										console.log(data.items[0]);
										var responsetracknum = response.req._headers['x-tracknumber'];
										var responsereleaseid = response.req._headers['x-album-id'];
										console.log(result.tracklist[responsetracknum].track_title);
										var optionsplaylist = {
											host: 'www.googleapis.com',
											port: 443,
											path: '/youtube/v3/playlistItems?part=snippet&playlistId=' + playlistid + '&key=' + YouTubeAPIKey + '&maxResults=50',
											headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': foundreleaseid, 'x-tracknumber': i},
											method: 'GET'
										};
										
										https.get(optionsplaylist, function(playlistresponse) {
											var playlistbuffer = "";
											var playlistdata;
											var playlistvideoid;
											var gunzip = zlib.createGunzip();
											playlistresponse.pipe(gunzip);
									
											gunzip.on("data", function (chunk) {
												playlistbuffer += chunk;
											});
											
											gunzip.on("end", function (err) {
												playlistdata = JSON.parse(playlistbuffer);
												//console.log(playlistdata.items.length);
												var titletotest = result.tracklist[responsetracknum].track_title;
												var regexready = titletotest.replace(/\./g, "\\.").replace(/\#/g, "\\#").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\!/g, "\\!").replace(/\?/g, "\\?");
												var testit = new RegExp(regexready, "gi");
												for (var item = 0; item < playlistdata.items.length; item++) {
													if (testit.test(playlistdata.items[item].snippet.title)) {
													console.log(playlistdata.items[item].snippet.title);
													console.log(playlistdata.items[item].snippet.resourceId.videoId);
													var videoid = playlistdata.items[item].snippet.resourceId.videoId;
													var set = {$set: {}};
													set.$set["tracklist." + responsetracknum + ".videoid"] = videoid;
													Freedb.update({releaseid: foundreleaseid}, set, function(err, done) {
															if (err) {
																console.log(err);
															}
															if (done) {
																//console.log("done: " + JSON.stringify(done));
																
																var statsoptions = {
																	host: 'www.googleapis.com',
																	port: 443,
																	path: '/youtube/v3/videos?key=' + YouTubeAPIKey + '&part=statistics&id=' + videoid,
																	headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': responsereleaseid, 'x-tracknumber': responsetracknum},
																	method: 'GET'
																};
																
																
																https.get(statsoptions, function(responsestats) {
																	var bufferdat = "";
																	var datastats;
																	var viewcount;
																	var likecount;
																	var dislikecount;
																	var gunzip = zlib.createGunzip();
																	responsestats.pipe(gunzip);
															
																	gunzip.on("data", function (chunk) {
																		bufferdat += chunk;
																	});
																	
																	gunzip.on("end", function (err) {
																		responsestatcounter++;
																		datastats = JSON.parse(bufferdat);
																		viewcount = datastats.items[0].statistics["viewCount"];
																		likecount = datastats.items[0].statistics["likeCount"];
																		dislikecount = datastats.items[0].statistics["dislikeCount"];
																		var responsestatstracknum = response.req._headers['x-tracknumber'];
																		var responsestatsreleaseid = response.req._headers['x-album-id'];
																		var statsset = {$set: {}};
																		statsset.$set["tracklist." + responsetracknum + ".playcount"] = viewcount;
																		statsset.$set["tracklist." + responsetracknum + ".likecount"] = likecount;
																		statsset.$set["tracklist." + responsetracknum + ".dislikecount"] = dislikecount;
																		Freedb.update({releaseid: foundreleaseid}, statsset, function(err, statsdone) {
																			if (err) {
																				console.log(err);
																			}
																			if (statsdone) {
																				if (responsestatcounter == result.tracklist.length) {
																					Freedb.findOne({releaseid: foundreleaseid}, function (err, newresult) {
																						if (err) {
																							console.log(err);
																						}
																						else {
																							return res.send({'result':newresult});
																						}
																					});
																				}
																			}
																		});
																		
																	});
																	
																});
																
															}
													  });
													//console.log(result.tracklist[responsetracknum].track_title);
													}
												}
											});
										});
									}
									if(data.items[0].id.kind == "youtube#video") {
										var videoid = data.items[0].id.videoId;
										//fs.writeFile("/beatbro-api/log/response.txt", util.inspect(response.req._headers, false, null), { flag : 'a' }, function(err) {
										//	if(err) {
										//		return console.log(err);
										//	}
										//	console.log("The file was saved!");
										//}); 
										//console.log(response);
										var responsetracknum = response.req._headers['x-tracknumber'];
										var responsereleaseid = response.req._headers['x-album-id'];
										//console.log(responsetracknum);
										var set = {$set: {}};
										set.$set["tracklist." + responsetracknum + ".videoid"] = videoid;
										Freedb.update({releaseid: foundreleaseid}, set, function(err, done) {
												if (err) {
													console.log(err);
												}
												if (done) {
													//console.log("done: " + JSON.stringify(done));
													
													var statsoptions = {
														host: 'www.googleapis.com',
														port: 443,
														path: '/youtube/v3/videos?key=' + YouTubeAPIKey + '&part=statistics&id=' + videoid,
														headers: {'accept-encoding': 'gzip', 'user-agent': 'beatbro (gzip)', 'x-album-id': responsereleaseid, 'x-tracknumber': responsetracknum},
														method: 'GET'
													};
													
													
													https.get(statsoptions, function(responsestats) {
														var bufferdat = "";
														var datastats;
														var viewcount;
														var likecount;
														var dislikecount;
														var gunzip = zlib.createGunzip();
														responsestats.pipe(gunzip);
												
														gunzip.on("data", function (chunk) {
															bufferdat += chunk;
														});
														
														gunzip.on("end", function (err) {
															responsestatcounter++;
															datastats = JSON.parse(bufferdat);
															viewcount = datastats.items[0].statistics["viewCount"];
															likecount = datastats.items[0].statistics["likeCount"];
															dislikecount = datastats.items[0].statistics["dislikeCount"];
															var responsestatstracknum = response.req._headers['x-tracknumber'];
															var responsestatsreleaseid = response.req._headers['x-album-id'];
															var statsset = {$set: {}};
															statsset.$set["tracklist." + responsetracknum + ".playcount"] = viewcount;
															statsset.$set["tracklist." + responsetracknum + ".likecount"] = likecount;
															statsset.$set["tracklist." + responsetracknum + ".dislikecount"] = dislikecount;
															Freedb.update({releaseid: foundreleaseid}, statsset, function(err, statsdone) {
																if (err) {
																	console.log(err);
																}
																if (statsdone) {
																	if (responsestatcounter == result.tracklist.length) {
																		Freedb.findOne({releaseid: foundreleaseid}, function (err, newresult) {
																			if (err) {
																				console.log(err);
																			}
																			else {
																				return res.send({'result':newresult});
																			}
																		});
																	}
																}
															});
															
														});
														
													});
													
												}
										  });
									}
								});
							});
					}
				}
				else {
					console.log("Result YT updated less than an hour ago.");
					return res.send({'result':result});
				}
				
			}
		});
  };

  //Example for external api request to api
  this.getAlbumImg = function (req, res, next) {
		//console.log(req.params.artist);
		//console.log(req.params.album);
		var imgurl;
		var appleimgurl;
		var artist = req.params.artist;
		var album = req.params.album;
		
		Album.findOne({l_artist_name: l_artist, l_title: l_album, country: "US", format_type: "CD"}, function(err, result) {
			if (err) {
				console.log(err);
				return res.send(err); 
			  }
			else {
				var coverid = result._id;
				var coveridtourl = coverid.match(/.{1,8}/g);
				var imgurl = coveridtourl.join('/');
				console.log(imgurl);
				//var locimgurl = "http://localhost:4200/coverart/" + imgurl + "/" + bcodenod + ".jpg";
				if (fs.existsSync('../coverart/' + imgurl + "/" + coverid + ".jpg")) {
					return res.send("Image available");
					//console.log("Image available")
				}
				else {
					//console.log("Image not available retrieve from external source");
					
					var appleurl = "https://itunes.apple.com/search?term=" + c_artist + "+" + c_album + "&country=US&media=music&entity=album&limit=1";

					var requesteddata = https.get(appleurl, function(response) {
						var buffer = "";
						var data;
						var appleimgurl;
					
						response.on("data", function (chunk) {
							buffer += chunk;
						});
					
						response.on("end", function (err) {
							//console.log(buffer);
							data = JSON.parse(buffer);
							appleimgurl = data.results[0].artworkUrl100;
							var largercover = appleimgurl.replace("100x100bb.jpg", "400x400bb.jpg");
							
							//console.log(largercover);
							
							request.get({url: largercover, encoding: 'binary'}, function (err, response, body) {
								
								if(err) {
									console.log(err);
								}
								else {
										var dir = '../coverart/' + imgurl + '/';
										if (!fs.existsSync(dir)) {
											mkdirp(dir,0775, function (err) {
												if (err) {
													console.log(err);
												}
												else {
													fs.writeFile(dir + coverid + ".jpg", body, 'binary', function(err) {
														if(err)
															console.log(err);
														else
															//console.log("Image was saved!");
															return res.send("Image returned");
													}); 
												}
											});
											
										}
										else {
											fs.writeFile(dir + coverid + ".jpg", body, 'binary', function(err) {
												if(err)
													console.log(err);
												else
													//console.log("Image was saved!");
													return res.send("Image returned");
											}); 
										}
								}
							});
						});
					
					
					});
				}
			  }
		});
	
	
	
  };
 
return this;
 
};
 
module.exports = new albumController();