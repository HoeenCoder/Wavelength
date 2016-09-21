'use strict';

exports.commands = {
	helpleader: 'leaderhelp',
	leaderhelp: function (target, room, user) {
		if (!this.can('roomowner')) return false;
		if (!this.canTalk()) return this.errorReply("You cannot do this while unable to speak.");
		return this.sendReplyBox(
			'<b><u><font color="#008ae6">SpacialGaze\'s Leader Commands:</u></b></font><br /><br />' +
			'<font size = 1><b>/rangelock [domain]</b> - locks a user\'s domain/host <br />' +
			'<b>/banip [IP] OR /unbanip</b> - bans a particular IP address from the server <br />' +
			'<b>/globalvoice [username] OR /globaldevoice</b> - promotes/demotes a user to or from Global Voice <br />' +
			'<b>/globaldriver [username] OR /globaldedriver</b> - promotes/demotes a user to or from Global Driver <br />' +
			'<b>/globalmod [username] OR /globaldemod</b> - promotes/demotes a user to or from Global Moderator <br />' +
			'<b>/globaldeauth [username]</b> - demotes a user to Regular user <br />' +
			'<b>/unbanall</b> - unbans a range of IP addresses <br />' +
			'<b>/permaban [username] OR /permaunban</b> - permanently bans a user <br />' +
			'<b>/permalock [username] OR /permaunlock</b> - permanently locks a user <br />' +
			'<b>/declare [message]</b> - posts a big blue declare in the room anonymously <br />' +
			'<b>/forcetie or /forcewin [username]</b> - forces the game to end in a Tie or let a user win a battle <br />' +
			'<b>/modchat [off/autoconfirmed/+/%/@/&/#/~]</b> - allows modchat to be set to ANY level <br />' +
			'<b>/roomintro [html code]</b> - creates a Room Intro for that particular room <br />' +
			'<b>/roomdesc [message]</b> - lets the room welcome message in the server\'s room list <br />' +
			'<b>showimage [url], [width], [height]</b> - shows an image to the room <br />' +
			'<b>!htmlbox [HTML Code]</b> - creates a short box using HTML (do /htmlbox to not broadcast) <br />' +
			'<b>/roomowner [username]</b> - appoints a Room Owner in the room <br />' +
			'<b>/host [ip]</b> - gets the host for the given IP <br />' +
			'<b>/secretroom</b> -  Makes a room secret. Secret rooms are visible to & and up <br />' +
			'<b>/publicroom [on/off]</b> - Makes the chatroom public <br />' +
			'<b>/officialroom </b> - Allows the chatroom to become official on the server <br />' +
			'<b>/hiddenroom [on/off]</b> - Makes a room hidden that is visible to % and inherit global ranks <br />' +
			'<b>/makechatroom [name]</b> - creates a public chat room for the server <br />' +
			'<b>/deleteroom [name]</b> - automatically deletes a chat room <br />' +
			'<b>/icon [user], [image URL]</b> - gives the user a set icon in the userlist</font>'
		);
	},
};
