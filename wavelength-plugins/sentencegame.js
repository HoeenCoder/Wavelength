/***************************
 * Sentence Games for PS!	*
 * Inspired by fender & ASL*
 * Rewrote by Insist			*
 ***************************/

"use strict";

const badEndings = ["the", "and", "a", "an", "or", "with", "to"];

function cleanWord(word) {
	let reg = /[^a-zA-Z0-9 :]/g;
	let clean = Chat.escapeHTML(word);
	if (reg.test(word)) {
		return false;
	} else {
		return clean;
	}
}

class SentenceGame {
	constructor(room, wordCount) {
		this.room = room;
		this.wordCount = wordCount;
		this.sentence = [];
		this.lastUser = null;
		this.room.addRaw(`<div class="broadcast-green"><h2 style="font-weight: bold">A Sentence Game has been created with ${this.wordCount} words!</h2><small style="font-style: italic">You may add words by using /sentence aw [word].</small></div>`);
	}

	addWord(user, word, self) {
		if (this.lastUser === user.userid) return self.errorReply(`You were the last user to add a word, try letting other users join in.`);
		if (word === this.sentence[this.sentence.length - 1]) return self.errorReply(`${word} was the last word, try something else to make it interesting.`);
		if (cleanWord(word) === false) return self.errorReply(`You may only use alpha characters.`);
		if (word.length > 20) return self.errorReply(`Let's try to keep words a maximum of 20 characters.`);
		if (word.indexOf(" ") > -1) return self.errorReply(`You may not add spaces (don't worry we automatically space for you).`);
		if (this.sentence.length === this.wordCount - 1 && badEndings.indexOf(word) > -1) return self.errorReply(`${word} is a boring way to end this sentence.`);
		this.sentence.push(word);
		this.lastUser = user.userid;
		let wordsLeft = this.wordCount - this.sentence.length;
		this.room.addRaw(`${WL.nameColor(user.name, true, true)} has added "${word}" to the sentence.<br />Sentence: ${this.sentence.join(" ")}.<br />${wordsLeft === 0 ? `` : `<small>There ${wordsLeft === 1 ? `is` : `are`} ${wordsLeft} word${wordsLeft === 1 ? `` : `s`} remaining in this Sentence Game.</small>`}`);
		if (this.sentence.length === this.wordCount) {
			this.endGame();
		}
	}

	endGame(forced) {
		if (!forced) this.room.addRaw(`<div class="broadcast-green"><strong style="text-align: center">This Sentence Game has been finished!<br /><br />Final Sentence: ${this.sentence.join(" ")}.</div>`);
		if (forced) this.room.addRaw(`${WL.nameColor(forced, true, true)} has ended the Sentence Game in this room forcefully.`);
		delete this.room.sentence;
	}
}

exports.commands = {
	sentencegame: "sentence",
	sentence: {
		create: "new",
		make: "new",
		new: function (target, room, user) {
			if (!this.can("minigame", null, room)) return false;
			if (!this.canTalk()) return;
			if (room.sentence) return this.errorReply(`There is already a Sentence Game in this room.`);
			if (!target) target = 10;
			if (isNaN(target)) return this.errorReply(`The word count must be a valid number.`);
			if (target < 5 || target > 20) return this.errorReply(`The word count must be at least 5 and a maximum of 20.`);
			room.sentence = new SentenceGame(room, target);
		},

		addword: "aw",
		aw: function (target, room, user) {
			if (!this.canTalk()) return;
			if (!room.sentence) return this.errorReply(`There isn't a Sentence Game in this room.`);
			if (!target) return this.errorReply(`Please include the word you want to add.`);
			room.sentence.addWord(user, target, this);
		},

		info: "info",
		displaysentence: "show",
		display: "show",
		showsentence: "show",
		show: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (!room.sentence) return this.errorReply(`There isn't a Sentence Game in this room.`);
			if (room.sentence.sentence.length < 1) return this.errorReply(`The sentence hasn't begun in this game yet.`);
			return this.sendReplyBox(`<strong>Current Sentence:</strong> ${room.sentence.sentence.join(" ")}.<br /><strong>Progress:</strong> ${room.sentence.sentence.length}/${room.sentence.wordCount} words.<br /><strong>Last User:</strong> ${WL.nameColor(room.sentence.lastUser, true, true)}.`);
		},

		end: function (target, room, user) {
			if (!this.can("minigame", null, room)) return false;
			if (!this.canTalk()) return;
			if (!room.sentence) return this.errorReply(`There is no Sentence Game to end in this room.`);
			room.sentence.endGame(user.name);
		},

		"": "help",
		help: function () {
			this.parse(`/help sentence`);
		},
	},

	sentencehelp: [
		`/sentence new [word count] - Creates a Sentence Game in the room with [word count] words as the limit. Requires %, @, &, #, ~
		/sentence addword [word] - Adds [word] to the sentence.
		/sentence info - Shows you the current sentence, the progress until completion and who added the last word.
		/sentence end - Forcefully ends the Sentence Game in the room. Requires %, @, &, #, ~
		/sentence help - Displays a list of Sentence Game commands.`,
	],
};
