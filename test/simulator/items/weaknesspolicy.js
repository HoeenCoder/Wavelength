'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Weakness Policy', function () {
	afterEach(function () {
		battle.destroy();
	});

	it('should be triggered by super effective hits', function () {
		battle = common.createBattle();
		battle.setPlayer('p1', {team: [{species: "Lucario", ability: 'justified', moves: ['aurasphere']}]});
		battle.setPlayer('p2', {team: [{species: "Blissey", ability: 'naturalcure', item: 'weaknesspolicy', moves: ['softboiled']}]});
		const holder = battle.p2.active[0];
		battle.makeChoices('move aurasphere', 'move softboiled');
		assert.false.holdsItem(holder);
		assert.statStage(holder, 'atk', 2);
		assert.statStage(holder, 'spa', 2);
	});

	it('should not be triggered by fixed damage moves', function () {
		battle = common.createBattle();
		battle.setPlayer('p1', {team: [{species: "Lucario", ability: 'justified', moves: ['seismictoss']}]});
		battle.setPlayer('p2', {team: [{species: "Blissey", ability: 'naturalcure', item: 'weaknesspolicy', moves: ['softboiled']}]});
		const holder = battle.p2.active[0];
		battle.makeChoices('move seismictoss', 'move softboiled');
		assert.holdsItem(holder);
		assert.statStage(holder, 'atk', 0);
		assert.statStage(holder, 'spa', 0);
	});
});
