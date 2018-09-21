(function(){'use strict';
	const mongoose = require('mongoose');
	const schema = mongoose.Schema;

	const LogSchema = new schema({
		message:  {
			type: Object
		}
	});

	let Logs = mongoose.model('Logs', LogSchema);

	module.exports = Logs;
}())