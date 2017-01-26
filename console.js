'use strict';

const fs = require('fs');
const path = require('path');
let gameList = false;

function loadGames() {
	if (gameList) return;
	gameList = {};

	for (let file of fs.readdirSync(path.resolve(__dirname, 'game-cards'))) {
		if (file.substr(-3) !== '.js') continue;
		Object.assign(gameList, require('./game-cards/' + file).box);
	}
}

class Console {
	constructor(user, room, css, html, bottom) {
		this.userid = user.userid;
		this.room = room.id;
		this.screenCSS = (css ? css : 'background-color: #000; font-size: 12px');
		let defaultInfo = '<div style="display: inline-block; color: white; font-family: monospace;">#####################<br/>## PS Game Console ##<br/>#####################<br/><br/>This is the default screen. You probably meant to launch a game.<br/>General Options:<br/><br/>';
		for (let game in gameList) {
			if (!gameList.startCommand) continue;
			defaultInfo += '<button name="send" value="' + gameList.startCommand + '" style="border: none; background: none; color: #FFF; font-family: monospace;"><u>' + (gameList.name ? gameList.name : 'Untitled Game') + '</u></button>';
		}
		defaultInfo += '<br/><button name="send" value="/console kill" style="border: none; background: none; color: #FFF; font-family: monospace;"><u>Shutdown</u></button></div>';
		this.defaultHTML = (html ? html : defaultInfo);
		this.defaultBottomHTML = (bottom ? bottom : '<audio autoplay loop>Your browser does not support the ' + Chat.escapeHTML('<audio>') + ' tag.</audio>');
	}
	init() {
		Users(this.userid).sendTo(this.room, '|uhtml|console' + this.userid + '|' + this.buildConsole());
	}
	update(css, html, bottom) {
		Users(this.userid).sendTo(this.room, '|uhtmlchange|console' + this.userid + '|' + this.buildConsole(css, html, bottom));
	}
	buildConsole(css, html, bottom) {
		return '<div class="infobox" style="height: 400px; font-size: 0"><button style="border: none; color:black; background-color: #999; width:100%; height: 7%; display: block" name="send" value="/console up">&#8593;</button><button style="border: none; color:black; background-color: #999; width: 7%; height: 70%; display: inline-block; float: left" name="send" value="/console left">&#8592;</button><div style="width:86%; height: 70%; display: inline-block; ' + (css ? css : this.screenCSS) + '">' + (html ? html : this.defaultHTML) + '</div><button style="border: none; color:black; background-color: #999; width:7%; height: 70%; display: inline-block; float: right" name="send" value="/console right">&#8594;</button><button style="border: none; color:black; background-color: #999; width:100%; height: 7%; display: block" name="send" value="/console down">&#8595;</button><div style="border: 0.45em solid #6688AA; width: 99%; height: 13%; font-size: 14px">' + (bottom ? bottom : this.defaultBottomHTML) + '</div></div>';
	}
	// Overwrite these to use them.
	up(data) {}
	down(data) {}
	left(data) {}
	right(data) {}
}

exports.commands = {
	console: {
		up: function (target, room, user, connection, cmd, message) {
			if (!user.console) return;
			user.console.up(target);
		},
		down: function (target, room, user, connection, cmd, message) {
			if (!user.console) return;
			user.console.down(target);
		},
		left: function (target, room, user, connection, cmd, message) {
			if (!user.console) return;
			user.console.left(target);
		},
		right: function (target, room, user, connection, cmd, message) {
			if (!user.console) return;
			user.console.right(target);
		},
		start: function (target, room, user, connection, cmd, message) {
			if (!user.console) user.console = new Console(user, room);
			user.console.init();
		},
		kill: function (target, room, user, connection, cmd, message) {
			if (!user.console) return;
			user.sendTo(user.console.room, '|uhtmlchange|console' + user.userid + '|');
			delete user.console;
		},
	},
};

loadGames();