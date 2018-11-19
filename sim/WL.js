'use strict';

const fs = require('fs');

exports.WL = {
	gameData: JSON.parse(fs.readFileSync('config/SGGame/pokemon.json', 'utf8')),
	itemData: JSON.parse(fs.readFileSync('config/SGGame/items.json', 'utf8')),
	/**
	* @param {Object} battle The battle object.
	* @param {String} side The side that the COM is playing on. ("p1" or "p2")
	* @param {String} type The type of action to take. (Currently supporting: "random", "trainer")
	* @return {Boolean}
	*/
	decideCOM: function (battle, side, type) {
		// Only works within a battle process
		if (!battle || !side) return false;
		if (!type) type = 'random';
		if (battle.ended) return false;
		switch (type) {
		case 'random':
			battle[side].choose('default');
			break;
		case 'trainer':
			/*
			moving: "move slot" (not 0 indexed)
			switching: "switch slot" (not 0 indexed)
			*/
			// ATM just attacks as much as possible
			switch (battle[side].currentRequest) {
			case 'move':
				if (battle[side].active[0].volatiles['mustrecharge'] || battle[side].active[0].volatiles['lockedmove'] || battle[side].active[0].volatiles['bide'] || battle[side].active[0].volatiles['twoturnmove'] || battle[side].active[0].volatiles['rollout'] || battle[side].active[0].volatiles['iceball'] || battle[side].active[0].volatiles['uproar']) return battle[side].choose('default');
				let moves = battle[side].pokemon[0].moves.slice(0);
				let best = {slot: 0, effectiveness: -3, noPP: 0};
				for (let j = 0; j < battle[side].pokemon[0].baseMoveSlots.length; j++) {
					if (battle[side].pokemon[0].baseMoveSlots[j].pp <= 0) best.noPP++;
				}
				if (best.noPP === moves.length) {
					// Struggle
					battle[side].choose('move 1');
					return true;
				}
				for (let i = 0; i < moves.length; i++) {
					let m = battle.getMove(moves[i]);
					if (m.category === 'Status') continue;
					if (m.disabled) continue;
					let eff = battle.getEffectiveness(m.type, battle[(side === 'p1' ? 'p2' : 'p1')].active[0].types);
					if (eff > best.effectiveness) {
						best.slot = (i + 1);
						best.effectiveness = eff;
					} else if (eff === best.effectiveness && battle.random(2) === 1) {
						best.slot = (i + 1);
					}
				}
				if (!best.slot) {
					// Pick a status move
					for (let i = 0; i < moves.length; i++) {
						if (battle.getMove(moves[i]).category === 'Status') {
							best.slot = (i + 1);
							break;
						}
					}
				}
				if (!best.slot) battle[side].choose('default');
				battle[side].choose('move ' + best.slot);
				break;
			case 'switch':
				// TODO
				battle[side].choose('default');
				break;
			default:
				battle[side].choose('default');
			}
			break;
		}
	},
	throwPokeball: function (ball, pokemon) {
		if (!pokemon || !pokemon.species) return 0;
		ball = toId(ball);
		let ballRates = {pokeball: 1, greatball: 1.5, ultraball: 2};
		if (ball === 'masterball') return true;
		if (!ball || !(ball in ballRates)) ball = 'pokeball';
		let statusBonus = 1;
		switch (pokemon.status) {
		case 'slp':
		case 'frz':
			statusBonus = 2;
			break;
		case 'par':
		case 'brn':
		case 'psn':
		case 'tox':
			statusBonus = 1.5;
			break;
		default:
			statusBonus = 1;
		}
		let rate;
		try {
			rate = this.gameData[toId(pokemon.species)].rate;
		} catch (e) {
			if (this.gameData[toId(pokemon.baseSpecies)]) {
				rate = this.gameData[toId(pokemon.baseSpecies)].rate;
			} else {
				console.log('Catch rate not found for ' + pokemon.species);
				rate = 150;
			}
		}
		let a = (((3 * pokemon.maxhp - 2 * pokemon.hp) * rate * ballRates[ball]) / (3 * pokemon.maxhp)) * statusBonus;
		if (a >= 255) return true;
		let b = 65536 / Math.pow(255 / a, 0.1875);
		for (let i = 0; i < 4; i++) {
			if (Math.ceil(Math.random() * 65535) >= b) return i;
		}
		return true;
	},
	calcExp: function (pokemon, n) {
		pokemon = toId(pokemon);
		let type = this.getEXPType(pokemon);
		let EXP;
		switch (type) {
		case 'erratic':
			if (n <= 50) EXP = ((Math.pow(n, 3) * (100 - n))) / 50;
			if (50 <= n && n <= 68) EXP = ((Math.pow(n, 3) * (150 - n))) / 100;
			if (68 <= n && n <= 98) EXP = ((Math.pow(n, 3) * ((1911 - (10 * n)) / 3))) / 500;
			if (98 <= n && n <= 100) EXP = ((Math.pow(n, 3) * (160 - n))) / 100;
			break;
		case 'fast':
			EXP = (4 * Math.pow(n, 3)) / 5;
			break;
		case 'mediumfast':
			EXP = Math.pow(n, 3);
			break;
		case 'mediumslow':
			EXP = ((6 / 5) * Math.pow(n, 3)) - (15 * Math.pow(n, 2)) + (100 * n) - 140;
			break;
		case 'slow':
			EXP = (5 * Math.pow(n, 3)) / 4;
			break;
		case 'fluctuating':
			if (n <= 15) EXP = Math.pow(n, 3) * ((((n + 1) / 3) + 24) / 50);
			if (15 <= n && n <= 36) EXP = Math.pow(n, 3) * ((n + 14) / 50);
			if (36 <= n && n <= 100) EXP = Math.pow(n, 3) * (((n / 2) + 32) / 50);
			break;
		}
		if (EXP < 0) return 0; // Experience underflow glitch
		return EXP;
	},
	getEXPType: function (pokemon) {
		pokemon = toId(pokemon);
		if (!this.gameData[pokemon]) throw new Error(pokemon + " not found in pokemon.json");
		if (this.gameData[pokemon].expType) return this.gameData[pokemon].expType;
		if (!this.gameData[pokemon].inherit) throw new Error('Unable to find expType for ' + pokemon);
		let curData = null;
		for (let depth = 0; depth < 8; depth++) {
			if (curData && !curData.inherit) throw new Error('Unable to find evDrops for ' + pokemon);
			curData = this.gameData[(this.gameData[(curData ? curData.id : pokemon)].inherit)];
			if (curData.expType) return curData.expType;
		}
		// If we reach here its an error
		throw new Error('MAXIMUM STACK LIMIT EXCEEDED');
	},
	getGain: function (userid, pokemon, foe, particpated) {
		let a = 1, t = (pokemon.ot === userid ? 1 : 1.5), e = (toId(pokemon.item) === 'luckyegg' ? 1.5 : 1), L = foe.level, Lp = pokemon.level, p = 1, s = (particpated ? 2 : 1), b = this.getBaseExp(foe.species);
		return (((a * b * L) / (5 * s)) * (Math.pow((2 * L + 10), 2.5) / Math.pow((L + Lp + 10), 2.5)) + 1) * t * e * p;
	},
	getBaseExp: function (pokemon) {
		pokemon = toId(pokemon);
		if (!this.gameData[pokemon]) throw new Error(pokemon + " not found in pokemon.json");
		if (this.gameData[pokemon].baseExp) return this.gameData[pokemon].baseExp;
		if (!this.gameData[pokemon].inherit) throw new Error('Unable to find expType for ' + pokemon);
		let curData = null;
		for (let depth = 0; depth < 8; depth++) {
			if (curData && !curData.inherit) throw new Error('Unable to find evDrops for ' + pokemon);
			curData = this.gameData[(this.gameData[(curData ? curData.id : pokemon)].inherit)];
			if (curData.baseExp) return curData.baseExp;
		}
		// If we reach here its an error
		throw new Error('MAXIMUM STACK LIMIT EXCEEDED');
	},
	getEvGain: function (pokemon) {
		if (!this.gameData[toId(pokemon.species)]) throw new Error(pokemon.species + " not found in pokemon.json");
		if (this.gameData[toId(pokemon.species)].evDrops) return this.gameData[toId(pokemon.species)].evDrops;
		if (!this.gameData[toId(pokemon.species)].inherit) throw new Error('Unable to find evDrops for ' + pokemon.species);
		let curData = null;
		for (let depth = 0; depth < 8; depth++) {
			if (curData && !curData.inherit) throw new Error('Unable to find evDrops for ' + pokemon.species);
			curData = this.gameData[(this.gameData[(curData ? curData.id : toId(pokemon.species))].inherit)];
			if (curData.evDrops) return curData.evDrops;
		}
		// If we reach here its an error
		throw new Error('MAXIMUM STACK LIMIT EXCEEDED');
	},
	onFaint: function (userid, battle, faintData) {
		userid = toId(userid);
		let out = userid + "]";
		let active = null;
		let exp = faintData.source.side.battled[faintData.target.slot].map(mon => {
			let pkmn = null;
			for (let i = 0; i < faintData.source.side.pokemon.length; i++) {
				if (faintData.source.side.pokemon[i].slot === mon) {
					pkmn = faintData.source.side.pokemon[i];
					break;
				}
			}
			if (pkmn.slot !== faintData.source.slot) {
				return {exp: this.getGain(userid, pkmn, faintData.target, true), slot: pkmn.slot, mon: pkmn};
			} else {
				active = {exp: this.getGain(userid, pkmn, faintData.target, true), slot: pkmn.slot, mon: pkmn, active: true};
				return null;
			}
		});
		exp.unshift(active);
		while (exp.length) {
			let cur = exp.shift();
			if (!cur) continue;
			let mon = cur.mon;
			if (mon.fainted) continue;
			// EXP
			if (mon.level < 100) battle.add('message', (mon.name || mon.species) + " gained " + Math.round(cur.exp) + " Exp. Points!");
			out += mon.slot + "|" + cur.exp;
			// Level Ups
			let levelUps = 0;
			while ((cur.exp + mon.exp) >= this.calcExp(mon.species, (mon.level + 1)) && mon.level < 100) {
				battle.add('message', (mon.name || mon.species) + " grew to level " + (mon.level + 1) + "!");
				mon.level++;
				mon.set.level++;
				levelUps++;
			}
			if (mon.level >= 100 && levelUps) {
				// Force correct values just incase
				mon.level = 100;
				mon.set.level = 100;
				mon.exp = this.calcExp(mon.species, 100);
			} else {
				mon.exp += cur.exp;
			}
			out += "|" + levelUps;
			// New Evs
			let newEvs = this.getEvGain(faintData.target);
			let totalEvs = 0, newCount = 0;
			//totalEvs = 0, newCount = 0; // eslint-disable-line
			for (let ev in newEvs) {
				if (mon.set.evs[ev] >= 255) newEvs[ev] = 0;
				totalEvs += mon.set.evs[ev];
				newCount += newEvs[ev];
			}
			if (totalEvs >= 510) {
				newEvs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
			} else if (newCount + totalEvs > 510) {
				// Apply as many evs as possible
				for (let ev in newEvs) {
					if (mon.set.evs[ev] + newEvs[ev] > 255 || totalEvs >= 510) newEvs[ev] = 0;
					totalEvs += newEvs[ev];
				}
			}
			out += "|";
			for (let ev in newEvs) {
				out += newEvs[ev] + (ev === 'spe' ? ']' : ',');
			}
			// Update level & HP
			const template = mon.template;
			if (levelUps && cur.active) {
				mon.formeChange(template);

				mon.details = template.species + (mon.level === 100 ? '' : ', L' + mon.level) + (mon.gender === '' ? '' : ', ' + mon.gender) + (mon.set.shiny ? ', shiny' : '');
				battle.add('detailschange', mon, mon.details);
				if (mon.id !== 'shedinja') {
					const newHP = Math.floor(Math.floor(2 * template.baseStats['hp'] + mon.set.ivs['hp'] + Math.floor(mon.set.evs['hp'] / 4) + 100) * mon.level / 100 + 10);
					mon.hp = newHP - (mon.maxhp - mon.hp);
					mon.maxhp = newHP;
					battle.add('-heal', mon, mon.getHealth, '[silent]');
				}
			}
			battle.add('');
		}
		return out;
	},
	getItem: function (id) {
		id = toId(id);
		if (!this.itemData[id]) return false;
		return this.itemData[id];
	},
	updateHealth: function (name, pokemon) {
		if (toId(name) === 'sgserver') return '';
		let buf = toId(name) + ']';
		for (let i = 0; i < pokemon.length; i++) {
			buf += `${pokemon[i].slot}|${pokemon[i].hp}|${pokemon[i].status || ''}|`;
			let ppBuf = ``;
			let lostPP = false;
			for (let j = 0; j < pokemon[i].moveSlots.length; j++) {
				ppBuf += pokemon[i].moveSlots[j].pp;
				if (j !== 3) ppBuf += `,`;
				if (pokemon[i].moveSlots[j].pp < pokemon[i].moveSlots[j].maxpp) lostPP = true;
			}
			if (lostPP) buf += ppBuf;
			if (i + 1 !== pokemon.length) buf += ']';
		}
		return buf;
	},
};
