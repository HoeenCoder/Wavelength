/*********************************
 * Draft Management by Execute.	*
 * Rewrote by Insist					*
 ********************************/
"use strict";

let FS = require("../lib/fs");
let path = require("path");
let greencss = "background: #ccffcc; padding: 10px; color: #006600; border: 1px solid #006600; border-radius: 6px; text-align: center;";
let redcss = "background: ##ffb3b3; padding: 10px; color: #ff3333; border: 1px solid #ff3333; border-radius: 6px; text-align: center;";
let drafts = {};

class Draft {
	constructor(room) {
		this.room = room;
		this.teams = {};
		this.turn = null;
		this.state = null;
		this.order = [];
		this.originalOrder = [];
		this.draftedMons = [];
		this.maxMons = 12;
		this.random = true;
		this.snake = true;
	}

	addTeam(teamname, manager, self) {
		if (this.teams[teamname]) return self.errorReply("There is already a team with this Team Name.");
		this.teams[teamname] = {
			"manager": toId(manager),
			"draftpicks": [],
		};
		this.originalOrder.push(teamname);
		let fileName = `${this.room}draft`;
		Db[fileName].set("teams", this.teams);
		this.room.add(`|html|<div style="${greencss}">The <strong>${teamname}</strong> are now apart of the draft and is managed by ${WL.nameColor(manager, true)}</div>`);
		this.log(`${teamname} is now apart of the draft and is managed by ${manager}.`);
	}

	removeTeam(teamname, self) {
		if (!this.teams[teamname]) return self.errorReply("There is not a team with this Team Name, thus there is no way to remove them from this draft.");
		delete this.teams[teamname];
		this.room.add(`|html|<div style="${redcss}">The team <strong>${teamname}</strong> has been removed from this draft league.`);
		for (let i = 0; i < this.originalOrder.length; i++) {
			if (this.originalOrder[i] === teamname) this.originalOrder.splice(i, 1);
			if (this.order[i] === teamname) this.order.splice(i, 1);
			continue;
		}
		let fileName = `${this.room}draft`;
		Db[fileName].set("teams", this.teams);
		this.log(`${teamname} has been removed from this league.`);
	}

	start(self) {
		if (this.originalOrder.length < 2) return self.errorReply("There is no point of having a draft league if there is only 1 team!");
		this.order = this.originalOrder;
		if (this.random === true) Dex.shuffle(this.order);
		this.state = "drafting";
		this.turn = this.order[0];
		this.room.add(`|html|<div style="${greencss}">The Draft has started!<br />The order of this draft is: <strong>${Chat.toListString(this.order)}.</strong></div>`);
		this.room.add(`|html|<div style="${greencss}">It is now <strong>${this.turn}'s</strong> turn.</div>`);
		this.log("The draft has started.");
	}

	Nom(pk, user, self) {
		if (this.state !== "drafting") return self.errorReply("There is no draft at the moment.");
		if (this.teams[this.turn].manager !== user) return self.errorReply("It is not your turn to draft.");
		if (this.draftedMons.includes(pk)) return self.errorReply("This mon has already been drafted by someone else.");
		this.teams[this.turn].draftpicks.push(pk);
		let fileName = `${this.room}draft`;
		Db[fileName].set("teams", this.teams);
		this.draftedMons.push(pk);
		if (this.order.length === this.order.indexOf(this.turn) + 1) {
			if (this.teams[this.turn].draftpicks.length === this.maxMons) {
				this.room.add(`|html|<div style="${greencss}">${WL.nameColor(user.name, true)} has drafted the Pokemon: <strong>${pk}!</strong></div>`);
				this.room.add(`|html|<div style="${redcss}">Everyone has received ${this.maxMons} Draft Picks.<br /> The Draft is over! We hope you are happy with your draft picks :)`);
				this.room.add(`|html|<div style="${greencss}"><strong>Final Picks:</strong><br />${this.show()}</div>`);
				delete drafts[this.room];
				this.log(`Everyone has received ${this.maxMons} Draft Picks, therefore the draft has ended.`);
			} else if (this.snake === true) {
				let reverseOrder = this.order.reverse();
				this.turn = reverseOrder[0];
				this.room.add(`|html|<div style="${greencss}">${WL.nameColor(user.name, true)} has drafted the Pokemon: <strong>${pk}.</strong><br />It is now <strong>${this.turn}'s</strong> turn.</div>`);
				this.room.add(`|html|<div style="${greencss}"><strong>${this.turn}</strong> currently has: ${this.iconize(this.teams[this.turn].draftpicks)}</div>`);
				this.log(`${user} has drafted ${pk}.`);
			} else {
				this.turn = this.order[0];
				this.room.add(`|html|<div style="${greencss}">${WL.nameColor(user.name, true)} has drafted the Pokemon: <strong>${pk}.</strong><br />It is now <strong>${this.turn}'s turn</strong>.</div>`);
				this.room.add(`|html|<div style="${greencss}"><strong>${this.turn}</strong> currently has: ${this.iconize(this.teams[this.turn].draftpicks)}</div>`);
				this.log(`${user} has drafted ${pk}.`);
			}
		} else {
			this.turn = this.order[this.order.indexOf(this.turn) + 1];
			this.room.add(`|html|<div style="${greencss}">${WL.nameColor(user.name, true)} has drafted the Pokemon: <strong>${pk}!</strong><br />It is now <strong>${this.turn}</strong>'s turn.</div>`);
			this.room.add(`|html|<div style="${greencss}"><strong>${this.turn}</strong> currently has: ${this.iconize(this.teams[this.turn].draftpicks)}</div>`);
			this.log(`${user} has drafted ${pk}.`);
		}
	}

	iconize(team) {
		let display = "";
		for (let i = 0; i < team.length; i++) {
			let dex = "";
			if (Dex.data.Pokedex[team[i]].num < 100) {
				if (Dex.data.Pokedex[team[i]].num < 10) {
					dex = `00${Dex.data.Pokedex[team[i]].num}`;
	                } else {
	                    dex = `0${Dex.data.Pokedex[team[i]].num}`;
				}
			} else {
				dex = Dex.data.Pokedex[team[i]].num;
			}
			let url = `http://www.serebii.net/pokedex-sm/icon/${dex}.png`;
			display += `<img src="${url}" title="${team[i]}">`;
		}
		return display;
	}

	show(self) {
		if (this.state === "prep") return self.errorReply("The draft has not started yet.");
		let display = `<table border="1" cellspacing="0" cellpadding="5" width="100%"><tbody><tr><th>Team</th><th>Manager</th><th>Team</th></tr>`;
		for (let i = 0; i < this.order.length; i++) {
			display += `<tr><td align="center"><strong>${this.order[i]}</strong></td><td align="center"><strong>${this.teams[this.order[i]].manager}</strong></td><td allign="center">${this.iconize(this.teams[this.order[i]].draftpicks)}</td>`;
		}
		display += `</tbody></table>`;
		if (!self) return display;
		self.sendReply(`|html|${display}`);
	}

	log(message) {
		let file = path.join(__dirname, '../logs/' + this.room + 'DraftLogs.txt');
		let text = `[${Date()}] ${message}\n`;
		FS(file).append(text);
	}

	overWrite(self, team, pick, mon) {
		let oldpick = this.teams[team].draftpicks[pick - 1];
		if (!this.teams[team]) return self.errorReply("This team is not apart of the draft.");
		if (!oldpick) return self.errorReply("ERROR: No Pokemon with this pick has been found.");
		if (!Dex.data.Pokedex[mon]) return self.errorReply("This is not a Pokemon.");
		if (this.draftedMons.includes(mon)) return self.errorReply("This Pokemon has already been drafted by someone.");
		let oldpickDraftSpot = this.draftedMons.indexOf(oldpick);
		this.draftedMons[oldpickDraftSpot] = mon;
		this.teams[team].draftpicks[pick - 1] = mon;
		let fileName = `${this.room}draft`;
		Db[fileName].set("teams", this.teams);
		this.room.add(`|html|<div style="${greencss}">Change: <strong>${team}</strong> has changed their pick: <strong>"${oldpick}"</strong> changed to: <strong>"${this.teams[team].draftpicks[pick - 1]}"</strong>.<br /><strong>${team}'s</strong> Line-up now looks like: ${this.iconize(this.teams[team].draftpicks)}</div>`);
		this.log(`${team} has changed their draft pick: from "${oldpick}" to "${mon}".`);
	}
}

exports.commands = {
	draftleague: "draft",
	drafts: "draft",
	draft: {
		new: "create",
		host: "create",
		create: function (target, room, user) {
			if (!this.can("draft", null, room)) return false;
			if (drafts[room]) return this.errorReply("There is already a draft going on in this room.");
			drafts[room] = new Draft(room);
			drafts[room].state = "prep";
			drafts[room].log(`Draft has been created in ${room.title}.`);
			room.add(`|html|<div style="${greencss}">A Draft has been started!</div>`);
		},

		nuke: "reset",
		restart: "reset",
		resetdata: "reset",
		reset: function (target, room, user) {
			if (!this.can("draft", null, room)) return false;
			if (!drafts[room]) return this.errorReply("This room is not taking part in a draft at the moment.");
			delete drafts[room];
			room.add(`|html|<div style="${redcss}">The data for this draft has been reset!</div>`);
		},

		addteam: function (target, room, user) {
			if (!this.can("draft", null, room)) return false;
			let [teamName, ...manager] = target.split(",").map(p => p.trim());
			if (!teamName || !manager) return this.parse("/draft help");
			if (!drafts[room]) return this.errorReply("This room is not drafting at the moment.");
			if (!drafts[room].state === "prep") return this.errorReply("You may not add teams to the draft at this moment.");
			drafts[room].addTeam(teamName, manager, this);
		},

		eliminateteam: "removeteam",
		removeteam: function (target, room, user) {
			if (!this.can("draft", null, room)) return false;
			if (!target) return this.parse("/draft help");
			let teamNamez = target.trim();
			if (!drafts[room]) return this.errorReply("This room is not drafting at the moment.");
			drafts[room].removeTeam(teamNamez, this);
		},

		begin: "start",
		start: function (target, room, user) {
			if (!this.can("draft", null, room)) return false;
			if (!drafts[room]) return this.errorReply("This room is not drafting at the moment.");
			if (drafts[room].state === "drafting") return this.errorReply("The draft has already started.");
			drafts[room].start(this);
		},

		randomizeteams: "random",
		randomize: "random",
		randomteams: "random",
		random: function (target, room, user) {
			if (!this.can("draft", null, room)) return false;
			if (!drafts[room]) return this.errorReply("This room is not drafting at the moment.");
			if (!target) return this.parse("/draft help");
			if (this.meansYes(target)) {
				drafts[room].random = true;
				room.add(`|html|<div style="${greencss}">The order of the draft is now <strong>randomized!</strong></div>`);
				drafts[room].log(`The order of this draft is now randomized.`);
			} else if (this.meansNo(target)) {
				drafts[room].random = false;
				room.add(`|html|<div style="${greencss}">The order of the draft is now <strong>NOT randomized!</strong></div>`);
				drafts[room].log(`The order of this draft is no longer randomized.`);
			} else {
				this.parse(`/draft help`);
			}
		},

		snake: function (target, room, user) {
			if (!this.can("draft", null, room)) return false;
			if (!drafts[room]) return this.errorReply("This room is not drafting at the moment.");
			if (!target) return this.parse("/draft help");
			if (this.meansYes(target)) {
				drafts[room].snake = true;
				room.add(`|html|<div style="${greencss}">The order of the draft is now <strong>snaked!</strong></div>`);
				drafts[room].log(`The order of this draft is now snaked.`);
			} else if (this.meansNo(target)) {
				drafts[room].snake = false;
				room.add(`|html|<div style="${greencss}">The order of the draft is now <strong>NOT snaked!</strong></div>`);
				drafts[room].log(`The order of this draft is no longer snaked.`);
			} else {
				this.parse(`/draft help`);
			}
		},

		canceldraft: "end",
		cancel: "end",
		enddraft: "end",
		end: function (target, room, user) {
			if (!this.can("draft", null, room)) return false;
			if (!drafts[room]) return this.errorReply("This room is not drafting at the moment.");
			drafts[room].log(`The draft has been ended by ${user.name}!`);
			delete drafts[room];
			room.add(`|html|<div style="${redcss}">The draft has ended!<br />We hope you are happy with what you came out with :).</div>`);
		},

		maxpicks: "max",
		limitpicks: "max",
		max: function (target, room, user) {
			if (!this.can("draft", null, room)) return false;
			if (!drafts[room]) return this.errorReply("This room is not drafting at the moment.");
			if (!target) return this.sendReply(`The draft pick limit for this draft is ${drafts[room].maxMons}.`);
			let num = parseFloat(target.trim());
			if (isNaN(num)) return this.errorReply("Must be a number.");
			drafts[room].maxMons = num;
			drafts[room].log(`The draft pick limit has been set to be ${drafts[room].maxMons} by ${user.name}.`);
			room.add(`|html|<div style="${greencss}">The draft limit of this draft has been set to <strong>${drafts[room].maxMons}!</strong></div>`);
		},

		stats: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (!drafts[room]) return this.errorReply("This room is not drafting at the moment.");
			drafts[room].show(this);
		},

		overwrite: "change",
		editpicks: "change",
		edit: "change",
		changepicks: "change",
		change: function (target, room, user) {
			if (!this.can("draft", null, room)) return false;
			let [teamname, draftpick, ...pokemon] = target.split(",").map(p => p.trim());
			if (!drafts[room]) return this.errorReply("This room is not drafting at the moment.");
			pokemon = pokemon.toLowerCase().replace(" ", "");
			if (!teamname || !draftpick || !pokemon) return this.parse("/draft help");
			if (isNaN(draftpick)) return this.errorReply("The draft pick is not a number.");
			drafts[room].overWrite(this, teamname, draftpick, pokemon);
		},

		draftlist: "drafted",
		list: "drafted",
		drafted: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (!drafts[room]) return this.errorReply("This room is not drafting at the moment.");
			this.sendReply(`|html|<div style="${greencss}"><i><strong>Drafted Pokemon:</strong></i><br />${drafts[room].iconize(drafts[room].draftedMons)}`);
		},

		"": "help",
		help: function (target, room, user) {
			if (!this.runBroadcast()) return;
			let help = `<strong><center>Drafts Management By Execute. Rewritten by Insist.</center></strong>`;
			help += `<strong>Adminstrative Commands:</strong> Requires @, #, &, ~.<br />`;
			help += `<strong>/draft create</strong> - Creates a draft in the room.<br />`;
			help += `<strong>/draft end</strong> - Ends a draft.<br />`;
			help += `<strong>/draft addteam (team name), (manager)</strong> - Adds a team to the draft. This allows the user the ability to take part in the draft.<br />`;
			help += `<strong>/draft removeteam (team name)</strong> - Removes a team from the draft. This strips them of their ability to take part of this draft.<br />`;
			help += `<strong>/draft max (max)</strong> - Sets the max number of Pokemon any team may draft in this draft.<br />`;
			help += `<strong>/draft random (true/false)</strong> - Sets the order of the draft to either be random or not.<br />`;
			help += `<strong>/draft snake (true/false)</strong> - Sets the order of the draft to snake or not.<br />`;
			help += `<strong>/draft reset</strong> - Deletes all the data of a draft.<br />`;
			help += `<strong>/draft start</strong> - Starts the draft.<br />`;
			help += `<strong>/draft stats</strong> - Displays every team participating in the draft with their respective manager, and every Pokemon they have drafted up until that point.<br />`;
			help += `<strong>/draft change (team name), (draft pick), (desired Pokemon)</strong> - Allows the league manager to rewrite draft data. This should be used when a participant makes a mistake. <i>This shouldn't</i> ever be the case seeing as draft script automatically rejects any spelling errors in a Pokemon's name, but this command is here if it is ever needed.<br />`;
			help += `<strong>/draft drafted</strong> - Displays the pool of Pokemon already drafted. These Pokemon are not able to be claimed by anyone else after they are drafted.<br />`;
			help += `<strong>/draftmon (Pokemon Name)</strong> - Allows a draft member to draft a Pokemon onto their team.`;
			this.sendReplyBox(help);
		},
	},

	draftmon: function (target, room, user) {
		if (!drafts[room]) return this.errorReply("This room is not drafting at the moment.");
		if (drafts[room].state !== "drafting") return this.errorReply("The draft has not started.");
		if (!target) return this.parse("/draft help");
		let pkmn = target.toLowerCase().replace(" ", "");
		if (!Dex.data.Pokedex[pkmn]) {
			return this.errorReply("Not a Pokemon.");
		} else {
			drafts[room].Nom(pkmn, user.userid, this);
		}
	},
};
