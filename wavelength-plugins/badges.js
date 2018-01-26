/************************
 * Badges plugin			*
 *								*
 * Credits: Niisama		*
 *								*
 * Cleanup: Insist		*
 *								*
 * @license MIT license *
 ************************/

'use strict';

const TR_CSS = 'style ="background: rgba(69, 76, 80, 0.8); border: 3px solid #FFF; border-radius: 4px"';
const TD_CSS = 'style ="background: rgba(69, 76, 80, 0.6); color: #FFF; padding: 5px; border: 1px solid #222; border: 3px solid #FFF; border-radius: 4px"';

function badgeImg(IMG_URL, name) {
	return `<img src="${IMG_URL}" height="16" width="16" alt="${name}" title="${name}">`;
}

exports.commands = {
	badge: 'badges',
	badges: {
		give: function (target, room, user) {
			let targetUser;
			let selectedBadge;
			let userBadges;
			let userid;
			if (!this.can('lock')) return false;
			let parts = target.split(',');
			if (parts.length !== 2) return this.parse("/badgeshelp");
			userid = toId(parts[0].trim());
			targetUser = Users.getExact(userid);
			userBadges = Db.userBadges.get(userid);
			selectedBadge = parts[1].trim();
			if (!Db.badgeData.has(selectedBadge)) return this.errorReply("This badge does not exist, please check /badges list.");
			if (!Db.userBadges.has(userid)) userBadges = [];
			userBadges = userBadges.filter(b => b !== selectedBadge);
			userBadges.push(selectedBadge);
			Db.userBadges.set(userid, userBadges);
			if (Users.get(targetUser)) Users.get(userid).popup(`|modal||html|You have received a badge from ${WL.nameColor(user.name, true)}: <img src="${Db.badgeData.get(selectedBadge)[1]}" width="16" height="16"> (${selectedBadge})`);
			this.modlog(`BADGES`, targetUser, `gave badge`);
			this.sendReply(`The "${selectedBadge}" badge was given to ${parts[0]}.`);
		},

		create: function (target, room, user) {
			if (!this.can('ban')) return false;
			let parts = target.split(',');
			if (parts.length !== 3) return this.parse("/badgeshelp");
			let badgeName = Chat.escapeHTML(parts[0].trim());
			let description = Chat.escapeHTML(parts[1].trim());
			let img = parts[2].trim();
			if (Db.badgeData.has(badgeName)) return this.errorReply('This badge already exists.');
			Db.badgeData.set(badgeName, [description, img]);
			this.modlog(`BADGE`, null, `added badge.`);
			Users.get(user.userid).popup(`|modal||html|You have successfully created the badge <img src ="${img}" width="16" height="16"> (${badgeName})`);
		},

		list: function (target, room, user) {
			if (!this.runBroadcast()) return;
			let output = '';
			output = `<table>`;
			Db.badgeData.keys().forEach(badge => {
				let badgeData = Db.badgeData.get(badge);
				output += `<tr ${TR_CSS}> <td ${TD_CSS}>${badgeImg(badgeData[1], badge)}</td> <td ${TD_CSS}>${badge}</td> <td ${TD_CSS}>${badgeData[0]}</td></tr>`;
			});
			output += `</table>`;
			this.sendReply(`|html|<div class = "infobox ${(this.broadcasting ? '-limited' : '')}">${output}</div>`);
		},

		info: function (target, room, user) {
			if (!this.runBroadcast()) return;
			let selectedBadge;
			let parts = target.split(',');
			if (!parts[1]) return this.parse('/help badges');
			selectedBadge = parts[1].trim();
			if (!Db.badgeData.has(selectedBadge)) return this.errorReply("This badge does not exist, please check /badges list");
			let badgeData = Db.badgeData.get(selectedBadge);
			this.sendReplyBox(`<table><tr ${TR_CSS}> <td ${TD_CSS}>${badgeImg(badgeData[1], selectedBadge)}</td> <td ${TD_CSS}>${selectedBadge}</td> <td ${TD_CSS}>${badgeData[0]}</td/></tr></table>`);
		},

		take: function (target, room, user) {
			if (!this.can('lock')) return false;
			let selectedBadge;
			let userBadges;
			let userid;
			let parts = target.split(',');
			if (parts.length !== 2) return this.parse("/badgeshelp");
			userid = toId(parts[0].trim());
			if (!Db.userBadges.has(userid)) return this.errorReply("This user doesn't have any badges.");
			userBadges = Db.userBadges.get(userid);
			selectedBadge = parts[1].trim();
			if (!Db.badgeData.get(selectedBadge)) return this.errorReply(`${selectedBadge} is not a badge.`);
			userBadges = userBadges.filter(b => b !== selectedBadge);
			Db.userBadges.set(userid, userBadges);
			this.modlog(`BADGES`, parts[0], `took badge`);
			this.sendReply(`The "${selectedBadge}" badge was taken from "${parts[0]}.`);
			if (Users(userid)) Users.get(userid).popup(`|modal||html|${WL.nameColor(user.name, true)} has taken the ${selectedBadge} from you. <img src="${Db.badgeData.get(selectedBadge)[1]}" width="16" height="16">`);
		},

		delete: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse("/badgeshelp");
			let targetId = toId(target);
			if (!Db.badgeData.has(targetId)) return this.errorReply("This badge does not exist, please check /badges list");
			Db.badgeData.remove(targetId);
			let badgedUsers = Db.userBadges.keys().map(curUser => ({userid: curUser, badges: Db.userBadges.get(curUser)}));
			badgedUsers.forEach(curUser => {
				let badges = curUser.badges.filter(b => b !== targetId);
				if (!badges.length) return Db.userBadges.remove(curUser.userid);
				Db.userBadges.set(curUser.userid, badges);
			});
			this.sendReply(`The badge with the name "${targetId}" deleted.`);
			this.modlog(`BADGES`, null, `removed badge`);
		},

		user: function (target, room, user) {
			let userid;
			if (!target) target = user.userid;
			if (!this.runBroadcast()) return;
			let output = '';
			if (!Db.userBadges.has(userid)) return this.errorReply("This user doesn't have any badges.");
			output = `<table>`;
			let usersBadges = Db.userBadges.get(userid);
			for (let i in usersBadges) {
				let badgeData = Db.badgeData.get(usersBadges[i]);
				output += `<tr ${TR_CSS}><td ${TD_CSS}>${badgeImg(badgeData[1], usersBadges[i])}</td> <td ${TD_CSS}>${usersBadges[i]}</td> <td ${TD_CSS}>${badgeData[0]}</td><tr>`;
			}
			output += `<table>`;
			this.sendReply(`|html|<div class = "infobox ${(this.broadcasting ? '-limited' : '')}">${output}</div>`);
		},

		"": "help",
		help: function (target, room, user) {
			return this.parse('/help badges');
		},
	},

	badgeshelp: [
		"/badges - accepts the following commands:",
		"/badges list - List all the badges.",
		"/badges info [badgeName] - Get information on a specific badge.",
		"/badges create [badgeName], [description], [image] - Create a badge. Requires Global @ or higher.",
		"/badges delete [badge] - Delete a badge. Requires Global @ or higher.",
		"/badges set [user], [badgeName] - Gives a user a badge. Requires Global % or higher.",
		"/badges take [user], [badgeName] - Takes a badge from a user. Requires Global % or higher.",
		"/badges user [user] - List a user's badges. Defaults to the user.",
	],
};
