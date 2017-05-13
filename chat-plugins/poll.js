/*
 * Poll chat plugin
 * By bumbadadabum and Zarel.
 */

'use strict';

class Poll {
	constructor(room, questionData, options) {
		if (room.pollNumber) {
			room.pollNumber++;
		} else {
			room.pollNumber = 1;
		}
		this.room = room;
		this.question = questionData.source;
		this.supportHTML = questionData.supportHTML;
		this.voters = {};
		this.voterIps = {};
		this.totalVotes = 0;
		this.timeout = null;
		this.timeoutMins = 0;
		this.startTime = Date.now();
		this.startedUser = SG.nameColor(questionData.username, true, true);

		this.options = new Map();
		for (let i = 0; i < options.length; i++) {
			this.options.set(i + 1, {
				name: options[i],
				votes: 0,
			});
		}
	}

	vote(user, option) {
		let ip = user.latestIp;
		let userid = user.userid;

		if (userid in this.voters || ip in this.voterIps) {
			return user.sendTo(this.room, "You have already voted for this poll.");
		}

		this.voters[userid] = option;
		this.voterIps[ip] = option;
		this.options.get(option).votes++;
		this.totalVotes++;

		this.update();
	}

	blankvote(user, option) {
		let ip = user.latestIp;
		let userid = user.userid;

		if (userid in this.voters || ip in this.voterIps) {
			user.sendTo(this.room, "You're already looking at the results.");
		} else {
			this.voters[userid] = 0;
			this.voterIps[ip] = 0;
		}

		this.updateTo(user);
	}

	generateVotes() {
		let count = 0;
		let output = '<div style="border-top-right-radius: 20px; border-top-left-radius: 20px;"><table cellspacing="0" style="background: rgba(0, 0, 0, 0.4); width: 100%; border: 1px solid #FFFF00; border-bottom: none; border-top-right-radius: 20px; border-top-left-radius: 20px;"><tr><td colspan="4" class="poll-td" style="background: rgba(0, 0, 0, 0.4); background: linear-gradient(rgba(70, 173, 212, 0.5), rgba(126, 192, 238, 0.8)); border-bottom: 1px solid #79330A; border-top-right-radius: 20px; border-top-left-radius: 20px; text-shadow: 0px 0px 2px #EEE; box-shadow: 1px 1px 1px rgba(255, 255, 255, 0.8) inset, 0px 0px 1px rgba(0, 0, 0, 0.5) inset;"><span style="border: 1px solid #3B763B; color: #2D5A2D; border-radius: 4px; padding: 0 3px; box-shadow: 0px 0px 2px rgba(255, 255, 255, 0.8);"><i class="fa fa-bar-chart"></i> Poll</span> <strong style="font-size: 11pt; color: #512106;">' + this.getQuestionMarkup() + '</strong><img src="https://pldh.net/media/pokecons_action/385.gif" width="32" height="32"><br /></td></tr>';
		this.options.forEach((option, number) => {
			count++;
			if (count === 1) output += "<tr>";
			output += '<td class="poll-td"><button style="border-radius: 20px; transition-duration: 0.5s; transition-timing-function: linear;" value="/poll vote ' + number + '" name="send" title="Vote for ' + number + '. ' + Chat.escapeHTML(option.name) + '"' + (option.void ? ' disabled' : '') + '>' + Chat.escapeHTML(option.name) + '</button></td>';
			if (count >= 4) {
				output += "</tr>";
				count = 0;
			}
		});
		output += '</table></div><div style="background: rgba(0, 0, 0, 0.4); padding: 8px 0px; text-align: center; border: 1px solid #FFFF00; border-top: none; border-bottom-right-radius: 20px; border-bottom-left-radius: 20px;"><button value="/poll results" name="send" title="View results - you will not be able to vote after viewing results" class="poll-results-btn" style="border-radius: 20px; transition-duration: 0.5s; transition-timing-function: linear;"><small>(View results)</small></button></div>';
		return output;
	}

	generateResults(ended, option) {
		let icon = '<span style="border: 1px solid #' + (ended ? '777; color: #555' : '3B763B; color: #2D5A2D') + '; border-radius: 4px; padding: 0 3px; box-shadow: 0px 0px 2px rgba(255, 255, 255, 0.8);"><i class="fa fa-bar-chart"></i> ' + (ended ? "Poll ended" : "Poll") + '</span>';
		let totalVotes = '<br /><span style="font-style: italic; font-size: 9pt; color: #79330A;">[Total Votes: ' + this.totalVotes + '] (Started by ' + this.startedUser + ' ' + Chat.toDurationString(Date.now() - this.startTime) + ' ago.)</span></div>';
		let output = '<div style="background: rgba(0, 0, 0, 0.4); width: 100%; border: 1px solid #FFFF00; border-radius: 20px;"><div class="poll-td" style="background: rgba(255, 174, 127, 0.8); background: linear-gradient(rgba(70, 173, 212, 0.5), rgba(126, 192, 238, 0.8)); border-bottom: 1px solid #79330A; border-top-right-radius: 20px; border-top-left-radius: 20px; text-shadow: 0px 0px 2px #EEE; box-shadow: 1px 1px 1px rgba(255, 255, 255, 0.8) inset, 0px 0px 1px rgba(0, 0, 0, 0.5) inset;">' + icon + ' <strong style="font-size: 11pt; color: #512106;">' + this.getQuestionMarkup() + '</strong><img src="https://pldh.net/media/pokecons_action/385.gif" width="32" height="32">';
		output += totalVotes;
		output += '<div style="padding: 8px 15px;"><font color="yellow"><small><center>(Options with 0 votes are not shown)</center></small></font>';
		output += '<table cellspacing="0" style="width: 100%;margin-top: 3px;">';
		let iter = this.options.entries();

		let i = iter.next();
		let c = 0;
		let colors = ['#00FFFF', '#66CCCC', '#388E8E'];
		while (!i.done) {
			if (i.value[1].votes && i.value[1].votes !== 0) {
				let percentage = Math.round((i.value[1].votes * 100) / (this.totalVotes || 1));
				output += '<tr><td><strong>' + (i.value[0] === option ? '<em>' : '') + Chat.escapeHTML(i.value[1].name) + (i.value[0] === option ? '</em>' : '') + '</strong> <small>(' + i.value[1].votes + ' vote' + (i.value[1].votes === 1 ? '' : 's') + ')</small></td><td><span style="font-size: 7pt; background: ' + colors[c % 3] + '; padding-right: ' + (percentage * 3) + 'px; border-radius: 20px;"></span><small>&nbsp;' + percentage + '%</small></td></tr>';
			}
			i = iter.next();
			c++;
		}
		if (option === 0 && !ended) output += '<div style="text-align:center; color:yellow;"><small>(You can\'t vote after viewing results)</small></div>';
		output += '</table>';

		return output;
	}

	getQuestionMarkup() {
		if (this.supportHTML) return this.question;
		return Chat.escapeHTML(this.question);
	}

	getOptionMarkup(option) {
		if (this.supportHTML) return option.name;
		return Chat.escapeHTML(option.name);
	}

	update(force) {
		let results = [];

		for (let i = 0; i <= this.options.size; i++) {
			results.push(this.generateResults(false, i));
		}

		// Update the poll results for everyone that has voted
		for (let i in this.room.users) {
			let user = this.room.users[i];
			if (user.userid in this.voters) {
				user.sendTo(this.room, '|uhtmlchange|poll' + this.room.pollNumber + '|' + results[this.voters[user.userid]]);
			} else if (user.latestIp in this.voterIps) {
				user.sendTo(this.room, '|uhtmlchange|poll' + this.room.pollNumber + '|' + results[this.voterIps[user.latestIp]]);
			} else if (force) {
				user.sendTo(this.room, '|uhtmlchange|poll' + this.room.pollNumber + '|' + this.generateVotes());
			}
		}
	}

	updateTo(user, connection) {
		if (!connection) connection = user;
		if (user.userid in this.voters) {
			connection.sendTo(this.room, '|uhtmlchange|poll' + this.room.pollNumber + '|' + this.generateResults(false, this.voters[user.userid]));
		} else if (user.latestIp in this.voterIps) {
			connection.sendTo(this.room, '|uhtmlchange|poll' + this.room.pollNumber + '|' + this.generateResults(false, this.voterIps[user.latestIp]));
		} else {
			connection.sendTo(this.room, '|uhtmlchange|poll' + this.room.pollNumber + '|' + this.generateVotes());
		}
	}

	updateFor(user) {
		if (user.userid in this.voters) {
			user.sendTo(this.room, '|uhtmlchange|poll' + this.room.pollNumber + '|' + this.generateResults(false, this.voters[user.userid]));
		}
	}

	display() {
		let votes = this.generateVotes();

		let results = [];

		for (let i = 0; i <= this.options.size; i++) {
			results.push(this.generateResults(false, i));
		}

		for (let i in this.room.users) {
			let thisUser = this.room.users[i];
			if (thisUser.userid in this.voters) {
				thisUser.sendTo(this.room, '|uhtml|poll' + this.room.pollNumber + '|' + results[this.voters[thisUser.userid]]);
			} else if (thisUser.latestIp in this.voterIps) {
				thisUser.sendTo(this.room, '|uhtml|poll' + this.room.pollNumber + '|' + results[this.voterIps[thisUser.latestIp]]);
			} else {
				thisUser.sendTo(this.room, '|uhtml|poll' + this.room.pollNumber + '|' + votes);
			}
		}
	}

	displayTo(user, connection) {
		if (!connection) connection = user;
		if (user.userid in this.voters) {
			connection.sendTo(this.room, '|uhtml|poll' + this.room.pollNumber + '|' + this.generateResults(false, this.voters[user.userid]));
		} else if (user.latestIp in this.voterIps) {
			connection.sendTo(this.room, '|uhtml|poll' + this.room.pollNumber + '|' + this.generateResults(false, this.voterIps[user.latestIp]));
		} else {
			connection.sendTo(this.room, '|uhtml|poll' + this.room.pollNumber + '|' + this.generateVotes());
		}
	}

	onConnect(user, connection) {
		this.displayTo(user, connection);
	}

	end() {
		let results = this.generateResults(true);

		this.room.send('|uhtmlchange|poll' + this.room.pollNumber + '|<div class="infobox">(The poll has ended &ndash; scroll down to see the results)</div>');
		this.room.add('|html|' + results).update();
	}
}

exports.Poll = Poll;

exports.commands = {
	poll: {
		htmlcreate: 'new',
		create: 'new',
		new: function (target, room, user, connection, cmd, message) {
			if (!target) return this.parse('/help poll new');
			if (target.length > 1024) return this.errorReply("Poll too long.");

			const supportHTML = cmd === 'htmlcreate';
			let separator = '';
			if (target.includes('\n')) {
				separator = '\n';
			} else if (target.includes('|')) {
				separator = '|';
			} else if (target.includes(',')) {
				separator = ',';
			} else {
				return this.errorReply("Not enough arguments for /poll new.");
			}

			let params = target.split(separator).map(param => param.trim());

			if (!this.can('minigame', null, room)) return false;
			if (supportHTML && !this.can('declare', null, room)) return false;
			if (!this.canTalk()) return;
			if (room.poll) return this.errorReply("There is already a poll in progress in this room.");
			if (params.length < 3) return this.errorReply("Not enough arguments for /poll new.");

			if (supportHTML) params = params.map(parameter => this.canHTML(parameter));
			if (params.some(parameter => !parameter)) return;

			let options = [];

			for (let i = 1; i < params.length; i++) {
				options.push(params[i]);
			}

			if (options.length > 36) {
				return this.errorReply("Too many options for poll (maximum is 36).");
			}

			room.poll = new Poll(room, {
				source: params[0],
				supportHTML: supportHTML,
				username: user.name,
			}, options);
			room.poll.display();

			this.logEntry("" + user.name + " used " + message);
			return this.privateModCommand("(A poll was started by " + user.name + ".)");
		},
		newhelp: ["/poll create [question], [option1], [option2], [...] - Creates a poll. Requires: % @ * # & ~"],

		vote: function (target, room, user) {
			if (!room.poll) return this.errorReply("There is no poll running in this room.");
			if (!target) return this.parse('/help poll vote');

			if (target === 'blank') {
				room.poll.blankvote(user);
				return;
			}

			let parsed = parseInt(target);
			if (isNaN(parsed)) return this.errorReply("To vote, specify the number of the option.");

			if (!room.poll.options.has(parsed)) return this.sendReply("Option not in poll.");
			if (room.poll.options.get(parsed).void) return this.sendReply("That option is void.");

			room.poll.vote(user, parsed);
		},
		votehelp: ["/poll vote [number] - Votes for option [number]."],

		void: function (target, room, user) {
			if (!room.poll) return this.errorReply("There is no poll running in this room.");
			if (!target) return this.parse('/help poll void');
			if (!this.can('minigame', null, room)) return false;
			let targetSplit = target.split(',');
			for (let u in targetSplit) targetSplit[u] = targetSplit[u].trim();

			if (targetSplit.length > 10) return this.errorReply("You can't void more than 10 options at a time.");

			let values = [];
			let voided = [];
			let invalid = [];

			room.poll.options.forEach((obj, idx) => {
				values[toId(obj.name)] = idx;
			});
			for (let u in targetSplit) {
				if (!values[toId(targetSplit[u])]) {
					invalid.push(targetSplit[u]);
					continue;
				}
				room.poll.options.get(values[toId(targetSplit[u])]).void = true;
				room.poll.totalVotes -= room.poll.options.get(values[toId(targetSplit[u])]).votes;
				room.poll.options.get(values[toId(targetSplit[u])]).votes = 0;
				voided.push(targetSplit[u]);
			}

			for (let u in room.poll.voters) {
				if (!room.poll.options.get(room.poll.voters[u])) continue;
				let option = room.poll.options.get(room.poll.voters[u]).name;
				if (values[toId(option)]) {
					delete room.poll.voters[u];
				}
			}

			for (let u in room.poll.voterIps) {
				if (!room.poll.options.get(room.poll.voterIps[u])) continue;
				let option = room.poll.options.get(room.poll.voterIps[u]).name;
				if (values[toId(option)]) {
					delete room.poll.voterIps[u];
				}
			}

			room.poll.update(true);
			if (invalid.length > 0) this.sendReply("The following options are not valid options to void: " + invalid.join(', '));
			if (voided.length > 0) this.addModCommand(user.name + " has voided the following poll options: " + voided.join(', '));
		},
		voidhelp: ["/poll void [option] - Voids a poll option. You can specify multiple options by seperating them with a comma."],

		unvoid: function (target, room, user) {
			if (!room.poll) return this.errorReply("There is no poll running in this room.");
			if (!target) return this.parse('/help poll void');
			if (!this.can('minigame', null, room)) return false;
			let targetSplit = target.split(',');
			for (let u in targetSplit) targetSplit[u] = targetSplit[u].trim();

			if (targetSplit.length > 10) return this.errorReply("You can't unvoid more than 10 options at a time.");

			let values = [];
			let voided = [];
			let invalid = [];

			room.poll.options.forEach((obj, idx) => {
				values[toId(obj.name)] = idx;
			});
			for (let u in targetSplit) {
				if (!values[toId(targetSplit[u])]) {
					invalid.push(targetSplit[u]);
					continue;
				}
				if (!room.poll.options.get(values[toId(targetSplit[u])]).void) continue;
				room.poll.options.get(values[toId(targetSplit[u])]).void = false;
				voided.push(targetSplit[u]);
			}

			room.poll.update(true);
			if (invalid.length > 0) this.sendReply("The following options are not valid options to unvoid: " + invalid.join(', '));
			if (voided.length > 0) this.addModCommand(user.name + " has unvoided the following poll options: " + voided.join(', '));
		},
		unvoidhelp: ["/poll unvoid [option] - Undoes /poll void. You can specify multiple options by seperating them with a comma."],

		timer: function (target, room, user) {
			if (!room.poll) return this.errorReply("There is no poll running in this room.");

			if (target) {
				if (!this.can('minigame', null, room)) return false;
				if (target === 'clear' || target === 'off') {
					if (!room.poll.timeout) return this.errorReply("There is no timer to clear.");
					clearTimeout(room.poll.timeout);
					room.poll.timeout = null;
					room.poll.timeoutMins = 0;
					return this.add("The poll timer was turned off.");
				}
				let timeout = parseFloat(target);
				if (isNaN(timeout) || timeout <= 0 || timeout > 0x7FFFFFFF) return this.errorReply("Invalid time given.");
				if (room.poll.timeout) clearTimeout(room.poll.timeout);
				room.poll.timeoutMins = timeout;
				room.poll.timeout = setTimeout(() => {
					room.poll.end();
					delete room.poll;
				}, (timeout * 60000));
				room.add("The poll timer was turned on: the poll will end in " + timeout + " minute(s).");
				return this.privateModCommand("(The poll timer was set to " + timeout + " minute(s) by " + user.name + ".)");
			} else {
				if (!this.runBroadcast()) return;
				if (room.poll.timeout) {
					return this.sendReply("The poll timer is on and will end in " + room.poll.timeoutMins + " minute(s).");
				} else {
					return this.sendReply("The poll timer is off.");
				}
			}
		},
		timerhelp: ["/poll timer [minutes] - Sets the poll to automatically end after [minutes] minutes. Requires: % @ * # & ~", "/poll timer clear - Clears the poll's timer. Requires: % @ * # & ~"],

		results: function (target, room, user) {
			if (!room.poll) return this.errorReply("There is no poll running in this room.");

			return room.poll.blankvote(user);
		},
		resultshelp: ["/poll results - Shows the results of the poll without voting. NOTE: you can't go back and vote after using this."],

		close: 'end',
		stop: 'end',
		end: function (target, room, user) {
			if (!this.can('minigame', null, room)) return false;
			if (!this.canTalk()) return;
			if (!room.poll) return this.errorReply("There is no poll running in this room.");
			if (room.poll.timeout) clearTimeout(room.poll.timeout);

			room.poll.end();
			delete room.poll;
			return this.privateModCommand("(The poll was ended by " + user.name + ".)");
		},
		endhelp: ["/poll end - Ends a poll and displays the results. Requires: % @ * # & ~"],

		show: 'display',
		display: function (target, room, user, connection) {
			if (!room.poll) return this.errorReply("There is no poll running in this room.");
			if (!this.runBroadcast()) return;
			room.update();

			if (this.broadcasting) {
				room.poll.display();
			} else {
				room.poll.displayTo(user, connection);
			}
		},
		displayhelp: ["/poll display - Displays the poll"],

		votes: function (target, room, user) {
			if (!room.poll) return this.errorReply("There is no poll running in this room.");
			if (!this.runBroadcast()) return;
			this.sendReplyBox("votes: " + room.poll.totalVotes);
		},

		'': function (target, room, user) {
			this.parse('/help poll');
		},
	},
	pollhelp: [
		"/poll allows rooms to run their own polls. These polls are limited to one poll at a time per room.",
		"Accepts the following commands:",
		"/poll create [question], [option1], [option2], [...] - Creates a poll. Requires: % @ * # & ~",
		"/poll htmlcreate [question], [option1], [option2], [...] - Creates a poll, with HTML allowed in the question and options. Requires: # & ~",
		"/poll vote [number] - Votes for option [number].",
		"/poll timer [minutes] - Sets the poll to automatically end after [minutes]. Requires: % @ * # & ~",
		"/poll results - Shows the results of the poll without voting. NOTE: you can't go back and vote after using this.",
		"/poll display - Displays the poll",
		"/poll end - Ends a poll and displays the results. Requires: % @ * # & ~",
	],

	tpoll: 'tierpoll',
	tierpoll: function (target, room, user, connection, cmd, message) {
		if (!this.can('minigame', null, room)) return false;
		if (room.poll) return this.errorReply("There is already a poll in progress in this room.");
		let options = [];
		for (let key in Dex.formats) {
			if (!Dex.formats[key].mod) continue;
			if (!Dex.formats[key].searchShow) continue;
			if (toId(target) !== 'all') {
				let commonMods = ['gen7', 'sgssb', 'pmd', 'cssb', 'metronome', 'digimon'];
				if (commonMods.indexOf(Dex.formats[key].mod) === -1) continue;
			}
			options.push(Dex.formats[key].name);
		}
		room.poll = new Poll(room, {
			source: 'What should the next tournament tier be?',
			supportHTML: false,
			username: user.name,
		}, options);
		room.poll.display();
		this.logEntry("" + user.name + " used " + message);
		return this.privateModCommand("(A tier poll was started by " + user.name + ".)");
	},
	tierpollhelp: ["/tierpoll - (all) Creates a poll with all the common formats as options. All all to use all formats Requires: % @ * # & ~"],
};

process.nextTick(() => {
	Chat.multiLinePattern.register('/poll (new|create|htmlcreate) ');
});
