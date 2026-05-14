/* ============================================
   ITECA'27 - Admin Panel Logic
   ============================================ */

// ⚠️ Replace with your Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

// All registration data
let allData = [];

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Check admin session
  if (sessionStorage.getItem('iteca-admin') !== 'true') {
    window.location.href = 'index.html';
    return;
  }

  // Hide loader
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 800);

  // Load data
  fetchRegistrations();
});

// ==========================================
// THEME TOGGLE (shared with main page)
// ==========================================
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.getElementById('theme-toggle').textContent = next === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('iteca-theme', next);
}

// Load saved theme
(function () {
  const saved = localStorage.getItem('iteca-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = saved === 'dark' ? '🌙' : '☀️';
  }
})();

// ==========================================
// FETCH REGISTRATIONS FROM GOOGLE SHEETS
// ==========================================
async function fetchRegistrations() {
  try {
    const response = await fetch(APPS_SCRIPT_URL + '?action=getAll');
    const result = await response.json();

    if (result.status === 'success') {
      allData = result.data || [];
      updateStats();
      renderTable(allData);
      showToast(`Loaded ${allData.length} registrations`, 'success');
    } else {
      showToast('Failed to fetch data', 'error');
      renderTable([]);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    showToast('Cannot connect to server. Check your Apps Script URL.', 'error');

    // Show demo data for testing
    allData = getDemoData();
    updateStats();
    renderTable(allData);
  }
}

// Demo data for offline testing
function getDemoData() {
  return [
    { competition: 'DEBUGGING', rollNumber: '23SUCA027', name: 'ARUN KUMAR', teamMembers: 'N/A', timestamp: '5/14/2027, 10:30:00 AM' },
    { competition: 'BLIND CODING', rollNumber: '23SUCA015', name: 'PRIYA SHARMA', teamMembers: 'N/A', timestamp: '5/14/2027, 11:00:00 AM' },
    { competition: 'PPT PRESENTATION', rollNumber: '23SUCA010', name: 'RAVI KUMAR', teamMembers: '23SUCA011 - KARTHIK S', timestamp: '5/14/2027, 11:30:00 AM' },
    { competition: 'SOFTWARE MARKETING', rollNumber: '23SUCA020', name: 'DIVYA M', teamMembers: '23SUCA021 - SNEHA R | 23SUCA022 - VISHNU K', timestamp: '5/14/2027, 12:00:00 PM' },
    { competition: 'WEB DESIGN', rollNumber: '23SUCA033', name: 'HARISH B', teamMembers: 'N/A', timestamp: '5/14/2027, 12:30:00 PM' },
  ];
}

// ==========================================
// UPDATE STATS
// ==========================================
function updateStats() {
  const total = allData.length;
  const solo = allData.filter(d => d.teamMembers === 'N/A').length;
  const team = total - solo;

  const today = new Date().toLocaleDateString();
  const todayCount = allData.filter(d => {
    try { return new Date(d.timestamp).toLocaleDateString() === today; } catch { return false; }
  }).length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-solo').textContent = solo;
  document.getElementById('stat-team').textContent = team;
  document.getElementById('stat-today').textContent = todayCount;
}

// ==========================================
// RENDER TABLE
// ==========================================
function renderTable(data) {
  const tbody = document.getElementById('table-body');

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">No registrations found</td></tr>';
    return;
  }

  tbody.innerHTML = data.map((row, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${row.competition || ''}</td>
      <td>${row.rollNumber || ''}</td>
      <td>${row.name || ''}</td>
      <td>${row.teamMembers || 'N/A'}</td>
      <td>${row.timestamp || ''}</td>
    </tr>
  `).join('');
}

// ==========================================
// FILTER TABLE
// ==========================================
function filterTable() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const compFilter = document.getElementById('comp-filter').value;

  let filtered = allData;

  // Competition filter
  if (compFilter !== 'all') {
    filtered = filtered.filter(d => d.competition === compFilter);
  }

  // Search filter
  if (search) {
    filtered = filtered.filter(d =>
      (d.name || '').toLowerCase().includes(search) ||
      (d.rollNumber || '').toLowerCase().includes(search) ||
      (d.teamMembers || '').toLowerCase().includes(search)
    );
  }

  renderTable(filtered);
}

// ==========================================
// DOWNLOAD EXCEL
// ==========================================
function downloadExcel() {
  if (allData.length === 0) {
    showToast('No data to export', 'error');
    return;
  }

  // Prepare data for export
  const exportData = allData.map((row, i) => ({
    '#': i + 1,
    'Competition': row.competition,
    'Roll Number': row.rollNumber,
    'Name': row.name,
    'Team Members': row.teamMembers,
    'Timestamp': row.timestamp
  }));

  // Create workbook using SheetJS
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Registrations');

  // Download
  XLSX.writeFile(wb, 'ITECA27_Registrations.xlsx');
  showToast('Excel downloaded successfully!', 'success');
}

// ==========================================
// REFRESH DATA
// ==========================================
function refreshData() {
  showToast('Refreshing data...', 'info');
  fetchRegistrations();
}

// ==========================================
// LOGOUT
// ==========================================
function logout() {
  sessionStorage.removeItem('iteca-admin');
  window.location.href = 'index.html';
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
