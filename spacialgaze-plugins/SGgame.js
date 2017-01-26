'use strict';

/* For later...
const Console = require('./console.js').Console;

class SGgame extends Console {
	constructor(user, room) {
		super(user, room);
	}
}
*/

exports.commands = {
	resetalpha: 'playalpha',
	playalpha: function (target, room, user, connection, cmd) {
		let screen = '<div class="infobox" style="background-color: black; color: white; font-family: monospace; height: 400px">~/spacialgaze/sggame>node game.js<br/>##################################<br/>## SG Game (Developers version) ##<br/>##################################<br/>' +
			'<b>Choose a Starter:</b><br/>';
		let starters = [['Bulbasaur', 'Chikorita', 'Treecko', 'Turtwig', 'Snivy', 'Chespin', 'Rowlet'], ['Charmander', 'Cyndaquil', 'Torchic', 'Chimchar', 'Tepig', 'Fennekin', 'Litten'], ['Squirtle', 'Totodile', 'Mudkip', 'Piplup', 'Oshawott', 'Froakie', 'Popplio']];
		for (let i = 0; i < starters.length; i++) {
			let color = (i === 0 ? 'green' : (i === 1 ? 'red' : 'blue'));
			for (let j = 0; j < starters[i].length; j++) {
				screen += '<button name="send" value="/pickstarter ' + starters[i][j] + '" style="border: none; background: none; color: ' + color + '"><u>' + starters[i][j] + '</u></button> ';
			}
			screen += '<br/>';
		}
		screen += '_</div>';
		let type = (toId(cmd) === 'playalpha' ? 'uhtml' : 'uhtmlchange');
		return user.sendTo(room, '|' + type + '|sgame' + user.userid + '|' + screen);
	},
	pickstarter: function (target, room, user) {
		let starters = ['Bulbasaur', 'Chikorita', 'Treecko', 'Turtwig', 'Snivy', 'Chespin', 'Rowlet', 'Charmander', 'Cyndaquil', 'Torchic', 'Chimchar', 'Tepig', 'Fennekin', 'Litten', 'Squirtle', 'Totodile', 'Mudkip', 'Piplup', 'Oshawott', 'Froakie', 'Popplio'];
		if (!target || starters.indexOf(target) === -1) return this.parse('/playalpha');
		Db('players').set(user.userid, SG.unpackTeam(SG.makeWildPokemon(false, {species: target, level: 10, ability: 0})));
		return user.sendTo(room, '|uhtmlchange|sgame' + user.userid + '|<div class="infobox" style="background-color: black; color: white; font-family: monospace; height: 400px">~/spacialgaze/sggame>node game.js<br/>##################################<br/>## SG Game (Developers version) ##<br/>##################################<br/><br/><b>Ready for testing</b><br/><button name="send" value="/search gen7wildpokemonalpha" style="border: none; background: none; color: cyan"><u>Start the test</u></button> <button name="send" value="/resetalpha" style="border: none; background: none; color: cyan"><u>Reset the test</u></button><br/>_</div>');
	},
	throwpokeball: function (target, room, user) {
		if (!room.battle || toId(room.battle.format) !== 'gen7wildpokemonalpha') return this.errorReply('You can\'t throw a pokeball here!');
		if (room.battle.ended) return this.errorReply('The battle is already over, you can\'t throw a pokeball.');
		target = toId(target);
		if (['pokeball', 'greatball', 'ultraball', 'masterball'].indexOf(target) === -1) return this.errorReply('Thats not a pokeball, or at least not one we support.');
		let side = (toId(room.battle.p1.name) === toId(user) ? "p1" : "p2");
		if (room.battle.ended) return this.errorReply('The battle has already ended.');
		if (toId(room.battle[side].name) !== user.userid) return this.errorReply('You cant throw a pokeball because your not the trainer here!');
		let data = target + "|" + user.name;
		room.battle.send('pokeball', data.replace(/\n/g, '\f'));
	},
};
