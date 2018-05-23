/***************************
 * Committee Plug-in			*
 * Created by Insist       *
 * Idea/Made for Desokoro	*
 ***************************/

"use strict";

const FS = require("../lib/fs.js");

let proposals = FS("config/proposals.json").readIfExistsSync();

if (proposals !== "") {
	proposals = JSON.parse(proposals);
} else {
	proposals = {};
}

function writeProposals() {
	FS("config/proposals.json").writeUpdate(() => (
		JSON.stringify(proposals)
	));
	let data = "{\n";
	for (let u in proposals) {
		data += '\t"' + u + '": ' + JSON.stringify(proposals[u]) + ",\n";
	}
	data = data.substr(0, data.length - 2);
	data += "\n}";
	FS("config/proposals.json").writeUpdate(() => (
		data
	));
}

function isCouncilMember(user) {
	if (!user) return;
	if (typeof user === "object") user = user.userid;
	let council = Db.councilmember.get(toId(user));
	if (council === 1) return true; // Denies them as Council Member if they are suspended
	return false;
}
WL.isCouncilMember = isCouncilMember;

let committee = {
	// The name of the committee
	name: "TsuMeta",
	// The owner(s) who can manage anything
	owners: ["desokoro"],
	// VIPs of the committee who can manage anything unless suspended
	vips: ["xcmr"],
	// Forums link for the committee
	forums: "http://tsunamips.weebly.com/tsumeta.html",
	// Room of the Committee
	room: "tsumetacommittee",
};

function alertCouncilMembers(message) {
	let members = Db.councilmember.keys();
	for (let member of members) {
		if (!Users(member) || !Users(member).connected) continue;
		Users(member).send(`|pm|~${committee.name} Council|~|/raw ${message}`);
	}
}

exports.commands = {
	tsumetausers: "committee",
	tsumetacouncil: "committee",
	tsumeta: "committee",
	council: "committee",
	committee: {
		invite: "give",
		add: "give",
		give: function (target, room, user) {
			if (committee.vips.includes(user.userid) && !Db.councilmember.has(user.userid)) return this.errorReply(`Sorry, you have been suspended from the ${committee.name} Council.`);
			if (!committee.owners.includes(user.userid) && !committee.vips.includes(user.userid)) return this.errorReply(`You must be a Committee Owner or VIP to add users to ${committee.name}.`);
			if (!target) return this.parse("/committeehelp");
			let councilMember = toId(target);
			if (councilMember.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (isCouncilMember(councilMember)) return this.errorReply(`${councilMember} is already in the ${committee.name} Council.`);
			Db.councilmember.set(councilMember, 1);
			this.sendReply(`|html|${WL.nameColor(councilMember, true)} has been successfully been added into the ${committee.name} Council.`);
			if (Users(councilMember)) Users(councilMember).popup(`|html|You have been added into the ${committee.name} Council by ${WL.nameColor(user.name, true)}.`);
		},

		kick: "take",
		remove: "take",
		delete: "take",
		take: function (target, room, user) {
			if (committee.vips.includes(user.userid) && !Db.councilmember.has(user.userid)) return this.errorReply(`Sorry, you have been suspended from the ${committee.name} Council.`);
			if (!committee.owners.includes(user.userid) && !committee.vips.includes(user.userid)) return this.errorReply(`You must be a Committee Owner or VIP to remove users from the ${committee.name} Council.`);
			if (!target) return this.parse(`/committeehelp`);
			let councilMember = toId(target);
			if (councilMember.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (!isCouncilMember(councilMember)) return this.errorReply(`${councilMember} isn't a ${committee.name} Council member.`);
			Db.councilmember.remove(councilMember);
			this.sendReply(`|html|${WL.nameColor(councilMember, true)} has been removed from the ${committee.name} Council.`);
			if (Users(councilMember)) Users(councilMember).popup(`|html|You have been removed from the ${committee.name} Council by ${WL.nameColor(user.name, true)}.`);
		},

		users: "list",
		list: function (target, room, user) {
			if (!Db.councilmember.keys().length) return this.errorReply(`There seems to be no users in the ${committee.name} Council.`);
			let display = [];
			Db.councilmember.keys().forEach(councilMember => {
				display.push(WL.nameColor(councilMember, (Users(councilMember) && Users(councilMember).connected)));
			});
			this.popupReply(`|html|<strong><u><font size="3"><center>${committee.name} Council Members:</center></font></u></strong>${Chat.toListString(display)}`);
		},

		meeting: "message",
		alert: "message",
		pm: "message",
		message: function (target, room, user) {
			if (!committee.owners.includes(user.userid)) return this.errorReply(`This command is reserved for the ${committee.name} Council Owners.`);
			if (!target) return this.parse("/committeehelp");
			alertCouncilMembers(target);
		},

		requestchanges: "propose",
		propose: function (target, room, user) {
			if (!isCouncilMember(user.userid)) return this.errorReply(`You are not in the ${committee.name} Council, or have been suspended.`);
			if (!this.canTalk()) return false;
			let [idea, ...changes] = target.split(",").map(p => { return p.trim(); });
			if (proposals[toId(idea)]) return this.errorReply(`There is already a suggestion titled "${idea}".`);
			if (!changes) return this.parse("/committeehelp");
			if (changes.length > 500) return this.errorReply("Please keep your changes to a maximum of 500 characters.");
			if (Rooms(committee.room)) Rooms(committee.room).add(`|c|~${committee.name} Council|${user.name} has suggested: "${changes.join(", ")}" for "${idea}". Please leave your feedback on these changes.`).update();
			proposals[toId(idea)] = {
				idea: idea,
				id: toId(idea),
				creator: user.userid,
				desc: changes.join(", "),
			};
			writeProposals();
			this.sendReply(`You have successfully suggested for ${idea} to get the following changes: ${changes.join(", ")}.`);
		},

		modify: "editproposal",
		edit: "editproposal",
		modifyproposal: "editproposal",
		editproposal: function (target, room, user) {
			if (!isCouncilMember(user.userid)) return this.errorReply(`You are not in the ${committee.name} Council, or have been suspended.`);
			if (!this.canTalk()) return false;
			let [proposal, ...newDesc] = target.split(",").map(p => p.trim());
			if (!newDesc) return this.parse("/committeehelp");
			let proposalid = toId(proposal);
			if (!proposals[proposalid]) return this.errorReply(`This proposal doesn't exist!`);
			if (proposal.length > 500) return this.errorReply("Please keep your changes to a maximum of 500 characters.");
			if (committee.vips.includes(user.userid) && !Db.councilmember.has(user.userid)) return this.errorReply(`Sorry, you have been suspended and cannot edit proposals.`);
			if (user.userid !== proposals[proposalid].creator && !committee.owners.includes(user.userid) && !committee.vips.includes(user.userid)) return this.errorReply(`Only the creator of this proposal (${proposals[proposalid].creator}) can edit this proposal.`);
			proposals[proposalid].desc = newDesc.join(", ");
			writeProposals();
			this.sendReplyBox(`You have successfully modified the proposal <strong>${proposals[proposalid].idea}'${proposals[proposalid].idea.endsWith(`s`) ? `` : `s`}</strong> description to:<br />${proposals[proposalid].desc}`);
			if (Rooms(committee.room)) Rooms(committee.room).add(`|c|~${committee.name} Council|${user.name} has edited ${proposals[proposalid].idea}'${proposals[proposalid].idea.endsWith(`s`) ? `` : `s`} description.`).update();
		},

		show: "proposals",
		display: "proposals",
		ideas: "proposals",
		view: "proposals",
		proposed: "proposals",
		showproposals: "proposals",
		proposals: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (Object.keys(proposals).length < 1) return this.errorReply(`There are no ${committee.name} Council proposals on the server so far.`);
			if (!target) {
				let randproposal = Object.keys(proposals)[Math.floor(Math.random() * Object.keys(proposals).length)];
				let title = proposals[randproposal].idea;
				let proposedBy = proposals[randproposal].creator;
				let randomproposal = proposals[randproposal].desc;
				this.sendReply(`Since you did not specify a specific change, here is a random proposed idea.`);
				this.sendReply(`${title} by ${proposedBy}: "${randomproposal}"`);
			} else {
				let proposalid = toId(target);
				if (!proposals[proposalid]) return this.errorReply("That proposal does not exist.");
				this.sendReply(`${proposals[proposalid].idea} by ${proposals[proposalid].creator}: "${proposals[proposalid].desc}"`);
			}
		},

		removeproposal: "deleteproposal",
		removeproposals: "deleteproposal",
		deleteproposals: "deleteproposal",
		deleteproposal: function (target, room, user) {
			if (!target) return this.parse(`/committeehelp`);
			let proposalid = toId(target);
			if (!proposals[proposalid]) return this.errorReply(`This proposal doesn't exist!`);
			if (committee.vips.includes(user.userid) && !Db.councilmember.has(user.userid)) return this.errorReply(`Sorry, you have been suspended and cannot delete proposals.`);
			if (user.userid !== proposals[proposalid].creator && !committee.owners.includes(user.userid) && !committee.vips.includes(user.userid)) return this.errorReply(`This command is reserved for ${committee.name} Council Owners.`);
			delete proposals[proposalid];
			writeProposals();
			this.sendReply(`Proposal "${target}" has been deleted.`);
		},

		listproposals: "viewproposals",
		viewproposals: function () {
			if (!this.runBroadcast()) return;
			if (Object.keys(proposals).length < 1) return this.errorReply(`There are currently no ${committee.name} Council proposals.`);
			let reply = `<strong><u>Proposals (${Object.keys(proposals).length})</u></strong><br />`;
			for (let proposal in proposals) reply += `<strong>${proposal}</strong> <button class="button" name="send" value="/committee view ${proposal}">View ${proposal}</button><br />`;
			this.sendReplyBox(`<div class="infobox infobox-limited">${reply}</div>`);
		},

		suspend: function (target, room, user) {
			if (!this.canTalk()) return false;
			if (!target || target.length > 18) return this.errorReply(`You must specify a target, with a maximum of 18 characters.`);
			let targetUser = toId(target);
			if (!isCouncilMember(targetUser)) return this.errorReply(`"${target}"" is either not in the ${committee.name} Council, or they have already been suspended.`);
			if (committee.owners.includes(targetUser)) return this.errorReply(`You cannot suspend a ${committee.name} Council Owner.`);
			// Only allow VIPs to suspend users if they are currently in the council
			if (committee.vips.includes(user.userid) && !Db.councilmember.has(user.userid)) return this.errorReply(`Sorry, you have been suspended and cannot edit suspend anyone.`);
			if (committee.vips.includes(user.userid) && committee.vips.includes(targetUser)) return this.errorReply(`You cannot suspend fellow VIPs.`);
			if (!committee.owners.includes(user.userid) && !committee.vips.includes(user.userid)) return this.errorReply(`This command is reserved for the ${committee.name} Council Owners.`);
			this.sendReply(`You have successfully suspended "${target}" from participating in ${committee.name} Committee proposals.`);
			Db.councilmember.set(targetUser, 2);
		},

		unsuspend: function (target, room, user) {
			if (!this.canTalk()) return false;
			if (!target || target.length > 18) return this.errorReply(`You must specify a target, with a maximum of 18 characters.`);
			let targetUser = toId(target);
			if (isCouncilMember(targetUser)) return this.errorReply(`"${target}" is either not in the ${committee.name} Council, or they have already been unsuspended.`);
			// Only allow VIPs to unsuspend users if they are currently in the council
			if (committee.vips.includes(user.userid) && !Db.councilmember.has(user.userid)) return this.errorReply(`Sorry, you have been suspended and cannot unsuspend users.`);
			if (committee.vips.includes(user.userid) && committee.vips.includes(targetUser)) return this.errorReply(`You cannot suspend fellow VIPs.`);
			if (!committee.owners.includes(user.userid) && !committee.vips.includes(user.userid)) return this.errorReply(`This command is reserved for the ${committee.name} Council Owners.`);
			this.sendReply(`You have successfully unsuspended "${target}"" from participating in ${committee.name} Committee proposals.`);
			Db.councilmember.set(targetUser, 1);
		},

		"!forums": true,
		info: "forums",
		website: "forums",
		forum: "forums",
		forums: function () {
			if (!committee.forums) return this.errorReply(`The Official ${committee.name} Forums have not been set yet.`);
			if (!this.runBroadcast()) return;
			this.sendReplyBox(`<a href="${committee.forums}">The Official ${committee.name} Forums!</a>`);
		},

		"": "help",
		help: function () {
			this.parse("/committeehelp");
		},
	},

	committeehelp: [
		`/committee give [user] - Gives a user the ${committee.name} Council Member status.
		/committee take [user] - Removes a user's ${committee.name} Council Member status.
		/committee list - Shows the list of ${committee.name} Council Members.
		/committee alert [message] - Sends a message to all online users from the ${committee.name} Council. Must be an Owner.
		/committee propose [what you modified], [change requested] - Proposes a change for the ${committee.name} metagame. Must be in the ${committee.name} Council to use this command.
		/committee edit [proposal], [description update] - Edits a proposal. Must be the submitter of the proposal, or Owner/VIP.
		/committee proposals [optional proposal ID] - Checks the specified proposal ID, if not specified generates a random one from the proposals index.
		/committee deleteproposal [proposal] - Deletes the specified proposal. Must be Owner or VIP.
		/committee viewproposals - Shows the list of proposals.
		/committee suspend [target] - Suspends a user from proposing/participating in the ${committee.name} Council. Must be Owner or VIP.
		/committee unsuspend [target] - Unsuspends a user from proposing/participating in the ${committee.name} Council. Must be Owner or VIP.
		/committee forums - Displays the official ${committee.name} Forums, if they have one set.
		/committee help - Displays this help command.`,
	],
};
