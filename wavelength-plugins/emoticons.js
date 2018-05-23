/*
Emoticon plugin
This plugin allows you to use emoticons in both chat rooms (as long as they are enabled in the room) and private messages.
*/
"use strict";

const FS = require("../lib/fs.js");

let emoticons = {"feelsbd": "http://i.imgur.com/TZvJ1lI.png"};
let emoteRegex = new RegExp("feelsbd", "g");
WL.ignoreEmotes = {};
try {
	WL.ignoreEmotes = JSON.parse(FS(`config/ignoreemotes.json`).readIfExistsSync());
} catch (e) {}

function loadEmoticons() {
	try {
		emoticons = JSON.parse(FS(`config/emoticons.json`).readIfExistsSync());
		emoteRegex = [];
		for (let emote in emoticons) {
			emoteRegex.push(escapeRegExp(emote));
		}
		emoteRegex = new RegExp(`(${emoteRegex.join('|')})`, 'g');
	} catch (e) {}
}
loadEmoticons();

function saveEmoticons() {
	FS(`config/emoticons.json`).writeSync(JSON.stringify(emoticons));
	emoteRegex = [];
	for (let emote in emoticons) {
		emoteRegex.push(emote);
	}
	emoteRegex = new RegExp(`(${emoteRegex.join('|')})`, 'g');
}

function parseEmoticons(message, room) {
	if (emoteRegex.test(message)) {
		let size = 40;
		let lobby = Rooms(`lobby`);
		if (lobby && lobby.emoteSize) size = lobby.emoteSize;
		message = WL.parseMessage(message).replace(emoteRegex, function (match) {
			return `<img src="${emoticons[match]}" title="${match}" height="${((room && room.emoteSize) ? room.emoteSize : size)}" width="${((room && room.emoteSize) ? room.emoteSize : size)}">`;
		});
		return message;
	}
	return false;
}
WL.parseEmoticons = parseEmoticons;

exports.commands = {
	blockemote: "ignoreemotes",
	blockemotes: "ignoreemotes",
	blockemoticon: "ignoreemotes",
	blockemoticons: "ignoreemotes",
	ignoreemotes: function (target, room, user) {
		this.parse(`/emoticons ignore`);
	},

	unblockemote: "unignoreemotes",
	unblockemotes: "unignoreemotes",
	unblockemoticon: "unignoreemotes",
	unblockemoticons: "unignoreemotes",
	unignoreemotes: function (target, room, user) {
		this.parse(`/emoticons unignore`);
	},

	emoticons: "emoticon",
	emote: "emoticon",
	emotes: "emoticon",
	emoticon: {
		add: function (target, room, user) {
			if (!this.can(`emote`)) return false;
			let [name, url] = target.split(",").map(p => p.trim());
			if (!(name && url)) return this.parse('/help', true);

			if (name.length > 10) return this.errorReply("Emoticons may not be longer than 10 characters.");
			if (emoticons[name]) return this.errorReply(`${name} is already an emoticon.`);

			emoticons[name] = url;
			saveEmoticons();

			let size = 40;
			let lobby = Rooms(`lobby`);
			if (lobby && lobby.emoteSize) size = lobby.emoteSize;
			if (room.emoteSize) size = room.emoteSize;

			this.sendReply(`|raw|The emoticon ${Chat.escapeHTML(name)} has been added: <img src="${url}" width="${size}" height="${size}">`);
			if (Rooms("upperstaff")) Rooms("upperstaff").add(`|raw|${WL.nameColor(user.name, true)} has added the emoticon ${Chat.escapeHTML(name)}: <img src="${url}" width="${size}" height="${size}">`);
			WL.messageSeniorStaff(`/html ${WL.nameColor(user.name, true)} has added the emoticon ${Chat.escapeHTML(name)}: <img src="${url}" width="${size}" height="${size}">`);
		},

		delete: "del",
		remove: "del",
		rem: "del",
		del: function (target, room, user) {
			if (!this.can(`emote`)) return false;
			if (!target) return this.sendReply("Usage: /emoticons remove [name]");
			if (!emoticons[target]) return this.errorReply("That emoticon does not exist.");

			delete emoticons[target];
			saveEmoticons();

			this.sendReply("That emoticon has been removed.");
			if (Rooms("upperstaff")) Rooms("upperstaff").add(`|raw|${WL.nameColor(user.name, true)} has removed the emoticon ${Chat.escapeHTML(target)}.`);
			WL.messageSeniorStaff(`/html ${WL.nameColor(user.name, true)} has removed the emoticon ${Chat.escapeHTML(target)}.`);
		},

		toggle: function (target, room, user) {
			if (!this.can("emote", null, room)) return this.sendReply(`Access denied.`);
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

		view: "list",
		list: function (target, room, user) {
			if (!this.runBroadcast()) return;

			let size = 40;
			let lobby = Rooms("lobby");
			if (lobby && lobby.emoteSize) size = lobby.emoteSize;
			if (room.emoteSize) size = room.emoteSize;

			let reply = `<strong><u>Emoticons (${Object.keys(emoticons).length})</u></strong><br />`;
			for (let emote in emoticons) reply += `(${emote} <img src="${emoticons[emote]}" height="${size}" width="${size}">)`;
			this.sendReply(`|raw|<div class="infobox infobox-limited">${reply}</div>`);
		},

		ignore: function (target, room, user) {
			if (WL.ignoreEmotes[user.userid]) return this.errorReply(`You are already ignoring emoticons.`);
			WL.ignoreEmotes[user.userid] = true;
			FS(`config/ignoreemotes.json`).writeSync(JSON.stringify(WL.ignoreEmotes));
			this.sendReply(`You are now ignoring emoticons.`);
		},

		unignore: function (target, room, user) {
			if (!WL.ignoreEmotes[user.userid]) return this.errorReply(`You aren't ignoring emoticons.`);
			delete WL.ignoreEmotes[user.userid];
			FS(`config/ignoreemotes.json`).writeSync(JSON.stringify(WL.ignoreEmotes));
			this.sendReply(`You are no longer ignoring emoticons.`);
		},

		size: function (target, room, user) {
			if (room.id === `lobby` && !this.can(`emote`) || room.id !== `lobby` && !this.can(`emote`, null, room)) return false;
			if (!target) return this.sendReply(`Usage: /emoticons size [number]`);

			let size = Math.round(Number(target));
			if (isNaN(size)) return this.errorReply(`"${target}" is not a valid number.`);
			if (size < 15) return this.errorReply(`Size may not be less than 15.`);
			if (size > 100) return this.errorReply(`Size may not be more than 100.`);

			room.emoteSize = size;
			room.chatRoomData.emoteSize = size;
			Rooms.global.writeChatRoomData();
			this.privateModAction(`${user.name} has changed emoticon size in this room to ${size}.`);
		},

		"": "help",
		help: function (target, room, user) {
			this.parse("/emoticonshelp");
		},
	},

	randemote: function (target, room, user, connection) {
		if (!this.canTalk()) return;
		if (!room.isOfficial) return this.errorReply(`You may only use this command in unofficial rooms.`);
		let e = Object.keys(emoticons)[Math.floor(Math.random() * Object.keys(emoticons).length)];
		this.parse(e);
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
		/emoticon size [size] - Changes the size of emoticons in the current room.
		/randemote - Randomly sends an emote from the emoticon list.`,
	],
};

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); // eslint-disable-line no-useless-escape
}
