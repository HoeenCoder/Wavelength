/*
* icons.js
* Credits: Lord Haji, panpawn
*/
'use strict';

let icons = {};
const fs = require('fs');

function load() {
	fs.readFile('config/icons.json', 'utf8', function (err, file) {
		if (err) return;
		icons = JSON.parse(file);
	});
}
load();

function updateIcons() {
	fs.writeFileSync('config/icons.json', JSON.stringify(icons));

	let newCss = '/* ICONS START */\n';

	for (let name in icons) {
		newCss += generateCSS(name, icons[name]);
	}
	newCss += '/* ICONS END */\n';

	let file = fs.readFileSync('config/custom.css', 'utf8').split('\n');
	if (~file.indexOf('/* ICONS START */')) file.splice(file.indexOf('/* ICONS START */'), (file.indexOf('/* ICONS END */') - file.indexOf('/* ICONS START */')) + 1);
	fs.writeFileSync('config/custom.css', file.join('\n') + newCss);
	WL.reloadCSS();
}

function generateCSS(name, icon) {
	let css = '';
	let rooms = [];
	name = toId(name);
	Rooms.rooms.forEach((curRoom, id) => {
		if (curRoom.id === 'global' || curRoom.type !== 'chat' || curRoom.isPersonal) return;
		if (!isNaN(Number(id.charAt(0)))) return;
		rooms.push('#' + id + '-userlist-user-' + name);
	});
	css = rooms.join(', ');
	css += '{\nbackground: url("' + icon + '") no-repeat right\n}\n';
	return css;
}

exports.commands = {
	uli: 'icon',
	userlisticon: 'icon',
	customicon: 'icon',
	icon: {
		set: function (target, room, user) {
			if (!this.can('roomowner')) return false;
			target = target.split(',');
			for (let u in target) target[u] = target[u].trim();
			if (target.length !== 2) return this.parse('/help icon');
			if (toId(target[0]).length > 19) return this.errorReply("Usernames are not this long...");
			if (icons[toId(target[0])]) return this.errorReply("This user already has a custom userlist icon.  Do /icon delete [user] and then set their new icon.");
			this.sendReply("|raw|You have given " + WL.nameColor(target[0], true) + " an icon.");
			Monitor.adminlog(target[0] + " has received an icon from " + user.name + ".");
			this.privateModAction("|raw|(" + target[0] + " has recieved icon: <img src='" + target[1] + "' width='32' height='32'> from " + user.name + ".)");
			this.modlog('ICON', target[0], `Set icon to ${target[1]}`);
			if (Users(target[0]) && Users(target[0]).connected) Users(target[0]).popup("|html|" + WL.nameColor(user.name, true) + " has set your userlist icon to: <img src='" + target[1] + "' width='32' height='32'><br><center>Refresh, If you don't see it.</center>");
			icons[toId(target[0])] = target[1];
			updateIcons();
		},
		remove: 'delete',
		delete: function (target, room, user) {
			if (!this.can('roomowner')) return false;
			target = toId(target);
			if (!icons[toId(target)]) return this.errorReply('/icon - ' + target + ' does not have an icon.');
			delete icons[toId(target)];
			updateIcons();
			this.sendReply("You removed " + target + "'s icon.");
			Monitor.adminlog(user.name + " removed " + target + "'s icon.");
			this.privateModAction("(" + target + "'s icon was removed by " + user.name + ".)");
			this.modlog('ICON', target, `Removed icon`);
			if (Users(target) && Users(target).connected) Users(target).popup("|html|" + WL.nameColor(user.name, true) + " has removed your userlist icon.");
		},
	},
	iconhelp: [
		"Commands Include:",
		"/icon set [user], [image url] - Gives [user] an icon of [image url]",
		"/icon delete [user] - Deletes a user's icon",
	],
};
