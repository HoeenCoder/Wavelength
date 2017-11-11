'use strict';

// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.js

exports.Formats = [

	// SM Singles
	///////////////////////////////////////////////////////////////////
	{
		section: "SM Singles",
	},
	{
		name: "[Gen 7] Random Battle",
		desc: ["Randomized teams of level-balanced Pok&eacute;mon with sets that are generated to be competitively viable."],

		mod: 'gen7',
		team: 'random',
		ruleset: ['PotD', 'Pokemon', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 7] Unrated Random Battle",

		mod: 'gen7',
		team: 'random',
		challengeShow: false,
		rated: false,
		ruleset: ['PotD', 'Pokemon', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 7] OU",

		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3608656/\">OU Metagame Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3587177/\">OU Banlist</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3590726/\">OU Viability Rankings</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3606650/\">OU Sample Teams</a>",
		],

		mod: 'gen7',
		ruleset: ['Pokemon', 'Standard', 'Team Preview'],
		banlist: ['Uber', 'Arena Trap', 'Power Construct', 'Shadow Tag', 'Baton Pass'],
	},
	{
		name: "[Gen 7] Ubers",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3587184/\">Ubers Metagame Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3591388/\">Ubers Viability Rankings</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3599816/\">Ubers Sample Teams</a>",
		],

		mod: 'gen7',
		ruleset: ['Pokemon', 'Standard', 'Team Preview', 'Mega Rayquaza Clause'],
		banlist: ['Baton Pass'],
	},
	{
		name: "[Gen 7] UU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3616332/\">UU Metagame Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3613279/\">UU Viability Rankings</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3591880/\">UU Sample Teams</a>",
		],

		mod: 'gen7',
		ruleset: ['[Gen 7] OU'],
		banlist: ['OU', 'BL', 'Drizzle', 'Mewnium Z'],
	},
	{
		name: "[Gen 7] RU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3615711/\">RU Metagame Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3602279/\">RU Viability Rankings</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3598090/\">RU Sample Teams</a>",
		],

		mod: 'gen7',
		ruleset: ['[Gen 7] UU'],
		banlist: ['UU', 'BL2', 'Aurora Veil'],
	},
	{
		name: "[Gen 7] NU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3616091/\">NU Metagame Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3607629/\">NU Viability Rankings</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3606112/\">NU Sample Teams</a>",
		],

		mod: 'gen7',
		ruleset: ['[Gen 7] RU'],
		banlist: ['RU', 'BL3', 'Drought'],
	},
	{
		name: "[Gen 7] PU",
		desc: ["&bullet; <a href=\"http://www.smogon.com/forums/threads/3614120/\">PU Metagame Discussion</a>"],

		mod: 'gen7',
		ruleset: ['[Gen 7] NU'],
		banlist: ['NU', 'BL4'],
	},
	{
		name: "[Gen 7] LC",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3587196/\">LC Metagame Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/dex/sm/formats/lc/\">LC Banlist</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3609771/\">LC Viability Rankings</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3588679/\">LC Sample Teams</a>",
		],

		mod: 'gen7',
		maxLevel: 5,
		ruleset: ['Pokemon', 'Standard', 'Swagger Clause', 'Team Preview', 'Little Cup'],
		banlist: ['Cutiefly', 'Drifloon', 'Gligar', 'Gothita', 'Meditite', 'Misdreavus', 'Murkrow', 'Porygon', 'Scyther', 'Sneasel', 'Swirlix', 'Tangela', 'Vulpix-Base', 'Yanma', 'Eevium Z', 'Dragon Rage', 'Sonic Boom'],
	},
	{
		name: "[Gen 7] Monotype",
		desc: [
			"All the Pok&eacute;mon on a team must share a type.",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3587204/\">Monotype Metagame Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3589809/\">Monotype Viability Rankings</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3599682/\">Monotype Sample Teams</a>",
		],

		mod: 'gen7',
		searchShow: false,
		ruleset: ['Pokemon', 'Standard', 'Swagger Clause', 'Same Type Clause', 'Team Preview'],
		banlist: [
			'Aegislash', 'Arceus', 'Blaziken', 'Darkrai', 'Deoxys-Base', 'Deoxys-Attack', 'Dialga', 'Genesect', 'Giratina', 'Groudon', 'Ho-Oh', 'Hoopa-Unbound', 'Kartana', 'Kyogre', 'Kyurem-White',
			'Lugia', 'Lunala', 'Magearna', 'Marshadow', 'Mewtwo', 'Palkia', 'Pheromosa', 'Rayquaza', 'Reshiram', 'Shaymin-Sky', 'Solgaleo', 'Tapu Lele', 'Xerneas', 'Yveltal', 'Zekrom', 'Zygarde',
			'Battle Bond', 'Damp Rock', 'Gengarite', 'Kangaskhanite', 'Lucarionite', 'Mawilite', 'Medichamite', 'Metagrossite', 'Salamencite', 'Smooth Rock', 'Terrain Extender', 'Baton Pass',
		],
	},
	{
		name: "[Gen 7] Monotype (suspect test)",
		desc: ["&bullet; <a href=\"http://www.smogon.com/forums/threads/3617517/\">Monotype Suspect Test</a>"],

		mod: 'gen7',
		challengeShow: false,
		ruleset: ['[Gen 7] Monotype'],
		banlist: ['Shadow Tag'],
	},
	{
		name: "[Gen 7] Anything Goes",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3587441/\">Anything Goes</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3591711/\">AG Resources</a>",
			"&bullet; <a href=\"http://www.smogon.com/tiers/om/analyses/ag/\">AG Analyses</a>",
		],

		mod: 'gen7',
		ruleset: ['Pokemon', 'Endless Battle Clause', 'Team Preview', 'HP Percentage Mod', 'Cancel Mod'],
		banlist: ['Illegal', 'Unreleased'],
	},
	{
		name: "[Gen 7] CAP",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3587865/\">CAP Metagame Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3597893/\">CAP Viability Rankings</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/7203358/\">CAP Sample Teams</a>",
		],

		mod: 'gen7',
		ruleset: ['[Gen 7] OU', 'Allow CAP'],
		banlist: ['Tomohawk + Earth Power', 'Tomohawk + Reflect'],
	},
	{
		name: "[Gen 7] CAP LC",
		desc: ["&bullet; <a href=\"http://www.smogon.com/forums/threads/3599594/\">CAP LC</a>"],

		mod: 'gen7',
		searchShow: false,
		maxLevel: 5,
		ruleset: ['[Gen 7] LC', 'Allow CAP'],
	},
	{
		name: "[Gen 7] Battle Spot Singles",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3601012/\">Introduction to Battle Spot Singles</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3605970/\">Battle Spot Singles Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3601658/\">Battle Spot Singles Roles Compendium</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3593055/\">Battle Spot Singles Sample Teams</a>",
		],

		mod: 'gen7',
		maxForcedLevel: 50,
		teamLength: {
			validate: [3, 6],
			battle: 3,
		},
		ruleset: ['Pokemon', 'Standard GBU', 'Team Preview'],
		requirePentagon: true,
	},
	{
		name: "[Gen 7] Battle Spot Special 6",
		desc: ["&bullet; <a href=\"http://www.smogon.com/forums/threads/3614104/\">Battle Spot Special</a>"],

		mod: 'gen7',
		maxForcedLevel: 50,
		teamLength: {
			validate: [3, 6],
			battle: 3,
		},
		ruleset: ['Pokemon', 'Standard GBU', 'Team Preview'],
		banlist: ['Aegislash', 'Blaziken', 'Charizard', 'Ferrothorn', 'Garchomp', 'Gengar', 'Greninja', 'Gyarados', 'Hippowdon', 'Landorus',
			'Landorus-Therian', 'Lucario', 'Mamoswine', 'Mimikyu', 'Porygon2', 'Salamence', 'Tapu Fini', 'Tapu Koko', 'Tapu Lele',
		],
		requirePentagon: true,
	},
	{
		name: "[Gen 7] Custom Game",

		mod: 'gen7',
		searchShow: false,
		canUseRandomTeam: true,
		debug: true,
		maxLevel: 9999,
		defaultLevel: 100,
		teamLength: {
			validate: [1, 24],
			battle: 24,
		},
		// no restrictions, for serious (other than team preview)
		ruleset: ['Team Preview', 'Cancel Mod'],
	},

	// SM Doubles
	///////////////////////////////////////////////////////////////////

	{
		section: "SM Doubles",
	},
	{
		name: "[Gen 7] Random Doubles Battle",

		mod: 'gen7',
		gameType: 'doubles',
		team: 'random',
		ruleset: ['PotD', 'Pokemon', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 7] Doubles OU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3610992/\">Doubles OU Metagame Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3592903/\">Doubles OU Viability Rankings</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3590987/\">Doubles OU Sample Teams</a>",
		],

		mod: 'gen7',
		gameType: 'doubles',
		ruleset: ['Pokemon', 'Standard Doubles', 'Swagger Clause', 'Team Preview'],
		banlist: ['Arceus', 'Dialga', 'Giratina', 'Giratina-Origin', 'Groudon', 'Ho-Oh', 'Jirachi', 'Kyogre', 'Kyurem-White',
			'Lugia', 'Lunala', 'Magearna', 'Mewtwo', 'Palkia', 'Rayquaza', 'Reshiram', 'Solgaleo', 'Xerneas', 'Yveltal', 'Zekrom',
			'Power Construct', 'Eevium Z', 'Kangaskhanite', 'Dark Void', 'Gravity ++ Grass Whistle', 'Gravity ++ Hypnosis', 'Gravity ++ Lovely Kiss', 'Gravity ++ Sing', 'Gravity ++ Sleep Powder',
		],
	},
	{
		name: "[Gen 7] Doubles Ubers",

		mod: 'gen7',
		gameType: 'doubles',
		ruleset: ['Pokemon', 'Standard Doubles', 'Team Preview'],
		banlist: ['Illegal', 'Unreleased', 'Dark Void'],
	},
	{
		name: "[Gen 7] Doubles UU",
		desc: ["&bullet; <a href=\"http://www.smogon.com/forums/threads/3598014/\">Doubles UU Metagame Discussion</a>"],

		mod: 'gen7',
		gameType: 'doubles',
		ruleset: ['[Gen 7] Doubles OU'],
		banlist: [
			'Aegislash', 'Amoonguss', 'Arcanine', 'Bronzong', 'Celesteela', 'Deoxys-Attack', 'Diancie', 'Excadrill', 'Ferrothorn',
			'Garchomp', 'Gastrodon', 'Genesect', 'Heatran', 'Hoopa-Unbound', 'Jirachi', 'Kartana', 'Kingdra', 'Kyurem-Black',
			'Landorus-Therian', 'Ludicolo', 'Marowak-Alola', 'Marshadow', 'Milotic', 'Mimikyu', 'Ninetales-Alola', 'Oranguru',
			'Pelipper', 'Politoed', 'Porygon2', 'Scrafty', 'Snorlax', 'Suicune', 'Tapu Bulu', 'Tapu Fini', 'Tapu Koko',
			'Tapu Lele', 'Tyranitar', 'Volcanion', 'Volcarona', 'Weavile', 'Whimsicott', 'Zapdos', 'Zygarde-Base',
			'Charizardite Y', 'Diancite', 'Gardevoirite', 'Gengarite', 'Kangaskhanite', 'Mawilite', 'Metagrossite', 'Salamencite', 'Swampertite',
		],
	},
	{
		name: "[Gen 7] VGC 2017",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3583926/\">VGC 2017 Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3591794/\">VGC 2017 Viability Rankings</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3590391/\">VGC 2017 Sample Teams</a>",
		],

		mod: 'gen7',
		gameType: 'doubles',
		forcedLevel: 50,
		teamLength: {
			validate: [4, 6],
			battle: 4,
		},
		timer: {starting: 15 * 60 - 10, perTurn: 10, maxPerTurn: 60, maxFirstTurn: 90, timeoutAutoChoose: true},
		ruleset: ['Pokemon', 'Species Clause', 'Nickname Clause', 'Item Clause', 'Team Preview', 'Cancel Mod', 'Alola Pokedex'],
		banlist: ['Illegal', 'Unreleased', 'Solgaleo', 'Lunala', 'Necrozma', 'Magearna', 'Marshadow', 'Zygarde', 'Mega'],
		requirePlus: true,
	},
	{
		name: "[Gen 7] Battle Spot Doubles",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3595001/\">Battle Spot Doubles Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3593890/\">Battle Spot Doubles Viability Rankings</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3595859/\">Battle Spot Doubles Sample Teams</a>",
		],

		mod: 'gen7',
		gameType: 'doubles',
		maxForcedLevel: 50,
		teamLength: {
			validate: [4, 6],
			battle: 4,
		},
		ruleset: ['Pokemon', 'Standard GBU', 'Team Preview'],
		requirePentagon: true,
	},
	{
		name: "[Gen 7] Doubles Custom Game",

		mod: 'gen7',
		gameType: 'doubles',
		searchShow: false,
		canUseRandomTeam: true,
		maxLevel: 9999,
		defaultLevel: 100,
		debug: true,
		teamLength: {
			validate: [2, 24],
			battle: 24,
		},
		// no restrictions, for serious (other than team preview)
		ruleset: ['Team Preview', 'Cancel Mod'],
	},

	///////////////////////////////////////////////////////
	// Wavelength Metagames
	{
		section: 'Wavelength Metagames',
		column: 2,
	},
	{
		name: "[Gen 7] Metronome Battle",
		desc: ["&bullet; Metronome battles format: 6v6 singles, Only move allowed is metronome, all healing items/abilities are banned, Ubers (and mega rayquaza) are banned, immunites dont exist in this format (ex normal is not very effective on ghost instead of x0)"],
		ruleset: ['Pokemon', 'Standard'],
		banlist: ['Uber', 'Arena Trap', 'Power Construct', 'Shadow Tag', 'Baton Pass', 'Aguav Berry', 'Assault Vest', 'Berry Juice', 'Cheek Pouch', 'Dry Skin', 'Ice Body', 'Poison Heal', 'Regenerator', 'Volt Absorb', 'Water Absorb', 'Rain Dish', 'Black Sludge', 'Enigma Berry', 'Figy Berry', 'Iapapa Berry', 'Mago Berry', 'Oran Berry', 'Shell Bell', 'Sitrus Berry', 'Wiki Berry', 'Leftovers'],
		mod: 'metronome',
		onValidateSet: function (set) {
			if (set.moves.length !== 1 || toId(set.moves[0]) !== 'metronome') {
				return [(set.name || set.species) + " can only have Metronome."];
			}
		},
		onEffectiveness: function (typeMod, target, type, move) {
			//change no effect to not very effective
			if (move && !this.getImmunity(move, type)) return 2;
		},
	},
	{
		name: "[Gen 7] Random Metronome Battle",
		desc: ["&bullet; Metronome battles format: 6v6 singles, Only move allowed is metronome, all healing items/abilities are banned, Ubers (and mega rayquaza) are banned, immunites dont exist in this format (ex normal is not very effective on ghost instead of x0)"],
		ruleset: ['PotD', 'Pokemon', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
		team: 'random',
		mod: 'gen7',
		onBegin: function () {
			let allPokemon = this.p1.pokemon.concat(this.p2.pokemon);
			allPokemon.forEach(pokemon => {
				pokemon.baseMoveset = [{
					move: 'Metronome',
					id: 'metronome',
					pp: 16,
					maxpp: 16,
					target: 'self',
					disabled: false,
					disabledSource: '',
					used: false,
				}];
				pokemon.moves = ['metronome'];
				pokemon.moveset = pokemon.baseMoveset;
				if (Dex.getFormat('[Gen 7] Metronome Battle').banlist.includes(this.getItem(pokemon.item).name)) {
					pokemon.item = 'leppaberry';
				}
			});
		},
		onEffectiveness: function (typeMod, target, type, move) {
			//change no effect to not very effective
			if (move && !this.getImmunity(move, type)) return 2;
		},
	},
	{
		name: "[Gen 7] Super Staff Bros",

		mod: 'wlssb',
		team: 'randomSeasonalRegStaff',
		ruleset: ['HP Percentage Mod', 'Cancel Mod', 'Sleep Clause Mod'],
		onBegin: function () {
			this.add('message', 'GET READY FOR THE NEXT BATTLE!');

			let allPokemon = this.p1.pokemon.concat(this.p2.pokemon);
			for (let i = 0, len = allPokemon.length; i < len; i++) {
				let pokemon = allPokemon[i];
				let last = pokemon.moves.length - 1;
				if (pokemon.moves[last]) {
					pokemon.moves[last] = toId(pokemon.set.signatureMove);
					pokemon.moveset[last].move = pokemon.set.signatureMove;
					pokemon.baseMoveset[last].move = pokemon.set.signatureMove;
				}
			}
		},
		onSwitchIn: function (pokemon) {
			let name = toId(pokemon.illusion ? pokemon.illusion.name : pokemon.name);
			//Add the mon's status effect to it as a volatile.
			if (this.data.Statuses[name] && this.data.Statuses[name].exists) {
				pokemon.addVolatile(name, pokemon);
			}
		},
		onModifyPokemon: function (pokemon) {
			//let name = toId(pokemon.name);
			// Enforce choice item locking on custom moves.
			let moves = pokemon.moveset;
			if (pokemon.getItem().isChoice && pokemon.lastMove === moves[3].id) {
				for (let i = 0; i < 3; i++) {
					if (!moves[i].disabled) {
						pokemon.disableMove(moves[i].id, false);
						moves[i].disabled = true;
					}
				}
			}
		},
	},
	{
		name: "[Gen 7] Pokemon Mystery Dungeon",

		mod: 'pmd',
		team: 'randomPmd',
		ruleset: ['HP Percentage Mod', 'Cancel Mod'],
		onBegin: function () {
			let allPokemon = this.p1.pokemon.concat(this.p2.pokemon);
			for (let i = 0, len = allPokemon.length; i < len; i++) {
				allPokemon[i].maxhp *= 3;
				allPokemon[i].hp = allPokemon[i].maxhp;
			}
		},
	},
	{
		name: "[Gen 7] Super Staff Bros Free For All",
		desc: ['Duke it out with other users custom made pokemon.',
			'Make your own as well! Get started with <button class="button" name="send" value="/ssb edit">/ssb edit</button>.',
			'Use <button class="button" name="send" value="/ssb">/ssb</button> for the commands you can use.',
		],

		mod: 'cssb',
		team: 'randomCustomSSB',
		ruleset: ['Pokemon', 'Sleep Clause Mod', 'Freeze Clause Mod', 'HP Percentage Mod', 'Cancel Mod', 'Mega Rayquaza Clause'],
		onBegin: function () {
			this.add("raw|<h2>Free for All!</h2>");
			this.add("raw|<h3>3</h3>");
			this.add("raw|<h3>2</h3>");
			this.add("raw|<h3>1</h3>");
			this.add("raw|<h1>BATTLE!</h1>");
		},
		onSwitchInPriority: 1,
		onSwitchIn: function (pokemon) {
			if (!pokemon.template.isMega) pokemon.canMegaEvo = this.canMegaEvo(pokemon);
		},
	},
	{
		name: "[Gen 7] Digimon Showdown",
		desc: [
			"You may have thought this was Pokemon Showdown, but I must reassure you that you were mistaken, welcome to DIGIMON SHOWDOWN",
			"Ahem, but in all seriousness, the following developers listed below created Digimon in Pokemon Showdown, so why not just try it out :D",
			"Ashley the Pikachu (Head Researcher, Began the project, Attack Manual, Type Chart Manual, Music Selection and Music HTML, Sprite Selection), Insist (Head Developer), AlphaStorm (Animations), Gligars (Assisted other developers), HoeenHero (Assisted with Mechanics)",
		],

		mod: "digimon",
		team: "randomDigimon",
		ruleset: ['Cancel Mod', 'HP Percentage Mod'],
		onBegin: function () {
			this.add('raw', '<center><a title="Digimon Tamers: Zone Digital" href="https://www.youtube.com/watch?v=HSm6CHgujSE" target="_blank"><img src="https://x5zb5g.bn1303.livefilestore.com/y3m7hz_BBUaKCiMAo-__U76Xif0Wl70a-muQxVLAUWjhKrErxeDIfH6HBN0_M4Rac9yLWH7VRKR4FaMgx6LLZjUwkKzxp1FKocL16LjZOXJogV8ltDPockgXW8As2JSvW5h9UC-YT6xlUWIN0nE8N2WRcP0f1HxkxQFv16nCBk1cyU?width=124&amp;height=28&amp;cropmode=none" alt="Digimon Tamers: Zone Digital" width="124" height="28" /></a><a title="Digimon Froniter: With the Will BGM Verison" href="https://www.youtube.com/watch?v=aiEQNKFiVRY" target="_blank"><img src="https://x5ysra.bn1303.livefilestore.com/y3mejTyK4Owu1CRO-2dEV6f5sXEzfxKIBJ8zDCKtGOvH2m6TNHfGwEVBnSFYmJnQ5irfZG5PTm2Q_cvEZSVJOjco65nxgpmgxkh9u6-Z2-67FqIWD4oMfceTWGOqlL0n9zDM8OrjYKBhRI3FqA8vZq_eAc1QSWIRCdWDa21vklS4XA?width=124&amp;height=28&amp;cropmode=none" alt="Digimon Frontier: With the WIll BGM" width="124" height="28" /></a><a title="Digimon Adventure: Shuugeki Soshite..." href="https://www.youtube.com/watch?v=66iMd-lpC9E" target="_blank"><img src="https://x5zilq.bn1303.livefilestore.com/y3mIjynkF0J_iQQ0IeK0jCR1BLEIpgDkRRGUdYSyOOeNyFcaWCkI5W6LrQamjbqgibv203Ss824bh24kF_gBWNhxOBkjg_rdimfGBsN_6a1k64KydPJRTTrZdA6naRzTBOoxg59qQVtt6I0vQ3d5iAfLRoM_JirnCb7jLX-Ok93YL8?width=124&amp;height=28&amp;cropmode=none" alt="Digimon Adventure: Shuugeki! Soshite..." width="124" height="28" /></a><a title="Digimon Xros Wars: Battle In The Digital World" href="https://www.youtube.com/watch?v=xngD8cDZLRQ" target="_blank"><img src="https://x5x9og.bn1303.livefilestore.com/y3mQAOGzN350mT9JOODjaIzJQ4zcLmZ1l4T_5PeAeN-m4zSj4e2tODh563uxlJh8ZflX4HJOOCtXAi5Bchow8eSOIwPcYEWToRrlD-DKcJIB7HxFdKP6zOZceolZjxKSbzk8R9rfKaSqG7y2vn7MfWJ8AQHHipXVt_cEf0vULk-d98?width=124&amp;height=28&amp;cropmode=none" alt="Digimon Xros Wars: Battle In the Digital World" width="124" height="28" /></a></center>');
			this.add('raw', '<center><p><a title="Digimon Showdown Players Guide" href="https://1drv.ms/b/s!AvoD6RnUzzMvgmLcX1rqT8GTnEVK" target="_blank"><img src="https://yheeqg.bn1303.livefilestore.com/y4mcqvreFTM4wIjnVqqSI98LZXT-lFFCxPBYHyHGZtWJTIGuah-spBzqvXbLiWvyJgDnrjSRFziff59ZLLBEtm_t3ZHHeKv9AY6Ml-gQpdGMhNmzaeSt0TD8wmivpfEW81jh93LSBvdXb7-cZUH2YNJwzwiyOTsy4L2dViyJqkiOCFDZhJRIPwPEWgmD7MDJnfafmoq6SN6gEfsAXMiHh529w?width=124&amp;height=42&amp;cropmode=none" alt="" width="124" height="42" /></a></p></center>');
		},
	},
	{
		name: "[Gen 7] Type Illusion",
		mod: "gen7",
		ruleset: ['[Gen 7] OU'],
		banlist: ["Shedinja"],
		desc: [
			"&bullet; Coded by flufi. Completed by Mewth",
			"Type Illusion has finally left it's beta stage! Credit to Mewth for completing unfinished work.",
			"Nickname a Pokemon a single typing and the Pokemon will change to that typing in battle.",
			"To keep a Pokemon's default typing, don't give it a nickname.",
			"&bullet; <a href=\"http://exiledps.boards.net/board/20/type-illusions\">Type Illusion Thread</a>",
		],
		onSwitchIn: function (pokemon) {
			let name = toId(pokemon.name);
			if (name === 'fire' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire');
				pokemon.types = ["Fire"];
			}
			if (name === 'electric' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric');
				pokemon.types = ["Electric"];
			}
			if (name === 'bug' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug');
				pokemon.types = ["Bug"];
			}
			if (name === 'water' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water');
				pokemon.types = ["Water"];
			}
			if (name === 'grass' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass');
				pokemon.types = ["Grass"];
			}
			if (name === 'fighting' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fighting');
				pokemon.types = ["Fighting"];
			}
			if (name === 'psychic' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic');
				pokemon.types = ["Psychic"];
			}
			if (name === 'fairy' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fairy');
				pokemon.types = ["Fairy"];
			}
			if (name === 'ice' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ice');
				pokemon.types = ["Ice"];
			}
			if (name === 'dark' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dark');
				pokemon.types = ["Dark"];
			}
			if (name === 'ghost' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost');
				pokemon.types = ["Ghost"];
			}
			if (name === 'normal' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal');
				pokemon.types = ["Normal"];
			}
			if (name === 'flying' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying');
				pokemon.types = ["Flying"];
			}
			if (name === 'ground' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground');
				pokemon.types = ["Ground"];
			}
			if (name === 'rock' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock');
				pokemon.types = ["Rock"];
			}
			if (name === 'dragon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dragon');
				pokemon.types = ["Dragon"];
			}
			if (name === 'poison' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison');
				pokemon.types = ["Poison"];
			}
			if (name === 'steel' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Steel');
				pokemon.types = ["Steel"];
			}
			if (name === 'basicfire' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Fire');
				pokemon.types = ["Normal", "Fire"];
			}
			if (name === 'basicwater' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Water');
				pokemon.types = ["Normal", "Water"];
			}
			if (name === 'basicgrass' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Grass');
				pokemon.types = ["Normal", "Grass"];
			}
			if (name === 'basicghost' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Ghost');
				pokemon.types = ["Normal", "Ghost"];
			}
			if (name === 'dewdrop' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Bug');
				pokemon.types = ["Water", "Bug"];
			}
			if (name === 'basicelectric' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Electric');
				pokemon.types = ["Normal", "Electric"];
			}
			if (name === 'basicice' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Ice');
				pokemon.types = ["Normal", "Ice"];
			}
			if (name === 'basicfighting' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Fighting');
				pokemon.types = ["Normal", "Fighting"];
			}
			if (name === 'basicpoison' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Poison');
				pokemon.types = ["Normal", "Poison"];
			}
			if (name === 'basicground' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Ground');
				pokemon.types = ["Normal", "Ground"];
			}
			if (name === 'basicflying' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Flying');
				pokemon.types = ["Normal", "Flying"];
			}
			if (name === 'basicpsychic' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Psychic');
				pokemon.types = ["Normal", "psychic"];
			}
			if (name === 'basicbug' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Bug');
				pokemon.types = ["Normal", "Bug"];
			}
			if (name === 'basicrock' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Rock');
				pokemon.types = ["Normal", "Rock"];
			}
			if (name === 'basicdragon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Dragon');
				pokemon.types = ["Normal", "Dragon"];
			}
			if (name === 'basicdark' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Dark');
				pokemon.types = ["Normal", "Dark"];
			}
			if (name === 'basicsteel' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Steel');
				pokemon.types = ["Normal", "Steel"];
			}
			if (name === 'basicfairy' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Fairy');
				pokemon.types = ["Normal", "Fairy"];
			}
			if (name === 'liquor' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Water');
				pokemon.types = ["Fire", "Water"];
			}
			if (name === 'plasma' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Electric');
				pokemon.types = ["Fire", "Electric"];
			}
			if (name === 'forestfire' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Grass');
				pokemon.types = ["Fire", "Grass"];
			}
			if (name === 'dryice' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Ice');
				pokemon.types = ["Fire", "Ice"];
			}
			if (name === 'firefighter' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Fighting');
				pokemon.types = ["Fire", "Fighting"];
			}
			if (name === 'smoke' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Poison');
				pokemon.types = ["Fire", "Poison"];
			}
			if (name === 'lavaflow' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Ground');
				pokemon.types = ["Fire", "Ground"];
			}
			if (name === 'firetornado' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Flying');
				pokemon.types = ["Fire", "Flying"];
			}
			if (name === 'firebending' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Psychic');
				pokemon.types = ["Fire", "Psychic"];
			}
			if (name === 'firefly' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Bug');
				pokemon.types = ["Fire", "Bug"];
			}
			if (name === 'volcano' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Rock');
				pokemon.types = ["Fire", "Rock"];
			}
			if (name === 'candle' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Ghost');
				pokemon.types = ["Fire", "Ghost"];
			}
			if (name === 'zodiac' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Dragon');
				pokemon.types = ["Fire", "Dragon"];
			}
			if (name === 'nightfire' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Dark');
				pokemon.types = ["Fire", "Dark"];
			}
			if (name === 'firerod' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Steel');
				pokemon.types = ["Fire", "Steel"];
			}
			if (name === 'pixieflame' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Fairy');
				pokemon.types = ["Fire", "Fairy"];
			}
			if (name === 'hydroelectric' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Electric');
				pokemon.types = ["Water", "Electric"];
			}
			if (name === 'growth' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Grass');
				pokemon.types = ["Water", "Grass"];
			}
			if (name === 'frozenwater' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Ice');
				pokemon.types = ["Water", "Ice"];
			}
			if (name === 'watergun' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Fighting');
				pokemon.types = ["Water", "Fighting"];
			}
			if (name === 'contaminate' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Poison');
				pokemon.types = ["Water", "Poison"];
			}
			if (name === 'inlet' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Ground');
				pokemon.types = ["Water", "Ground"];
			}
			if (name === 'clouds' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Flying');
				pokemon.types = ["Water", "Flying"];
			}
			if (name === 'waterbending' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Psychic');
				pokemon.types = ["Water", "Psychic"];
			}
			if (name === 'beachcave' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Rock');
				pokemon.types = ["Water", "Rock"];
			}
			if (name === 'bermuda' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Ghost');
				pokemon.types = ["Water", "Ghost"];
			}
			if (name === 'reptile' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/dragon');
				pokemon.types = ["Water", "Dragon"];
			}
			if (name === 'tides' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Dark');
				pokemon.types = ["Water", "Dark"];
			}
			if (name === 'watertank' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Steel');
				pokemon.types = ["Water", "Steel"];
			}
			if (name === 'elucia' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Fairy');
				pokemon.types = ["Water", "Fairy"];
			}
			if (name === 'lawnmower' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Electric');
				pokemon.types = ["Grass", "Electric"];
			}
			if (name === 'fridge' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Ice');
				pokemon.types = ["Electric", "Ice"];
			}
			if (name === 'winter' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Ice');
				pokemon.types = ["Grass", "Ice"];
			}
			if (name === 'grassrazor' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Fighting');
				pokemon.types = ["Grass", "Fighting"];
			}
			if (name === 'toxicplants' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Poison');
				pokemon.types = ["Grass", "Poison"];
			}
			if (name === 'roots' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Ground');
				pokemon.types = ["Grass", "Ground"];
			}
			if (name === 'chloropidae' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Flying');
				pokemon.types = ["Grass", "Flying"];
			}
			if (name === 'icebreaker' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Psychic');
				pokemon.types = ["Grass", "Psychic"];
			}
			if (name === 'arthropoda' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Bug');
				pokemon.types = ["Grass", "Bug"];
			}
			if (name === 'weathering' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Rock');
				pokemon.types = ["Grass", "Rock"];
			}
			if (name === 'spiritgrass' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Ghost');
				pokemon.types = ["Grass", "Ghost"];
			}
			if (name === 'plantdragon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Dragon');
				pokemon.types = ["Grass", "Dragon"];
			}
			if (name === 'lunartwig' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Dark');
				pokemon.types = ["Grass", "Dark"];
			}
			if (name === 'grassblade' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Steel');
				pokemon.types = ["Grass", "Steel"];
			}
			if (name === 'fastfist' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Fighting');
				pokemon.types = ["Electric", "Fighting"];
			}
			if (name === 'batteries' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Poison');
				pokemon.types = ["Electric", "Poison"];
			}
			if (name === 'circuit' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Ground');
				pokemon.types = ["Electric", "Ground"];
			}
			if (name === 'planes' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Flying');
				pokemon.types = ["Electric", "Flying"];
			}
			if (name === 'lightbulb' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Psychic');
				pokemon.types = ["Electric", "Psychic"];
			}
			if (name === 'glowworm' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Bug');
				pokemon.types = ["Electric", "Bug"];
			}
			if (name === 'fulgurite' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Rock');
				pokemon.types = ["Electric", "Rock"];
			}
			if (name === 'vampire' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Ghost');
				pokemon.types = ["Electric", "Ghost"];
			}
			if (name === 'fabio' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Dragon');
				pokemon.types = ["Electric", "Dragon"];
			}
			if (name === 'blacklightning' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Dark');
				pokemon.types = ["Electric", "Dark"];
			}
			if (name === 'magnet' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Steel');
				pokemon.types = ["Electric", "Steel"];
			}
			if (name === 'sparx' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Fairy');
				pokemon.types = ["Electric", "Fairy"];
			}
			if (name === 'vampillia' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fighting/Ice');
				pokemon.types = ["Fighting", "Ice"];
			}
			if (name === 'icecream' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Ice');
				pokemon.types = ["Poison", "Ice"];
			}
			if (name === 'permafrost' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Ice');
				pokemon.types = ["Ground", "Ice"];
			}
			if (name === 'hail' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Ice');
				pokemon.types = ["Flying", "Ice"];
			}
			if (name === 'cryokinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Ice');
				pokemon.types = ["Psychic", "Ice"];
			}
			if (name === 'gryllobattidae' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Ice');
				pokemon.types = ["Bug", "Ice"];
			}
			if (name === 'pluto' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Ice');
				pokemon.types = ["Rock", "Ice"];
			}
			if (name === 'yukionna' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost/Ice');
				pokemon.types = ["Ghost", "Ice"];
			}
			if (name === 'wuji' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dragon/Ice');
				pokemon.types = ["Dragon", "Ice"];
			}
			if (name === 'iceblade' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Steel/Ice');
				pokemon.types = ["Steel", "Ice"];
			}
			if (name === 'lovix' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fairy/Ice');
				pokemon.types = ["Fairy", "Ice"];
			}
			if (name === 'sick' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Fighting');
				pokemon.types = ["Poison", "Fighting"];
			}
			if (name === 'war' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Fighting');
				pokemon.types = ["Ground", "Fighting"];
			}
			if (name === 'aztec' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Fighting');
				pokemon.types = ["Flying", "Fighting"];
			}
			if (name === 'rhinobeetle' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Fighting');
				pokemon.types = ["Bug", "Fighting"];
			}
			if (name === 'manipulation' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Fighting');
				pokemon.types = ["Psychic", "Fighting"];
			}
			if (name === 'porthos' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Fighting');
				pokemon.types = ["Rock", "Fighting"];
			}
			if (name === 'demon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost/Fighting');
				pokemon.types = ["Ghost", "Fighting"];
			}
			if (name === 'cryptid' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dragon/Fighting');
				pokemon.types = ["Dragon", "Fighting"];
			}
			if (name === 'hoodlum' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dark/Fighting');
				pokemon.types = ["Dark", "Fighting"];
			}
			if (name === 'anubis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Steel/Fighting');
				pokemon.types = ["Steel", "Fighting"];
			}
			if (name === 'roughhouse' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fairy/Fighting');
				pokemon.types = ["Fairy", "Fighting"];
			}
			if (name === 'toxicwaste' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Ground');
				pokemon.types = ["Poison", "Ground"];
			}
			if (name === 'bugspray' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Flying');
				pokemon.types = ["Poison", "Flying"];
			}
			if (name === 'esoteric' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Psychic');
				pokemon.types = ["Poison", "Psychic"];
			}
			if (name === 'stinkbug' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Bug');
				pokemon.types = ["Poison", "Bug"];
			}
			if (name === 'cinnabar' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Rock');
				pokemon.types = ["Poison", "Rock"];
			}
			if (name === 'witch' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Ghost');
				pokemon.types = ["Poison", "Ghost"];
			}
			if (name === 'tsardragon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Dragon');
				pokemon.types = ["Poison", "Dragon"];
			}
			if (name === 'skunk' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Dark');
				pokemon.types = ["Poison", "Dark"];
			}
			if (name === 'lead' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Steel');
				pokemon.types = ["Poison", "Steel"];
			}
			if (name === 'toxicpixie' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Fairy');
				pokemon.types = ["Poison", "Fairy"];
			}
			if (name === 'sandstorm' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Flying');
				pokemon.types = ["Ground", "Flying"];
			}
			if (name === 'terrakinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Psychic');
				pokemon.types = ["Ground", "Psychic"];
			}
			if (name === 'cicada' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Bug');
				pokemon.types = ["Ground", "Bug"];
			}
			if (name === 'geoterra' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Rock');
				pokemon.types = ["Ground", "Rock"];
			}
			if (name === 'Sandghostle' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Ghost');
				pokemon.types = ["Ground", "Ghost"];
			}
			if (name === 'terradragon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Dragon');
				pokemon.types = ["Ground", "Dragon"];
			}
			if (name === 'krokadile' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Dark');
				pokemon.types = ["Ground", "Dark"];
			}
			if (name === 'terrasteel' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Steel');
				pokemon.types = ["Ground", "Steel"];
			}
			if (name === 'terrapixie' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Fairy');
				pokemon.types = ["Ground", "Fairy"];
			}
			if (name === 'aerokinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Psychic');
				pokemon.types = ["Flying", "Psychic"];
			}
			if (name === 'butterfly' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Bug');
				pokemon.types = ["Flying", "Bug"];
			}
			if (name === 'pterodactyl' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Rock');
				pokemon.types = ["Flying", "Rock"];
			}
			if (name === 'spirit' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Ghost');
				pokemon.types = ["Flying", "Ghost"];
			}
			if (name === 'draco' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Dragon');
				pokemon.types = ["Flying", "Dragon"];
			}
			if (name === 'dogekiss' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Fairy');
				pokemon.types = ["Flying", "Fairy"];
			}
			if (name === 'entomopathy' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Bug');
				pokemon.types = ["Psychic", "Bug"];
			}
			if (name === 'geokinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Rock');
				pokemon.types = ["Psychic", "Rock"];
			}
			if (name === 'ouijaboard' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Ghost');
				pokemon.types = ["Psychic", "Ghost"];
			}
			if (name === 'dracokinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Dragon');
				pokemon.types = ["Psychic", "Dragon"];
			}
			if (name === 'umbrekinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Dark');
				pokemon.types = ["Psychic", "Dark"];
			}
			if (name === 'ferrukinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Steel');
				pokemon.types = ["Psychic", "Steel"];
			}
			if (name === 'pixkinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Fairy');
				pokemon.types = ["Psychic", "Fairy"];
			}
			if (name === 'anomalocaris' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Rock');
				pokemon.types = ["Bug", "Rock"];
			}
			if (name === 'discarded' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Ghost');
				pokemon.types = ["Bug", "Ghost"];
			}
			if (name === 'antlion' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Dragon');
				pokemon.types = ["Bug", "Dragon"];
			}
			if (name === 'bullet' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Steel');
				pokemon.types = ["Bug", "Steel"];
			}
			if (name === 'lasius' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Dark');
				pokemon.types = ["Bug", "Dark"];
			}
			if (name === 'sweetant' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Fairy');
				pokemon.types = ["Bug", "Fairy"];
			}
			if (name === 'geospirit' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Ghost');
				pokemon.types = ["Rock", "Ghost"];
			}
			if (name === 'trex' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Dragon');
				pokemon.types = ["Rock", "Dragon"];
			}
			if (name === 'tlizard' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Dark');
				pokemon.types = ["Rock", "Dark"];
			}
			if (name === 'shield' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Steel');
				pokemon.types = ["Rock", "Steel"];
			}
			if (name === 'pixelrock' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Fairy');
				pokemon.types = ["Rock", "Fairy"];
			}
			if (name === 'draconic' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost/Dragon');
				pokemon.types = ["Ghost", "Dragon"];
			}
			if (name === 'souls' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost/Dark');
				pokemon.types = ["Ghost", "Dark"];
			}
			if (name === 'mask' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost/Steel');
				pokemon.types = ["Ghost", "Steel"];
			}
			if (name === 'fairydust' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost/Fairy');
				pokemon.types = ["Ghost", "Fairy"];
			}
			if (name === 'yamata' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dragon/Dark');
				pokemon.types = ["Dragon", "Dark"];
			}
			if (name === 'temporal' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dragon/Steel');
				pokemon.types = ["Dragon", "Steel"];
			}
			if (name === 'nicedragon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dragon/Fairy');
				pokemon.types = ["Dragon", "Fairy"];
			}
			if (name === 'taintedmetal' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dark/Steel');
				pokemon.types = ["Dragon", "Steel"];
			}
			if (name === 'taintedfairy' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dark/Fairy');
				pokemon.types = ["Dark", "Fairy"];
			}
			if (name === 'pixieshield' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Steel/Fairy');
				pokemon.types = ["Steel", "Fairy"];
			}
		},
		onAfterMega: function (pokemon) {
			let name = toId(pokemon.name);
			if (name === 'fire' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire');
				pokemon.types = ["Fire"];
			}
			if (name === 'electric' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric');
				pokemon.types = ["Electric"];
			}
			if (name === 'bug' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug');
				pokemon.types = ["Bug"];
			}
			if (name === 'water' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water');
				pokemon.types = ["Water"];
			}
			if (name === 'grass' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass');
				pokemon.types = ["Grass"];
			}
			if (name === 'fighting' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fighting');
				pokemon.types = ["Fighting"];
			}
			if (name === 'psychic' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic');
				pokemon.types = ["Psychic"];
			}
			if (name === 'fairy' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fairy');
				pokemon.types = ["Fairy"];
			}
			if (name === 'ice' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ice');
				pokemon.types = ["Ice"];
			}
			if (name === 'dark' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dark');
				pokemon.types = ["Dark"];
			}
			if (name === 'ghost' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost');
				pokemon.types = ["Ghost"];
			}
			if (name === 'normal' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal');
				pokemon.types = ["Normal"];
			}
			if (name === 'flying' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying');
				pokemon.types = ["Flying"];
			}
			if (name === 'ground' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground');
				pokemon.types = ["Ground"];
			}
			if (name === 'rock' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock');
				pokemon.types = ["Rock"];
			}
			if (name === 'dragon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dragon');
				pokemon.types = ["Dragon"];
			}
			if (name === 'poison' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison');
				pokemon.types = ["Poison"];
			}
			if (name === 'steel' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Steel');
				pokemon.types = ["Steel"];
			}
			if (name === 'basicfire' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Fire');
				pokemon.types = ["Normal", "Fire"];
			}
			if (name === 'basicwater' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Water');
				pokemon.types = ["Normal", "Water"];
			}
			if (name === 'basicgrass' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Grass');
				pokemon.types = ["Normal", "Grass"];
			}
			if (name === 'basicghost' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Ghost');
				pokemon.types = ["Normal", "Ghost"];
			}
			if (name === 'dewdrop' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Bug');
				pokemon.types = ["Water", "Bug"];
			}
			if (name === 'basicelectric' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Electric');
				pokemon.types = ["Normal", "Electric"];
			}
			if (name === 'basicice' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Ice');
				pokemon.types = ["Normal", "Ice"];
			}
			if (name === 'basicfighting' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Fighting');
				pokemon.types = ["Normal", "Fighting"];
			}
			if (name === 'basicpoison' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Poison');
				pokemon.types = ["Normal", "Poison"];
			}
			if (name === 'basicground' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Ground');
				pokemon.types = ["Normal", "Ground"];
			}
			if (name === 'basicflying' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Flying');
				pokemon.types = ["Normal", "Flying"];
			}
			if (name === 'basicpsychic' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Psychic');
				pokemon.types = ["Normal", "psychic"];
			}
			if (name === 'basicbug' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Bug');
				pokemon.types = ["Normal", "Bug"];
			}
			if (name === 'basicrock' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Rock');
				pokemon.types = ["Normal", "Rock"];
			}
			if (name === 'basicdragon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Dragon');
				pokemon.types = ["Normal", "Dragon"];
			}
			if (name === 'basicdark' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Dark');
				pokemon.types = ["Normal", "Dark"];
			}
			if (name === 'basicsteel' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Steel');
				pokemon.types = ["Normal", "Steel"];
			}
			if (name === 'basicfairy' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Normal/Fairy');
				pokemon.types = ["Normal", "Fairy"];
			}
			if (name === 'liquor' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Water');
				pokemon.types = ["Fire", "Water"];
			}
			if (name === 'plasma' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Electric');
				pokemon.types = ["Fire", "Electric"];
			}
			if (name === 'forestfire' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Grass');
				pokemon.types = ["Fire", "Grass"];
			}
			if (name === 'dryice' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Ice');
				pokemon.types = ["Fire", "Ice"];
			}
			if (name === 'firefighter' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Fighting');
				pokemon.types = ["Fire", "Fighting"];
			}
			if (name === 'smoke' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Poison');
				pokemon.types = ["Fire", "Poison"];
			}
			if (name === 'lavaflow' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Ground');
				pokemon.types = ["Fire", "Ground"];
			}
			if (name === 'firetornado' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Flying');
				pokemon.types = ["Fire", "Flying"];
			}
			if (name === 'firebending' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Psychic');
				pokemon.types = ["Fire", "Psychic"];
			}
			if (name === 'firefly' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Bug');
				pokemon.types = ["Fire", "Bug"];
			}
			if (name === 'volcano' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Rock');
				pokemon.types = ["Fire", "Rock"];
			}
			if (name === 'candle' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Ghost');
				pokemon.types = ["Fire", "Ghost"];
			}
			if (name === 'zodiac' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Dragon');
				pokemon.types = ["Fire", "Dragon"];
			}
			if (name === 'nightfire' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Dark');
				pokemon.types = ["Fire", "Dark"];
			}
			if (name === 'firerod' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Steel');
				pokemon.types = ["Fire", "Steel"];
			}
			if (name === 'pixieflame' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fire/Fairy');
				pokemon.types = ["Fire", "Fairy"];
			}
			if (name === 'hydroelectric' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Electric');
				pokemon.types = ["Water", "Electric"];
			}
			if (name === 'growth' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Grass');
				pokemon.types = ["Water", "Grass"];
			}
			if (name === 'frozenwater' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Ice');
				pokemon.types = ["Water", "Ice"];
			}
			if (name === 'watergun' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Fighting');
				pokemon.types = ["Water", "Fighting"];
			}
			if (name === 'contaminate' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Poison');
				pokemon.types = ["Water", "Poison"];
			}
			if (name === 'inlet' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Ground');
				pokemon.types = ["Water", "Ground"];
			}
			if (name === 'clouds' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Flying');
				pokemon.types = ["Water", "Flying"];
			}
			if (name === 'waterbending' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Psychic');
				pokemon.types = ["Water", "Psychic"];
			}
			if (name === 'beachcave' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Rock');
				pokemon.types = ["Water", "Rock"];
			}
			if (name === 'bermuda' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Ghost');
				pokemon.types = ["Water", "Ghost"];
			}
			if (name === 'reptile' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/dragon');
				pokemon.types = ["Water", "Dragon"];
			}
			if (name === 'tides' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Dark');
				pokemon.types = ["Water", "Dark"];
			}
			if (name === 'watertank' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Steel');
				pokemon.types = ["Water", "Steel"];
			}
			if (name === 'elucia' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Water/Fairy');
				pokemon.types = ["Water", "Fairy"];
			}
			if (name === 'lawnmower' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Electric');
				pokemon.types = ["Grass", "Electric"];
			}
			if (name === 'fridge' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Ice');
				pokemon.types = ["Electric", "Ice"];
			}
			if (name === 'winter' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Ice');
				pokemon.types = ["Grass", "Ice"];
			}
			if (name === 'grassrazor' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Fighting');
				pokemon.types = ["Grass", "Fighting"];
			}
			if (name === 'toxicplants' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Poison');
				pokemon.types = ["Grass", "Poison"];
			}
			if (name === 'roots' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Ground');
				pokemon.types = ["Grass", "Ground"];
			}
			if (name === 'chloropidae' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Flying');
				pokemon.types = ["Grass", "Flying"];
			}
			if (name === 'icebreaker' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Psychic');
				pokemon.types = ["Grass", "Psychic"];
			}
			if (name === 'arthropoda' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Bug');
				pokemon.types = ["Grass", "Bug"];
			}
			if (name === 'weathering' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Rock');
				pokemon.types = ["Grass", "Rock"];
			}
			if (name === 'spiritgrass' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Ghost');
				pokemon.types = ["Grass", "Ghost"];
			}
			if (name === 'plantdragon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Dragon');
				pokemon.types = ["Grass", "Dragon"];
			}
			if (name === 'lunartwig' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Dark');
				pokemon.types = ["Grass", "Dark"];
			}
			if (name === 'grassblade' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Grass/Steel');
				pokemon.types = ["Grass", "Steel"];
			}
			if (name === 'fastfist' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Fighting');
				pokemon.types = ["Electric", "Fighting"];
			}
			if (name === 'batteries' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Poison');
				pokemon.types = ["Electric", "Poison"];
			}
			if (name === 'circuit' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Ground');
				pokemon.types = ["Electric", "Ground"];
			}
			if (name === 'planes' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Flying');
				pokemon.types = ["Electric", "Flying"];
			}
			if (name === 'lightbulb' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Psychic');
				pokemon.types = ["Electric", "Psychic"];
			}
			if (name === 'glowworm' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Bug');
				pokemon.types = ["Electric", "Bug"];
			}
			if (name === 'fulgurite' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Rock');
				pokemon.types = ["Electric", "Rock"];
			}
			if (name === 'vampire' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Ghost');
				pokemon.types = ["Electric", "Ghost"];
			}
			if (name === 'fabio' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Dragon');
				pokemon.types = ["Electric", "Dragon"];
			}
			if (name === 'blacklightning' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Dark');
				pokemon.types = ["Electric", "Dark"];
			}
			if (name === 'magnet' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Steel');
				pokemon.types = ["Electric", "Steel"];
			}
			if (name === 'sparx' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Electric/Fairy');
				pokemon.types = ["Electric", "Fairy"];
			}
			if (name === 'vampillia' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fighting/Ice');
				pokemon.types = ["Fighting", "Ice"];
			}
			if (name === 'icecream' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Ice');
				pokemon.types = ["Poison", "Ice"];
			}
			if (name === 'permafrost' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Ice');
				pokemon.types = ["Ground", "Ice"];
			}
			if (name === 'hail' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Ice');
				pokemon.types = ["Flying", "Ice"];
			}
			if (name === 'cryokinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Ice');
				pokemon.types = ["Psychic", "Ice"];
			}
			if (name === 'gryllobattidae' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Ice');
				pokemon.types = ["Bug", "Ice"];
			}
			if (name === 'pluto' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Ice');
				pokemon.types = ["Rock", "Ice"];
			}
			if (name === 'yukionna' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost/Ice');
				pokemon.types = ["Ghost", "Ice"];
			}
			if (name === 'wuji' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dragon/Ice');
				pokemon.types = ["Dragon", "Ice"];
			}
			if (name === 'iceblade' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Steel/Ice');
				pokemon.types = ["Steel", "Ice"];
			}
			if (name === 'lovix' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fairy/Ice');
				pokemon.types = ["Fairy", "Ice"];
			}
			if (name === 'sick' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Fighting');
				pokemon.types = ["Poison", "Fighting"];
			}
			if (name === 'war' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Fighting');
				pokemon.types = ["Ground", "Fighting"];
			}
			if (name === 'aztec' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Fighting');
				pokemon.types = ["Flying", "Fighting"];
			}
			if (name === 'rhinobeetle' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Fighting');
				pokemon.types = ["Bug", "Fighting"];
			}
			if (name === 'manipulation' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Fighting');
				pokemon.types = ["Psychic", "Fighting"];
			}
			if (name === 'porthos' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Fighting');
				pokemon.types = ["Rock", "Fighting"];
			}
			if (name === 'demon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost/Fighting');
				pokemon.types = ["Ghost", "Fighting"];
			}
			if (name === 'cryptid' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dragon/Fighting');
				pokemon.types = ["Dragon", "Fighting"];
			}
			if (name === 'hoodlum' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dark/Fighting');
				pokemon.types = ["Dark", "Fighting"];
			}
			if (name === 'anubis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Steel/Fighting');
				pokemon.types = ["Steel", "Fighting"];
			}
			if (name === 'roughhouse' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Fairy/Fighting');
				pokemon.types = ["Fairy", "Fighting"];
			}
			if (name === 'toxicwaste' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Ground');
				pokemon.types = ["Poison", "Ground"];
			}
			if (name === 'bugspray' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Flying');
				pokemon.types = ["Poison", "Flying"];
			}
			if (name === 'esoteric' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Psychic');
				pokemon.types = ["Poison", "Psychic"];
			}
			if (name === 'stinkbug' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Bug');
				pokemon.types = ["Poison", "Bug"];
			}
			if (name === 'cinnabar' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Rock');
				pokemon.types = ["Poison", "Rock"];
			}
			if (name === 'witch' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Ghost');
				pokemon.types = ["Poison", "Ghost"];
			}
			if (name === 'tsardragon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Dragon');
				pokemon.types = ["Poison", "Dragon"];
			}
			if (name === 'skunk' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Dark');
				pokemon.types = ["Poison", "Dark"];
			}
			if (name === 'lead' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Steel');
				pokemon.types = ["Poison", "Steel"];
			}
			if (name === 'toxicpixie' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Poison/Fairy');
				pokemon.types = ["Poison", "Fairy"];
			}
			if (name === 'sandstorm' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Flying');
				pokemon.types = ["Ground", "Flying"];
			}
			if (name === 'terrakinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Psychic');
				pokemon.types = ["Ground", "Psychic"];
			}
			if (name === 'cicada' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Bug');
				pokemon.types = ["Ground", "Bug"];
			}
			if (name === 'geoterra' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Rock');
				pokemon.types = ["Ground", "Rock"];
			}
			if (name === 'Sandghostle' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Ghost');
				pokemon.types = ["Ground", "Ghost"];
			}
			if (name === 'terradragon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Dragon');
				pokemon.types = ["Ground", "Dragon"];
			}
			if (name === 'krokadile' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Dark');
				pokemon.types = ["Ground", "Dark"];
			}
			if (name === 'terrasteel' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Steel');
				pokemon.types = ["Ground", "Steel"];
			}
			if (name === 'terrapixie' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ground/Fairy');
				pokemon.types = ["Ground", "Fairy"];
			}
			if (name === 'aerokinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Psychic');
				pokemon.types = ["Flying", "Psychic"];
			}
			if (name === 'butterfly' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Bug');
				pokemon.types = ["Flying", "Bug"];
			}
			if (name === 'pterodactyl' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Rock');
				pokemon.types = ["Flying", "Rock"];
			}
			if (name === 'spirit' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Ghost');
				pokemon.types = ["Flying", "Ghost"];
			}
			if (name === 'draco' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Dragon');
				pokemon.types = ["Flying", "Dragon"];
			}
			if (name === 'dogekiss' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Flying/Fairy');
				pokemon.types = ["Flying", "Fairy"];
			}
			if (name === 'entomopathy' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Bug');
				pokemon.types = ["Psychic", "Bug"];
			}
			if (name === 'geokinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Rock');
				pokemon.types = ["Psychic", "Rock"];
			}
			if (name === 'ouijaboard' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Ghost');
				pokemon.types = ["Psychic", "Ghost"];
			}
			if (name === 'dracokinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Dragon');
				pokemon.types = ["Psychic", "Dragon"];
			}
			if (name === 'umbrekinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Dark');
				pokemon.types = ["Psychic", "Dark"];
			}
			if (name === 'ferrukinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Steel');
				pokemon.types = ["Psychic", "Steel"];
			}
			if (name === 'pixkinesis' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Psychic/Fairy');
				pokemon.types = ["Psychic", "Fairy"];
			}
			if (name === 'anomalocaris' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Rock');
				pokemon.types = ["Bug", "Rock"];
			}
			if (name === 'discarded' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Ghost');
				pokemon.types = ["Bug", "Ghost"];
			}
			if (name === 'antlion' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Dragon');
				pokemon.types = ["Bug", "Dragon"];
			}
			if (name === 'bullet' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Steel');
				pokemon.types = ["Bug", "Steel"];
			}
			if (name === 'lasius' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Dark');
				pokemon.types = ["Bug", "Dark"];
			}
			if (name === 'sweetant' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Bug/Fairy');
				pokemon.types = ["Bug", "Fairy"];
			}
			if (name === 'geospirit' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Ghost');
				pokemon.types = ["Rock", "Ghost"];
			}
			if (name === 'trex' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Dragon');
				pokemon.types = ["Rock", "Dragon"];
			}
			if (name === 'tlizard' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Dark');
				pokemon.types = ["Rock", "Dark"];
			}
			if (name === 'shield' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Steel');
				pokemon.types = ["Rock", "Steel"];
			}
			if (name === 'pixelrock' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Rock/Fairy');
				pokemon.types = ["Rock", "Fairy"];
			}
			if (name === 'draconic' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost/Dragon');
				pokemon.types = ["Ghost", "Dragon"];
			}
			if (name === 'souls' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost/Dark');
				pokemon.types = ["Ghost", "Dark"];
			}
			if (name === 'mask' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost/Steel');
				pokemon.types = ["Ghost", "Steel"];
			}
			if (name === 'fairydust' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Ghost/Fairy');
				pokemon.types = ["Ghost", "Fairy"];
			}
			if (name === 'yamata' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dragon/Dark');
				pokemon.types = ["Dragon", "Dark"];
			}
			if (name === 'temporal' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dragon/Steel');
				pokemon.types = ["Dragon", "Steel"];
			}
			if (name === 'nicedragon' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dragon/Fairy');
				pokemon.types = ["Dragon", "Fairy"];
			}
			if (name === 'taintedmetal' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dark/Steel');
				pokemon.types = ["Dragon", "Steel"];
			}
			if (name === 'taintedfairy' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Dark/Fairy');
				pokemon.types = ["Dark", "Fairy"];
			}
			if (name === 'pixieshield' && !pokemon.illusion) {
				this.add('-start', pokemon, 'typechange', 'Steel/Fairy');
				pokemon.types = ["Steel", "Fairy"];
			}
		},
	},
	{
		name: "[Gen 7] Doubles Monotype",
		desc: [
			"All the Pok&eacute;mon on a team must share a type. The battle is fought in the Doubles Format. Banlist is the same as Doubles OU. Requested by Ashley the Pikachu. \"Coded\" by Gligars.",
		],

		mod: 'gen7',
		gameType: 'doubles',
		ruleset: ['[Gen 7] Doubles OU', 'Same Type Clause'],
	},
	{
		name: "[Gen 7] Stacked",
		desc: [
			"All hazards can be stackable and stacked infinitely. Original idea by Serperirorater. Coded by Lycanium Z.",
		],

		mod: 'stacked',
		ruleset: ['[Gen 7] OU'],
	},
	{
		name: "[Gen 7] TsuMeta (BETA)",
		desc: [
			"&bullet; <a href=\"http://tsunamips.weebly.com/tsumeta.html\">TsuMeta Information</a>",
		],
		column: 2,

		mod: 'tsumeta',
		ruleset: ['[Gen 7] OU'],
		onSwitchIn: function (pokemon) {
			this.add('-start', pokemon, 'typechange', pokemon.types[0] + (pokemon.types[1] ? '/' + pokemon.types[1] : ''));
		},
	},

	// SGgame Formats
	////////////////////////////////////////////////////////////////////

	{
		section: "SG Game Formats",
		column: 2,
	},
	{
		name: "[Gen 7] Wild Pokemon (Alpha)",
		desc: ["Wild Pok&eacute;mon battles for the SG Game project. (WIP)"],
		rated: false,
		useSGgame: true,
		isWildEncounter: true,
		allowBag: true,
		takeItems: true,
		challengeShow: false,

		mod: 'sggame',
		ruleset: ['HP Percentage Mod', 'Cancel Mod'],
		banlist: ['CAP'],
	},
	{
		name: "[Gen 7] Trainer Battle (Alpha)",
		desc: ["Battles VS SG Server (our COM) using your team from the SG Game project. (WIP)"],
		rated: false,
		useSGgame: true,
		isTrainerBattle: true,
		allowBag: true,
		takeItems: true,
		challengeShow: false,

		mod: 'sggame',
		ruleset: ['Endless Battle Clause', 'HP Percentage Mod', 'Cancel Mod'],
		banlist: ['CAP'],
	},
	{
		name: "[Gen 7] [SGgame] Anything Goes",
		desc: ["Anything Goes rules with the teams you build in SGgame."],
		rated: false,
		useSGgame: true,
		noExp: true,

		mod: 'sggame',
		ruleset: ['Endless Battle Clause', 'Team Preview', 'HP Percentage Mod', 'Cancel Mod'],
		banlist: ['CAP'],
	},
	{
		name: "[Gen 7] [SGgame] Lvl 50 Anything Goes",
		desc: ["Anything Goe rules with the teams you build in SGgame.",
			"All pokemon are set to level 50 for the duration of the match."],
		forcedLevel: 50,
		maxForcedLevel: 50,
		useSGgame: true,
		noExp: true,
		mod: 'sggame',
		ruleset: ['Endless Battle Clause', 'Team Preview', 'HP Percentage Mod', 'Cancel Mod'],
		banlist: ['CAP'],
	},

	// Other Metagames
	///////////////////////////////////////////////////////////////////
	{
		section: "OM of the Month",
		column: 3,
	},
	{
		name: "[Gen 7] Ultimate Z",
		desc: [
			"Use any type of Z-Crystal on any move and as many times per battle as desired.",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3609393/\">Ultimate Z</a>",
		],

		mod: 'ultimatez',
		ruleset: ['[Gen 7] OU'],
		banlist: ['Kyurem-Black', 'Celebrate', 'Conversion', 'Happy Hour', 'Hold Hands'],
	},
	{
		name: "[Gen 6] Balanced Hackmons",
		desc: ["&bullet; <a href=\"http://www.smogon.com/dex/xy/formats/bh/\">ORAS Balanced Hackmons</a>"],

		mod: 'gen6',
		searchShow: false,
		ruleset: ['Pokemon', 'Ability Clause', 'OHKO Clause', 'Evasion Moves Clause', 'Endless Battle Clause', 'Team Preview', 'HP Percentage Mod', 'Cancel Mod'],
		banlist: ['Groudon-Primal', 'Kyogre-Primal', 'Aerilate + Pixilate + Refrigerate > 1',
			'Arena Trap', 'Huge Power', 'Moody', 'Parental Bond', 'Protean', 'Pure Power', 'Shadow Tag', 'Wonder Guard', 'Assist', 'Chatter',
		],
	},
	{
		section: "Other Metagames",
		column: 3,
	},
	{
		name: "[Gen 7] Balanced Hackmons",
		desc: [
			"Anything that can be hacked in-game and is usable in local battles is allowed.",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3587475/\">Balanced Hackmons</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3588586/\">BH Suspects and Bans Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3593766/\">BH Resources</a>",
			"&bullet; <a href=\"http://www.smogon.com/tiers/om/analyses/bh/\">BH Analyses</a>",
		],

		mod: 'gen7',
		ruleset: ['Pokemon', 'Ability Clause', 'OHKO Clause', 'Evasion Moves Clause', 'CFZ Clause', 'Endless Battle Clause', 'Team Preview', 'HP Percentage Mod', 'Cancel Mod'],
		banlist: ['Groudon-Primal', 'Arena Trap', 'Huge Power', 'Innards Out', 'Magnet Pull', 'Moody', 'Parental Bond', 'Protean', 'Pure Power', 'Shadow Tag', 'Stakeout', 'Water Bubble', 'Wonder Guard', 'Gengarite', 'Chatter', 'Comatose + Sleep Talk'],
	},
	{
		name: "[Gen 7] 1v1",
		desc: [
			"Bring three Pok&eacute;mon to Team Preview and choose one to battle.",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3587523/\">1v1</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3592842/\">1v1 Resources</a>",
			"&bullet; <a href=\"http://www.smogon.com/tiers/om/analyses/1v1/\">1v1 Analyses</a>",
		],

		mod: 'gen7',
		teamLength: {
			validate: [1, 3],
			battle: 1,
		},
		ruleset: ['Pokemon', 'Species Clause', 'Nickname Clause', 'Moody Clause', 'OHKO Clause', 'Evasion Moves Clause', 'Swagger Clause', 'Endless Battle Clause', 'HP Percentage Mod', 'Cancel Mod', 'Team Preview'],
		banlist: [
			'Illegal', 'Unreleased', 'Arceus', 'Darkrai', 'Deoxys-Base', 'Deoxys-Attack', 'Deoxys-Defense', 'Dialga', 'Giratina', 'Groudon', 'Ho-Oh', 'Kyogre',
			'Kyurem-White', 'Lugia', 'Lunala', 'Marshadow', 'Mewtwo', 'Palkia', 'Rayquaza', 'Reshiram', 'Shaymin-Sky', 'Solgaleo', 'Xerneas', 'Yveltal', 'Zekrom',
			'Power Construct', 'Perish Song', 'Focus Sash', 'Kangaskhanite', 'Salamencite', 'Chansey + Charm + Seismic Toss', 'Chansey + Charm + Psywave',
			'Flash', 'Kinesis', 'Leaf Tornado', 'Mirror Shot', 'Mud Bomb', 'Mud-Slap', 'Muddy Water', 'Night Daze', 'Octazooka', 'Sand Attack', 'Smokescreen',
		],
	},
	{
		name: "[Gen 7] Mix and Mega",
		desc: [
			"Mega Stones and Primal Orbs can be used on almost any fully evolved Pok&eacute;mon with no Mega Evolution limit.",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3587740/\">Mix and Mega</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3591580/\">Mix and Mega Resources</a>",
			"&bullet; <a href=\"http://www.smogon.com/tiers/om/analyses/mix_and_mega/\">Mix and Mega Analyses</a>",
		],

		mod: 'mixandmega',
		ruleset: ['Pokemon', 'Standard', 'Mega Rayquaza Clause', 'Team Preview'],
		banlist: ['Baton Pass', 'Electrify'],
		onValidateTeam: function (team) {
			let itemTable = {};
			for (let i = 0; i < team.length; i++) {
				let item = this.getItem(team[i].item);
				if (!item) continue;
				if (itemTable[item] && item.megaStone) return ["You are limited to one of each Mega Stone.", "(You have more than one " + this.getItem(item).name + ")"];
				if (itemTable[item] && (item.id === 'blueorb' || item.id === 'redorb')) return ["You are limited to one of each Primal Orb.", "(You have more than one " + this.getItem(item).name + ")"];
				itemTable[item] = true;
			}
		},
		onValidateSet: function (set) {
			let template = this.getTemplate(set.species || set.name);
			let item = this.getItem(set.item);
			if (!item.megaEvolves && item.id !== 'blueorb' && item.id !== 'redorb') return;
			if (template.baseSpecies === item.megaEvolves || (template.baseSpecies === 'Groudon' && item.id === 'redorb') || (template.baseSpecies === 'Kyogre' && item.id === 'blueorb')) return;
			if (template.evos.length) return ["" + template.species + " is not allowed to hold " + item.name + " because it's not fully evolved."];
			let uberStones = ['beedrillite', 'blazikenite', 'gengarite', 'kangaskhanite', 'mawilite', 'medichamite'];
			if (template.tier === 'Uber' || set.ability === 'Power Construct' || uberStones.includes(item.id)) return ["" + template.species + " is not allowed to hold " + item.name + "."];
		},
		onBegin: function () {
			let allPokemon = this.p1.pokemon.concat(this.p2.pokemon);
			for (let i = 0, len = allPokemon.length; i < len; i++) {
				let pokemon = allPokemon[i];
				pokemon.originalSpecies = pokemon.baseTemplate.species;
			}
		},
		onSwitchIn: function (pokemon) {
			let oMegaTemplate = this.getTemplate(pokemon.template.originalMega);
			if (oMegaTemplate.exists && pokemon.originalSpecies !== oMegaTemplate.baseSpecies) {
				// Place volatiles on the Pokémon to show its mega-evolved condition and details
				this.add('-start', pokemon, oMegaTemplate.requiredItem || oMegaTemplate.requiredMove, '[silent]');
				let oTemplate = this.getTemplate(pokemon.originalSpecies);
				if (oTemplate.types.length !== pokemon.template.types.length || oTemplate.types[1] !== pokemon.template.types[1]) {
					this.add('-start', pokemon, 'typechange', pokemon.template.types.join('/'), '[silent]');
				}
			}
		},
		onSwitchOut: function (pokemon) {
			let oMegaTemplate = this.getTemplate(pokemon.template.originalMega);
			if (oMegaTemplate.exists && pokemon.originalSpecies !== oMegaTemplate.baseSpecies) {
				this.add('-end', pokemon, oMegaTemplate.requiredItem || oMegaTemplate.requiredMove, '[silent]');
			}
		},
	},
	{
		name: "[Gen 7] Almost Any Ability",
		desc: [
			"Pok&eacute;mon can use any ability, barring the few that are banned.",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3587901/\">Almost Any Ability</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3595753/\">AAA Resources</a>",
			"&bullet; <a href=\"http://www.smogon.com/tiers/om/analyses/aaa/\">AAA Analyses</a>",
		],

		mod: 'gen7',
		ruleset: ['Pokemon', 'Standard', 'Ability Clause', 'Ignore Illegal Abilities', 'Team Preview'],
		banlist: ['Arceus', 'Archeops', 'Blaziken', 'Darkrai', 'Deoxys', 'Dialga', 'Dragonite', 'Giratina', 'Groudon', 'Ho-Oh', 'Hoopa-Unbound',
			'Kartana', 'Keldeo', 'Kyogre', 'Kyurem-Black', 'Kyurem-White', 'Lugia', 'Lunala', 'Marshadow', 'Mewtwo', 'Palkia', 'Pheromosa',
			'Rayquaza', 'Regigigas', 'Reshiram', 'Shaymin-Sky', 'Shedinja', 'Slaking', 'Solgaleo', 'Terrakion', 'Xerneas', 'Yveltal', 'Zekrom',
			'Arena Trap', 'Power Construct', 'Shadow Tag', 'Gengarite', 'Kangaskhanite', 'Lucarionite', 'Salamencite', 'Baton Pass',
		],
		onValidateSet: function (set) {
			let bannedAbilities = {'Arena Trap': 1, 'Comatose': 1, 'Contrary': 1, 'Fluffy': 1, 'Fur Coat': 1, 'Huge Power': 1, 'Illusion': 1, 'Imposter': 1, 'Innards Out': 1, 'Parental Bond': 1, 'Protean': 1, 'Pure Power': 1, 'Shadow Tag':1, 'Simple':1, 'Speed Boost': 1, 'Stakeout': 1, 'Water Bubble': 1, 'Wonder Guard': 1};
			if (set.ability in bannedAbilities) {
				let template = this.getTemplate(set.species || set.name);
				let legalAbility = false;
				for (let i in template.abilities) {
					if (set.ability === template.abilities[i]) legalAbility = true;
				}
				if (!legalAbility) return ['The ability ' + set.ability + ' is banned on Pok\u00e9mon that do not naturally have it.'];
			}
		},
	},
	{
		name: "[Gen 7] Sketchmons",
		desc: [
			"Pok&eacute;mon gain access to one Sketched move.",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3587743/\">Sketchmons</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3606633/\">Sketchmons Resources</a>",
			"&bullet; <a href=\"http://www.smogon.com/tiers/om/analyses/sketchmons/\">Sketchmons Analyses</a>",
		],

		mod: 'gen7',
		searchShow: false,
		ruleset: ['[Gen 7] OU', 'Allow One Sketch', 'Sketch Clause'],
		banlist: ['Porygon-Z'],
		noSketch: ['Belly Drum', 'Celebrate', 'Conversion', "Forest's Curse", 'Geomancy', 'Happy Hour', 'Hold Hands', 'Lovely Kiss', 'Purify', 'Quiver Dance', 'Shell Smash', 'Shift Gear', 'Sketch', 'Spore', 'Sticky Web', 'Trick-or-Treat'],
	},
	{
		name: "[Gen 7] Sketchmons (suspect test)",
		desc: ["&bullet; <a href=\"http://www.smogon.com/forums/posts/7547342/\">Sketchmons Suspect Test</a>"],

		mod: 'gen7',
		challengeShow: false,
		ruleset: ['[Gen 7] Sketchmons'],
		banlist: [],
		noSketch: ['Belly Drum', 'Celebrate', 'Conversion', "Forest's Curse", 'Geomancy', 'Happy Hour', 'Hold Hands', 'Lovely Kiss', 'Purify', 'Quiver Dance', 'Shell Smash', 'Shift Gear', 'Sketch', 'Spore', 'Sticky Web', 'Trick-or-Treat'],
	},
	{
		name: "[Gen 7] Hidden Type",
		desc: [
			"Pok&eacute;mon have an added type determined by their IVs. Same as the Hidden Power type.",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3591194/\">Hidden Type</a>",
		],

		mod: 'gen7',
		searchShow: false,
		ruleset: ['[Gen 7] OU'],
		onModifyTemplate: function (template, pokemon) {
			if (template.types.includes(pokemon.hpType)) return;
			return Object.assign({addedType: pokemon.hpType}, template);
		},
	},
	{
		name: "[Gen 7] 2v2 Doubles",
		desc: [
			"Double battle where you bring four Pok&eacute;mon to Team Preview and choose only two.",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3606989/\">2v2 Doubles</a>",
		],

		mod: 'gen7',
		gameType: 'doubles',
		searchShow: false,
		teamLength: {
			validate: [2, 4],
			battle: 2,
		},
		ruleset: ['Gen 7] Doubles OU'],
		banlist: ['Tapu Lele', 'Focus Sash', 'Perish Song'],
	},
	{
		name: "[Gen 6] Gen-NEXT OU",

		mod: 'gennext',
		searchShow: false,
		ruleset: ['Pokemon', 'Standard NEXT', 'Team Preview'],
		banlist: ['Uber'],
	},

	// Randomized Metas
	///////////////////////////////////////////////////////////////////

	{
		section: "Randomized Metas",
		column: 3,
	},
	{
		name: "[Gen 6] Battle Factory",

		mod: 'gen6',
		team: 'randomFactory',
		ruleset: ['Pokemon', 'Sleep Clause Mod', 'Team Preview', 'HP Percentage Mod', 'Cancel Mod', 'Mega Rayquaza Clause'],
	},
	{
		name: "[Gen 7] BSS Factory",
		desc: [
			"Randomised 3v3 Singles featuring Pok&eacute;mon and movesets popular in Battle Spot Singles.",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3604845/\">Information and Suggestions Thread</a>",
		],

		mod: 'gen7',
		team: 'randomBSSFactory',
		teamLength: {
			validate: [3, 6],
			battle: 3,
		},
		ruleset: ['Pokemon', 'Standard GBU', 'Team Preview'],
	},
	{
		name: "[Gen 7] Challenge Cup 1v1",

		mod: 'gen7',
		team: 'randomCC',
		teamLength: {
			battle: 1,
		},
		ruleset: ['Pokemon', 'HP Percentage Mod', 'Cancel Mod', 'Team Preview'],
	},
	{
		name: "[Gen 7] Monotype Random Battle",

		mod: 'gen7',
		team: 'random',
		searchShow: false,
		ruleset: ['Pokemon', 'Same Type Clause', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 7] Hackmons Cup",
		desc: ["Randomized teams of level-balanced Pok&eacute;mon with absolutely any ability, moves, and item."],

		mod: 'gen7',
		team: 'randomHC',
		ruleset: ['Pokemon', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 7] Doubles Hackmons Cup",

		mod: 'gen7',
		gameType: 'doubles',
		team: 'randomHC',
		searchShow: false,
		ruleset: ['Pokemon', 'HP Percentage Mod', 'Cancel Mod'],
	},

	// RoA Spotlight
	///////////////////////////////////////////////////////////////////

	{
		section: "RoA Spotlight",
		column: 4,
	},
	{
		name: "[Gen 4] Doubles OU",

		mod: 'gen4',
		gameType: 'doubles',
		ruleset: ['[Gen 4] OU'],
		banlist: [],
	},

	// ORAS Singles
	///////////////////////////////////////////////////////////////////

	{
		section: "ORAS Singles",
		column: 4,
	},
	{
		name: "[Gen 6] OU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/dex/xy/tags/ou/\">ORAS OU Banlist</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3596900/\">ORAS OU Viability Rankings</a>",
		],

		mod: 'gen6',
		ruleset: ['Pokemon', 'Standard', 'Team Preview', 'Swagger Clause', 'Baton Pass Clause'],
		banlist: ['Uber', 'Arena Trap', 'Shadow Tag', 'Soul Dew'],
	},
	{
		name: "[Gen 6] Ubers",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3522911/\">ORAS Ubers</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3535106/\">ORAS Ubers Viability Rankings</a>",
		],

		mod: 'gen6',
		ruleset: ['Pokemon', 'Standard', 'Swagger Clause', 'Team Preview', 'Mega Rayquaza Clause'],
	},
	{
		name: "[Gen 6] UU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/dex/xy/tags/uu/\">ORAS UU Banlist</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3598164/\">ORAS UU Viability Rankings</a>",
		],

		mod: 'gen6',
		ruleset: ['[Gen 6] OU'],
		banlist: ['OU', 'BL', 'Drizzle', 'Drought', 'Baton Pass'],
	},
	{
		name: "[Gen 6] RU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/dex/xy/tags/ru/\">ORAS RU Banlist</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3574583/\">ORAS RU Viability Rankings</a>",
		],

		mod: 'gen6',
		ruleset: ['[Gen 6] UU'],
		banlist: ['UU', 'BL2'],
	},
	{
		name: "[Gen 6] NU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/dex/xy/tags/nu/\">ORAS NU Banlist</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3555650/\">ORAS NU Viability Rankings</a>",
		],

		mod: 'gen6',
		ruleset: ['[Gen 6] RU'],
		banlist: ['RU', 'BL3'],
	},
	{
		name: "[Gen 6] PU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/dex/xy/tags/pu/\">ORAS PU Banlist</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3528743/\">ORAS PU Viability Rankings</a>",
		],

		mod: 'gen6',
		ruleset: ['[Gen 6] NU'],
		banlist: ['NU', 'BL4', 'Chatter'],
		unbanlist: ['Baton Pass'],
	},
	{
		name: "[Gen 6] LC",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/dex/xy/formats/lc/\">ORAS LC Banlist</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3547566/\">ORAS LC Viability Rankings</a>",
		],

		mod: 'gen6',
		maxLevel: 5,
		ruleset: ['Pokemon', 'Standard', 'Team Preview', 'Little Cup'],
		banlist: ['LC Uber', 'Gligar', 'Misdreavus', 'Scyther', 'Sneasel', 'Tangela', 'Dragon Rage', 'Sonic Boom', 'Swagger'],
	},
	{
		name: "[Gen 6] Anything Goes",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3523229/\">ORAS Anything Goes</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3548945/\">ORAS AG Resources</a>",
		],

		mod: 'gen6',
		ruleset: ['Pokemon', 'Endless Battle Clause', 'Team Preview', 'HP Percentage Mod', 'Cancel Mod'],
		banlist: ['Illegal', 'Unreleased'],
	},
	{
		name: "[Gen 6] Monotype",
		desc: ["&bullet; <a href=\"http://www.smogon.com/forums/posts/7421332/\">ORAS Monotype</a>"],

		mod: 'gen6',
		searchShow: false,
		ruleset: ['Pokemon', 'Standard', 'Swagger Clause', 'Same Type Clause', 'Team Preview'],
		banlist: [
			'Aegislash', 'Arceus', 'Blaziken', 'Darkrai', 'Deoxys-Base', 'Deoxys-Attack', 'Dialga', 'Genesect', 'Giratina', 'Greninja', 'Groudon', 'Ho-Oh',
			'Kyogre', 'Kyurem-White', 'Lugia', 'Mewtwo', 'Palkia', 'Rayquaza', 'Reshiram', 'Shaymin-Sky', 'Talonflame', 'Xerneas', 'Yveltal', 'Zekrom',
			'Altarianite', 'Charizardite X', 'Damp Rock', 'Gengarite', 'Kangaskhanite', 'Lucarionite', 'Mawilite', 'Metagrossite', 'Sablenite', 'Salamencite', 'Slowbronite', 'Smooth Rock', 'Soul Dew',
		],
	},
	{
		name: "[Gen 6] CAP",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3537407/\">ORAS CAP Metagame Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3545628/\">ORAS CAP Viability Rankings</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/5594694/\">ORAS CAP Sample Teams</a>",
		],

		mod: 'gen6',
		searchShow: false,
		ruleset: ['[Gen 6] OU', 'Allow CAP'],
	},
	{
		name: "[Gen 6] Battle Spot Singles",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3527960/\">ORAS Battle Spot Singles</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3554616/\">ORAS BSS Viability Rankings</a>",
		],

		mod: 'gen6',
		maxForcedLevel: 50,
		teamLength: {
			validate: [3, 6],
			battle: 3,
		},
		ruleset: ['Pokemon', 'Standard GBU', 'Team Preview'],
		requirePentagon: true,
	},
	{
		name: "[Gen 6] Inverse Battle",
		desc: ["The effectiveness of attacks is inverted."],

		mod: 'gen6',
		searchShow: false,
		ruleset: ['Pokemon', 'Inverse Mod', 'Endless Battle Clause', 'Team Preview', 'HP Percentage Mod', 'Cancel Mod'],
		banlist: ['Illegal', 'Unreleased'],
	},
	{
		name: "[Gen 6] Random Battle",

		mod: 'gen6',
		team: 'random',
		ruleset: ['PotD', 'Pokemon', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 6] Custom Game",

		mod: 'gen6',
		searchShow: false,
		canUseRandomTeam: true,
		debug: true,
		maxLevel: 9999,
		defaultLevel: 100,
		// no restrictions, for serious (other than team preview)
		ruleset: ['Team Preview', 'Cancel Mod'],
	},

	// ORAS Doubles/Triples
	///////////////////////////////////////////////////////////////////

	{
		section: "ORAS Doubles/Triples",
	},
	{
		name: "[Gen 6] Doubles OU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3498688/\">ORAS Doubles OU Banlist</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3535930/\">ORAS Doubles OU Viability Rankings</a>",
		],

		mod: 'gen6',
		gameType: 'doubles',
		ruleset: ['Pokemon', 'Standard Doubles', 'Swagger Clause', 'Team Preview'],
		banlist: [
			'Arceus', 'Dialga', 'Giratina', 'Giratina-Origin', 'Groudon', 'Ho-Oh', 'Kyogre', 'Kyurem-White', 'Lugia', 'Mewtwo',
			'Palkia', 'Rayquaza', 'Reshiram', 'Salamence-Mega', 'Salamencite', 'Shaymin-Sky', 'Xerneas', 'Yveltal', 'Zekrom', 'Soul Dew',
			'Dark Void', 'Gravity ++ Grass Whistle', 'Gravity ++ Hypnosis', 'Gravity ++ Lovely Kiss', 'Gravity ++ Sing', 'Gravity ++ Sleep Powder',
		],
	},
	{
		name: "[Gen 6] Doubles Ubers",
		desc: ["&bullet; <a href=\"http://www.smogon.com/forums/threads/3542746/\">ORAS Doubles Ubers</a>"],

		mod: 'gen6',
		gameType: 'doubles',
		searchShow: false,
		ruleset: ['Pokemon', 'Species Clause', 'Moody Clause', 'OHKO Clause', 'Evasion Moves Clause', 'Evasion Abilities Clause', 'Endless Battle Clause', 'HP Percentage Mod', 'Cancel Mod', 'Team Preview'],
		banlist: ['Illegal', 'Unreleased', 'Dark Void'],
	},
	{
		name: "[Gen 6] Doubles UU",
		desc: ["&bullet; <a href=\"http://www.smogon.com/forums/threads/3542755/\">ORAS Doubles UU</a>"],

		mod: 'gen6',
		gameType: 'doubles',
		searchShow: false,
		ruleset: ['[Gen 6] Doubles OU'],
		banlist: [
			'Aegislash', 'Amoonguss', 'Arcanine', 'Azumarill', 'Bisharp', 'Breloom', 'Charizard-Mega-Y', 'Charizardite Y',
			'Conkeldurr', 'Cresselia', 'Diancie-Mega', 'Diancite', 'Ferrothorn', 'Garchomp', 'Gardevoir-Mega', 'Gardevoirite',
			'Gastrodon', 'Gengar', 'Greninja', 'Heatran', 'Hitmontop', 'Hoopa-Unbound', 'Hydreigon', 'Jirachi',
			'Kangaskhan-Mega', 'Kangaskhanite', 'Keldeo', 'Kyurem-Black', 'Landorus-Therian', 'Latios', 'Ludicolo', 'Milotic',
			'Politoed', 'Raichu', 'Rotom-Wash', 'Scizor', 'Scrafty', 'Shaymin-Sky', 'Suicune', 'Sylveon', 'Talonflame',
			'Terrakion', 'Thundurus', 'Togekiss', 'Tyranitar', 'Venusaur', 'Volcanion', 'Weavile', 'Whimsicott', 'Zapdos',
		],
	},
	{
		name: "[Gen 6] VGC 2016",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3558332/\">VGC 2016 Rules</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3580592/\">VGC 2016 Viability Rankings</a>",
		],

		mod: 'gen6',
		gameType: 'doubles',
		maxForcedLevel: 50,
		teamLength: {
			validate: [4, 6],
			battle: 4,
		},
		ruleset: ['Pokemon', 'Species Clause', 'Nickname Clause', 'Item Clause', 'Team Preview', 'Cancel Mod'],
		banlist: [
			'Illegal', 'Unreleased', 'Mew', 'Celebi', 'Jirachi', 'Deoxys', 'Deoxys-Attack', 'Deoxys-Defense', 'Deoxys-Speed', 'Phione', 'Manaphy', 'Darkrai',
			'Shaymin', 'Shaymin-Sky', 'Arceus', 'Victini', 'Keldeo', 'Meloetta', 'Genesect', 'Diancie', 'Hoopa', 'Hoopa-Unbound', 'Volcanion', 'Soul Dew',
		],
		requirePentagon: true,
		onValidateTeam: function (team) {
			const legends = {
				'Mewtwo': 1,
				'Lugia': 1,
				'Ho-Oh': 1,
				'Kyogre': 1,
				'Groudon': 1,
				'Rayquaza': 1,
				'Dialga': 1,
				'Palkia': 1,
				'Giratina': 1,
				'Reshiram': 1,
				'Zekrom': 1,
				'Kyurem': 1,
				'Xerneas': 1,
				'Yveltal': 1,
				'Zygarde': 1,
			};
			let n = 0;
			for (let i = 0; i < team.length; i++) {
				let template = this.getTemplate(team[i].species).baseSpecies;
				if (template in legends) n++;
				if (n > 2) return ["You can only use up to two legendary Pok\u00E9mon."];
			}
		},
	},
	{
		name: "[Gen 6] Battle Spot Doubles",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3560820/\">ORAS Battle Spot Doubles Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3560824/\">ORAS BSD Viability Rankings</a>",
		],

		mod: 'gen6',
		gameType: 'doubles',
		maxForcedLevel: 50,
		teamLength: {
			validate: [4, 6],
			battle: 4,
		},
		ruleset: ['Pokemon', 'Standard GBU', 'Team Preview'],
		requirePentagon: true,
	},
	{
		name: "[Gen 6] Random Doubles Battle",

		mod: 'gen6',
		gameType: 'doubles',
		team: 'random',
		searchShow: false,
		ruleset: ['PotD', 'Pokemon', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 6] Doubles Custom Game",

		mod: 'gen6',
		gameType: 'doubles',
		searchShow: false,
		canUseRandomTeam: true,
		maxLevel: 9999,
		defaultLevel: 100,
		debug: true,
		// no restrictions, for serious (other than team preview)
		ruleset: ['Team Preview', 'Cancel Mod'],
	},
	{
		name: "[Gen 6] Battle Spot Triples",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3533914/\">ORAS Battle Spot Triples Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3549201/\">ORAS BST Viability Rankings</a>",
		],

		mod: 'gen6',
		gameType: 'triples',
		maxForcedLevel: 50,
		teamLength: {
			validate: [6, 6],
		},
		ruleset: ['Pokemon', 'Standard GBU', 'Team Preview'],
		requirePentagon: true,
	},
	{
		name: "[Gen 6] Triples Custom Game",

		mod: 'gen6',
		gameType: 'triples',
		searchShow: false,
		canUseRandomTeam: true,
		maxLevel: 9999,
		defaultLevel: 100,
		debug: true,
		// no restrictions, for serious (other than team preview)
		ruleset: ['Team Preview', 'Cancel Mod'],
	},

	// BW2 Singles
	///////////////////////////////////////////////////////////////////

	{
		section: "BW2 Singles",
		column: 5,
	},
	{
		name: "[Gen 5] OU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3599678/\">BW2 OU Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431094/\">BW2 Sample Teams</a>",
		],

		mod: 'gen5',
		ruleset: ['Pokemon', 'Standard', 'Evasion Abilities Clause', 'Baton Pass Clause', 'Swagger Clause', 'Team Preview'],
		banlist: ['Uber', 'Drizzle ++ Swift Swim', 'Drought ++ Chlorophyll', 'Sand Stream ++ Sand Rush', 'Soul Dew'],
	},
	{
		name: "[Gen 5] Ubers",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3550881/\">BW2 Ubers Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6446463/\">BW2 Ubers Sample Teams</a>",
		],

		mod: 'gen5',
		ruleset: ['Pokemon', 'Team Preview', 'Standard Ubers'],
	},
	{
		name: "[Gen 5] UU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3474024/\">BW2 UU Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431094/\">BW2 Sample Teams</a>",
		],

		mod: 'gen5',
		ruleset: ['[Gen 5] OU'],
		banlist: ['OU', 'BL', 'Drought', 'Sand Stream', 'Snow Warning'],
	},
	{
		name: "[Gen 5] RU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3473124/\">BW2 RU Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431094/\">BW2 Sample Teams</a>",
		],

		mod: 'gen5',
		ruleset: ['[Gen 5] UU'],
		banlist: ['UU', 'BL2', 'Shell Smash + Baton Pass', 'Snow Warning'],
	},
	{
		name: "[Gen 5] NU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3484121/\">BW2 NU Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431094/\">BW2 Sample Teams</a>",
		],

		mod: 'gen5',
		ruleset: ['[Gen 5] RU'],
		banlist: ['RU', 'BL3', 'Prankster + Assist'],
	},
	{
		name: "[Gen 5] LC",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3485860/\">BW2 LC Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431094/\">BW2 Sample Teams</a>",
		],

		mod: 'gen5',
		maxLevel: 5,
		ruleset: ['Pokemon', 'Standard', 'Team Preview', 'Little Cup'],
		banlist: ['Berry Juice', 'Soul Dew', 'Dragon Rage', 'Sonic Boom', 'LC Uber', 'Gligar', 'Murkrow', 'Scyther', 'Sneasel', 'Tangela'],
	},
	{
		name: "[Gen 5] GBU Singles",

		mod: 'gen5',
		searchShow: false,
		maxForcedLevel: 50,
		teamLength: {
			validate: [3, 6],
			battle: 3,
		},
		ruleset: ['Pokemon', 'Standard GBU', 'Team Preview'],
		banlist: ['Dark Void', 'Sky Drop'],
	},
	{
		name: "[Gen 5] Random Battle",

		mod: 'gen5',
		searchShow: false,
		team: 'random',
		ruleset: ['Pokemon', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 5] Custom Game",

		mod: 'gen5',
		searchShow: false,
		canUseRandomTeam: true,
		debug: true,
		maxLevel: 9999,
		defaultLevel: 100,
		// no restrictions, for serious (other than team preview)
		ruleset: ['Team Preview', 'Cancel Mod'],
	},

	// BW2 Doubles
	///////////////////////////////////////////////////////////////////

	{
		section: 'BW2 Doubles',
		column: 5,
	},
	{
		name: "[Gen 5] Doubles OU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3533424/\">BW2 Doubles Metagame Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3533421/\">BW2 Doubles Viability Ranking</a>",
		],

		mod: 'gen5',
		gameType: 'doubles',
		ruleset: ['Pokemon', 'Standard', 'Evasion Abilities Clause', 'Swagger Clause', 'Team Preview'],
		banlist: [
			'Arceus', 'Dialga', 'Giratina', 'Giratina-Origin', 'Groudon', 'Ho-Oh', 'Kyogre', 'Kyurem-White', 'Jirachi',
			'Lugia', 'Mewtwo', 'Palkia', 'Rayquaza', 'Reshiram', 'Zekrom', 'Soul Dew', 'Dark Void', 'Sky Drop',
		],
	},
	{
		name: "[Gen 5] GBU Doubles",

		mod: 'gen5',
		gameType: 'doubles',
		searchShow: false,
		maxForcedLevel: 50,
		teamLength: {
			validate: [4, 6],
			battle: 4,
		},
		ruleset: ['Pokemon', 'Standard GBU', 'Team Preview'],
		banlist: ['Dark Void', 'Sky Drop'],
	},
	{
		name: "[Gen 5] Doubles Custom Game",

		mod: 'gen5',
		gameType: 'doubles',
		searchShow: false,
		canUseRandomTeam: true,
		debug: true,
		maxLevel: 9999,
		defaultLevel: 100,
		// no restrictions, for serious (other than team preview)
		ruleset: ['Team Preview', 'Cancel Mod'],
	},

	// Past Generations
	///////////////////////////////////////////////////////////////////

	{
		section: "Past Generations",
		column: 5,
	},
	{
		name: "[Gen 4] OU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3551992/\">DPP OU Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431088/\">DPP Sample Teams</a>",
		],

		mod: 'gen4',
		ruleset: ['Pokemon', 'Standard', 'Evasion Abilities Clause'],
		banlist: ['Uber'],
	},
	{
		name: "[Gen 4] Ubers",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3505128/\">DPP Ubers Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6446464/\">DPP Ubers Sample Teams</a>",
		],

		mod: 'gen4',
		ruleset: ['Pokemon', 'Standard'],
		banlist: ['Arceus'],
	},
	{
		name: "[Gen 4] UU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3503638/\">DPP UU Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431088/\">DPP Sample Teams</a>",
		],

		mod: 'gen4',
		ruleset: ['Pokemon', 'Standard'],
		banlist: ['Uber', 'OU', 'BL'],
	},
	{
		name: "[Gen 4] LC",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/dp/articles/little_cup_guide\">DPP LC Guide</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431088/\">DPP Sample Teams</a>",
		],

		mod: 'gen4',
		maxLevel: 5,
		ruleset: ['Pokemon', 'Standard', 'Little Cup'],
		banlist: ['LC Uber', 'Misdreavus', 'Murkrow', 'Scyther', 'Sneasel', 'Tangela', 'Yanma', 'Berry Juice', 'Deep Sea Tooth', 'Dragon Rage', 'Sonic Boom'],
	},
	{
		name: "[Gen 4] Random Battle",

		mod: 'gen4',
		team: 'random',
		ruleset: ['Pokemon', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 4] Custom Game",

		mod: 'gen4',
		searchShow: false,
		canUseRandomTeam: true,
		debug: true,
		maxLevel: 9999,
		defaultLevel: 100,
		// no restrictions
		ruleset: ['Cancel Mod'],
	},
	{
		name: "[Gen 4] Doubles Custom Game",

		mod: 'gen4',
		gameType: 'doubles',
		searchShow: false,
		canUseRandomTeam: true,
		debug: true,
		maxLevel: 9999,
		defaultLevel: 100,
		// no restrictions
		ruleset: ['Cancel Mod'],
	},
	{
		name: "[Gen 3] OU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3503019/\">ADV OU Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431087/\">ADV Sample Teams</a>",
		],

		mod: 'gen3',
		ruleset: ['Pokemon', 'Standard'],
		banlist: ['Uber', 'Smeargle + Ingrain'],
	},
	{
		name: "[Gen 3] Ubers",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3536426/\">ADV Ubers Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6446466/\">ADV Ubers Sample Teams</a>",
		],

		mod: 'gen3',
		ruleset: ['Pokemon', 'Standard'],
		banlist: ['Wobbuffet + Leftovers'],
	},
	{
		name: "[Gen 3] Random Battle",

		mod: 'gen3',
		team: 'random',
		ruleset: ['Pokemon', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 3] Custom Game",

		mod: 'gen3',
		searchShow: false,
		debug: true,
		ruleset: ['Pokemon', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 2] OU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3556533/\">GSC OU Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431086/\">GSC Sample Teams</a>",
		],

		mod: 'gen2',
		ruleset: ['Pokemon', 'Standard'],
		banlist: ['Uber'],
	},
	{
		name: "[Gen 2] Ubers",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3507552/\">GSC Ubers Discussion</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431086/\">GSC Sample Teams</a>",
		],

		mod: 'gen2',
		searchShow: false,
		ruleset: ['Pokemon', 'Standard'],
	},
	{
		name: "[Gen 2] Random Battle",

		mod: 'gen2',
		team: 'random',
		ruleset: ['Pokemon', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 2] Custom Game",

		mod: 'gen2',
		searchShow: false,
		debug: true,
		ruleset: ['Pokemon', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 1] OU",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3572352/\">RBY OU Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431045/\">RBY Sample Teams</a>",
		],

		mod: 'gen1',
		ruleset: ['Pokemon', 'Standard'],
		banlist: ['Uber'],
	},
	{
		name: "[Gen 1] Ubers",
		desc: [
			"&bullet; <a href=\"http://www.smogon.com/forums/threads/3541329/\">RBY Ubers Viability Ranking</a>",
			"&bullet; <a href=\"http://www.smogon.com/forums/posts/6431045/\">RBY Sample Teams</a>",
		],

		mod: 'gen1',
		searchShow: false,
		ruleset: ['Pokemon', 'Standard'],
	},
	{
		name: "[Gen 1] OU (tradeback)",

		mod: 'gen1',
		searchShow: false,
		ruleset: ['Pokemon', 'Allow Tradeback', 'Sleep Clause Mod', 'Freeze Clause Mod', 'Species Clause', 'OHKO Clause', 'Evasion Moves Clause', 'HP Percentage Mod', 'Cancel Mod'],
		banlist: ['Uber', 'Unreleased', 'Illegal',
			'Nidoking + Fury Attack + Thrash', 'Exeggutor + Poison Powder + Stomp', 'Exeggutor + Sleep Powder + Stomp',
			'Exeggutor + Stun Spore + Stomp', 'Jolteon + Focus Energy + Thunder Shock', 'Flareon + Focus Energy + Ember',
		],
	},
	{
		name: "[Gen 1] Random Battle",

		mod: 'gen1',
		team: 'random',
		ruleset: ['Pokemon', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 1] Challenge Cup",

		mod: 'gen1',
		team: 'randomCC',
		searchShow: false,
		challengeShow: false,
		ruleset: ['Pokemon', 'Sleep Clause Mod', 'HP Percentage Mod', 'Cancel Mod'],
	},
	{
		name: "[Gen 1] Stadium",

		mod: 'stadium',
		searchShow: false,
		ruleset: ['Pokemon', 'Standard', 'Team Preview'],
		banlist: ['Uber',
			'Nidoking + Fury Attack + Thrash', 'Exeggutor + Poison Powder + Stomp', 'Exeggutor + Sleep Powder + Stomp',
			'Exeggutor + Stun Spore + Stomp', 'Jolteon + Focus Energy + Thunder Shock', 'Flareon + Focus Energy + Ember',
		],
	},
	{
		name: "[Gen 1] Custom Game",

		mod: 'gen1',
		searchShow: false,
		debug: true,
		ruleset: ['Pokemon', 'HP Percentage Mod', 'Cancel Mod'],
	},
];
