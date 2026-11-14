const API_URL = "/api/students";

const form = document.getElementById("student-form-element");
const studentList = document.getElementById("student-list");
const searchInput = document.getElementById("search");
const message = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-edit");

let students = [];
let editingId = null;

function showMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle("error", isError);
}

function resetForm() {
    form.reset();
    editingId = null;
    document.getElementById("form-title").textContent = "Add a new student";
    document.getElementById("form-mode").textContent = "NEW RECORD";
    submitButton.textContent = "＋ Add student";
    cancelButton.classList.add("hidden");
}

async function loadStudents() {
    studentList.innerHTML = '<tr><td colspan="5" class="empty-state">Loading...</td></tr>';
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Could not load students.");
        students = await response.json();
        renderStudents();
    } catch (error) {
        studentList.innerHTML = `<tr><td colspan="5" class="empty-state">${error.message}</td></tr>`;
    }
}

function renderStudents() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = students.filter(student =>
        [student.name, student.roll, student.email, student.course]
            .some(value => value.toLowerCase().includes(query))
    );

    studentList.innerHTML = "";
    document.getElementById("total-count").textContent = students.length;
    document.getElementById("active-count").textContent = students.length;
    document.getElementById("record-count").textContent =
        `${filtered.length} of ${students.length} records`;

    if (filtered.length === 0) {
        studentList.innerHTML = '<tr><td colspan="5" class="empty-state">No students found. Add a student to get started.</td></tr>';
        return;
    }

    filtered.forEach(student => {
        const row = document.createElement("tr");
        const values = [student.roll, student.name, student.email, student.course];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actions = document.createElement("td");
        actions.className = "action-cell";

        const editButton = document.createElement("button");
        editButton.className = "small-btn edit-btn";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => startEdit(student));

        const deleteButton = document.createElement("button");
        deleteButton.className = "small-btn delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteStudent(student.id));

        actions.append(editButton, deleteButton);
        row.appendChild(actions);
        studentList.appendChild(row);
    });
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    const student = {
        name: document.getElementById("name").value.trim(),
        roll: document.getElementById("roll").value.trim(),
        email: document.getElementById("email").value.trim(),
        course: document.getElementById("course").value.trim()
    };

    const isEditing = editingId !== null;
    const url = isEditing ? `${API_URL}/${editingId}` : API_URL;

    try {
        const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student)
        });
        const result = await response.json();

        if (!response.ok) {
            showMessage(result.error || "Something went wrong.", true);
            return;
        }

        showMessage(result.message);
        resetForm();
        await loadStudents();
    } catch (error) {
        showMessage("Cannot connect to the server. Is Flask running?", true);
    }
});

function startEdit(student) {
    editingId = student.id;
    document.getElementById("name").value = student.name;
    document.getElementById("roll").value = student.roll;
    document.getElementById("email").value = student.email;
    document.getElementById("course").value = student.course;
    document.getElementById("form-title").textContent = "Edit student details";
    document.getElementById("form-mode").textContent = "EDITING RECORD";
    submitButton.textContent = "Save changes";
    cancelButton.classList.remove("hidden");
    showMessage("");
    document.getElementById("student-form").scrollIntoView({ behavior: "smooth" });
}

cancelButton.addEventListener("click", () => {
    resetForm();
    showMessage("");
});

async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const result = await response.json();
        if (!response.ok) {
            alert(result.error || "Could not delete student.");
            return;
        }
        await loadStudents();
        showMessage(result.message);
    } catch (error) {
        alert("Cannot connect to the server. Is Flask running?");
    }
}

searchInput.addEventListener("input", renderStudents);

loadStudents();
