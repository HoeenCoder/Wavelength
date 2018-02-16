/**************************
 * Quotes Plug-in for PS! *
 * Created by Insist      *
 **************************/

"use strict";

const FS = require("../lib/fs.js");

let quotes = FS("config/quotes.json").readIfExistsSync();

if (quotes !== "") {
	quotes = JSON.parse(quotes);
} else {
	quotes = {};
}

function write() {
	FS("config/quotes.json").writeUpdate(() => (
		JSON.stringify(quotes)
	));
	let data = "{\n";
	for (let u in quotes) {
		data += '\t"' + u + '": ' + JSON.stringify(quotes[u]) + ",\n";
	}
	data = data.substr(0, data.length - 2);
	data += "\n}";
	FS("config/quotes.json").writeUpdate(() => (
		data
	));
}

exports.commands = {
	quotes: "quote",
	quote: {
		add: function (target, room, user) {
			if (!this.can("lock")) return false;
			let targets = target.split(',');
			let [name, quote] = target.split(",").map(p => p.trim());
			if (!name || !quote) return this.errorReply("/quote add (name), (quote). Requires lock permissions.");
			if (name.length > 18) return this.errorReply("Quote names must be 18 characters or less!");
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
			let quoteid = toId(target);
			if (!quotes[quoteid]) return this.errorReply(`${target} is not currently registered as a quote.`);
			delete quotes[quoteid];
			write();
			this.sendReply(`Quote ${target} has been deleted.`);
		},

		view: "show",
		display: "show",
		search: "show",
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

		listquotes: "viewquotes",
		list: "viewquotes",
		viewquotes: function (target, room, user) {
			if (!this.runBroadcast()) return;
			let reply = `<b><u>Quotes (${Object.keys(quotes).length})</u></b><br />`;
			for (let quote in quotes) reply += `<strong>${quote}</strong><br />`;
			this.sendReplyBox(`<div class="infobox infobox-limited">${reply}</div>`);
		},

		"": "help",
		help: function () {
			this.parse("/help quote");
		},
	},

	quotehelp: [
		`/quote add [name], [quote] - Adds a quote into the server database. Requires % and up.
		/quote delete [name] - Deletes a quote from the server database.  Requires % and up.
		/quote show - Randomly generates a quote from the database.
		/quote show [name] - Displays a specific quote from the database.
		/quote list - Shows all the existing quote names.
		/quote help - Shows this command.`,
	],
};
