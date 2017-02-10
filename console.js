'use strict';

class Console {
	constructor(user, room, css, html, bottom, muted, sound) {
		this.userid = user.userid;
		this.consoleId = user.consoleId + 1 || 1;
		user.consoleId = this.consoleId;
		this.room = room.id;
		this.muted = !!muted;
		this.sound = sound || null;
		this.curScreen = [null, null, null];
		this.screenCSS = css || 'background-color: #000; font-size: 12px';
		let defaultInfo = '<div style="display: inline-block; color: white; font-family: monospace;">#####################<br/>## PS Game Console ##<br/>#####################<br/><br/>This is the default screen. You probably meant to launch a game.<br/>General Options:<br/><br/>';
		for (let game in SG.gameList) {
			if (!SG.gameList[game].startCommand) continue;
			defaultInfo += '<button name="send" value="/console forcestart ' + game + '" style="border: none; background: none; color: #FFF; font-family: monospace;"><u>' + (SG.gameList[game].name ? SG.gameList[game].name : game) + '</u></button>';
		}
		defaultInfo += '<br/><button name="send" value="/console kill" style="border: none; background: none; color: #FFF; font-family: monospace;"><u>Shutdown</u></button></div>';
		this.defaultHTML = html || defaultInfo;
		this.defaultBottomHTML = bottom || '<center><button name="send" value="/console sound" class="button">Toggle Sound</button></center>';
	}
	init() {
		Users(this.userid).sendTo(this.room, '|uhtml|console' + this.userid + this.consoleId + '|' + this.buildConsole());
	}
	update(css, html, bottom) {
		Users(this.userid).sendTo(this.room, '|uhtmlchange|console' + this.userid + this.consoleId + '|' + this.buildConsole(css, html, bottom));
		this.curScreen = [(css || null), (html || null), (bottom || null)];
	}
	buildConsole(css, html, bottom) {
		return '<div class="infobox" style="height: 400px;"><audio autoplay loop ' + (this.muted ? 'muted' : '') + ' src="' + (this.sound || '') + '"></audio><button style="border: none; color:black; background-color: #999; width:100%; height: 7%; display: block" name="send" value="/console up">&#8593;</button><button style="border: none; color:black; background-color: #999; width: 7%; height: 70%; display: inline-block; float: left" name="send" value="/console left">&#8592;</button><div style="width:86%; height: 70%; display: inline-block; position: relative; ' + (css ? css : this.screenCSS) + '">' + (html ? html : this.defaultHTML) + '</div><button style="border: none; color:black; background-color: #999; width:7%; height: 70%; display: inline-block; float: right" name="send" value="/console right">&#8594;</button><button style="border: none; color:black; background-color: #999; width:100%; height: 7%; display: block" name="send" value="/console down">&#8595;</button><div style="border: 0.45em solid #6688AA; width: 99%; height: 13%; font-size: 14px">' + (bottom ? bottom : this.defaultBottomHTML) + '</div></div>';
	}
	toggleSound() {
		this.muted = !this.muted;
		this.update(this.curScreen[0], this.curScreen[1], this.curScreen[2]);
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
		sound: function (target, room, user, connection, cmd, message) {
			if (!user.console) return;
			user.console.toggleSound();
		},
		forcestart: 'start',
		start: function (target, room, user, connection, cmd, message) {
			if (user.console && cmd !== 'forcestart') return;
			if (cmd === 'forcestart') this.parse('/console kill');
			if (!target || Object.keys(SG.gameList).indexOf(toId(target)) === -1) {
				user.console = new Console(user, room);
				return user.console.init();
			}
			return this.parse(SG.gameList[toId(target)].startCommand);
		},
		kill: function (target, room, user, connection, cmd, message) {
			if (!user.console) return;
			user.sendTo(user.console.room, '|uhtmlchange|console' + user.userid + user.consoleId + '|');
			delete user.console;
		},
	},
};
exports.Console = Console;
