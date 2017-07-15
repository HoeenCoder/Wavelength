/**
 * Room Request System
 *
 * Programmed by HoeenHero for SpacialGaze
 * @license MIT license
 */
"use strict";

const COOLDOWN = 1209600000; // 2 weeks
let allowRequests = true;

exports.commands = {
	confirmrequestroom: 'requestroom',
	rr: 'requestroom',
	requestroom: function (target, room, user, connection, cmd) {
		if (!user.named) return this.errorReply(`Please choose a name before requesting a room`);
		if (!user.registered) return this.errorReply(`Unregistered names cannot be promoted, so they cannot request rooms.`);
		if (!user.autoconfirmed) return this.errorReply(`You must be autoconfirmed to request a room.`);
		if (!allowRequests) return this.errorReply(`Room requests are currently closed.`);
		let curRequest = Db.rooms.get(user.userid, null);
		if (curRequest) {
			if (curRequest.blacklist) return this.errorReply(`You are banned from requesting rooms.`);
			if (curRequest.cooldown && Date.now() - curRequest.cooldown < COOLDOWN) {
				return this.errorReply(`You cannot request another room for another ${Chat.toDurationString(COOLDOWN - (Date.now() - curRequest.cooldown))}.`);
			} else if (curRequest.cooldown) {
				curRequest = null;
			}
			if (curRequest) return this.parse('/checkroomrequest');
		}
		target = target.split(',');
		if (target.length < 3) return this.parse('/help requestroom');
		if (['public', 'private'].indexOf(toId(target[1])) === -1) return this.errorReply(`Valid room types are public and private.`);
		let desc = '';
		for (let i = 2; i < target.length; i++) {
			desc += target[i] + (i === target.length - 1 ? "" : ",");
		}
		curRequest = {
			name: Chat.escapeHTML(target[0].trim()),
			type: toId(target[1]),
			desc: Chat.escapeHTML(desc),
			trusted: user.trusted,
			staff: user.isStaff,
			status: "pending",
		};
		if (cmd !== 'confirmrequestroom') {
			return this.sendReplyBox(`<center><h3>Please confirm your room request</h3><br/><b>Room Name</b>: ${curRequest.name}<br/><b>Room Type</b>: ${curRequest.type}<br/><b>Description</b>:${curRequest.desc}<br/><button name="send" value="/confirmrequestroom ${curRequest.name}, ${curRequest.type}, ${curRequest.desc}" class="button">Yes, this is correct</button><button class="button" name="receive" value="|c|~SG Server|Request the room again, but with the changes you want to make to it.">No, I want to change something</button></center>`);
		}
		Db.rooms.set(user.userid, curRequest);
		SG.messageSeniorStaff(`/html ${user.name} has requested a room. <button class="button" name="send" value="/checkroomrequest ${user.userid}">Check request</button>`);
		return this.sendReply('Your room request has been sent to Upper Staff.');
	},
	requestroomhelp: ["/requestroom [name], [public|private], [why this room should be created] - Sends a room creation request to the Upper Staff. You cannot request another room for 2 weeks after your request is completed. Upper staff will most likely contact you for further information before the room is created. We reserve the right to reject any requests."],
	checkroomrequest: function (target, room, user) {
		target = toId(target);
		if (!target) target = user.userid;
		if (!user.can('roomowner') && user.userid !== target) return this.errorReply(`/checkroomrequest -  Access Denied for viewing requests for other users.`);
		let curRequest = Db.rooms.get(target);
		if (!curRequest || curRequest.blacklisted) return this.errorReply(`${(target === user.userid ? "You don't " : target + " does not ")} have a pending room request.`);
		let output = `<center><h1>Spacialgaze Room Request</h1></center><b>Requester</b>: ${target} <br/><b>Room Name</b>: ${curRequest.name}<br/><b>Room Type</b>: ${curRequest.type}<br/><b>Description</b>: ${curRequest.desc}<br/>`;
		if (user.can('roomowner')) output += `${(curRequest.staff ? `The requester is a Spacial Gaze global staff member` : (curRequest.trusted ? `The requester is a trusted user.` : ``))}`;
		this.sendReplyBox(output);
	},
	checkroomrequesthelp: ["/checkroomrequest (username) - Check a users current room request. leave username blank to default to your request. Requires: &, ~ if username is not your username."],
	roomrequests: function (target, room, user) {
		if (!this.can('roomowner')) return;
		target = target.split(',');
		let req = null;
		switch (toId(target[0])) {
		case '':
		case 'view':
			let requests = Db.rooms.keys();
			let output = `<div class="infobox infobox-limited"><table><tr><th style="border: 1px solid" colspan="6"><b>Spacial Gaze Room Requests</b></th></tr><tr><th style="border: 1px solid">Requester</th><th style="border: 1px solid">Room Name</th><th style="border: 1px solid">Room Type</th><th style="border: 1px solid">Description</th><th style="border: 1px solid">Status</th><th style="border: 1px solid">Options</th></tr>`;
			for (let i = 0; i < requests.length; i++) {
				let cur = Db.rooms.get(requests[i]);
				if (cur.blacklisted) {
					output += `<tr><td style="border: 1px solid">${requests[i]}</td><td style="border: 1px solid; background-color: #ff4d4d; color: black" colspan="5"><center>Blacklisted from owning rooms.</center></td></tr>`;
					continue;
				}
				output += `<tr><td style="border: 1px solid">${requests[i]}</td><td style="border: 1px solid">${cur.name}</td><td style="border: 1px solid">${cur.type}</td><td style="border: 1px solid">${cur.desc}</td><td style="border: 1px solid">${cur.status}</td>`;
				if (cur.status === 'pending') {
					output += `<td style="border: 1px solid"><button class="button" name="send" value="/roomrequests accept, ${requests[i]}">Accept</button><button class="button" name="send" value="/roomrequests reject, ${requests[i]}">Reject</button></td></tr>`;
				} else {
					output += `<td style="border: 1px solid">${cur.status} by ${cur.by}</td></tr>`;
				}
			}
			output += `</table></div>`;
			return user.sendTo(room, `|html|${output}`);
			//break;
		case 'accept':
			if (!target[1]) return this.parse('/help roomrequests');
			req = Db.rooms.get(toId(target[1]));
			if (!req) return this.errorReply(`${target[1]} does not have a room request.`);
			if (req.blacklisted) return this.errorReply(`${target[1]} is banned from owning rooms.`);
			if (req.status !== 'pending') return this.errorReply(`${target[1]}'s current request has already been ${req.status}.`);
			req.status = 'accepted';
			req.by = user.userid;
			req.cooldown = Date.now();
			Db.rooms.set(toId(target[1]), req);
			this.parse(`/${(req.type === 'public' ? `makechatroom` : `makeprivatechatroom`)} ${req.name}`);
			user.popup(`|html|<center>You accepted the room request from ${target[1]}.<br/>The Room "${req.name}" was created, make sure to appoint ${target[1]} room founder!</center>`);
			return this.parse(`/join ${req.name}`);
			//break;
		case 'reject':
			if (!target[1]) return this.parse('/help roomrequests');
			req = Db.rooms.get(toId(target[1]));
			if (!req) return this.errorReply(`${target[1]} does not have a room request.`);
			if (req.blacklisted) return this.errorReply(`${target[1]} is banned from owning rooms.`);
			if (req.status !== 'pending') return this.errorReply(`${target[1]}'s current request has already been ${req.status}.`);
			req.status = 'rejected';
			req.by = user.userid;
			req.cooldown = Date.now();
			Db.rooms.set(toId(target[1]), req);
			return this.sendReply(`You rejected the room request from ${target[1]}`);
			//break;
		case 'delete':
			if (!target[1]) return this.parse('/help roomrequests');
			req = Db.rooms.get(toId(target[1]));
			if (!req) return this.errorReply(`${target[1]} does not have a room request.`);
			if (req.blacklisted) return this.errorReply(`${target[1]} is banned from owning rooms. If you want to undo the blacklist do /roomrequests unblacklist, ${target[1]}`);
			Db.rooms.remove(toId(target[1]));
			return this.sendReply(`You deleted the room request from ${target[1]}`);
			//break;
		case 'modify':
			if (!target[3]) return this.parse('/help roomrequests');
			req = Db.rooms.get(toId(target[1]));
			if (!req) return this.errorReply(`${target[1]} does not have a room request.`);
			if (req.blacklisted) return this.errorReply(`${target[1]} is banned from owning rooms.`);
			if (req.status !== 'pending') return this.errorReply(`${target[1]}'s current request has already been ${req.status}.`);
			target[2] = toId(target[2]);
			if (target[2] === 'name') {
				req.name = Chat.escapeHTML(target[3].trim());
				Db.rooms.set(toId(target[1]), req);
				return this.sendReply(`The room name of ${target[1]}'s request has been changed to: ${req.name}`);
			} else if (target[2] === 'type') {
				if (['public', 'private'].indexOf(toId(target[3])) === -1) return this.errorReply(`Room types can be public or private`);
				if (req.type === toId(target[3])) return this.errorReply(`The room type of ${target[1]}'s request is already ${req.type}`);
				req.type = toId(target[3]);
				Db.rooms.set(toId(target[1]), req);
				return this.sendReply(`The room type of ${target[1]}'s request has been changed to: ${req.type}`);
			} else {
				return this.errorReply(`/roomrequests modify, [request], [name|type], [new name || public|private]`);
			}
			//break;
		case 'blacklist':
			if (!target[1]) return this.parse('/help roomrequests');
			target[1] = toId(target[1]);
			let targetUser = Users(target[1]);
			req = Db.rooms.get(target[1]);
			if (req && req.blacklisted) return this.errorReply(`${target[1]} is already banned from owning rooms.`);
			Db.rooms.set(target[1], {blacklisted: true, by: user.userid, reason: (target[2] || undefined)});
			let demoted = [];
			Rooms.rooms.forEach((curRoom, id) => {
				if (!curRoom.auth || !curRoom.auth[target[1]]) return;
				if (curRoom.founder === target[1]) {
					curRoom.founder = false;
					curRoom.chatRoomData.founder = false;
				}
				if (curRoom.auth[target[1]] === '#') {
					curRoom.auth[target[1]] = '@';
					demoted.push(curRoom.id);
					if (targetUser) curRoom.onUpdateIdentity(targetUser);
				}
			});
			if (demoted.length) Rooms.global.writeChatRoomData();
			if (targetUser) targetUser.popup(`|html|<center>${user.name} has banned you from owning rooms. (${(target[2] ? `(${target[2].trim()})` : ``)})<br/>You have been automatcally demoted from room owner in all rooms you had it in (if any).<br/>To appeal your room ownership blacklist, PM a & or ~.</center>`);
			if (Rooms('upperstaff')) Monitor.adminlog(`${target[1]} was banned from owning rooms by ${user.name} ${(demoted.length ? `and demoted from # in ${demoted.join(', ')}` : ``)}. ${(target[2] ? `(${target[2].trim()})` : ``)}`);
			if (targetUser && targetUser.trusted) Monitor.log("[CrisisMonitor] Trusted user " + targetUser.name + (targetUser.trusted !== targetUser.userid ? " (" + targetUser.trusted + ")" : "") + " was banned from owning rooms by " + user.name + ", and should probably be demoted.");
			this.globalModlog("ROOMOWNERBAN", (targetUser || target[1]), " by " + user.name + (target[2] ? ": " + target[2] : ""));
			return this.sendReply(`${target[1]} was banned from owning rooms.`);
			//break;
		case 'unblacklist':
			if (!target[1]) return this.parse('/help roomrequests');
			target[1] = toId(target[1]);
			req = Db.rooms.get(target[1]);
			if (!req || !req.blacklisted) return this.errorReply(`${target[1]} is not banned from owning rooms.`);
			Db.rooms.remove(target[1]);
			if (Rooms('upperstaff')) Monitor.adminlog(`${target[1]} was unbanned from owning rooms by ${user.name}.`);
			this.globalModlog("UNROOMOWNERBAN", target[1], " by " + user.name);
			return this.sendReply(`${target[1]} is no longer banned from owning rooms.`);
			//break;
		case 'viewblacklist':
			if (target[1]) {
				target[1] = toId(target[1]);
				req = Db.rooms.get(target[1]);
				if (!req || !req.blacklisted) return this.errorReply(`${target[1]} is not banned from owning rooms.`);
				return this.sendReply(`ROOMOWNERBAN by ${req.by} ${(req.reason ? `(${req.reason})` : ``)}.`);
			}
			let list = [];
			let keys = Db.rooms.keys();
			for (let key = 0; key < keys.length; key++) {
				if (Db.rooms.get(keys[key]).blacklisted) list.push(keys[key]);
			}
			if (!list.length) return this.sendReply('No users are banned from owning rooms.');
			return this.sendReply(`The following ${list.length} users are banned from owning rooms: ${list.join(', ')}.`);
			//break;
		case 'open':
			if (allowRequests) return this.errorReply(`Room Requests are already open.`);
			allowRequests = true;
			Monitor.adminlog(`${user.name} opened room requests`);
			return this.sendReply(`Room Requests are now open.`);
			//break;
		case 'close':
			if (!allowRequests) return this.errorReply(`Room Requests are already closed.`);
			allowRequests = false;
			Monitor.adminlog(`${user.name} closed room requests`);
			return this.sendReply(`Room Requests are now closed.`);
			//break;
		default:
			return this.parse('/help roomrequests');
		}
	},
	roomrequestshelp: ["/roomrequests - Manage room requests. Requires &, ~. Accepts the following arguments:",
			   "/roomrequests view - View and manage all current room requests",
			   "/roomrequests accept, [requester] - Accepts a room request and creates the room.",
			   "/roomrequests reject, [requester] - Rejects a room request.",
			   "/roomrequests modify, [requester], [name|type], [new name || public|private] - Modify a room requests name or type.",
			   "/roomrequests delete, [requester] - Deletes a room request, deleting a room request will not cause a cooldown period before the user can send another request.",
			   "/roomrequests blacklist [user], (reason) - Bans a user from owning or requesting rooms. They will be automatically de-roomownered server wide as well.",
			   "/roomrequests unblacklist [user] - Allow a user to request rooms and be a roomowner again.",
			   "/roomrequests viewblacklist (user) - View the roomowner blacklist. If the user argument is provided, check to see if the user is roomowner banned.",
			   "/roomrequests [open|close] - Opens or closes room requests."],
};
