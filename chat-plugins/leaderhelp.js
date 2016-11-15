 'use strict';

exports.commands = {
	helpleader: 'leaderhelp',
	leaderhelp: function (target, room, user) {
		if (!this.can('roomowner')) return false;
		if (!this.canTalk()) return this.errorReply("You cannot do this while unable to speak.");
		return this.sendReplyBox(
			'<b><u><font color="#008ae6">SpacialGaze\'s Leader Commands:</u></b></font><br /><br />' +
			'<font size = 1><b>/lockip [IP]</b> - locks a particular IP address from the server. Exisiting users on the IP will not be locked. <br />' +
			'<b>/banip [IP] OR /unbanip</b> - bans a particular IP address from the server. Exisiting users on the IP will not be banned. <br />' +
			'<b>/globalvoice [username] OR /globaldevoice</b> - promotes/demotes a user to or from Global Voice <br />' +
			'<b>/globaldriver [username] OR /globaldedriver</b> - promotes/demotes a user to or from Global Driver <br />' +
			'<b>/globalmod [username] OR /globaldemod</b> - promotes/demotes a user to or from Global Moderator <br />' +
			'<b>/globaldeauth [username]</b> - demotes a user to Regular user <br />' +
			'<b>/unbanall</b> - unbans all IP addresses <br />' +
			'<b>/declare [message] or /greendeclare [message] or /reddeclare [message]</b> - Anonymously announces a message in a room in the color specified in the command (/decalre = blue) <br />' +
			'<b>/forcetie or /forcewin [username]</b> - forces the game to end in a Tie or let a user win a battle <br />' +
			'<b>/modchat [off/autoconfirmed/+/%/@/&/#/~]</b> - allows modchat to be set to ANY level <br />' +
			'<b>/roomintro [html code]</b> - creates a Room Intro for that particular room <br />' +
			'<b>/roomdesc [message]</b> - lets the room welcome message in the server\'s room list <br />' +
			'<b>!showimage [url], [width], [height]</b> - shows an image to the room <br />' +
			'<b>!htmlbox [HTML Code]</b> - creates a short box using HTML (do /htmlbox to not broadcast) <br />' +
			'<b>/roomowner [username]</b> - appoints a Room Owner in the room <br />' +
			'<b>/host [ip]</b> - gets the host for the given IP <br />' +
			'<b>/secretroom</b> -  Makes a room secret. Secret rooms are visible to & and up, and does not inherit global ranks <br />' +
			'<b>/publicroom [on/off]</b> - Makes the chatroom public <br />' +
			'<b>/officialroom </b> - Allows the chatroom to become official on the server <br />' +
			'<b>/hiddenroom [on/off]</b> - Makes a room hidden that is visible to % and inherit global ranks <br />' +
			'<b>/makechatroom [name]</b> - creates a public chat room for the server <br />' +
			'<b>/makeprivatechatroom [name]</b> - creates a secret chat room for the server <br/>' +
			'<b>/deleteroom [name]</b> - automatically deletes a chat room <br />' +
			'<b>/icon [user], [image URL]</b> - gives the user a set icon in the userlist</font> <br />' +
			'<b>/viewlogs</b> - makes you have access to any log from any room from any date <br />' +
			'<b>/setavatar [username], [URL]</b> - Sets the avatar for the user <br />' +
			'<b>/deleteavatar [username]</b> - Deletes the user\'s avatar <br />' +
			'<b>/moveavatar [username1], [username2]</b> - Moves the custom avatar from original username to a different username <br />' +
			'<b>/emote add, [name], [url]</b> - Adds an emoticon <br />' +
			'<b>/emote del/delete/remove/rem, [name]</b> - Removes an emoticon <br />' +
			'<b>/emote enable/on/disable/off</b> - Enables or disables emoticons in the current room <br />' +
			'<b>/emote list/view</b> - Displays the list of emoticons <br />' +
			'<b>/emote ignore</b> - Ignores emoticons in chat messages<br />' +
			'<b>/emote unignore</b> - Unignores emoticons in chat messages <br />' +
			'<b>/emote help</b> - Displays the help command.<br />' +
			'<b>/voucher give [user], [voucher], (item/amount)</b> - Give a user a voucher.<br />' +
			'<b>/voucher take [user], [id]</b> - Take a user\'s voucher away.<br />' +
			'<b>/voucher list (user)</b> - List the vouchers of a user.<br />' +
			'<b>/clearall</b> - clears the entire chat of a room (use it only if needed)<br />' +
			'<b>/roomlist</b> - displays the list of public/private/official/battle rooms and the total amount of users connected on the server<br />' +
			'<b>/hide [rank]</b> - Hides user\'s global rank to specified rank. [none/+/%/@/&]<br />' +
			'<b>/show</b> - Displays your global rank <br />' +
			'<b>/givecurrency [user], [amount]</b> - gives a special amount of Stardust to a user (needs a reason) <br />' +
			'<b>/takecurrency [user], [amount]</b> - removes a special amount of Stardust from a user (needs a reason) <br />' +
			'<b>/moneylog [number]</b> - to view the last x lines <br />' +  
			'<b>/moneylog [text]</b> - to search for text <br />' +
			'<b>/pmall [message]</b> - sends a pm to all users connected to SG <br />' +
			'<b>/pmallstaff [message] or /staffpm [message]</b> - sends a pm to all staff members connected to SG <br />' +
			'<b>/greendeclare [message] or /reddeclare [message]</b> - Anonymously announces a message in a room <br />' +
			'& all lower commands.'
		);
	},
};
