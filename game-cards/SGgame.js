'use strict';

class SGgame extends Console.Console {
	constructor(user, room, muted) {
		super(user, room, 'background: linear-gradient(green, white);', '<center><br/><br/><br/><br/><img src="http://i.imgur.com/tfYS6TN.png"/></center><!--split-->', '<center><!--mutebutton--><button name="send" value="/console sound" class="button">' + (muted ? 'Unmute' : 'Mute') + '</button><!--endmute-->  <button name="send" value="/console shift" class="button">Shift</button> <button class="button disabled" name="send" value="/sggame pokemon">Pokemon</button> <button class="button disabled" name="send" value="/sggame bag">Bag</button> <button class="button disabled" name="send" value="/sggame pc">PC Boxes</button>', muted);
		// Lines of text to be displayed
		this.gameId = 'SGgame';
		this.queue = [];
		this.queueAction = null;
		this.lastNextAction = null;
		this.curPane = null;
		this.callback = false;
		this.location = null;
		this.nextSymbol = '\u2605';
	}
	buildMap(location) {
		// TODO locations, and actual map, ect
		return this.defaultHTML;
	}
	next(hideButton) {
		let base = this.buildMap();
		if (!this.queue.length) return base;
		let msg = this.queue.shift(), type = msg.split('|')[0], parts = null;
		switch (type) {
		case 'text':
			switch (msg.split('|')[2]) {
			case 'hide':
				hideButton = true;
				this.lastNextAction = 'hide';
				msg = msg.split('|')[1];
				break;
			case 'callback':
				this.callback();
				this.lastNextAction = 'callback';
				msg = msg.split('|')[1];
				break;
			default:
				this.lastNextAction = null;
				msg = msg.split('|')[1];
			}
			parts = base.split('<!--split-->');
			return parts.shift() + '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; color: #000;">' + msg + (hideButton ? '' : '<button style="border: none; background: none; color: purple; cursor: pointer;" name="send" value="/sggame next"><u>&#9733;</u></button>') + '</div>' + parts.join('');
			//break;
		case 'learn':
			if (this.queueAction) {
				this.queue.unshift(msg);
				return base;
			}
			let poke = Db.players.get(this.userid).party[Number(msg.split('|')[1])];
			if (poke.moves.length < 4) {
				// Automatically learn the move
				let obj = Db.players.get(this.userid);
				obj.party[Number(msg.split('|')[1])].moves.push(toId(msg.split('|')[2]));
				Db.players.set(this.userid, obj);
				parts = base.split('<!--split-->');
				return parts.shift() + '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; color: #000;">' + (poke.name || poke.species) + ' learned ' + msg.split('|')[2] + '!</div>' + parts.join('');
			}
			this.queueAction = msg;
			parts = base.split('<!--split-->');
			return parts.shift() + '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; color: #000;"><center>' + (poke.name || poke.species) + ' wants to learn the move ' + msg.split('|')[2] + '.<br/>Should a move be forgotten for ' + msg.split('|')[2] + '<br/><button name="send" value="/sggame learn" style="border: none; background: none; color: grey">Forget a move</button> <button name="send" value="/sggame learn reject" style="border: none; background: none; color: grey">Keep old moves</button></center></div>' + parts.join('');
			//break;
		case 'evo':
			if (this.queueAction) {
				this.queue.unshift(msg);
				return base;
			}
			return base; // TODO
			//break;
		default:
			console.log('Invalid type: ' + type + '. While running (console).next()');
			return base;
		}
	}
	bag(menu) {
		if (!menu) menu = 'items';
	}
	pc(box, slot, action) {
		if (this.curPane && this.curPane !== 'pc') return this.buildMap();
		this.curPane = 'pc';
		if (action === 'close') {
			this.curPane = null;
			return this.buildMap();
		}
		let targetParty = (box.split('|')[0] === 'party');
		if (targetParty) box = box.split('|')[1];
		if (!box || isNaN(Number(box)) || box < 0 || box > Db.players.get(this.userid).pc.length) box = 1;
		box = Number(box);
		slot = Number(slot);
		let user = Db.players.get(this.userid);
		let pokemon;
		switch (action) {
		case 'deposit':
			if (user.party.length <= 1) break;
			pokemon = user.party[slot];
			user.boxPoke([pokemon], box);
			user.party.splice(slot, 1);
			Db.players.set(this.userid, user);
			slot = null;
			break;
		case 'withdraw':
			if (user.party.length > 5) break;
			pokemon = user.pc[box - 1][slot];
			user.unBoxPoke(box, slot);
			user.party = user.party.concat(Dex.fastUnpackTeam(pokemon));
			Db.players.set(this.userid, user);
			slot = null;
			break;
		case 'release':
			// Falls through
			break;
		case 'confirmrelease':
			if (targetParty) {
				if (user.party.length <= 1) break;
				user.party.splice(slot, 1);
				Db.players.set(this.userid, user);
				slot = null;
			} else {
				user.pc[box - 1].splice(slot, 1);
				Db.players.set(this.userid, user);
				slot = null;
			}
			break;
		default:
			// Unhandled
		}
		// Build output
		let output = this.buildMap();
		output += '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);">';
		output += '<div style="display: inline-block; float: left; width: 70%; height: 100%;"><center><button class="button" name="send" value="/sggame pc ' + (box - 1 <= 0 ? user.pc.length : box - 1) + '">&#8592;</button> <b>Box ' + box + '</b> <button class="button" name="send" value="/sggame pc ' + (box + 1 > user.pc.length ? 1 : box + 1) + '">&#8594;</button><hr/></center><table style="width: 100%; height: 80%">';
		let count = 0;
		for (let i = 0; i < 5; i++) {
			output += '<tr style="width: 100%;">';
			for (let j = 0; j < 6; j++) {
				let bg = user.pc[(box - 1)][count];
				let species;
				if (bg) species = (user.pc[(box - 1)][count].split('|')[1] ? user.pc[(box - 1)][count].split('|')[1] : user.pc[(box - 1)][count].split('|')[0]);
				bg = (bg ? SG.getPokemonIcon(species) : 'background: none');
				output += '<td style="width: 15%; height: 20%;"><button style="' + bg + '; width: 50px; height: 32px; border: 1px solid #AAA; border-radius: 5px;" name="send" value="/sggame pc ' + box + ', ' + count + '"></button></td>';
				count++;
			}
			output += "</tr>";
		}
		output += '</table></div><div style="display: inline-block; float: right; width: 30%; height: 100%; text-align: center;"><center style="height: 8.6%;"><b>Party</b></center><hr/>';
		let fullSlot = false;
		if (targetParty) {
			fullSlot = !!user.party[slot];
		} else {
			fullSlot = !!user.pc[box - 1][slot];
		}
		if ((slot || slot === 0) && fullSlot) {
			if (targetParty) {
				if (isNaN(slot) || slot < 0 || slot > 5) return output + 'Error</div></div>';
				let bg = 'background: none;';
				if (user.party[slot]) {
					let species = Dex.getTemplate(user.party[slot].species).spriteid;
					bg = 'background: url(//play.pokemonshowdown.com/sprites/xyani' + (user.party[slot].shiny ? '-shiny' : '') + '/' + species + '.gif) no-repeat top center;';
				}
				output += '<div style="width: 100%; height: 85%; ' + bg + ' text-align: center;"><br/><br/><br/><br/><br/><br/><b>' + ((user.party[slot].name && user.party[slot].name !== user.party[slot].species) ? user.party[slot].name + '<br/>(' + user.party[slot].species + ')' : user.party[slot].species) + '</b> Lvl ' + (user.party[slot].level) + '<br/>';
				if (action === 'release') {
					output += 'Are you sure you want to release this pokemon?<br/>This cannot be undone.<br/><button class="button" name="send" value="/sggame pc party|' + box + ', ' + slot + ', confirmrelease">Yes, release this pokemon</button>';
				} else {
					output += '<b>Ability</b>: ' + user.party[slot].ability + '<br/><b>Item</b>: ' + (user.party[slot].item || 'none') + '<br/><b>Moves</b>:<br/>';
					for (let i = 0; i < user.party[slot].moves.length; i++) {
						output += user.party[slot].moves[i] + '<br/>';
					}
				}
				output += '</div>';
			} else {
				if (isNaN(slot) || slot < 0 || slot > 29) return output + 'Error</div></div>';
				let data = Dex.fastUnpackTeam(user.pc[(box - 1)][slot])[0];
				if (!data) return output + 'Error</div></div>';
				let bg = 'background: none;';
				if (data) {
					let species = Dex.getTemplate(data.species).spriteid;
					bg = 'background: url(//play.pokemonshowdown.com/sprites/xyani' + (data.shiny ? '-shiny' : '') + '/' + species + '.gif) no-repeat top center;';
				}
				output += '<div style="width: 100%; height: 85%; ' + bg + ' text-align: center;"><br/><br/><br/><br/><br/><br/><b>' + ((data.name && data.name !== data.species) ? data.name + '<br/>(' + data.species + ')' : data.species) + '</b> Lvl ' + (data.level) + '<br/>';
				if (action === 'release') {
					output += 'Are you sure you want to release this pokemon?<br/>This cannot be undone.<br/><button class="button" name="send" value="/sggame pc ' + box + ', ' + slot + ', confirmrelease">Yes, release this pokemon</button>';
				} else {
					output += '<b>Ability</b>: ' + data.ability + '<br/><b>Item</b>: ' + (data.item || 'none') + '<br/><b>Moves</b>:<br/>';
					for (let i = 0; i < data.moves.length; i++) {
						output += data.moves[i] + '<br/>';
					}
				}
				output += '</div>';
			}
		} else {
			// Show the users party
			for (let i = 0; i < 6; i++) {
				let bg = 'background: none';
				if (user.party[i]) bg = SG.getPokemonIcon(user.party[i].species);
				output += '<button name="send" value="/sggame pc party|' + box + ', ' + i + '" style="' + bg + '; width: 50px; height: 32px; border: 1px solid #AAA; border-radius: 5px; margin-bottom: 0.4em;"></button> ';
			}
		}
		output += '</div></div>';
		return output;
	}
	buildBase(addOn, data) {
		if (!addOn) return this.defaultBottomHTML;
		let output = this.defaultBottomHTML + "<br/>";
		switch (addOn) {
		case "pc":
			output += '<center><button name="send" value="/sggame pc ' + data.box + ', ' + data.slot + ', deposit" class="button ' + (data.deposit ? '' : 'disabled') + '">Deposit</button> <button class="button ' + (data.withdraw ? '' : 'disabled') + '" name="send" value="/sggame pc ' + data.box + ', ' + data.slot + ', withdraw">Withdraw</button> ';
			output += '<button class="button ' + (data.release ? '' : 'disabled') + '" name="send" value="/sggame pc ' + data.box + ', ' + data.slot + ', release">Release</button> <button class="button ' + (data.back ? '' : 'disabled') + '" name="send" value="/sggame back">Back</button> <button name="send" value="/sggame pc ,,close" class="button">Close</button></center>';
			break;
		}
		return output;
	}
	onKill() {
		let user = Users(this.userid);
		for (let key of user.inRooms) {
			if (Rooms.get(key).type === 'battle' && Dex.getFormat(Rooms(key).format).useSGgame && user.games.has(key)) {
				// FORCE FORFEIT
				Rooms(key).game.forfeit(user);
			}
		}
	}
}

class Player {
	constructor(user, starter) {
		this.game = 'SGgame - Alpha';
		this.userid = user.userid;
		this.poke = 0; // Currency
		this.startedOn = Date.now();
		this.bag = {items: {}, pokeballs: {}, medicine: {}, berries: {}, tms: {}, keyitems: {}};
		// Array of boxes (arrays), max of 30 boxes, 30 pokemon per box, stored as strings
		this.pc = [[], [], [], [], [], [], ["HoeenHero|ludicolo|||scald,gigadrain,icebeam,raindance|Jolly||M|20,30,23,3,30,28||50|0"], [], [], []];
		this.party = starter;
		this.pokedex = {};
		// More to come...
	}
	test() {
		return true;
	}
	boxPoke(pokemon, box) {
		if (typeof pokemon !== 'string') {
			pokemon = Dex.packTeam(pokemon);
			if (!pokemon) return false;
		}
		let count = 0, first = false;
		for (let i = 0; i < this.pc.length; i++) {
			if (this.pc[i].length > 0) count++;
			if (this.pc[i].length >= 30) continue;
			if (!first) first = i;
		}
		if (first === false) return false; // PC is full
		if (!box || isNaN(Number(box)) || box > 30 || box < 0 || this.pc[box - 1].length >= 30) box = first + 1;
		if (count >= this.pc.length && this.pc.length < 30) {
			// Increase PC size
			for (let i = 0; i < 7; i++) {
				if (this.pc.length >= 30) break;
				this.pc.push([]);
			}
		}
		this.pc[box - 1].push(pokemon);
		return box;
	}
	unBoxPoke(box, slot) {
		box = Number(box);
		slot = Number(slot);
		if (!box || isNaN(box) || box > 30 || box <= 0 || this.pc[box - 1].length >= 30) return false;
		if ((!slot && slot !== 0) || isNaN(slot) || slot > 30 || slot < 0) return false;
		this.pc[box - 1].splice(slot, 1);
		return true;
	}
}

exports.box = {
	startCommand: '/playalpha',
	name: 'SGgame - Alpha',
};

exports.commands = {
	confirmresetalpha: 'playalpha',
	resetalpha: 'playalpha',
	continuealpha: 'playalpha',
	playalpha: function (target, room, user, connection, cmd) {
		if (cmd === 'resetalpha' && user.console) return user.console.update(false, '<h2><center>Are You sure ?<br /><button class="button" name="send" value="/confirmresetalpha">Yes</button> <button class="button" name="send" value="/sggame back">No</button>', false);
		if (cmd === 'resetalpha') return; // User didnt have a console setup.
		if (user.console) this.parse('/console kill');
		user.console = new SGgame(user, room, !!target);
		if (cmd === 'playalpha') {
			let htm = '<center>';
			if (Db.players.has(user.userid)) htm += '<button name="send" value="/continuealpha" style="display: block; border: 5px solid #AAA; background: #FFF; font-family: monospace; border-radius: 5px; width: 90%; text-align: left;"><b>CONTINUE</b><br/><br/><span style="color: #4286f4">PLAYER ' + user.name + '<br/><br/>TIME ' + Math.floor(Math.abs(Date.now() - Db.players.get(user.userid).startedOn) / 86400000) + '<br/><br/>POKEDEX ' + Object.keys(Db.players.get(user.userid).pokedex).length + '</span></button>';
			htm += '<button name="send" value="/confirmresetalpha" style="display: block; border: 5px solid #AAA; background: #FFF; font-family: monospace; border-radius: 5px; width: 90%; text-align: left;"><b>NEW GAME</b></button></center>';
			user.console.init();
			user.console.update('background-color: #6688AA;', htm, null);
		} else if (cmd === 'confirmresetalpha') {
			// New Game
			user.console.queue = ['text|Welcome to the world of Pokemon!<br/>I\'m HoeenHero, one of the programmers for the game. (click the star to continue)',
				'text|Were not done creating the game yet so its limited as to what you can do.<br/>But you can help out by testing whats here, and reporting any issues you find!',
				'text|Lets get you setup.<br/>Pick a starter:'];
			let msg = '';
			let starters = [['Bulbasaur', 'Chikorita', 'Treecko', 'Turtwig', 'Snivy', 'Chespin', 'Rowlet'], ['Charmander', 'Cyndaquil', 'Torchic', 'Chimchar', 'Tepig', 'Fennekin', 'Litten'], ['Squirtle', 'Totodile', 'Mudkip', 'Piplup', 'Oshawott', 'Froakie', 'Popplio'], ['Pikachu'], ['Eevee']];
			for (let i = 0; i < starters.length; i++) {
				let color = (i === 0 ? 'green' : (i === 1 ? 'red' : (i === 2 ? 'blue' : (i === 3 ? '#E5DA2A' : '#B08257'))));
				for (let j = 0; j < starters[i].length; j++) {
					msg += '<button name="send" value="/pickstarter ' + starters[i][j] + '" style="border: none; background: none; color: ' + color + '"><u>' + starters[i][j] + '</u></button> ';
				}
				msg += (i + 1 < starters.length ? '<br/>' : '');
			}
			user.console.queue.push('text|' + msg + '|hide');
			user.console.callback = function () {
				user.console.defaultBottomHTML = '<center><!--mutebutton--><button name="send" value="/console sound" class="button">' + (user.console.muted ? 'Unmute' : 'Mute') + '</button><!--endmute--> <button name="send" value="/console shift" class="button">Shift</button> <button class="button disabled" name="send" value="/sggame pokemon">Pokemon</button> <button class="button disabled" name="send" value="/sggame bag">Bag</button> <button class="button" name="send" value="/sggame pc">PC Boxes</button> <button name="send" value="/search gen7wildpokemonalpha" class="button">Battle!</button> <button name="send" value="/resetalpha" class="button">Reset</button>';
				user.console.callback = null;
			};
			user.console.queue.push('text|Great choice! I\'ll leave you to your game now.|callback');
			user.console.init();
			this.parse('/sggame next');
		} else {
			// Continue
			if (!Db.players.has(user.userid)) return this.parse('/confirmresetalpha');
			try {
				Db.players.get(user.userid).test();
			} catch (e) {
				let newObj = new Player(user.userid, Dex.fastUnpackTeam(SG.makeWildPokemon(false, {name: "ERROR!", species: "Mudkip", level: 10, ability: 0})));
				Object.assign(newObj, Db.players.get(user.userid));
				Db.players.set(user.userid, newObj);
			}
			user.console.queue = ['text|Welcome back to the alpha, tell me if you like the game or find any bugs!'];
			user.console.defaultBottomHTML = '<center><!--mutebutton--><button name="send" value="/console sound" class="button">' + (user.console.muted ? 'Unmute' : 'Mute') + '</button><!--endmute--> <button name="send" value="/console shift" class="button">Shift</button> <button class="button disabled" name="send" value="/sggame pokemon">Pokemon</button> <button class="button disabled" name="send" value="/sggame bag">Bag</button> <button class="button" name="send" value="/sggame pc">PC Boxes</button> <button name="send" value="/search gen7wildpokemonalpha" class="button">Battle!</button> <button name="send" value="/resetalpha" class="button">Reset</button>';
			user.console.init();
			this.parse('/sggame next');
		}
	},
	sggame: {
		next: function (target, room, user, connection, cmd) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			if (user.console.lastNextAction === 'hide') return;
			return user.console.update(null, user.console.next(), null);
		},
		learn: function (target, room, user) {
			if (!user.console || user.console.gameId !== 'SGgame' || !user.console.queueAction) return;
			target = toId(target);
			let action = user.console.queueAction.split('|');
			if (action[0] !== 'learn') return;
			let pokemon = Db.players.get(user.userid).party[Number(action[1])];
			let template = Dex.getTemplate(pokemon.species);
			if (!target) {
				// Pull up move selection menu to pick what to forget
				user.console.curPane = 'learn'; // Force override any open pane
				let output = user.console.buildMap();
				output += '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);">';
				output += '<div style="display: inline-block; float: left; width: 50%; height: 100%;">';
				output += '<center><img src="http://pokemonshowdown.com/sprites/xyani/' + toId(pokemon.species) + '.gif" alt="' + pokemon.species + '"/><br/>';
				output += '<b>Name</b>:' + (pokemon.name && pokemon.name !== pokemon.species ? pokemon.name + '(' + pokemon.species + ')' : pokemon.species) + '<br/>';
				output += '<b>Type</b>: <img src="http://play.pokemonshowdown.com/sprites/types/' + template.types[0] + '.png" alt="' + template.types[0] + '"/>' + (template.types[1] ? ' <img src="http://play.pokemonshowdown.com/sprites/types/' + template.types[1] + '.png" alt="' + template.types[1] + '"/>' : '') + '<br/>';
				output += '<b>Ability</b>: ' + pokemon.ability + '<br/>';
				output += '<b>Item</b>:' + (pokemon.item ? pokemon.item : 'None') + '<br/>';
				output += '<b>OT</b>:' + pokemon.ot + '<br/>';
				output += '<b>Level</b>:' + pokemon.level + '<br/>';
				let nextLevel = SG.calcExp(pokemon.species, pokemon.level + 1), curLevel = SG.calcExp(pokemon.species, pokemon.level);
				output += '<b>Exp</b>:' + Math.round(pokemon.exp) + ' / ' + Math.round(nextLevel) + '<br/>';
				output += '<progress max="' + (nextLevel - curLevel) + '" value="' + (pokemon.exp - curLevel) + '"></progress></center></div>';
				let move = null;
				output += '<div style="display: inline-block; float: right; width: 50%; height: 100%; text-align: center;"><div class="movemenu"><center>';
				for (let m = 0; m < pokemon.moves.length; m++) {
					move = Dex.getMove(pokemon.moves[m]);
					output += '<button name="send" value="/sggame learn ' + move.id + '" class="type-' + move.type + '">' + move.name + '<br/><small class="type">' + move.type + '</small> <small class="pp">' + move.pp + '/' + move.pp + '</small>&nbsp;</button><br/><br/><br/>';
				}
				move = Dex.getMove(action[2]);
				output += '<button name="send" value="/sggame learn cancel" class="type-' + move.type + '">' + move.name + '<br/><small class="type">' + move.type + '</small> <small class="pp">' + move.pp + '/' + move.pp + '</small>&nbsp;</button><br/><br/><br/>';
				output += '</center></div></div></div>';
				return user.console.update(null, output, null);
			} else if (target === 'reject') {
				// Cancel the move learning.
				user.console.queueAction = null;
				user.console.queue.unshift('text|' + (pokemon.name || pokemon.species) + ' did not learn ' + action[2] + '.');
				user.console.lastNextAction = null;
				user.console.curPane = null;
				return this.parse('/sggame next');
			} else if (target === 'cancel') {
				// Step back
				user.console.queue.unshift(user.console.queueAction);
				user.console.queueAction = null;
				user.console.lastNextAction = null;
				user.console.curPane = null;
				return this.parse('/sggame next');
			} else {
				// Attempt to forget the specified move, and learn action[2]
				if (pokemon.moves.indexOf(toId(target)) === -1) return false; // The pokemon dosent know this move.
				let obj = Db.players.get(user.userid);
				obj.party[Number(action[1])].moves.splice(pokemon.moves.indexOf(toId(target)), 1);
				obj.party[Number(action[1])].moves.push(toId(action[2]));
				Db.players.set(user.userid, obj);
				user.console.queueAction = null;
				user.console.queue.unshift('text|1, 2, 3 and... POOF!<br/>' + (pokemon.name || pokemon.species) + ' forgot ' + target + ' and learned ' + action[2] + '!');
				user.console.lastNextAction = null;
				user.console.curPane = null;
				return this.parse('/sggame next');
			}
		},
		bag: function (target, room, user, connection, cmd) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			return this.sendReply('Not Avaliable');
		},
		pokemon: function (target, room, user, connection, cmd) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			return this.sendReply('Not Avaliable');
		},
		pokedex: function (target, room, user, connection, cmd) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			return this.sendReply('Not Avaliable');
		},
		back: function (target, room, user) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			user.console.update(user.console.prevScreen[0], user.console.prevScreen[1], user.console.prevScreen[2]);
		},
		pc: function (target, room, user, connection, cmd) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			if (user.console.queue.length) return; // No PC while talking
			target = target.split(',');
			target = target.map(data => {
				return data.trim();
			});
			for (let key of user.inRooms) {
				if (key.substr(0, 6) === 'battle' && Dex.getFormat(Rooms(key).format).useSGgame && user.games.has(key) && target[2] !== 'close') return false; // No PC while battling
			}
			let slot = target[1];
			let box = (target[0].split('|')[0] === 'party' ? target[0].split('|')[1] : target[0]);
			let orders = {};
			if (target[0].split('|')[0] === 'party' && slot && Db.players.get(user.userid).party.length > 1 && !isNaN(Number(slot)) && Number(slot) > -1 && Number(slot) < 6 && !target[2]) {
				orders = {deposit: true, release: true, back: true};
			}
			if (slot && !isNaN(Number(slot)) && Number(slot) > -1 && Number(slot) < 30 && Db.players.get(user.userid).pc[Number(box) - 1][Number(slot)] && !target[2] && target[0].split('|')[0] !== 'party') {
				orders = {withdraw: (Db.players.get(user.userid).party.length < 6), release: true, back: true};
			}
			if (target[2] === 'release') orders.back = true;
			if ((slot || Number(slot) === 0) && !target[2]) orders.back = true;
			switch (target[2]) {
			case 'withdraw':
				if (target[0].split('|')[0] === 'party') {
					target[2] = '';
					orders = {deposit: (Db.players.get(user.userid).party.length > 1), release: (Db.players.get(user.userid).party.length > 1), back: true};
				}
				break;
			case 'deposit':
				if (target[0].split('|')[0] !== 'party') {
					target[2] = '';
					orders = {withdraw: (Db.players.get(user.userid).party.length < 6), release: true, back: true};
				}
				break;
			case 'release':
			case 'confirmrelease':
				if (target[0].split('|')[0] === 'party' && Db.players.get(user.userid).party.length <= 1) {
					target[2] = '';
					orders = {back: true};
				}
				break;
			}
			orders.box = target[0];
			orders.slot = slot;
			let base = ((target[2] === 'close' || (user.console.curPane && user.console.curPane !== 'pc')) ? user.console.buildBase() : user.console.buildBase('pc', orders));
			return user.console.update(user.console.curScreen[0], user.console.pc(target[0], slot, target[2]), base);
		},
	},
	confirmpickstarter: 'pickstarter',
	pickstarter: function (target, room, user, connection, cmd) {
		if (!user.console || user.console.gameId !== 'SGgame') return;
		let starters = ['Bulbasaur', 'Chikorita', 'Treecko', 'Turtwig', 'Snivy', 'Chespin', 'Rowlet', 'Charmander', 'Cyndaquil', 'Torchic', 'Chimchar', 'Tepig', 'Fennekin', 'Litten', 'Squirtle', 'Totodile', 'Mudkip', 'Piplup', 'Oshawott', 'Froakie', 'Popplio', 'Pikachu', 'Eevee'];
		if (!target || starters.indexOf(target) === -1) return false;
		let type, typeColor;
		if (starters.indexOf(target) <= 6) {
			type = "Grass";
			typeColor = "green";
		} else if (starters.indexOf(target) >= 7 && starters.indexOf(target) <= 13) {
			type = "Fire";
			typeColor = "red";
		} else if (starters.indexOf(target) >= 14 && starters.indexOf(target) <= 20) {
			type = "Water";
			typeColor = "blue";
		} else if (starters.indexOf(target) === 21) {
			type = "Electric";
			typeColor = "yellow";
		} else {
			type = "Normal";
			typeColor = "#B08257";
		}
		switch (cmd) {
		case 'pickstarter':
			user.console.update(null, "<br /><br /><br /><br /><br /><div style='background-color:rgba(0, 0, 0, 0.4); border-radius:8px; text-align:center'><b><font size='3'>Do You Want to Pick <font color='" + typeColor + "'>" + type + " type " + target + " </font></b>?<br /><img src='http://play.pokemonshowdown.com/sprites/xyani/" + toId(target) + ".gif'><br /><button class='button' name='send' value='/confirmpickstarter " + target + "'>Yes</button>&nbsp;&nbsp;<button class='button' name='send' value='/sggame back'>No</button></div>", null);
			break;
		case 'confirmpickstarter':
			let obj = new Player(user, Dex.fastUnpackTeam(SG.makeWildPokemon(false, {species: target, level: 10, ability: 0, ot: user.userid})));
			Db.players.set(user.userid, obj);
			user.console.lastNextAction = null;
			this.parse('/sggame next');
		}
	},
	throwpokeball: function (target, room, user) {
		if (!user.console || user.console.gameId !== 'SGgame') return;
		if (!room.battle || toId(room.battle.format) !== 'gen7wildpokemonalpha') return this.errorReply('You can\'t throw a pokeball here!');
		if (room.battle.ended) return this.errorReply('The battle is already over, you can\'t throw a pokeball.');
		target = toId(target);
		if (['pokeball', 'greatball', 'ultraball', 'masterball'].indexOf(target) === -1) return this.errorReply('Thats not a pokeball, or at least not one we support.');
		if (target === 'masterball' && !user.can('hotpatch')) return this.errorReply('You don\'t have any Master Balls.');
		let side = (toId(room.battle.p1.name) === toId(user) ? "p1" : "p2");
		if (room.battle.ended) return this.errorReply('The battle has already ended.');
		if (toId(room.battle[side].name) !== user.userid) return this.errorReply('You cant throw a pokeball because your not the trainer here!');
		let data = target + "|" + user.name;
		room.battle.send('pokeball', data.replace(/\n/g, '\f'));
	},
};
