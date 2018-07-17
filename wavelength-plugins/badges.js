/******************
 * WL Badge System
 * Coded by Volco
 * ***************/

'use strict';

function badgeImg(name, img) {
	return `<img src="${img}" title="${name}" height="32" width="32">`;
}

function capitalizeFirst(str) {
	return str[0].toUpperCase() + str.substring(1);
}

exports.commands = {
	badge: 'badges',
	badges: {
		info: function (target, room, user) {
			if (!target) return this.parse(`/help badges`);
			if (!Db.badgeData.has(toId(target))) return this.errorReply(`That badge does not exist. /badge list to see the existing badges.`);
			let data = Db.badgeData.get(toId(target));
			return this.sendReplyBox(`${badgeImg(capitalizeFirst(toId(target)), data.img)}: ${data.desc}`);
		},

		list: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (!Db.badgeData.keys().length) return this.errorReply(`There are currently no badges.`);
			let html = `<table>`;
			Db.badgeData.keys().forEach(badge => {
				let data = Db.badgeData.get(badge);
				html += `<tr><td>${badgeImg(capitalizeFirst(badge), data.img)}</td><td>${capitalizeFirst(badge)}</td><td>${data.img}<td></tr>`;
			});
			html += `</table>`;
			this.sendReplyBox(html);
		},

		create: 'add',
		add: function (target, room, user) {
			if (!this.can('badge')) return false;
			let [badge, desc, img] = target.split(',').map(p => { return p.trim(); });
			if (!badge || !desc || !img) return this.parse(`/help badges`);
			if (Db.badgeData.has(toId(badge))) return this.errorReply(`${capitalizeFirst(toId(badge))} is already a badge`);
			Db.badgeData.set(toId(badge), {desc: desc, img: img});
			this.addModAction(`${user.name} created the ${capitalizeFirst(toId(badge))} badge.`);
			this.sendReply(`You created the ${capitalizeFirst(toId(badge))} badge`);
		},

		delete: 'remove',
		remove: function (target, room, user) {
			if (!this.can('badge')) return false;
			if (!target) this.parse(`/help badges`);
			if (!Db.badgeData.has(toId(target))) return this.errorReply(`That badge does not exist. /badge list to see the existing badges.`);
			Db.badgeData.remove(toId(target));
			let badgedUsers = Db.userBadges.keys().map(curUser => ({userid: curUser, badges: Db.userBadges.get(curUser)}));
			badgedUsers.forEach(curUser => {
				let badges = curUser.badges.filter(b => b !== toId(target));
				if (!badges.length) return Db.userBadges.remove(curUser.userid);
				Db.userBadges.set(curUser.userid, badges);
			});
			this.addModAction(`${user.name} removed the ${capitalizeFirst(toId(target))} badge.`);
			this.sendReply(`The ${capitalizeFirst(toId(target))} badge has been removed.`);
		},

		set: 'give',
		give: function (target, room, user) {
			if (!this.can('badge')) return false;
			let [userid, badge] = target.split(',').map(p => { return p.trim(); });
			if (!userid || !badge) return this.parse(`/help badges`);
			if (!Db.badgeData.has(toId(badge))) return this.errorReply(`That badge does not exist. /badge list to see the existing badges.`);
			let badges = Db.userBadges.get(toId(userid), []);
			if (badges.includes(toId(badge))) return this.errorReply(`${userid} already has that badge.`);
			badges.push(toId(badge));
			Db.userBadges.set(toId(userid), badges);
			this.addModAction(`${user.name} given the ${capitalizeFirst(toId(target))} badge to ${userid}.`);
			this.sendReply(`You have given the ${toId(badge)} badge to ${userid}`);
			if (Users(toId(userid)) && Users(toId(userid)).connected) Users(toId(userid)).popup(`You have received the ${toId(badge)} badge!`);
		},

		revoke: 'take',
		take: function (target, room, user) {
			if (!this.can('badge')) return false;
			let [userid, badge] = target.split(',').map(p => { return p.trim(); });
			if (!Db.userBadges.get(toId(userid), []).includes(toId(badge))) return this.errorReply(`${userid} does not have that badge.`);
			let badges = Db.userBadges.get(toId(userid), []).filter(b => b !== toId(badge));
			Db.userBadges.set(toId(userid), badges);
			this.addModAction(`${user.name} revoked the ${capitalizeFirst(toId(badge))} badge from ${userid}.`);
			this.sendReply(`You have removed the ${toId(badge)} badge from ${userid}`);
			if (Users(toId(userid)) && Users(toId(userid)).connected) Users(toId(userid)).popup(`You have lost the ${toId(badge)} badge!`);
		},

		showcase: 'case',
		case: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (!Db.badgeData.keys().length) return this.errorReply(`There are currently no badges.`);
			let html = `<table>`;
			Db.userBadges.get(toId(user), []).forEach(badge => {
				let data = Db.badgeData.get(badge);
				html += `<td><button style="color: transparent; background-color: transparent; border-color: transparent;" name="send" value="/badge info ${badge}">${badgeImg(capitalizeFirst(badge), data.img)}</button></td>`;
			});
			html += `</table>`;
			this.sendReplyBox(html);
		},
		'': 'help',
		help: function (target, room, user) {
			this.parse('/help badges');
		},
	},
	badgeshelp: [`/badge info (badge name) - Displays a badge's description`,
		`/badge list - Displays all earnable badges`,
		`/badge add (badge name), (description) - Creates a new badge into the system`,
		`/badge remove (badge name) - Removes a badge from the system`,
		`/badge give (user), (badge name) - Grants a user a badge`,
		`/badge take (user), (badge name) - Revokes a users badge`,
		`/badge case (user) - Shows what badges a user has earned. If no user specified defaults to self.`,
	],
};
