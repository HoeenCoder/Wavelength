/*
 *Draft Management by Execute.
 */
'use strict';

let fs = require('fs');
let path = require('path');
let greencss = 'background:#ccffcc;padding:10px;color:#006600;border:1px solid #006600; border-radius:6px;text-align:center;';
let redcss = 'background:##ffb3b3;padding:10px;color:#ff3333;border:1px solid #ff3333;border-radius:6px;text-align:center;';
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
		if (this.teams[teamname]) return self.errorReply('There is already a team with this Team Name.');
		this.teams[teamname] = {
			'manager': toId(manager),
			'draftpicks': [],
		};
		this.originalOrder.push(teamname);
		let fileName = this.room + 'draft';
		Db[fileName].set('teams', this.teams);
		this.room.add('|html|<div style="' + greencss + '">The <b>' + teamname + '</b> are now apart of the draft and is managed by <b>' + manager + '</b></div>');
		this.log(teamname + ' is now apart of the draft and is managed by ' + manager);
	}
	removeTeam(teamname, self) {
		if (!this.teams[teamname]) return self.errorReply('There is not a team with this Team Name, thus there is no way to remove them from this draft.');
		delete this.teams[teamname];
		this.room.add('|html|<div style="' + redcss + '">The team <b>' + teamname + '</b> has been removed from this draft league.');
		for (let i = 0; i < this.originalOrder.length; i++) {
			if (this.originalOrder[i] === teamname) this.originalOrder.splice(i, 1);
			if (this.order[i] === teamname) this.order.splice(i, 1);
			continue;
		}
		let fileName = this.room + 'draft';
		Db[fileName].set('teams', this.teams);
		this.log(teamname + ' has been removed from this league.');
	}
	start(self) {
		if (this.originalOrder.length < 2) return self.errorReply('There is no point of having a draft league if there is only 1 team!');
		this.order = this.originalOrder;
		if (this.random === true) Tools.shuffle(this.order);
		this.state = 'drafting';
		this.turn = this.order[0];
		this.room.add('|html|<div style="' + greencss + '">The Draft has started!<br>The order of this draft is <b>: ' + this.order.join(', ') + '.</b></div>');
		this.room.add('|html|<div style="' + greencss + '">It is now <b>' + this.turn + '\'s</b> turn.</div>');
		this.log('The draft has started.');
	}
	Nom(pk, user, self) {
		if (this.state !== 'drafting') return self.errorReply('There is no draft at the moment.');
		if (this.teams[this.turn].manager !== user) return self.errorReply('It is not your turn to draft.');
		if (this.draftedMons.includes(pk)) return self.errorReply('This mon has already been drafted by someone else.');
		this.teams[this.turn].draftpicks.push(pk);
		let fileName = this.room + 'draft';
		Db[fileName].set('teams', this.teams);
		this.draftedMons.push(pk);
		if (this.order.length === this.order.indexOf(this.turn) + 1) {
			if (this.teams[this.turn].draftpicks.length === this.maxMons) {
				this.room.add('|html|<div style="' + greencss + '"><b>' + user + '</b> has drafted the pokemon : <b>' + pk + '</b></div>');
				this.room.add('|html|<div style="' + redcss + '">Everyone has recieved ' + this.maxMons + ' Draft Picks.<br> The Draft is over! We hope you are happy with your draft picks :)');
				this.room.add('|html|<div style="' + greencss + '"><b>Final Picks : </b><br>' + this.show() + '</div>');
				delete drafts[this.room];
				this.log('Everyone has recieved ' + this.maxMons + ' Draft Picks, therefore the draft has ended.');
			} else if (this.snake === true) {
				let reverseOrder = this.order.reverse();
				this.turn = reverseOrder[0];
				this.room.add('|html|<div style="' + greencss + '"><b>' + user + '</b> Has drafted the Pokemon : <b>' + pk + '.</b><br>It is now <b>' + this.turn + '</b>\'s turn.</div>');
				this.room.add('|html|<div style="' + greencss + '"><b>' + this.turn + '</b> currently has : ' + this.iconize(this.teams[this.turn].draftpicks) + '</div>');
				this.log(user + ' has drafted ' + pk);
			} else {
				this.turn = this.order[0];
				this.room.add('|html|<div style="' + greencss + '"><b>' + user + '</b> Has drafted the Pokemon : <b>' + pk + '.</b><br>It is now <b>' + this.turn + '</b>\'s turn.</div>');
				this.room.add('|html|<div style="' + greencss + '"><b>' + this.turn + '</b> currently has : ' + this.iconize(this.teams[this.turn].draftpicks) + '</div>');
				this.log(user + ' has drafted ' + pk);
			}
		} else {
			this.turn = this.order[this.order.indexOf(this.turn) + 1];
			this.room.add('|html|<div style="' + greencss + '"><b>' + user + '</b> Has drafted the Pokemon : <b>' + pk + '.</b><br>It is now <b>' + this.turn + '</b>\'s turn.</div>');
			this.room.add('|html|<div style="' + greencss + '"><b>' + this.turn + '</b> currently has : ' + this.iconize(this.teams[this.turn].draftpicks) + '</div>');
			this.log(user + ' has drafted ' + pk);
		}
	}
	iconize(team) {
		let display = '';
		for (let i = 0; i < team.length; i++) {
			let dex = '';
			if (Tools.data.Pokedex[team[i]].num < 100) {
				if (Tools.data.Pokedex[team[i]].num < 10) {
					dex = '00' + Tools.data.Pokedex[team[i]].num;
	                } else {
	                    dex = '0' + Tools.data.Pokedex[team[i]].num;
				}
			} else {
				dex = Tools.data.Pokedex[team[i]].num;
			}
			let url = 'http://www.serebii.net/pokedex-sm/icon/' + dex + '.png';
			display += '<img src="' + url + '" title="' + team[i] + '">';
		}
		return display;
	}
	show(self) {
		if (this.state === 'prep') return self.errorReply('The draft has not started yet.');
		let display = "<table border='1' cellspacing='0' cellpadding='5' width='100%'><tbody><tr><th>Team</th><th>Manager</th><th>Team</th></tr>";
		for (let i = 0; i < this.order.length; i++) {
			display += "<tr><td align='center'><b>" + this.order[i] + "</b></td><td align='center'><b>" + this.teams[this.order[i]].manager + "</b></td><td allign='center'>" + this.iconize(this.teams[this.order[i]].draftpicks) + "</td>";
		}
		display += "</tbody></table>";
		if (!self) return display;
		self.sendReply('|html|' + display);
	}
	log(message) {
		let file = path.join(__dirname, '../logs/' + this.room + 'DraftLogs.txt');
		let text = '[' + Date() + ']' + message + '\n';
		fs.appendFile(file, text);
	}
	overWrite(self, team, pick, mon) {
		let oldpick = this.teams[team].draftpicks[pick - 1];
		if (!this.teams[team]) return self.errorReply('This team is not apart of the draft.');
		if (!oldpick) return self.errorReply('ERROR: No pokemon with this pick has been found.');
		if (!Tools.data.Pokedex[mon]) return self.errorReply('This is not a pokemon.');
		if (this.draftedMons.includes(mon)) return self.errorReply('This pokemon has already been drafted by someone.');
		let oldpickDraftSpot = this.draftedMons.indexOf(oldpick);
		this.draftedMons[oldpickDraftSpot] = mon;
		this.teams[team].draftpicks[pick - 1] = mon;
		let fileName = this.room + 'draft';
		Db[fileName].set('teams', this.teams);
		this.room.add('|html|<div style="' + greencss + '">Change : <b>' + team + '</b> has changed their pick : <b>' + oldpick + '</b> changed to : <b>' + this.teams[team].draftpicks[pick - 1] + '</b>.<br><b>' + team + '\'s</b> Line up now looks like: ' + this.iconize(this.teams[team].draftpicks) + '</div>');
		this.log(team + ' has changed their draft pick : ' + oldpick + ' to : ' + mon);
	}
}

exports.commands = {
	draft: function (target, room, user) {
		if (!target) return this.parse('/draft help');
		let parts = target.split(',');
		let cmd = parts[0].trim().toLowerCase().replace(' ', '');
		switch (cmd) {
		case 'create':
			if (!this.can('roommod', null, room)) return false;
			if (drafts[room]) return this.errorReply('There is already a draft going on in this room.');
			drafts[room] = new Draft(room);
			drafts[room].state = 'prep';
			drafts[room].log('Draft has been created in ' + room + '.');
			room.add('|html|<div style="' + greencss + '">A Draft has been started!</div>');
			break;
		case 'reset':
			if (!this.can('roommod', null, room)) return false;
			if (!drafts[room]) return this.errorReply('This room is not taking part in a draft at the moment.');
			delete drafts[room];
			room.add('|html|<div style="' + redcss + '">The data for this draft has been reset.</div>');
			break;
		case 'addteam':
			if (!this.can('roommod', null, room)) return false;
			if (parts.length < 3) return this.parse('/draft help');
			if ((!drafts[room])) return this.errorReply('This room is not drafting at the moment.');
			if (!drafts[room].state === 'prep') return this.errorReply('You may not add teams to the draft at this moment.');
			let teamName = parts[1].trim();
			let manager = parts[2].trim();
			drafts[room].addTeam(teamName, manager, this);
			break;
		case 'removeteam':
			if (!this.can('roommod', null, room)) return false;
			if (parts.length < 2) return this.parse('/draft help');
			let teamNamez = parts[1].trim();
			if ((!drafts[room])) return this.errorReply('This room is not drafting at the moment.');
			if (drafts[room].state === 'drafting') return this.errorReply('You may not add teams to the draft at this moment.');
			drafts[room].removeTeam(teamNamez, this);
			break;
		case 'start':
			if (!this.can('roommod', null, room)) return false;
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			if (drafts[room].state === 'drafting') return this.errorReply('The draft has already started.');
			drafts[room].start(this);
			break;
		case 'random':
			if (!this.can('roommod', null, room)) return false;
			if ((!drafts[room])) return this.errorReply('This room is not drafting at the moment.');
			if (!parts[1]) return this.prase('/draft help');
			let either = parts[1].trim().toLowerCase().replace(' ', '');
			if (either === 'true') {
				drafts[room].random = true;
				room.add('|html|<div style="' + greencss + '">The order of the draft is now <b>randomized!</b></div>');
				drafts[room].log('The order of this draft is now randomized.');
			} else if (either === 'false') {
				drafts[room].random = false;
				room.add('|html|<div style="' + greencss + '">The order of the draft is now not <b>randomized!</b></div>');
				drafts[room].log('The order of this draft is no longer randomized.');
			} else {
				this.parse('/draft help');
			}
			break;
		case 'snake':
			if (!this.can('roommod', null, room)) return false;
			if ((!drafts[room])) return this.errorReply('This room is not drafting at the moment.');
			if (!parts[1]) return this.prase('/draft help');
			let eitheror = parts[1].trim().toLowerCase().replace(' ', '');
			if (eitheror === 'true') {
				drafts[room].snake = true;
				room.add('|html|<div style="' + greencss + '">The order of the draft is now <b>snaked!</b></div>');
				drafts[room].log('The order of this draft is now snaked.');
			} else if (eitheror === 'false') {
				drafts[room].snake = false;
				room.add('|html|<div style="' + greencss + '">The order of the draft is now not <b>snaked!</b></div>');
				drafts[room].log('The order of this draft is no longer snaked.');
			} else {
				this.parse('/draft help');
			}
			break;
		case 'end':
			if (!this.can('roommod', null, room)) return false;
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			drafts[room].log('The draft has been ended by ' + user.name);
			delete drafts[room];
			room.add('|html|<div style="' + redcss + '">The draft has ended!<br>We hope you are happy with what you came out with :).</div>');
			break;
		case 'max':
			if (!this.can('roommod', null, room)) return false;
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			if (!parts[1]) return this.sendReply('The draft pick limit for this draft is ' + drafts[room].maxMons);
			let num = parseFloat(parts[1].trim());
			if (isNaN(num)) return this.errorReply('Must be a number.');
			drafts[room].maxMons = num;
			drafts[room].log('The draft pick limit has been set to be ' + drafts[room].maxMons + ' by ' + user.name);
			room.add('|html|<div style="' + greencss + '">The draft limit of this draft has been set to <b>' + drafts[room].maxMons + '</b></div>');
			break;
		case 'stats':
			if (!this.runBroadcast()) return;
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			drafts[room].show(this);
			break;
		case 'change':
			if (!this.can('roommod', null, room)) return false;
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			if (parts.length < 3) return this.parse('/draft help');
			let teamname = parts[1].trim();
			let draftpick = parts[2].trim();
			let pokemon = parts[3].trim().toLowerCase().replace(' ', '');
			if (isNaN(draftpick)) return this.errorReply('The draftpick is not a number.');
			drafts[room].overWrite(this, teamname, draftpick, pokemon);
			break;
		case 'drafted':
			if (!this.runBroadcast()) return;
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			this.sendReply('|html|<div style="' + greencss + '"><i><b>Drafted Pokemon : </b></i><br/>' + drafts[room].iconize(drafts[room].draftedMons));
			break;
		default:
			if (!this.runBroadcast()) return;
			this.sendReplyBox('<b><center>Drafts Management By Execute.</center></b><br/>' +
					'<b>Adminstrative Commands</b> : Requires #,&,~ <br/>' +
					'<b>/draft create</b> - Creates a draft in the room.<br/>' +
					'<b>/draft end</b> - Ends a draft.<br/>' +
					'<b>/draft addteam, (teamname), (manager)</b> - Adds a team to the draft. This allows the user the ability to take part in the draft.<br/>' +
					'<b>/draft removeteam, (teamname)</b> - Removes a team from the draft. This strips them of their ability to take part of this draft.<br/>' +
					'<b>/draft max, (max)</b> - Sets the max number of pokemon any team may draft in this draft.<br/>' +
					'<b>/draft random, (true, false)</b> - Sets the order of the draft to either be random or not. <br/>' +
					'<b>/draft snake, (true, false)</b> - Sets the order of the draft to snake or not.<br/>' +
					'<b>/draft reset</b> - Deletes all the data of a draft.<br/>' +
					'<b>/draft start</b> - Starts the draft.<br>' +
					'<b>/draft stats</b> - Displays every team participating in the draft with their respective manager, and every pokemon they have drafted up until that point.<br/>' +
					'<b>/draft change, (teamname), (draftpick), (desired Pokemon)</b> - Allows the league manager to rewrite draft data. This should be used when a particpant makes a mistake. <i>This shouldn\'t</i> ever be the case seeing as draft script automatically rejects any spelling errors in a pokemon\'s name, but this command is here if it is ever needed. <br/> ' +
					'<b>/draft drafted</b> - Displays the pool of pokemon already drafted. These pokemon are not able to be claimed by anyone else after they are drafted. <br/>' +
					'<b>/draft end</b> - Ends a draft league instantly. Unless you really need to end it, you <i>shouldn\'t</i> use this command, as the draft automatically ends when every player has finished drafting.<br><br/>' +
					'<b>/draftmon (pokemonname)</b> - Allows a draft member to draft a pokemon onto their team.');
		}
	},
	draftmon: function (target, room, user) {
		if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
		if (drafts[room].state !== 'drafting') return this.errorReply('The draft has not started.');
		if (!target) return this.parse('/draft help');
		let pkmn = target.toLowerCase().replace(' ', '');
		if (!Tools.data.Pokedex[pkmn]) {
			return this.errorReply('Not a Pokemon.');
		} else {
			drafts[room].Nom(pkmn, user.userid, this);
		}
	},
};
