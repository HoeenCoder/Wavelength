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
	for (const name of developers) {
		const u = Users(name);
		if (!(u && u.connected)) continue;
		u.send(`|pm|~Developer Alert|~|/raw ${message}`);
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
			let [issue, priority, ...description] = target.split(",").map(p => p.trim());
			let task = Db.tasks.get("development");
			if (!(issue && priority && description)) return this.parse("/taskshelp");
			let id = toId(issue);
			if (task.issues[id]) return this.errorReply(`This issue title already exists.`);
			if (issue.length < 1 || issue.length > 30) return this.errorReply(`The issue title should not exceed 30 characters long. Feel free to continue in the description.`);
			if (description.length < 1 || description.length > 100) return this.errorReply(`The description should not exceed 100 characters long.`);
			if (isNaN(priority) || priority > 6 || priority < 1) return this.errorReply(`The priority should be an integer between 1-6; 1 being the highest priority.`);
			task.issues[id] = {id, issue, description, employer: user.userid, priority};
			Db.tasks.set("development", task);
			alertDevs(`${WL.nameColor(user.name, true, true)} has filed an issue. Issue: ${issue}. Description: ${description}. Priority: ${priority}.`);
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
			Db.tasks.set("development", task);
			return this.sendReply(`The task "${target}" has been deleted.`);
		},

		"": "list",
		tasks: "list",
		task: "list",
		list: function (target, room, user) {
			if (!isDev(user.userid) && !this.can("bypassall")) return false;
			if (!this.runBroadcast()) return;
			if (this.broadcasting && room.id !== "development") return this.errorReply(`You may only broadcast this command in Development.`);
			if (!Db.tasks.keys().length) return this.errorReply(`There are currently no tasks on this server.`);
			let taskList = Db.tasks.get("development");
			let display = `<center><h1>Wavelength's Tasks List:</h1><table><tr><td>Employer</td><td>Issue Title</td><td>Issue Description</td><td>Issue Priority</td></tr>`;
			for (let i in taskList.issues) {
				display += `<tr>`;
				display += `<td style="border: 2px solid #000000; width: 20%; text-align: center"><button class="button" name="parseCommand" value="/user ${taskList.issues[i].employer}">${WL.nameColor(taskList.issues[i].employer, true, true)}</button></td>`;
				display += `<td style="border: 2px solid #000000; width: 20%; text-align: center">${taskList.issues[i].issue}</td>`;
				display += `<td style="border: 2px solid #000000; width: 20%; text-align: center">${taskList.issues[i].description}</td>`;
				display += `<td style="border: 2px solid #000000; width: 20%; text-align: center">${taskList.issues[i].priority}</td>`;
				display += `</tr>`;
			}
			display += `</table></center>`;
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
