//This Controller deals with all functionalities of User Creation

function userController () {
	var secretkey = "Put your secret key for hashing here";
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



	//-------------- Example of creating records -------------

	// Creating New User
	this.createUser = function (req, res, next) {
		var sentusername = req.params.username;
		var sentpassword = req.params.password;
		var sentconfemail = req.params.confemail;
		var sentdobmonth = req.params.dobmonth;
		var sentdobday = req.params.dobday;
		var sentdobyear = req.params.dobyear;
		var sentgender = req.params.gender;
		var sentallowmarketing = req.params.allowmarketing;
		var whencreated = new Date();
		var accountactive = false;
    var senthostingdevice = "None";
		var senthostingsocket = "None";
    var sentjoineddevice = "None";
    var sentnumberjoined = 0;
    var sentprouser = false;
		var validationkey;

		crypto.randomBytes(32, function(ex, buf) {
			validationkey = buf.toString('hex');
		});

		bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
			if (err) return next(err);

        // hash the password along with our new salt
			bcrypt.hash(sentpassword, salt, function(err, hash) {
				if (err) return next(err);

            // override the cleartext password with the hashed one
				sentpassword = hash;

				User.create({username:sentusername, password:sentpassword, email:decodeURI(sentconfemail), dobmonth:sentdobmonth, dobday:sentdobday, dobyear:sentdobyear, gender:sentgender, allowmarketing:sentallowmarketing, created:whencreated, activationkey:validationkey, verified:accountactive, hostingdevice:senthostingdevice, hostingsocket:senthostingsocket, joineddevice:sentjoineddevice, numberjoined:sentnumberjoined, prouser:sentprouser}, function(err, result) {
					if (err) {
						console.log(err);
						return res.send({'error':err});
					}
					else {
						return res.send({'result':result,'status':'successfully saved'});
					}
				});
			});

		});
	};


	//code below to authenticate a user
	this.authenticate = function (req, res, next) {
		var sentusername = req.params.username;
		var sentpassword = req.params.password;
		User.findOne({username:sentusername}, function(err, user) {
			if (err) {
				console.log(err);
				return res.send({'error':err});
			}
			if (!user) {
				return res.send({ success: false, message: 'Authentication failed. User not found.' });
			} else if (user) {
				// check if password matches
        if(user.verified == true) {

  				bcrypt.compare(sentpassword, user.password, function(err, isvalid) {
  					// res = false
  					if (isvalid != true) {
  						return res.send({ success: false, message: 'Authentication failed. Wrong password.' });
  					} else {

  						// if user is found and password is right
  						// create a token
              var wts = {"_id": user._id, "username": user.username};
  						var token = jwt.sign(wts, secretkey, {expiresIn: "24h"});

  						// return the information including token as JSON
  						return res.send({
  							success: true,
  							message: 'Enjoy your token!',
  							token: token,
  							username: user.username
  						});
  					}
  				});
        }
        else {
          return res.send({ success: false, message: 'Account verification needed.' });
        }
			}

		});
	};
	//-------------- End example of creating records -------------

return this;

}

module.exports = new userController();
