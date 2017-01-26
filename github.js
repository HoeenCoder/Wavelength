'use strict';

if (!Config.github || !Config.github.port) return;

let updates = {};

const github = exports.github = require('githubhook')({
	port: Config.github.port,
	secret: Config.github.secret,
});

function sendMessages(str) {
	for (let room in Config.github.rooms) {
		if (!Rooms(Config.github.rooms[room])) continue;
		Rooms(Config.github.rooms[room]).add("|raw|<div class=\"infobox\">" + str + "</div>").update();
	}
}

github.on('push', function push(repo, ref, result) {
	let url = result.compare;
	let branch = /[^/]+$/.exec(ref)[0];
	let messages = [];
	let message = "";
	message += "[<font color='FF00FF'>" + Chat.escapeHTML(repo) + '</font>] ';
	message += SG.nameColor(result.pusher.name, true) + " ";
	message += (result.forced ? '<font color="red">force-pushed</font>' : 'pushed') + " ";
	message += "<b>" + Chat.escapeHTML(result.commits.length) + "</b> ";
	message += "new commit" + (result.commits.length === 1 ? '' : 's') + " to ";
	message += "<font color='800080'>" + Chat.escapeHTML(branch) + "</font>: ";
	message += "<a href=\"" + Chat.escapeHTML(url) + "\">View &amp; compare</a>";
	messages.push(message);
	result.commits.forEach(function (commit) {
		let commitMessage = commit.message;
		let shortCommit = /.+/.exec(commitMessage)[0];
		if (commitMessage !== shortCommit) {
			shortCommit += '...';
		}
		message = "";
		message += "<font color='FF00FF'>" + Chat.escapeHTML(repo) + "</font>/";
		message += "<font color='800080'>" + Chat.escapeHTML(branch) + "</font> ";
		message += "<a href=\"" + Chat.escapeHTML(commit.url) + "\">";
		message += "<font color='606060'>" + Chat.escapeHTML(commit.id.substring(0, 6)) + "</font></a> ";
		message += SG.nameColor(commit.author.name, true) + ": " + Chat.escapeHTML(shortCommit);
		messages.push(message);
	});
	sendMessages(messages.join("<br>"));
});

github.on('pull_request', function pullRequest(repo, ref, result) {
	let COOLDOWN = 10 * 60 * 1000;
	let requestNumber = result.pull_request.number;
	let url = result.pull_request.html_url;
	let action = result.action;
	if (!updates[repo]) updates[repo] = {};
	if (action === 'synchronize') {
		action = 'updated';
	}
	if (action === 'labeled') {
		action = 'labled';
		return;
	}
	let now = Date.now();
	if (updates[repo][requestNumber] && updates[repo][requestNumber] + COOLDOWN > now) {
		return;
	}
	updates[repo][requestNumber] = now;
	let message = "";
	message += "[<font color='FF00FF'>" + repo + "</font>] ";
	message += SG.nameColor(result.sender.login, true) + " ";
	message += action + " pull request <a href=\"" + url + "\">#" + requestNumber + "</a>: ";
	message += result.pull_request.title;
	sendMessages(message);
});

github.listen();
