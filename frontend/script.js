// ---- Configuration ----
// If this page is served by Django itself (http://127.0.0.1:8000/), use a
// relative URL so the API is always on the same origin — no CORS involved.
// If the page is opened some other way, fall back to the local Django server.
const API_BASE =
    window.location.protocol.startsWith("http") && window.location.port === "8000"
        ? "/api/students/"
        : "https://student-management-system-f1dw.onrender.com/api/students/";
// ---- Element references ----
const form = document.getElementById("student-form");
const idField = document.getElementById("student-id");
const nameField = document.getElementById("name");
const emailField = document.getElementById("email");
const departmentField = document.getElementById("department");
const yearField = document.getElementById("year");
const phoneField = document.getElementById("phone");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formMessage = document.getElementById("form-message");

const searchInput = document.getElementById("search-input");
const filterDepartment = document.getElementById("filter-department");
const tableBody = document.getElementById("student-table-body");
const statusMessage = document.getElementById("status-message");

const modal = document.getElementById("confirm-modal");
const confirmYes = document.getElementById("confirm-yes");
const confirmNo = document.getElementById("confirm-no");

let allStudents = [];
let pendingDeleteId = null;
let searchTimer = null;

// ---- Helpers ----
function showFormMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = "form-message " + (type || "");
}

function clearFieldErrors() {
  ["name", "email", "department", "year", "phone"].forEach((f) => {
    document.getElementById("err-" + f).textContent = "";
  });
}

function setFieldError(field, message) {
  const el = document.getElementById("err-" + field);
  if (el) el.textContent = message;
}

function resetForm() {
  form.reset();
  idField.value = "";
  formTitle.textContent = "Add Student";
  submitBtn.textContent = "Add Student";
  cancelBtn.classList.add("hidden");
  clearFieldErrors();
  showFormMessage("", "");
}

// ---- Client-side validation (SOP 7.4 / Section 9) ----
function validateForm() {
  clearFieldErrors();
  let valid = true;

  if (!nameField.value.trim() || nameField.value.trim().length < 2) {
    setFieldError("name", "Name must be at least 2 characters.");
    valid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailField.value.trim())) {
    setFieldError("email", "Enter a valid email address.");
    valid = false;
  }

  if (!departmentField.value) {
    setFieldError("department", "Please select a department.");
    valid = false;
  }

  const year = Number(yearField.value);
  if (!year || year < 1 || year > 5) {
    setFieldError("year", "Year must be between 1 and 5.");
    valid = false;
  }

  if (!/^\d{10}$/.test(phoneField.value.trim())) {
    setFieldError("phone", "Phone number must be exactly 10 digits.");
    valid = false;
  }

  return valid;
}

// ---- API calls ----
async function fetchStudents() {
  statusMessage.textContent = "Loading students...";
  try {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set("search", searchInput.value.trim());
    if (filterDepartment.value) params.set("department", filterDepartment.value);

    const response = await fetch(`${API_BASE}?${params.toString()}`);
    if (!response.ok) throw new Error(`Server responded with ${response.status}`);
    const data = await response.json();

    // Handle DRF pagination (results key) or plain array
    allStudents = Array.isArray(data) ? data : data.results;
    renderTable(allStudents);
    statusMessage.textContent = `${allStudents.length} student(s) found.`;
  } catch (err) {
    statusMessage.textContent =
      "Could not reach the backend. Make sure 'python manage.py runserver' is " +
      "running, then reload http://127.0.0.1:8000/";
    tableBody.innerHTML = "";
    console.error(err);
  }
}

// Safely read a response body that may not be valid JSON (e.g. a 500 HTML page)
async function parseResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { detail: `Server error (HTTP ${response.status}).` };
  }
}

async function createStudent(payload) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  if (!response.ok) throw data;
  return data;
}

async function updateStudent(id, payload) {
  const response = await fetch(`${API_BASE}${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse(response);
  if (!response.ok) throw data;
  return data;
}

async function deleteStudent(id) {
  const response = await fetch(`${API_BASE}${id}/`, { method: "DELETE" });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw data;
  }
  return true;
}

// ---- Rendering ----
function renderTable(students) {
  if (!students || students.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888;">No students found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = students
    .map(
      (s) => `
    <tr>
      <td>${s.id}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.department)}</td>
      <td>${s.year}</td>
      <td>${escapeHtml(s.phone)}</td>
      <td class="actions-cell">
        <button class="edit-btn" data-id="${s.id}">Edit</button>
        <button class="delete-btn" data-id="${s.id}">Delete</button>
      </td>
    </tr>`
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ---- Event handlers ----
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) {
    showFormMessage("Please fix the errors above.", "error");
    return;
  }

  const payload = {
    name: nameField.value.trim(),
    email: emailField.value.trim(),
    department: departmentField.value,
    year: Number(yearField.value),
    phone: phoneField.value.trim(),
  };

  try {
    if (idField.value) {
      await updateStudent(idField.value, payload);
      showFormMessage("Student updated successfully.", "success");
    } else {
      await createStudent(payload);
      showFormMessage("Student added successfully.", "success");
    }
    resetForm();
    fetchStudents();
  } catch (err) {
    handleApiError(err);
  }
});

function handleApiError(err) {
  // A real JS Error means the request never reached the server
  // (backend down, wrong port, or CORS). Do NOT treat it as field validation:
  // Error objects have a built-in .name property that would be misread as a
  // "name" field error.
  if (err instanceof Error) {
    console.error(err);
    showFormMessage(
      "Cannot reach the server. Start the Django backend with " +
      "'python manage.py runserver', then open http://127.0.0.1:8000/",
      "error"
    );
    return;
  }

  // DRF validation errors arrive as { field: [messages] } or { error, details }
  const details = (err && err.details) || err || {};
  let shown = false;

  ["name", "email", "department", "year", "phone"].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(details, field)) {
      const msg = details[field];
      setFieldError(field, Array.isArray(msg) ? msg[0] : String(msg));
      shown = true;
    }
  });

  // Non-field errors from DRF
  if (details.non_field_errors) {
    showFormMessage(
      Array.isArray(details.non_field_errors)
        ? details.non_field_errors[0]
        : String(details.non_field_errors),
      "error"
    );
    return;
  }

  showFormMessage(
    shown ? "Please fix the errors above." : "Something went wrong. Please try again.",
    "error"
  );
}

cancelBtn.addEventListener("click", resetForm);

tableBody.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("edit-btn")) {
    const student = allStudents.find((s) => String(s.id) === id);
    if (!student) return;
    idField.value = student.id;
    nameField.value = student.name;
    emailField.value = student.email;
    departmentField.value = student.department;
    yearField.value = student.year;
    phoneField.value = student.phone;
    formTitle.textContent = "Edit Student";
    submitBtn.textContent = "Update Student";
    cancelBtn.classList.remove("hidden");
    clearFieldErrors();
    showFormMessage("", "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (e.target.classList.contains("delete-btn")) {
    pendingDeleteId = id;
    modal.classList.remove("hidden");
  }
});

confirmYes.addEventListener("click", async () => {
  modal.classList.add("hidden");
  if (!pendingDeleteId) return;
  try {
    await deleteStudent(pendingDeleteId);
    statusMessage.textContent = "Student deleted.";
    fetchStudents();
  } catch (err) {
    statusMessage.textContent = "Could not delete student. It may no longer exist.";
  }
  pendingDeleteId = null;
});

confirmNo.addEventListener("click", () => {
  modal.classList.add("hidden");
  pendingDeleteId = null;
});

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(fetchStudents, 350);
});
filterDepartment.addEventListener("change", fetchStudents);

// ---- Initial load ----
fetchStudents();
