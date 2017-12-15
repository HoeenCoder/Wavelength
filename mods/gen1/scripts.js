'use strict';

/**
 * Gen 1 mechanics are fairly different to those we know on current gen.
 * Therefor we need to make a lot of changes to the battle engine for this game simulation.
 * This generation inherits all the changes from older generations, that must be taken into account when editing code.
 */
exports.BattleScripts = {
	inherit: 'gen2',
	gen: 1,
	debug: function (activity) {
		if (this.getFormat().debug) {
			this.add('debug', activity);
		}
	},
	// Gen 1 stores the last damage dealt by a move in the battle.
	// This is used for the move Counter.
	lastDamage: 0,
	// BattleSide scripts.
	// In gen 1, last move information is stored on the side rather than on the active Pokémon.
	// This is because there was actually no side, just Battle and active Pokémon effects.
	// Side's lastMove is used for Counter and Mirror Move.
	side: {
		lastMove: '',
	},
	// BattlePokemon scripts.
	pokemon: {
		getStat: function (statName, unmodified) {
			statName = toId(statName);
			if (statName === 'hp') return this.maxhp;
			if (unmodified) return this.stats[statName];
			return this.modifiedStats[statName];
		},
		// Gen 1 function to apply a stat modification that is only active until the stat is recalculated or mon switched.
		// Modified stats are declared in the Pokemon object in sim/pokemon.js in about line 681.
		modifyStat: function (stat, modifier) {
			if (!(stat in this.stats)) return;
			this.modifiedStats[stat] = this.battle.clampIntRange(Math.floor(this.modifiedStats[stat] * modifier), 1, 999);
		},
		// In generation 1, boosting function increases the stored modified stat and checks for opponent's status.
		boostBy: function (boost) {
			let changed = false;
			for (let i in boost) {
				let delta = boost[i];
				if (delta > 0 && this.boosts[i] >= 6) continue;
				if (delta < 0 && this.boosts[i] <= -6) continue;
				this.boosts[i] += delta;
				if (this.boosts[i] > 6) {
					this.boosts[i] = 6;
				}
				if (this.boosts[i] < -6) {
					this.boosts[i] = -6;
				}
				changed = true;
				// Recalculate the modified stat
				let stat = this.template.baseStats[i];
				stat = Math.floor(Math.floor(2 * stat + this.set.ivs[i] + Math.floor(this.set.evs[i] / 4)) * this.level / 100 + 5);
				this.modifiedStats[i] = this.stats[i] = Math.floor(stat);
				if (this.boosts[i] >= 0) {
					this.modifyStat(i, [1, 1.5, 2, 2.5, 3, 3.5, 4][this.boosts[i]]);
				} else {
					this.modifyStat(i, [100, 66, 50, 40, 33, 28, 25][-this.boosts[i]] / 100);
				}
			}
			return changed;
		},
	},
	// Battle scripts.
	// runMove can be found in scripts.js. This function is the main one when running a move.
	// It deals with the beforeMove and AfterMoveSelf events.
	// This leads with partial trapping moves shennanigans after the move has been used.
	// It also deals with how PP reduction works on gen 1.
	runMove: function (move, pokemon, targetLoc, sourceEffect) {
		let target = this.getTarget(pokemon, move, targetLoc);
		move = this.getMove(move);
		if (!target) target = this.resolveTarget(pokemon, move);
		if (target.subFainted) delete target.subFainted;

		this.setActiveMove(move, pokemon, target);

		if (pokemon.movedThisTurn || !this.runEvent('BeforeMove', pokemon, target, move)) {
			// Prevent invulnerability from persisting until the turn ends.
			pokemon.removeVolatile('twoturnmove');
			// Rampage moves end without causing confusion
			delete pokemon.volatiles['lockedmove'];
			this.clearActiveMove(true);
			// This is only run for sleep.
			this.runEvent('AfterMoveSelf', pokemon, target, move);
			return;
		}
		if (move.beforeMoveCallback) {
			if (move.beforeMoveCallback.call(this, pokemon, target, move)) {
				this.clearActiveMove(true);
				return;
			}
		}
		pokemon.lastDamage = 0;
		let lockedMove = this.runEvent('LockMove', pokemon);
		if (lockedMove === true) lockedMove = false;
		if (!lockedMove && (!pokemon.volatiles['partialtrappinglock'] || pokemon.volatiles['partialtrappinglock'].locked !== target)) {
			pokemon.deductPP(move, null, target);
			// On gen 1 moves are stored when they are chosen and a PP is deducted.
			pokemon.side.lastMove = move.id;
			pokemon.lastMove = move.id;
		} else {
			sourceEffect = move;
		}
		this.useMove(move, pokemon, target, sourceEffect);
		this.singleEvent('AfterMove', move, null, pokemon, target, move);

		// If rival fainted
		if (target.hp <= 0) {
			// We remove recharge
			if (pokemon.volatiles['mustrecharge']) pokemon.removeVolatile('mustrecharge');
			delete pokemon.volatiles['partialtrappinglock'];
			// We remove screens
			target.side.removeSideCondition('reflect');
			target.side.removeSideCondition('lightscreen');
			pokemon.removeVolatile('twoturnmove');
		} else {
			this.runEvent('AfterMoveSelf', pokemon, target, move);
		}

		// For partial trapping moves, we are saving the target
		if (move.volatileStatus === 'partiallytrapped' && target && target.hp > 0) {
			// Let's check if the lock exists
			if (pokemon.volatiles['partialtrappinglock'] && target.volatiles['partiallytrapped']) {
				// Here the partialtrappinglock volatile has been already applied
				const sourceVolatile = pokemon.volatiles['partialtrappinglock'];
				const targetVolatile = target.volatiles['partiallytrapped'];
				if (!sourceVolatile.locked) {
					// If it's the first hit, we save the target
					sourceVolatile.locked = target;
				} else if (target !== pokemon && target !== sourceVolatile.locked) {
					// Our target switched out! Re-roll the duration, damage, and accuracy.
					const duration = [2, 2, 2, 3, 3, 3, 4, 5][this.random(8)];
					sourceVolatile.duration = duration;
					sourceVolatile.locked = target;
					// Duration reset thus partially trapped at 2 always.
					targetVolatile.duration = 2;
					// We get the move position for the PP change.
					const moveSlot = pokemon.moveSlots.find(moveSlot => moveSlot.id === move.id);
					if (moveSlot && moveSlot.pp === 0) {
						moveSlot.pp = 63;
						pokemon.isStale = 2;
						pokemon.isStaleSource = 'ppoverflow';
					}
				}
			} // If we move to here, the move failed and there's no partial trapping lock.
		}
	},
	// useMove can be found on scripts.js
	// It is the function that actually uses the move, running ModifyMove events.
	// It uses the move and then deals with the effects after the move.
	useMove: function (move, pokemon, target, sourceEffect) {
		if (!sourceEffect && this.effect.id) sourceEffect = this.effect;
		move = this.getMove(move);
		let baseMove = move;
		move = this.getMoveCopy(move);
		if (!target) target = this.resolveTarget(pokemon, move);
		if (move.target === 'self') {
			target = pokemon;
		}
		if (sourceEffect) move.sourceEffect = sourceEffect.id;

		this.setActiveMove(move, pokemon, target);

		this.singleEvent('ModifyMove', move, null, pokemon, target, move, move);
		if (baseMove.target !== move.target) {
			// Target changed in ModifyMove, so we must adjust it here
			target = this.resolveTarget(pokemon, move);
		}
		move = this.runEvent('ModifyMove', pokemon, target, move, move);
		if (baseMove.target !== move.target) {
			// Check again, this shouldn't ever happen on Gen 1.
			target = this.resolveTarget(pokemon, move);
		}
		if (!move) return false;

		let attrs = '';
		if (pokemon.fainted) {
			// Removing screens upon faint.
			pokemon.side.removeSideCondition('reflect');
			pokemon.side.removeSideCondition('lightscreen');
			return false;
		}

		if (move.flags['charge'] && !pokemon.volatiles[move.id]) {
			attrs = '|[still]'; // Suppress the default move animation
		}

		if (sourceEffect) attrs += '|[from]' + this.getEffect(sourceEffect);
		this.addMove('move', pokemon, move.name, target + attrs);

		if (!this.singleEvent('Try', move, null, pokemon, target, move)) {
			return true;
		}
		if (!this.runEvent('TryMove', pokemon, target, move)) {
			return true;
		}

		if (move.ignoreImmunity === undefined) {
			move.ignoreImmunity = (move.category === 'Status');
		}

		let damage = false;
		if (target.fainted) {
			this.attrLastMove('[notarget]');
			this.add('-notarget');
			return true;
		}
		damage = this.tryMoveHit(target, pokemon, move);

		// Store 0 damage for last damage if move failed or dealt 0 damage.
		// This only happens on moves that don't deal damage but call GetDamageVarsForPlayerAttack (disassembly).
		if (!damage && (move.category !== 'Status' || (move.category === 'Status' && !['psn', 'tox', 'par'].includes(move.status))) &&
		!['conversion', 'haze', 'mist', 'focusenergy', 'confuseray', 'supersonic', 'transform', 'lightscreen', 'reflect', 'substitute', 'mimic', 'leechseed', 'splash', 'softboiled', 'recover', 'rest'].includes(move.id)) {
			this.lastDamage = 0;
		}

		// Go ahead with results of the used move.
		if (!damage && damage !== 0) {
			this.singleEvent('MoveFail', move, null, target, pokemon, move);
			return true;
		}

		if (!move.negateSecondary) {
			this.singleEvent('AfterMoveSecondarySelf', move, null, pokemon, target, move);
			this.runEvent('AfterMoveSecondarySelf', pokemon, target, move);
		}
		return true;
	},
	// tryMoveHit can be found on scripts.js
	// This function attempts a move hit and returns the attempt result before the actual hit happens.
	// It deals with partial trapping weirdness and accuracy bugs as well.
	tryMoveHit: function (target, pokemon, move, spreadHit) {
		let boostTable = [1, 4 / 3, 5 / 3, 2, 7 / 3, 8 / 3, 3];
		let doSelfDestruct = true;
		let damage = 0;

		// First, check if the Pokémon is immune to this move.
		if (move.ignoreImmunity !== true && !move.ignoreImmunity[move.type] && !target.runImmunity(move.type, true)) {
			if (move.selfdestruct) {
				this.faint(pokemon, pokemon, move);
			}
			return false;
		}

		// Now, let's calculate the accuracy.
		let accuracy = move.accuracy;

		// Partial trapping moves: true accuracy while it lasts
		if (move.volatileStatus === 'partiallytrapped' && pokemon.volatiles['partialtrappinglock'] && target === pokemon.volatiles['partialtrappinglock'].locked) {
			accuracy = true;
		}

		// If a sleep inducing move is used while the user is recharging, the accuracy is true.
		if (move.status === 'slp' && target && target.volatiles['mustrecharge']) {
			accuracy = true;
		}

		// OHKO moves only have a chance to hit if the user is at least as fast as the target
		if (move.ohko) {
			if (target.speed > pokemon.speed) {
				this.add('-immune', target, '[ohko]');
				return false;
			}
		}

		// Calculate true accuracy for gen 1, which uses 0-255.
		if (accuracy !== true) {
			accuracy = Math.floor(accuracy * 255 / 100);
			// Check also for accuracy modifiers.
			if (!move.ignoreAccuracy) {
				if (pokemon.boosts.accuracy > 0) {
					accuracy *= boostTable[pokemon.boosts.accuracy];
				} else {
					accuracy = Math.floor(accuracy / boostTable[-pokemon.boosts.accuracy]);
				}
			}
			if (!move.ignoreEvasion) {
				if (target.boosts.evasion > 0 && !move.ignorePositiveEvasion) {
					accuracy = Math.floor(accuracy / boostTable[target.boosts.evasion]);
				} else if (target.boosts.evasion < 0) {
					accuracy *= boostTable[-target.boosts.evasion];
				}
			}
			accuracy = Math.min(accuracy, 255);
		}
		accuracy = this.runEvent('Accuracy', target, pokemon, move, accuracy);
		// Moves that target the user do not suffer from the 1/256 miss chance.
		if (move.target === 'self' && accuracy !== true) accuracy++;

		// 1/256 chance of missing always, no matter what. Besides the aforementioned exceptions.
		if (accuracy !== true && this.random(256) >= accuracy) {
			this.attrLastMove('[miss]');
			this.add('-miss', pokemon);
			damage = false;
		}

		// If damage is 0 and not false it means it didn't miss, let's calc.
		if (damage !== false) {
			pokemon.lastDamage = 0;
			if (move.multihit) {
				let hits = move.multihit;
				if (hits.length) {
					// Yes, it's hardcoded... meh
					if (hits[0] === 2 && hits[1] === 5) {
						hits = [2, 2, 3, 3, 4, 5][this.random(6)];
					} else {
						hits = this.random(hits[0], hits[1] + 1);
					}
				}
				hits = Math.floor(hits);
				// In gen 1, all the hits have the same damage for multihits move
				let moveDamage = 0;
				let firstDamage;
				let i;
				for (i = 0; i < hits && target.hp && pokemon.hp; i++) {
					if (i === 0) {
						// First hit, we calculate
						moveDamage = this.moveHit(target, pokemon, move);
						firstDamage = moveDamage;
					} else {
						// We get the previous damage to make it fix damage
						move.damage = firstDamage;
						moveDamage = this.moveHit(target, pokemon, move);
					}
					if (moveDamage === false) break;
					damage = (moveDamage || 0);
					if (target.subFainted) {
						i++;
						break;
					}
				}
				move.damage = null;
				if (i === 0) return true;
				this.add('-hitcount', target, i);
			} else {
				damage = this.moveHit(target, pokemon, move);
			}
		}

		if (move.category !== 'Status') {
			// FIXME: The stored damage should be calculated ignoring Substitute.
			// https://github.com/Zarel/Pokemon-Showdown/issues/2598
			target.gotAttacked(move, damage, pokemon);
		}

		// Checking if substitute fainted
		if (target.subFainted) doSelfDestruct = false;
		if (move.selfdestruct && doSelfDestruct) {
			this.faint(pokemon, pokemon, move);
		}

		// The move missed.
		if (!damage && damage !== 0) {
			// Delete the partial trap lock if necessary.
			delete pokemon.volatiles['partialtrappinglock'];
			return false;
		}

		if (move.ohko) this.add('-ohko');

		if (!move.negateSecondary) {
			this.singleEvent('AfterMoveSecondary', move, null, target, pokemon, move);
			this.runEvent('AfterMoveSecondary', target, pokemon, move);
		}

		return damage;
	},
	// move Hit can be found on scripts.js
	// It deals with the actual move hit, as the name indicates, dealing damage and/or effects.
	// This function also deals with the Gen 1 Substitute behaviour on the hitting process.
	moveHit: function (target, pokemon, move, moveData, isSecondary, isSelf) {
		let damage = 0;
		move = this.getMoveCopy(move);

		if (!isSecondary && !isSelf) this.setActiveMove(move, pokemon, target);
		let hitResult = true;
		if (!moveData) moveData = move;

		if (move.ignoreImmunity === undefined) {
			move.ignoreImmunity = (move.category === 'Status');
		}

		// We get the sub to the target to see if it existed
		let targetSub = (target) ? target.volatiles['substitute'] : false;
		let targetHadSub = (targetSub !== null && targetSub !== false && (typeof targetSub !== 'undefined'));

		if (target) {
			hitResult = this.singleEvent('TryHit', moveData, {}, target, pokemon, move);

			// Handle here the applying of partial trapping moves to Pokémon with Substitute
			if (targetSub && moveData.volatileStatus && moveData.volatileStatus === 'partiallytrapped') {
				target.addVolatile(moveData.volatileStatus, pokemon, move);
			}

			if (!hitResult) {
				if (hitResult === false) this.add('-fail', target);
				return false;
			}

			// Only run the hit events for the hit itself, not the secondary or self hits
			if (!isSelf && !isSecondary) {
				hitResult = this.runEvent('TryHit', target, pokemon, move);
				if (!hitResult) {
					if (hitResult === false) this.add('-fail', target);
					// Special Substitute hit flag
					if (hitResult !== 0) {
						return false;
					}
				}
				if (!this.runEvent('TryFieldHit', target, pokemon, move)) {
					return false;
				}
			} else if (isSecondary && !moveData.self) {
				hitResult = this.runEvent('TrySecondaryHit', target, pokemon, moveData);
			}

			if (hitResult === 0) {
				target = null;
			} else if (!hitResult) {
				if (hitResult === false) this.add('-fail', target);
				return false;
			}
		}

		if (target) {
			let didSomething = false;

			damage = this.getDamage(pokemon, target, moveData);

			// getDamage has several possible return values:
			//
			//   a number:
			//     means that much damage is dealt (0 damage still counts as dealing
			//     damage for the purposes of things like Static)
			//   false:
			//     gives error message: "But it failed!" and move ends
			//   null:
			//     the move ends, with no message (usually, a custom fail message
			//     was already output by an event handler)
			//   undefined:
			//     means no damage is dealt and the move continues
			//
			// basically, these values have the same meanings as they do for event
			// handlers.

			if ((damage || damage === 0) && !target.fainted) {
				if (move.noFaint && damage >= target.hp) {
					damage = target.hp - 1;
				}
				damage = this.damage(damage, target, pokemon, move);
				if (!(damage || damage === 0)) return false;
				didSomething = true;
			} else if (damage === false && typeof hitResult === 'undefined') {
				this.add('-fail', target);
			}
			if (damage === false || damage === null) {
				return false;
			}
			if (moveData.boosts && !target.fainted) {
				this.boost(moveData.boosts, target, pokemon, move);

				// Check the status of the Pokémon whose turn is not.
				// When a move that affects stat levels is used, if the Pokémon whose turn it is not right now is paralyzed or
				// burned, the correspoding stat penalties will be applied again to that Pokémon.
				if (pokemon.side.foe.active[0] && pokemon.side.foe.active[0].status) {
					// If it's paralysed, quarter its speed.
					if (pokemon.side.foe.active[0].status === 'par') {
						pokemon.side.foe.active[0].modifyStat('spe', 0.25);
					}
					// If it's burned, halve its attack.
					if (pokemon.side.foe.active[0].status === 'brn') {
						pokemon.side.foe.active[0].modifyStat('atk', 0.5);
					}
				}
			}
			if (moveData.heal && !target.fainted) {
				let d = target.heal(Math.floor(target.maxhp * moveData.heal[0] / moveData.heal[1]));
				if (!d) {
					this.add('-fail', target);
					return false;
				}
				this.add('-heal', target, target.getHealth);
				didSomething = true;
			}
			if (moveData.status) {
				// Gen 1 bug: If the target has just used hyperbeam and must recharge, its status will be ignored and put to sleep.
				// This does NOT revert the paralyse speed drop or the burn attack drop.
				// Also, being put to sleep clears the recharge condition.
				if (moveData.status === 'slp' && target.volatiles['mustrecharge']) {
					// The sleep move is guaranteed to hit in this situation, unless Sleep Clause activates.
					// Do not clear recharge in that case.
					if (target.setStatus(moveData.status, pokemon, move)) {
						target.removeVolatile('mustrecharge');
					}
				} else if (!target.status) {
					if (target.setStatus(moveData.status, pokemon, move)) {
						// Gen 1 mechanics: The burn attack drop and the paralyse speed drop are applied here directly on stat modifiers.
						if (moveData.status === 'brn') target.modifyStat('atk', 0.5);
						if (moveData.status === 'par') target.modifyStat('spe', 0.25);
					}
				} else if (!isSecondary) {
					if (target.status === moveData.status) {
						this.add('-fail', target, target.status);
					} else {
						this.add('-fail', target);
					}
				}
				didSomething = true;
			}
			if (moveData.forceStatus) {
				if (target.setStatus(moveData.forceStatus, pokemon, move)) {
					if (moveData.forceStatus === 'brn') target.modifyStat('atk', 0.5);
					if (moveData.forceStatus === 'par') target.modifyStat('spe', 0.25);
					didSomething = true;
				}
			}
			if (moveData.volatileStatus) {
				if (target.addVolatile(moveData.volatileStatus, pokemon, move)) {
					didSomething = true;
				}
			}
			if (moveData.sideCondition) {
				if (target.side.addSideCondition(moveData.sideCondition, pokemon, move)) {
					didSomething = true;
				}
			}
			if (moveData.pseudoWeather) {
				if (this.addPseudoWeather(moveData.pseudoWeather, pokemon, move)) {
					didSomething = true;
				}
			}
			// Hit events
			hitResult = this.singleEvent('Hit', moveData, {}, target, pokemon, move);
			if (!isSelf && !isSecondary) {
				this.runEvent('Hit', target, pokemon, move);
			}
			if (!hitResult && !didSomething) {
				if (hitResult === false) this.add('-fail', target);
				return false;
			}
		}
		let targetHasSub = false;
		if (target) {
			let targetSub = target.getVolatile('substitute');
			if (targetSub !== null) {
				targetHasSub = (targetSub.hp > 0);
			}
		}

		// Here's where self effects are applied.
		let doSelf = (targetHadSub && targetHasSub) || !targetHadSub;
		if (moveData.self && (doSelf || moveData.self.volatileStatus === 'partialtrappinglock')) {
			this.moveHit(pokemon, pokemon, move, moveData.self, isSecondary, true);
		}

		// Now we can save the partial trapping damage.
		if (pokemon.volatiles['partialtrappinglock']) {
			pokemon.volatiles['partialtrappinglock'].damage = pokemon.lastDamage;
		}

		// Apply move secondaries.
		if (moveData.secondaries) {
			for (let i = 0; i < moveData.secondaries.length; i++) {
				// We check here whether to negate the probable secondary status if it's para, burn, or freeze.
				// In the game, this is checked and if true, the random number generator is not called.
				// That means that a move that does not share the type of the target can status it.
				// If a move that was not fire-type would exist on Gen 1, it could burn a Pokémon.
				if (!(moveData.secondaries[i].status && ['par', 'brn', 'frz'].includes(moveData.secondaries[i].status) && target && target.hasType(move.type))) {
					let effectChance = Math.floor(moveData.secondaries[i].chance * 255 / 100);
					if (typeof moveData.secondaries[i].chance === 'undefined' || this.random(256) <= effectChance) {
						this.moveHit(target, pokemon, move, moveData.secondaries[i], true, isSelf);
					}
				}
			}
		}
		if (move.selfSwitch && pokemon.hp) {
			pokemon.switchFlag = move.selfSwitch;
		}

		return damage;
	},
	// boost can be found on sim/battle.js on Battle object.
	// It deals with Pokémon stat boosting, including Gen 1 buggy behaviour with burn and paralyse.
	boost: function (boost, target, source, effect) {
		if (this.event) {
			if (!target) target = this.event.target;
			if (!source) source = this.event.source;
			if (!effect) effect = this.effect;
		}
		if (!target || !target.hp) return 0;
		effect = this.getEffect(effect);
		boost = this.runEvent('Boost', target, source, effect, Object.assign({}, boost));
		for (let i in boost) {
			let currentBoost = {};
			currentBoost[i] = boost[i];
			if (boost[i] !== 0 && target.boostBy(currentBoost)) {
				let msg = '-boost';
				if (boost[i] < 0) {
					msg = '-unboost';
					boost[i] = -boost[i];
					// Re-add attack and speed drops if not present
					if (i === 'atk' && target.status === 'brn' && !target.volatiles['brnattackdrop']) {
						target.addVolatile('brnattackdrop');
					}
					if (i === 'spe' && target.status === 'par' && !target.volatiles['parspeeddrop']) {
						target.addVolatile('parspeeddrop');
					}
				} else {
					// Check for boost increases deleting attack or speed drops
					if (i === 'atk' && target.status === 'brn' && target.volatiles['brnattackdrop']) {
						target.removeVolatile('brnattackdrop');
					}
					if (i === 'spe' && target.status === 'par' && target.volatiles['parspeeddrop']) {
						target.removeVolatile('parspeeddrop');
					}
				}
				if (effect.effectType === 'Move') {
					this.add(msg, target, i, boost[i]);
				} else {
					this.add(msg, target, i, boost[i], '[from] ' + effect.fullname);
				}
				this.runEvent('AfterEachBoost', target, source, effect, currentBoost);
			}
		}
		this.runEvent('AfterBoost', target, source, effect, boost);
	},
	// damage can be found in sim/battle.js on the Battle object. Not to confuse with BattlePokemon.prototype.damage
	// It calculates and executes the damage damage from source to target with effect.
	// It also deals with recoil and drains.
	damage: function (damage, target, source, effect) {
		if (this.event) {
			if (!target) target = this.event.target;
			if (!source) source = this.event.source;
			if (!effect) effect = this.effect;
		}
		if (!target || !target.hp) return 0;
		effect = this.getEffect(effect);
		if (!(damage || damage === 0)) return damage;
		if (damage !== 0) damage = this.clampIntRange(damage, 1);

		if (effect.id !== 'struggle-recoil') { // Struggle recoil is not affected by effects
			damage = this.runEvent('Damage', target, source, effect, damage);
			if (!(damage || damage === 0)) {
				this.debug('damage event failed');
				return damage;
			}
		}
		if (damage !== 0) damage = this.clampIntRange(damage, 1);
		if (!['recoil', 'drain'].includes(effect.id) && effect.effectType !== 'Status') {
			// FIXME: The stored damage should be calculated ignoring Substitute.
			// https://github.com/Zarel/Pokemon-Showdown/issues/2598
			this.lastDamage = damage;
		}
		damage = target.damage(damage, source, effect);
		if (source) source.lastDamage = damage;
		let name = effect.fullname;
		if (name === 'tox') name = 'psn';
		switch (effect.id) {
		case 'partiallytrapped':
			this.add('-damage', target, target.getHealth, '[from] ' + this.effectData.sourceEffect.fullname, '[partiallytrapped]');
			break;
		default:
			if (effect.effectType === 'Move') {
				this.add('-damage', target, target.getHealth);
			} else if (source && source !== target) {
				this.add('-damage', target, target.getHealth, '[from] ' + effect.fullname, '[of] ' + source);
			} else {
				this.add('-damage', target, target.getHealth, '[from] ' + name);
			}
			break;
		}

		if (effect.recoil && source) {
			this.damage(this.clampIntRange(Math.floor(damage * effect.recoil[0] / effect.recoil[1]), 1), source, target, 'recoil');
		}
		if (effect.drain && source) {
			this.heal(this.clampIntRange(Math.floor(damage * effect.drain[0] / effect.drain[1]), 1), source, target, 'drain');
		}

		if (target.fainted || target.hp <= 0) {
			this.faint(target);
			this.queue = [];
		} else {
			// damage = this.runEvent('AfterDamage', target, source, effect, damage);
		}

		return damage;
	},
	// directDamage can be found on sim/battle.js in Battle object
	// It deals direct damage damage from source to target with effect.
	// It also deals with Gen 1 weird Substitute behaviour.
	directDamage: function (damage, target, source, effect) {
		if (this.event) {
			if (!target) target = this.event.target;
			if (!source) source = this.event.source;
			if (!effect) effect = this.effect;
		}
		if (!target || !target.hp) return 0;
		if (!damage) return 0;
		damage = this.clampIntRange(damage, 1);
		// Check here for Substitute on confusion since it's not exactly a move that causes the damage and thus it can't TryMoveHit.
		// The hi jump kick recoil also hits the sub.
		if (['confusion', 'highjumpkick'].includes(effect.id) && target.volatiles['substitute']) {
			target.volatiles['substitute'].hp -= damage;
			if (target.volatiles['substitute'].hp <= 0) {
				target.removeVolatile('substitute');
				target.subFainted = true;
			} else {
				this.add('-activate', target, 'Substitute', '[damage]');
			}
		} else {
			damage = target.damage(damage, source, effect);
			// Now we sent the proper -damage.
			switch (effect.id) {
			case 'strugglerecoil':
				this.add('-damage', target, target.getHealth, '[from] recoil');
				break;
			case 'confusion':
				this.add('-damage', target, target.getHealth, '[from] confusion');
				break;
			default:
				this.add('-damage', target, target.getHealth);
				break;
			}
			if (target.fainted) this.faint(target);
		}

		return damage;
	},
	// getDamage can be found on sim/battle.js on the Battle object.
	// It calculates the damage pokemon does to target with move.
	getDamage: function (pokemon, target, move, suppressMessages) {
		// First of all, we get the move.
		if (typeof move === 'string') move = this.getMove(move);
		if (typeof move === 'number') {
			move = {
				basePower: move,
				type: '???',
				category: 'Physical',
				willCrit: false,
				flags: {},
			};
		}

		// Let's see if the target is immune to the move.
		if (!move.ignoreImmunity || (move.ignoreImmunity !== true && !move.ignoreImmunity[move.type])) {
			if (!target.runImmunity(move.type, true)) {
				return false;
			}
		}

		// Is it an OHKO move?
		if (move.ohko) {
			return target.maxhp;
		}

		// We edit the damage through move's damage callback if necessary.
		if (move.damageCallback) {
			return move.damageCallback.call(this, pokemon, target);
		}

		// We take damage from damage=level moves (seismic toss).
		if (move.damage === 'level') {
			return pokemon.level;
		}

		// If there's a fix move damage, we return that.
		if (move.damage) {
			return move.damage;
		}

		// If it's the first hit on a Normal-type partially trap move, it hits Ghosts anyways but damage is 0.
		if (move.volatileStatus === 'partiallytrapped' && move.type === 'Normal' && target.hasType('Ghost')) {
			return 0;
		}

		// Let's check if we are in middle of a partial trap sequence to return the previous damage.
		if (pokemon.volatiles['partialtrappinglock'] && (target === pokemon.volatiles['partialtrappinglock'].locked)) {
			return pokemon.volatiles['partialtrappinglock'].damage;
		}

		// We check the category and typing to calculate later on the damage.
		if (!move.category) move.category = 'Physical';
		if (!move.defensiveCategory) move.defensiveCategory = move.category;
		// '???' is typeless damage: used for Struggle and Confusion etc
		if (!move.type) move.type = '???';
		let type = move.type;

		// We get the base power and apply basePowerCallback if necessary.
		let basePower = move.basePower;
		if (move.basePowerCallback) {
			basePower = move.basePowerCallback.call(this, pokemon, target, move);
		}

		// We check if the base power is proper.
		if (!basePower) {
			if (basePower === 0) return; // Returning undefined means not dealing damage
			return basePower;
		}
		basePower = this.clampIntRange(basePower, 1);

		// Checking for the move's Critical Hit possibility. We check if it's a 100% crit move, otherwise we calculate the chance.
		move.crit = move.willCrit || false;
		if (!move.crit) {
			// In gen 1, the critical chance is based on speed.
			// First, we get the base speed, divide it by 2 and floor it. This is our current crit chance.
			let critChance = Math.floor(pokemon.template.baseStats['spe'] / 2);

			// Now we check for focus energy volatile.
			if (pokemon.volatiles['focusenergy']) {
				// If it exists, crit chance is divided by 2 again and floored.
				critChance = Math.floor(critChance / 2);
			} else {
				// Normally, without focus energy, crit chance is multiplied by 2 and capped at 255 here.
				critChance = this.clampIntRange(critChance * 2, 1, 255);
			}

			// Now we check for the move's critical hit ratio.
			if (move.critRatio === 1) {
				// Normal hit ratio, we divide the crit chance by 2 and floor the result again.
				critChance = Math.floor(critChance / 2);
			} else if (move.critRatio === 2) {
				// High crit ratio, we multiply the result so far by 4 and cap it at 255.
				critChance = this.clampIntRange(critChance * 4, 1, 255);
			}

			// Last, we check deppending on ratio if the move critical hits or not.
			// We compare our critical hit chance against a random number between 0 and 255.
			// If the random number is lower, we get a critical hit. This means there is always a 1/255 chance of not hitting critically.
			if (critChance > 0) {
				move.crit = (this.random(256) < critChance);
			}
		}

		// Happens after crit calculation.
		if (basePower) {
			basePower = this.runEvent('BasePower', pokemon, target, move, basePower);
			if (move.basePowerModifier) {
				basePower *= move.basePowerModifier;
			}
		}
		if (!basePower) return 0;
		basePower = this.clampIntRange(basePower, 1);

		// We now check attacker's and defender's stats.
		let level = pokemon.level;
		let attacker = pokemon;
		let defender = target;
		if (move.useTargetOffensive) attacker = target;
		if (move.useSourceDefensive) defender = pokemon;
		let atkType = (move.category === 'Physical') ? 'atk' : 'spa';
		let defType = (move.defensiveCategory === 'Physical') ? 'def' : 'spd';
		let attack = attacker.getStat(atkType);
		let defense = defender.getStat(defType);
		// In gen 1, screen effect is applied here.
		if ((defType === 'def' && defender.volatiles['reflect']) || (defType === 'spd' && defender.volatiles['lightscreen'])) {
			this.debug('Screen doubling (Sp)Def');
			defense *= 2;
			defense = this.clampIntRange(defense, 1, 1998);
		}

		// In the event of a critical hit, the offense and defense changes are ignored.
		// This includes both boosts and screens.
		// Also, level is doubled in damage calculation.
		if (move.crit) {
			move.ignoreOffensive = true;
			move.ignoreDefensive = true;
			level *= 2;
			if (!suppressMessages) this.add('-crit', target);
		}
		if (move.ignoreOffensive) {
			this.debug('Negating (sp)atk boost/penalty.');
			attack = attacker.getStat(atkType, true);
		}
		if (move.ignoreDefensive) {
			this.debug('Negating (sp)def boost/penalty.');
			// No screens
			defense = target.getStat(defType, true);
		}

		// When either attack or defense are higher than 256, they are both divided by 4 and moded by 256.
		// This is what cuases the roll over bugs.
		if (attack >= 256 || defense >= 256) {
			attack = this.clampIntRange(Math.floor(attack / 4) % 256, 1);
			// Defense isn't checked on the cartridge, but we don't want those / 0 bugs on the sim.
			defense = this.clampIntRange(Math.floor(defense / 4) % 256, 1);
		}

		// Self destruct moves halve defense at this point.
		if (move.selfdestruct && defType === 'def') {
			defense = this.clampIntRange(Math.floor(defense / 2), 1);
		}

		// Let's go with the calculation now that we have what we need.
		// We do it step by step just like the game does.
		let damage = level * 2;
		damage = Math.floor(damage / 5);
		damage += 2;
		damage *= basePower;
		damage *= attack;
		damage = Math.floor(damage / defense);
		damage = this.clampIntRange(Math.floor(damage / 50), 1, 997);
		damage += 2;

		// STAB damage bonus, the "???" type never gets STAB
		if (type !== '???' && pokemon.hasType(type)) {
			damage += Math.floor(damage / 2);
		}

		// Type effectiveness.
		// The order here is not correct, must change to check the move versus each type.
		let totalTypeMod = this.getEffectiveness(type, target);
		// Super effective attack
		if (totalTypeMod > 0) {
			if (!suppressMessages) this.add('-supereffective', target);
			damage *= 20;
			damage = Math.floor(damage / 10);
			if (totalTypeMod >= 2) {
				damage *= 20;
				damage = Math.floor(damage / 10);
			}
		}
		if (totalTypeMod < 0) {
			if (!suppressMessages) this.add('-resisted', target);
			damage *= 5;
			damage = Math.floor(damage / 10);
			if (totalTypeMod <= -2) {
				damage *= 5;
				damage = Math.floor(damage / 10);
			}
		}

		// If damage becomes 0, the move is made to miss.
		// This occurs when damage was either 2 or 3 prior to applying STAB/Type matchup, and target is 4x resistant to the move.
		if (damage === 0) return damage;

		// Apply random factor is damage is greater than 1
		if (damage > 1) {
			damage *= this.random(217, 256);
			damage = Math.floor(damage / 255);
			if (damage > target.hp && !target.volatiles['substitute']) damage = target.hp;
			if (target.volatiles['substitute'] && damage > target.volatiles['substitute'].hp) damage = target.volatiles['substitute'].hp;
		}

		// And we are done.
		return Math.floor(damage);
	},
};
