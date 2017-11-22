'use strict';

const RandomTeams = require('../../data/random-teams');

class RandomSeasonalRegStaffTeams extends RandomTeams {
	randomSeasonalRegStaffTeam() {
		let team = [];
		let variant = this.random(2);
		let sets = {
			// Admins.
			'~HoeenHero': {
				species: 'Ludicolo',
				ability: 'Programmer\'s Domain',
				item: 'Leftovers',
				gender: 'M',
				moves: [
					['Hydro Pump', 'Scald'][variant], 'Ice Beam', 'Giga Drain',
				],
				signatureMove: 'Scripting',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Modest',
			},
			'~Mystifi': {
				species: 'Clefairy',
				ability: 'Analytic',
				item: 'Eviolite',
				gender: 'F',
				moves: [
					['Calm Mind', 'Cosmic Power'][variant], 'Soft-Boiled', 'Stored Power',
				],
				signatureMove: 'Mystic Mirage',
				evs: {
					hp: 252,
					def: 252,
					spd: 4,
				},
				nature: 'Bold',
			},
			'~Callie (Agent 1)': {
				species: 'Malamar',
				ability: 'Supreme Squid Sister',
				item: 'Hypnoshades',
				gender: 'F',
				moves: ['Sing', 'Superpower', 'Gunk Shot',
				],
				signatureMove: 'Bomb Rush Blush',
				evs: {
					hp: 252,
					atk: 252,
					spd: 4,
				},
				nature: 'Adamant',
			},
			'~Desokoro': {
				species: 'Gyarados',
				ability: 'Wave Call',
				item: 'Leftovers',
				gender: 'M',
				shiny: true,
				moves: ['Substitute', 'Dragon Dance', 'Bounce',
				],
				signatureMove: 'Tsunami Crash',
				evs: {
					atk: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Adamant',
			},
			'~Mosmero': {
				species: 'Gastly',
				ability: 'Mosmic Power',
				item: 'Life Orb',
				gender: '',
				moves: ['Shadow Ball', 'Sludge Bomb', 'Giga Drain',
				],
				signatureMove: 'Mosmero Beam',
				evs: {
					hp: 4,
					spa: 252,
					spe: 252,
				},
				nature: 'Modest',
			},
			'~Wavelength Prince': {
				species: 'Darkrai',
				ability: 'Death Boost',
				item: 'Darkiniumz',
				gender: 'M',
				moves: ['Nightmare', 'Dark Pulse', 'Shadow Ball',
				],
				signatureMove: 'Overpower',
				evs: {
					spa: 252,
					spe: 252,
					hp: 6,
				},
				nature: 'Timid',
			},
			// Global Leaders:
			'&Opple': {
				species: 'Dragonite',
				ability: 'Multiscale',
				item: 'Weakness Policy',
				gender: 'M',
				moves: ['Fire Punch', 'Dragon Claw', 'Waterfall',
				],
				signatureMove: 'Ancient Orb',
				evs: {
					atk: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Adamant',
			},
			'&iSteelX': {
				species: 'Steelix-Mega',
				ability: 'Sandbox',
				item: 'Lum Berry',
				gender: 'M',
				moves: ['Curse', 'Sleep Talk', 'Earthquake',
				],
				signatureMove: 'Deep Sleep',
				evs: {
					hp: 252,
					atk: 4,
					def: 252,
				},
				nature: 'Impish',
			},
			'&CubsFan38': {
				species: 'Rowlet',
				ability: 'Night Owl',
				item: 'Eviolite',
				gender: 'M',
				moves: ['Leaf Blade', 'Brave Bird', 'Swords Dance',
				],
				signatureMove: 'Moonlight Escape',
				evs: {
					spd: 4,
					atk: 252,
					spe: 252,
				},
				nature: 'Jolly',
			},

			//Global Bots
			'*Stabby the Krabby': {
				species: 'Krabby',
				ability: 'Ready to Stab',
				item: 'Eviolite',
				gender: 'M',
				moves: ['Crabhammer', 'Swords Dance', 'Knock Off',
				],
				signatureMove: 'Stab Stab',
				evs: {
					atk: 252,
					spe: 252,
					hp: 6,
				},
				nature: 'Adamant',
			},
			'*Tidal Wave Bot': {
				species: 'Magikarp',
				ability: 'Loading...',
				item: 'Guardian\'s Amulet',
				shiny: true,
				moves: ['Wild Charge', 'Shift Gear', 'Gear Grind',
				],
				signatureMove: 'Server Guardian',
				evs: {
					hp: 4,
					atk: 252,
					spe: 252,
				},
				nature: 'Adament',
			},
			// Global Moderators:
			'@BDH93': {
				species: 'Dunsparce',
				ability: 'Serene Grace',
				item: 'Kings Rock',
				gender: 'M',
				moves: ['Roost', 'Coil', 'Rock Slide', ['Glare', 'Body Slam'][variant],
				],
				signatureMove: 'Getting Trolled',
				evs: {
					hp: 252,
					atk: 252,
					def: 4,
				},
				nature: 'Naughty',
			},
			'@Ashley the Pikachu': {
				species: 'Pikachu-Cosplay',
				ability: 'Primal Surge',
				item: 'Light Ball',
				gender: 'F',
				moves: ['Thunderbolt', 'Surf', 'Hidden Power Ice',
				],
				signatureMove: 'Rocket Punch',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				ivs: {
					atk: 0,
				},
				nature: 'Modest',
			},
			'@C733937 123': {
				species: 'Skuntank',
				ability: 'Unaware',
				item: 'Shuca Berry',
				gender: 'M',
				moves: ['Gunk Shot', 'Crunch', 'Sacred Fire',
				],
				signatureMove: 'Shatter Break',
				evs: {
					hp: 252,
					atk: 252,
					def: 4,
				},
				nature: 'Adamant',
			},
			'@Admewn': {
				species: 'Mew',
				ability: 'Protean',
				item: 'Expert Belt',
				moves: ['Earth Power', 'Oblivion Wing', 'Shadow Ball',
				],
				signatureMove: 'Mewtation',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Timid',
			},
			'@HiroZ': {
				species: 'Genesect',
				ability: 'Download',
				item: 'Choice Scarf',
				moves: ['U-turn', 'Ice Beam', 'Explosion',
				],
				signatureMove: 'Crystallized Ukaku',
				evs: {
					atk: 252,
					spe: 252,
					spa: 4,
				},
				nature: 'Hasty',
			},
			'@TheRittz': {
				species: 'Venusaur-Mega',
				ability: 'Paradoxical Prowess',
				item: 'Black Sludge',
				gender: 'M',
				moves: ['Substitute', 'Leech Seed', 'Toxic',
				],
				signatureMove: 'Everlasting Annoyingness',
				evs: {
					hp: 252,
					def: 128,
					spd: 128,
				},
				nature: 'Calm',
			},
			// Global Drivers:
			'%Serperiorater': {
				species: 'Serperior',
				ability: 'Unnamable',
				item: 'Leftovers',
				gender: 'M',
				moves: ['Psychic', 'Aura Sphere', 'Dark Pulse',
				],
				signatureMove: 'Saber Strike',
				evs: {
					spa: 252,
					spe: 252,
					spd: 4,
				},
				nature: 'Timid',
			},
			'%Lycanium Z': {
				species: "Lycanroc-Midnight",
				ability: "Contrary",
				item: "Leftovers",
				gender: "M",
				moves: ['Close Combat', 'Stone Edge', 'Ice Hammer'],
				signatureMove: "FINISH THEM",
				evs: {
					atk: 252,
					def: 4,
					hp: 252,
				},
				nature: "Adamant",
			},
			'%Arrays': {
				species: 'Conkeldurr',
				ability: 'Shadow Fist',
				item: 'Assault Vest',
				gender: 'M',
				moves: ['Drain Punch', 'Ice Punch', 'Mach Punch'],
				signatureMove: 'Invisible Punch',
				evs: {
					hp: 252,
					atk: 252,
					def: 4,
				},
				nature: 'Adamant',
			},
			'%wgc': {
				species: 'Gengar',
				ability: 'Levitate',
				item: 'Spooky Plate',
				gender: 'M',
				moves: ['Moongeist Beam', 'Sludge Wave', 'Secret Sword'],
				signatureMove: 'Haze Reborn',
				evs: {
					spe: 252,
					spa: 252,
					def: 4,
				},
				nature: 'Timid',
			},

			// Global Voices:
			'+ducktown': {
				species: 'Golduck',
				ability: 'Cloud Nine',
				item: 'Leftovers',
				gender: 'M',
				moves: ['Scald', 'Ice Beam', 'Psychic',
				],
				signatureMove: 'Duck Power',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Modest',
			},
			'+Almighty Bronzong': {
				species: 'Bronzong',
				ability: 'Conflict Of Interest',
				item: 'Leftovers',
				gender: (variant === 1) ? 'M' : 'F',
				moves: ['Gyro Ball', 'Confuse Ray', 'Toxic', 'Earthquake',
				],
				signatureMove: 'Blast Furnace',
				evs: {
					hp: 252,
					def: 168,
					spd: 88,
				},
				nature: 'Sassy',
			},
			'+Auction': {
				species: 'Aegislash',
				ability: 'Stance Change',
				item: 'Leftovers',
				gender: 'M',
				moves: [['Swords Dance', 'Sacred Sword'][variant], 'Shadow Sneak', 'Kings Shield',
				],
				signatureMove: 'Magnet Flare',
				evs: {
					atk: 252,
					spd: 8,
					hp: 248,
				},
				nature: 'Adamant',
			},
			'+CelestialTater': {
				species: 'Armaldo',
				ability: 'Unburden',
				item: 'White Herb',
				gender: 'M',
				moves: ['Drain Punch', 'Stone Edge', 'Megahorn',
				],
				signatureMove: 'Shell Break',
				evs: {
					atk: 128,
					spe: 128,
					hp: 252,
				},
				nature: 'Adamant',
			},
			'+xcmr': {
				species: 'Meowth',
				ability: 'Feline Fury',
				item: 'Eviolite',
				gender: 'M',
				moves: ['U-turn', 'Fake Out', 'Knock Off',
				],
				signatureMove: 'Kitty Crush',
				evs: {
					atk: 252,
					spd: 4,
					spe: 252,
				},
				nature: 'Jolly',
			},
			'+bunnery5' : {
				species: 'Tympole',
				ability: 'Muscles',
				item: 'Salac Berry',
				gender: 'M',
				moves: ['storedpower', 'cosmicpower', 'hydropump'],
				signatureMove: 'Bunnery Hates You Seed',
				evs: {
					def: 252,
					spd: 252,
					spe: 4,
				},
				nature: 'Timid',
			},
		};
		// convert moves to ids.
		for (let k in sets) {
			sets[k].moves = sets[k].moves.map(toId);
			sets[k].baseSignatureMove = toId(sets[k].baseSignatureMove);
		}

		// Generate the team randomly.
		let pool = Dex.shuffle(Object.keys(sets));
		for (let i = 0; i < 6; i++) {
			/*if (i === 1) {
				let monIds = pool.slice(0, 6).map(function (p) {
					return toId(p);
				});
				for (let mon in sets) {
					if (toId(mon) === userid && monIds.indexOf(userid) === -1) {
						pool[1] = mon;
						break;
					}
				}
			}*/
			let set = sets[pool[i]];
			set.level = 100;
			set.name = pool[i];
			if (!set.ivs) {
				set.ivs = {hp:31, atk:31, def:31, spa:31, spd:31, spe:31};
			} else {
				for (let iv in {hp:31, atk:31, def:31, spa:31, spd:31, spe:31}) {
					set.ivs[iv] = set.ivs[iv] || set.ivs[iv] === 0 ? set.ivs[iv] : 31;
				}
			}
			// Assuming the hardcoded set evs are all legal.
			if (!set.evs) set.evs = {hp:84, atk:84, def:84, spa:84, spd:84, spe:84};
			set.moves = [this.sampleNoReplace(set.moves), this.sampleNoReplace(set.moves), this.sampleNoReplace(set.moves)].concat(set.signatureMove);
			team.push(set);
		}
		return team;
	}
}

module.exports = RandomSeasonalRegStaffTeams;
