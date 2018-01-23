/*****************************
 * TsuMeta Committee Plug-in *
 * Created by Insist         *
 * Idea/Made for Desokoro    *
 *****************************/

"use strict";

const FS = require('../lib/fs.js');

let proposals = FS('config/proposals.json').readTextIfExistsSync();

if (proposals !== '') {
	proposals = JSON.parse(proposals);
} else {
	proposals = {};
}

function write() {
	FS('config/proposals.json').writeUpdate(() => (
		JSON.stringify(proposals)
	));
	let data = "{\n";
	for (let u in proposals) {
		data += '\t"' + u + '": ' + JSON.stringify(proposals[u]) + ",\n";
	}
	data = data.substr(0, data.length - 2);
	data += "\n}";
	FS('config/proposals.json').writeUpdate(() => (
		data
	));
}

function isTsuMetaCouncil(user) {
	if (!user) return;
	if (typeof user === 'object') user = user.userid;
	let council = Db.councilmember.get(toId(user));
	if (council === 1) return true;
	//Denies being "a TsuMeta Council Member" in proposals and such when suspended
	return false;
}

exports.commands = {
	tsucouncil: "tsumeta",
	tsumembers: "tsumeta",
	tsumetacouncil: "tsumeta",
	tsumeta: {
		give: function (target, room, user) {
			if (user.userid !== "desokoro") return this.errorReply("You must be Desokoro to add users into the council.");
			if (!target) return this.parse("/tsumetahelp");
			let tsuMetaMember = toId(target);
			if (tsuMetaMember.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (isTsuMetaCouncil(tsuMetaMember)) return this.errorReply(`${tsuMetaMember} is already in the TsuMeta Council.`);
			Db.councilmember.set(tsuMetaMember, 1);
			this.sendReply(`|html|${WL.nameColor(tsuMetaMember, true)} has been successfully been added into the TsuMeta Council.`);
			if (Users.get(tsuMetaMember)) Users(tsuMetaMember).popup(`|html|You have been added into the TsuMeta Council by ${WL.nameColor(user.name, true)}.`);
		},

		kick: "take",
		remove: "take",
		delete: "take",
		take: function (target, room, user) {
			if (user.userid !== "desokoro") return this.errorReply("You must be Desokoro to remove users into the council.");
			if (!target) return this.parse(`/tsumetahelp`);
			let tsuMetaMember = toId(target);
			if (tsuMetaMember.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (!isTsuMetaCouncil(tsuMetaMember)) return this.errorReply(`${tsuMetaMember} isn't a TsuMeta council member.`);
			Db.councilmember.remove(tsuMetaMember);
			this.sendReply(`|html|${WL.nameColor(tsuMetaMember, true)} has been removed from the TsuMeta council.`);
			if (Users.get(tsuMetaMember)) Users(tsuMetaMember).popup(`|html|You have been removed from the TsuMeta Council by ${WL.nameColor(user.name, true)}.`);
		},

		users: 'list',
		list: function (target, room, user) {
			if (!Db.councilmember.keys().length) return this.errorReply('There seems to be no users in the TsuMeta Council.');
			let display = [];
			Db.councilmember.keys().forEach(councilMember => {
				display.push(WL.nameColor(councilMember, (Users(councilMember) && Users(councilMember).connected)));
			});
			this.popupReply(`|html|<strong><u><font size="3"><center>TsuMeta Council Members:</center></font></u></strong>${display.join(',')}`);
		},

		meeting: "message",
		alert: "message",
		pm: "message",
		message: function (target, room, user) {
			if (user.userid !== "desokoro" && !this.can("bypassall")) return this.errorReply(`This command is reserved for Desokoro only.`);
			if (!target) return this.parse("/tsumetahelp");
			let councilMembers = Db.councilmember.keys();
			for (let u in councilMembers) {
				if (!Users(councilMembers[u]).connected) continue;
				Users(councilMembers[u]).send(`|pm|~TsuMeta Council|~|/raw ${target}`);
			}
		},

		requestchanges: "propose",
		propose: function (target, room, user) {
			if (!isTsuMetaCouncil(user.userid)) return this.errorReply('You are not in the TsuMeta council, or have been suspended.');
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			let parts = target.split(',');
			for (let u in parts) parts[u] = parts[u].trim();
			if (!parts[0] || !parts[1]) return this.parse('/tsumetahelp');
			let idea = parts[0];
			let changes = parts[1];
			if (parts[1].length > 500) return this.errorReply('Please keep your changes to a maximum of 500 characters.');
			if (Rooms('tsumetacommittee')) {
				Rooms('tsumetacommittee').add(`|c|~TsuMeta Council|${user.name} has suggested: "${changes}" for "${idea}". Please leave your feedback on these changes.`).update();
			}
			proposals[toId(idea)] = {
				idea: idea,
				id: toId(idea),
				creator: user.name,
				desc: changes,
			};
			write();
		},

		ideas: "proposals",
		proposed: "proposals",
		showproposals: "proposals",
		proposals: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (Object.keys(proposals).length < 1) return this.sendReply("There are no TsuMeta proposals on this server so far.");
			if (!target) {
				let randproposal = Object.keys(proposals)[Math.floor(Math.random() * Object.keys(proposals).length)];
				let title = proposals[randproposal].idea;
				let proposedBy = proposals[randproposal].creator;
				let randomproposal = proposals[randproposal].desc;
				this.sendReply(`Since you did not specify a specific change, here is a random proposed idea.`);
				this.sendReply(`${title} by ${proposedBy}: "${randomproposal}"`);
			} else {
				let proposalid = toId(target);
				if (!proposals[proposalid]) return this.errorReply('That proposal does not exist.');
				this.sendReply(`${proposals[proposalid].idea} by ${proposals[proposalid].creator}: "${proposals[proposalid].desc}"`);
			}
		},

		listproposals: "viewproposals",
		viewproposals: function (target, room, user) {
			if (!this.runBroadcast()) return;
			let reply = `<b><u>Proposals (${Object.keys(proposals).length})</u></b><br />`;
			for (let proposal in proposals) reply += `(<strong>${proposal}</strong>)<br />`;
			this.sendReply(`|raw|<div class="infobox infobox-limited">${reply}</div>`);
		},

		suspend: function (target, room, user) {
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			if (!target || target.length > 18) return this.errorReply(`You must specify a target, with a maximum of 18 characters.`);
			let targetUser = toId(target);
			if (!isTsuMetaCouncil(targetUser) || targetUser === "desokoro") return this.errorReply(`${target} is either not in TsuMeta, or they have already suspended.`);
			// Only allow xcmr to suspend users if he is currently in the council
			if (user.userid === "xcmr" && Db.councilmember.has("xcmr", 1)) {
				Db.councilmember.set(targetUser, 2);
				this.sendReply(`You have successfully suspended ${target} from participating in TsuMeta Committee proposals.`);
				return true;
			}
			if (user.userid !== "desokoro") return this.errorReply(`This command is reserved for Desokoro.`);
			this.sendReply(`You have successfully suspended ${target} from participating in TsuMeta Committee proposals.`);
			Db.councilmember.set(targetUser, 2);
		},

		unsuspend: function (target, room, user) {
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			if (!target || target.length > 18) return this.errorReply(`You must specify a target, with a maximum of 18 characters.`);
			let targetUser = toId(target);
			if (!isTsuMetaCouncil(targetUser) || targetUser === "desokoro") return this.errorReply(`${target} is either not in TsuMeta, or they have already suspended.`);
			// Only allow xcmr to unsuspend users if he is currently in the council
			if (user.userid === "xcmr" && Db.councilmember.has("xcmr", 1)) {
				Db.councilmember.set(targetUser, 1);
				this.sendReply(`You have successfully suspended ${target} from participating in TsuMeta Committee proposals.`);
				return true;
			}
			if (user.userid !== "desokoro") return this.errorReply(`This command is reserved for Desokoro.`);
			this.sendReply(`You have successfully unsuspended ${target} from participating in TsuMeta Committee proposals.`);
			Db.councilmember.set(targetUser, 1);
		},

		info: "forums",
		website: "forums",
		forum: "forums",
		forums: function (target, room, user) {
			if (!this.runBroadcast()) return;
			this.sendReplyBox(`<a href="http://tsunamips.weebly.com/tsumeta.html">The Official TsuMeta Website</a>`);
		},

		"": "help",
		help: function (target, room, user) {
			this.parse("/tsumetahelp");
		},
	},

	tsumetahelp: [
		`/tsumeta give [user] - Gives a user the TsuMeta Council Member status.`,
		`/tsumeta take [user] - Removes a user's TsuMeta Council Member status.`,
		`/tsumeta list - Shows the list of TsuMeta Council Members.`,
		`/tsumeta alert [message] - Sends a message to all online users from the TsuMeta Council. Only for Desokoro.`,
		`/tsumeta propose [what you modified], [change requested] - Proposes a change for the TsuMeta metagame. Must be in the TsuMeta Council to use.`,
		`/tsumeta proposals [optional proposal ID] - Checks the specified proposal ID, if not specified generates a random one from the proposals index.`,
		`/tsumeta viewproposals - Shows the list of proposals.`,
		`/tsumeta suspend [target] - Suspends a user from proposing/participating in the TsuMeta council. Only for Desokoro and xcmr.`,
		`/tsumeta unsuspend [target] - Unsuspends a user from proposing/participating in the TsuMeta council. Only for Desokoro and xcmr.`,
		`/tsumeta forums - Displays the official TsuMeta Website.`,
		`/tsumeta help - Displays this help command.`,
	],
};
