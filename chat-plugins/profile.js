/**
 * profile.js
 * Displays to users a profile of a given user.
 * For order's sake:
 * - vip, dev, customtitle, friendcode, and profie were placed in here.
 * Updated and restyled by Mystifi; main profile restyle goes out to panpawn/jd/other contributors.
 **/
'use strict';
//TODO reimplement geoip-ultralight

//let fs = require('fs');
let moment = require('moment');
//let geoip = require('geoip-ultralight');

// fill in '' with the server IP
let serverIp = Config.serverIp;
//geoip.startWatchingDataUpdate();

global.isVIP = function (user) {
	if (!user) return;
	if (typeof user === 'object') user = user.userid;
	let vip = Db('vips').get(toId(user));
	if (vip === 1) return true;
	return false;
};

global.isDev = function (user) {
	if (!user) return;
	if (typeof user === 'object') user = user.userid;
	let dev = Db('devs').get(toId(user));
	if (dev === 1) return true;
	return false;
};

function formatTitle(user) {
	if (Db('customtitles').has(toId(user)) && Db('titlecolors').has(toId(user))) {
		return '<font color="' + Db('titlecolors').get(toId(user)) +
			'">(<b>' + Db('customtitles').get(toId(user)) + '</b>)</font>';
	}
	return '';
}

function titleCheck(user) {
	if (Db('customtitles').has(toId(user)) && Db('titlecolors').has(toId(user))) {
		return formatTitle(user);
	}
	return '';
}

function devCheck(user) {
	if (isDev(user)) return '<font color="#009320">(<b>Developer</b>)</font>';
	return '';
}

function vipCheck(user) {
	if (isVIP(user)) return '<font color="#6390F0">(<b>VIP User</b>)</font>';
	return '';
}

function showBadges(user) {
	if (Db('userBadges').has(toId(user))) {
		return '<button style="border-radius: 5px; background-color: transparent; color: #24678d;' +
			' font-size: 11px;" name="send" value="/badges user, ' + toId(user) + '">Badges</button>';
	}
	return '';
}

function getLeague(userid) {
	return false; //TEMPORARY
	//return SG.getLeague(userid);
}

function getLeagueRank(userid) {
	return 'N/A';
}

/*function loadRegdateCache() {
	try {
		regdateCache = JSON.parse(fs.readFileSync('config/regdate.json', 'utf8'));
	} catch (e) {}
}
loadRegdateCache();
function saveRegdateCache() {
	fs.writeFileSync('config/regdate.json', JSON.stringify(regdateCache));
}*/

exports.commands = {
	vip: {
		give: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse('/help', true);
			let vipUsername = toId(target);
			if (vipUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (isVIP(vipUsername)) return this.errorReply(vipUsername + " is already a VIP user.");
			Db('vips').set(vipUsername, 1);
			this.sendReply(vipUsername + " has been given VIP status.");
			if (Users.get(vipUsername)) Users(vipUsername).popup("You have been given VIP status by " + user.name + ".");
		},
		take: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse('/help', true);
			let vipUsername = toId(target);
			if (vipUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (!isVIP(vipUsername)) return this.errorReply(vipUsername + " isn't a VIP user.");
			Db('vips').delete(vipUsername);
			this.sendReply(vipUsername + " has been demoted from VIP status.");
			if (Users.get(vipUsername)) Users(vipUsername).popup("You have been demoted from VIP status by " + user.name + ".");
		},
		'': 'help',
		help: function (target, room, user) {
			this.sendReplyBox(
				'<div style="padding: 3px 5px;"><center>' +
				'<code>/vip</code> commands.<br />These commands are nestled under the namespace <code>vip</code>.</center>' +
				'<hr width="100%">' +
				'<code>give [username]</code>: Gives <code>username</code> VIP status. Requires: & ~' +
				'<br />' +
				'<code>take [username]</code>: Takes <code>username</code>\'s VIP status. Requires: & ~' +
				'</div>'
			);
		},
	},
	dev: {
		give: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse('/help', true);
			let devUsername = toId(target);
			if (devUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (isDev(devUsername)) return this.errorReply(devUsername + " is already a DEV user.");
			Db('devs').set(devUsername, 1);
			this.sendReply(devUsername + " has been given DEV status.");
			if (Users.get(devUsername)) Users(devUsername).popup("You have been given DEV status by " + user.name + ".");
		},
		take: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse('/help', true);
			let devUsername = toId(target);
			if (devUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (!isDev(devUsername)) return this.errorReply(devUsername + " isn't a DEV user.");
			Db('devs').delete(devUsername);
			this.sendReply(devUsername + " has been demoted from DEV status.");
			if (Users.get(devUsername)) Users(devUsername).popup("You have been demoted from DEV status by " + user.name + ".");
		},
		'': 'help',
		help: function (target, room, user) {
			this.sendReplyBox(
				'<div style="padding: 3px 5px;"><center>' +
				'<code>/dev</code> commands.<br />These commands are nestled under the namespace <code>dev</code>.</center>' +
				'<hr width="100%">' +
				'<code>give [username]</code>: Gives <code>username</code> DEV status. Requires: & ~' +
				'<br />' +
				'<code>take [username]</code>: Takes <code>username</code>\'s DEV status. Requires: & ~' +
				'</div>'
			);
		},
	},
	title: 'customtitle',
	customtitle: {
		set: 'give',
		give: function (target, room, user) {
			if (!this.can('declare')) return false;
			target = target.split(',');
			if (!target || target.length < 3) return this.parse('/help', true);
			let userid = toId(target[0]);
			let targetUser = Users.getExact(userid);
			let title = target[1].trim();
			if (Db('customtitles').has(userid) && Db('titlecolors').has(userid)) {
				return this.errorReply(userid + " already has a custom title.");
			}
			let color = target[2].trim();
			if (color.charAt(0) !== '#') return this.errorReply("The color needs to be a hex starting with '#'.");
			Db('titlecolors').set(userid, color);
			Db('customtitles').set(userid, title);
			if (Users.get(targetUser)) {
				Users(targetUser).popup(
					'|html|You have recieved a custom title from ' + SG.nameColor(user.name, true) + '.' +
					'<br />Title: ' + formatTitle(toId(targetUser)) +
					'<br />Title Hex Color: ' + Db('titlecolors').get(toId(targetUser))
				);
			}
			this.logModCommand(user.name + " set a custom title to " + userid + "'s profile.");
			return this.sendReply("Title '" + title + "' and color '" + color + "' for " + userid + "'s custom title have been set.");
		},
		take: 'remove',
		remove: function (target, room, user) {
			if (!this.can('declare')) return false;
			if (!target) return this.parse('/help', true);
			let userid = toId(target);
			if (!Db('customtitles').has(userid) && !Db('titlecolors').has(userid)) {
				return this.errorReply(userid + " does not have a custom title set.");
			}
			Db('titlecolors').delete(userid);
			Db('customtitles').delete(userid);
			if (Users.get(userid)) {
				Users(userid).popup(
					'|html|' + SG.nameColor(user.name, true) + " has removed your custom title."
				);
			}
			this.logModCommand(user.name + " removed " + userid + "'s custom title.");
			return this.sendReply(userid + "'s custom title and title color were removed from the server memory.");
		},
		'': 'help',
		help: function (target, room, user) {
			if (!user.autoconfirmed) return this.errorReply("You need to be autoconfirmed to use this command.");
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			if (!this.runBroadcast()) return;
			return this.sendReplyBox(
				'<center><code>/customtitle</code> commands<br />' +
				'All commands are nestled under the namespace <code>customtitle</code>.</center>' +
				'<hr width="100%">' +
				'- <code>[set|give] [username], [title], [hex color]</code>: Sets a user\'s custom title. Requires: & ~' +
				'- <code>[take|remove] [username]</code>: Removes a user\'s custom title and erases it from the server. Requires: & ~'
			);
		},
	},
	fc: 'friendcode',
	friendcode: {
		add: 'set',
		set: function (target, room, user) {
			if (room.battle) return this.errorReply("Please use this command outside of battle rooms.");
			if (!user.autoconfirmed) return this.errorReply("You must be autoconfirmed to use this command.");
			if (!target) return this.parse('/help', true);
			let fc = target;
			fc = fc.replace(/-/g, '');
			fc = fc.replace(/ /g, '');
			if (isNaN(fc)) {
				return this.errorReply("Your friend code needs to contain only numerical characters.");
			}
			if (fc.length < 12) return this.errorReply("Your friend code needs to be 12 digits long.");
			fc = fc.slice(0, 4) + '-' + fc.slice(4, 8) + '-' + fc.slice(8, 12);
			Db('friendcodes').set(toId(user), fc);
			return this.sendReply("Your friend code: " + fc + " has been saved to the server.");
		},
		remove: 'delete',
		delete: function (target, room, user) {
			if (room.battle) return this.errorReply("Please use this command outside of battle rooms.");
			if (!user.autoconfirmed) return this.errorReply("You must be autoconfirmed to use this command.");
			if (!target) {
				if (!Db('friendcodes').has(toId(user))) return this.errorReply("Your friend code isn't set.");
				Db('friendcodes').delete(toId(user));
				return this.sendReply("Your friend code has been deleted from the server.");
			} else {
				if (!this.can('lock')) return false;
				let userid = toId(target);
				if (!Db('friendcodes').has(userid)) return this.errorReply(userid + " hasn't set a friend code.");
				Db('friendcodes').delete(userid);
				return this.sendReply(userid + "'s friend code has been deleted from the server.");
			}
		},
		'': 'help',
		help: function (target, room, user) {
			if (room.battle) return this.errorReply("Please use this command outside of battle rooms.");
			if (!user.autoconfirmed) return this.errorReply("You must be autoconfirmed to use this command.");
			return this.sendReplyBox(
				'<center><code>/friendcode</code> commands<br />' +
				'All commands are nestled under the namespace <code>friendcode</code>.</center>' +
				'<hr width="100%">' +
				'<code>[add|set] [code]</code>: Sets your friend code. Must be in the format 111111111111, 1111 1111 1111, or 1111-1111-1111.' +
				'<br />' +
				'<code>[remove|delete]</code>: Removes your friend code. Global staff can include <code>[username]</code> to delete a user\'s friend code.' +
				'<br />' +
				'<code>help</code>: Displays this help command.'
			);
		},
	},
	profile: function (target, room, user) {
		target = toId(target);
		if (!target) target = user.name;
		if (target.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
		if (!this.runBroadcast()) return;
		let self = this;
		let targetUser = Users.get(target);
		let username = (targetUser ? targetUser.name : target);
		let userid = (targetUser ? targetUser.userid : toId(target));
		let avatar = (targetUser ? (isNaN(targetUser.avatar) ? "http://" + serverIp + ":" + Config.port + "/avatars/" + targetUser.avatar : "http://play.pokemonshowdown.com/sprites/trainers/" + targetUser.avatar + ".png") : (Config.customavatars[userid] ? "http://" + serverIp + ":" + Config.port + "/avatars/" + Config.customavatars[userid] : "http://play.pokemonshowdown.com/sprites/trainers/1.png"));
		if (targetUser && targetUser.avatar[0] === '#') avatar = 'http://play.pokemonshowdown.com/sprites/trainers/' + targetUser.avatar.substr(1) + '.png';
		let userSymbol = (Users.usergroups[userid] ? Users.usergroups[userid].substr(0, 1) : "Regular User");
		let userGroup = (Config.groups[userSymbol] ? 'Global ' + Config.groups[userSymbol].name : "Regular User");
		let regdate = '(Unregistered)';
		SG.regdate(userid, date => {
			if (date) {
				regdate = moment(date).format("MMMM DD, YYYY");
			}
			showProfile();
		});

		function getFlag(flagee) {
			return false;
			/*if (!Users(flagee)) return false;
			let geo = geoip.lookupCountry(Users(flagee).latestIp);
			return (Users(flagee) && geo ? '<img src="https://github.com/kevogod/cachechu/blob/master/flags/' + geo.toLowerCase() + '.png?raw=true" height=10 title="' + geo + '">' : false);
			*/
		}

		function getLastSeen(useid) {
			if (Users(userid) && Users(userid).connected) return '<font color = green><strong>Currently Online</strong>';
			let seen = Db('seen').get(userid);
			if (!seen) return false;
			return moment(seen).fromNow();
		}

		function showProfile() {
			Economy.readMoney(toId(username), currency => {
				let profile = '';
				profile += '<img src="' + avatar + '" height="80" width="80" align="left">';
				if (!getFlag(toId(username))) {
					profile += '&nbsp;<font color="#24678d"><b>Name:</b></font> ' + SG.nameColor(username, true) + ' ' + titleCheck(username) + '<br />';
				} else {
					profile += '&nbsp;<font color="#24678d"><b>Name:</b></font> ' + SG.nameColor(username, true) + '&nbsp;' + getFlag(toId(username)) + ' ' + titleCheck(username) + '<br />';
				}
				profile += '&nbsp;<font color="#24678d"><b>Group:</b></font> ' + userGroup + ' ' + devCheck(username) + vipCheck(username) + ' ' + showBadges(toId(username)) + '<br />';
				profile += '&nbsp;<font color="#24678d"><b>Registered:</b></font> ' + regdate + '<br />';
				profile += '&nbsp;<font color="#24678d"><b>' + global.currencyPlural + ':</b></font> ' + currency + '<br />';
				profile += '&nbsp;<font color="#24678d"><b>League:</b></font> ' + (getLeague(toId(username)) ? (getLeague(toId(username)) + ' (' + getLeagueRank(toId(username)) + ')') : 'N/A') + '<br />';
				if (getLastSeen(toId(username))) {
					profile += '&nbsp;<font color="#24678d"><b>Last Seen:</b></font> ' + getLastSeen(toId(username)) + '</font><br />';
				} else {
					profile += '&nbsp;<font color="#24678d"><b>Last Seen:</b></font> <font color = red><strong>Never</strong></font><br />';
				}
				if (Db('friendcodes').has(toId(username))) {
					profile += '&nbsp;<div style="display:inline-block;height:5px;width:80px;"></div><font color="#24678d"><b>Friend Code:</b></font> ' + Db('friendcodes').get(toId(username));
				}
				profile += '<br clear="all">';
				self.sendReplyBox(profile);
				room.update();
			});
		}
	},
};
