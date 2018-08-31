(function(){'use strict';
	const mongoose = require('mongoose');
	const schema = mongoose.Schema;

	const SessionSchema = new schema({
		user_id: { 
			type: String,
		},
	});

	let Sessions = mongoose.model('Sessions', SessionSchema);

	module.exports = Sessions;
}())