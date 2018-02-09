/****************************************************************************
 * Profiles for Pokemon Showdown															 *
 * Displays to users a profile of a given user.										 *
 * For order's sake:														 					 *
 * - vip, dev, custom title, friend code, and profile were placed in here.	 *
 * Updated and restyled by Mystifi and Insist										 *
 * Main Profile credit goes out to panpawn/jd/other contributors.				 *
 ****************************************************************************/

'use strict';

let geoip = require('geoip-lite-country');

// fill your server's IP in your config.js for exports.serverIp
const serverIp = Config.serverIp;

function isDev(user) {
	if (!user) return;
	if (typeof user === 'object') user = user.userid;
	let dev = Db.devs.get(toId(user));
	if (dev === 1) return true;
	return false;
}

function isVIP(user) {
	if (!user) return;
	if (typeof user === 'object') user = user.userid;
	let vip = Db.vips.get(toId(user));
	if (vip === 1) return true;
	return false;
}

function isTsuMetaCouncil(user) {
	if (!user) return;
	if (typeof user === 'object') user = user.userid;
	let council = Db.councilmember.get(toId(user));
	if (council === 1) return true;
	return false;
}

function showTitle(userid) {
	userid = toId(userid);
	if (Db.customtitles.has(userid)) {
		return `<font color="${Db.customtitles.get(userid)[1]}">(<strong>${Db.customtitles.get(userid)[0]}</strong>)</font>`;
	}
	return '';
}

function devCheck(user) {
	if (isDev(user)) return '<font color="#009320">(<strong>Developer</strong>)</font>';
	return '';
}

function vipCheck(user) {
	if (isVIP(user)) return '<font color="#6390F0">(<strong>VIP User</strong>)</font>';
	return '';
}

function tsumetaCheck(user) {
	if (isTsuMetaCouncil(user)) return '<font color="#B22222">(<strong>TsuMeta Member</strong>)</font>';
	return '';
}

function lastActive(user) {
	if (!Users(user)) return false;
	user = Users(user);
	return (user && user.lastMessageTime ? Chat.toDurationString(Date.now() - user.lastMessageTime, {precision: true}) : "hasn't talked yet");
}

function showBadges(user) {
	// Disabled
	/*if (Db.userBadges.has(toId(user))) {
		let badges = Db.userBadges.get(toId(user));
		let css = `border:none; background:none; padding:0;`;
		if (typeof badges !== 'undefined' && badges !== null) {
			let output = `<td><div style="float: right; background: rgba(69, 76, 80, 0.4); text-align: center; border-radius: 12px; box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2) inset; margin: 0px 3px;">`;
			output += ` <table style="${css}"> <tr>`;
			for (let i = 0; i < badges.length; i++) {
				if (i !== 0 && i % 4 === 0) output += `</tr> <tr>`;
				output += `<td><button style="${css}" name="send" value="/badges info, ${badges[i]}">` +
				`<img src="${Db.badgeData.get(badges[i])[1]}" height="16" width="16" alt="${badges[i]}" title="${badges[i]}"></button></td>`;
			}
			output += `</tr> </table></div></td>`;
			return output;
		}
	}*/
	return ``;
}

exports.commands = {
	dev: {
		give: function (target, room, user) {
			if (!this.can('customtitle')) return false;
			if (!target) return this.parse('/help', true);
			let devUsername = toId(target);
			if (devUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (isDev(devUsername)) return this.errorReply(`${target} is already a DEV user.`);
			Db.devs.set(devUsername, 1);
			this.sendReply(`|html|${WL.nameColor(target, true)} has been given DEV status.`);
			if (Users.get(devUsername)) Users(devUsername).popup(`|html|You have been given DEV status by ${WL.nameColor(user.name, true)}.`);
		},

		take: function (target, room, user) {
			if (!this.can('customtitle')) return false;
			if (!target) return this.parse('/help', true);
			let devUsername = toId(target);
			if (devUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (!isDev(devUsername)) return this.errorReply(`${target} isn't a DEV user.`);
			Db.devs.remove(devUsername);
			this.sendReply(`|html|${WL.nameColor(target, true)} has been demoted from DEV status.`);
			if (Users.get(devUsername)) Users(devUsername).popup(`|html|You have been demoted from DEV status by ${WL.nameColor(user.name, true)}.`);
		},

		users: 'list',
		list: function () {
			if (!Db.devs.keys().length) return this.errorReply('There seems to be no user with DEV status.');
			let display = [];
			Db.devs.keys().forEach(devUser => {
				display.push(WL.nameColor(devUser, (Users(devUser) && Users(devUser).connected)));
			});
			this.popupReply(`|html|<strong><u><font size="3"><center>DEV Users:</center></font></u></strong>${display.join(',')}`);
		},

		'': 'help',
		help: function () {
			this.sendReplyBox(
				'<div style="padding: 3px 5px;"><center>' +
				'<code>/dev</code> commands.<br />These commands are nestled under the namespace <code>dev</code>.</center>' +
				'<hr width="100%">' +
				'<code>give [username]</code>: Gives <code>username</code> DEV status. Requires: & ~' +
				'<br />' +
				'<code>take [username]</code>: Takes <code>username</code>\'s DEV status. Requires: & ~' +
				'<br />' +
				'<code>list</code>: Shows the list of users with DEV Status.' +
				'</div>'
			);
		},
	},

	vip: {
		give: function (target, room, user) {
			if (!this.can('customtitle')) return false;
			if (!target) return this.parse('/help', true);
			let vipUsername = toId(target);
			if (vipUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (isVIP(vipUsername)) return this.errorReply(`${target} is already a VIP user.`);
			Db.vips.set(vipUsername, 1);
			this.sendReply(`|html|${WL.nameColor(vipUsername, true)} has been given VIP status.`);
			if (Users.get(vipUsername)) Users(vipUsername).popup(`|html|You have been given VIP status by ${WL.nameColor(user.name, true)}.`);
		},

		take: function (target, room, user) {
			if (!this.can('customtitle')) return false;
			if (!target) return this.parse('/help', true);
			let vipUsername = toId(target);
			if (vipUsername.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			if (!isVIP(vipUsername)) return this.errorReply(`${target} isn't a VIP user.`);
			Db.vips.remove(vipUsername);
			this.sendReply(`|html|${WL.nameColor(vipUsername, true)} has been demoted from VIP status.`);
			if (Users.get(vipUsername)) Users(vipUsername).popup(`|html|You have been demoted from VIP status by ${WL.nameColor(user.name, true)}.`);
		},

		users: 'list',
		list: function (target, room, user) {
			if (!Db.vips.keys().length) return this.errorReply('There seems to be no user(s) with VIP status.');
			let display = [];
			Db.vips.keys().forEach(vipUser => {
				display.push(WL.nameColor(vipUser, (Users(vipUser) && Users(vipUser).connected)));
			});
			this.popupReply(`|html|<strong><u><font size="3"><center>VIP Users:</center></font></u></strong>${display.join(',')}`);
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
				'<br />' +
				'<code>list</code>: Shows list of users with VIP Status.' +
				'</div>'
			);
		},
	},

	title: 'customtitle',
	customtitle: {
		set: 'give',
		give: function (target, room, user) {
			if (!this.can('customtitle')) return false;
			target = target.split(',');
			if (!target || target.length < 3) return this.parse('/help', true);
			let userid = toId(target[0]);
			let targetUser = Users.getExact(userid);
			let title = target[1].trim();
			if (Db.customtitles.has(userid) && Db.titlecolors.has(userid)) {
				return this.errorReply(`${userid} already has a custom title.`);
			}
			let color = target[2].trim();
			if (color.charAt(0) !== '#') return this.errorReply(`The color needs to be a hex starting with "#".`);
			Db.customtitles.set(userid, [title, color]);
			if (Users.get(targetUser)) {
				Users(targetUser).popup(`|html|You have received a custom title from ${WL.nameColor(user.name, true)}.<br />Title: ${showTitle(toId(targetUser))}<br />Title Hex Color: ${color}`);
			}
			this.privateModAction(`${user.name} set a custom title to ${target[0]}'s profile.`);
			Monitor.log(`${user.name} set a custom title to ${target[0]}'s profile.`);
			return this.sendReply(`Title "${title}" and color "${color}" for ${target[0]}'s custom title have been set.`);
		},

		delete: 'remove',
		take: 'remove',
		remove: function (target, room, user) {
			if (!this.can('customtitle')) return false;
			if (!target) return this.parse('/help', true);
			let userid = toId(target);
			if (!Db.customtitles.has(userid) && !Db.titlecolors.has(userid)) {
				return this.errorReply(`${target} does not have a custom title set.`);
			}
			Db.titlecolors.remove(userid);
			Db.customtitles.remove(userid);
			if (Users.get(userid)) {
				Users(userid).popup(`|html|${WL.nameColor(user.name, true)} has removed your custom title.`);
			}
			this.privateModAction(`${user.name} removed ${target}'s custom title.`);
			Monitor.log(`${user.name} removed ${target}'s custom title.`);
			return this.sendReply(`${target}'s custom title and title color were removed from the server memory.`);
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
				'- <code>[take|remove|delete] [username]</code>: Removes a user\'s custom title and erases it from the server. Requires: & ~'
			);
		},
	},

	fc: 'friendcode',
	friendcode: {
		switch: "nintendoswitch",
		nintendoswitch: {
			add: "set",
			set: function (target, room, user) {
				if (room.battle) return this.errorReply("Please use this command outside of battle rooms.");
				if (!user.autoconfirmed) return this.errorReply("You must be autoconfirmed to use this command.");
				if (!target) return this.parse("/friendcodehelp");
				let fc = target;
				fc = fc.replace(/-/g, '');
				fc = fc.replace(/ /g, '');
				if (isNaN(fc)) {
					return this.errorReply("Your Switch friend code needs to contain only numerical characters (the SW- will be automatically added).");
				}
				if (fc.length < 12) return this.errorReply("Your Switch friend code needs to be 12 digits long.");
				fc = `${fc.slice(0, 4)}-${fc.slice(4, 8)}-${fc.slice(8, 12)}`;
				Db.switchfc.set(user.userid, fc);
				return this.sendReply(`Your Switch friend code: ${fc} has been saved to the server.`);
			},

			remove: "delete",
			delete: function (target, room, user) {
				if (room.battle) return this.errorReply("Please use this command outside of battle rooms.");
				if (!user.autoconfirmed) return this.errorReply("You must be autoconfirmed to use this command.");
				if (!target) {
					if (!Db.switchfc.has(user.userid)) return this.errorReply("Your friend code isn't set.");
					Db.switchfc.remove(user.userid);
					return this.sendReply("Your Switch friend code has been deleted from the server.");
				} else {
					if (!this.can('lock')) return false;
					let userid = toId(target);
					if (!Db.switchfc.has(userid)) return this.errorReply(`${target} hasn't set a friend code.`);
					Db.switchfc.remove(userid);
					return this.sendReply(`${target}'s Switch friend code has been deleted from the server.`);
				}
			},
		},

		"2ds": "ds",
		"3ds": "ds",
		nintendods: "ds",
		nintendo3ds: "ds",
		nintendo2ds: "ds",
		ds: {
			add: "set",
			set: function (target, room, user) {
				if (room.battle) return this.errorReply("Please use this command outside of battle rooms.");
				if (!user.autoconfirmed) return this.errorReply("You must be autoconfirmed to use this command.");
				if (!target) return this.parse("/friendcodehelp");
				let fc = target;
				fc = fc.replace(/-/g, '');
				fc = fc.replace(/ /g, '');
				if (isNaN(fc)) {
					return this.errorReply("Your friend code needs to contain only numerical characters.");
				}
				if (fc.length < 12) return this.errorReply("Your friend code needs to be 12 digits long.");
				fc = `${fc.slice(0, 4)}-${fc.slice(4, 8)}-${fc.slice(8, 12)}`;
				Db.friendcode.set(user.userid, fc);
				return this.sendReply(`Your friend code: ${fc} has been saved to the server.`);
			},

			remove: 'delete',
			delete: function (target, room, user) {
				if (room.battle) return this.errorReply("Please use this command outside of battle rooms.");
				if (!user.autoconfirmed) return this.errorReply("You must be autoconfirmed to use this command.");
				if (!target) {
					if (!Db.friendcode.has(user.userid)) return this.errorReply("Your friend code isn't set.");
					Db.friendcode.remove(user.userid);
					return this.sendReply("Your friend code has been deleted from the server.");
				} else {
					if (!this.can('lock')) return false;
					let userid = toId(target);
					if (!Db.friendcode.has(userid)) return this.errorReply(`${target} hasn't set a friend code.`);
					Db.friendcode.remove(userid);
					return this.sendReply(`${target}'s friend code has been deleted from the server.`);
				}
			},
		},

		"": "help",
		help: function (target, room, user) {
			this.parse("/friendcodehelp");
		},
	},
	friendcodehelp: [
		`/fc [switch|ds] set [friendcode] - Sets your friend code of the specified console.
		/fc [switch|ds] delete - Deletes your friend code off the server of the specified console.
		/fc [switch|ds] delete [target] - Deletes the specified user's friend code for the specified console. Requires Global % or higher.
		/fc help - Shows this command.`,
	],

	favoritetype: 'type',
	type: {
		add: "set",
		set: function (target, room, user) {
			if (!target) return this.parse("/help type");
			let type = Dex.getType(target);
			if (!type.exists) return this.errorReply('Not a type. Check your spelling?');
			Db.type.set(user.userid, toId(type));
			return this.sendReply(`Your favorite type has been set to "${type}".`);
		},

		del: "delete",
		remove: "delete",
		delete: function (target, room, user) {
			if (!Db.type.has(user.userid)) return this.errorReply("Your Favorite Type hasn't been set.");
			Db.type.remove(user.userid);
			return this.sendReply("Your favorite type has been deleted from your profile.");
		},

		"": "help",
		help: function (target, room, user) {
			this.parse('/help type');
		},
	},
	typehelp: [
		"/type set [type] - Sets your Favorite Type.",
		"/type delete - Removes your Favorite Type.",
	],

	profilecolor: 'pcolor',
	pcolor: {
		set: 'add',
		add: function (target, room, user) {
			if (!target) return this.parse('/pcolor help');
			let color = target.trim();
			if (color.charAt(0) !== '#') return this.errorReply(`The color needs to be a hex starting with "#".`);
			Db.profilecolor.set(user, color);
			this.sendReply(`You have set your profile color to "${color}".`);
		},

		delete: 'remove',
		remove: function (target, room, user) {
			if (!this.can('customtitle')) return false;
			let userid = (toId(target));
			if (!target) return this.parse('/pcolor help');
			if (!Db.profilecolor.has(userid)) return this.errorReply(`${userid} does not have a profile color set.`);
			Db.profilecolor.remove(userid);
			if (Users.get(userid)) {
				Users(userid).popup(`|html|${WL.nameColor(user.name, true)} has removed your profile color.`);
			}
			this.sendReply(`You have removed ${target}'s profile color.`);
		},

		'': 'help',
		help: function (target, room, user) {
			if (!user.autoconfirmed) return this.errorReply("You need to be autoconfirmed to use this command.");
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			if (!this.runBroadcast()) return;
			return this.sendReplyBox(
				'<center><code>/profilecolor</code> commands<br />' +
				'All commands are nestled under the namespace <code>pcolor</code>.</center>' +
				'<hr width="100%">' +
				'- <code>[set|add] [hex color]</code>: set your profile color.' +
				'- <code>[remove|delete] [username]</code>: Removes a user\'s profile color and erases it from the server. Requires: % or higher.'
			);
		},
	},

	bg: 'background',
	background: {
		set: 'setbg',
		setbackground: 'setbg',
		setbg: function (target, room, user) {
			if (!this.can('lock')) return false;
			let parts = target.split(',');
			if (!parts[1]) return this.parse('/backgroundhelp');
			let targ = toId(parts[0]);
			let link = parts[1].trim();
			Db.backgrounds.set(targ, link);
			this.sendReply(`This user's background has been set to : `);
			this.parse(`/profile ${targ}`);
		},

		removebg: 'deletebg',
		remove: 'deletebg',
		deletebackground: 'deletebg',
		takebg: 'deletebg',
		take: 'deletebg',
		delete: 'deletebg',
		deletebg: function (target, room, user) {
			if (!this.can('lock')) return false;
			let targ = toId(target);
			if (!target) return this.parse('/backgroundhelp');
			if (!Db.backgrounds.has(targ)) return this.errorReply('This user does not have a custom background.');
			Db.backgrounds.remove(targ);
			return this.sendReply('This user\'s background has been deleted.');
		},

		'': 'help',
		help: function (target, room, user) {
			this.parse("/backgroundhelp");
		},
	},
	backgroundhelp: [
		"/bg set [user], [link] - Sets the user's profile background.",
		"/bg delete [user] - Removes the user's profile background.",
	],

	music: {
		add: "set",
		give: "set",
		set: function (target, room, user) {
			if (!this.can('lock')) return false;
			let parts = target.split(',');
			let targ = parts[0].toLowerCase().trim();
			if (!parts[2]) return this.errorReply('/musichelp');
			let link = parts[1].trim();
			let title = parts[2].trim();
			Db.music.set(targ, {'link': link, 'title': title});
			this.sendReply(`${targ}'s song has been set to: `);
			this.parse(`/profile ${targ}`);
		},

		take: "delete",
		remove: "delete",
		delete: function (target, room, user) {
			if (!this.can('lock')) return false;
			let targ = target.toLowerCase();
			if (!target) return this.parse('/musichelp');
			if (!Db.music.has(targ)) return this.errorReply('This user does not have any music on their profile.');
			Db.music.remove(targ);
			return this.sendReply('This user\'s profile music has been deleted.');
		},

		'': 'help',
		help: function (target, room, user) {
			this.parse('/musichelp');
		},
	},
	musichelp: [
		"/music set [user], [link], [title of song] - Sets a user's profile music.",
		"/music take [user] - Removes a user's profile music.",
	],

	pokemon: {
		add: "set",
		set: function (target, room, user) {
			if (!target) return this.parse("/pokemonhelp");
			let pkmn = Dex.getTemplate(target);
			if (!pkmn.exists) return this.errorReply('Not a Pokemon. Check your spelling?');
			Db.pokemon.set(user.userid, pkmn.species);
			return this.sendReply(`You have successfully set your favorite Pokemon as ${pkmn}.`);
		},

		del: "delete",
		remove: "delete",
		delete: function (target, room, user) {
			if (!Db.pokemon.has(user.userid)) return this.errorReply("Your favorite Pokemon hasn't been set.");
			Db.pokemon.remove(user.userid);
			return this.sendReply("Your favorite Pokemon has been deleted from your profile.");
		},

		"": "help",
		help: function (target, room, user) {
			this.parse('/pokemonhelp');
		},
	},
	pokemonhelp: [
		"/pokemon set [Pokemon] - Sets your Favorite Pokemon.",
		"/pokemon delete - Removes your Favorite Pokemon.",
	],

	natures: "nature",
	nature: {
		add: "set",
		set: function (target, room, user) {
			if (!target) this.parse("/naturehelp");
			let nature = Dex.getNature(target);
			if (!nature.exists) return this.errorReply("This is not a nature. Check your spelling?");
			Db.nature.set(user.userid, nature.name);
			return this.sendReply("You have successfully set your nature onto your profile.");
		},

		del: "delete",
		take: "delete",
		remove: "delete",
		delete: function (target, room, user) {
			if (!Db.nature.has(user.userid)) return this.errorReply("Your nature has not been set.");
			Db.nature.remove(user.userid);
			return this.sendReply("Your nature has been deleted from your profile.");
		},

		"": "help",
		help: function (target, room, user) {
			this.parse("/naturehelp");
		},
	},
	naturehelp: [
		"/nature set [nature] - Sets your Profile Nature.",
		"/nature delete - Removes your Profile Nature.",
	],

	'!profile': true,
	profile: function (target, room, user) {
		target = toId(target);
		if (!target) target = user.name;
		if (target.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
		if (!this.runBroadcast()) return;
		let self = this;
		let targetUser = Users.get(target);
		let online = (targetUser ? targetUser.connected : false);
		let username = (targetUser ? targetUser.name : target);
		let userid = (targetUser ? targetUser.userid : toId(target));
		let avatar = (targetUser ? (isNaN(targetUser.avatar) ? `http://${serverIp}:${Config.port}/avatars/${targetUser.avatar}` : `http://play.pokemonshowdown.com/sprites/trainers/${targetUser.avatar}.png`) : (Config.customavatars[userid] ? `http://${serverIp}:${Config.port}/avatars/${Config.customavatars[userid]}` : `http://play.pokemonshowdown.com/sprites/trainers/1.png`));
		if (targetUser && targetUser.avatar[0] === '#') avatar = `http://play.pokemonshowdown.com/sprites/trainers/${targetUser.avatar.substr(1)}.png`;
		let userSymbol = (Users.usergroups[userid] ? Users.usergroups[userid].substr(0, 1) : "Regular User");
		let userGroup = (Config.groups[userSymbol] ? `Global ${Config.groups[userSymbol].name}` : `Regular User`);
		let regdate = '(Unregistered)';
		WL.regdate(userid, date => {
			if (date) {
				let d = new Date(date);
				let MonthNames = ["January", "February", "March", "April", "May", "June",
					"July", "August", "September", "October", "November", "December",
				];
				regdate = MonthNames[d.getUTCMonth()] + ' ' + d.getUTCDate() + ", " + d.getUTCFullYear();
			}
			showProfile();
		});

		function getLastSeen(userid) {
			if (Users(userid) && Users(userid).connected) return '<font color = "limegreen"><strong>Currently Online</strong></font>';
			let seen = Db.seen.get(userid);
			if (!seen) return '<font color = "red"><strong>Never</strong></font>';
			return Chat.toDurationString(Date.now() - seen, {precision: true}) + " ago.";
		}

		function getFlag(userid) {
			let ip = (Users(userid) ? geoip.lookup(Users(userid).latestIp) : false);
			if (!ip || ip === null) return '';
			return `<img src="http://flags.fmcdn.net/data/flags/normal/${ip.country.toLowerCase()}.png" alt="${ip.country}" title="${ip.country}" width="20" height="10">`;
		}

		function background(user) {
			let bg = Db.backgrounds.get(user);
			if (!Db.backgrounds.has(user)) return `<div style="max-height: 250px; overflow-y: scroll">`;
			return `<div style="background:url(${bg}); background-size: 100% 100%; height: 250px">`;
		}

		function pColor(user) {
			let color = Db.profilecolor.get(user);
			if (!Db.profilecolor.has(user)) return '<font>';
			return `<font color="${color}">`;
		}

		function song(user) {
			if (!Db.music.has(user)) return '';
			let song = Db.music.get(user)['link'];
			let title = Db.music.get(user)['title'];
			return `<acronym title="${title}"><br /><audio src="${song}" controls="" style="width:100%;"></audio></acronym>`;
		}

		function showProfile() {
			Economy.readMoney(toId(username), currency => {
				let profile = ``;
				profile += `${background(toId(username))} ${showBadges(toId(username))}`;
				profile += `<div style="display: inline-block; width: 6.5em; height: 100%; vertical-align: top"><img src="${avatar}" height="80" width="80" align="left"></div>`;
				profile += `<div style="display: inline-block">&nbsp;${pColor(toId(username))}<b>Name:</b></font> ${WL.nameColor(username, true)}&nbsp; ${getFlag(toId(username))} ${showTitle(username)}<br />`;
				profile += `&nbsp;${pColor(toId(username))}<b>Group:</b> ${userGroup}</font> ${devCheck(username)} ${vipCheck(username)} ${tsumetaCheck(username)}<br />`;
				profile += `&nbsp;${pColor(toId(username))}<b>Registered:</b> ${regdate}</font><br />`;
				profile += `&nbsp;${pColor(toId(username))}<b>${currencyPlural}:</b> ${currency}</font><br />`;
				if (Db.pokemon.has(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<b>Favorite Pokemon:</b> ${Db.pokemon.get(toId(username))}</font><br />`;
				}
				if (Db.type.has(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<b>Favorite Type:</b></font> <img src="https://www.serebii.net/pokedex-bw/type/${Db.type.get(toId(username))}.gif"><br />`;
				}
				if (Db.nature.has(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<b>Nature:</b> ${Db.nature.get(toId(username))}</font><br />`;
				}
				if (WL.getFaction(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<b>Faction:</b> ${WL.getFaction(toId(username))}</font><br />`;
				}
				profile += `&nbsp;${pColor(toId(username))}<b>EXP Level:</b> ${WL.ExpControl.level(toId(username))}</font><br />`;
				if (online && lastActive(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<b>Last Activity:</b> ${lastActive(toId(username))}</font><br />`;
				}
				profile += `&nbsp;${pColor(toId(username))}<b>Last Seen:</b> ${getLastSeen(toId(username))}</font><br />`;
				if (Db.friendcodes.has(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<b>Friend Code:</b> ${Db.friendcodes.get(toId(username))}</font><br />`;
				}
				if (Db.switchfc.has(toId(username))) {
					profile += `&nbsp;${pColor(toId(username))}<strong>Switch Friend Code:</strong> SW-${Db.switchfc.get(toId(username))}</font><br />`;
				}
				profile += `&nbsp;${song(toId(username))}<br />`;
				profile += `&nbsp;</div>`;
				profile += `<br clear="all">`;
				self.sendReplyBox(profile);
			});
		}
	},

	profilehelp: [
		`/profile [user] - Shows a user's profile. Defaults to yourself.
		/pcolor help - Shows profile color commands.
		/pokemon set [Pokemon] - Set your Favorite Pokemon onto your profile.
		/pokemon delete - Delete your Favorite Pokemon from your profile.
		/type set [type] - Set your favorite type.
		/type delete - Delete your favorite type.
		/nature set [nature] - Set your nature.
		/nature delete - Delete your nature.
		/music set [user], [song], [title] - Sets a user's profile song. Requires % or higher.
		/music take [user] - Removes a user's profile song. Requires % or higher.
		/bg set [user], [link] - Sets the user's profile background. Requires % or higher.
		/bg delete [user] - Removes the user's profile background. Requires % or higher.
		/fc [switch|ds] set [friend code] - Sets your Friend Code.
		/fc [switch|ds] delete [friend code] - Removes your Friend Code.
		/dev give [user] - Gives a user Dev Status. Requires & or higher.
		/dev take [user] - Removes a user's Dev Status. Requires & or higher.
		/vip give [user] - Gives a user VIP Status. Requires & or higher.
		/vip take [user] - Removes a user's VIP Status. Requires & or higher.`,
	],
};
