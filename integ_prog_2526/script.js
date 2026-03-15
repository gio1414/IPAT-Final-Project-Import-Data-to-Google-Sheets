let currentTaskElement = null;
let currentEditingNote = null;

/* -------------------------
   SAVE TASKS (LOCAL STORAGE)
------------------------- */

function saveTasks() {

	const tasks = [];

	$("#taskList li").each(function () {

		const id = $(this).data("id");
		const text = $(this).find("span").text();
		const completed = $(this).hasClass("completed");

		const note = $(`#stickyGrid .note[data-id="${id}"]`);
		const content = note.find(".note-content").text();

		tasks.push({
			id,
			text,
			content,
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

		createStickyNote(task.text, task.id, todoItem, task.content);

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

	createStickyNote(text, taskId, todoItem, "");

	$("#noteInput").val("");
	$("#addModal").hide();

	saveTasks();

}

/* -------------------------
   CREATE STICKY NOTE
------------------------- */

function createStickyNote(text, taskId, todoElement, content = "") {

	const now = new Date();
	const dateText = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;

	const snippet = content ? content.substring(0, 50) : "";

	const note = $(`
<div class="note" data-id="${taskId}">
    <div class="note-title">${text}</div>
    <div class="note-content" style="display:none;">${content}</div>
    <div class="note-snippet">${snippet}</div>
    <span class="note-date">${dateText}</span>
    <button class="edit-note-btn"><i class="fa fa-pencil"></i></button>
</div>
`);

	$("#stickyGrid .add-note").before(note);

}

/* -------------------------
   OPEN STICKY EDITOR
------------------------- */

function openInlineEditor(note) {

	currentEditingNote = note;

	const titleText = note.find(".note-title").text();
	const contentText = note.find(".note-content").text();

	$("#editorTitle").val(titleText);
	$("#editorContent").val(contentText);

	$("#stickyGrid").hide();
	$("#inlineStickyEditor").show();

}

/* -------------------------
   SAVE STICKY EDIT
------------------------- */

$("#editorSave").click(() => {

	const newTitle = $("#editorTitle").val().trim();
	const newContent = $("#editorContent").val().trim();

	if (!newTitle) return;

	// EDIT EXISTING NOTE
	if (currentEditingNote) {

		currentEditingNote.find(".note-title").text(newTitle);
		currentEditingNote.find(".note-content").text(newContent);

		const snippet = newContent ? newContent.substring(0, 50) : "";
		currentEditingNote.find(".note-snippet").text(snippet);

		const taskId = currentEditingNote.data("id");
		const todoItem = $(`#taskList li[data-id="${taskId}"]`);

		todoItem.find("span").text(newTitle);

	}

	// CREATE NEW NOTE
	else {

		const id = "task_" + Date.now();
		const now = new Date().toLocaleString();

		// create todo item
		const todoItem = $(`
<li data-id="${id}">
    <div class="circle"></div>
    <span>${newTitle}</span>
    <div class="actions">
        <button class="edit-btn"><i class="bi bi-pencil"></i></button>
        <button class="delete-btn"><i class="bi bi-trash3"></i></button>
    </div>
</li>`);

		$("#taskList").append(todoItem);

		// snippet
		const snippet = newContent ? newContent.substring(0, 50) : "";

		// create sticky note
		const note = $(`
    <div class="note" data-id="${id}">
    <div class="note-title">${newTitle}</div>
    <div class="note-content" style="display:none;">${newContent}</div>
    <div class="note-snippet">${snippet}</div>
    <span class="note-date">${now}</span>
    <button class="edit-note-btn"><i class="fa fa-pencil"></i></button>
    </div>
    `);

		$("#stickyGrid .add-note").before(note);

	}

	$("#inlineStickyEditor").hide();
	$("#stickyGrid").show();
	currentEditingNote = null;

	saveTasks();

});

/* -------------------------
   CANCEL STICKY EDIT
------------------------- */

$("#editorCancel").click(() => {

	$("#inlineStickyEditor").hide();
	$("#stickyGrid").show();

	currentEditingNote = null;

});

/* -------------------------
   EDIT NOTE BUTTON
------------------------- */

$(document).on("click", ".edit-note-btn", function (event) {

	event.stopPropagation();

	const note = $(this).closest(".note");
	openInlineEditor(note);

});

/* -------------------------
   OPEN TODO EDIT MODAL
------------------------- */

function openEditModal(element) {

	currentTaskElement = element;

	const text = element.find("span").text();

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

/* -------------------------
   ADD STICKY NOTE BUTTON
------------------------- */

$(document).on("click", ".add-note", function () {

	currentEditingNote = null;

	$("#editorTitle").val("");
	$("#editorContent").val("");

	$("#stickyGrid").hide();
	$("#inlineStickyEditor").show();

});