let records = [];
let currentEmployee = null;
let employeeTotal = 0;

function computeSalary() {
  const nameInput = document.getElementById("employeeName");
  const name = nameInput.value.trim();
  const timeIn = document.getElementById("timeIn").value;
  const timeOut = document.getElementById("timeOut").value;
  const dailyRate = parseFloat(document.getElementById("dailyRate").value);

  if (!name || !timeIn || !timeOut || !dailyRate) {
    alert("Please complete all fields.");
    return;
  }

  // Lock employee after first entry
  if (!currentEmployee) {
    currentEmployee = name;
    nameInput.disabled = true;
  }

  const hoursRendered = calculateRenderedHours(timeIn, timeOut);
  const hourlyRate = dailyRate / 8;

  const regularHours = Math.min(8, hoursRendered);
  const otHours = Math.max(0, hoursRendered - 8);

  const regularPay = regularHours * hourlyRate;
  const otPay = otHours * hourlyRate * 1.25;

  const totalPay = regularPay + otPay;
  employeeTotal += totalPay;

  records.push({
    Employee: currentEmployee,
    TimeIn: timeIn,
    TimeOut: timeOut,
    Hours: hoursRendered.toFixed(2),
    RegularPay: regularPay.toFixed(2),
    OTPay: otPay.toFixed(2),
    Total: totalPay.toFixed(2)
  });

  renderDashboard();
  resetInputs();
}

function calculateRenderedHours(start, end) {
  const startTime = new Date(`1970-01-01T${start}`);
  const endTime = new Date(`1970-01-01T${end}`);

  let hours = (endTime - startTime) / (1000 * 60 * 60);

  // Lunch break deduction
  if (startTime.getHours() < 12) {
    hours -= 1;
  }

  return Math.max(0, hours);
}

function renderDashboard() {
  const dashboard = document.getElementById("dashboard");
  dashboard.innerHTML = "";

  dashboard.innerHTML += `
    <div class="dashboard-card">
      <div class="dashboard-title">${currentEmployee}</div>
      <div class="amount">Subtotal: ₱${employeeTotal.toFixed(2)}</div>
    </div>
  `;

  records
    .filter(r => r.Employee === currentEmployee)
    .forEach(r => {
      dashboard.innerHTML += `
        <div class="dashboard-card">
          <div>${r.Hours} hrs</div>
          <div>Regular: ₱${r.RegularPay}</div>
          <div>OT: ₱${r.OTPay}</div>
          <div class="amount">₱${r.Total}</div>
        </div>
      `;
    });
}

function newEmployee() {
  document.getElementById("employeeName").disabled = false;
  document.getElementById("employeeName").value = "";
  currentEmployee = null;
  employeeTotal = 0;
  document.getElementById("dashboard").innerHTML = "";
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
}
