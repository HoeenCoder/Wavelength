/********************************
 * Pokemon Gen Requests for PS! *
 * Created by Insist			*
 ********************************/

"use strict";

function alertGenners(message) {
	let genners = Db.genners.keys();
	for (let u in genners) {
		if (!Users(genners[u]) || !Users(genners[u]).connected) continue;
		Users(genners[u]).send(`|pm|~Genner Alert|~|/raw ${message}`);
	}
	if (Rooms(`genrequests`)) {
		Rooms(`genrequests`).add(`|c|~Genner Alert|/raw ${message}`).update();
	}
}

exports.commands = {
	genner: "genreq",
	genners: "genreq",
	genreqs: "genreq",
	requestgen: "genreq",
	genrequest: "genreq",
	genreq: {
		addgenner: "add",
		addgen: "add",
		approve: "add",
		give: "add",
		add: function (target, room, user) {
			if (!this.can("lock")) return false;
			if (!target || target.length > 18) return this.errorReply(`This command requires a target with a maximum of 18 characters.`);
			let approvedGenner = toId(target);
			Db.genners.set(approvedGenner, 1);
			this.sendReply(`|html|${WL.nameColor(approvedGenner, true)} has been successfully been approved as a genner.`);
			if (Users.get(approvedGenner)) Users(approvedGenner).popup(`|html|You have been approved as a genner by ${WL.nameColor(user.name, true)}.`);
		},

		req: "request",
		request: function (target, room, user) {
			target = target.split(", ");
			if (!user.autoconfirmed) return this.errorReply(`Only autoconfirmed users may use this command to prevent spam.`);
			if (isNaN(target[0])) return this.errorReply(`The reward must be an integer.`);
			if (!target[1] || target[1].length > 500) return this.errorReply(`This command requires a target with at a maximum of 500 characters. Feel free to send a Pastebin.`);
			Economy.readMoney(user.userid, currency => {
				if (currency < target[0]) return this.errorReply(`Sorry, you do not have enough ${currencyPlural} to give the genner ${target[0]} as a reward.`);
				alertGenners(`${WL.nameColor(user.name, true)} has requested the following: "${target[1]}", and has offered ${target[0]} ${currencyPlural} for your services.`);
				this.sendReply(`Your request has been sent, check /genreq list to contact genners and to verify if they are approved.`);
			});
		},

		removegenner: "ban",
		bangenner: "ban",
		remove: "ban",
		unconfirm: "ban",
		kick: "ban",
		take: "ban",
		ban: function (target, room, user) {
			if (!this.can("lock")) return false;
			if (!target || target.length > 18) return this.errorReply("You must specify a username, with at a maximum of 18 characters.");
			if (!Db.genners.has(toId(target))) return this.errorReply(`${target} is not currently an approved genner.`);
			Db.genners.remove(toId(target));
			this.sendReply(`${target} has been officially removed from being a genner.`);
			if (Users.get(toId(target))) Users(toId(target)).popup(`|html|You have been approved as a genner by ${WL.nameColor(user.name, true)}.`);
		},

		users: 'list',
		list: function (target, room, user) {
			if (!Db.genners.keys().length) return this.errorReply('There are currently zero approved genners.');
			let display = [];
			Db.genners.keys().forEach(approvedGenners => {
				display.push(WL.nameColor(approvedGenners, (Users(approvedGenners) && Users(approvedGenners).connected)));
			});
			this.popupReply(`|html|<strong><u><font size="3"><center>Approved Genners:</center></font></u></strong>${display.join(',')}`);
		},

		"": "help",
		help: function () {
			this.parse("/genrequesthelp");
		},
	},

	genrequesthelp: [
		`Gen Req Commands: [Made by Insist]
		/genreq request [reward], [request] - Requests [request] to be genned and alerts all active approved genners, and offers [reward] ${currencyPlural} for the reward.
		/genreq approve [user] - Approves a user as a genner. Requires Lock Access.
		/genreq ban [user] - Bans the user from being a genner. Requires Lock Access.
		/genreq list - Displays all of the server's approved genners.
		/genrequest help - Displays this command.`,
	],
};
