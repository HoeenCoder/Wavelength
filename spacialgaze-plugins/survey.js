/***********************************
	Survey commands for
	spacialgaze.psim.us
	coded by HoeenHero
***********************************/
'use strict';

class Survey {
	constructor(room, question, allowHTML) {
		if (room.surveyNumber) {
			room.surveyNumber++;
		} else {
			room.surveyNumber = 1;
		}
		this.room = room;
		this.question = question;
		this.allowHTML = allowHTML;
		this.repliers = {};
		this.repliersIps = {};
		this.totalReplies = 0;
		this.timeout = null;
		this.timeoutMins = 0;
	}

	answer(user, reply) {
		let ip = user.latestIp;
		let userid = user.userid;

		if (userid in this.repliers || ip in this.repliersIps) {
			return user.sendTo(this.room, "You have already answered this survey.");
		}

		this.repliers[userid] = reply;
		this.repliersIps[ip] = reply;
		this.totalReplies++;

		this.updateTo(user, false);
	}

	blankanswer(user, reply) {
		let ip = user.latestIp;
		let userid = user.userid;

		if (userid in this.repliers || ip in this.repliersIps) {
			//this.updateTo(user, true);
			//Do nothing.
		} else {
			this.repliers[userid] = 0;
			this.repliersIps[ip] = 0;
		}

		this.updateTo(user, true);
	}

	generateQuestion() {
		let output = '<div class="infobox"><p style="margin: 2px 0 5px 0"><span style="border:1px solid #6A6;color:#484;border-radius:4px;padding:0 3px"><i class="fa fa-bar-chart"></i> Survey</span> <strong style="font-size:11pt">' + (this.allowHTML ? this.question : Chat.escapeHTML(this.question)) + '</strong></p>';
		output += '<div style="margin-top: 3px">Please note that anyone can see what you reply.</div>';
		output += '<div style="margin-top: 5px"><button class="button" value="/survey answer" name="send" title="Answer the survey."><b>Answer the survey</b></button></div>';
		output += '<div style="margin-top: 7px; padding-left: 12px"><button class="button" value="/survey results" name="send" title="View results - you will not be able to answer the survey after viewing results"><small>(View Results)</small></button><small>(you will not be able to answer the survey after viewing results)</small></div>';
		output += '</div>';
		return output;
	}

	update() {
		for (let i in this.room.users) {
			let thisUser = this.room.users[i];
			if (thisUser.userid in this.repliers || thisUser.latestIp in this.repliersIps) {
				thisUser.sendTo(this.room, '|uhtml|survey' + this.room.surveyNumber + '|<div class="infobox"><p style="margin: 2px 0 5px 0"><span style="border:1px solid #6A6;color:#484;border-radius:4px;padding:0 3px"><i class="fa fa-bar-chart"></i> Survey</span> <strong style="font-size:11pt">' + (this.allowHTML ? this.question : Chat.escapeHTML(this.question)) + '</strong></p>Thank you for answering the survey.<br/><div style="margin-top: 7px; padding-left: 12px"><button value="/survey results" class="button" name="send" title="Show results - view all replies"><small>(View Results)</small></div></div>');
			}
		}
	}

	display() {
		let toAnswer = this.generateQuestion();

		for (let i in this.room.users) {
			let thisUser = this.room.users[i];
			if (thisUser.userid in this.repliers) {
				thisUser.sendTo(this.room, '|uhtml|survey' + this.room.surveyNumber + '|<div class="infobox"><p style="margin: 2px 0 5px 0"><span style="border:1px solid #6A6;color:#484;border-radius:4px;padding:0 3px"><i class="fa fa-bar-chart"></i> Survey</span> <strong style="font-size:11pt">' + (this.allowHTML ? this.question : Chat.escapeHTML(this.question)) + '</strong></p>Thank you for answering the survey.<br/><div style="margin-top: 7px; padding-left: 12px"><button class="button" value="/survey results" name="send" title="Show results - view all replies"><small>(View Results)</small></div></div>');
			} else if (thisUser.latestIp in this.repliersIps) {
				thisUser.sendTo(this.room, '|uhtml|survey' + this.room.surveyNumber + '|<div class="infobox"><p style="margin: 2px 0 5px 0"><span style="border:1px solid #6A6;color:#484;border-radius:4px;padding:0 3px"><i class="fa fa-bar-chart"></i> Survey</span> <strong style="font-size:11pt">' + (this.allowHTML ? this.question : Chat.escapeHTML(this.question)) + '</strong></p>Thank you for answering the survey.<br/><div style="margin-top: 7px; padding-left: 12px"><button class="button" value="/survey results" name="send" title="Show results - view all replies"><small>(View Results)</small></div></div>');
			} else {
				thisUser.sendTo(this.room, '|uhtml|survey' + this.room.surveyNumber + '|' + toAnswer);
			}
		}
	}

	displayTo(user, connection) {
		if (!connection) connection = user;
		if (user.userid in this.repliers) {
			connection.sendTo(this.room, '|uhtml|survey' + this.room.surveyNumber + '|<div class="infobox"><p style="margin: 2px 0 5px 0"><span style="border:1px solid #6A6;color:#484;border-radius:4px;padding:0 3px"><i class="fa fa-bar-chart"></i> Survey</span> <strong style="font-size:11pt">' + (this.allowHTML ? this.question : Chat.escapeHTML(this.question)) + '</strong></p>Thank you for answering the survey.<br/><div style="margin-top: 7px; padding-left: 12px"><button value="/survey results" class="button" name="send" title="Show results - view all replies"><small>(View Results)</small></div></div>');
		} else if (user.latestIp in this.repliersIps) {
			connection.sendTo(this.room, '|uhtml|survey' + this.room.surveyNumber + '|<div class="infobox"><p style="margin: 2px 0 5px 0"><span style="border:1px solid #6A6;color:#484;border-radius:4px;padding:0 3px"><i class="fa fa-bar-chart"></i> Survey</span> <strong style="font-size:11pt">' + (this.allowHTML ? this.question : Chat.escapeHTML(this.question)) + '</strong></p>Thank you for answering the survey.<br/><div style="margin-top: 7px; padding-left: 12px"><button value="/survey results" class="button" name="send" title="Show results - view all replies"><small>(View Results)</small></div></div>');
		} else {
			connection.sendTo(this.room, '|uhtml|survey' + this.room.surveyNumber + '|' + this.generateQuestion());
		}
	}

	generateResults(ended) {
		let icon = '<span style="border:1px solid #' + (ended ? '777;color:#555' : '6A6;color:#484') + ';border-radius:4px;padding:0 3px"><i class="fa fa-bar-chart"></i> ' + (ended ? "Survey ended" : "Survey") + '</span>';
		let output = '<div class="infobox"><p style="margin: 2px 0 5px 0">' + icon + ' <strong style="font-size:11pt">' + (this.allowHTML ? this.question : Chat.escapeHTML(this.question)) + '</strong></p>';
		for (let i in this.repliers) {
			if (this.repliers[i]) output += '<div>' + SG.nameColor(i, true) + ': <i>"' + this.repliers[i] + '"</i><div><br/>';
		}
		if (!ended) output += '<div style="margin-top: 7px; padding-left: 12px"><button value="/survey hideresults" class="button" name="send" title="Hide results - hide the results."><small>(Hide Results)</small></div>';
		output += '</div>';
		return output;
	}

	hasReplied(user) {
		let userid = user.userid;
		let userIp = user.latestIp;
		if (userid in this.repliers) return true;
		if (userIp in this.repliersIps) return true;
		return false;
	}

	updateTo(user, getResults) {
		let results = this.generateResults(false);
		if (user.userid in this.repliers) {
			if (getResults) {
				user.sendTo(this.room, '|uhtmlchange|survey' + this.room.surveyNumber + '|' + results);
			} else {
				user.sendTo(this.room, '|uhtmlchange|survey' + this.room.surveyNumber + '|<div class="infobox"><p style="margin: 2px 0 5px 0"><span style="border:1px solid #6A6;color:#484;border-radius:4px;padding:0 3px"><i class="fa fa-bar-chart"></i> Survey</span> <strong style="font-size:11pt">' + (this.allowHTML ? this.question : Chat.escapeHTML(this.question)) + '</strong></p>Thank you for answering the survey.<br/><div style="margin-top: 7px; padding-left: 12px"><button class="button" value="/survey results" name="send" title="Show results - view all replies"><small>(View Results)</small></div></div>');
			}
		} else if (user.latestIp in this.repliersIps) {
			if (getResults) {
				user.sendTo(this.room, '|uhtmlchange|survey' + this.room.surveyNumber + '|' + results);
			} else {
				user.sendTo(this.room, '|uhtmlchange|survey' + this.room.surveyNumber + '|<div class="infobox"><p style="margin: 2px 0 5px 0"><span style="border:1px solid #6A6;color:#484;border-radius:4px;padding:0 3px"><i class="fa fa-bar-chart"></i> Survey</span> <strong style="font-size:11pt">' + (this.allowHTML ? this.question : Chat.escapeHTML(this.question)) + '</strong></p>Thank you for answering the survey.<br/><div style="margin-top: 7px; padding-left: 12px"><button class="button" value="/survey results" name="send" title="Show results - view all replies"><small>(View Results)</small></div></div>');
			}
		}
	}

	onConnect(user, connection) {
		this.displayTo(user, connection);
	}

	end() {
		let results = this.generateResults(true);

		this.room.send('|uhtmlchange|survey' + this.room.surveyNumber + '|<div class="infobox">(The survey has ended &ndash; scroll down to see the results)</div>');
		this.room.add('|html|' + results);
	}
}

function validateAnswer(room, message) {
	if (!room) return true;
	if (!room.banwordRegex) {
		if (room.banwords && room.banwords.length) {
			room.banwordRegex = new RegExp('(?:\\b|(?!\\w))(?:' + room.banwords.join('|') + ')(?:\\b|\\B(?!\\w))', 'i');
		} else {
			room.banwordRegex = true;
		}
	}
	if (!message) return true;
	if (room.banwordRegex !== true && room.banwordRegex.test(message)) {
		return false;
	}
	return true;
}

exports.commands = {
	sa: function (target, room, user) {
		this.parse('/survey answer ' + target);
	},
	sahelp: function (target, room, user) {
		this.parse('/help survey answer');
	},
	survey: {
		htmlcreate: 'new',
		create: 'new',
		new: function (target, room, user, connection, cmd, message) {
			if (!target) return this.parse('/help survey new');
			if (target.length > 300) return this.errorReply("Survey too long.");

			if (!this.can('minigame', null, room)) return false;
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			if (room.survey) return this.errorReply("There is already a survey in progress in this room.");
			let allowHTML = toId(cmd) === 'htmlcreate';
			if (allowHTML && !user.can('declare', null, room)) return false;

			room.survey = new Survey(room, target, allowHTML);
			room.survey.display();

			this.logEntry("" + user.name + " used " + message);
			return this.privateModCommand("(A survey was started by " + user.name + ".)");
		},
		newhelp: ["/survey create [question] - Create a survey. Requires % @ # & ~"],

		answer: function (target, room, user, connection, cmd, message) {
			if (!room.survey) return this.errorReply("There is no survey running in the room.");
			if (!target) return this.parse('/help survey answer');
			if (target.length > 600) return this.errorReply('Your answer is too long.');
			if (!validateAnswer(room, target)) return this.errorReply('Your answer contained a banned phrase');
			target = Chat.escapeHTML(target);
			room.survey.answer(user, target);
		},
		answerhelp: ["/survey answer [answer] or /sa [answer] - Answer a survey."],

		results: function (target, room, user, connection, cmd, message) {
			if (!room.survey) return this.errorReply("There is no survey running in the room.");
			return room.survey.blankanswer(user);
		},
		resultshelp: ["/survey results - View the results of the survey. You can't go back and answer if you havent already."],

		hideresults: function (target, room, user, connection, cmd, message) {
			if (!room.survey) return this.errorReply("There is no survey running in the room.");
			if (room.survey.hasReplied(user)) {
				return room.survey.updateTo(user, false);
			} else {
				return this.errorReply('You can\'t hide the results if you can\'t view them.');
			}
		},
		hideresultshelp: ["/survey hideresults - Hide the results of the survey. You can't do this if you havent answered yet."],

		display: function (target, room, user, connection, cmd, message) {
			if (!room.survey) return this.errorReply("There is no survey running in the room.");
			if (!this.runBroadcast()) return;
			room.update();

			if (this.broadcasting) {
				room.survey.display();
			} else {
				room.survey.displayTo(user, connection);
			}
		},
		displayhelp: ["/survey display - Display the survey."],

		delete: 'remove',
		remove: function (target, room, user, connection, cmd, message) {
			if (!this.can('minigame', null, room)) return false;
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			if (!room.survey) return this.errorReply("There is no survey running in the room.");

			if (!target) return this.errorReply("Please select an answer to remove.");
			target = toId(target);
			if (!room.survey.repliers[target]) return this.errorReply("The user " + target + " has not responded to the survey.");
			for (let i in room.survey.repliersIps) {
				if (room.survey.repliersIps[i] === room.survey.repliers[target]) {
					room.survey.repliersIps[i] = 0;
					room.survey.repliers[target] = 0;
					break;
				}
			}
			room.survey.update();
			this.sendReply(target + '\'s answer was removed.');
		},
		removehelp: ["/survey remove [user] - Removes a users reply and prevents them from sending in a new one for this survey. Requires: % @ # & ~"],

		close: 'end',
		stop: 'end',
		end: function (target, room, user, connection, cmd, message) {
			if (!this.can('minigame', null, room)) return false;
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			if (!room.survey) return this.errorReply("There is no survey running in this room.");
			if (room.survey.timeout) clearTimeout(room.survey.timeout);

			room.survey.end();
			delete room.survey;
			return this.privateModCommand("(The survey was ended by " + user.name + ".)");
		},
		endhelp: ["/survey end - Ends a survey and displays the results. Requires: % @ # & ~"],

		timer: function (target, room, user) {
			if (!room.survey) return this.errorReply("There is no survey running in this room.");

			if (target) {
				if (!this.can('minigame', null, room)) return false;
				if (target === 'clear' || target === 'off') {
					if (!room.survey.timeout) return this.errorReply("There is no timer to clear.");
					clearTimeout(room.survey.timeout);
					room.survey.timeout = null;
					room.survey.timeoutMins = 0;
					return this.add("The survey timer was turned off.");
				}
				let timeout = parseFloat(target);
				if (isNaN(timeout) || timeout <= 0 || timeout > 0x7FFFFFFF) return this.errorReply("Invalid time given.");
				if (room.survey.timeout) clearTimeout(room.survey.timeout);
				room.survey.timeoutMins = timeout;
				room.survey.timeout = setTimeout(() => {
					room.survey.end();
					delete room.survey;
				}, (timeout * 60000));
				room.add("The survey timer was turned on: the survey will end in " + timeout + " minute(s).");
				return this.privateModCommand("(The survey timer was set to " + timeout + " minute(s) by " + user.name + ".)");
			} else {
				if (!this.runBroadcast()) return;
				if (room.survey.timeout) {
					return this.sendReply("The survey timer is on and will end in " + room.survey.timeoutMins + " minute(s).");
				} else {
					return this.sendReply("The survey timer is off.");
				}
			}
		},
		timerhelp: ["/survey timer [minutes] - Sets the survey to automatically end after [minutes] minutes. Requires: % @ * # & ~", "/survey timer clear - Clears the survey's timer. Requires: % @ * # & ~"],

		'': function (target, room, user, connection, cmd, message) {
			return this.parse('/help survey');
		},
	},
	surveyhelp: ["/survey allows rooms to run their own surveys. These surveys are limited to one survey at a time per room.",
		"Accepts the following commands:",
		"/survey create [question] - Create a survey. Requires % @ # & ~",
		"/survey answer [answer] - Answer a survey.",
		"/survey results - View the results of the survey. You can't go back and answer if you havent already.",
		"/survey display - Display the survey.",
		"/survey remove [user] - Removes a users reply and prevents them from sending in a new one for this survey. Requires: % @ # & ~",
		"/survey end - Ends a survey and displays the results. Requires: % @ # & ~",
		"/survey timer [time in minutes] - Sets a timer for the survey to automatically end. Require % @ # & ~",
	],
};
