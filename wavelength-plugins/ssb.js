'use strict';

let fs = require('fs');
let ssbWrite = true; //if false, do not write to json
let noRead = false; //if true, do not read from json
const MAX_MOVEPOOL_SIZE = 4;
let customMovepool = ['Stretch', 'Flame Tower', 'Rain Spear', 'Healing Herbs', 'Electro Drive', 'Hailstorm', 'Beat Down', 'Nuclear Waste', 'Terratremor', 'Ventilation', 'Psychic Shield', 'Swarm Charge', 'Rock Cannon', 'Spook', 'Imperial Rampage', 'Shadow Run', 'Magnorang', 'Majestic Dust']; //Add defual custom move names here.
let typeList = ['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

const BANS = {
	moves: ['Baton Pass'],
	abilities: ['Shadow Tag', 'Arena Trap', 'Power Construct', 'Moody'],
	items: [],
	pokemon: [],
	tiers: ['Uber', 'AG'],
};

global.writeSSB = function () {
	if (!ssbWrite) return false; //Prevent corruptions
	fs.writeFile('config/ssb.json', JSON.stringify(WL.ssb), () => {});
};

//Shamlessly ripped from teambuilder client.
function getStat(stat, set, evOverride, natureOverride) {
	if (!set) set = this.curSet;
	if (!set) return 0;

	if (!set.ivs) {
		set.ivs = {
			hp: 31,
			atk: 31,
			def: 31,
			spa: 31,
			spd: 31,
			spe: 31,
		};
	}
	if (!set.evs) set.evs = {};

	// do this after setting set.evs because it's assumed to exist
	// after getStat is run
	let template = Dex.getTemplate(set.species);
	if (!template.exists) return 0;

	if (!set.level) set.level = 100;
	if (typeof set.ivs[stat] === 'undefined') set.ivs[stat] = 31;

	let baseStat = Dex.getTemplate(set.species).baseStats[stat];
	let iv = (set.ivs[stat] || 0);
	let ev = set.evs[stat];
	if (evOverride !== undefined) ev = evOverride;
	if (ev === undefined) ev = (this.curTeam.gen > 2 ? 0 : 252);

	if (stat === 'hp') {
		if (baseStat === 1) return 1;
		return Math.floor(Math.floor(2 * baseStat + iv + Math.floor(ev / 4) + 100) * set.level / 100 + 10);
	}
	let val = Math.floor(Math.floor(2 * baseStat + iv + Math.floor(ev / 4)) * set.level / 100 + 5);
	if (natureOverride) {
		val *= natureOverride;
	} else if (Dex.getNature(set.nature) && Dex.getNature(set.nature).plus === stat) {
		val *= 1.1;
	} else if (Dex.getNature(set.nature) && Dex.getNature(set.nature).minus === stat) {
		val *= 0.9;
	}
	return Math.floor(val);
}

function buildMenu(userid) {
	if (!WL.ssb[userid]) return '<span style="color:red"><b>Error: </b>User "' + userid + '" not found in ssb.</span>';
	let speciesName = toId(WL.ssb[userid].species);
	/*if (speciesName.substring(0, 8) === 'oricorio') {
	  speciesName = 'oricorio-' + toId(speciesName.substring(8));
	}*/
	let split = WL.ssb[userid].species.split('-');
	if (split.length > 1) {
		speciesName = toId(split[0]) + '-' + speciesName.substring(toId(split[0]).length);
	}
	let output = '';
	output += '<div class="setchart" style="height: 155px; background-image:url(//play.pokemonshowdown.com/sprites/' + (Dex.getTemplate(toId(WL.ssb[userid].species)).gen === 7 ? 'bw' : 'xydex') + '' + (WL.ssb[userid].shiny ? '-shiny' : '') + '/' + speciesName + '.png); background-position: -2px -3px; background-repeat: no-repeat;">';
	output += '<div class="setcol setcol-icon"><div class="setcell-sprite"></div><div class="setcell setcell-pokemon"><label>Pokémon</label><button class="textbox chartinput" style="width:104px; height: 20px; text-align: left" name="send" value="/ssb edit species">' + WL.ssb[userid].species + '</button></div></div>';
	output += '<div class="setcol setcol-details"><div class="setrow"><div class="setcell setcell-details"><label>Details</label><button class="textbox setdetails" tabindex="-1" name="send" value="/ssb edit details"><span class="detailcell detailcell-first"><label>Level</label>' + WL.ssb[userid].level + '</span><span class="detailcell"><label>Gender</label>' + (WL.ssb[userid].gender === 'random' ? '-' : WL.ssb[userid].gender) + '</span><span class="detailcell"><label>Happiness</label>' + WL.ssb[userid].happiness + '</span><span class="detailcell"><label>Shiny</label>' + (WL.ssb[userid].shiny ? 'Yes' : 'No') + '</span></button><span class="itemicon" style="background: none"></span></div></div><div class="setrow"><div class="setcell setcell-item"><label>Item</label><button class="textbox chartinput" style="width:104px; height: 20px; text-align: left" name="send" value="/ssb edit item">' + (WL.ssb[userid].item ? WL.ssb[userid].item : '') + '</button></div><div class="setcell setcell-ability"><label>Ability</label><button class="textbox chartinput" style="width:104px; height: 20px; text-align: left" name="send" value="/ssb edit ability">' + WL.ssb[userid].ability + '</button></div></div></div>';
	output += '<div class="setcol setcol-moves"><div class="setcell"><label>Moves</label><button class="textbox chartinput" style="width:129px; height: 20px; text-align: left; overflow: hidden" name="send" value="/ssb edit move">' + (WL.ssb[userid].movepool[0] ? WL.ssb[userid].movepool[0] : '') + '</button></div><div class="setcell"><button class="textbox chartinput" style="width:129px; height: 20px; text-align: left; overflow: hidden" name="send" value="/ssb edit move">' + (WL.ssb[userid].movepool[1] ? WL.ssb[userid].movepool[1] : '') + '</button></div><div class="setcell"><button class="textbox chartinput" style="width:129px; height: 20px; text-align: left; overflow: hidden" name="send" value="/ssb edit move">' + (WL.ssb[userid].movepool[2] ? WL.ssb[userid].movepool[2] : '') + '</button></div><div class="setcell"><button class="textbox chartinput" style="width:129px; height: 20px; text-align: left; overflow: hidden" name="send" value="/ssb edit move">' + (WL.ssb[userid].cMove ? WL.ssb[userid].cMove : (WL.ssb[userid].movepool[3] ? WL.ssb[userid].movepool[3] : '')) + '</button></div></div>';
	output += '<div class="setcol setcol-stats"><div class="setrow"><label>Stats</label><button class="textbox setstats" name="send" value="/ssb edit stats"><span class="statrow statrow-head"><label></label><span class="statgraph"></span> <em>EV</em></span>';
	let statNames = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
	let stats = {};
	for (let i = 0; i < statNames.length; i++) {
		stats[toId(statNames[i])] = getStat(toId(statNames[i]), {
			species: WL.ssb[userid].species,
			evs: WL.ssb[userid].evs,
			ivs: WL.ssb[userid].ivs,
			nature: WL.ssb[userid].nature,
			level: WL.ssb[userid].level,
		});
		let evBuf = '<em>' + (WL.ssb[userid].evs[toId(statNames[i])] === 0 ? '' : WL.ssb[userid].evs[toId(statNames[i])]) + '</em>';
		if (Dex.getNature(WL.ssb[userid].nature).plus === toId(statNames[i])) {
			evBuf += '<small>+</small>';
		} else if (Dex.getNature(WL.ssb[userid].nature).minus === toId(statNames[i])) {
			evBuf += '<small>&minus;</small>';
		}
		let width = stats[toId(statNames[i])] * 75 / 504;
		if (statNames[i] === 'HP') width = stats[toId(statNames[i])] * 75 / 704;
		if (width > 75) width = 75;
		let color = Math.floor(WL.ssb[userid].evs[toId(statNames[i])] * 180 / 714);
		if (color > 360) color = 360;
		output += '<span class="statrow"><label>' + statNames[i] + '</label> <span class="statgraph"><span style="width:' + width + 'px;background:hsl(' + color + ',40%,75%);"></span></span> ' + evBuf + '</span>';
	}
	output += '</div></div>';
	//output += '<div class="setcol setcol-stats"><div class="setrow"><label>Stats</label><button class="textbox setstats" name="send" value="/ssb edit stats"><span class="statrow statrow-head"><label></label><span class="statgraph"></span><em>EV</em></span><span class="statrow"><label>HP</label><span class="statgraph"><span style="width:25.248579545454547px; background:hsl(59,40%,75%);"></span></span><em>?</em></span><span class="statrow"><label>Atk</label><span class="statgraph"><span style="width:19.94047619047619px; background:hsl(33,40%,75%);"></span></span><em>?</em></span><span class="statrow"><label>Def</label><span class="statgraph"><span style="width:19.642857142857142px; background:hsl(33,40%,75%);"></span></span><em>?</em></span><span class="statrow"><label>SpA</label><span class="statgraph"><span style="width:39.732142857142854px; background:hsl(67,40%,75%);"></span></span><em>?</em></span><span class="statrow"><label>SpD</label><span class="statgraph"><span style="width:19.791666666666668px; background:hsl(33,40%,75%);"></span></span><em>?</em></span><span class="statrow"><label>Spe</label><span class="statgraph"><span style="width:29.017857142857142px; background:hsl(49,40%,75%);"></span></span><em>?</em></span></button></div></div></div>';
	output += '<div style="text-align:center"><button class="button" name="send" value="/ssb custom">Custom Move List</button> | <button class="button" name="send" value="/ssb toggle">' + (WL.ssb[userid].active ? 'Deactivate your pokemon' : 'Activate your pokemon') + '</button></div></div>';
	return output;
}

function moveMenu(userid) {
	let output = '';
	output += '<div class="setchart" style="text-align:center"><h3><u>Move Menu</u></h3><div style="padding-bottom: 2px"><i>Current Moves:</i> ';
	for (let i = 0; i < WL.ssb[userid].movepool.length; i++) {
		if (WL.ssb[userid].movepool.length === 0) break;
		output += ((i + 1 === WL.ssb[userid].movepool.length && !WL.ssb[userid].cMove) ? WL.ssb[userid].movepool[i] : WL.ssb[userid].movepool[i] + ', ');
	}
	if (WL.ssb[userid].cMove) output += WL.ssb[userid].cMove;
	output += '</div><div style="padding-bottom: 2px"><i>Custom-made Custom Move:</i> ' + (WL.ssb[userid].selfCustomMove ? WL.ssb[userid].selfCustomMove : '<button name="send" value="/shop" class="button">Purchase</button>') + '</div>';
	output += '<button name="send" class="button" value="/ssb edit move help">Set Moves</button> | <button class="button" name="send" value="/ssb custom">Set a Custom Move</button> | <button name="send" class="button" value="/ssb edit moveq custom, ' + (WL.ssb[userid].selfCustomMove ? WL.ssb[userid].selfCustomMove : '') + '">Set Custom-made Custom Move</button> | <button name="send" class="button" value="/ssb edit main">Main Menu</button></div>';
	return output;
}

function itemMenu(userid) {
	return '<div class="setchart" style="text-align:center"><h3><u>Item Menu</u></h3><div style="padding-bottom: 2px"><i>Current Item:</i> ' + (WL.ssb[userid].item ? WL.ssb[userid].item : 'None') + '</div><div style="padding-bottom: 2px"><i>Custom Item:</i> ' + (WL.ssb[userid].cItem ? WL.ssb[userid].cItem : '<button name="send" value="/shop" class="button">Purchase</button>') + '</div><button name="send" class="button" value="/ssb edit item help">Set Item</button> | <button name="send" class="button" value="/ssb edit itemq reset">Reset Item</button> | <button name="send" class="button" value="/ssb edit itemq ' + (WL.ssb[userid].cItem ? WL.ssb[userid].cItem : 'help') + '">Set Custom Item</button> | <button name="send" class="button" value="/ssb edit main">Main Menu</button></div>';
}

function abilityMenu(userid) {
	let output = '<div class="setchart" style="text-align:center"><h3><u>Ability Menu</u></h3><div style="padding-bottom: 2px"><i>Current Ability:</i> ' + WL.ssb[userid].ability + '</div><div style="padding-bottom: 2px"><i>Custom Ability:</i> ' + (WL.ssb[userid].cAbility ? WL.ssb[userid].cAbility : '<button name="send" value="/shop" class="button">Purchase</button>') + '</div>';
	let pokemon = Dex.getTemplate(WL.ssb[userid].species);
	for (let i in pokemon.abilities) {
		output += '<button name="send" value="/ssb edit abilityq ' + pokemon.abilities[i] + '" class="button">Set to ' + pokemon.abilities[i] + '</button> | ';
	}
	if (WL.ssb[userid].cAbility) output += '<button name="send" value="/ssb edit abilityq ' + WL.ssb[userid].cAbility + '" class="button">Set to ' + WL.ssb[userid].cAbility + '</button> | ';
	output += '<button name="send" value="/ssb edit main" class="button">Main Menu</button></div>';
	return output;
}

function statMenu(userid) {
	let output = '<div class="setchart" style="text-align:center; height: 200px">';
	output += '<table style="border:1px solid black; display: inline-block; float: left"><tr><th colspan="3" style="border-right: 1px solid black;">EVs</th><th colspan="3" style="border-left: 1px solid black;">IVs</th></tr>';
	let values = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'];
	for (let i = 0; i < values.length; i++) {
		output += '<tr><td><button class="button" name="send" value="/ssb edit statsq ev, ' + values[i] + ', 0">Set 0</button></td><th>' + values[i] + ': ' + WL.ssb[userid].evs[toId(values[i])] + '</th><td style="border-right:1px solid black"><button class="button" name="send" value="/ssb edit statsq ev, ' + values[i] + ', 252">Set 252</button></td>';
		output += '<td style="border-left:1px solid black"><button class="button" name="send" value="/ssb edit statsq iv, ' + values[i] + ', 0">Set 0</button></td><th>' + values[i] + ': ' + WL.ssb[userid].ivs[toId(values[i])] + '</th><td><button class="button" name="send" value="/ssb edit statsq iv, ' + values[i] + ', 31">Set 31</button></td></tr>';
	}
	output += '<div style="float: right; display: inline-block; width: 40%"><b><u>Stat Menu</u></b><br/><br/><button class="button" name="send" value="/ssb edit stats help">Set EVs or IVs to a custom value</button><br/><br/><i>Current Nature:</i> ' + WL.ssb[userid].nature + '<br/><br/><button class="button" name="send" value="/ssb edit stats nature help">Set Nature</button><br/><br/><button class="button" name="send" value="/ssb edit main">Main Menu</button></div></div>';
	return output;
}

function detailMenu(userid) {
	let output = '<div class="setchart" style="text-align:center; height:140px"><h3><u>Details Menu</u></h3>';
	output += '<i>Level: </i>' + WL.ssb[userid].level + ' | <button name="send" value="/ssb edit detailsq level, 1" class="button">Set to 1</button> <button name="send" value="/ssb edit detailsq level, 50" class="button">Set to 50</button> <button class="button" name="send" value="/ssb edit detailsq level, 100">Set to 100</button><br/>';
	output += '<i>Gender: </i>' + WL.ssb[userid].gender + ' | <button name="send" value="/ssb edit detailsq gender, male" class="button">Set to Male</button> <button name="send" value="/ssb edit detailsq gender, female" class="button">Set to Female</button> <button class="button" name="send" value="/ssb edit detailsq gender, random">Set to Random</button> <button name="send" value="/ssb edit detailsq gender, genderless" class="button">Set to Genderless</button><br/>';
	output += '<i>Happiness: </i>' + WL.ssb[userid].happiness + ' | <button name="send" value="/ssb edit details happiness, 0" class="button">Set to 0</button> <button class="button" name="send" value="/ssb edit details happiness, 255">Set to 255</button> <button name="send" value="/ssb edit details happiness" class="button">Set to custom value</button><br/>';
	output += '<i>Shiny?:</i> | ' + (WL.ssb[userid].canShiny ? '<button name="send" value="/ssb edit details shiny" class="button">Toggle Shiny</button>' : '<button name="send" value="/shop" class="button">Purchase</button>') + ' | <i>Custom Symbol: </i>' + (WL.ssb[userid].cSymbol ? ('' + WL.ssb[userid].symbol + ' <button class="button" name="send" value="/ssb edit details symbol">Change</button>') : '<button class="button" name="send value="/shop">Purchase</button>') + ' | <button class="button" name="send" value="/ssb edit main">Main Menu</button></div>';
	return output;
}

function customMenu() {
	let output = '<div class="setchart" style="text-align:center; height:140px"><div style="max-height: 135px; overflow-y: scroll"><h3><u>Custom Moves</u></h3><button class="button" name="send" value="/ssb edit main">Main Menu</button>';
	for (let i = 0; i < customMovepool.length; i++) {
		output += '<div><b><u>' + customMovepool[i] + '</u></b>: Type: <i>' + typeList[i] + '</i>, Description: <button class="button" name="send" value="/dt ' + customMovepool[i] + ', cssb">Effects</button><button class="button" name="send" value="/ssb edit move custom, ' + customMovepool[i] + '">Set as custom move</button></div><br/>';
	}
	output += '<button class="button" name="send" value="/ssb edit main">Main Menu</button></div></div>';
	return output;
}

class SSB {
	constructor(userid, name) {
		this.userid = userid;
		this.name = name; //exact name of the users, and name that appears in battle.
		this.symbol = ' ';
		this.cSymbol = (Users(userid) ? Users(userid).group === '+' || Users(userid).isStaff : false); //Can the user set a custom symbol? Global auth get this free.
		this.gender = 'random'; //M, F, random (M or F), N
		this.shiny = false;
		this.canShiny = false; //Can the user set their pokemon as shiny?
		this.happiness = 255; //max is default
		this.level = 100; //max is default
		this.species = 'Unown';
		this.item = false; //false = no item
		this.cItem = false; //set this to the users cItem when its purchased and implemented.
		this.bought = {}; //Did you buy something, but not recieve it yet? prevents duplicate purchases.
		this.ability = 'Levitate'; //Default to the first ability of the selected species
		this.cAbility = false; //set this to the users cAbility when its purchased and implemented.
		this.movepool = []; //Pool of normal moves, draw 3 from here (4 if no c move).
		this.cMove = false; //Custom move
		this.selfCustomMove = false; //set this to the users custom-made cuatom move when its purchased and implemented.
		this.evs = {
			hp: 0,
			atk: 0,
			def: 0,
			spa: 0,
			spd: 0,
			spe: 0,
		};
		this.ivs = {
			hp: 31,
			atk: 31,
			def: 31,
			spa: 31,
			spd: 31,
			spe: 31,
		};
		this.nature = 'Serious';
		this.active = false; //If true, this pokemon can appear in the tier.
	}

	setSpecies(species) {
		let speciesId = toId(species);
		let speciesNum = parseInt(speciesId);
		if (!isNaN(speciesNum)) {
			for (let p in Dex.data.Pokedex) {
				let pokemon = Dex.getTemplate(p);
				if (pokemon.num === speciesNum) {
					species = pokemon.species;
					speciesId = pokemon.id;
					break;
				}
			}
		}
		species = Dex.getTemplate(speciesId);
		if (!species.exists) return false;
		if (!species.learnset && species.id !== 'oricoriosensu' && species.id !== 'oricoriopau' && species.id !== 'oricoriopompom') return false;
		if (species.gen < 1) return false;
		if (species.battleOnly) return false;
		if (BANS.tiers.includes(species.tier)) return false;
		this.species = species.species;
		// Reset everything
		this.ability = species.abilities['0'];
		this.movepool = [];
		for (let i in this.evs) this.evs[i] = 0;
		for (let j in this.ivs) this.ivs[j] = 31;
		this.level = 100;
		this.happiness = 255;
		this.nature = 'Serious';
		this.item = false;
		this.cMove = false;
		this.active = false;
		return true;
	}

	updateName(name) {
		this.name = name;
	}

	setGender(gender) {
		switch (toId(gender)) {
		case 'm':
		case 'boy':
		case 'male':
			this.gender = 'M';
			break;
		case 'f':
		case 'girl':
		case 'female':
			this.gender = 'F';
			break;
		case 'n':
		case 'genderless':
		case 'none':
			this.gender = 'N';
			break;
		case 'random':
		case 'rand':
		case 'r':
			this.gender = 'random';
			break;
		default:
			return false;
		}
		return true;
	}

	setSymbol(symbol) {
		if (!this.cSymbol) return false;
		if (symbol === ' ' || !symbol) {
			symbol = 'none';
		} else {
			symbol = symbol.trim();
			symbol = symbol.substring(0, 1);
		}
		if (symbol.length !== 1 && symbol !== 'none') return false;
		let bannedSymbols = ['+', '%', '@', '*', '\u2605', '#', '&', '~', '|', ',', "'", '"', '\u5350', '\u534D', '\u2030', '\u005C'];
		let rmt = bannedSymbols.indexOf(Users(this.userid).group);
		if (rmt > -1) {
			for (rmt; rmt > -1; rmt--) bannedSymbols.splice(rmt, 1); //G staff may use equal or lower ranked symbols
		}
		if (bannedSymbols.indexOf(symbol) > -1) return false;
		if (symbol === 'none') symbol = ' ';
		this.symbol = symbol;
		return true;
	}

	setShiny() {
		if (!this.canShiny) return false;
		this.shiny = !this.shiny;
		return true;
	}

	setHappiness(lvl) {
		if (lvl < 0 || lvl > 255) return false;
		this.happiness = lvl;
		return true;
	}

	setLevel(lvl) {
		if (lvl < 1 || lvl > 100) return false;
		this.level = lvl;
		return true;
	}

	setItem(item) {
		item = Dex.getItem(toId(item));
		if (!item.exists) {
			//check custom
			if (this.cItem && toId(this.cItem) === item.id && this.bought.cItem) {
				this.item = this.cItem;
				return true;
			} else {
				return false;
			}
		} else {
			this.item = item.name;
		}
		return true;
	}

	setAbility(ability) {
		ability = Dex.getAbility(toId(ability));
		if (!ability.exists) {
			//check custom
			if (this.cAbility && toId(this.cAbility) === ability.id && this.bought.cAbility) {
				this.ability = this.cAbility;
				return true;
			} else {
				return false;
			}
		} else {
			for (let i in Dex.getTemplate(this.species).abilities) {
				if (toId(Dex.getTemplate(this.species).abilities[i]) === ability.id) {
					this.ability = ability.name;
					return true;
				}
			}
			return false;
		}
	}

	async addMove(move, self) {
		move = Dex.getMove(toId(move));
		if (!move.exists) return self.errorReply('The move "' + move.name + '" does not exist.'); //Only normal moves here.
		if (this.movepool.length + (this.cMove === false ? 0 : 1) >= MAX_MOVEPOOL_SIZE) return self.errorReply('You already have ' + MAX_MOVEPOOL_SIZE + ' moves.');
		let result = await TeamValidatorAsync('gen7ou').validateTeam(Dex.packTeam([{species: this.species, ability: this.ability, moves: [move]}]));
		if (result.substring(0, 1) === '0') return self.errorReply(this.species + ' cannot learn ' + move.name + '.');
		if (this.movepool.indexOf(move.name) > -1) return self.errorReply(this.species + ' already knows ' + move.name + '.');
		this.movepool.push(move.name);
		writeSSB();
		if (self.cmd !== 'moveq') self.sendReply('Added the move ' + move.name + ' to your movepool.');
		return self.user.sendTo(self.room, '|uhtmlchange|ssb' + self.user.userid + '|' + buildMenu(self.user.userid));
	}

	removeMove(move) {
		move = Dex.getMove(toId(move));
		if (move.exists) {
			if (this.movepool.length < 1) return false;
			if (this.movepool.indexOf(move.name) === -1) return false;
			this.movepool.splice(this.movepool.indexOf(move.name), 1);
			return true;
		} else {
			//check custom
			if (move.id !== toId(this.cMove)) return false;
			this.cMove = false;
			return true;
		}
	}

	setCustomMove(move) {
		move = toId(move);
		let customIds = customMovepool.map(move => { return toId(move); });
		if (customIds.indexOf(move) < 0) {
			//check for self-made custom move
			if (this.selfCustomMove && toId(this.selfCustomMove) === move && this.bought.cMove) {
				this.cMove = this.selfCustomMove;
				return true;
			} else {
				return false;
			}
		}
		this.cMove = customMovepool[customIds.indexOf(move)];
		return true;
	}

	setEvs(ev, value) {
		ev = toId(ev);
		value = parseInt(value);
		if (isNaN(value)) return false;
		if (!this.evs[ev] && this.evs[ev] !== 0) return false;
		let currentVal = 0;
		//let targetVal = this.evs[ev]; //Unused variable
		for (let i in this.evs) {
			if (i === ev) continue;
			currentVal += this.evs[i];
		}
		if (value > 255 || value < 0 || currentVal + value > 510) return false;
		this.evs[ev] = value;
		return true;
	}

	setIvs(iv, value) {
		iv = toId(iv);
		value = parseInt(value);
		if (isNaN(value)) return false;
		if (!this.ivs[iv] && this.ivs[iv] !== 0) return false;
		if (value < 0 || value > 31) return false;
		this.ivs[iv] = value;
		return true;
	}

	setNature(nature) {
		nature = Dex.getNature(toId(nature));
		if (!nature.exists) return false;
		this.nature = nature.name;
		return true;
	}

	async activate(self) {
		let valid = await this.validate(self, true);
		if (valid.length === 0) {
			this.active = !this.active;
			if (this.active) {
				self.user.sendTo(self.room, '|uhtmlchange|ssb' + self.user.userid + '|' + buildMenu(self.user.userid));
				self.sendReply('Your pokemon was activated! Your pokemon will appear in battles once the server restarts.');
			} else {
				self.user.sendTo(self.room, '|uhtmlchange|ssb' + self.user.userid + '|' + buildMenu(self.user.userid));
				self.sendReply('Your pokemon was deactivated. Your pokemon will no longer appear in battles once the server restarts.');
			}
			return true;
		}
		this.active = false;
		self.user.sendTo(self.room, '|uhtmlchange|ssb' + self.user.userid + '|' + buildMenu(self.user.userid));
		self.sendReply('Your pokemon was deactivated. Your pokemon will no longer appear in battles once the server restarts.');
		return false;
	}

	async validate(self, quiet) {
		let dex = Dex.mod('cssb');
		let msg = [];
		// Species
		let pokemon = dex.getTemplate(this.species);
		if (!pokemon.exists) {
			msg.push(`The pokemon ${this.species} does not exist.`);
			this.setSpecies('Unown');
			this.active = false;
			writeSSB();
			return msg;
		}
		if (BANS.pokemon.includes(pokemon.species) || BANS.tiers.includes(pokemon.tier)) {
			msg.push((BANS.pokemon.includes(pokemon.species) ? `${pokemon.species} is banned.` : `${pokemon.species} is in ${pokemon.tier} which is banned.`));
			this.setSpecies('Unown');
			this.active = false;
			writeSSB();
			return msg;
		}
		// Ability
		let ability = dex.getAbility(this.ability);
		if (!ability.exists || BANS.abilities.includes(this.ability) ||
		(!Dex.getAbility(this.ability).exists && toId(this.cAbility) !== ability.id)) {
			msg.push((!ability.exists ? `The ability ${ability.id} does not exist.` : (BANS.abilities.includes(this.ability) ? `The ability ${ability.name} is banned.` : `${ability.name} is not your custom ability.`)));
			this.ability = pokemon.abilities[0];
		}
		// Item
		if (toId(this.item)) {
			let item = dex.getItem(this.item);
			if (!item.exists || BANS.items.includes(this.item) ||
			(!Dex.getItem(this.item).exists && toId(this.cItem !== item.id))) {
				msg.push((!ability.exists ? `The item ${item.id} does not exist.` : (BANS.items.includes(this.item) ? `The item ${item.name} is banned.` : `${item.name} is not your custom item.`)));
				this.item = '';
			}
			// Mega evolution check
			if (item.megaStone && item.megaEvolves === pokemon.species) {
				let mega = dex.getTemplate(item.megaStone);
				if (BANS.pokemon.includes(mega.species) || BANS.tiers.includes(mega.tier)) {
					msg.push((BANS.pokemon.includes(mega.species) ? `${mega.name} is banned.` : `${mega.name} is in ${mega.tier} which is banned.`));
					this.item = '';
				}
			}
		}
		// Level, Symbol, Shiny, Gender, and Happiness
		if (this.level < 1 || this.level > 100) {
			this.level = (this.level < 0 ? 0 : 100);
			msg.push(`${pokemon.species}'s level was invalid.`);
		}
		if (this.symbol !== ' ' && !this.cSymbol) this.symbol = ' ';
		if (this.shiny && !this.canShiny) this.shiny = false;
		if (!['M', 'F', 'N', 'random'].includes(this.gender)) this.gender = 'random';
		if (this.happiness < 0 || this.happiness > 255) {
			this.happiness = (this.happiness < 0 ? 0 : 255);
			msg.push(`${pokemon.species}'s' happiness was invalid.`);
		}
		// Moves
		if (this.movepool.length) {
			for (let i = 0; i < this.movepool.length; i++) {
				let move = dex.getMove(this.movepool[i]);
				if (!move.exists) {
					msg.push(`The move ${move.id} does not exist.`);
					this.movepool.splice(i, 1);
					i--;
					continue;
				}
				let result = await TeamValidatorAsync('gen7ou').validateTeam(Dex.packTeam([{species: this.species, ability: this.ability, moves: [move]}]));
				if (result.startsWith('0')) {
					result = result.slice(1);
					msg.push(result.split('\n'));
					this.movepool.splice(i, 1);
					i--;
					continue;
				}
				if (BANS.moves.includes(move.name) || move.ohko) {
					msg.push(`The move ${move.name} is banned from SSBFFA.`);
					this.movepool.splice(i, 1);
					i--;
					continue;
				}
			}
		}
		// Custom move
		if (this.cMove) {
			let move = dex.getMove(this.cMove);
			if (!move.exists || Dex.getMove(move.id).exists) {
				msg.push(`${move.name} is not a custom move.`);
				this.cMove = '';
			} else if (!customMovepool.includes(move.name)) {
				// Purchased custom move
				if (toId(this.selfCustomMove) !== move.id) {
					msg.push(`${pokemon.species}'s custom move ${move.name} is not your custom move.`);
					this.cMove = '';
				}
			}
		}
		// EVs
		let edited = false;
		let totalEvs = 0;
		for (let ev in this.evs) {
			if (this.evs[ev] < 0 || this.evs[ev] > 252) {
				this.evs[ev] = (this.evs[ev] < 0 ? 0 : 252);
				edited = true;
			}
			totalEvs += this.evs[ev];
		}
		if (totalEvs > 510) msg.push(`${pokemon.species} has more than 510 EVs.`);
		if (edited) msg.push(`${pokemon.species}'s EVs were invalid.`);
		edited = false;
		// IVs
		for (let iv in this.ivs) {
			if (this.ivs[iv] < 0 || this.ivs[iv] > 31) {
				this.ivs[iv] = (this.ivs[iv] < 0 ? 0 : 31);
				edited = true;
			}
		}
		if (edited) msg.push(`${pokemon.species}'s IVs were invalid.`);
		if (msg.length) {
			this.active = false;
			if (Users(toId(this.name))) Users(toId(this.name)).popup(`Your SSBFFA pokemon was deactivated for the following reasons:\n${msg.join('\n')}`);
			if (!quiet) self.errorReply(`Done! ${this.name}'s SSBFFA pokemon was deactivated, and its invalid parts were reset to their defaults.`);
		} else {
			if (!quiet) self.sendReply(`Done! ${this.name}'s SSBFFA pokemon is valid.`);
		}
		writeSSB();
		return msg;
	}
}

//Load JSON
try {
	fs.accessSync('config/ssb.json', fs.F_OK);
} catch (e) {
	fs.writeFile('config/ssb.json', "{}", function (err) {
		if (err) {
			console.error('Error while loading SSBFFA: ' + err);
			ssbWrite = false;
		} else {
			console.log("config/ssb.json not found, creating a new one...");
		}
	});
	noRead = true;
}

//We need to load data after the SSB class is declared.
try {
	if (!noRead) {
		let raw = JSON.parse(fs.readFileSync('config/ssb.json', 'utf8'));
		WL.ssb = global.ssb = {};
		//parse JSON back into the SSB class.
		for (let key in raw) {
			WL.ssb[key] = new SSB(raw[key].userid, raw[key].name);
			for (let key2 in WL.ssb[key]) {
				WL.ssb[key][key2] = raw[key][key2];
			}
		}
	} else {
		WL.ssb = global.ssb = {};
	}
} catch (e) {
	console.error('Error loading SSBFFA: ' + e.stack);
	WL.ssb = global.ssb = {};
	ssbWrite = false;
}

exports.commands = {
	ssb: {
		edit: {
			main: '',
			'': function (target, room, user, connection, cmd, message) {
				if (!user.named) return this.errorReply('You must choose a name first.');
				if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
				if (!WL.ssb[user.userid]) {
					this.sendReply('Could not find your SSB pokemon, creating a new one...');
					WL.ssb[user.userid] = new SSB(user.userid, user.name);
					writeSSB();
				}
				let targetUser = WL.ssb[user.userid];
				targetUser.updateName(user.name);
				if (cmd === '') {
					return user.sendTo(room, '|uhtml|ssb' + user.userid + '|' + buildMenu(user.userid));
				} else {
					return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
				}
			},
			speciesq: 'species',
			species: function (target, room, user, connection, cmd, message) {
				if (!user.named) return this.errorReply('You must choose a name first.');
				if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
				if (!WL.ssb[user.userid]) {
					this.sendReply('Could not find your SSB pokemon, creating a new one...');
					WL.ssb[user.userid] = new SSB(user.userid, user.name);
					writeSSB();
				}
				let targetUser = WL.ssb[user.userid];
				if (toId(target) === '') return this.sendReply('/ssb edit species [species] - change the species of your SSB pokemon.');
				let active = targetUser.active;
				if (!targetUser.setSpecies(target)) {
					return this.errorReply('The pokemon ' + target + ' does not exist or is banned from SSBFFA. Check your spelling?');
				} else {
					writeSSB();
					if (active) this.sendReply('Your pokemon was deactivated becuase it now has 0 moves.');
					if (cmd !== 'speciesq') this.sendReply('Your pokemon was set as a ' + targetUser.species);
					return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
				}
			},
			moveq: 'move',
			move: function (target, room, user, connection, cmd, message) {
				if (!user.named) return this.errorReply('You must choose a name first.');
				if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
				if (!WL.ssb[user.userid]) {
					this.sendReply('Could not find your SSB pokemon, creating a new one...');
					WL.ssb[user.userid] = new SSB(user.userid, user.name);
					writeSSB();
				}
				let targetUser = WL.ssb[user.userid];
				target = target.split(',');
				if (!toId(target[0])) return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + moveMenu(user.userid));
				if (toId(target[0]) === 'help') return this.sendReply('/ssb edit move [set|remove|custom], [move name] - Set or remove moves. Maximum of 4 moves (3 regular + 1 custom OR 4 regular).');
				switch (target[0]) {
				case 'set':
					//set a normal move
					return targetUser.addMove(target[1], this);
					//break;
				case 'remove':
					//remove a move
					if (targetUser.removeMove(target[1])) {
						writeSSB();
						if (cmd !== 'moveq') this.sendReply('Removed the move ' + target[1] + ' from your movepool.');
						if (targetUser.movepool.length === 0 && !targetUser.cMove && targetUser.active) {
							targetUser.active = false;
							this.sendReply('Your pokemon was deactivated becuase it now has 0 moves.');
						}
						return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
					} else {
						return this.errorReply('You do not have the move ' + target[1] + ' in your movepool, or set as your custom move.');
					}
					//break;
				case 'custom':
					//set the custom move
					if (targetUser.setCustomMove(target[1])) {
						writeSSB();
						if (cmd !== 'moveq') this.sendReply('Your custom move has been set to ' + target[1] + '.');
						return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
					} else {
						return this.errorReply(target[1] + ' is either not a custom move, or not a custom move you can use.');
					}
					//break;
				default:
					return this.sendReply('/ssb edit move [set|custom], movename. Or use /ssb edit move to access the move menu.');
				}
			},
			statsq: 'stats',
			stats: function (target, room, user, connection, cmd, message) {
				if (!user.named) return this.errorReply('You must choose a name first.');
				if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
				if (!WL.ssb[user.userid]) {
					this.sendReply('Could not find your SSB pokemon, creating a new one...');
					WL.ssb[user.userid] = new SSB(user.userid, user.name);
					writeSSB();
				}
				let targetUser = WL.ssb[user.userid];
				//temp
				if (toId(target) === '') return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + statMenu(user.userid));
				if (toId(target) === 'help') return this.sendReply('/ssb edit stats [ev|iv|nature], [stat|nature], (value) - Set your pokemon\'s evs, ivs, or nature.');
				if (toId(target) === 'naturehelp') return this.sendReply('/ssb edit stats nature, [nature] - Set your pokemon\'s nature.');
				target = target.split(',');
				if (!target[1] && !target[2]) return this.sendReply('/ssb edit stats [ev|iv|nature], [stat|nature], (value) - Set your pokemon\'s evs, ivs, or nature.');
				switch (toId(target[1])) {
				case 'healthpoints':
					target[1] = 'hp';
					break;
				case 'attack':
					target[1] = 'atk';
					break;
				case 'defense':
					target[1] = 'def';
					break;
				case 'specialattack':
					target[1] = 'spa';
					break;
				case 'specialdefense':
					target[1] = 'spd';
					break;
				case 'speed':
					target[1] = 'spe';
					break;
				}
				switch (toId(target[0])) {
				case 'ev':
				case 'evs':
					if (!target[2]) return this.sendReply('/ssb edit stats [ev|iv|nature], [stat|nature], (value) - Set your pokemon\'s evs, ivs, or nature.');
					if (targetUser.setEvs(target[1], target[2])) {
						writeSSB();
						if (cmd !== 'statsq') this.sendReply(target[1] + ' EV was set to ' + target[2] + '.');
						return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + statMenu(user.userid));
					} else {
						return this.errorReply('Unable to set ' + target[1] + ' EV to ' + target[2] + '. Check to make sure your EVs dont exceed 510 total.');
					}
					//break;
				case 'iv':
				case 'ivs':
					if (!target[2]) return this.sendReply('/ssb edit stats [ev|iv|nature], [stat|nature], (value) - Set your pokemon\'s evs, ivs, or nature.');
					if (targetUser.setIvs(target[1], target[2])) {
						writeSSB();
						if (cmd !== 'statsq') this.sendReply(target[1] + ' IV was set to ' + target[2] + '.');
						return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + statMenu(user.userid));
					} else {
						return this.errorReply('Make sure your IVs are between 0 and 31 and that you spelled the stat name correctly.');
					}
					//break;
				case 'nature':
					if (targetUser.setNature(target[1])) {
						writeSSB();
						if (cmd !== 'statsq') this.sendReply('Your pokemon\'s nature was set to ' + target[1] + '.');
						return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + statMenu(user.userid));
					} else {
						return this.errorReply(target[1] + ' is not a valid nature.');
					}
					//break;
				default:
					return this.sendReply('/ssb edit stats [ev|iv|nature], [stat|nature], (value) - Set your pokemon\'s evs, ivs, or nature.');
				}
			},
			abilityq: 'ability',
			ability: function (target, room, user, connection, cmd, message) {
				if (!user.named) return this.errorReply('You must choose a name first.');
				if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
				if (!WL.ssb[user.userid]) {
					this.sendReply('Could not find your SSB pokemon, creating a new one...');
					WL.ssb[user.userid] = new SSB(user.userid, user.name);
					writeSSB();
				}
				let targetUser = WL.ssb[user.userid];
				if (toId(target) === '') return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + abilityMenu(user.userid));
				if (toId(target) === 'help') return this.sendReply('/ssb edit ability [ability] - Set your pokemon\'s ability.');
				if (targetUser.setAbility(target)) {
					writeSSB();
					if (cmd !== 'abilityq') this.sendReply('Your pokemon\'s ability is now ' + target + '.');
					return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
				} else {
					this.errorReply(target + ' could not be set as your pokemon\'s ability because it is not a legal ability for ' + targetUser.species + ', and it is not your custom ability.');
				}
			},
			itemq: 'item',
			item: function (target, room, user, connection, cmd, message) {
				if (!user.named) return this.errorReply('You must choose a name first.');
				if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
				if (!WL.ssb[user.userid]) {
					this.sendReply('Could not find your SSB pokemon, creating a new one...');
					WL.ssb[user.userid] = new SSB(user.userid, user.name);
					writeSSB();
				}
				let targetUser = WL.ssb[user.userid];
				if (toId(target) === '') return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + itemMenu(user.userid));
				if (toId(target) === 'help') return this.sendReply('/ssb edit item [item] - Set your pokemon\'s item.');
				if (toId(target) === 'reset') {
					targetUser.item = false;
					writeSSB();
					if (cmd !== 'itemq') this.sendReply('Your item was reset.');
					return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
				}
				if (!targetUser.setItem(target)) {
					return this.errorReply('The item ' + target + ' does not exist or is banned from SSBFFA.');
				} else {
					writeSSB();
					if (cmd !== 'itemq') return this.sendReply('Your pokemon\'s item was set to ' + target + '.');
					return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
				}
			},
			detailsq: 'details',
			details: function (target, room, user, connection, cmd, message) {
				if (!user.named) return this.errorReply('You must choose a name first.');
				if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
				if (!WL.ssb[user.userid]) {
					this.sendReply('Could not find your SSB pokemon, creating a new one...');
					WL.ssb[user.userid] = new SSB(user.userid, user.name);
					writeSSB();
				}
				let targetUser = WL.ssb[user.userid];
				if (toId(target) === '') return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + detailMenu(user.userid));
				if (toId(target) === 'help') return this.sendReply('/ssb edit details [level|gender|happiness|shiny], (argument) - edit your pokemon\'s details.');
				target = target.split(',');
				switch (toId(target[0])) {
				case 'level':
				case 'lvl':
					if (!target[1]) return this.parse('/ssb edit details help');
					if (targetUser.setLevel(target[1])) {
						writeSSB();
						if (cmd !== 'detailsq') this.sendReply('Your pokemon\'s level was set to ' + target[1] + '.');
						return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + detailMenu(user.userid));
					} else {
						return this.errorReply('Levels must be greater than or equal to 1, and less than or equal to 100.');
					}
					//break;
				case 'gender':
					if (!target[1]) return this.parse('/ssb edit details help');
					if (targetUser.setGender(target[1])) {
						writeSSB();
						if (cmd !== 'detailsq') this.sendReply('Your pokemon\'s gender was set to ' + target[1] + '.');
						return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + detailMenu(user.userid));
					} else {
						return this.errorReply('Valid pokemon genders are: Male, Female, random, and genderless.');
					}
					//break;
				case 'happiness':
				case 'happy':
					if (!target[1]) return this.parse('/ssb edit details help');
					if (targetUser.setHappiness(target[1])) {
						writeSSB();
						if (cmd !== 'detailsq') this.sendReply('Your pokemon\'s happiness level was set to ' + target[1] + '.');
						return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + detailMenu(user.userid));
					} else {
						return this.errorReply('Happiness levels must be greater than or equal to 0, and less than or equal to 255.');
					}
					//break;
				case 'shinyness':
				case 'shiny':
					if (targetUser.setShiny()) {
						writeSSB();
						if (cmd !== 'detailsq') this.sendReply('Your pokemon\'s shinyness was toggled.');
						return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + buildMenu(user.userid));
					} else {
						return this.errorReply('You must purchase this from the shop first!');
					}
					//break;
				case 'symbol':
				case 'csymbol':
				case 'customsymbol':
					if (!target[1]) return this.sendReply('/ssb edit details symbol, [symbol] - Change your pokemon\'s custom symbol, global auth can use auth symbols of equal or lower ranks.');
					if (targetUser.setSymbol(target[1])) {
						writeSSB();
						if (cmd !== 'detailsq') this.sendReply('Your symbol is now ' + target[1] + '.');
						return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + detailMenu(user.userid));
					} else {
						return this.errorReply('Unable to set your custom symbol. Be sure your not using an illegal staff symbol.');
					}
					//break;
				default:
					return this.sendReply('/ssb edit details [level|gender|happiness|shiny], (argument) - edit your pokemon\'s details.');
				}
			},
		},
		toggle: function (target, room, user, connection, cmd, message) {
			if (!user.named) return this.errorReply('You must choose a name first.');
			if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
			if (!WL.ssb[user.userid]) {
				this.sendReply('Could not find your SSB pokemon, creating a new one...');
				WL.ssb[user.userid] = new SSB(user.userid, user.name);
				writeSSB();
				return this.sendReply('Your new SSB pokemon is not active, you should edit it before activating.');
			}
			WL.ssb[user.userid].activate(this);
		},
		custommoves: 'custom',
		cmoves: 'custom',
		custom: function (target, room, user, connection, cmd, message) {
			if (!user.named) return this.errorReply('You must choose a name first.');
			if (user.locked) return this.errorReply('You cannot edit you SSB pokemon while locked.');
			if (!WL.ssb[user.userid]) {
				this.sendReply('Could not find your SSB pokemon, creating a new one...');
				WL.ssb[user.userid] = new SSB(user.userid, user.name);
				writeSSB();
			}
			return user.sendTo(room, '|uhtmlchange|ssb' + user.userid + '|' + customMenu());
		},
		log: function (target, room, user, connection, cmd, message) {
			if (!target) target = (user.can('ssb') ? 'view, all' : 'view, ' + user.userid);
			target = target.split(',');
			switch (target[0]) {
			case 'view':
				if (!target[1]) target[1] = (user.can('ssb') ? 'all' : user.userid);
				if (toId(target[1]) !== user.userid && !user.can('ssb')) return this.errorReply('You can only view your own SSBFFA purchases.');
				let output = '<div style="max-height: 300px; overflow: scroll; width: 100%"><table><tr><th style="border: 1px solid black">Name</th><th style="border: 1px solid black">Item</th><th style="border: 1px solid black">Status</th>';
				if (toId(target[1]) === 'all') {
					output += '<th style="border: 1px solid black">Options</th><tr/>';
					for (let i in WL.ssb) {
						for (let j in WL.ssb[i].bought) {
							let buttons = '<button class="button" name="send" value="/ssb log mark, ' + WL.ssb[i].userid + ', ' + j + ', complete">Mark as Complete</button><button class="button" name="send" value="/ssb log mark, ' + WL.ssb[i].userid + ', ' + j + ', pending">Mark as Pending</button><button class="button" name="send" value="/ssb log mark, ' + WL.ssb[i].userid + ', ' + j + ', remove"><span style="color:red">Remove this purchase</span</button>';
							output += '<tr><td style="border: 1px solid black">' + WL.ssb[i].name + '</td><td style="border: 1px solid black">' + j + '</td><td style="border: 1px solid black">' + (WL.ssb[i].bought[j] ? (WL.ssb[i].bought[j] === 'complete' ? 'Complete' : 'Pending') : 'Removed') + '</td><td style="border: 1px solid black">' + buttons + '</td></tr>';
						}
					}
				} else {
					target[1] = toId(target[1]);
					if (!WL.ssb[target[1]]) return this.errorReply(target[1] + ' does not have a SSBFFA pokemon yet.');
					if (user.can('ssb')) {
						output += '<th style="border: 1px solid black">Options</th><tr/>';
						for (let j in WL.ssb[target[1]].bought) {
							let buttons = '<button class="button" name="send" value="/ssb log mark, ' + WL.ssb[target[1]].userid + ', ' + j + ', complete">Mark as Complete</button><button class="button" name="send" value="/ssb log mark, ' + WL.ssb[target[1]].userid + ', ' + j + ', pending">Mark as Pending</button><button class="button" name="send" value="/ssb log mark, ' + WL.ssb[target[1]].userid + ', ' + j + ', remove"><span style="color:red">Remove this purchase</span</button>';
							output += '<tr><td style="border: 1px solid black">' + WL.ssb[target[1]].name + '</td><td style="border: 1px solid black">' + j + '</td><td style="border: 1px solid black">' + (WL.ssb[target[1]].bought[j] ? (WL.ssb[target[1]].bought[j] === 'complete' ? 'Complete' : 'Pending') : 'Removed') + '</td><td style="border: 1px solid black">' + buttons + '</td></tr>';
						}
					} else {
						output += '</tr>';
						for (let j in WL.ssb[target[1]].bought) {
							output += '<tr><td style="border: 1px solid black">' + WL.ssb[target[1]].name + '</td><td style="border: 1px solid black">' + j + '</td><td style="border: 1px solid black">' + (WL.ssb[target[1]].bought[j] ? (WL.ssb[target[1]].bought[j] === 'complete' ? 'Complete' : 'Pending') : 'Removed') + '</td></tr>';
						}
					}
				}
				return this.sendReplyBox(output);
				//break;
			case 'mark':
				if (!user.can('ssb')) return this.errorReply('/sbb mark - Access Denied.');
				if (!target[3]) return this.parse('/help ssb log');
				target[1] = toId(target[1]);
				target[2] = target[2].trim();
				target[3] = toId(target[3]);
				if (!WL.ssb[target[1]]) return this.errorReply(target[1] + ' does not have a SSBFFA pokemon yet.');
				if (WL.ssb[target[1]].bought[target[2]] === undefined) return this.parse('/help ssb log');
				switch (target[3]) {
				case 'complete':
					if (WL.ssb[target[1]].bought[target[2]] === target[3]) return this.errorReply(target[1] + '\'s ' + target[2] + ' is already ' + target[3] + '.');
					WL.ssb[target[1]].bought[target[2]] = 'complete';
					writeSSB();
					return this.sendReply(target[1] + '\'s ' + target[2] + ' was marked as complete.');
					//break;
				case 'pending':
					if (WL.ssb[target[1]].bought[target[2]] === true) return this.errorReply(target[1] + '\'s ' + target[2] + ' is already ' + target[3] + '.');
					WL.ssb[target[1]].bought[target[2]] = true;
					writeSSB();
					return this.sendReply(target[1] + '\'s ' + target[2] + ' was marked as pending.');
					//break;
				case 'remove':
					if (WL.ssb[target[1]].bought[target[2]] === false) return this.errorReply(target[1] + '\'s ' + target[2] + ' is already removed.');
					if (!target[4] || toId(target[4]) !== 'force') return this.sendReply('WARNING. If you remove this purchase the user will not be able to use their ' + target[2] + ' and the user will not be refunded (unless you provide it). If you are sure you want to do this, run: /ssb log mark, ' + target[1] + ', ' + target[2] + ', ' + target[3] + ', force');
					WL.ssb[target[1]].bought[target[2]] = false;
					writeSSB();
					return this.sendReply(target[1] + '\'s ' + target[2] + ' was removed.');
					//break;
				default:
					return this.parse('/help ssb log');
				}
				//break;
			default:
				return this.parse('/help ssb log');
			}
		},
		loghelp: ['/ssb log - Accepts the following commands:',
			'/ssb log view, [all|user] - View the purchases of a user or all users. Requires &, ~ unless viewing your own.',
			'/ssb log mark, [user], [cItem|cAbility|cMove], [complete|pending|remove] - Update the status for a users SSBFFA purchase.',
		],
		forceupdate: 'validate',
		validateall: 'validate',
		validate: function (target, room, user, connection, cmd, message) {
			if (!this.can('ssb')) return;
			if (!target && toId(cmd) !== 'validateall') return this.parse('/help ssb validate');
			let targetUser = WL.ssb[toId(target)];
			if (!targetUser && toId(cmd) !== 'validateall') return this.errorReply(target + ' does not have a SSBFFA pokemon yet.');
			//Start validation.
			if (toId(cmd) !== 'validateall') {
				this.sendReply('Validating ' + targetUser.name + '\'s SSBFFA pokemon...');
				targetUser.validate(this);
			} else {
				for (let key in WL.ssb) {
					WL.ssb[key].validate(this, true);
				}
				return this.sendReply('All SSBFFA pokemon have been validated.');
			}
		},
		validatehelp: ['/ssb validate [user] - Validate a users SSBFFA pokemon and if anything invalid is found, set it to its default value. Requires: &, ~'],

		setcmove: function (target, room, user, connection, message) {
			if (!this.can('ssb')) return false;
			if (!target) return this.parse('/help ssb setcmove');
			let targets = target.split(',');
			let userid = toId(targets[0]);
			if (!userid) return this.parse('/help ssb setcmove');
			let customMove = toId(targets[1]);
			if (!customMove) return this.errorReply('Must include a move!');
			if (!Dex.mod('cssb').getMove(customMove).exists) return this.errorReply("Move doesn't exist in the ssbffa mod!");
			if (!WL.ssb[userid].bought.cMove) return this.errorReply('They have not bought a custom move!');
			WL.ssb[userid].selfCustomMove = customMove;
			writeSSB();
			return this.sendReply('Move set for ' + userid + '!');
		},
		setcmovehelp: ['/ssb setcmove targetUser, move'],

		setcability: function (target, room, user, connection, message) {
			if (!this.can('ssb')) return false;
			if (!target) return this.parse('/help ssb setcability');
			let targets = target.split(',');
			let userid = toId(targets[0]);
			if (!userid) return this.errorReply('/help ssb setcability');
			let customAbility = toId(targets[1]);
			if (!customAbility) return this.errorReply('/ssb giveability target, ability');
			if (!Dex.mod('cssb').getAbility(customAbility).exists) return this.errorReply("Ability doesn't exist in the ssbffa mod!");
			if (!WL.ssb[userid].bought.cAbility) return this.errorReply('They have not bought a custom ability!');
			WL.ssb[userid].cAbility = customAbility;
			writeSSB();
			return this.sendReply('Ability set for ' + userid + '!');
		},
		setcabilityhelp: ['/ssb setcmove targetUser, ability'],

		setcitem: function (target, room, user, connection, cmd, message) {
			if (!this.can('ssb')) return false;
			if (!target) return this.parse('/help ssb setcitem');
			let targets = target.split(',');
			let userid = toId(targets[0]);
			if (!userid) return this.errorReply('/help ssb givecitem');
			let item = toId(targets[1]);
			if (!item) return this.errorReply('Must include an item');
			if (!Dex.mod('cssb').getItem(item).exists) return this.errorReply("Item doesn't exist in the ssbffa mod!");
			if (!WL.ssb[userid].bought.cItem) return this.errorReply('They have not bought a custom item!');
			WL.ssb[userid].cItem = item;
			writeSSB();
			return this.sendReply('Item set for ' + userid + '!');
		},
		setcitemhelp: ['/ssb setcitem targetUser, item'],

		'': function (target, room, user, connection, cmd, message) {
			return this.parse('/help ssb');
		},
	},
	ssbhelp: ['/ssb - Commands for editing your custom super staff bros pokemon. Includes the following commands: ',
		'/ssb edit - pulls up the general menu, allowing you to edit species and contains buttons to access other menus.',
		'/ssb edit species - change the pokemon\'s species, not a menu',
		'/ssb edit move - pulls up the move selection menu, allowing selection of 16 pre-created custom moves (1 per type) and (if purchased) your own custom-made custom move, as well as instructions for selecting normal moves.',
		'/ssb edit stats - pulls up the stat selection menu, allowing edits of evs, ivs, and nature.',
		'/ssb edit ability - pulls up the ability selection menu, showing the pokemons legal abilities and (if purchased) your custom ability for you to choose from.',
		'/ssb edit item - pulls up the item editing menu, giving instructions for setting a normal item, and (if purchased) a button to set your custom item.',
		'/ssb edit details - pulls up the editing menu for level, gender, (if purchased) shinyness, and (if purchased or if global auth) symbol.',
		'/ssb toggle - Attempts to active or deactive your pokemon. Acitve pokemon can be seen in the tier. If your pokemon cannot be activated, you will see a popup explaining why.',
		'/ssb custom - Shows all the default custom moves, with details.',
		'/ssb log - Shows purchase details for SSBFFA.',
		'/ssb [validate|validateall] (user) - validates a user\'s SSBFFA pokemon, or validates all SSBFFA pokemon. If the pokemon is invalid it will be fixed and decativated. Requires: &, ~',
		'Programmed by HoeenHero.',
	],
};
