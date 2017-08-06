'use strict';

const RandomTeams = require('../../data/random-teams');

class RandomPmdTeams extends RandomTeams {
	randomPmdTeam() {
		let team = [];
		let sets = {
			'Pikachu': {
				species: 'Pikachu',
				ability: 'Static',
				item: '',
				moves: ['Signal Beam', 'Thunderbolt', 'Fake Out', 'Thunder Wave'],
				weather: null,
				evs: {
					atk: 4,
					spa: 252,
					spe: 252,
				},
				nature: 'Hasty',
			},
			'Meowth': {
				species: 'Meowth',
				ability: 'Technician',
				item: '',
				moves: ['Fake Out', 'Scratch', 'Water Pulse', 'Faint Attack'],
				weather: null,
				evs: {
					atk: 200,
					spa: 56,
					spe: 252,
				},
				nature: 'Hardy',
			},
			'Psyduck': {
				species: 'Psyduck',
				ability: 'Cloud Nine',
				item: '',
				moves: ['Scratch', 'Water Gun', 'Zen Headbutt', 'Psychic'],
				weather: 'rain',
				evs: {
					atk: 100,
					spa: 156,
					spe: 252,
				},
				nature: 'Hardy',
			},
			'Riolu': {
				species: 'Riolu',
				ability: 'Prankster',
				item: '',
				moves: ['Force Palm', 'Bite', 'Swords Dance', 'Poison Jab'],
				weather: null,
				evs: {
					hp: 4,
					atk: 252,
					spe: 252,
				},
				nature: 'Sassy',
			},
			'Shinx': {
				species: 'Shinx',
				ability: 'Intimidate',
				item: '',
				moves: ['Discharge', 'Spark', 'Bite', 'Tackle'],
				weather: null,
				evs: {
					atk: 100,
					spa: 156,
					spe: 252,
				},
				nature: 'Hasty',
			},
			'Phanpy': {
				species: 'Phanpy',
				ability: 'Sturdy',
				item: '',
				moves: ['Dig', 'Tackle', 'Body Slam', 'Rollout'],
				weather: 'sand',
				evs: {
					hp: 4,
					atk: 252,
					spe: 252,
				},
				nature: 'Relaxed',
			},
			'Munchlax': {
				species: 'Munchlax',
				ability: 'Thick Fat',
				item: '',
				moves: ['Tackle', 'Body Slam', 'Flamethrower', 'Water Pulse'],
				weather: null,
				evs: {
					hp: 252,
					atk: 200,
					spa: 56,
				},
				nature: 'Brave',
			},
			'Cubone': {
				species: 'Cubone',
				ability: 'Lightning Rod',
				item: '',
				moves: ['Headbutt', 'Bone Club', 'Rock Slide', 'Aerial Ace'],
				weather: 'sand',
				evs: {
					hp: 4,
					atk: 252,
					spe: 252,
				},
				nature: 'Jolly',
			},

			'Eevee': {
				species: 'Eevee',
				ability: 'Adaptability',
				item: '',
				moves: ['Tackle', 'Quick Attack', 'Bite', 'Dig'],
				weather: null,
				evs: {
					atk: 4,
					spa: 252,
					spe: 252,
				},
				nature: 'Jolly',
			},
			'Skitty': {
				species: 'Skitty',
				ability: 'Cute Charm',
				item: '',
				moves: ['Tackle', 'Double Slap', 'Faint Attack', 'Zen Headbutt'],
				weather: null,
				evs: {
					hp: 4,
					atk: 252,
					spe: 252,
				},
				nature: 'Naive',
			},

			'Machop': {
				species: 'Machop',
				ability: 'Guts',
				item: '',
				moves: ['ThunderPunch', 'Wake Up Slap', 'Dig', 'Rock Slide'],
				weather: null,
				evs: {
					atk: 252,
					spa: 100,
					spe: 156,
				},
				nature: 'Adamant',
			},
			'Vulpix': {
				species: 'Vulpix',
				ability: 'Flash Fire',
				item: '',
				moves: ['Lava Plume', 'Incinerate', 'Faint Attack', 'Dig'],
				weather: 'sun',
				evs: {
					atk: 100,
					spa: 252,
					spe: 156,
				},
				nature: 'Relaxed',
			},
			'Axew': {
				species: 'Axew',
				ability: 'Rivalry',
				item: '',
				moves: ['Dragon Rage', 'Hone Claws', 'Rock Tomb', 'Slash'],
				weather: null,
				evs: {
					hp: 4,
					atk: 252,
					spe: 252,
				},
				nature: 'Hasty',
			},

			'Bulbasaur': {
				species: 'Bulbasaur',
				ability: 'Overgrow',
				item: '',
				moves: ['Tackle', 'Bullet Seed', 'Seed Bomb', 'Sludge Bomb'],
				weather: null,
				evs: {
					atk: 252,
					spa: 4,
					spe: 252,
				},
				nature: 'Lonely',
			},

			'Charmander': {
				species: 'Charmander',
				ability: 'Blaze',
				item: '',
				moves: ['Scratch', 'Flamethrower', 'Fire Spin', 'Will-O-Wisp'],
				weather: 'sun',
				evs: {
					atk: 4,
					spa: 252,
					spe: 252,
				},
				nature: 'Docile',
			},

			'Squirtle': {
				species: 'Squirtle',
				ability: 'Torrent',
				item: '',
				moves: ['Tackle', 'Water Gun', 'Aqua Tail', 'Ice Beam'],
				weather: 'rain',
				evs: {
					atk: 100,
					spa: 156,
					spe: 252,
				},
				nature: 'Quirky',
			},

			'Chikorita': {
				species: 'Chikorita',
				ability: 'Overgrow',
				item: '',
				moves: ['Reflect', 'Light Screen', 'Magical Leaf', 'Toxic'],
				weather: null,
				evs: {
					hp: 252,
					def: 100,
					spd: 156,
				},
				nature: 'Calm',
			},

			'Cyndaquil': {
				species: 'Cyndaquil',
				ability: 'Blaze',
				item: '',
				moves: ['Incinerate', 'Lava Plume', 'Tackle', 'Flamethrower'],
				weather: 'sun',
				evs: {
					atk: 100,
					spa: 156,
					spe: 252,
				},
				nature: 'Timid',
			},

			'Totodile': {
				species: 'Totodile',
				ability: 'Torrent',
				item: '',
				moves: ['Scratch', 'Ice Fang', 'Crunch', 'Waterfall'],
				weather: 'rain',
				evs: {
					hp: 4,
					atk: 252,
					spe: 252,
				},
				nature: 'Jolly',
			},

			'Treecko': {
				species: 'Treecko',
				ability: 'Overgrow',
				item: '',
				moves: ['Pound', 'Giga Drain', 'Energy Ball', 'Rock Tomb'],
				weather: null,
				evs: {
					atk: 100,
					spa: 156,
					spe: 252,
				},
				nature: 'Quiet',
			},

			'Torchic': {
				species: 'Torchic',
				ability: 'Blaze',
				item: '',
				moves: ['Scratch', 'Incinerate', 'Fire Spin', 'Slash'],
				weather: 'sun',
				evs: {
					atk: 200,
					spa: 56,
					spe: 252,
				},
				nature: 'Hardy',
			},

			'Mudkip': {
				species: 'Mudkip',
				ability: 'Torrent',
				item: '',
				moves: ['Toxic', 'Water Pulse', 'Whirlpool', 'Protect'],
				weather: 'rain',
				evs: {
					hp: 252,
					def: 180,
					spa: 4,
					spd: 72,
				},
				nature: 'Rash',
			},
			'Turtwig': {
				species: 'Turtwig',
				ability: 'Overgrow',
				item: '',
				moves: ['Tackle', 'Crunch', 'Giga Drain', 'Stealth Rock'],
				weather: null,
				evs: {
					hp: 56,
					atk: 100,
					spa: 100,
					spe: 252,
				},
				nature: 'Bold',
			},
			'Chimchar': {
				species: 'Chimchar',
				ability: 'Blaze',
				item: '',
				moves: ['Scratch', 'Stealth Rock', 'Flame Wheel', 'Swords Dance'],
				weather: 'sun',
				evs: {
					hp: 4,
					atk: 252,
					spe: 252,
				},
				nature: 'Naive',
			},
			'Piplup': {
				species: 'Piplup',
				ability: 'Torrent',
				item: '',
				moves: ['Defog', 'Surf', 'Toxic', 'Roar'],
				weather: 'rain',
				evs: {
					hp: 252,
					atk: 56,
					def: 100,
					spd: 100,
				},
				nature: 'Impish',
			},
			'Snivy': {
				species: 'Snivy',
				ability: 'Overgrow',
				item: '',
				moves: ['Giga Drain', 'Leaf Tornado', 'Round', 'Calm Mind'],
				evs: {
					hp: 4,
					spa: 252,
					spe: 252,
				},
				nature: 'Modest',
			},

			'Tepig': {
				species: 'Tepig',
				ability: 'Blaze',
				item: '',
				moves: ['Tackle', 'Assurance', 'Flame Charge', 'Body Slam'],
				weather: 'sun',
				evs: {
					hp: 4,
					atk: 252,
					spe: 252,
				},
				nature: 'Naive',
			},

			'Oshawott': {
				species: 'Oshawott',
				ability: 'Torrent',
				item: '',
				moves: ['Tackle', 'Razor Shell', 'Water Gun', 'Icy Wind'],
				weather: 'rain',
				evs: {
					hp: 4,
					spa: 252,
					spe: 252,
				},
				nature: 'Bashful',
			},

			'Chespin': {
				species: 'Chespin',
				ability: 'Overgrow',
				item: '',
				moves: ['Pin Missile', 'Rollout', 'Seed Bomb', 'Bulk Up'],
				weather: null,
				evs: {
					hp: 4,
					atk: 252,
					spe: 252,
				},
				nature: 'Bold',
			},
			'Fennekin': {
				species: 'Fennekin',
				ability: 'Blaze',
				item: '',
				moves: ['Will-O-Wisp', 'Light Screen', 'Fire Pledge', 'Psybeam'],
				weather: 'sun',
				evs: {
					hp: 4,
					spa: 252,
					spe: 252,
				},
				nature: 'Gentle',
			},
			'Froakie': {
				species: 'Froakie',
				ability: 'Torrent',
				item: '',
				moves: ['Toxic Spikes', 'Water Pulse', 'Round', 'Icy Wind'],
				weather: 'rain',
				evs: {
					hp: 4,
					spa: 252,
					spe: 252,
				},
				nature: 'Modest',
			},
			'Snorunt': {
				species: 'Snorunt',
				ability: 'Ice Body',
				item: '',
				moves: ['Ice Shard', 'Ice Beam', 'Spikes', 'Hidden Power Ground'],
				weather: 'hail',
				evs: {
					hp: 248,
					atk: 8,
					spa: 252,
				},
				nature: 'Mild',
			},
			'Snover': {
				species: 'Snover',
				ability: 'Snow Warning',
				item: '',
				moves: ['Blizzard', 'Ice Shard', 'Energy Ball', 'Hidden Power Rock'],
				weather: 'hail',
				evs: {
					hp: 248,
					atk: 8,
					spa: 252,
				},
				nature: 'Mild',
			},
			'Guild\'s Wigglytuff': {
				species: 'Wigglytuff',
				ability: 'Cute Charm',
				item: '',
				gender: 'M',
				moves: ['Double Slap', 'Sing', 'Defense Curl', 'Rollout'],
				weather: null,
				evs: {
					hp: 8,
					atk: 252,
					def: 248,
				},
				nature: 'Adamant',
			},
			'Guild\'s Chatot': {
				species: 'Chatot',
				ability: 'Tangled Feet',
				item: '',
				gender: 'M',
				moves: ['Hyper Voice', 'Fury Attack', 'Peck', 'Mirror Move'],
				weather: null,
				evs: {
					hp: 248,
					spa: 252,
					atk: 8,
				},
				nature: 'Modest',
			},
			'Guild\'s Bidoof': {
				species: 'Bidoof',
				ability: 'Simple',
				item: '',
				gender: 'M',
				moves: ['Curse', 'Headbutt', 'Rollout', 'Super Fang'],
				weather: null,
				evs: {
					hp: 248,
					def: 252,
					atk: 8,
				},
				nature: 'Adamant',
			},
			'Guild\'s Sunflora': {
				species: 'Sunflora',
				ability: 'Chlorophyll',
				item: '',
				gender: 'F',
				moves: ['Mega Drain', 'Sleep Powder', 'Bullet Seed', 'Hidden Power Fire'],
				weather: 'Sun',
				evs: {
					hp: 248,
					spa: 252,
					atk: 8,
				},
				nature: 'Modest',
			},
			'Guild\'s Chimecho': {
				species: 'Chimecho',
				ability: 'Levitate',
				item: '',
				gender: 'F',
				moves: ['Psybeam', 'Heal Bell', 'Yawn', 'Signal Beam'],
				weather: null,
				evs: {
					hp: 248,
					spa: 252,
					spd: 8,
				},
				nature: 'Modest',
			},
			'Guild\'s Diglett': {
				species: 'Diglett',
				ability: 'Sand Force',
				item: '',
				gender: 'M',
				moves: ['Earthquake', 'Slash', 'Sucker Punch', 'Screech'],
				weather: null,
				evs: {
					spe: 252,
					atk: 252,
					spd: 4,
				},
				nature: 'Adamant',
			},
			'Guild\'s Dugtrio': {
				species: 'Dugtrio',
				ability: 'Sand Force',
				item: '',
				gender: 'M',
				moves: ['Magnitude', 'Scratch', 'Sucker Punch', 'Shadow Claw'],
				weather: null,
				evs: {
					hp: 248,
					atk: 252,
					spd: 8,
				},
				nature: 'Adamant',
			},
			'Guild\'s Croagunk': {
				species: 'Croagunk',
				ability: 'Poison Touch',
				item: '',
				gender: 'M',
				moves: ['Fake Out', 'Venoshock', 'Brick Break', 'Dual Chop'],
				weather: null,
				evs: {
					spa: 4,
					atk: 252,
					spe: 252,
				},
				nature: 'Adamant',
			},
			'Guild\'s Loudred': {
				species: 'Loudred',
				ability: 'Scrappy',
				item: '',
				gender: 'M',
				moves: ['Uproar', 'Pound', 'Shadow Ball', 'Screech'],
				weather: null,
				evs: {
					hp: 4,
					atk: 252,
					spa: 252,
				},
				nature: 'Adamant',
			},
			'Guild\'s Corphish': {
				species: 'Corphish',
				ability: 'Adaptability',
				item: '',
				gender: 'M',
				moves: ['Bubblebeam', 'Vice Grip', 'Dragon Dance', 'Razor Shell'],
				weather: null,
				evs: {
					hp: 248,
					atk: 252,
					spa: 8,
				},
				nature: 'Adamant',
			},
		};

		//Generate the team randomly.
		let pool = Object.keys(sets);
		for (let i = 0; i < 4; i++) {
			let name = this.sampleNoReplace(pool);
			let set = sets[name];
			if (!set.level) set.level = 25;
			set.name = name;
			if (!set.ivs) {
				set.ivs = {
					hp: 31,
					atk: 31,
					def: 31,
					spa: 31,
					spd: 31,
					spe: 31,
				};
			} else {
				for (let iv in {
					hp: 31,
					atk: 31,
					def: 31,
					spa: 31,
					spd: 31,
					spe: 31,
				}) {
					set.ivs[iv] = iv in set.ivs ? set.ivs[iv] : 31;
				}
			}
			//Assume the hardcoded set evs are all legal.
			if (!set.evs) {
				set.evs = {
					hp: 31,
					atk: 31,
					def: 31,
					spa: 31,
					spd: 31,
					spe: 31,
				};
			}

			let sigItems = ['Oran Berry', 'Apple', 'Blast Seed', 'Gravelrock', 'Heal Seed', 'Trap Orb', 'TrapBust Orb', 'Stun Seed', 'Totter Seed', 'Vile Seed', 'Violent Seed', 'Rainy Orb', 'Sunny Orb', 'Sandy Orb', 'Hail Orb', 'One Shot Orb', 'Warp Orb', 'Escape Orb', 'Stick', 'Iron Thorn', 'Evasion Orb', 'Mug Orb', 'Awakening', 'Wonder Orb', 'Quick Seed', 'Blinker Seed', 'Sleep Seed', 'X-Eye Seed', 'Slip Seed', 'Decoy Orb', 'Pounce Orb', 'Sizebust Orb', 'Transfer Orb'];
			let choosenItems = [];
			let awakened = false;
			for (let h = 0; h < 4; h++) {
				let itemChoosen = sigItems[Math.floor(Math.random() * sigItems.length)];
				let rejected = false;
				if (itemChoosen === 'Rainy Orb' && set.weather !== 'rain') rejected = true;
				if (itemChoosen === 'Sunny Orb' && set.weather !== 'sun') rejected = true;
				if (itemChoosen === 'Sandy Orb' && set.weather !== 'sand') rejected = true;
				if (itemChoosen === 'Hail Orb' && set.weather !== 'hail') rejected = true;
				for (let j = 0; j < set.moves.length; j++) {
					if (set.moves[j] === 'Stealth Rock' && itemChoosen === 'Trap Orb') rejected = true;
					if (set.moves[j] === 'Defog' && itemChoosen === 'TrapBust Orb') rejected = true;
					if (set.moves[j] === 'Thunder Wave' && itemChoosen === 'Stun Seed') rejected = true;
					if (set.moves[j] === 'Roar' && itemChoosen === 'Warp Orb') rejected = true;
					if (set.moves[j] === 'Snatch' && itemChoosen === 'Mug Orb') rejected = true;
				}
				if (choosenItems.length !== 0) {
					for (let k = 0; k < choosenItems.length; k++) {
						if (choosenItems[k] === itemChoosen) rejected = true;
					}
				}
				if (itemChoosen === 'Awakening') {
					if (awakened) {
						rejected = true;
					} else {
						awakened = true;
					}
				}
				if (!rejected) {
					choosenItems.push(itemChoosen);
				} else {
					h--;
				}
				if (h === 3 && choosenItems.length !== 4) h--;
			}

			set.moves = set.moves.concat(choosenItems);
			team.push(set);
		}
		return team;
	}
}

module.exports = RandomPmdTeams;