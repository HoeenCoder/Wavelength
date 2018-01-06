/**
 * News System for Wavelength
 * This Shows News via the /news view command and sends news ns PMs when users connect to the server if they have subscribed
 * Uses nef to add News to nef's json database
 * Credits: Lord Haji, HoeenHero
 * @license MIT license
 */

'use strict';

const notifiedUsers = {};

function generateNews() {
	let newsData, newsDisplay = [];
	let keys = Db.news.keys();
	for (let i = 0; i < keys.length; i++) {
		newsData = Db.news.get(keys[i]);
		newsDisplay.push(`<h4>${keys[i]}</h4>${newsData[1]}<br /><br />—${WL.nameColor(newsData[0], true)} <small>on ${newsData[2]}</small>`);
	}
	return newsDisplay;
}

function showSubButton(userid) {
	let hasSubscribed = Db.NewsSubscribers.get(userid, false);
	return `<hr><center><button class="button" name="send" value="/news ${(hasSubscribed ? `unsubscribe` : `subscribe`)}">${(hasSubscribed ? `Unsubscribe from the news` : `Subscribe to the news`)}</button></center>`;
}
WL.showNews = function (userid, user) {
	if (!user || !userid) return false;
	if (!Db.NewsSubscribers.has(userid) || (userid in notifiedUsers)) return false;
	let newsDisplay = generateNews();
	if (newsDisplay.length > 0) {
		if (newsDisplay.length > 2) newsDisplay.splice(0, newsDisplay.length - 2);
		newsDisplay = `${newsDisplay.join(`<hr>`)}${showSubButton(userid)}`;
		notifiedUsers[userid] = setTimeout(() => {
			delete notifiedUsers[userid];
		}, 60 * 60 * 1000);
		return user.send(`|pm| WL Server|${user.getIdentity()}|/raw ${newsDisplay}`);
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
			let output = `<center><strong>Wavelength News:</strong></center>${generateNews().join(`<hr>`)}${showSubButton(user.userid)}`;
			if (this.broadcasting) return this.sendReplyBox(`<div class="infobox-limited">${output}</div>`);
			return user.send(`|popup||wide||html|${output}`);
		},
		remove: 'delete',
		delete: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help serverannouncements');
			if (!Db.news.has(target)) return this.errorReply("News with this title doesn't exist.");
			Db.news.remove(target);
			this.privateModCommand(`(${user.name} deleted server announcement titled: ${target}.)`);
		},
		add: function (target, room, user) {
			if (!this.can('ban')) return false;
			if (!target) return this.parse('/help serverannouncements');
			let parts = target.split(',');
			if (parts.length < 2) return this.errorReply("Usage: /news add [title], [desc]");
			let descArray = [];
			if (parts.length - 2 > 0) {
				for (let j = 0; j < parts.length; j++) {
					if (j < 1) continue;
					descArray.push(parts[j]);
				}
				parts[1] = descArray.join();
			}
			let title = parts[0], desc = parts[1], postedBy = user.name;
			let d = new Date();
			const MonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
				"July", "Aug", "Sep", "Oct", "Nov", "Dec",
			];
			let postTime = `${MonthNames[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
			Db.news.set(title, [postedBy, desc, postTime]);
			this.privateModCommand(`(${user.name} added server announcement: ${parts[0]})`);
		},
		subscribe: function (target, room, user) {
			if (!user.named) return this.errorReply('You must choose a name before subscribing');
			if (Db.NewsSubscribers.has(user.userid)) return this.errorReply("You are alreading subscribing Wavelength News.");
			Db.NewsSubscribers.set(user.userid, true);
			this.sendReply("You have subscribed Wavelength News.");
			this.popupReply("|wide||html|You will receive Wavelength News automatically once you connect to the Wavelength next time.<br><hr><center><button class='button' name='send' value ='/news'>View News</button></center>");
		},
		unsubscribe: function (target, room, user) {
			if (!user.named) return this.errorReply('You must choose a name before unsubscribing');
			if (!Db.NewsSubscribers.has(user.userid)) return this.errorReply("You have not subscribed Wavelength News.");
			Db.NewsSubscribers.remove(user.userid);
			this.sendReply("You have unsubscribed Wavelength News.");
			this.popupReply("|wide||html|You will no longer automatically receive Wavelength News.<br><hr><center><button class='button' name='send' value='/news'>View News</button></center>");
		},
	},
	serverannouncementshelp: ["/news view - Views current Wavelength news.",
		"/news delete [news title] - Deletes announcement with the [title]. Requires @, &, ~",
		"/news add [news title], [news desc] - Adds news [news]. Requires @, &, ~",
		"/news subscribe - Subscribes to Wavelength News.",
		"/news unsubscribe - Unsubscribes to Wavelength News.",
	],
};
