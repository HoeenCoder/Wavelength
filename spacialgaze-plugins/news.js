/*
* News System for SpacialGaze
* Credits: Lord Haji, HoeenHero
*/

'use strict';

function generateNews(user) {
	let newsData, newsDisplay = [];
	user = toId(user);
	Object.keys(Db('news').object()).forEach(announcement => {
		newsData = Db('news').get(announcement);
		newsDisplay.push(`<h4>${announcement}</h4>${newsData[1]}<br /><br />—${SG.nameColor(newsData[0], true)} <small>on ${newsData[2]}</small>`);
	});
	return newsDisplay;
}

function hasSubscribed(user) {
	if (typeof user === 'object') user = user.userid;
	if (Db('NewsSubscribers').has(toId(user))) return true;
	return false;
}

function showSubButton(user) {
	user = toId(user);
	let output;
	output = "<hr><center><button class = \"button\" name=\"send\" value=\"/news " + (hasSubscribed(user) ? "unsubscribe" : "subscribe") + "\">" + (hasSubscribed(user) ? "Unsubscribe from the news" : "Subscribe to the news") + "</button></center>";
	return output;
}
SG.showNews = function (userid, user) {
	if (!user || !userid) return false;
	userid = toId(userid);
	let newsDisplay = generateNews(user);
	if (!hasSubscribed(userid)) return false;
	if (newsDisplay.length > 0) {
		newsDisplay = newsDisplay.join('<hr>');
		newsDisplay += showSubButton(userid);
		return user.send(`|pm| SG Server|${user.getIdentity()}|/raw ${newsDisplay}`);
	}
};

exports.commands = {
	news: 'serverannouncements',
	announcements: 'serverannouncements',
	serverannouncements: {
		'': 'view',
		display: 'view',
		view: function (target, room, user) {
			if (!this.runBroadcast()) return;
			let output = "<center><strong>SpacialGaze News:</strong></center>";
			output += generateNews().join('<hr>') + showSubButton(user.userid);
			if (this.broadcasting) return this.sendReplyBox("<div class =\"infobox-limited\"" + output + "</div>");
			return user.send('|popup||wide||html|' + output);
		},
		remove: 'delete',
		delete: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help serverannouncements');
			if (!Db('news').has(target)) return this.errorReply("News with this title doesn't exist.");
			Db('news').delete(target);
			this.privateModCommand(`(${user.name} deleted server announcement titled: ${target}.)`);
		},
		add: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help serverannouncements');
			let parts = target.split(',');
			if (parts.length !== 2) return this.errorReply("Usage: /news add [title], [desc]");
			let title = parts[0], desc = parts[1], postedBy = user.name;
			let d = new Date();
			const MonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
				"July", "Aug", "Sep", "Oct", "Nov", "Dec",
			];
			let postTime = (MonthNames[d.getUTCMonth()] + ' ' + d.getUTCDate() + ", " + d.getUTCFullYear());
			Db('news').set(title, [postedBy, desc, postTime]);
			this.privateModCommand(`(${user.name} added server announcement: ${parts[0]})`);
		},
		subscribe: function (target, room, user) {
			if (!user.named) return this.errorReply('You must choose a name before subscribing');
			if (hasSubscribed(user.userid)) return this.errorReply("You are alreading subscribing SpacialGaze News.");
			Db('NewsSubscribers').set(user.userid, true);
			this.sendReply("You have subscribed SpacialGaze News.");
			this.popupReply("|wide||html|You will receive SpacialGaze News automatically once you connect to the SpacialGaze next time.<br><hr><button class='button' name = 'send' value = '/news'>Go Back</button>");
		},
		unsubscribe: function (target, room, user) {
			if (!user.named) return this.errorReply('You must choose a name before unsubscribing');
			if (!hasSubscribed(user.userid)) return this.errorReply("You have not subscribed SpacialGaze News.");
			Db('NewsSubscribers').delete(user.userid);
			this.sendReply("You have unsubscribed SpacialGaze News.");
			this.popupReply("|wide||html|You will no longer automatically receive SpacialGaze News.<br><hr><button class='button' name='send' value='/news'>Go Back</button>");
		},
	},
	serverannouncementshelp: ["/news view - Views current SpacialGaze news.",
		"/news delete [news title] - Deletes announcement with the [title]. Requires @, &, ~",
		"/news add [news title], [news desc] - Adds news [news]. Requires @, &, ~",
		"/news subscribe - Subscribes to SpacialGaze News.",
		"/news unsubscribe - Unsubscribes to SpacialGaze News.",
	],
};
