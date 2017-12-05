/*
 * FC Friends
 * By WGC
*/
'use strict';

function genFC() {
	let fc = Math.floor(Math.random() * 89999999 + 10000000);
	let FCjson = Db.fc.keys();
	let finalFC = 'WL' + fc;
	for (let u of FCjson) {
		while (FCjson[u] == [finalFC]) {
			fc = Math.floor(Math.random() * 89999999 + 10000000);
			finalFC = 'WL' + fc;
		}
	}
	return finalFC;
}

const FC = {
	getFC: function (user) {
		user = toId(user);
		let fcget = Db.fc.get(user);
		return fcget;
	},

	addFC: function (user, fc) {
		user = toId(user);
		Db.fc.set(user, fc);
		return this.sendReply('Your friend code has been added to the system. Give to others to add you as a friend!');
	},
};

const Friend = {
	addFriend: function (target, fc, user) {
		target = toId(target);
		fc = fc.toLowerCase();
		let thisFC = FC.getFC(target);
		thisFC = fc.toLowerCase();
		if (fc === thisFC) {
			if (Db.friend.get(user, []).length === 0) Db.friend.set(user, []);
			Db.friend.set(Db.friend.get(user).push(target));
			user.popup(`You have added ${target} as a friend!`);
			return;
		} else {
			user.popup(`${fc} is not the right friendcode for ${target}.`);
			return;
		}
	},

	removeFriend: function (target, user) { // define tot
		target = toId(target);
		if (!Db.friend.get(user).includes(target)) return this.errorReply('You are not friends with this user.');
		let array = Db.friend.get(user);
		let tot = 0;
		for (let i = 0; i < array.length; i++) {
			if (array[i] !== target) {
				tot = tot + 1;
			} else {
				i = array.length;
			}
		}
		Db.friends.set(Db.friends.get(user).splice(tot, 1));
		return this.sendReply(`You are no longer friends with ${target}.`);
	},
};

exports.commands = {
	fc: {
		make: function (target, room, user) {
			if (user.locked) this.errorReply('You can\'t obtain your friend code while locked.');
			let fc = genFC();
			Db.fc.set(user.userid, fc);
			this.popupReply(`Your friend code is ${fc}. If you forget it, use /fc get .`);
		},

		get: function (target, room, user) {
			if (user.locked) this.errorReply('You can\'t give out your code while locked.');
			let getfc = FC.getFC(user);
			if (getfc == undefined) {
				this.sendReply('You need to make a friend code with /fc make ');
			}
			else {
				this.sendReplyBox(`Your friend code is: ${getfc}`);
			}
		},

		help: function (target, room, user) {
			this.sendReplyBox('<h2> Friend Code Commands: </h2><br />' +
            '<i> /fc make </i> - Makes your friend code. <br />' +
            '<i> /fc get </i> - Displays your friend code (in case you forget.)');
		},
	},

	friends: 'friend',
	friend: {
		add: function (target, room, user) {
			if (user.locked) this.errorReply('You can\'t make friends while locked.');
			let split = target.split(', ');
			let targetUser = split[0];
			targetUser = toId(targetUser);
			let addFc = split[1];
			if (!split[0] || !split[1]) return this.errorReply('/friend add [friend], [fc]');
			if (!FC.getFC(targetUser)) return this.errorReply('Tell your friend to get a FC. /fc make');
			if (targetUser < 1) return this.errorReply('Invalid user.');
			if (targetUser > 19) return this.errorReply('Invalid user.');
			Friend.addFriend(targetUser, addFc, user);
		},

		remove: function (target, room, user) {
			if (!target) return this.errorReply('/friend remove [friend]');
			if (target < 1) return this.errorReply('Invalid user.');
			if (target > 19) return this.errorReply('Invalid user.');
			Friend.removeFriend(target, user);
		},

		removeall: function (target, room, user) {
			if (Db.friends.get(user).length === 0) this.errorReply('You have no friends.');
			Db.friends.set(Db.friends.get(user), []);
			this.sendReply('You have removed all of your friends');
		},

		list: function (target, room, user) {
			let num = [];
			let array = Db.friend.get(user);
			let amount = array.length;
			for (let i in array) {
				num.push(array[i]);
			}
 	        if (!this.runBroadcast()) return;
			if (array.length === 0) {
				return this.sendReply('You have no friends.');
			} else if (array.length === 1) {
				return this.sendReplyBox(`You have 1 friend, named ${num}.`);
			} else {
				return this.sendReplyBox(`You have ${amount} friends. Their names are: ${num}.`);
			}
		},
		help: function (target, room, user) {
			this.sendReplyBox(
				'<h2> Friends Commands: </h2> <br />' +
            '<i> /friend add [target], [friend code] </i> - Adds a friend. <br />' +
            '<i> /friend remove [target] </i> - Removes a friend. <br />' +
            '<i> /friend list </i> - Lists all your friends. <br />' +
            '<i> /friend removeall </i> - Removes all friends.'
			);
		},
	},
}; 