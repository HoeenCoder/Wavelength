/*********************************
 * Tasks (To-Do/Jobs) Plug-in		*
 * Created for Pokemon Showdown	*
 * Created by Insist					*
 ********************************/

"use strict";

function isDev(user) {
	if (!user) return;
	if (typeof user === "object") user = user.userid;
	let dev = Db.devs.get(toId(user));
	if (dev === 1) return true;
	return false;
}

function alertDevs(message) {
	let developers = Db.devs.keys();
	for (let u in developers) {
		if (!Users(developers[u]) || !Users(developers[u]).connected) continue;
		Users(developers[u]).send(`|pm|~Developer Alert|~|/raw ${message}`);
	}
	if (Rooms(`development`)) Rooms(`development`).add(`|c|~Developer Alert|/raw ${message}`).update();
}

exports.commands = {
	jobs: "tasks",
	job: "tasks",
	todo: "tasks",
	task: "tasks",
	tasks: {
		new: "add",
		issue: "add",
		add: function (target, room, user) {
			if (!isDev(user.userid) && !this.can("bypassall")) return false;
			let [issue, ...description] = target.split(",").map(p => p.trim());
			let task = Db.tasks.get("development");
			if (!issue || !description) return this.parse("/taskshelp");
			if (task.issues[toId(issue)]) return this.errorReply(`This issue title already exists.`);
			if (issue.length < 1 || issue.length > 30) return this.errorReply(`The issue title should not exceed 30 characters long. Feel free to continue in the description.`);
			if (description.length < 1 || description.length > 100) return this.errorReply(`The description should not exceed 100 characters long.`);
			task.issues[toId(issue)] = {"id": toId(issue), "issue": issue, "description": description, "employer": user.userid};
			Db.tasks.set("development", task);
			alertDevs(`${WL.nameColor(user.name, true, true)} has filed an issue. Issue: ${issue}. Description: ${description}.`);
			return this.sendReply(`The task "${issue}" has been added to the server task list.`);
		},

		remove: "delete",
		clear: "delete",
		fixed: "delete",
		delete: function (target, room, user) {
			if (!isDev(user.userid) && !this.can("bypassall")) return false;
			target = toId(target);
			let task = Db.tasks.get("development");
			if (!target) return this.parse(`/taskshelp`);
			if (!task.issues[target]) return this.errorReply(`The issue "${target}" has not been reported.`);
			delete task.issues[target];
			Db.tasks.set(task);
			return this.sendReply(`The task "${target}" has been deleted.`);
		},

		"": "list",
		tasks: "list",
		task: "list",
		list: function (target, room, user) {
			if (!isDev(user.userid) && !this.can("bypassall")) return false;
			if (room && room.id === 'development' && !this.runBroadcast()) return;
			if (!Db.tasks.keys().length) return this.errorReply(`There are currently no tasks on this server.`);
			let taskList = Db.tasks.get("development");
			let display = `<table><tr><center><h1>Wavelength's Tasks List:</h1></center></tr>`;
			for (let i in taskList.issues) {
				display += `<tr><td style="border: 2px solid #000000; width: 20%; text-align: center">Employer: <button class="button" name="parseCommand" value="/user ${taskList.issues[i].employer}">${WL.nameColor(taskList.issues[i].employer, true, true)}</button></td><td style="border: 2px solid #000000; width: 20%; text-align: center">Issue Title: ${taskList.issues[i].issue}</td><td style="border: 2px solid #000000; width: 20%; text-align: center">Description: ${taskList.issues[i].description}</td></tr>`;
			}
			display += `</table>`;
			return this.sendReplyBox(display);
		},

		help: function () {
			this.parse(`/taskshelp`);
		},
	},

	taskhelp: "taskshelp",
	taskshelp: [
		`/tasks add [issue|TODO], [description of what needs to be done] - Adds an item to the server's tasks list. Must be a Registered Developer on the server.
		/tasks delete [issue] - Deletes an item from the server's task list. Must be a Registered Developer.
		/tasks list - Displays the server's task list. Must be a Registered Developer; may only be broadcasted in Development rooms.
		/tasks help - Displays this help command.`,
	],
};
