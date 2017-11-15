/******************************  
*         Factions            * 
*      Idea by Desokoro       *
*  Coded by WGC and Bladicon  *
*Credits to jd for League file*
*******************************/

'use strict';

/****** General Faction Functions Start ******/
let factions = {};
const fs = require('fs');
try {
	factions = JSON.parse(fs.readFileSync('config/factions.json', 'utf8'));
} catch (e) {
	if (e.code !== 'ENOENT') throw e;
}

function getFaction(user) {
	user = toId(user);
	let reply;
	for (let faction in factions) {
		if (factions[faction].users.includes(user)) {
			reply = factions[faction].name;
			break;
		}
	}
	return reply;
}
WL.getFaction = getFaction;

function write() {
	if (Object.keys(factions).length < 1) return fs.writeFileSync('config/factions.json', JSON.stringify(factions));
	let data = "{\n";
	for (let u in factions) {
		data += '\t"' + u + '": ' + JSON.stringify(factions[u]) + ",\n";
	}
	data = data.substr(0, data.length - 2);
	data += "\n}";
	fs.writeFileSync('config/factions.json', data);
}
function getFactionRank(user) {
	user = toId(user);
	let faction = toId(getFaction(user));
	if (!factions[faction]) return false;
	if (!faction) return false;
	for (let rank in factions[faction].ranks) {
		if (factions[faction].ranks[rank].users.includes(user)) return factions[faction].ranks[rank].title;
	}
}

/****** General Faction Functions End ******/

/****** Faction vs Faction Functions Start ******/

if (!Rooms.global.FvF) Rooms.global.FvF = {};

function isFvFBattle(p1, p2, id, status, types, score) {
	let factionId = toId(getFaction(p1));
	if (!factionId) return;
	let targetFactionid = toId(getFaction(p2));
	if (!targetFactionid) return;

	if (!Rooms.global.FvF[factionId]) return;
	if (Rooms.global.FvF[factionId] && Rooms.global.FvF[factionId].challenger && Rooms.global.FvF[factionId].challenger === targetFactionid || Rooms.global.FvF[factionId] && Rooms.global.FvF[factionId].challenging && Rooms.global.FvF[factionId].challenging === targetFactionid) {
		let room = Rooms(Rooms.global.FvF[factionId].room);
		if (!room.fvf.started) return;
		if (room.fvf.mode === "normal") {
			if (room.fvf.factions[0].players[room.fvf.statusNumber] !== p1 && room.fvf.factions[1].players[room.fvf.statusNumber] !== p1 || room.fvf.factions[0].players[room.fvf.statusNumber] !== p2 && room.fvf.factions[1].players[room.fvf.statusNumber] !== p2) return;
		} else {
			if ((!room.fvf.factions[0].players.includes(p1) && !room.fvf.factions[1].players.includes(p2)) && (!room.fvf.factions[0].players.includes(p2) && !room.fvf.factions[1].players.includes(p1))) return;
		}

		if (status === 'start') {
			if (room.fvf.mode === "normal") {
				if (room.fvf.status[room.fvf.statusNumber] !== 2) return;
				room.fvf.status[room.fvf.statusNumber] = id;
			} else {
				let statusNumber = room.fvf.factions[(room.fvf.factions[0].players.includes(p1) ? 0 : 1)].players.indexOf(p1);
				room.fvf.status[statusNumber] = id;
			}
			fvfDisplay(room);
			room.add('|raw|<a href="/' + id + '">The Faction vs Faction battle between ' + WL.nameColor(p1, true) + ' (' + Chat.escapeHTML(factions[factionId].name) + ') and ' +
				WL.nameColor(p2, true) + ' (' + Chat.escapeHTML(factions[targetFactionid].name) + ') has begun.</a>').update();
		} else if (status === 'types') {
			if (room.fvf.mode === "normal") {
				room.fvf.types[room.fvf.statusNumber] = types;
			} else {
				let statusNumber = room.fvf.factions[(room.fvf.factions[0].players.includes(p1) ? 0 : 1)].players.indexOf(p1);
				room.fvf.types[statusNumber] = types;
			}
			fvfDisplay(room);
		} else if (status.substr(0, 2) === 'p-') {
			status = status.slice(2);
			if (room.fvf.mode === "normal") {
				if (room.fvf.status[room.fvf.statusNumber] !== id) return;
				let player = (room.fvf.factions[0].players[room.fvf.statusNumber] === status ? 0 : 1);
				room.fvf.status[room.fvf.statusNumber] = player;
				room.fvf.factions[room.fvf.status[room.fvf.statusNumber]].wins++;
				room.fvf.statusNumber++;

				if (!(room.fvf.factions[0].wins > room.fvf.factions[1].wins && room.fvf.factions[0].wins === Math.ceil(room.fvf.size / 4 + 0.5) || room.fvf.factions[1].wins > room.fvf.factions[0].wins && room.fvf.factions[1].wins === Math.ceil(room.fvf.size / 4 + 0.5))) {
					room.fvf.status[room.fvf.statusNumber] = true;
				} else {
					room.fvf.status[room.fvf.statusNumber] = false;
				}
				if (room.fvf.status[room.fvf.statusNumber]) {
					room.fvf.status[room.fvf.statusNumber] = room.fvf.statusNumber;
					fvfDisplay(room);
				} else {
					room.fvf.status[room.fvf.statusNumber] = room.fvf.statusNumber;
					fvfDisplay(room);
					// end
					let winner = room.fvf.factions[0].name;
					if (room.fvf.factions[1].wins > room.fvf.factions[0].wins) {
						winner = room.fvf.factions[1].name;
					}
					room.add('|raw|' +
						'<div class="infobox">Congratulations ' + Chat.escapeHTML(winner) + '. You have won the Faction vs Faction!</div>'
					);
					room.update();
					factions[toId(winner)].tourwins += 1;
					write();
					delete Rooms.global.FvF[toId(room.fvf.factions[0].name)];
					delete Rooms.global.FvF[toId(room.fvf.factions[1].name)];
					delete room.fvf;
				}
			} else {
				let statusNumber = room.fvf.factions[(room.fvf.factions[0].players.includes(p1) ? 0 : 1)].players.indexOf(p1);
				if (room.fvf.status[statusNumber] !== id) return;
				let player = (room.fvf.factions[0].players[statusNumber] === status ? 0 : 1);
				room.fvf.status[statusNumber] = player;
				room.fvf.factions[room.fvf.status[statusNumber]].wins++;

				if (!(room.fvf.factions[0].wins > room.fvf.factions[1].wins && room.fvf.factions[0].wins === Math.ceil(room.fvf.size / 4 + 0.5) || room.fvf.factions[1].wins > room.fvf.factions[0].wins && room.fvf.factions[1].wins === Math.ceil(room.fvf.size / 4 + 0.5))) {
					room.fvf.status[room.fvf.statusNumber] = true;
				} else {
					room.fvf.status[room.fvf.statusNumber] = false;
				}
				if (room.fvf.status[room.fvf.statusNumber]) {
					room.fvf.status[room.fvf.statusNumber] = room.fvf.statusNumber;
					fvfDisplay(room);
				} else {
					room.fvf.status[room.fvf.statusNumber] = room.fvf.statusNumber;
					fvfDisplay(room);
					// end
					let winner = room.fvf.factions[0].name;
					if (room.fvf.factions[1].wins > room.fvf.factions[0].wins) {
						winner = room.fvf.factions[1].name;
					}
					factions[toId(winner)].tourwins += 1;
					write();
					room.add('|raw|' +
						'<div class="infobox">Congratulations ' + Chat.escapeHTML(winner) + '. You have won the Faction vs Faction!</div>'
					);
					room.update();
					delete Rooms.global.FvF[toId(room.fvf.factions[0].name)];
					delete Rooms.global.FvF[toId(room.fvf.factions[1].name)];
					delete room.fvf;
				}
			}
		} else if (status === 'tie') {
			if (room.fvf.mode === "normal") {
				room.fvf.status[room.fvf.statusNumber] = 2;
			} else {
				let statusNumber = room.fvf.factions[(room.fvf.factions[0].players.includes(p1) ? 0 : 1)].players.indexOf(p1);
				room.fvf.status[statusNumber] = 2;
			}
			fvfDisplay(room);
			room.add("|raw|The Faction vs Faction battle between " + WL.nameColor(p1, true) + " and " + WL.nameColor(p2, true) + " ended with a tie. They have to have a rematch.");
			room.update();
		}
	}
}
WL.isFvFBattle = isFvFBattle;

function fvfDisplay(room) {
	let output = '';
	output += '<center><font size="6">Faction vs Faction</font><br /> Tier - ' + room.fvf.tier + ' <br />';
	output += '<font color="grey"><small>(experimental - report any bugs to an admin!)</small></font>';
	output += '<font color="grey"><small>(' + room.fvf.size + 'v' + room.fvf.size + ') (mode: ' + Chat.escapeHTML(room.fvf.mode) + ')</small></font><br /><br />';
	output += '<table><tr><th><font size="5">' + Chat.escapeHTML(room.fvf.factions[0].name) + '</font></th><td>vs</td><th><font size="5">' + Chat.escapeHTML(room.fvf.factions[1].name) + '</font></th></tr>';

	if (room.fvf.factions[0].players.length === room.fvf.size && room.fvf.factions[1].players.length === room.fvf.size && !room.fvf.started) {
		let notOnline = [];
		for (let u = 0; u < room.fvf.factions[0].players.length; u++) {
			let curPlayer = room.fvf.factions[0].players[u];
			if (!Users(curPlayer) || !Users(curPlayer).connected) {
				notOnline.push(curPlayer);
				continue;
			}
		}

		for (let u = 0; u < room.fvf.factions[1].players.length; u++) {
			let curPlayer = room.fvf.factions[1].players[u];
			if (!Users(curPlayer) || !Users(curPlayer).connected) {
				notOnline.push(curPlayer);
				continue;
			}
		}

		if (notOnline.length > 0) {
			for (let u = 0; u < notOnline.length; u++) {
				if (room.fvf.factions[0].players.includes(notOnline[u])) {
					room.fvf.factions[0].players.splice(room.fvf.factions[0].players.indexOf(notOnline[u]), 1);
				} else {
					room.fvf.factions[1].players.splice(room.fvf.factions[1].players.indexOf(notOnline[u]), 1);
				}
			}
			room.add("The following players have been removed from the Faction vs Faction due to not being online: " + notOnline.join(', '));
		} else {
			room.fvf.started = true;
			Dex.shuffle(room.fvf.factions[0].players);
			Dex.shuffle(room.fvf.factions[1].players);
			room.add("The Faction vs Faction has started!");
			room.fvf.status[0] = 2;
		}
	}

	if (!room.fvf.started) {
		output += '<tr><td>Joined: ' + room.fvf.factions[0].players.length + '</td><td><td>Joined: ' + room.fvf.factions[1].players.length + '</td></tr>';
		output += '<tr><td colspan="3"><center><button name="send" value="/fvf join">Join</button></center></td></tr>';
	} else {
		for (let u = 0; u < room.fvf.factions[0].players.length; u++) {
			output += '<tr>';
			switch (room.fvf.status[u]) {
			case 0:
				output += '<td><font color="green"><center>' + room.fvf.factions[0].players[u] + '</center></font></td>';
				output += '<td>vs</td>';
				output += '<td><font color="red"><center>' + room.fvf.factions[1].players[u] + '</center></font></td>';
				break;
			case 1:
				output += '<td><font color="red"><center>' + room.fvf.factions[0].players[u] + '</center></font></td>';
				output += '<td>vs</td>';
				output += '<td><font color="green"><center>' + room.fvf.factions[1].players[u] + '</center></font></td>';
				break;
			case 2:
				output += '<td><center><b>' + room.fvf.factions[0].players[u] + '</b></center></td>';
				output += '<td>vs</td>';
				output += '<td><center><b>' + room.fvf.factions[1].players[u] + '</b></center></td>';
				break;
			case 3:
				output += '<td><center>' + room.fvf.factions[0].players[u] + '</center></td>';
				output += '<td>vs</td>';
				output += '<td><center>' + room.fvf.factions[1].players[u] + '</center></td>';
				break;
			default:
				output += '<td><center><a href="/' + Chat.escapeHTML(room.fvf.status[u]) + '">' + room.fvf.factions[0].players[u] + '</a></center></td>';
				output += '<td>vs</td>';
				output += '<td><center><a href="/' + Chat.escapeHTML(room.fvf.status[u]) + '">' + room.fvf.factions[1].players[u] + '</a></center></td>';
				break;
			}
			output += '</tr>';
		}
	}
	output += '</table>';

	room.add('|uhtmlchange|fvf-' + room.fvf.fvfId + '|');
	room.add('|uhtml|fvf-' + room.fvf.fvfId + '|<div class="infobox">' + output + '</div>');
	room.update();
}
WL.fvfDisplay = fvfDisplay;

function factionPM(message, faction) {
	let factionid = toId(faction);
	if (!factions[factionid]) return;
	for (let u in factions[factionid].users) {
		if (!Users(factions[factionid].users[u]) || !Users(factions[factionid].users[u]).connected) continue;
		Users(factions[factionid].users[u]).send("|pm|~Faction PM [Do Not Reply]" + factions[factionid].name + "|~|/raw " + message);
	}
}


/****** Faction vs Faction Functions End ******/

exports.commands = {
	faction: 'factions',
	factions: {
		create: function (target, room, user) {
			let targets = target.split(',');
			for (let u = 0; u < targets.length; u++) targets[u] = targets[u].trim();
			if (!targets[2]) return this.errorReply('/factions create (name), (description), (tag [4 char])');
			let name = targets[0];
			let desc = targets[1];
			if (desc.length > 100) return this.errorReply('Faction descriptions must be 100 characters or less!');
			let tag = targets[2];
			if (tag.length > 4) return this.errorReply('Faction tags must be 4 characters at most!');
			if (factions[toId(name)]) return this.errorReply('That faction exists already!');
			for (let i = 0; i < factions.length; i++) {
				if (factions[i].tag === tag) return this.errorReply('That faction tag exists already!');
			}
			if (getFaction(user.userid)) return this.errorReply('You are already in a faction!');

			let priv = false;
			let approve = true;
			if (!user.can('broadcast')) {
				priv = true;
				approve = false;
			}

			factions[toId(name)] = {
				name: name,
				id: toId(name),
				desc: desc,
				tag: tag,
				users: [user.userid],
				userwins: {},
				tourwins: 0,
				bank: [],
				invites: [],
				bans: [],
				private: priv,
				approved: approve,
				ranks: {
					'owner': {
						title: 'Owner',
						users: [user.userid],
					},
					'noble': {
						title: 'Noble',
						users: [],
					},
					'commoner': {
						title: 'Commoner',
						users: [],
					},
				},
			};
			write();
			Monitor.adminlog('Faction ' + name + ' was just created! If you wish to approve this faction please use /faction approve (name)');
			return this.sendReply('Faction ' + name + ' created!');
		},
		delete: function (target, room, user) {
			if (!target) return this.errorReply('/factions delete (name)');
			if (!factions[toId(target)]) return this.errorReply('Doesn\'t exist!');
			if (!this.can('declare') && factions[toId(target)].ranks['owner'].users.indexOf(user.userid) === -1) return false;

			delete factions[toId(target)];
			write();
			this.sendReply('Faction ' + toId(target) + ' has been deleted.');
		},
		desc: function (target, room, user) {
			if (!getFaction(user.userid)) return this.errorReply('You are no in a faction.');
			if (toId(getFactionRank(user.userid) !== 'owner')) return this.errorReply('You do not own this faction');
			if (!target) return this.errorReply('Needs a target no more than 100 characters');
			if (target.length > 100) return this.errorReply('Faction descriptions must be 100 characters or less!');
			factions[toId(getFaction(user.userid))].desc = target;
			write();
			return this.sendReplyBox('Your faction description is now set to: <br /> ' + factions[toId(getFaction(user.userid))].desc + '.');
		},
		avatar: function (target, room, user) {
			let factionId = toId(getFaction(user.userid));
			if (!factionId) return this.errorReply('You are not in a faction!');
			if (toId(getFactionRank(user.userid)) !== 'owner') return this.errorReply('You are not the faction owner!');
			if (!target) return false;
			if (!target.includes['.jpg'] && target.includes['.png'] && target.includes['.gif']) return this.errorReply("Not an image link!");
			factions[factionId].pendingAVI = target;
			write();
			if (Rooms('upperstaff')) Rooms('upperstaff').add('|html| Faction ' + factionId + ' has requested a faction avatar <br /><img src="' + target + '" height="80" width="80"><br /><button name="send" value="/faction aa ' + factionId + ',' + factions[factionId].pendingAVI + '">Set it!</button> <button name="send" value="/faction da ' + factionId + '">Deny it!</button>').update();
			return this.sendReply('Upper Staff have been notified of your faction avatar request!');
		},
		aa: 'approveavatar',
		approveavatar: function (target, room, user) {
			if (!this.can('declare')) return false;
			let targets = target.split(',');
			for (let u in targets) targets[u] = targets[u].trim();
			if (!targets[1]) return this.errorReply("Usage: '/factiona approveavatar factionid, link'");
			let factionId = toId(targets[0]);
			if (!factions[factionId]) return this.errorReply('Not a faction!');
			let factAvi = targets[1];
			if (factAvi !== factions[factionId].pendingAVI) return this.errorReply('The image does not match the requested image!');
			factions[factionId].avatar = factAvi;
			delete factions[factionId].pendingAVI;
			write();
			Monitor.adminlog(user.name + ' has set a faction avatar for ' + factions[factionId].name);
			return this.sendReply('The faction avatar has been set for ' + factions[factionId].name);
		},
		da: 'denyavatar',
		denyavatar: function (target, room, user) {
			if (!this.can('declare')) return false;
			let factionId = toId(target);
			if (!factions[factionId]) return this.errorReply('That faction does not exist!');
			if (!factions[factionId].pendingAVI) return this.errorReply('That faction has no requested faction avatar!');
			delete factions[factionId].pendingAVI;
			write();
			Monitor.adminlog(user.name + ' has denied a faction avatar for ' + factions[factionId].name);
			return this.sendReply('The faction avatar has been denied for ' + factions[factionId].name);
		},
		pa: 'pendingavatars',
		pendingavatars: function (target, room, user) {
			if (!this.can('declare')) return false;
			let output = '<center><table border="1" cellspacing ="0" cellpadding="3"><tr><td>Faction</td><td>Image</td><td>Approve</td><td>Deny</td</tr>';
			for (let faction in factions) {
				if (factions[faction].pendingAVI) {
					output += '<tr>';
					output += '<td>' + Chat.escapeHTML(factions[faction].name) + '</td>';
					output += '<td><img src="' + factions[faction].pendingAVI + '" height="80" width="80"></td>';
					output += '<td><button name="send" value="/faction aa ' + faction + ',' + factions[faction].pendingAVI + '">Approve faction avatar!</button></td>';
					output += '<td><button name="send" value="/faction da ' + faction + '">Deny faction avatar!</button></td>';
				}
			}
			output += "</table></center>";
			this.sendReplyBox(output);
		},
		list: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (Object.keys(factions).length < 1) return this.sendReply("There's no factions on this server.");
			let output = '<center><table border="1" cellspacing ="0" cellpadding="3"><tr><td>Faction</td><td>Description</td><td>Points</td><td>Members</td></tr>';
			let sortedFactions = Object.keys(factions).sort(function (a, b) {
				return factions[b].points - factions[a].points;
			});

			for (let faction = 0; faction < sortedFactions.length; faction++) {
				let curFaction = factions[sortedFactions[faction]];
				let desc = Chat.escapeHTML(curFaction.desc);
				if (desc.length > 50) desc = desc.substr(0, 50) + "<br />" + desc.substr(50);
				if (!curFaction.private) {
					output += "<tr>";
					output += "<td>" + Chat.escapeHTML(curFaction.name) + "</td>";
					output += "<td>" + desc + "</td>";
					output += "<td>" + curFaction.tourwins + "</td>";
					output += "<td>" + '<button name="send" value="/faction profile ' + curFaction.id + '">' + curFaction.users.length + "</button></td>";
					output += "</tr>";
				}
			}
			output += "</table></center>";
			this.sendReplyBox(output);
		},
		profile: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (!target && getFaction(user.userid)) target = getFaction(user.userid);
			let factionId = toId(target);
			if (!factions[factionId] || factions[factionId] && factions[factionId].private === true) return this.errorReply("There is no faction by that name! If you are not in a faction please specify one!");
			let output = (factions[factionId].avatar ? "<img src='" + factions[factionId].avatar + "' height='80' width='80' align='left'>" : '') + '&nbsp;' + Chat.escapeHTML(factions[factionId].name) + '</br>';
			output += '<br />&nbsp;Faction Vs Faction wins: ' + factions[factionId].tourwins + '<br /> &nbsp;Usercount: ' + factions[factionId].users.length + '<br />';
			output += '&nbsp;Description: ' + factions[factionId].desc + '<br />';
			output += '&nbsp;Owners: ' + factions[factionId].ranks['owner'].users.join(', ') + '<br />';
			output += '&nbsp;Nobles: ' + factions[factionId].ranks['noble'].users.join(', ') + '<br />';
			output += '&nbsp;Commoners: ' + factions[factionId].ranks['commoner'].users.join(', ') + '<br />';
			this.sendReplyBox(output);
		},
		privatize: function (target, room, user) {
			let factionId = toId(getFaction(user.userid));
			if (!factionId) return this.errorReply('You are not in a faction!');
			if (toId(getFactionRank(user.userid)) !== 'owner') return false;
			if (!factions[factionId].approved) return this.errorReply("Your faction is not approved!");
			if (this.meansYes(target)) {
				if (factions[factionId].private) return this.errorReply('Faction is already private');
				factions[factionId].private = true;
				write();
				return this.sendReply('Faction is now private!');
			} else if (this.meansNo(target)) {
				if (!factions[factionId].private) return this.errorReply('Faction is not private already');
				factions[factionId].private = false;
				write();
				return this.sendReply('Faction is now public!');
			} else {
				return this.errorReply('Valid targets are on, true, off, false');
			}
		},
		approve: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.errorReply('/factions approve (faction)');
			if (!factions[toId(target)]) return this.errorReply("Not a faction!");
			if (factions[toId(target)].approved) return this.errorReply("Already approved!");
			factions[toId(target)].approved = true;
			factions[toId(target)].private = false;
			write();
			Monitor.adminlog('The faction ' + factions[toId(target)].name + ' has been approved by ' + user.name + '.');
			return user.popup("Faction approved!");
		},
		join: function (target, room, user) {
			if (!target) this.errorReply('/faction join (faction)');
			let factionid = toId(target);
			if (!factions[factionid] || (factions[factionid] && !factions[factionid].approved) || (factions[factionid] && factions[factionid].private)) return this.errorReply('That faction does not exist.');
			if (getFaction(user.userid)) return this.errorReply('You\'re already in a faction!');
			if (factions[factionid].bans.indexOf(user.userid) > -1) return this.errorReply("You are banned from this faction!");
			let sortedRanks = Object.keys(factions[factionid].ranks).sort(function (a, b) { return factions[factionid].ranks[b].rank - factions[factionid].ranks[a].rank; });
			let rank = sortedRanks.pop();
			factions[factionid].users.push(user.userid);
			factions[factionid].ranks[rank].users.push(user.userid);
			write();

			user.popup("You've joined " + factions[factionid].name + ".");
		},
		invite: function (target, room, user) {
			if (!target) return this.errorReply('/factions invite (user)');
			let faction = toId(getFaction(user.userid));
			let targetUser = Users(target);
			if (!targetUser) return this.errorReply("Needs a target!");
			const factionid = toId(faction);
			if (factions[factionid] && !factions[factionid].approved) return this.errorReply("Your faction is not approved!");
			if (Db.blockedinvites.get(targetUser.userid)) return this.errorReply('User is currently blocking faction invites!');
			if (!factions[factionid]) return this.errorReply('You are not in a faction.');
			if (!targetUser || !targetUser.connected) return this.errorReply('That user isn\'t online!');
			if (factions[factionid].bans.indexOf(targetUser.userid) > -1) return this.errorReply(targetUser.name + " is banned from this faction!");
			if (factions[factionid].users.includes(targetUser.userid)) return this.errorReply('That user is already in a faction!');
			if (factions[factionid].invites.includes(targetUser.userid)) return this.errorReply('That user already has a pending invite for this faction!');
			for (let faction = 0; faction < factions.length; faction++) {
				if (factions[faction].id === faction) continue;
				if (factions[faction].users.includes(targetUser.userid)) return this.errorReply('That user is a member of ' + factions[faction].name + '.');
			}
			if (toId(getFactionRank(user.userid)) !== 'noble' && toId(getFactionRank(user.userid)) !== 'owner') return this.errorReply('You can\'t invite people!');

			factions[factionid].invites.push(targetUser.userid);
			write();
			let message = "/html has invited you to join the faction " + Chat.escapeHTML(factions[factionid].name) + ". <br />" +
				"<button name=\"send\" value=\"/faction accept " + factionid + "\">Click to accept</button> | <button name=\"send\" value=\"/faction decline " + factionid +
				"\">Click to decline</button>";
			targetUser.send("|pm|" + user.getIdentity() + "|" + targetUser.getIdentity() + "|" + message);
			this.sendReply("You've invited " + targetUser.name + " to join " + factions[factionid].name + ".");
		},
		blockinvites: function (target, room, user) {
			if (Db.blockedinvites.get(user.userid)) return this.errorReply('You are already blocking faction invites!');
			Db.blockinvites.set(user.userid, true);
			return this.sendReply('Faction invites are now blocked!');
		},
		unblockinvites: function (target, room, user) {
			if (!Db.blockedinvites.get(user.userid)) return this.errorReply('You are currently not blocking faction invites!');
			Db.blockedinvites.remove(user.userid);
			return this.sendReply('Faction  invites are now allowed!');
		},
		accept: function (target, room, user) {
			if (!target) return this.errorReply('/faction accept [faction]');
			let factionid = toId(target);
			if (!factions[factionid]) return this.errorReply('This faction does not exist.');
			if (!factions[factionid].invites.includes(user.userid)) return this.errorReply('You have no pending invites!');
			if (getFaction(user.userid)) return this.errorReply('You\'re already in a faction!');

			let sortedRanks = Object.keys(factions[factionid].ranks).sort(function (a, b) { return factions[factionid].ranks[b].rank - factions[factionid].ranks[a].rank; });
			let rank = sortedRanks.pop();
			factions[factionid].users.push(user.userid);
			factions[factionid].ranks[rank].users.push(user.userid);
			factions[factionid].invites.splice(factions[factionid].invites.indexOf(user.userid), 1);
			write();

			user.popup("You've accepted the invitation to join " + factions[factionid].name + ".");
		},
		decline: function (target, room, user) {
			if (!target) return this.errorReply('/faction decline [faction]');
			let factionid = toId(target);
			if (!factions[factionid]) return this.errorReply('This faction does not exist.');
			if (!factions[factionid].invites.includes(user.userid)) return this.errorReply('You have no pending invites!');
			if (getFaction(user.userid)) return this.errorReply('You\'re already in a faction!');

			factions[factionid].invites.splice(factions[factionid].invites.indexOf(user.userid), 1);
			write();
		},
		leave: function (target, room, user) {
			let factionid = toId(getFaction(user.userid));
			if (!factions[factionid]) return this.errorReply("You're not in a faction.");
			if (factions[factionid].ranks['owner'].users.includes(user.userid)) return this.errorReply("You can't leave a faction if you're the owner.");

			for (let rank in factions[factionid].ranks) {
				if (!factions[factionid].ranks[rank].users.includes(user.userid)) continue;
				factions[factionid].ranks[rank].users.splice(factions[factionid].ranks[rank].users.indexOf(user.userid), 1);
			}
			factions[factionid].users.splice(factions[factionid].users.indexOf(user.userid), 1);
			write();
			this.sendReply("You have left " + factions[factionid].name + ".");
		},
		kick: function (target, room, user) {
			if (!target) return this.errorReply('/factions kick [user]');
			let factionName = getFaction(user.userid);
			let factionid = toId(factionName);
			let targetid = toId(target);
			if (user.userid === targetid) return this.errorReply('You cannot kick yourself!');
			if (!factions[factionid]) return this.errorReply('You aren\'t in a faction!');
			if (!factions[factionid].users.includes(targetid)) return this.errorReply('This user is not in a faction!');

			if (toId(getFactionRank(user.userid)) !== 'noble' && toId(getFactionRank(user.userid)) !== 'owner') return this.errorReply("You don't have permission to kick users from '" + factionName + "'.");
			if (toId(getFactionRank(user.userid)) === 'noble' && toId(getFactionRank(targetid)) === 'noble' || toId(getFactionRank(user.userid)) === 'noble' && toId(getFactionRank(targetid)) === 'owner' || toId(getFactionRank(user.userid)) === 'owner' && toId(getFactionRank(targetid)) === 'owner') return this.errorReply('You cannot kick them from the faction!');

			for (let rank in factions[factionid].ranks) {
				if (factions[factionid].ranks[rank].users.includes(targetid)) {
					factions[factionid].ranks[rank].users.splice(factions[factionid].ranks[rank].users.indexOf(targetid), 1);
				}
			}
			factions[factionid].users.splice(factions[factionid].users.indexOf(targetid), 1);
			write();
			if (Users(target) && Users(target).connected) Users(target).send("|popup||html|" + WL.nameColor(user.name) + " has kicked you from the faction " + Chat.escapeHTML(factions[factionid].name) + ".");
			this.sendReply("You've kicked " + target + " from " + factions[factionid].name + ".");
		},
		ban: function (target, room, user) {
			if (!getFaction(user.userid)) return false;
			if (!target) return this.errorReply('/faction ban (target)');
			if (toId(getFactionRank(user.userid)) !== 'noble' && toId(getFactionRank(user.userid)) !== 'owner') return false;
			if (toId(getFactionRank(user.userid)) === 'noble' && toId(getFactionRank(toId(target))) === 'noble' || toId(getFactionRank(user.userid)) === 'noble' && toId(getFactionRank(toId(target))) === 'owner' || toId(getFactionRank(user.userid)) === 'owner' && toId(getFactionRank(toId(target))) === 'owner') return this.errorReply('You cannot kick them from the faction!');
			if (factions[toId(getFaction(user.userid))].bans.includes(toId(target))) return this.errorReply("User is already banned!");
			factions[toId(getFaction(user.userid))].bans.push(toId(target));
			if (factions[toId(getFaction(user.userid))].users.includes(toId(target))) factions[toId(getFaction(user.userid))].users.splice(factions[toId(getFaction(user.userid))].users.indexOf(toId(target)), 1);
			for (let rank in factions[toId(getFaction(user.userid))].ranks) {
				if (factions[toId(getFaction(user.userid))].ranks[rank].users.includes(toId(target))) factions[toId(getFaction(user.userid))].ranks[rank].users.splice(factions[toId(getFaction(user.userid))].ranks[rank].users.indexOf(toId(target)), 1);
			}
			write();
			return this.sendReply(toId(target) + ' is now banned from your faction!');
		},
		unban: function (target, room, user) {
			if (!getFaction(user.userid)) return false;
			if (!target) return this.errorReply('/faction unban (target)');
			if (toId(getFactionRank(user.userid)) !== 'noble' && toId(getFactionRank(user.userid)) !== 'owner') return false;
			if (!factions[toId(getFaction(user.userid))].bans.includes(toId(target))) return this.errorReply(toId(target) + ' is not banned from your faction!');
			factions[toId(getFaction(user.userid))].bans.splice(factions[toId(getFaction(user.userid))].bans.indexOf(toId(target)), 1);
			write();
			return this.sendReply(toId(target) + ' is now unbanned from your faction');
		},

		bank: {
			balance: 'atm',
			bal: 'atm',
			atm: function (target, room, user) {
				if (!this.runBroadcast()) return;
				if (!target) return this.errorReply('/faction bank atm [faction]');
				if (!factions[toId(target)]) return this.errorReply(target + ' is not a faction.');
				let bank = Db.factionbank.get(target, 0);
				return this.sendReplyBox(target + ' has ' + bank + ' in their faction bank.');
			},
			give: function (target, room, user) {
				let targets = target.split(',');
				if (!targets[1]) return this.errorReply('/faction bank give [faction], [amount]');
				let name = toId(targets[0]);
				if (!factions[name]) return this.errorReply(name + ' is not a faction.');
				if (!this.can('declare')) return this.errorReply('You don\'t have permission to do that.');
				let amount = parseInt(targets[1]);
				if (isNaN(amount)) return this.errorReply("That is not a number!");
				Db.factionbank.set(name, Db.factionbank.get(name, 0) + amount);
				return this.sendReply('You have added ' + amount + ' to ' + name + '\'s bank!');
			},
			take: function (target, room, user) {
				let targets = target.split(',');
				if (!targets[1]) return this.errorReply('/faction bank take [faction], [amount');
				let name = toId(targets[0]);
				if (!factions[name]) return this.errorReply(name + ' is not a faction.');
				if (!this.can('declare')) return this.errorReply('You don\'t have permission to do that.');
				let amount = parseInt(targets[1]);
				if (isNaN(amount)) return this.errorReply("That is not a number!");
				Db.factionbank.set(name, Db.factionbank.get(name, 0) - amount);
				return this.sendReply('You have taken ' + amount + ' from ' + name + '\'s bank!');
			},
			ladder: function (target, room, user) {
				if (!target) target = 100;
				target = Number(target);
				if (isNaN(target)) target = 100;
				if (!this.runBroadcast()) return;
				let keys = Db.factionbank.keys().map(name => {
					return {name: name, atm: Db.factionbank.get(name)};
				});
				if (!keys.length) return this.sendReplyBox("Faction atm ladder is empty.");
				keys.sort(function (a, b) { return b.atm - a.atm; });
				this.sendReplyBox(rankLadder('Richest Factions', 'Faction Atm', keys.slice(0, target), 'atm') + '</div>');
			},
			reset: function (target, room, user) {
				if (!this.can('roomowner')) return false;
				let factionId = toId(target);
				if (!factions[factionId]) return this.errorReply(factionId + ' is not a faction!');
				Db.factionbank.remove(factionId);
				return this.sendReply('You have reset ' + factionId + '\'s bank!');
			},
		},
		promote: function (target, room, user) {
			if (!target) return this.errorReply("Usage: /faction promote [user], [rank]");
			let targets = target.split(',');
			for (let u = 0; u < targets; u++) targets[u] = targets[u].trim();

			if (!targets[0]) return this.errorReply("Please specify a user to give a rank.");
			if (!targets[1]) return this.errorReply("Please specify a rank to give the user.");

			let factionid = toId(getFaction(user.userid));
			let targetUser = Users.getExact(targets[0]);
			let rank = targets[1];

			if (!factions[factionid]) return this.errorReply("You're not in a faction.");
			if (!targetUser || !targetUser.connected) return this.errorReply("That user is not online.");
			if (!factions[factionid].users.includes(targetUser.userid)) return this.errorReply("That user is not in your faction.");
			if (!factions[factionid].ranks[toId(rank)]) return this.errorReply("That rank does not exist.");
			if (factions[factionid].ranks[toId(rank)].users.includes(targetUser.userid)) return this.errorReply("That user already has that rank.");

			if (toId(getFactionRank(user.userid)) !== 'owner') return this.errorReply("You don't have permission to change users rank.");

			if (toId(rank) !== 'owner') {
				for (let rank in factions[factionid].ranks) {
					if (rank === 'owner') continue;
					if (factions[factionid].ranks[rank].users.includes(targetUser.userid)) {
						factions[factionid].ranks[rank].users.splice(factions[factionid].ranks[rank].users.indexOf(targetUser.userid), 1);
					}
				}
			}

			factions[factionid].ranks[toId(rank)].users.push(targetUser.userid);
			write();
			rank = factions[factionid].ranks[toId(rank)].title;
			targetUser.send("|popup||html|" + WL.nameColor(user.name) + " has set your faction rank in " + Chat.escapeHTML(factions[factionid].name) + " to " + Chat.escapeHTML(rank) + ".");
			this.sendReply("You've set " + targetUser.name + "'s faction rank to " + rank + ".");
		},
		demote: function (target, room, user) {
			if (!target) return this.errorReply("Usage: /faction demote [user], [rank]");
			let targets = target.split(',');
			for (let u = 0; u < targets; u++) targets[u] = targets[u].trim();

			if (!targets[0]) return this.errorReply("Please specify a user to remove a rank.");
			if (!targets[1]) return this.errorReply("Please specify a rank to remove from the user.");

			let factionid = toId(getFaction(user.userid));
			let targetUser = targets[0];
			let rank = targets[1];

			if (!factions[factionid]) return this.errorReply("You're not in a faction.");
			if (!toId(targetUser) || toId(targetUser).length > 19) return this.errorReply("That's not a valid username.");
			if (!factions[factionid].users.includes(toId(targetUser))) return this.errorReply("That user is not in your faction.");
			if (!factions[factionid].ranks[toId(rank)]) return this.errorReply("That rank does not exist.");
			if (!factions[factionid].ranks[toId(rank)].users.includes(targetUser)) return this.errorReply("That user does not have that rank.");
			if (toId(rank) === 'owner' && toId(targetUser) === user.userid) return this.errorReply("You can't remove owner from yourself. Give another user owner and have them remove it if you're transfering ownership of the faction.");

			if (toId(getFactionRank(user.userid)) !== 'owner') return this.errorReply("You don't have permission to change users rank.");

			let hasOtherRanks;
			for (let r in factions[factionid].ranks) {
				if (r === toId(rank)) continue;
				if (factions[factionid].ranks[r].users.includes(targetUser)) {
					hasOtherRanks = true;
				}
			}
			if (!hasOtherRanks) factions[factionid].ranks['commoner'].users.push(toId(targetUser));
			factions[factionid].ranks[toId(rank)].users.splice(factions[factionid].ranks[toId(rank)].users.indexOf(toId(targetUser)), 1);
			write();
			if (Users(targetUser) && Users(targetUser).connected) {
				Users(targetUser).send("|popup||html|" + WL.nameColor(user.name) + " has removed you from the faction rank " + Chat.escapeHTML(rank) + " in " +
				Chat.escapeHTML(factions[factionid].name) + ".");
			}
			this.sendReply("You've removed " + targetUser + " from the faction rank " + rank + ".");
		},
		pending: function (target, room, user) {
			if (!this.can('declare')) return false;
			let output = '<center><table border="1" cellspacing ="0" cellpadding="3"><tr><td>Faction</td><td>Description</td><td>Approve</td></tr>';
			for (let faction in factions) {
				if (!factions[faction].approved) {
					output += '<tr>';
					output += '<td>' + Chat.escapeHTML(factions[faction].name) + '</td>';
					output += '<td>' + Chat.escapeHTML(factions[faction].desc) + '</td>';
					output += '<td><button name="send" value="/faction approve ' + faction + '">Approve ' + factions[faction].name + '</button></td>';
				}
			}
			output += "</table></center>";
			this.sendReplyBox(output);
		},
		'': 'help',
		help: function (target, room, user) {
			this.parse("/factionhelp");
		},
	},
	factionhelp: [
		"|raw|Faction Help Commands: <br/> " +
		"/faction create (name), (description), (tag[4 char]) - Creates a faction. <br/>" +
		"/faction delete (name)  - Deletes a faction. <br/>" +
		"/faction list - List all factions on the server. <br/>" +
		"/faction privatize - Privatize your faction. <br/>" +
		"/faction profile (faction) - displays a faction's profile. If none specified then defaults to yours. If you are not in one you must specify one. <br/>" +
		"/faction join (name) - Joins a non-private faction. <br/>" +
		"/faction invite (name) - Invite a user to your faction. <br/>" +
		"/faction blockinvites - Block invites from factions. <br/>" +
		"/faction unblockinvites - Unblock invites from factions. <br/>" +
		"/faction accept (faction) - Accept an invite from a faction. <br/>" +
		"/faction decline (faction) - Decline an invite from a faction. <br/>" +
		"/faction leave - Leave a faction. <br/>" +
		"/faction bank atm - Shows a factions bank. <br/>" +
		"/faction bank give faction, amount - Adds to a factions bank. <br/>" +
		"/faction bank take faction, amount - Takes from a factions bank. <br/>" +
		"/faction ban (name) - Ban a user from your faction. <br/>" +
		"/faction unban (name) - Unban a user from your faction. <br/>" +
		"/faction promote (user), (rank) - Promote a user in your faction. <br/>" +
		"/faction demote (user), (rank) - Demote a user in your faction. <br/>" +
		"/faction avatar (image)  - requests a faction avatar for your faction profile. Must be faction owner to use. <br />" +
		"/faction approveavatar (faction), (the requested avatar) - approves a factions avatar.  You must be a global leader or higher to use this! <br />" +
		"/faction denyavatar (faction) - denys a factions avatar.  You must be a global leader or higher to use this! <br />" +
		"/faction pendingavatars - shows pending faction avatars. (<code>/faction pa</code> for short) You must be a global leader or higher to use this! <br />" +
		"/faction pending - displays a list of pending factions waiting for approval. You must be a global leader or higher to use this!"
	],
	fvf: {
		challenge: function (target, room, user) {
			if (!target) return this.errorReply("Usage: /fvf challenge [faction], [mode], [size], [tier]");
			let targets = target.split(',');
			for (let u = 0; u < targets.length; u++) targets[u] = targets[u].trim();

			if (!targets[3]) return this.errorReply("Usage: /fvf challenge [faction], [mode], [size], [tier]");
			if (!getFaction(user.userid)) return this.errorReply("You're not in a faction.");

			let targetFactionid = toId(targets[0]);
			let factionId = toId(getFaction(user.userid));
			if (factionId === targetFactionid) return this.errorReply("You can't challenge your own faction.");
			let mode = "normal";
			let size = Number(targets[2]);
			let tier = toId(targets[3]);
			if (!Dex.getFormat(tier).exists) return this.errorReply('That is not a tier!');
			if (targets[1]) mode = toId(targets[1]);

			if (!factions[targetFactionid]) return this.errorReply("That faction does not exist.");
			if (mode !== "normal" && mode !== "quick") return this.errorReply("That's not a valid mode. Valid modes: normal, quick.");
			if (isNaN(size) || size < 3 || size > 15) return this.errorReply("Please specify a size of at least 3 and no larger than 15");
			if (size % 2 === 0) return this.errorReply("Size must be an odd number.");

			if (Rooms.global.FvF[factionId] && Rooms.global.FvF[factionId].challenging) return this.errorReply("You're already challenging " + factions[Rooms.global.FvF[factionId].challenging].name + ".");
			if (Rooms.global.FvF[factionId] && Rooms.global.FvF[factionId].challenger) return this.errorReply("Your faction is being challenged by " + factions[Rooms.global.FvF[factionId].challenger].name + ". Please accept or deny it before challenging a faction.");
			if (room.fvf) return this.errorReply("There's currently a faction vs faction running in this room.");
			if (!toId(getFactionRank(user.userid)) !== 'noble' && toId(getFactionRank(user.userid)) !== 'owner') return this.errorReply("You don't have permission to start a faction vs faction.");
			if (!user.can('ban', null, room)) return this.errorReply("You don't have permission to start a faction vs faction in that room.");

			let fvfId = WL.randomString(10);

			Rooms.global.FvF[factionId] = {
				challenging: targetFactionid,
				room: room.id,
			};
			Rooms.global.FvF[targetFactionid] = {
				challenger: factionId,
				room: room.id,
			};

			room.fvf = {
				fvfId: fvfId,
				factions: [
					{
						id: factionId,
						name: factions[factionId].name,
						players: [],
						invites: [],
						wins: 0,
					},
					{
						id: targetFactionid,
						name: factions[targetFactionid].name,
						players: [],
						invites: [],
						wins: 0,
						pending: true,
					},
				],
				tier: tier,
				size: size,
				started: false,
				status: [],
				types: {},
				statusNumber: 0,
				accepted: false,
				mode: mode,
			};

			for (let i = 0; i < size.length; i++) room.fvf.status.push((mode === "normal" ? 3 : 2));

			factionPM(
				user.name + ' (' + Chat.escapeHTML(getFaction(user.userid)) + ') has challenged your faction to a Faction vs Faction (' +
				size + 'v' + size + ') in' +
				' <button name="joinRoom" value="' + room.id + '">' + Chat.escapeHTML(room.title) + '</button>.<br />' +
				'<button name="send" value="/fvf accept">Accept</button> | <button name="send" value="/fvf deny">Decline</button>', targetFactionid
			);
			factionPM(
				user.name + ' has challenged ' + Chat.escapeHTML(factions[targetFactionid].name) + ' to a Faction vs Faction (' +
				size + 'v' + size + ') in <button name="joinRoom" value="' + room.id + '">' + Chat.escapeHTML(room.title) + '</button>'
			);
			room.add('|uhtml|fvf-' + fvfId + '|' +
				'<div class="infobox"><center>' + user.name + ' has challenged ' + Chat.escapeHTML(factions[targetFactionid].name) +
				' to a Faction vs Faction. (' + size + 'v' + size + ')<br />Waiting for a response...</center></div>'
			);
		},

		accept: function (target, room, user) {
			if (!getFaction(user.userid)) return this.errorReply("You're not in a faction.");
			if (!toId(getFactionRank(user.userid)) !== 'noble' && toId(getFactionRank(user.userid)) !== 'owner') return this.errorReply("You don't have permission to accept Faction vs Factions.");
			let factionId = toId(getFaction(user.userid));
			if (!Rooms.global.FvF[factionId] || !Rooms.global.FvF[factionId].challenger) return this.errorReply("Your faction doesn't have any pending challenges.");
			let targetFactionid = Rooms.global.FvF[factionId].challenger;
			let targetRoom = Rooms(Rooms.global.FvF[factionId].room);

			targetRoom.fvf.accepted = true;
			fvfDisplay(targetRoom);

			factionPM(user.name + ' has accepted the Faction vs Faction challenge against ' + Chat.escapeHTML(factions[targetFactionid].name), factionId);
			factionPM(user.name + ' (' + factions[factionId].name + ') has accepted the Faction vs Faction challenge against your faction.', targetFactionid);

			this.sendReply("You've accepted the Faction vs Faction against " + factions[targetFactionid].name + ".");
		},

		deny: function (target, room, user) {
			if (!getFaction(user.userid)) return this.errorReply("You're not in a faction.");
			if (!toId(getFactionRank(user.userid)) !== 'noble' && toId(getFactionRank(user.userid)) !== 'owner') return this.errorReply("You don't have permission to deny Faction vs Factions.");
			let factionId = toId(getFaction(user.userid));
			if (!Rooms.global.FvF[factionId] || !Rooms.global.FvF[factionId].challenger) return this.errorReply("Your faction doesn't have any pending challenges.");
			let targetFactionid = Rooms.global.FvF[factionId].challenger;
			let targetRoom = Rooms(Rooms.global.FvF[factionId].room);
			targetRoom.add('|uhtmlchange|fvf-' + targetRoom.fvf.fvfId + '|');
			targetRoom.add('|uhtml|fvf-' + targetRoom.fvf.fvfId + '|' +
				'<div class="infobox">(' + Chat.escapeHTML(factions[factionId].name) + ' has declined the Faction vs Faction challenge.)</div>'
			);

			factionPM(user.name + ' has declined the Faction vs Faction challenge against ' + Chat.escapeHTML(factions[targetFactionid].name), factionId);
			factionPM(user.name + ' (' + factions[factionId].name + ') has declined the Faction vs Faction challenge against your faction.', targetFactionid);

			delete Rooms.global.FvF[targetFactionid];
			delete Rooms.global.FvF[factionId];
			delete targetRoom.fvf;
			this.sendReply("You've declined the Faction vs Faction against " + factions[targetFactionid].name + ".");
		},

		invite: function (target, room, user) {
			if (!target) return this.errorReply("Usage: /fvf invite [user] - Invites a faction member to the join a Faction vs Faction.");
			if (!getFaction(user.userid)) return this.errorReply("You're not in a faction.");
			if (!toId(getFactionRank(user.userid)) !== 'noble' && toId(getFactionRank(user.userid)) !== 'owner') return this.errorReply("You don't have permission to invite users to join a Faction vs Faction.");

			let factionId = toId(getFaction(user.userid));
			let targetUser = Users(target);
			let targetUserFaction = getFaction(target);

			if (!Rooms.global.FvF[factionId]) return this.errorReply("Your faction is not in a Faction vs Faction.");
			if (!targetUser || !targetUser.connected) return this.errorReply("That user is not online.");
			let targetRoom = Rooms(Rooms.global.FvF[factionId].room);
			let faction = targetRoom.fvf.factions[0];
			let targetFaction = targetRoom.fvf.factions[1];
			if (targetRoom.fvf.factions[1].id === factionId) {
				faction = targetRoom.fvf.factions[1];
				targetFaction = targetRoom.fvf.factions[0];
			}
			if (!targetUserFaction || toId(targetUserFaction) !== factionId);
			if (faction.players.includes(targetUser.userid)) return this.errorReply("That user has already joined this Faction vs Faction.");
			if (faction.invites.includes(targetUser.userid)) return this.errorReply("That user has already been invited to join the Faction vs Faction.");

			faction.invites.push(targetUser.userid);
			factionPM(user.name + " has invited " + targetUser.name + " to join the Faction vs Faction against " + Chat.escapeHTML(factions[targetFaction.id].name), factionId);
			targetUser.send("|popup||modal||html|" + user.name + " has invited you to join the Faction vs Faction against " + Chat.escapeHTML(factions[targetFaction.id].name) +
				" in the room <button name=\"joinRoom\" value=\"" + targetRoom.id + "\">" + Chat.escapeHTML(targetRoom.title) + "</button>");
			this.sendReply("You've invited " + targetUser.name + " to join the Faction vs Faction.");
		},

		join: function (target, room, user) {
			if (!room.fvf) return this.errorReply("There's no Faction vs Faction in this room.");
			if (!getFaction(user.userid)) return this.errorReply("You're not in a faction.");
			if (!room.fvf.accepted) return this.errorReply("This Faction vs Faction hasn't been accepted yet.");

			let factionId = toId(getFaction(user.userid));
			if (room.fvf.factions[0].id !== factionId && room.fvf.factions[1].id !== factionId) return this.errorReply("Your faction is not apart of this Faction vs Faction.");

			let faction = room.fvf.factions[0];

			if (room.fvf.factions[1].id === factionId) faction = room.fvf.factions[1];

			if (!faction.invites.includes(user.userid)) return this.errorReply("You haven't been invited to join this Faction vs Faction.");
			if (faction.players.length >= room.fvf.size) return this.errorReply("Your factions team is already full.");
			if (faction.players.includes(user.userid)) return this.errorReply("You've already joined this Faction vs Faction.");

			faction.players.push(user.userid);
			room.add(user.name + " has joined the Faction vs Faction for " + getFaction(user.userid));
			fvfDisplay(room);
		},

		leave: function (target, room, user) {
			if (!room.fvf) return this.errorReply("There's no Faction vs Faction in this room.");
			if (!getFaction(user.userid)) return this.errorReply("You're not in a faction.");
			if (!room.fvf.accepted) return this.errorReply("This Faction vs Faction hasn't been accepted yet.");

			let factionId = toId(getFaction(user.userid));
			if (room.fvf.factions[0].id !== factionId && room.fvf.factions[0].id !== factionId) return this.errorReply("Your faction is not apart of this Faction vs Faction.");

			let faction = room.fvf.factions[0];

			if (room.fvf.factions[1].id === factionId) faction = room.fvf.factions[1];
			if (!faction.players.includes(user.userid)) return this.errorReply("You haven't joined this Faction vs Faction.");
			if (room.fvf.started) return this.errorReply("You can't leave a Faction vs Faction after it starts.");

			faction.players.splice(faction.players.indexOf(user.userid), 1);
			room.add(user.name + " has left the Faction vs Faction.");
			fvfDisplay(room);
		},

		end: function (target, room, user) {
			if (!target) return this.errorReply("Usage: /fvf end [room]");
			if (!getFaction(user.userid)) return this.errorReply("You're not in a faction.");

			if (!toId(getFactionRank(user.userid)) !== 'noble' && toId(getFactionRank(user.userid)) !== 'owner') return this.errorReply("You don't have permission to end Faction vs Factions.");

			let targetRoom = Rooms(toId(target));
			if (!targetRoom) return this.errorReply("That room does not exist.");
			if (!targetRoom.fvf) return this.errorReply("There's no Faction vs Faction in that room.");

			let factionId = toId(getFaction(user.userid));
			if (targetRoom.fvf.factions[0].id !== factionId && targetRoom.fvf.factions[1].id !== factionId) return this.errorReply("Your faction is not apart of this Faction vs Faction.");

			let targetFactionid = room.fvf.factions[0].id;
			if (targetRoom.fvf.factions[1].id !== factionId) targetFactionid = targetRoom.fvf.factions[1].id;

			targetRoom.add('|uhtmlchange|fvf-' + targetRoom.fvf.fvfId + '|');
			targetRoom.add('|uhtml|fvf-' + targetRoom.fvf.fvfId + '|(The Faction vs Faction has been forcibly ended by ' + Chat.escapeHTML(user.name) + ' (' + Chat.escapeHTML(factions[factionId].name) + '))');

			factionPM(user.name + ' has forcibly ended the Faction vs Faction with ' + Chat.escapeHTML(factions[targetFactionid].name) + '.', factionId);

			delete Rooms.global.FvF[targetFactionid];
			delete Rooms.global.FvF[factionId];
			delete targetRoom.fvf;
		},
		'': 'help',
		help: function (target, room, user) {
			this.parse("/fvfhelp");
		},
	},
	fvfhelp: [
		"|raw|Faction vs Faction Commands:<br />" +
		"/fvf challenge [faction], [mode (normal or quick)], [size (must be odd number)], [tier] - Challenges a faction to a Faction vs Faction in the current room.<br />" +
		"(Quick mode lets players battle each other at the same time, normal mode limits it to one battle at a time.)<br />" +
		"/fvf accept - Accepts a challenge from a faction.<br />" +
		"/fvf deny - Denies a challenge from a faction.<br />" +
		"/fvf invite [user] - Invites a faction member to join the Faction vs Faction.<br />" +
		"/fvf join - Joins a Faction vs Faction. Must be invited with /fvf invite first.<br />" +
		"/fvf leave - Leaves a Faction vs Faction after you join. May not be used once the Faction vs Faction starts.<br />" +
		"/fvf end - Forcibly ends a Faction vs Faction.",
	],
};
