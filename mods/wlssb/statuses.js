'use strict';
exports.BattleStatuses = {
	desokoro: {
		exists: true,
		onStart: function () {
			this.add('c', '~Desokoro', 'The divine one has arrived to give you a smackdown of epic proportions.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '~Desokoro', 'I\'ll be back!');
		},
		onFaint: function (pokemon) {
			this.add('c', '~Desokoro', 'You may have vanquished me today, but beware of the future. I shall not be gone long.');
		},
	},
	tidalwavebot: {
		exists: true,
		onStart: function () {
			this.add('c', '*Tidal Wave Bot', 'Threat Detected: Must deploy the Ban Hammer');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '*Tidal Wave Bot', 'Tidal Wave Bot powered down');
		},
		onFaint: function (pokemon) {
			this.add('c', '*Tidal Wave Bot', 'Emergency shutdown: Battery life depleted. Must recharge.');
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
	admewn: {
		exists: true,
		onStart: function () {
			this.add('c', '@Admewn', 'This battle will be amewsing :]');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '@Admewn', 'Brb, I\'ll be mewting someone :]');
		},
		onFaint: function (pokemon) {
			this.add('c', '@Admewn', 'Turn off the mewsic! I\'m out!');
		},
	},
	mystifi: {
		exists: true,
		onStart: function () {
			this.add('c', '+Mystifi', '__I\'ll HM01 u faster then sanic m89__');
		},
		onFaint: function (pokemon) {
			this.add('c', '+Mystifi', '**WOW U HACKER I\'M REPORTING YOU TO ZAREL**');
		},
	},
	krakenmare: {
		exists: true,
		onStart: function () {
			this.add('c', '~Kraken Mare', 'Today, I prove Gardevoir as the best Pokemon!');
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
		onFaint: function (pokemon) {
			this.add('c', '&Opple', 'I call hacks, fine. You got me, lol, I\'ll get you next time!');
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
		onStart: function (pokemon) {
			this.add('c', '@C733937 123', 'Hello opponent, Welcome to Wavelength, I, C733937 123, shall defeat you.....hopefully.');
			this.useMove('psychup', pokemon);
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '@C733937 123', '*laughs* Now you have to defeat a stronger ally....and have to still face me later where I can have a better chance at *distorted voice* KiLlInG YoU To wIn!!!');
		},
		onFaint: function (pokemon) {
			this.add('c', '@C733937 123', 'What, I...got defeated by some lousy fighter like you??? Well...Good luck next time we fight for both of us....but why did I lose?');
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
		onTryHit: function (target, source, move) {
			if (target !== source && (move.type === 'Fire' || move.type === 'Water')) {
				move.accuracy = true;
				this.add('-immune', target, '[msg]', '[from] ability: Duality');
				return null;
			}
		},
	},
	ssbn640: {
		exists: true,
		onStart: function (pokemon) {
			this.add('c', '%SSBN-640', 'hey., im just here to shitpost or whatever.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '%SSBN-640', 'brb gotta do stuff for digimon.');
		},
		onFaint: function (pokemon, target) {
			this.add('c', '%SSBN-640', 'lol how did i die?');
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
	volco: {
		exists: true,
		onStart: function () {
			this.add('c', '&Volco', 'So you summoned me... while I\'m coding? Fine I\'ll battle... but I wont like it!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '&Volco', 'I\'m taking a break to code some stuff while in class. #IDontLikeClass');
		},
		onFaint: function (pokemon) {
			this.add('c', '&Volco', 'Okay then. BACK TO CODING!');
		},
	},
	mosmero: {
		exists: true,
		onStart: function () {
			this.add('c', '~Mosmero', 'Hey, it\'s me, the Mos!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '~Mosmero', 'And with that, it was me, the Mos.');
		},
		onFaint: function (pokemon) {
			this.add('c', '~Mosmero', 'Can\'t you come up with something creative for once, Vacuo?');
		},
	},
	cubsfan38: {
		exists: true,
		onStart: function () {
			this.add('c', '~CubsFan38', 'Your favorite Rowlet has arrived to battle!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '~CubsFan38', 'It\'s cold here, I\'m out.');
		},
	},
	mechsteelix: {
		exists: true,
		onStart: function () {
			this.add('c', '&MechSteelix', 'Tell me, does a player such as yourself experience true fear?');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '&MechSteelix', 'What just happened?');
		},
		onFaint: function (pokemon) {
			this.add('c', '&MechSteelix', 'Forget my life.. always surrounded by bumbling baboons.');
		},
	},
	therittz: {
		exists: true,
		onStart: function () {
			this.add('c', '@TheRittz', 'Greetings!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '@TheRittz', '__fled from the scene__');
		},
		onFaint: function (pokemon) {
			this.add('c', '@TheRittz', '__fled from the scene__');
		},
	},
	perison: {
		exists: true,
		onStart: function () {
			this.add('c', '~Perison', 'You think I came for the battle, when it\'s really your soul I want.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '~Perison', 'Don\'t worry, I\'ll be back. I will miss putting you in pain too much to not return.');
		},
		onFaint: function (pokemon) {
			this.add('c', '~Perison', 'Death falls upon us all, however now is my time to die. You\'ll be happy to know that yours isn\'t far from now.');
		},
	},
	xcmr: {
		exists: true,
		onStart: function () {
			this.add('c', '+xcmr', 'Hey man, go easy please.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+xcmr', 'Someone else take the damage, I\'m weak!');
		},
		onFaint: function (pokemon) {
			this.add('c', '+xcmr', 'What!? That was a high roll!');
		},
	},
	bunnery5: {
		exists: true,
		onStart: function () {
			this.add('c', '+bunnery5', 'LOL, you think you can win!');
		},
		onFaint: function (pokemon) {
			this.add('c', '+bunnery5', 'One day, karma will get you back.');
		},
	},
	priorityboost: {
		onStart: function (target) {
			this.add('-start', target, 'Priority Boost');
			this.effectData.time = 8;
		},
		onEnd: function (target) {
			this.add('-end', target, 'Priority Boost');
		},
		onModifyPriority: function (priority, pokemon, target, move) {
			pokemon.volatiles.priorityboost.time--;
			if (!pokemon.volatiles.priorityboost.time) {
				pokemon.removeVolatile('priorityboost');
				return;
			}
			if (move.id === 'cosmicpower' || move.id === 'storedpower') {
				return priority + 1;
			}
		},
	},
	alfastorm: {
		exists: true,
		onStart: function () {
			this.add('c', '+AlfaStorm', 'Hello, prepare to face my wrath!');
		},
		onFaint: function (pokemon) {
			this.add('c', '+AlfaStorm', 'You\'ll regret doing this to me!');
		},
	},
	SnorlaxTheRain: {
		exists: true,
		onStart: function () {
			this.add('c', '+SnorlaxTheRain', 'Fat Snorlax has arrived!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+SnorlaxTheRain', 'Be right back enemies! Snorsnor');
		},
		onFaint: function (pokemon) {
			this.add('c', '+SnorlaxTheRain', 'Even though u have won, I will still sleep and regain my energy in order to fight against u once more!');
		},
	},
	thedazzlerjoe: {
		exists: true,
		onStart: function () {
			this.add('c', '+The Dazzler Joe', 'HellJoe! Ready for some puns?');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+The Dazzler Joe', 'I\'m Absol-utely out of here!');
		},
		onFaint: function (pokemon) {
			this.add('c', '+The Dazzler Joe', 'It\'s time to... GtfJoe');
		},
	},
};
