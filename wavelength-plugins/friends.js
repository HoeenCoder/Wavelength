/*
 * FC Friends
 * By WGC
*/
'use strict';

function genFC() {
  const randomCode = () => Math.floor(Math.random() * 89999999) + 10000000;
  let currentCodes = Db.fc.keys().map(curKey => Db.fc.get(curKey));
  let uniqueCode = `WL${randomCode()}`;
  while (currentCodes.some(curCode => uniqueCode === curCode)) {
  	uniqueCode = `WL${randomCode()}`;
  }
  return uniqueCode;
}

const FC = {
	getFC: function (user) {
		user = toId(user);
		let fcget = Db.fc.get(user);
		if (!fcget || fcget === null) return user.reply('You don\'t have a friendcode. Use /fc make to make one.');
		return fcget;
	},

	addFC: function (user, fc) {
		user = toId(user);
		Db.fc.set(user, fc);
		return user.reply('Your friend code has been added to the system. Give to others to add you as a friend!');
	},
};

const Friend = {
	addFriend: function (target, fc, user) {
		target = toId(target);
		fc = fc.toLowerCase();
		let thisFC = FC.getFC(target).toLowerCase();
		if (fc === thisFC) {
			let curFriends = Db.friend.get(user, []);
			curFriends.push(target);
			Db.friend.set(user, curFriends);
			user.popup(`You have added ${target} as a friend.`);
			return;
		} else {
			user.popup(`${fc} is not the right friendcode for ${target}.`);
			return;
		}
	},

	removeFriend: function (target, user) {
		target = toId(target);
		if (!Db.friends.get(user).includes(target)) return this.errorReply('You are not friends with this user.');
		let userid = user.userid;
		let curFriends = Db.friend.get(userid, []);
		if (!curFriends.length) return user.popup("You don't have any friends to remove.");
		let targetIndex = curFriends.findIndex(curFriend => toId(target) === curFriend);
		if (targetIndex <= 0) return user.popup("You are not friends with this user.");
		curFriends.splice(targetIndex, 1);
		Db.friend.set(userid, curFriends);
		user.popup(`You are no longer friends with "${target}".`);
		return user.reply(`You are no longer friends with ${target}.`);
	},
};

exports.commands = {
	fc: {
		make: function (target, room, user) {
			let hasFC = Db.fc.get(user);
			if (!hasFC) {
				if (user.locked) this.errorReply('You can\'t obtain your friend code while locked.');
				let fc = genFC();
				Db.fc.set(user.userid, fc);
				this.popupReply(`Your friend code is ${fc}. If you forget it, use /fc get .`);
			} else {
				this.popupReply('You already have a friend code.');
			}
		},

		get: function (target, room, user) {
			if (user.locked) this.errorReply('You can\'t give out your code while locked.');
			let getfc = FC.getFC(user);
			this.sendReplyBox(`Your friend code is: ${getfc}`);
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
			let [targetUser, targetCode] = target.split(',').map(p => toId(p));
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
			let array = Db.friends.get(user, []);
			let amount = array.length;
			if (!this.runBroadcast()) return;
			if (!amount) return this.sendReply('You have no friends.');
			else return this.sendReply(`You have ${amount} friend${Chat.plural(amount)}: ${array.join(', ')}`);
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
