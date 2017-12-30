/**************************
 * Quotes Plug-in for PS! *
 * Created by Insist      *
 **************************/

"use strict";

let quotes = {};

const fs = require("fs");

try {
	quotes = JSON.parse(fs.readFileSync("config/quotes.json", "utf8"));
} catch (e) {
	if (e.code !== "ENOENT") throw e;
}

function write() {
	if (Object.keys(quotes).length < 1) return fs.writeFileSync('config/quotes.json', JSON.stringify(quotes));
	let data = "{\n";
	for (let u in quotes) {
		data += '\t"' + u + '": ' + JSON.stringify(quotes[u]) + ",\n";
	}
	data = data.substr(0, data.length - 2);
	data += "\n}";
	fs.writeFileSync('config/quotes.json', data);
}

exports.commands = {
	quotes: "quote",
	quote: {
		add: function (target, room, user) {
			if (!this.can("lock")) return false;
			let targets = target.split(',');
			for (let u = 0; u < targets.length; u++) targets[u] = targets[u].trim();
			if (!targets[1]) return this.errorReply("/quote add (name), (quote). Requires lock permissions.");
			let name = targets[0];
			if (name.length > 18) return this.errorReply("Quote names must be 18 characters or less!");
			let quote = targets[1];
			if (quote.length > 300) return this.errorReply("Quotes should remain 300 characters long or less.");
			quotes[toId(name)] = {
				name: name,
				id: toId(name),
				quote: quote,
			};
			write();
			return this.sendReply(`Quote ${name} created! ${name}: ${quote}.`);
		},

		delete: function (target, room, user) {
			if (!this.can("lock")) return false;
			if (!target) return this.errorReply("This command requires a target.");
			if (!quotes[toId(target)].id) return this.errorReply(`This quote doesn't exist!`);
			delete quotes[toId(target)];
			write();
			this.sendReply(`Quote ${target} has been deleted.`);
		},

		show: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (Object.keys(quotes).length < 1) return this.sendReply("There are no quotes on this server.");
			if (!target) {
				let randQuote = Object.keys(quotes)[Math.floor(Math.random() * Object.keys(quotes).length)];
				let title = quotes[randQuote].name;
				let randomQuote = quotes[randQuote].quote;
				this.sendReply(`${title}: "${randomQuote}"`);
			} else {
				let quoteid = toId(target);
				if (!quotes[quoteid]) return this.errorReply('That quote does not exist.');
				this.sendReply(`${quotes[quoteid].name}: "${quotes[quoteid].quote}"`);
			}
		},

		"": "help",
		help: function () {
			this.parse("/help quote");
		},
	},

	quotehelp: [
		"/quote add [name], [quote] - Adds a quote into the server database. Requires % and up.",
		"/quote delete [name] - Deletes a quote from the server database.  Requires % and up.",
		"/quote show - Randomly generates a quote from the database.",
		"/quote show [name] - Displays a specific quote from the database.",
		"/quote help - Shows this command.",
	],
};
