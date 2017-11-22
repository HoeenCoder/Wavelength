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
	ducktown: {
		exists: true,
		onStart: function () {
			this.add('c', '+ducktown', 'Beware! You are entering a town of ducks!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '+ducktown', 'My other ducks will come attack you!');
		},
		onFaint: function (pokemon) {
			this.add('c', '+ducktown', 'Quack Quack Quaaaaaa...');
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
			this.add('c', '@HiroZ', 'Your wing isn\'t able to fly anywhere!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '@HiroZ', 'Crawl like the insect you are, I\'ll be back!');
		},
		onFaint: function (pokemon) {
			this.add('c', '@HiroZ', 'Argh... scumbag...');
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
			let t = this.random(4);
			if (t < 1) {
				this.add('c', '~Kraken Mare', 'I told you to leave...');
				this.add('c', '~Kraken Mare', 'Now you leave me now choice..');
				this.add('c', '~Kraken Mare', 'Prepare to be rocked!');
			} else if (t < 2)  {
				this.add('c', '~Kraken Mare', 'No one throws shade at my shades and gets away with it!');
			} else if (t < 3) {
				this.add('c', '~Kraken Mare', 'It\'s time to swab the deck and plunder the booty!');
			} else {
				this.add('c', '~Kraken Mare', 'It\'s all about becoming one with the music!');
			} 
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '~Kraken Mare', 'I\'ll be back to drop some more SPICY WASABI BEATS!');
		},
		onCriticalHit: function (source) {
			let c = this.random(4);
			if (c < 1) {
				this.add('c', '~Kraken Mare', 'EAT THAT!');
			} else if (c < 2) {
				this.add('c', '~Kraken Mare', 'Nailed it!');
			} else if (c < 3){
				this.add('c', '~Kraken Mare', 'Got it!');
			} else {
				this.add('c', '~Kraken Mare', 'Yeah! Let\'s ROCK!');
			}
		},
		onSourceFaint: function (target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.add('c', '~Kraken Mare', 'Thou ART defeated! HA!');
			}
		},
			
		onFaint: function () {
			let i = this.random(5);
			if (i < 1) {
				this.add('c', '~Kraken Mare', 'Ow! You got ink RIGHT in my eye!');
			} else if (i < 2)  {
				this.add('c', '~Kraken Mare', 'I...I\'ll remember this!');
			} else if (i < 3) {
				this.add('c', '~Kraken Mare', 'Cross-fade to blaaaaaaaaaaack!')
			} else if (i < 4){
				this.add('c', '~Kraken Mare', 'I should have bought more bombs...');
			} else {
				this.add('c', '~Kraken Mare', 'Don\'t worry, Team Callie. I still love you all...');
			}
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
	lycaniumz: {
		exists: true,
		onStart: function (pokemon) {
			this.add('c', '%Lycanium Z', 'I dont play for fun i play to win');
		},
		onFaint: function (pokemon) {
			this.add('c', '%Lycanium Z', 'bah i lost. hoeenhero pls buf <3');
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
	arrays: {
		exists: true,
		onStart: function () {
			this.add('c', '%Arrays', 'The code bracket is here! (Arrays)');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '%Arrays', 'I don\'t know how but i\'ve learned to run!');
		},
		onFaint: function (pokemon) {
			this.add('c', '%Arrays', 'How does one beat up code? It\'s not able to be touched by physical means!');
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
			this.add('c', '&CubsFan38', 'Your favorite Rowlet has arrived to battle!');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '&CubsFan38', 'It\'s cold here, I\'m out.');
		},
	},
	isteelx: {
		exists: true,
		onStart: function () {
			this.add('c', '&iSteelX', 'Tell me, does a player such as yourself experience true fear?');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '&iSteelX', 'What just happened?');
		},
		onFaint: function (pokemon) {
			this.add('c', '&iSteelX', 'Forget my life.. always surrounded by bumbling baboons.');
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
	wavelengthprince: {
		exists: true,
		onStart: function () {
			this.add('c', '~Wavelength Prince', 'You think I came for the battle, when it\'s really your soul I want.');
		},
		onSwitchOut: function (pokemon) {
			this.add('c', '~Wavelength Prince', 'Don\'t worry, I\'ll be back. I will miss putting you in pain too much to not return.');
		},
		onFaint: function (pokemon) {
			this.add('c', '~Wavelength Prince', 'Death falls upon us all, however now is my time to die. You\'ll be happy to know that yours isn\'t far from now.');
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
	wgc: {
		exists: true,
		onSourceFaint: function (target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({spa:1}, source);
			}
		},
	},
	bunnery5: {
		exists: true,
		onStart: function () {
			this.add('c', '+bunnery5', 'LOL, you think you can win!');
		},
		onSwitchOut: function (pokemon) {
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
};
