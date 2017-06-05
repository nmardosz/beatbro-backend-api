function remoteController () {
	var secretkey = "Put your secret key here";
	var User = require('../models/usersSchema');
	var http = require('http');
	var https = require('https');
	var request = require('request');
	var	fs = require('fs');
	var path = require("path");
	var mkdirp = require('mkdirp');
	var bcrypt = require('bcrypt');
	var SALT_WORK_FACTOR = 10;
	var mongoose = require('mongoose');
	var crypto = require('crypto');
	var jwt = require('jsonwebtoken');
	var config = require('../config');
	var util = require('util');
  var uuid = require('uuid4');



	//-------------- Example of creating records -------------

	// Creating New User
	this.remotehost = function (req, res, next) {
    //console.log("req header token: " + req.headers['x-access-token']);
		var joinpassword = req.params.joinpassword;

    jwt.verify(req.headers['x-access-token'], secretkey, function(err, isvalid) {

      if(err) {
        console.log("Invalid token");
        return res.send({'error':'user error'});
      }
      if(isvalid) {
				User.findOne({"username": isvalid.username}, function(err, user) {
					if (err) {
						return res.send({'error':'user error'});
					}
					if (user) {
						var currhostingid = user.hostingdevice;
						if(isvalid.hostingid != currhostingid) {
			        var hostid = uuid();
							crypto.randomBytes(32, function(ex, buf) {
								validationkey = buf.toString('hex');
							});

							bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
								if (err) return next(err);

					        // hash the password along with our new salt
								bcrypt.hash(joinpassword, salt, function(err, hash) {
									if (err) return next(err);

					            // override the cleartext password with the hashed one
									joinpassword = hash;
									var set = {$set: {}};
									set.$set["hostingdevice"] = hostid;
									set.$set["joinpassword"] = joinpassword;
									User.update({username: isvalid.username}, set, function(err, done) {
										if (err) {
											return res.send({'error':'user error'});
										}
										if (done) {
											var wts = {"_id": isvalid._id, "username": isvalid.username, "hostingid": hostid, "joinpassword": joinpassword};
							        var token = jwt.sign(wts, secretkey, {expiresIn: "24h"});

							        // return the information including token as JSON
							        return res.send({
							          success: true,
							          message: 'Enjoy your new host token!',
							          token: token,
							          username: isvalid.username,
												hostingid: hostid,
												jpassword: joinpassword
							        });
										}
									});
								});
							});
						}
						else {
							return res.send({
								success: false,
								message: 'This device is already hosting',
								username: isvalid.username
							});
						}
					}
				});
      }
    });
   //console.log("res: " + res);
  }

return this;

}

module.exports = new remoteController();
