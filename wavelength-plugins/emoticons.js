/*
Emoticon plugin
This plugin allows you to use emoticons in both chat rooms (as long as they are enabled in the room) and private messages.
*/
'use strict';

const fs = require('fs');
let emoticons = {'feelsbd': 'http://i.imgur.com/TZvJ1lI.png'};
let emoteRegex = new RegExp('feelsbd', 'g');
WL.ignoreEmotes = {};
try {
	WL.ignoreEmotes = JSON.parse(fs.readFileSync('config/ignoreemotes.json', 'utf8'));
} catch (e) {}

function loadEmoticons() {
	try {
		emoticons = JSON.parse(fs.readFileSync('config/emoticons.json', 'utf8'));
		emoteRegex = [];
		for (let emote in emoticons) {
			emoteRegex.push(escapeRegExp(emote));
		}
		emoteRegex = new RegExp('(' + emoteRegex.join('|') + ')', 'g');
	} catch (e) {}
}
loadEmoticons();

function saveEmoticons() {
	fs.writeFileSync('config/emoticons.json', JSON.stringify(emoticons));
	emoteRegex = [];
	for (let emote in emoticons) {
		emoteRegex.push(emote);
	}
	emoteRegex = new RegExp('(' + emoteRegex.join('|') + ')', 'g');
}

function parseEmoticons(message) {
	if (emoteRegex.test(message)) {
		message = WL.parseMessage(message).replace(emoteRegex, function (match) {
			return `<img src="${emoticons[match]}" title="${match}" height="40" width="40">`;
		});
		return message;
	}
	return false;
}
WL.parseEmoticons = parseEmoticons;

exports.commands = {
	blockemote: 'ignoreemotes',
	blockemotes: 'ignoreemotes',
	blockemoticon: 'ignoreemotes',
	blockemoticons: 'ignoreemotes',
	ignoreemotes: function (target, room, user) {
		this.parse(`/emoticons ignore`);
	},

	unblockemote: 'unignoreemotes',
	unblockemotes: 'unignoreemotes',
	unblockemoticon: 'unignoreemotes',
	unblockemoticons: 'unignoreemotes',
	unignoreemotes: function (target, room, user) {
		this.parse(`/emoticons unignore`);
	},

	emoticons: 'emoticon',
	emote: 'emoticon',
	emotes: 'emoticon',
	emoticon: {
		add: function (target, room, user) {
			let parts = target.split(',');
			for (let u in parts) parts[u] = parts[u].trim();
			if (!this.can('emote')) return false;
			if (!parts[1]) return this.sendReply(`Usage: /emoticon add [name], [url] - Remember to resize the image first! (recommended 30x30)`);
			if (emoticons[parts[0]]) return this.sendReply(`"${parts[0]}" is already an emoticon.`);
			emoticons[parts[0]] = parts[1];
			saveEmoticons();
			this.sendReply(`|raw|The emoticon "${Chat.escapeHTML(parts[0])}" has been added: <img src="${parts[1]}" width="40" height="40">`);
			Rooms('upperstaff').add(`|raw|${WL.nameColor(user.name, true)} has added the emote "${Chat.escapeHTML(parts[0])}": <img width="40" height="40" src="${parts[1]}">`).update();
			WL.messageSeniorStaff(`/html ${WL.nameColor(user.name, true)} has added the emote "${Chat.escapeHTML(parts[0])}": <img width="40" height="40" src="${parts[1]}">`);
		},

		remove: 'delete',
		rem: 'delete',
		del: 'delete',
		delete: function (target, room, user) {
			if (!this.can('emote')) return false;
			if (!target) return this.sendReply(`Usage: /emoticon del [name]`);
			if (!emoticons[target]) return this.sendReply(`The emoticon "${target}" does not exist.`);
			delete emoticons[target];
			saveEmoticons();
			this.sendReply(`The emoticon "${target}" has been removed.`);
		},

		toggle: function (target, room, user) {
			if (!this.can('editroom', null, room)) return this.sendReply(`Access denied.`);
			if (!room.disableEmoticons) {
				room.disableEmoticons = true;
				Rooms.global.writeChatRoomData();
				this.modlog(`EMOTES`, null, `disabled emoticons`);
				this.privateModAction(`(${user.name} disabled emoticons in this room.)`);
			} else {
				room.disableEmoticons = false;
				Rooms.global.writeChatRoomData();
				this.modlog(`EMOTES`, null, `enabled emoticons`);
				this.privateModAction(`(${user.name} enabled emoticons in this room.)`);
			}
		},

		'': 'view',
		list: 'view',
		view: function (target, room, user) {
			if (!this.runBroadcast()) return;
			let reply = `<b><u>Emoticons (${Object.keys(emoticons).length})</u></b><br />`;
			for (let emote in emoticons) reply += `(${emote} <img src="${emoticons[emote]}" height="40" width="40">) `;
			this.sendReply(`|raw|<div class="infobox infobox-limited">${reply}</div>`);
		},

		ignore: function (target, room, user) {
			if (WL.ignoreEmotes[user.userid]) return this.errorReply("You are already ignoring emoticons.");
			WL.ignoreEmotes[user.userid] = true;
			fs.writeFileSync('config/ignoreemotes.json', JSON.stringify(WL.ignoreEmotes));
			this.sendReply(`You are now ignoring emoticons.`);
		},

		unignore: function (target, room, user) {
			if (!WL.ignoreEmotes[user.userid]) return this.errorReply("You aren't ignoring emoticons.");
			delete WL.ignoreEmotes[user.userid];
			fs.writeFileSync('config/ignoreemotes.json', JSON.stringify(WL.ignoreEmotes));
			this.sendReply(`You are no longer ignoring emoticons.`);
		},

		help: function (target, room, user) {
			this.parse(`/help emoticons`);
		},
	},
	emoticonshelp: [
		`Emoticon Commands:
		/emoticon may be substituted with /emoticons, /emotes, or /emote
		/emoticon add [name], [url] - Adds an emoticon.
		/emoticon del/delete/remove/rem [name] - Removes an emoticon.
		/emoticon toggle - Enables or disables emoticons in the current room depending on if they are already active.
		/emoticon view/list - Displays the list of emoticons.
		/emoticon ignore - Ignores emoticons in chat messages.
		/emoticon unignore - Unignores emoticons in chat messages.
		/emoticon help - Displays this help command.
		Emoticon Plugin by: jd`,
	],
};

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); // eslint-disable-line no-useless-escape
}
