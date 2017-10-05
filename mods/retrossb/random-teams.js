'use strict';

const RandomTeams = require('../../data/random-teams');

class RandomRetroStaffTeams extends RandomTeams {
	randomRetroStaffTeam(side) {
		let team = [];
		//var variant = this.random(2);
		let sets = {
			//Admins
			'~Legit Button': {
				species: 'Haunter',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Psychic', 'Thunderbolt', 'Hypnosis', 'Mega Drain'],
				signatureMove: '',
				noCustom: true,
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			'~Aston Rasen': {
				species: 'Gengar',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Psychic', 'Thunderbolt', 'Hypnosis'],
				signatureMove: 'Crisis',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			'~codelegend': {
				species: 'Arcanine',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Hyper Beam', 'Body Slam', 'Fire Blast'],
				signatureMove: 'Code Hax',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			'~supersonicx': {
				species: 'Metapod',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Tackle', 'String Shot', 'Harden'],
				signatureMove: 'Abuse Power',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			/*'~Keckleon Market': {
				species: 'Blastoise', ability: 'None', item: '', gender: false,
				moves: ['Hydro Pump', 'Surf', 'Blizzard'],
				signatureMove: '',
				evs: {hp: 255, atk: 255, def: 255, spa: 255, spd: 255, spe: 255},
			},*/
			'~Klaymore': {
				species: 'Golem',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Earthquake', 'Explosion', 'Seismic Toss'],
				signatureMove: 'Rapid Roll',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			//Leaders
			'&HoeenKid': {
				species: 'Exeggutor',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Sleep Powder', 'Psychic', 'Substitute'],
				signatureMove: 'Super Giga Drain',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			/*'&BDH93': {
				species: 'Snorlax', ability: 'None', item: '', gender: false,
				moves: ['Earthquake', 'Body Slam', 'Metronome'],
				signatureMove: '',
				evs: {hp: 255, atk: 255, def: 255, spa: 255, spd: 255, spe: 255},
			},*/
			/*'&Blueflame628': {
				species: 'Blastoise', ability: 'None', item: '', gender: false,
				moves: ['Hydro Pump', 'Surf', 'Blizzard'],
				signatureMove: '',
				evs: {hp: 255, atk: 255, def: 255, spa: 255, spd: 255, spe: 255},
			},*/
			'&X ADN Y DUDEET': {
				species: 'Slowbro',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Reflect', 'Surf', 'Thunder Wave'],
				signatureMove: 'Psyburst',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			'&FernBoy': {
				species: 'Raichu',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Agility', 'Body Slam', 'Thunderbolt'],
				signatureMove: 'Minimum Power',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			//Mods
			'@Opple': {
				species: 'Hitmonlee',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['High Jump Kick', 'Body Slam', 'Substitute'],
				signatureMove: 'Boostmonlee',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			/*'@Almighty Bronzong': {
				species: 'Blastoise', ability: 'None', item: '', gender: false,
				moves: ['Hydro Pump', 'Surf', 'Blizzard'],
				signatureMove: '',
				evs: {hp: 255, atk: 255, def: 255, spa: 255, spd: 255, spe: 255},
			},*/
			'@Hydrostatics': {
				species: 'Charizard',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Fire Blast', 'Body Slam', 'Earthquake'],
				signatureMove: 'Natures Fury',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			'@Mimiroppu': {
				species: 'Starmie',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Surf', 'Psychic', 'Blizzard'],
				signatureMove: 'Starlight',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			'@NoNickHere': {
				species: 'Vaporeon',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Ice Beam', 'Substitute', 'Acid Armor'],
				signatureMove: 'Ice Spirit',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			'@yungSensory': {
				species: 'Venomoth',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Psychic', 'Stun Spore', 'Whirlwind'],
				signatureMove: 'Poison Shock',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			'@Revinton': {
				species: 'Doduo',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Tri Attack', 'Drill Peck', 'Agility'],
				signatureMove: 'Double Assist',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			'@Frontier B. Kathey': {
				species: 'Cloyster',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Withdraw', 'Clamp', 'Ice Beam'],
				signatureMove: 'Spike Release',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			//Drivers
			'%Sonarflare': {
				species: 'Blastoise',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Rapid Spin', 'Hydro Cannon', 'Skull Bash'],
				signatureMove: 'Turtle Boost',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			'%BattleDragon': {
				species: 'Dragonite',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Wrap', 'Agility', 'Hyper Beam'],
				signatureMove: 'Dragons Strike',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			/*'%Mystifi': {
				species: 'Blastoise', ability: 'None', item: '', gender: false,
				moves: ['Hydro Pump', 'Surf', 'Blizzard'],
				signatureMove: '',
				evs: {hp: 255, atk: 255, def: 255, spa: 255, spd: 255, spe: 255},
			},*/
			/*'%Master Float': {
				species: 'Dragonite', ability: 'None', item: '', gender: false,
				moves: ['Extreme Speed', 'Dragon Claw', 'Earthquake'],
				signatureMove: 'Flying Strike',
				evs: {hp: 255, atk: 255, def: 255, spa: 255, spd: 255, spe: 255},
			},*/
			'%Pokemon Trainer Jaier': {
				species: 'Rattata',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Quick Attack', 'Swift', 'Hyper Fang'],
				signatureMove: 'Nibble',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			//Voices
			'+Umich Brendan': {
				species: 'Magmar',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Fire Punch', 'Body Slam', 'Toxic'],
				signatureMove: 'Building Rage',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			'+Regional Bot': {
				species: 'Magneton',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Thunderbolt', 'Reflect', 'Hyper Beam'],
				signatureMove: 'Metal Bomb',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
			'+coldgenisis': {
				species: 'Clefable',
				ability: 'None',
				item: '',
				gender: false,
				moves: ['Psychic', 'Ice Beam', 'Thunderbolt'],
				signatureMove: 'Cold Revenge',
				evs: {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				},
			},
		};

		let pool = Object.keys(sets);
		for (let i = 0; i < 6; i++) {
			let name = this.sampleNoReplace(pool);
			let set = sets[name];
			set.level = 100;
			set.name = name;
			set.ivs = {
				hp: 30,
				atk: 30,
				def: 30,
				spa: 30,
				spd: 30,
				spe: 30,
			};
			if (!set.evs) {
				set.evs = {
					hp: 255,
					atk: 255,
					def: 255,
					spa: 255,
					spd: 255,
					spe: 255,
				};
			}
			set.moves = set.moves.concat(set.signatureMove);
			team.push(set);
		}
		return team;
	}
}

module.exports = RandomRetroStaffTeams;