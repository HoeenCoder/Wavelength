'use strict';

exports.BattleScripts = {
	getEffect: function (name) {
		if (name && typeof name !== 'string') {
			return name;
		}
		let id = toId(name);
		if (id.startsWith('ability')) return Object.assign(Object.create(this.getAbility(id.slice(7))), {id});
		return Object.getPrototypeOf(this).getEffect.call(this, name);
	},
	pokemon: {
		setAbility: function (ability, source, isFromFormechange) {
			if (!this.hp) return false;
			ability = this.battle.getAbility(ability);
			let oldAbility = this.ability;
			if (!isFromFormechange) {
				if (['illusion', 'battlebond', 'comatose', 'disguise', 'multitype', 'powerconstruct', 'rkssystem', 'schooling', 'shieldsdown', 'stancechange'].includes(ability.id)) return false;
				if (['battlebond', 'comatose', 'disguise', 'multitype', 'powerconstruct', 'rkssystem', 'schooling', 'shieldsdown', 'stancechange'].includes(oldAbility)) return false;
			}
			this.battle.singleEvent('End', this.battle.getAbility(oldAbility), this.abilityData, this, source);
			let ally = this.side.active.find(ally => ally && ally !== this && !ally.fainted);
			if (ally && ally.innate) {
				ally.removeVolatile(ally.innate);
				delete ally.innate;
			}
			this.ability = ability.id;
			this.abilityData = {id: ability.id, target: this};
			if (ability.id) {
				this.battle.singleEvent('Start', ability, this.abilityData, this, source);
				if (ally && ally.ability !== this.ability) {
					ally.innate = 'ability' + ability.id;
					ally.addVolatile(ally.innate);
				}
			}
			this.abilityOrder = this.battle.abilityOrder++;
			return oldAbility;
		},
		hasAbility: function (ability) {
			if (!this.ignoringAbility()) {
				if (Array.isArray(ability) ? ability.map(toId).includes(this.ability) : toId(ability) === this.ability) {
					return true;
				}
			}
			let ally = this.side.active.find(ally => ally && ally !== this && !ally.fainted);
			if (!ally || ally.ignoringAbility()) return false;
			if (Array.isArray(ability)) return ability.map(toId).includes(ally.ability);
			return toId(ability) === ally.ability;
		},
		getRequestData: function () {
			let ally = this.side.active.find(ally => ally && ally !== this && !ally.fainted);
			this.moveSlots = this.baseMoveSlots.concat(ally ? ally.baseMoveSlots : []);
			for (let moveSlot of this.moveSlots) {
				moveSlot.disabled = false;
				moveSlot.disabledSource = '';
			}
			this.battle.runEvent('DisableMove', this);
			if (!this.ateBerry) this.disableMove('belch');
			return Object.getPrototypeOf(this).getRequestData.call(this);
		},
	},
};
