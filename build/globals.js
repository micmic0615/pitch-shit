module.exports = function(){
	let return_global = {};
	return_global.appRequire = name => require(`${__dirname}/app/${name}`);
	return_global.rootRequire = name => require(`${__dirname}/${name}`);

	return_global._ = require("./app/scripts/lodashExtended")();		
	return_global.logToFile = function(text, name="debug") {
		const fs = require('fs');
		const util = require('util');

		let directory = __dirname + "/debug/"
		
		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory)
		}

		const log_file = fs.createWriteStream(directory+name+".log", {flags : "w"});
		const log_stdout = process.stdout;

		log_file.write(util.format(text) + '\n');
		log_stdout.write(util.format(text) + '\n');
	};

	return return_global
};