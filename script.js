
"use strict";

// ==================== CONFIGURATION ====================

const API_URL = "https://student-productivity-dashboard-api.onrender.com/api";

// ==================== DATE ====================

const currentDate = document.getElementById("currentDate");

const today = new Date();

if (currentDate) {
    currentDate.textContent = today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// ==================== TASKS ====================

let tasks = [];

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");

async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);

        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        tasks = await response.json();
        renderTasks();
    } catch (error) {
        console.error("Loading tasks failed:", error);
        showMessage("Tasks load nahi hue. Flask server check karo.");
    }
}

if (taskForm) {
    taskForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const text = taskInput.value.trim();
        const priority = priorityInput.value;

        if (!text) {
            showMessage("Please enter a task.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text, priority })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to add task");
            }

            taskInput.value = "";
            await loadTasks();
        } catch (error) {
            console.error("Adding task failed:", error);
            showMessage("Task save nahi hua. Flask server check karo.");
        }
    });
}

function renderTasks() {
    if (!taskList) return;

    taskList.innerHTML = "";

    tasks.forEach(function (task) {
        const div = document.createElement("div");
        div.className = "task-item";

        if (Boolean(task.completed)) {
            div.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = Boolean(task.completed);
        checkbox.setAttribute("aria-label", `Complete ${task.text}`);

        checkbox.addEventListener("change", function () {
            toggleTask(task.id, checkbox.checked);
        });

        const span = document.createElement("span");
        span.textContent = task.text;

        const priority = document.createElement("small");
        priority.className = "priority";
        priority.textContent = task.priority;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        div.append(checkbox, span, priority, deleteButton);
        taskList.appendChild(div);
    });

    updateStats();
}

async function toggleTask(id, completed) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ completed })
        });

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        await loadTasks();
    } catch (error) {
        console.error("Updating task failed:", error);
        showMessage("Task update nahi hua.");
        await loadTasks();
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        await loadTasks();
    } catch (error) {
        console.error("Deleting task failed:", error);
        showMessage("Task delete nahi hua.");
    }
}

// ==================== STATISTICS ====================

function updateStats() {
    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return Boolean(task.completed);
    }).length;

    const progress = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    const totalElement = document.getElementById("totalTasks");
    const completedElement = document.getElementById("completedTasks");
    const progressElement = document.getElementById("progressPercent");
    const circleElement = document.getElementById("circlePercent");
    const progressBar = document.getElementById("progressBar");

    if (totalElement) {
        totalElement.textContent = total;
    }

    if (completedElement) {
        completedElement.textContent = completed;
    }

    if (progressElement) {
        progressElement.textContent = `${progress}%`;
    }

    if (circleElement) {
        circleElement.textContent = `${progress}%`;
    }

    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
}

// ==================== ASSIGNMENTS ====================

let assignments = [];

const assignmentForm = document.getElementById("assignmentForm");
const assignmentList = document.getElementById("assignmentList");

async function loadAssignments() {
    try {
        const response = await fetch(`${API_URL}/assignments`);

        if (!response.ok) {
            throw new Error("Failed to load assignments");
        }

        assignments = await response.json();
        renderAssignments();
    } catch (error) {
        console.error("Loading assignments failed:", error);
        showMessage("Assignments load nahi hue. Flask server check karo.");
    }
}

if (assignmentForm) {
    assignmentForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("assignmentInput").value.trim();
        const subject = document.getElementById("subjectInput").value.trim();
        const deadline = document.getElementById("deadlineInput").value;

        if (!name || !subject || !deadline) {
            showMessage("Please fill all assignment fields.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/assignments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, subject, deadline })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to add assignment");
            }

            assignmentForm.reset();
            await loadAssignments();
        } catch (error) {
            console.error("Adding assignment failed:", error);
            showMessage("Assignment save nahi hua. Flask server check karo.");
        }
    });
}

function renderAssignments() {
    if (!assignmentList) return;

    assignmentList.innerHTML = "";

    assignments.forEach(function (assignment) {
        const div = document.createElement("div");
        div.className = "assignment-item";

        const name = document.createElement("strong");
        name.textContent = assignment.name;

        const details = document.createElement("small");
        details.textContent =
            `${assignment.subject} | Deadline: ${assignment.deadline}`;

        const lineBreak = document.createElement("br");
        const secondBreak = document.createElement("br");

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function () {
            deleteAssignment(assignment.id);
        });

        div.append(
            name,
            document.createElement("br"),
            details,
            lineBreak,
            secondBreak,
            deleteButton
        );

        assignmentList.appendChild(div);
    });

    const countElement = document.getElementById("assignmentCount");

    if (countElement) {
        countElement.textContent = assignments.length;
    }
}

async function deleteAssignment(id) {
    try {
        const response = await fetch(`${API_URL}/assignments/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete assignment");
        }

        await loadAssignments();
    } catch (error) {
        console.error("Deleting assignment failed:", error);
        showMessage("Assignment delete nahi hua.");
    }
}

// ==================== POMODORO TIMER ====================

let timeLeft = 25 * 60;
let timerInterval = null;

const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

function updateTimer() {
    if (!timerDisplay) return;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}

if (startBtn) {
    startBtn.addEventListener("click", function () {
        if (timerInterval !== null || timeLeft <= 0) {
            return;
        }

        timerInterval = setInterval(function () {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimer();
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                showMessage("Pomodoro complete! Take a break.");
            }
        }, 1000);
    });
}

if (pauseBtn) {
    pauseBtn.addEventListener("click", function () {
        clearInterval(timerInterval);
        timerInterval = null;
    });
}

if (resetBtn) {
    resetBtn.addEventListener("click", function () {
        clearInterval(timerInterval);
        timerInterval = null;
        timeLeft = 25 * 60;
        updateTimer();
    });
}

// ==================== MESSAGE HELPER ====================

function showMessage(message) {
    alert(message);
}

// ==================== INITIAL LOAD ====================

loadTasks();
loadAssignments();
updateTimer();
