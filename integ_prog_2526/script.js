let currentTaskElement = null;
let currentStickyNote = null;

/* -------------------------
   SAVE TASKS (LOCAL STORAGE)
------------------------- */

function saveTasks() {

	const tasks = [];

	$("#taskList li").each(function () {

		const id = $(this).data("id");
		const text = $(this).find("span").text();
		const completed = $(this).hasClass("completed");

		tasks.push({
			id,
			text,
			completed
		});

	});

	localStorage.setItem("todoTasks", JSON.stringify(tasks));

}

/* -------------------------
   LOAD TASKS
------------------------- */

function loadTasks() {

	const stored = localStorage.getItem("todoTasks");
	if (!stored) return;

	const tasks = JSON.parse(stored);

	tasks.forEach(task => {

		const todoItem = $(`
<li data-id="${task.id}" class="${task.completed ? 'completed' : ''}">
    <div class="circle"></div>
    <span>${task.text}</span>
    <div class="actions">
        <button class="edit-btn"><i class="bi bi-pencil"></i></button>
        <button class="delete-btn"><i class="bi bi-trash3"></i></button>
    </div>
</li>`);

		$("#taskList").append(todoItem);

		createStickyNote(task.text, task.id, todoItem);

	});

}

/* -------------------------
   ADD TASK
------------------------- */

function addTask() {

	const text = $("#noteInput").val().trim();
	if (!text) return;

	const taskId = "task_" + Date.now();

	const todoItem = $(`
<li data-id="${taskId}">
    <div class="circle"></div>
    <span>${text}</span>
    <div class="actions">
        <button class="edit-btn"><i class="bi bi-pencil"></i></button>
        <button class="delete-btn"><i class="bi bi-trash3"></i></button>
    </div>
</li>`);

	$("#taskList").append(todoItem);

	createStickyNote(text, taskId, todoItem);

	$("#noteInput").val("");
	$("#addModal").hide();

	saveTasks();

}

/* -------------------------
   CREATE STICKY NOTE
------------------------- */

function createStickyNote(text, taskId, todoElement) {
	const stickyGrid = $("#stickyGrid");
	const now = new Date();
	const dateText = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

	const note = $(`
    <div class="note" data-id="${taskId}">
        <div class="note-title">${text}</div>
        <div class="note-content" style="display:none;"></div>
        <div class="note-snippet">${text.length > 50 ? text.substring(0, 50) + "..." : text}</div>
        <span class="note-date">${dateText}</span>
        <button class="edit-note-btn"><i class="fa fa-pencil"></i></button>
    </div>
    `);

	note.data("todoElement", todoElement);

	// EDIT BUTTON -> OPEN EDITOR
	note.find(".edit-note-btn").click(function (event) {
		event.stopPropagation();
		openInlineEditor(note);
	});

	$("#stickyGrid .add-note").before(note);
}


let currentEditingNote = null;

function openInlineEditor(note) {
	currentEditingNote = note;

	const titleText = note.find(".note-title").text();
	const contentText = note.find(".note-content").text() || "";

	$("#editorTitle").val(titleText);
	$("#editorContent").val(contentText);

	$("#stickyGrid").hide();
	$("#inlineStickyEditor").show();
}

// Save edits
$("#editorSave").click(() => {

	const newTitle = $("#editorTitle").val().trim();
	const newContent = $("#editorContent").val().trim();

	if (!newTitle && !newContent) return;

	if (currentEditingNote) {

		// UPDATE EXISTING NOTE
		currentEditingNote.find(".note-title")
			.text(newTitle || currentEditingNote.find(".note-title").text());

		currentEditingNote.find(".note-content").text(newContent);

		const snippet = newContent.replace(/\n/g, " ").substring(0, 50);

		currentEditingNote.find(".note-snippet")
			.text(snippet.length >= 50 ? snippet + "..." : snippet);

		// Update linked TODO task
		const taskId = currentEditingNote.data("id");
		const todoItem = $(`#taskList li[data-id="${taskId}"]`);
		todoItem.find("span")
			.text(newTitle || todoItem.find("span").text());

	} else {

		const id = "task_" + Date.now();
		const now = new Date().toLocaleString();

		// CREATE TODO TASK (so it will save)
		const todoItem = $(`
<li data-id="${id}">
    <div class="circle"></div>
    <span>${newTitle}</span>
    <div class="actions">
        <button class="edit-btn"><i class="bi bi-pencil"></i></button>
        <button class="delete-btn"><i class="bi bi-trash3"></i></button>
    </div>
</li>
`);

		$("#taskList").append(todoItem);

		// CREATE STICKY NOTE
		const snippet = newContent.replace(/\n/g, " ").substring(0, 50);

		const note = $(`
<div class="note" data-id="${id}">
    <div class="note-title">${newTitle}</div>
    <div class="note-content">${newContent}</div>
    <div class="note-snippet">${snippet.length >= 50 ? snippet + "..." : snippet}</div>
    <span class="note-date">${now}</span>
    <button class="edit-note-btn"><i class="fa fa-pencil"></i></button>
</div>
`);

		$("#stickyGrid .add-note").before(note);

		saveTasks();
	}

});

// Cancel edits
$("#editorCancel").click(() => {
	$("#inlineStickyEditor").hide();
	$("#stickyGrid").show();
	currentEditingNote = null;
});

// Attach inline editor to sticky notes
$(document).on("click", ".edit-note-btn", function () {
	const note = $(this).closest(".note");
	openInlineEditor(note);
});

/* -------------------------
   RESTORE STICKY WALL
------------------------- */

function reloadStickyWall() {

	$("#stickyGrid").html('<div class="add-note">+</div>');

	const stored = localStorage.getItem("todoTasks");
	if (!stored) return;

	const tasks = JSON.parse(stored);

	tasks.forEach(task => {

		const todoElement = $(`#taskList li[data-id="${task.id}"]`);

		createStickyNote(task.text, task.id, todoElement);

	});

}

/* -------------------------
   SAVE STICKY EDIT
------------------------- */

$(document).on("click", "#saveStickyEdit", function () {
	if (!currentStickyNote) return;

	const newTitle = $("#stickyTitleInput").val().trim();
	const newContent = $("#stickyContentInput").val().trim(); 

	if (!newTitle) return;
	currentStickyNote.find("h3").text(newTitle);

	const id = currentStickyNote.data("id");
	const todo = $(`#taskList li[data-id="${id}"]`);
	todo.find("span").text(newTitle);

	$("#stickyEditorPage").hide();
	currentStickyNote = null;

	saveTasks();
});

/* -------------------------
   CANCEL STICKY EDIT
------------------------- */

$(document).on("click", "#cancelStickyEdit", function () {

	reloadStickyWall();

});

/* -------------------------
   OPEN TODO EDIT MODAL
------------------------- */

function openEditModal(element) {

	currentTaskElement = element;

	let text = "";

	if (element.is("li")) {
		text = element.find("span").text();
	}

	$("#editInput").val(text);
	$("#editModal").css("display", "flex");

}

/* -------------------------
   SAVE TODO EDIT
------------------------- */

$("#saveEdit").click(function () {

	if (!currentTaskElement) return;

	const newText = $("#editInput").val().trim();
	if (!newText) return;

	const id = currentTaskElement.data("id");

	currentTaskElement.find("span").text(newText);

	const note = $(`#stickyGrid .note[data-id="${id}"]`);
	note.find(".note-title").text(newText);

	$("#editModal").hide();

	currentTaskElement = null;

	saveTasks();

});

/* -------------------------
   CANCEL TODO EDIT
------------------------- */

$("#cancelEdit").click(function () {

	$("#editModal").hide();
	currentTaskElement = null;

});

/* -------------------------
   OPEN TODO EDIT
------------------------- */

$(document).on("click", ".edit-btn", function () {

	const li = $(this).closest("li");
	openEditModal(li);

});

/* -------------------------
   DELETE TASK
------------------------- */

$(document).on("click", ".delete-btn", function () {

	const li = $(this).closest("li");
	const id = li.data("id");

	li.remove();

	$(`#stickyGrid .note[data-id="${id}"]`).remove();

	saveTasks();

});

/* -------------------------
   COMPLETE TASK
------------------------- */

$(document).on("click", ".circle", function (event) {

	event.stopPropagation();

	$(this).closest("li").toggleClass("completed");

	saveTasks();

});

/* -------------------------
   OPEN ADD MODAL
------------------------- */

$("#addNoteBtn").click(function () {

	$("#addModal").css("display", "flex");

});

/* -------------------------
   CANCEL ADD
------------------------- */

$("#cancelAdd").click(function () {

	$("#addModal").css("display", "none");

});

/* -------------------------
   ADD BUTTON
------------------------- */

$("#addTaskBtn").click(addTask);

/* -------------------------
   ENTER KEY ADD
------------------------- */

$("#noteInput").keypress(function (event) {

	if (event.which === 13) addTask();

});

/* -------------------------
   SEARCH TASK
------------------------- */

$("#searchTask").on("keyup", function () {

	const filter = $(this).val().toLowerCase();

	$("#taskList li").each(function () {

		const taskText = $(this).find("span").text().toLowerCase();

		$(this).toggle(taskText.indexOf(filter) > -1);

	});

});

/* -------------------------
   LOAD TASKS ON START
------------------------- */

$(document).ready(function () {

	loadTasks();

});

$(document).on("click", ".add-note", function () {

	currentEditingNote = null;

	$("#editorTitle").val("");
	$("#editorContent").val("");

	$("#stickyGrid").hide();
	$("#inlineStickyEditor").show();

});