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
			'~Kraken Mare': {
				species: 'Gardevoir-Mega',
				ability: 'Kraken\'s Boost',
				shiny: true,
				item: 'Focus Sash',
				gender: 'F',
				moves: ['Moonblast', 'Calm Mind', 'Psychic',
				],
				signatureMove: 'Revenge of Kraken Mare',
				evs: {
					hp: 248,
					spa: 252,
					def: 8,
				},
				nature: 'Modest',
			},
			// Global Leaders:
			'&C733937 123': {
				species: 'Tyranitar',
				ability: 'Bulletproof',
				item: 'Safety Goggles',
				gender: 'M',
				moves: ['Assist', 'Beat Up', 'Sucker Punch', 'Heavy Slam',
				],
				signatureMove: 'Lightshot Giga-Lance',
				evs: {
					hp: 252,
					atk: 252,
					def: 4,
				},
				nature: 'Adamant',
			},
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
			"*Charon Bot": {
				species: "Regigigas",
				ability: "node bot",
				item: "Life Orb",
				gender: "F",
				moves: ['Return', 'Knock Off', 'Bulk Up'],
				signatureMove: "R U Regi",
				evs: {
					atk: 252,
					hp: 4,
					spe: 252,
				},
				nature: "Adamant",
			},
			// Global Moderators:
			'@Desokoro': {
				species: 'Gyarados',
				ability: 'Wave Call',
				item: 'Leftovers',
				gender: 'M',
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
			// Global Drivers:
			'%ducktown': {
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
			'%Serperiorater': {
				species: 'Serperior',
				ability: 'Sturdy',
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
				species: "Lycanroc",
				ability: "Snow Warning",
				item: "Not the Lycanium Z i swear",
				gender: "M",
				moves: ['Diamond Storm', 'Earthquake', 'Aurora Veil'],
				signatureMove: "Alt Storm",
				evs: {
					atk: 252,
					def: 4,
					spe: 252,
				},
				nature: "Jolly",
			},
			// Global Voices:
			'+Admewn': {
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
			'+HiroZ': {
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
			'+Auction': {
				species: 'Aegislash',
				ability: 'Water Absorb',
				item: 'Leftovers',
				gender: 'M',
				moves: ['Swords Dance', 'Sacred Sword', 'Shadow Sneak', 'Kings Shield',
				],
				signatureMove: 'Zeo-Bash',
				evs: {
					atk: 252,
					spd: 8,
					hp: 248,
				},
				nature: 'Adamant',
			},
			'+Clue': {
				species: 'Magnezone',
				ability: 'Levitate',
				item: 'Choice Specs',
				moves: [
					['Volt Switch', 'Thunderbolt'][this.random(2)], 'Hidden Power Ice', 'Aura Sphere',
				],
				signatureMove: 'Mechanical Dysfunction',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Modest',
			},
			'+Ranfen': {
				species: 'Flygon',
				ability: 'DesertDragon',
				item: 'Focus Sash',
				moves: ['Stone Edge', 'Dragon Claw', 'Earthquake',
				],
				signatureMove: 'Out Ripper',
				evs: {
					atk: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Adamant',
			},
			'+The Run': {
				species: 'Deoxys-Speed',
				ability: 'Prism Armor',
				item: 'TwistedSpoon',
				moves: ['Psychic', 'Protect', 'Aura Sphere',
				],
				signatureMove: 'Time-Space Rush',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Timid',
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
			'+Vulcaron': {
				species: 'Murkrow',
				ability: 'Prankster',
				item: 'Eviolite',
				gender: 'M',
				moves: ['Thunder Wave', 'Mean Look', 'Confuse Ray',
				],
				signatureMove: 'Troll',
				evs: {
					hp: 252,
					def: 252,
					spd: 4,
				},
				nature: 'Impish',
			},
			'+Mimiroppu': {
				species: 'Lopunny',
				ability: 'Limber',
				item: 'Lopunnite',
				gender: 'F',
				moves: ['Fake Out', 'Return', 'High Jump Kick',
				 ],
				signatureMove: 'Charm Up',
				evs: {
					atk: 252,
					spe: 252,
					def: 4,
				},
				nature: 'Jolly',
			},
			'+Hurricane\'d': {
				species: 'Tomohawk',
				ability: 'Gale Wings',
				item: 'Rocky Helmet',
				gender: 'M',
				moves: ['Aura Sphere', 'Taunt', 'Hurricane',
				],
				signatureMove: 'Rainbust Orb',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Bold',
			},
			'+Insist': {
				species: "Ludicolo",
				ability: "Crippling Depression",
				item: "Playnium Z",
				gender: "M",
				shiny: true,
				moves: ['freezedry', 'gigadrain', 'focusblast'],
				baseSignatureMove: "aquasubscribe",
				signatureMove: "Aqua Subscribe",
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: "Timid",
			},
			// Former Bots
			' SpaceGazer': {
				species: 'Registeel',
				ability: 'No Guard',
				item: 'Weakness Policy',
				moves: ['Zap Cannon', 'Iron Head', 'Stone Edge',
				],
				signatureMove: 'Spacial Blast',
				evs: {
					atk: 252,
					spd: 252,
					hp: 4,
				},
				nature: 'Adamant',
			},
			' Spacial Bot': {
				species: 'Regirock',
				ability: 'Wonder Guard',
				item: 'Leftovers',
				moves: [
					['Stone Edge', 'Earthquake'][variant], 'Explosion', 'Iron Head',
				],
				signatureMove: 'Ancient Ritual',
				evs: {
					atk: 252,
					spd: 252,
					hp: 4,
				},
				nature: 'Adamant',
			},
			' SG Bot': {
				species: 'Regice',
				ability: 'Flash Fire',
				item: 'Leftovers',
				moves: ['Ice Beam', 'Ancient Power', 'Thunderbolt',
				],
				signatureMove: 'Frostbite',
				evs: {
					spa: 252,
					spd: 252,
					hp: 4,
				},
				nature: 'Modest',
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
