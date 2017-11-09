'use strict';

exports.commands = {
	helpstaff: 'staffhelp',
	staffhelp: function (target, room, user) {
		if (!this.can('lock')) return false;
		if (!this.canTalk()) return this.errorReply("You cannot do this while unable to speak.");
		let out = '<b><u><font color="#008ae6"; size="3"><center>Wavelength\'s Global Staff Commands:</center></u></b></font><br />' +
			'<details><summary>Global Driver Commands (%)</summary>' +
			'<b>/warn OR /k [user], [reason]</b> - warns a user and shows the Pokémon Showdown rules <br />' +
			'<b>/mute OR /m [user], [reason]</b> - mutes a user for seven minute with a reason <br />' +
			'<b>/hourmute OR /hm [user], [reason]</b> - mutes a user for an hour with a reason <br />' +
			'<b>/unmute [user]</b> - unmutes a user and allows them to talk in chat <br />' +
			'<b>/announce OR /wall [message]</b> - makes an announcement in a chatroom <br />' +
			'<b>/modlog [user]</b> - search the moderator log of the room <br />' +
			'<b>/modnote [note]</b> - adds a moderator note that can be read through modlog <br />' +
			'<b>/alts [user]</b> - shows a user\'s recent alts <br />' +
			'<b>/forcerename OR /fr [user], [reason]</b> - forcibly changes a user\'s name and shows them the [reason] <br />' +
			'<b>/lock OR /l [user], [reason]</b> - locks a user from talking in all chats <br />' +
			'<b>/weeklock OR /wl [user], [reason]</b> - same as /lock, but locks for a week <br />' +
			'<b>/unlock [user]</b> - unlocks the user and allows them to talk again <br />' +
			'<b>/redirect OR /redir [user], [roomname]</b> - attempts to redirect the [user] to the room [roomname] <br />' +
			'<b>/kick [user]</b> - Kick a user out of a room. Requires: % @ # & ~ <br />' +
			'<b>/namelock OR /nl [user], [reason]</b> - Name locks a user and shows them the [reason]. Requires: % @ * & ~ <br />' +
			'<b>/unnamelock [user]</b> - Unnamelocks the user. Requires: % @ * & ~ <br />' +
			'<b>/hidetext [user]</b> - Removes a locked or banned user\'s messages from chat (includes users banned from the room). Requires: % (global only), @ * # & ~ <br />' +
			'<b>/hidealtstext [user]</b> - Removes a locked or banned user\'s messages, and their alternate account\'s messages from the chat (includes users banned from the room).  Requires: % (global only), @ * # & ~ <br />' +
			'<b>/roomlist</b> - displays the list of rooms and the total amount of users connected on the server. What rooms you see change can increase with your rank.<br />' +
			'<b>/hide [rank]</b> - Hides user\'s global rank to specified rank. [none/+/%/@/&/~] You can\'t hide as a higher rank than your own.<br />' +
			'<b>/show</b> - Displays your global rank <br />' +
			'<b>/survey create [question]</b> - Create a survey. Requires % @ # & ~ <br />' +
			'<b>/survey results</b> - View the results of the survey. You can\'t go back and answer if you havent already. <br />' +
			'<b>/survey display</b> - Display the survey. <br />' +
			'<b>/survey remove [user]</b> - Removes a users reply and prevents them from sending in a new one for this survey. Requires: % @ # & ~ <br />' +
			'<b>/survey end</b> - Ends a survey and displays the results. Requires: % @ # & ~ <br />' +
			'<b>/survey timer [time in minutes]</b> - Sets a timer for the survey to automatically end. Require % @ # & ~ <br />' +
			'<b>/hangman create [word], [hint]</b> - Makes a new hangman game. Requires: % @ * # & ~ <br />' +
			'<b>/hangman display</b> - Displays the game. <br />' +
			'<b>/hangman end</b> - Ends the game of hangman before the man is hanged or word is guessed. Requires: % @ * # & ~ <br />' +
			'<b>/poll create [question], [option1], [option2], [...]</b> - Allows up to 5 polls at once per room. Creates a poll. Requires: % @ * # & ~ <br />' +
			'<b>/poll timer [minutes], [poll id number]</b> - Sets the poll to automatically end after [minutes]. Requires: % @ * # & ~ <br />' +
			'<b>/poll display [poll id number]</b> - Displays the poll. The poll id number is optional for this command and displays only the poll with the matching id number. <br />' +
			'<b>/poll end [poll id number]</b> - Ends a poll and displays the results. The poll id number is optional for this command and ends only the poll with the matching id number. and Requires: % @ * # & ~ <br />' +
			'<b>/uno create [player cap]</b> - creates a new UNO game with an optional player cap (default player cap at 6). Use the command `createpublic` to force a public game or `createprivate` to force a private game. Requires: % @ * # & ~ <br />' +
			'<b>/uno timer [amount]</b> - sets an auto disqualification timer for `amount` seconds. Requires: % @ * # & ~ <br />' +
			'<b>/uno end</b> - ends the current game of UNO. Requires: % @ * # & ~ <br />' +
			'<b>/uno start</b> - starts the current game of UNO. Requires: % @ * # & ~ <br />' +
			'<b>/uno disqualify [player]</b> - disqualifies the player from the game. Requires: % @ * # & ~ <br />' +
			'<b>/uno getusers</b> - displays the players still in the game. <br />' +
			'<b>/lottery new</b> - Creates a new Lottery drawing. Must be a Room Driver or higher. <br />' +
			'<b>/lottery start</b> - Forcefully starts a Lottery drawing (instead of starting automatically in 24 hours from creation). Must be a Room Driver or higher. <br />' +
			'<b>/lottery end</b> - Forcefully ends a Lottery drawing. Must be a Room Driver or higher. <br />' +
			'<b>/tour create/new [format], [type]</b> - Creates a new tournament in the current room. <br />' +
			'<b>/tour settype [type]</b> - Modifies the type of tournament after it\'s been created, but before it has started. <br />' +
			'<b>/tour cap/playercap [cap]</b> - Sets the player cap of the tournament before it has started. <br />' +
			'<b>/tour rules/banlist [rule]</b> - Sets the custom rules for the tournament before it has started. <br />' +
			'<b>/tour viewrules/viewbanlist</b> - Shows the custom rules for the tournament. <br />' +
			'<b>/tour clearrules/clearbanlist</b> - Clears the custom rules for the tournament before it has started. <br />' +
			'<b>/tour name [name]</b> - Sets a custom name for the tournament. <br />' +
			'<b>/tour clearname</b> - Clears the custom name of the tournament. <br />' +
			'<b>/tour end/stop/delete</b> - Forcibly ends the tournament in the current room. <br />' +
			'<b>/tour begin/start</b> - Starts the tournament in the current room. <br />' +
			'<b>/tour autostart/setautostart [on|minutes|off]</b> - Sets the automatic start timeout. <br />' +
			'<b>/tour dq/disqualify [user]</b> - Disqualifies a user. <br />' +
			'<b>/tour autodq/setautodq [minutes|off]</b> - Sets the automatic disqualification timeout. <br />' +
			'<b>/tour runautodq</b> - Manually run the automatic disqualifier. <br />' +
			'<b>/tour scouting [allow|disallow]</b> - Specifies whether joining tournament matches while in a tournament is allowed. <br />' +
			'<b>/tour modjoin [allow|disallow]</b> - Specifies whether players can modjoin their battles. <br />' +
			'<b>/tour forcetimer [on|off]</b> - Turn on the timer for tournament battles. <br />' +
			'<b>/tour getusers</b> - Lists the users in the current tournament. <br />' +
			'<b>/tour announce/announcements [on|off]</b> - Enables/disables tournament announcements for the current room. <br />' +
			'<b>/tour banuser/unbanuser [user]</b> - Bans/unbans a user from joining tournaments in this room. Lasts 2 weeks. <br />' +
			'</details>';
		if (user.can('ban')) {
			out += '<details><summary>Global Moderator Commands (@)</summary>' +
			'<b>/globalban OR /gban [user], [reason]</b> - kicks user from all rooms and bans user\'s ip address with reason <br />' +
			'<b>/globalunban [user]</b> - unbans a user from the server <br />' +
			'<b>/roomban [user], [reason]</b> - Bans the user from the room you are in. Requires: @ # & ~ <br />' +
			'<b>/roomunban [user]</b> - Unbans the user from the room you are in. Requires: @ # & ~ <br />' +
			'<b>/ip [user]</b> - shows a user\'s ip address <br />' +
			'<b>/modchat [off/autoconfirmed/+/%/@/*/player/#/&/~]</b> - Sets the level of moderated chat to a certain rank <br />' +
			'<b>/news delete [news title]</b> - Deletes announcement with the [title]. Requires @, &, ~ <br />' +
			'<b>/news add [news title], [news desc]</b> - Adds news [news]. Requires @, &, ~ <br />' +
			'<b>/markshared [ip]</b> - Marks an IP address as shared. Requires @, &, ~ <br />' +
			'<b>/unmarkshared [ip]</b> - Unmarks a shared IP address. Requires @, &, ~ <br />' +
			'<b>As well as all the commands listed above <br />' +
			'</details>';
		}
		if (user.can('roomowner')) {
			out += '<details><summary>Global Leader Commands (&)</summary>' +
			'<b>/lockip [IP]</b> - locks a particular IP address from the server. Exisiting users on the IP will not be locked. <br />' +
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
			'<b>/icon [user], [image URL]</b> - gives the user a set icon in the userlist <br />' +
			'<b>/viewlogs</b> - makes you have access to any log from any room from any date <br />' +
			'<b>/setavatar [username], [URL]</b> - Sets the avatar for the user <br />' +
			'<b>/deleteavatar [username]</b> - Deletes the user\'s avatar <br />' +
			'<b>/moveavatar [username1], [username2]</b> - Moves the custom avatar from original username to a different username <br />' +
			'<b>/customcolor set [user], [hex]</b> - Gives [user] a custom color of [hex] <br />' +
			'<b>/customcolor delete [user], delete</b> - Deletes a user\'s custom color <br />' +
			'<b>/customcolor reload</b> - Reloads colours. <br />' +
			'<b>/customcolor preview [user], [hex]</b> - Previews what that username looks like with [hex] as the color. <br />' +
			'<b>/emote add, [name], [url]</b> - Adds an emoticon <br />' +
			'<b>/emote del/delete/remove/rem, [name]</b> - Removes an emoticon <br />' +
			'<b>/emote enable/on/disable/off</b> - Enables or disables emoticons in the current room <br />' +
			'<b>/emote list/view</b> - Displays the list of emoticons <br />' +
			'<b>/emote ignore</b> - Ignores emoticons in chat messages<br />' +
			'<b>/emote unignore</b> - Unignores emoticons in chat messages <br />' +
			'<b>/emote help</b> - Displays the help command.<br />' +
			'<b>/clearall</b> - clears the entire chat of a room (use it only if needed)<br />' +
			'<b>/givecurrency [user], [amount]</b> - gives a special amount of Stardust to a user (needs a reason) <br />' +
			'<b>/takecurrency [user], [amount]</b> - removes a special amount of Stardust from a user (needs a reason) <br />' +
			'<b>/moneylog [number]</b> - to view the last x lines <br />' +
			'<b>/moneylog [text]</b> - to search for text <br />' +
			'<b>/pmall [message]</b> - sends a pm to all users connected to Wavelength <br />' +
			'<b>/pmallstaff [message] or /staffpm [message]</b> - sends a pm to all staff members connected to Wavelength <br />' +
			'<b>/greendeclare [message] or /reddeclare [message]</b> - Anonymously announces a message in a room <br />' +
			'<b>/roomrequests - Manage room requests, use /help roomrequests for more info. <br />' +
			'<b>/checkroomrequest [user] - Check a room request <br />' +
			'<b>/hide</b> - Hides user\'s global rank. Requires: & ~ <br />' +
			'<b>/tour on/enable [%|@]</b> - Enables allowing drivers or mods to start tournaments in the current room. <br />' +
			'<b>/tour off/disable</b> - Disables allowing drivers and mods to start tournaments in the current room. <br />' +
			'<b>/show</b> - Displays user\'s global rank. Requires: & ~ <br />' +
			'<b>/hangman [enable/disable]</b> - Enables or disables hangman from being started in a room. Requires: # & ~ <br />' +
			'<b>/poll htmlcreate [question], [option1], [option2], [...]</b> - Allows up to 5 polls at once per room. Creates a poll, with HTML allowed in the question and options. Requires: # & ~ <br />' +
			'<b>As well as all the commands listed above <br />' +
			'</details>';
		}
		if (user.can('lockdown')) {
			out += '<details><summary>Global Administrator Commands (~)</summary>' +
			'<b>/autolockdown</b> - Sets the server to automatically use /kill once all battles have finished after the server is locked down. <br />' +
			'<b>/prelockdown</b> - Prevents new tournaments from being created in preperation for a server restart. <br />' +
			'<b>/lockdown</b> - Locks the server down, preventing new battles from starting so the server can be restarted. <br />' +
			'<b>/slowlockdown</b> - /lockdown, but the timer in battles and games that support it are not started. <br />' +
			'<b>/endlockdown</b> - Unlocks the server, cancelling the server restart. <br />' +
			'<b>/kill</b> - Stops the server, can only be used while the server is locked down. <br />' +
			'<b>/emergency</b> - Enables emergency mode. <br />' +
			'<b>/endemergency</b> - Disables emergency mode. <br />' +
			'<b>/htmldeclare</b> - Declare with HTML. (/redhtmldeclare and /greenhtmldeclare change the color of the declare box) <br />' +
			'<b>/globaldeclare</b> - Declare in all rooms (HTML supported). (/redglobaldeclare and /greenglobaldeclare change the color of the declare box) <br />' +
			'<b>/chatdeclare</b> - Declare in all chat rooms (not battles) (HTML supported). (/redchatdeclare and /greenchatdeclare change the color of the declare box) <br />' +
			'<b>/permalock [user]</b> - Permanently locks a user from talking on this server. <br />' +
			'<b>/permaban [user]</b> - Permanently bans a user from this server. <br />' +
			'<b>/unpermalock [user]</b> - Undoes a permalock. <br />' +
			'<b>/unpermaban [user]</b> - Undoes a permaban. <br />' +
			'<b>/crashfixed</b> - Ends a lockdown started by a server crash. <br />' +
			'<b>/psgo reset</b> - Takes all users cards and packs. <br />' +
			'<b>/expon</b>  - Enable EXP gain for yourself. <br />' +
			'<b>/expoff</b> - Disable EXP gain for yourself. <br />' +
			'<b>/autoconfirm [user]</b> - Grants a user autoconfirmed status on this server only. <br />' +
			'<b>/forcejoin [user], [room]</b> - Force a user to join a room. <br />' +
			'<b>/globalclearall</b> - Clear all rooms chats. <br />' +
			'<b>!restarthelp</b> - Displays a box with information on server restarts. Anyone may use this while the server is locked down. <br />' +
			'<b>/hotpatch chat</b> - reload chat-commands.js and the chat-plugins <br />' +
			'<b>/hotpatch battles</b> - spawn new simulator processes <br />' +
			'<b>/hotpatch validator</b> - spawn new team validator processes <br />' +
			'<b>/hotpatch formats</b> - reload the sim/dex.js tree, rebuild and rebroad the formats list, and spawn new simulator and team validator processes <br />' +
			'<b>/hotpatch dnsbl</b> - reloads Dnsbl datacenters <br />' +
			'<b>/hotpatch punishments</b> - reloads new punishments code <br />' +
			'<b>/hotpatch tournaments</b> - reloads new tournaments code <br />' +
			'<b>/hotpatch all</b> - hot-patches chat, tournaments, formats, login server, punishments, and dnsbl <br />' +
			'<b>As well as all commands listed above <br />' +
			'</details>';
		}
		return this.sendReplyBox(out);
	},
};
