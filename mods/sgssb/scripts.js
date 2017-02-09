// Custom SpacialGaze scripts.
'use strict';

exports.BattleScripts = {
	randomSeasonalRegStaffTeam: function (side) {
		let team = [];
		let variant = this.random(2);

		let sets = {
			// Admins.
			'~HoeenHero': {
				species: 'Ludicolo',
				ability: 'Swift Swim',
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

			// Global Leaders:
			'&HiroZ': {
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
			'&Kraken Mare': {
				species: 'Gardevoir',
				ability: 'Moody',
				shiny: true,
				item: 'Gardevoirite',
				gender: 'F',
				moves: ['Moonblast', 'Calm Mind', 'Psychic',
				],
				signatureMove: 'Mega Rage',
				evs: {
					hp: 248,
					spa: 252,
					def: 8,
				},
				nature: 'Modest',
			},
			// Global Moderators:
			'@C733937 123': {
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
				},
				nature: 'Adamant',
			},
			'@Desokoro': {
				species: 'Gyarados',
				ability: 'Guts',
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
			'@Mimiroppu': {
				species: 'Lopunny',
				ability: 'Limber',
				item: 'Lopunnite',
				gender: 'F',
				moves: ['Fake out', 'Return', 'High Jump Kick',
				 ],
				signatureMove: 'Charm Up',
				evs: {
					atk: 252,
					spe: 252,
					def: 4,
				},
				nature: 'Jolly',
			},
			'@Vacuo': {
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

			// Global Drivers:
			'%Ashley the Pikachu': {
				species: 'Pikachu',
				ability: 'Electric Surge',
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
			'%Vulcaron': {
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
			// Former Bots
			'*SpaceGazer': {
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
			'*Spacial Bot': {
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
			'*SG Bot': {
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
				nature: 'Adamant',
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
				ability: 'Levitate',
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
			'+Hydrostatics': {
				species: 'Charizard',
				ability: 'Solar Power',
				item: 'Charizardite X',
				gender: 'M',
				moves: ['Outrage', 'Flare Blitz', 'Thunder Punch',
				],
				signatureMove: 'Nature\'s Fury',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Jolly',
			},
			'+Ranfen': {
				species: 'Flygon',
				ability: 'Levitate',
				item: 'Choice Band',
				moves: ['Outrage', 'Dragon Dance', 'Earthquake',
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
				species: 'Volcanion',
				ability: 'Protean',
				item: 'Life Orb',
				moves: ['Fire Blast', 'Steam Eruption', 'Recover',
				],
				signatureMove: 'Vapor Boost',
				evs: {
					spa: 252,
					spe: 252,
					hp: 4,
				},
				nature: 'Timid',
			},
			'+UmichBrendan': {
				species: 'Slaking',
				ability: 'Guts',
				item: 'Flame Orb',
				gender: 'M',
				moves: ['Fire Punch', 'Thunder Punch', 'Facade',
				],
				signatureMove: 'Vacation Time',
				evs: {
					atk: 252,
					spe: 4,
					hp: 252,
				},
				nature: 'Modest',
			},
			'+Xavier1942': {
				species: 'Porygon2',
				ability: 'Prankster',
				item: 'Eviolite',
				moves: ['Tri Attack', 'Recover', 'Ice Beam',
				],
				signatureMove: 'Xavier Hax',
				evs: {
					hp: 252,
					def: 136,
					spa: 24,
					spd: 96,
				},
				nature: 'Bold',
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
		};
		// convert moves to ids.
		for (let k in sets) {
			sets[k].moves = sets[k].moves.map(toId);
			sets[k].baseSignatureMove = toId(sets[k].baseSignatureMove);
		}

		// Generate the team randomly.
		let pool = Object.keys(sets);
		for (let i = 0; i < 6; i++) {
			let name = this.sampleNoReplace(pool);
			let set = sets[name];
			set.level = 100;
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
			// Assuming the hardcoded set evs are all legal.
			if (!set.evs) {
				set.evs = {
					hp: 84,
					atk: 84,
					def: 84,
					spa: 84,
					spd: 84,
					spe: 84,
				};
			}
			set.moves = [this.sampleNoReplace(set.moves), this.sampleNoReplace(set.moves), this.sampleNoReplace(set.moves)].concat(set.signatureMove);
			team.push(set);
		}
		return team;
	},
};
