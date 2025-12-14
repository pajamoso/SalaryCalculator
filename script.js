let records = [];

function computeSalary() {
  const name = document.getElementById("employeeName").value.trim();
  const timeIn = document.getElementById("timeIn").value;
  const timeOut = document.getElementById("timeOut").value;
  const rate = parseFloat(document.getElementById("rate").value);

  if (!name || !timeIn || !timeOut || !rate) {
    alert("Please complete all fields.");
    return;
  }

  const hoursWorked = calculateHours(timeIn, timeOut);
  const salary = hoursWorked * rate;

  const record = {
    Employee: name,
    TimeIn: timeIn,
    TimeOut: timeOut,
    Hours: hoursWorked.toFixed(2),
    Rate: rate,
    Salary: salary.toFixed(2)
  };

  records.push(record);
  renderDashboard();
  resetInputs();
}

function calculateHours(start, end) {
  const startTime = new Date(`1970-01-01T${start}`);
  const endTime = new Date(`1970-01-01T${end}`);
  return (endTime - startTime) / (1000 * 60 * 60);
}

function renderDashboard() {
  const dashboard = document.getElementById("dashboard");
  dashboard.innerHTML = "";

  let total = 0;

  records.forEach((r, index) => {
    total += parseFloat(r.Salary);

    dashboard.innerHTML += `
      <div class="dashboard-card">
        <div class="dashboard-title">${r.Employee}</div>
        <div>${r.Hours} hrs × ₱${r.Rate}</div>
        <div class="amount">₱${r.Salary}</div>
      </div>
    `;
  });

  dashboard.innerHTML =
    `<div class="dashboard-card mb-3">
      <div class="dashboard-title">TOTAL PAYOUT</div>
      <div class="amount">₱${total.toFixed(2)}</div>
    </div>` + dashboard.innerHTML;
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
  document.getElementById("employeeName").value = "";
  document.getElementById("timeIn").value = "";
  document.getElementById("timeOut").value = "";
  document.getElementById("rate").value = "";
}
