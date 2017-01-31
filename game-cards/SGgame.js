'use strict';

class SGgame extends Console.Console {
	constructor(user, room, muted) {
		super(user, room, 'background: linear-gradient(green, white);', '<center><br/><br/><br/><br/><img src="http://i.imgur.com/tfYS6TN.png"/></center><!--split-->', '<center><button class="button disabled" name="send" value="/sggame pokedex">Pokedex</button> <button class="button disabled" name="send" value="/sggame pokemon">Pokemon</button> <button class="button disabled" name="send" value="/sggame bag">Bag</button> <button class="button disabled" name="send" value="/sggame pc">PC Boxes</button> <button class="button disabled" name="send" value="">TBA</button> <button class="button disabled" name="send" value="">TBA</button></center>', muted);
		// Lines of text to be displayed
		this.curText = [];
		this.location = null;
		this.nextSymbol = '\u2605';
	}
	buildMap(location) {
		// TODO locations, and actual map, ect
		return this.defaultHTML;
	}
	next(type, hideButton) {
		switch (type) {
			case 'text':
			let base = this.buildMap();
			if (!this.curText.length) return base;
			let msg = this.curText.shift();
			if (msg.split('|')[1] === 'hide') {
				hideButton = true;
				msg = msg.split('|')[0];
			}
			let parts = base.split('<!--split-->');
			return parts.shift() + '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; color: #000;">' + msg + (hideButton ? '' : '<button style="border: none; background: none; color: purple; cursor: pointer;" name="send" value="/sggame next"><u>&#9733;</u></button>') + '</div>' + parts.join('');
			//break;
		}
	}
	bag(menu) {
		if (!menu) menu = 'items';
	}
}

exports.box = {
	startCommand: '/playalpha',
	name: 'SGgame - Alpha',
};

exports.commands = {
	resetalpha: 'playalpha',
	playalpha: function (target, room, user, connection, cmd) {
		if (user.console) this.parse('/console kill');
		user.console = new SGgame(user, room, (toId(target) === 'mute' ? true : false));
		user.console.curText = ['Welcome to the world of Pokemon!<br/>I\'m HoeenHero, one of the programmers for the game. (click the star to continue)',
			'Were not done creating the game yet so its limited as to what you can do.<br/>But you can help out by testing whats here, and reporting any issues you find!',
			'Lets get you setup.<br/>Pick a starter:']
		let msg = '';
		let starters = [['Bulbasaur', 'Chikorita', 'Treecko', 'Turtwig', 'Snivy', 'Chespin', 'Rowlet'], ['Charmander', 'Cyndaquil', 'Torchic', 'Chimchar', 'Tepig', 'Fennekin', 'Litten'], ['Squirtle', 'Totodile', 'Mudkip', 'Piplup', 'Oshawott', 'Froakie', 'Popplio']];
		for (let i = 0; i < starters.length; i++) {
			let color = (i === 0 ? 'green' : (i === 1 ? 'red' : 'blue'));
			for (let j = 0; j < starters[i].length; j++) {
				msg += '<button name="send" value="/pickstarter ' + starters[i][j] + '" style="border: none; background: none; color: ' + color + '"><u>' + starters[i][j] + '</u></button> ';
			}
			msg += (i + 1 < starters.length ? '<br/>' : '');
		}
		user.console.curText.push(msg + '|hide');
		user.console.curText.push('Great choice! I\'ll leave you to your fun now.<br/><center><button name="send" value="/search gen7wildpokemonalpha" style="border: none; background: none; color: purple"><u>Try a battle!</u></button> <button name="send" value="/resetalpha" style="border: none; background: none; color: purple"><u>Reset the alpha</u></button></center>|hide')
		user.console.init();
		this.parse('/sggame next');
	},
	sggame: {
		next: function (target, room, user, connection, cmd) {
			return user.console.update(null, user.console.next('text'), null);
		},
		bag: function (target, room, user, connection, cmd) {
			return this.sendReply('Not Avaliable');
		},
		pokemon: function (target, room, user, connection, cmd) {
			return this.sendReply('Not Avaliable');
		},
		pokedex: function (target, room, user, connection, cmd) {
			return this.sendReply('Not Avaliable');
		},
		pc: function (target, room, user, connection, cmd) {
			return this.sendReply('Not Avaliable');
		},
	},
	pickstarter: function (target, room, user) {
		let starters = ['Bulbasaur', 'Chikorita', 'Treecko', 'Turtwig', 'Snivy', 'Chespin', 'Rowlet', 'Charmander', 'Cyndaquil', 'Torchic', 'Chimchar', 'Tepig', 'Fennekin', 'Litten', 'Squirtle', 'Totodile', 'Mudkip', 'Piplup', 'Oshawott', 'Froakie', 'Popplio'];
		if (!target || starters.indexOf(target) === -1) return false;
		Db('players').set(user.userid, SG.unpackTeam(SG.makeWildPokemon(false, {species: target, level: 10, ability: 0})));
		this.parse('/sggame next');
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
