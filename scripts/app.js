/* =========================================================
   TOWSUM & GADDY — GLOBAL APP SCRIPT
   Powers ALL pages + Admin Dashboard
   ========================================================= */

/* ---------------------------------------------------------
   THEME HANDLING
--------------------------------------------------------- */
function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("tg_theme", theme);

  const icon = document.getElementById("theme-icon");
  const label = document.getElementById("theme-label");

  if (icon && label) {
    if (theme === "light") {
      icon.textContent = "☀️";
      label.textContent = "Light";
    } else {
      icon.textContent = "🌙";
      label.textContent = "Dark";
    }
  }
}

const savedTheme = localStorage.getItem("tg_theme") || "dark";
applyTheme(savedTheme);

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const current = document.body.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

/* ---------------------------------------------------------
   LOADING SCREEN
--------------------------------------------------------- */
window.addEventListener("load", () => {
  const loader = document.getElementById("loading-screen");
  if (loader) {
    setTimeout(() => {
      loader.style.display = "none";
    }, 1600);
  }
});

/* ---------------------------------------------------------
   HIDDEN ADMIN ACCESS (4 taps top-right)
--------------------------------------------------------- */
const adminZone = document.getElementById("admin-click-zone");
if (adminZone) {
  let tapCount = 0;
  let tapTimer = null;

  adminZone.addEventListener("click", () => {
    tapCount++;

    if (tapTimer) clearTimeout(tapTimer);
    tapTimer = setTimeout(() => (tapCount = 0), 800);

    if (tapCount >= 4) {
      tapCount = 0;
      window.location.href = "admin.html";
    }
  });
}

/* ---------------------------------------------------------
   LOCALSTORAGE HELPERS
--------------------------------------------------------- */
const STORAGE = {
  clients: "tg_clients",
  deliveries: "tg_deliveries",
  contracts: "tg_contracts",
  employees: "tg_employees",
  settings: "tg_settings",
};

function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.settings)) || {};
  } catch {
    return {};
  }
}

function setSettings(settings) {
  localStorage.setItem(STORAGE.settings, JSON.stringify(settings));
}

/* ---------------------------------------------------------
   SCHEDULE FORM (PUBLIC PAGE)
--------------------------------------------------------- */
const scheduleForm = document.getElementById("schedule-form");

if (scheduleForm) {
  scheduleForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("client-name").value.trim();
    const phone = document.getElementById("client-phone").value.trim();
    const email = document.getElementById("client-email").value.trim();
    const datetime = document.getElementById("preferred-date").value.trim();
    const pickup = document.getElementById("pickup-address").value.trim();
    const dropoff = document.getElementById("dropoff-address").value.trim();
    const cargo = document.getElementById("cargo-description").value.trim();
    const addons = document.getElementById("addons").value;

    const clients = getData(STORAGE.clients);
    const deliveries = getData(STORAGE.deliveries);

    clients.push({
      name,
      phone,
      email,
      address: pickup,
      notes: `Drop‑off: ${dropoff}. Cargo: ${cargo}`,
    });

    deliveries.push({
      id: "D" + Date.now(),
      clientName: name,
      pickup,
      dropoff,
      datetime,
      cargo,
      addons,
      status: "Pending",
    });

    setData(STORAGE.clients, clients);
    setData(STORAGE.deliveries, deliveries);

    const subject = encodeURIComponent("New Delivery Request - Towsum & Gaddy");
    const body = encodeURIComponent(
      `New delivery request:\n\n` +
        `Name: ${name}\n` +
        `Phone: ${phone}\n` +
        `Email: ${email}\n` +
        `Preferred Date/Time: ${datetime}\n` +
        `Pickup Address: ${pickup}\n` +
        `Drop‑off Address: ${dropoff}\n` +
        `Cargo: ${cargo}\n` +
        `Add‑ons: ${addons || "None"}\n\n` +
        `This request was submitted via the Towsum & Gaddy website.`
    );

    window.location.href = `mailto:Towsummanadement55@gmail.com?subject=${subject}&body=${body}`;

    alert("Your request has been recorded and prepared for email. Thank you!");
    scheduleForm.reset();
  });
}

/* ---------------------------------------------------------
   ADMIN DASHBOARD LOGIC
--------------------------------------------------------- */
const dashboard = document.getElementById("dashboard");
if (dashboard) {
  const navButtons = document.querySelectorAll(".dashboard-nav button");
  const sections = {
    home: document.getElementById("dash-home"),
    clients: document.getElementById("dash-clients"),
    deliveries: document.getElementById("dash-deliveries"),
    contracts: document.getElementById("dash-contracts"),
    employees: document.getElementById("dash-employees"),
    settings: document.getElementById("dash-settings"),
  };

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.getAttribute("data-section");

      Object.keys(sections).forEach((key) => {
        sections[key].style.display = key === target ? "block" : "none";
      });
    });
  });

  /* ------------------------------
     REFRESH DASHBOARD TABLES
  ------------------------------ */
  function refreshDashboard() {
    const clients = getData(STORAGE.clients);
    const deliveries = getData(STORAGE.deliveries);
    const contracts = getData(STORAGE.contracts);
    const employees = getData(STORAGE.employees);

    // Stats
    document.getElementById("stat-clients").textContent = clients.length;
    document.getElementById("stat-deliveries").textContent = deliveries.length;
    document.getElementById("stat-contracts").textContent = contracts.length;
    document.getElementById("stat-employees").textContent = employees.length;

    // Clients table
    const clientsTable = document.getElementById("clients-table");
    clientsTable.innerHTML = "";
    clients.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>${c.email}</td>
        <td>${c.address}</td>
        <td>${c.notes}</td>
      `;
      clientsTable.appendChild(tr);
    });

    // Deliveries table
    const deliveriesTable = document.getElementById("deliveries-table");
    deliveriesTable.innerHTML = "";
    deliveries.forEach((d) => {
      const statusClass =
        d.status === "Completed"
          ? "tag-completed"
          : d.status === "Confirmed"
          ? "tag-confirmed"
          : "tag-pending";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.id}</td>
        <td>${d.clientName}</td>
        <td>${d.pickup}</td>
        <td>${d.dropoff}</td>
        <td>${d.datetime}</td>
        <td><span class="tag ${statusClass}">${d.status}</span></td>
      `;
      deliveriesTable.appendChild(tr);
    });

    // Contracts table
    const contractsTable = document.getElementById("contracts-table");
    contractsTable.innerHTML = "";
    contracts.forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.clientName}</td>
        <td>${c.type}</td>
        <td>${c.rate}</td>
        <td>${c.status}</td>
      `;
      contractsTable.appendChild(tr);
    });

    // Employees table
    const employeesTable = document.getElementById("employees-table");
    employeesTable.innerHTML = "";
    employees.forEach((e) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${e.name}</td>
        <td>${e.phone}</td>
        <td>${e.email}</td>
        <td>${e.role}</td>
      `;
      employeesTable.appendChild(tr);
    });
  }

  refreshDashboard();

  /* ------------------------------
     ADD CLIENT
  ------------------------------ */
  const addClientBtn = document.getElementById("client-add-btn");
  if (addClientBtn) {
    addClientBtn.addEventListener("click", () => {
      const name = document.getElementById("client-add-name").value.trim();
      const phone = document.getElementById("client-add-phone").value.trim();
      const email = document.getElementById("client-add-email").value.trim();
      const address = document.getElementById("client-add-address").value.trim();

      if (!name) return alert("Enter a client name.");

      const clients = getData(STORAGE.clients);
      clients.push({ name, phone, email, address, notes: "" });
      setData(STORAGE.clients, clients);

      document.getElementById("client-add-name").value = "";
      document.getElementById("client-add-phone").value = "";
      document.getElementById("client-add-email").value = "";
      document.getElementById("client-add-address").value = "";

      refreshDashboard();
    });
  }

  /* ------------------------------
     ADD DELIVERY
  ------------------------------ */
  const addDeliveryBtn = document.getElementById("del-add-btn");
  if (addDeliveryBtn) {
    addDeliveryBtn.addEventListener("click", () => {
      const clientName = document.getElementById("del-add-client").value.trim();
      const pickup = document.getElementById("del-add-pickup").value.trim();
      const dropoff = document.getElementById("del-add-dropoff").value.trim();
      const datetime = document.getElementById("del-add-datetime").value.trim();

      if (!clientName) return alert("Enter a client name.");

      const deliveries = getData(STORAGE.deliveries);
      deliveries.push({
        id: "D" + Date.now(),
        clientName,
        pickup,
        dropoff,
        datetime,
        status: "Pending",
      });

      setData(STORAGE.deliveries, deliveries);

      document.getElementById("del-add-client").value = "";
      document.getElementById("del-add-pickup").value = "";
      document.getElementById("del-add-dropoff").value = "";
      document.getElementById("del-add-datetime").value = "";

      refreshDashboard();
    });
  }

  /* ------------------------------
     ADD CONTRACT
  ------------------------------ */
  const addContractBtn = document.getElementById("con-add-btn");
  if (addContractBtn) {
    addContractBtn.addEventListener("click", () => {
      const clientName = document.getElementById("con-add-client").value.trim();
      const type = document.getElementById("con-add-type").value.trim();
      const rate = document.getElementById("con-add-rate").value.trim();
      const status =
        document.getElementById("con-add-status").value.trim() || "Draft";

      if (!clientName) return alert("Enter a client name.");

      const contracts = getData(STORAGE.contracts);
      contracts.push({
        id: "C" + Date.now(),
        clientName,
        type,
        rate,
        status,
      });

      setData(STORAGE.contracts, contracts);

      document.getElementById("con-add-client").value = "";
      document.getElementById("con-add-type").value = "";
      document.getElementById("con-add-rate").value = "";
      document.getElementById("con-add-status").value = "";

      refreshDashboard();
    });
  }

  /* ------------------------------
     ADD EMPLOYEE
  ------------------------------ */
  const addEmployeeBtn = document.getElementById("emp-add-btn");
  if (addEmployeeBtn) {
    addEmployeeBtn.addEventListener("click", () => {
      const name = document.getElementById("emp-add-name").value.trim();
      const phone = document.getElementById("emp-add-phone").value.trim();
      const email = document.getElementById("emp-add-email").value.trim();
      const role = document.getElementById("emp-add-role").value.trim();

      if (!name) return alert("Enter an employee name.");

      const employees = getData(STORAGE.employees);
      employees.push({ name, phone, email, role });
      setData(STORAGE.employees, employees);

      document.getElementById("emp-add-name").value = "";
      document.getElementById("emp-add-phone").value = "";
      document.getElementById("emp-add-email").value = "";
      document.getElementById("emp-add-role").value = "";

      refreshDashboard();
    });
  }

  /* ------------------------------
     SETTINGS — CHANGE PIN
  ------------------------------ */
  const savePinBtn = document.getElementById("pin-save");
  if (savePinBtn) {
    savePinBtn.addEventListener("click", () => {
      const newPin = document.getElementById("pin-change").value.trim();
      if (!newPin) return alert("Enter a new PIN.");

      const settings = getSettings();
      settings.pin = newPin;
      setSettings(settings);

      alert("PIN updated for this browser.");
      document.getElementById("pin-change").value = "";
    });
  }
}
