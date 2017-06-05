module.exports = (function usersSchema () {

	var mongoose = require('../db').mongoose;

	var usersschema = {
		username: {type: String, required: true, unique: true},
		password: {type: String, required: true},
		admin: {type: Boolean},
		dobmonth: {type: String, required: true},
		dobday: {type: Number, required: true},
		dobyear: {type: Number, required: true},
		gender: {type: String, required: true},
		allowmarketing: {type: Boolean, required: true},
		created: {type: Date, required: true},
		activationkey: {type: String, required: true},
		verified: {type: Boolean, required: true},
    hostingdevice: {type: String, required: true},
		hostingsocket: {type: String, required: true},
		joinpassword: {type: String, required: true},
    joineddevice: {type: String, required: true},
    numberjoined: {type: Number, required: true},
    prouser: {type: Boolean, required: true}
	};
	var collectionName = 'users';
	var usersSchema = mongoose.Schema(usersschema, { versionKey: false });
	var Users = mongoose.model(collectionName, usersSchema);

	return Users;
})();
