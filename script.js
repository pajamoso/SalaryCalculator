let records = [];
let currentEmployee = null;

function computeSalary() {
  const nameInput = document.getElementById("employeeName");
  const name = nameInput.value.trim();
  const timeIn = document.getElementById("timeIn").value;
  const timeOut = document.getElementById("timeOut").value;
  const shiftDate = document.getElementById("shiftDate").value;

  let dailyRate;
  const dailyRateInput = document.getElementById("dailyRate");

  if (!dailyRateInput.disabled) {
    dailyRate = parseFloat(dailyRateInput.value);
  } else {
    const employeeRecords = records.filter(r => r.Employee === currentEmployee);
    dailyRate = parseFloat(employeeRecords[employeeRecords.length - 1].DailyRate);
  }

  if (!name || !timeIn || !timeOut || !shiftDate || isNaN(dailyRate) || dailyRate <= 0) {
    alert("Please complete all fields and ensure Daily Rate is a positive number.");
    return;
  }

  if (!currentEmployee) {
    currentEmployee = name;
    nameInput.disabled = true;
    dailyRateInput.disabled = true;
    dailyRateInput.style.display = "none";
  }

// ✅ Duplicate validation
const duplicate = records.some(r =>
  r.Employee === currentEmployee &&
  r.Date === shiftDate &&
  r.TimeIn === timeIn &&
  r.TimeOut === timeOut
);

if (duplicate) {
  const warning = document.getElementById("warning");
  warning.textContent = `⚠️ Duplicate entry blocked: ${shiftDate} (${timeIn} - ${timeOut}) for ${currentEmployee}`;
  warning.classList.remove("d-none");

  warning.classList.add("shake");
  setTimeout(() => warning.classList.remove("shake"), 500);

  // Optional: auto-hide after 3 seconds
  setTimeout(() => {
    warning.classList.add("d-none");
  }, 3000);

  return;
}


  const hoursRendered = calculateRenderedHours(timeIn, timeOut);
  const hourlyRate = dailyRate / 8;

  const regularHours = Math.min(8, hoursRendered);
  const otHours = Math.max(0, hoursRendered - 8);

  const regularPay = regularHours * hourlyRate;
  const otPay = otHours * hourlyRate * 1.25;
  const totalPay = regularPay + otPay;
  const allowance = 50;
  const grandTotal = totalPay + allowance;

  const recordId = `${currentEmployee}__${shiftDate}__${timeIn}__${timeOut}`;

  records.push({
    Id: recordId,
    Date: shiftDate,
    Employee: currentEmployee,
    TimeIn: timeIn,
    TimeOut: timeOut,
    DailyRate: dailyRate.toFixed(2),
    Hours: hoursRendered.toFixed(2),
    RegularPay: regularPay.toFixed(2),
    OTPay: otPay.toFixed(2),
    Allowance: allowance.toFixed(2),
    Total: grandTotal.toFixed(2)
  });


  renderDashboard();
  resetInputs();
}

function calculateRenderedHours(start, end) {
  const startTime = new Date(`1970-01-01T${start}`);
  let endTime = new Date(`1970-01-01T${end}`);

  // Handle shifts that go past midnight
  if (endTime <= startTime) {
    endTime = new Date(`1970-01-02T${end}`);
  }

  let hours = (endTime - startTime) / (1000 * 60 * 60);

  // Lunch break deduction if employee started before 12nn
  if (startTime.getHours() < 12) {
    hours -= 1;
  }

  return Math.max(0, hours);
}

function renderDashboard() {
  const dashboard = document.getElementById("dashboard");

  // Find or create a container for this employee
  let employeeSection = document.getElementById(`section-${currentEmployee}`);
  if (!employeeSection) {
    employeeSection = document.createElement("div");
    employeeSection.id = `section-${currentEmployee}`;
    employeeSection.classList.add("employee-section");

    // Add a header with minimize toggle
  employeeSection.innerHTML = `
    <div class="dashboard-card">
      <div class="dashboard-title d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          ${currentEmployee}
        </div>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-primary" onclick="toggleSection('${currentEmployee}')">Toggle</button>
          <button class="btn btn-sm btn-outline-warning" onclick="editEmployee('${currentEmployee}')">Edit</button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteDashboard('${currentEmployee}')">Delete</button>
        </div>
      </div>
      <div id="subtotal-${currentEmployee}" class="amount"></div>
      <div id="records-${currentEmployee}"></div>
    </div>
  `;
    dashboard.appendChild(employeeSection);
  }

  // Update subtotal and records
  const employeeRecords = records.filter(r => r.Employee === currentEmployee);
  const subtotal = employeeRecords.reduce((s, r) => s + parseFloat(r.Total), 0);

  document.getElementById(`subtotal-${currentEmployee}`).innerText = `Subtotal: ₱${subtotal.toFixed(2)}`;

  const recordsDiv = document.getElementById(`records-${currentEmployee}`);
  recordsDiv.innerHTML = "";

  employeeRecords.forEach((r, index) => {
    const canRemove = Boolean(currentEmployee && currentEmployee === r.Employee);

    recordsDiv.innerHTML += `
      <div class="dashboard-card">
        <div><strong>${r.Date}</strong></div>
        <div>${r.Hours} hrs</div>
        <div>Regular: ₱${r.RegularPay}</div>
        <div>OT: ₱${r.OTPay}</div>
        <div class="amount">₱${r.Total}</div>
        ${canRemove ? `<button class="btn btn-sm btn-outline-danger mt-2" onclick="removeRecord('${r.Id}')">Remove</button>` : ""}
      </div>
    `;
  });

}

function newEmployee() {
  document.getElementById("employeeName").disabled = false;
  document.getElementById("employeeName").value = "";
  document.getElementById("dailyRate").style.display = "block"; // re-enable for new employee
  document.getElementById("dailyRate").disabled = false; 
  document.getElementById("dailyRate").value = "";
  currentEmployee = null;
}

function exportExcel() {
  if (records.length === 0) {
    alert("No data to export.");
    return;
  }
  const ws = XLSX.utils.json_to_sheet(records);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Salary Records");
  XLSX.writeFile(wb, "salary-records.xlsx");
}



function resetInputs() {
  document.getElementById("timeIn").value = "";
  document.getElementById("timeOut").value = "";
  document.getElementById("dailyRate").value = "";
  document.getElementById("shiftDate").value = "";
}

function toggleSection(employee) {
  const recordsDiv = document.getElementById(`records-${employee}`);
  if (recordsDiv.style.display === "none") {
    recordsDiv.style.display = "block";
  } else {
    recordsDiv.style.display = "none";
  }
}

function editEmployee(employee) {
  // Find the last record for this employee
  const employeeRecords = records.filter(r => r.Employee === employee);
  if (employeeRecords.length === 0) return;

  const lastRecord = employeeRecords[employeeRecords.length - 1];

  // Re-enable name field and set current employee
  const nameInput = document.getElementById("employeeName");
  nameInput.value = employee;
  nameInput.disabled = true;
  currentEmployee = employee;

  // Populate inputs with last record values
  document.getElementById("shiftDate").value = lastRecord.Date;
  document.getElementById("timeIn").value = lastRecord.TimeIn;
  document.getElementById("timeOut").value = lastRecord.TimeOut;

  // Re-enable Daily Rate for editing
  const dailyRateInput = document.getElementById("dailyRate");
  dailyRateInput.disabled = false;
  dailyRateInput.style.display = "block"; // show again
  dailyRateInput.value = lastRecord.DailyRate;
}

function removeRecord(id) {
  const idx = records.findIndex(r => r.Id === id);
  if (idx === -1) return;

  const rec = records[idx];

  if (!currentEmployee || rec.Employee !== currentEmployee) {
    alert("You can only remove records for the current employee.");
    return;
  }

  if (confirm(`Remove record on ${rec.Date} (${rec.TimeIn} - ${rec.TimeOut}) for ${rec.Employee}?`)) {
    records.splice(idx, 1);

    // Check if employee has any records left
    const employeeRecords = records.filter(r => r.Employee === rec.Employee);
    if (employeeRecords.length === 0) {
      const section = document.getElementById(`section-${rec.Employee}`);
      if (section) section.remove();
    } else {
      renderDashboard();
    }
  }
}

function deleteDashboard(employee) {
  if (confirm(`Delete all records and dashboard for ${employee}?`)) {
    // Remove all records for this employee
    records = records.filter(r => r.Employee !== employee);

    // Remove the dashboard section
    const section = document.getElementById(`section-${employee}`);
    if (section) section.remove();

    // Reset currentEmployee if it was the one deleted
    if (currentEmployee === employee) {
      currentEmployee = null;
      document.getElementById("employeeName").disabled = false;
      document.getElementById("employeeName").value = "";
      const dailyRateInput = document.getElementById("dailyRate");
      dailyRateInput.style.display = "block";
      dailyRateInput.disabled = false;
      dailyRateInput.value = "";
    }
  }
}
