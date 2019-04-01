'use strict';

exports.BattlePokedex = {
	tropius: {
		inherit: true,
		baseStats: {
			hp: 110,
			atk: 70,
			def: 85,
			spa: 100,
			spd: 90,
			spe: 75,
		},
	},
	avalugg: {
		inherit: true,
		baseStats: {
			hp: 100,
			atk: 125,
			def: 155,
			spa: 30,
			spd: 95,
			spe: 30,
		},
	},
	delibird: {
		inherit: true,
		baseStats: {
			hp: 75,
			atk: 90,
			def: 75,
			spa: 70,
			spd: 60,
			spe: 100,
		},
		abilities: {
			0: 'Vital Spirit',
			1: 'Hustle',
			H: 'Fur Coat',
		},
	},
	golduck: {
		inherit: true,
		baseStats: {
			hp: 100,
			atk: 80,
			def: 80,
			spa: 125,
			spd: 125,
			spe: 85,
		},
		types: ['Water', 'Psychic'],
		abilities: {
			0: 'Trace',
			1: 'Cloud Nine',
			H: 'Swift Swim',
		},
	},
	gyarados: {
		inherit: true,
		types: ['Water', 'Dragon'],
		abilities: {
			0: 'Intimidate',
			1: 'Hustle',
			H: 'Moxie',
		},
	},
	gyaradosmega: {
		inherit: true,
		types: ['Water', 'Dragon'],
		abilities: {
			0: 'Hustle',
		},
	},
	torterra: {
		inherit: true,
		baseStats: {
			hp: 130,
			atk: 110,
			def: 120,
			spa: 60,
			spd: 100,
			spe: 25,
		},
		abilities: {
			0: 'Overgrow',
			1: 'Thick Fat',
			H: 'Shell Armor',
		},
	},
	flygon: {
		inherit: true,
		baseStats: {
			hp: 75,
			atk: 115,
			def: 80,
			spa: 60,
			spd: 80,
			spe: 110,
		},
		abilities: {
			0: 'Levitate',
			1: 'Tinted Lens',
		},
		types: ['Dragon', 'Bug'],
	},
	magmortar: {
		inherit: true,
		baseStats: {
			hp: 100,
			atk: 60,
			def: 55,
			spa: 160,
			spd: 75,
			spe: 95,
		},
		abilities: {
			0: 'Flame Body',
			1: 'Turboblaze',
			H: 'Vital Spirit',
		},
		types: ['Fire', 'Normal'],
	},
	electivire: {
		inherit: true,
		baseStats: {
			hp: 60,
			atk: 140,
			def: 65,
			spa: 95,
			spd: 75,
			spe: 115,
		},
		abilities: {
			0: 'Motor Drive',
			1: 'Teravolt',
			H: 'Vital Spirit',
		},
		types: ['Electric', 'Fighting'],
	},
	grumpig: {
		inherit: true,
		baseStats: {
			hp: 120,
			atk: 50,
			def: 75,
			spa: 110,
			spd: 110,
			spe: 85,
		},
		abilities: {
			0: 'Thick Fat',
			1: 'Magic Bounce',
			H: 'Gluttony',
		},
	},
	infernape: {
		inherit: true,
		baseStats: {
			hp: 75,
			atk: 130,
			def: 55,
			spa: 120,
			spd: 60,
			spe: 125,
		},
		abilities: {
			0: 'Blaze',
			1: 'Anger Point',
			H: 'Iron Fist',
		},
	},
	emolga: {
		inherit: true,
		baseStats: {
			hp: 60,
			atk: 100,
			def: 65,
			spa: 100,
			spd: 65,
			spe: 105,
		},
		abilities: {
			0: 'Static',
			1: 'Aerilate',
			H: 'Motor Drive',
		},
	},
	dunsparce: {
		inherit: true,
		baseStats: {
			hp: 150,
			atk: 120,
			def: 80,
			spa: 30,
			spd: 90,
			spe: 10,
		},
		abilities: {
			0: 'Serene Grace',
			1: 'Multitype',
			H: 'Rattled',
		},
	},
	delphox: {
		inherit: true,
		baseStats: {
			hp: 75,
			atk: 65,
			def: 70,
			spa: 155,
			spd: 90,
			spe: 135,
		},
		abilities: {
			0: 'Blaze',
			1: 'Flash Fire',
			H: 'Magician',
		},
	},
	empoleon: {
		inherit: true,
		baseStats: {
			hp: 115,
			atk: 90,
			def: 90,
			spa: 130,
			spd: 105,
			spe: 45,
		},
		abilities: {
			0: 'Torrent',
			1: 'Filter',
			H: 'Defiant',
		},
	},
	mantine: {
		inherit: true,
		baseStats: {
			hp: 110,
			atk: 55,
			def: 60,
			spa: 120,
			spd: 140,
			spe: 90,
		},
	},
	pangoro: {
		inherit: true,
		baseStats: {
			hp: 95,
			atk: 130,
			def: 80,
			spa: 55,
			spd: 75,
			spe: 80,
		},
	},
	aerodactyl: {
		inherit: true,
		abilities: {
			0: 'Rock Head',
			1: 'Tough Claws',
			H: 'Unnerve',
		},
		types: ['Rock', 'Dragon'],
	},
	aerodactylmega: {
		inherit: true,
		types: ['Rock', 'Dragon'],
	},
};
