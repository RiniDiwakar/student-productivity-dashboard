// DATE
const currentDate = document.getElementById("currentDate");

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});


// TASKS
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");

taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const task = {
        id: Date.now(),
        text: taskInput.value,
        priority: priorityInput.value,
        completed: false
    };

    tasks.push(task);

    localStorage.setItem("tasks", JSON.stringify(tasks));

    taskInput.value = "";

    renderTasks();
});


function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach(function (task) {

        const div = document.createElement("div");

        div.className = "task-item";

        if (task.completed) {
            div.classList.add("completed");
        }

        div.innerHTML = `
            <input 
                type="checkbox"
                ${task.completed ? "checked" : ""}
                onchange="toggleTask(${task.id})"
            >

            <span>${task.text}</span>

            <small class="priority">${task.priority}</small>

            <button 
                class="delete-btn"
                onclick="deleteTask(${task.id})">
                Delete
            </button>
        `;

        taskList.appendChild(div);
    });

    updateStats();
}


function toggleTask(id) {

    tasks.forEach(function (task) {

        if (task.id === id) {
            task.completed = !task.completed;
        }

    });

    localStorage.setItem("tasks", JSON.stringify(tasks));

    renderTasks();
}


function deleteTask(id) {

    tasks = tasks.filter(function (task) {
        return task.id !== id;
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));

    renderTasks();
}


// STATISTICS
function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return task.completed;
    }).length;

    let progress = 0;

    if (total > 0) {
        progress = Math.round((completed / total) * 100);
    }

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("progressPercent").textContent =
        progress + "%";

    document.getElementById("circlePercent").textContent =
        progress + "%";

    document.getElementById("progressBar").style.width =
        progress + "%";
}


// ASSIGNMENTS
let assignments =
    JSON.parse(localStorage.getItem("assignments")) || [];

const assignmentForm =
    document.getElementById("assignmentForm");

const assignmentList =
    document.getElementById("assignmentList");

assignmentForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const name =
        document.getElementById("assignmentInput").value;

    const subject =
        document.getElementById("subjectInput").value;

    const deadline =
        document.getElementById("deadlineInput").value;

    const assignment = {
        id: Date.now(),
        name: name,
        subject: subject,
        deadline: deadline
    };

    assignments.push(assignment);

    localStorage.setItem(
        "assignments",
        JSON.stringify(assignments)
    );

    assignmentForm.reset();

    renderAssignments();
});


function renderAssignments() {

    assignmentList.innerHTML = "";

    assignments.forEach(function (assignment) {

        const div = document.createElement("div");

        div.className = "assignment-item";

        div.innerHTML = `
            <strong>${assignment.name}</strong>

            <small>
                ${assignment.subject}
                |
                Deadline: ${assignment.deadline}
            </small>

            <br><br>

            <button
                class="delete-btn"
                onclick="deleteAssignment(${assignment.id})">
                Delete
            </button>
        `;

        assignmentList.appendChild(div);
    });

    document.getElementById("assignmentCount").textContent =
        assignments.length;
}


function deleteAssignment(id) {

    assignments = assignments.filter(function (assignment) {
        return assignment.id !== id;
    });

    localStorage.setItem(
        "assignments",
        JSON.stringify(assignments)
    );

    renderAssignments();
}


// POMODORO
let timeLeft = 25 * 60;

let timerInterval = null;

const timerDisplay =
    document.getElementById("timer");


function updateTimer() {

    const minutes = Math.floor(timeLeft / 60);

    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


document.getElementById("startBtn").addEventListener("click", function () {

    if (timerInterval !== null) {
        return;
    }

    timerInterval = setInterval(function () {

        if (timeLeft > 0) {

            timeLeft--;

            updateTimer();

        } else {

            clearInterval(timerInterval);

            timerInterval = null;

            alert("Pomodoro complete! Take a break.");
        }

    }, 1000);

});


document.getElementById("pauseBtn").addEventListener("click", function () {

    clearInterval(timerInterval);

    timerInterval = null;

});


document.getElementById("resetBtn").addEventListener("click", function () {

    clearInterval(timerInterval);

    timerInterval = null;

    timeLeft = 25 * 60;

    updateTimer();

});


// INITIAL LOAD
renderTasks();

renderAssignments();

updateTimer();