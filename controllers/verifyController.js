//This Controller deals with all functionalities of User Creation

function verifyController () {
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
	this.verify = function (req, res, next) {
    //console.log("req header token: " + req.headers['x-access-token']);
    jwt.verify(req.headers['x-access-token'], secretkey, function(err, isvalid) {

      if(err) {
        console.log("Invalid token");
        return res.send({'error':'user error'});
      }
      if(isvalid) {
        console.log(isvalid);
        return res.send({'result':'user valid'});
      }
    });
   //console.log("res: " + res);
  }

return this;

}

module.exports = new verifyController();
