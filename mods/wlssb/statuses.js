'use strict';
exports.BattleStatuses = {
	therun: {
		exists: true,
		onStart: function () {
			this.add('c', '+The Run', 'Are you fast enough?');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+The Run', 'I\'ll be back faster than the speed of light');
		},
		onFaint: function (pokemon) {
			this.add('c', '+The Run', 'So much for being faster...');
		},
	},
	serperiorater: {
		exists: true,
		onStart: function () {
			this.add('c', '%Serperiorater', 'The badossness has arrived.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '%Serperiorater', 'Don\'t worry, I\'ll be back later, so be prepared.');
		},
		onFaint: function (pokemon) {
			this.add('c', '%Serperiorater', 'Dammit Benny, why ya gotta be that guy?');
		},
	},
	clue: {
		exists: true,
		onStart: function () {
			this.add('c', '+Clue', 'glhf');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+Clue', 'lmfao brb');
		},
		onFaint: function (pokemon) {
			this.add('c', '+Clue', 'yeah so I\'mma go get some food see you later');
		},
	},
	ashleythepikachu: {
		exists: true,
		onStart: function () {
			this.add('c', '@Ashley the Pikachu', 'Pika-Pikachu');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '@Ashley the Pikachu', 'Pi-kaPika');
		},
		onFaint: function (pokemon) {
			this.add('c', '@Ashley the Pikachu', 'PikaPikaaaa');
		},
	},
	ducktown: {
		exists: true,
		onStart: function () {
			this.add('c', '%ducktown', 'Beware! You are entering a town of ducks!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '%ducktown', 'My other ducks will come attack you!');
		},
		onFaint: function (pokemon) {
			this.add('c', '%ducktown', 'Quack Quack Quaaaaaa...');
		},
	},
	hurricaned: {
		exists: true,
		onStart: function () {
			this.add('c', '+Hurricane\'d', 'Ay lmao it\'s ya boi. CAP is the best tier, so let me show you.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+Hurricane\'d', 'Ay ya boi is gettin outta here. Later asshat');
		},
		onFaint: function (pokemon) {
			this.add('c', '+Hurricane\'d', 'You did this because I like CAP didn\'t you. I bet you like OU as well. You\'re tier-ist');
		},
	},
	hoeenhero: {
		exists: true,
		onStart: function () {
			this.add('c', '~HoeenHero', 'Do I have to? I\'m in the middle of programming.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '~HoeenHero', 'I can\'t battle now, I\'m too busy.');
		},
		onFaint: function (pokemon) {
			this.add('c', '~HoeenHero', 'Hey! Thats more hax than I get to use >:(');
		},
	},
	hiroz: {
		exists: true,
		onStart: function () {
			this.add('c', '+HiroZ', 'Your wing isn\'t able to fly anywhere!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+HiroZ', 'Crawl like the insect you are, I\'ll be back!');
		},
		onFaint: function (pokemon) {
			this.add('c', '+HiroZ', 'Argh... scumbag...');
		},
	},
	admewn: {
		exists: true,
		onStart: function () {
			this.add('c', '+Admewn', 'This battle will be amewsing :]');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+Admewn', 'Brb, I\'ll be mewting someone :]');
		},
		onFaint: function (pokemon) {
			this.add('c', '+Admewn', 'Turn off the mewsic! I\'m out!');
		},
	},
	vulcaron: {
		exists: true,
		onStart: function () {
			this.add('c', '+Vulcaron', 'I will scorch you with 628 blue flames!!! ...I\'m really bad at this.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+Vulcaron', 'I\'ll be back, I have a lot of free time');
		},
		onFaint: function (pokemon) {
			this.add('c', '+Vulcaron', 'The flames are dowsed.');
		},
	},
	mystifi: {
		exists: true,
		onStart: function () {
			this.add('c', '~Mystifi', '__I\'ll HM01 u faster then sanic m89__');
		},
		onSwitchOut: function (pokemon) {
		},
		onFaint: function (pokemon) {
			this.add('c', '~Mystifi', '**WOW U HACKER I\'M REPORTING YOU TO ZAREL**');
		},
	},
	krakenmare: {
		exists: true,
		onStart: function () {
			this.add('c', '~Kraken Mare', 'Today, I prove Gardevoir as the best Pokmeon!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '~Kraken Mare', 'I shall spare you today, young one!');
		},
		onFaint: function (pokemon) {
			this.add('c', '~Kraken Mare', 'Even though I fall, I\'m sure I took a few down with me.');
		},
	},
	almightybronzong: {
		exists: true,
		onStart: function () {
			this.add('c', '+Almighty Bronzong', '``All hail.``');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+Almighty Bronzong', '``I\'m off, night``');
		},
		onFaint: function (pokemon) {
			this.add('c', '+Almighty Bronzong', '``Nice achievement.``');
		},
	},
	opple: {
		exists: true,
		onStart: function () {
			this.add('c', '&Opple', 'lol hi');
		},
		onSwitchOut: function (pokemon) {
		},
		onFaint: function (pokemon) {
			this.add('c', '&Opple', 'I call hacks, fine. You got me, lol, I\'ll get you next time!');
		},
	},
	mimiroppu: {
		exists: true,
		onStart: function () {
			this.add('c', '+Mimiroppu', 'Mimiroppu, charm up~');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+Mimiroppu', 'I\'ll be back soon bitches');
		},
		onFaint: function (pokemon) {
			this.add('c', '+Mimiroppu', 'Sorry \'bout it...');
		},
	},
	bdh93: {
		exists: true,
		onStart: function () {
			this.add('c', '@BDH93', 'Time for some trolling');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '@BDH93', 'I\'ll be back for more trolling');
		},
		onFaint: function (pokemon) {
			this.add('c', '@BDH93', 'Aww man! No more trolling :(');
		},
	},
	c733937123: {
		exists: true,
		onStart: function () {
			this.add('c', '&C733937 123', 'Hello opponent, Welcome to Spacial Bros, I, C733937 123, shall defeat you.....hopefully.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '&C733937 123', '*laughs* Now you have to defeat a stronger ally....and have to still face me later where I can have a better chance at *distorted voice* KiLlInG YoU To wIn!!!');
		},
		onFaint: function (pokemon) {
			this.add('c', '&C733937 123', 'What, I...got defeated by some lousy fighter like you??? Well...Good luck next time we fight for both of us....but why did I lose?');
		},
	},
	spacialbot: {
		exists: true,
		onStart: function () {
			this.add('c', ' Spacial Bot', '``Bot rebooting...``');
			this.add('c', ' Spacial Bot', '``Rebooting complete. Engaging in battle.``');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+The Run', '.battleswitchout');
			this.add('c', ' Spacial Bot', '``var returnMessage = alert("Will return with more power.")``');
		},
		onFaint: function (pokemon) {
			this.add('c', ' Spacial Bot', 'I blame my creator for my loss. ``process.exit(1)``');
		},
	},
	auction: {
		exists: true,
		onStart: function () {
			this.add('c', '+Auction', 'I think its time for the man to take his throne.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+Auction', 'I think I should take a bathroom break');
		},
		onFaint: function (pokemon) {
			this.add('c', '+Auction', 'Ya know, I think I should\'ve gotten __burn everything__ as my ability ;_;');
		},
	},
	ranfen: {
		exists: true,
		onStart: function () {
			this.add('c', '+Ranfen', 'Watch Out Ice mons!');
		},
		onSwitchOut: function (pokemon) {
		},
		onFaint: function (pokemon) {
			this.add('c', '+Ranfen', 'No Fair flygon cant be beat D:');
		},
	},
	lycaniumz: {
		exists: true,
		onStart: function () {
			this.add('c', '%Lycanium Z', 'Hi. Im that random guy noone thinks about');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '%Autograph', 'brb gonna change alts');
		},
		onFaint: function (pokemon) {
			this.add('c', '%Bellhop', 'lol im dead. Back to alt hunting');
		},
	},
	insist: {
		exists: true,
		onStart: function () {
			this.add('c', '+Insist', 'I __insist__ you just forfeit right now.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+Insist', 'I don\'t just run away from my problems!');
		},
		onFaint: function (pokemon) {
			this.add('c', '+Insist', 'I\'m gonna go report you to HoeenNub real quick for hax0ring');
		},
		onSourceFaint: function (pokemon) {
			this.add('c', '+Insist', 'How to win the game 101:');
			this.addRaw('<ol><li>Use my signature move</li><li>GG</li></ol>');
		},
	},
	celestialtater: {
		exists: true,
		onStart: function () {
			this.add('c', '+CelestialTater', 'this potato gonna rek you m8');
		},
		onFaint: function (pokemon) {
			this.add('c', '+CelestialTater', 'Heck');
		},
	},
	stabbythekrabby: {
		exists: true,
		onStart: function () {
			this.add('c', '*Stabby the Krabby', 'Get ready to be stabbed!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '*Stabby the Krabby', 'Alright, I\'ll be back to stab you later. Got someone else to deal with first.');
		},
		onFaint: function (pokemon) {
			this.add('c', '*Stabby the Krabby', 'Impossible...');
		},
	},
};
