/* ============================================
   ITECA'27 - Admin Panel Logic
   Firebase Firestore Version
   ============================================ */
// ==========================================
// ADMIN SECURITY CHECK
// ==========================================

if (sessionStorage.getItem('iteca-admin') !== 'true') {

    window.location.href = 'index.html';

}
// All registration data (loaded from Firestore)
let allData = [];

// ID of the registration pending deletion
let pendingDeleteId = null;

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

  // Load data from Firestore
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
// FETCH REGISTRATIONS FROM FIRESTORE
// ==========================================
async function fetchRegistrations() {
  try {
    // Use the helper function from firebase.js
    allData = await getAllRegistrations();
    updateStats();
    renderTable(allData);
    showToast(`Loaded ${allData.length} registrations`, 'success');
  } catch (error) {
    console.error('Fetch error:', error);
    showToast('Cannot connect to Firebase. Check your config.', 'error');
    allData = [];
    updateStats();
    renderTable([]);
  }
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
    tbody.innerHTML = '<tr><td colspan="7" class="no-data">No registrations found</td></tr>';
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
      <td>
        <button class="btn btn-danger btn-xs" onclick="openDeleteModal('${row.id}', '${(row.name || '').replace(/'/g, "\\'")}', '${(row.competition || '').replace(/'/g, "\\'")}')">🗑️</button>
      </td>
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
// DELETE REGISTRATION
// ==========================================

// Open delete confirmation modal
function openDeleteModal(docId, name, competition) {
  pendingDeleteId = docId;
  document.getElementById('delete-modal-text').textContent = 
    `Delete registration of "${name}" from "${competition}"?`;
  document.getElementById('delete-modal').classList.add('active');
}

// Close delete modal
function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('delete-modal').classList.remove('active');
}

// Confirm and execute delete
async function confirmDelete() {
  if (!pendingDeleteId) return;

  const deleteBtn = document.getElementById('confirm-delete-btn');
  deleteBtn.disabled = true;
  deleteBtn.textContent = 'Deleting...';

  try {
    // Delete from Firestore using firebase.js helper
    await deleteRegistrationById(pendingDeleteId);
    showToast('Registration deleted successfully', 'success');

    // Refresh the data
    closeDeleteModal();
    await fetchRegistrations();
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Failed to delete. Please try again.', 'error');
  } finally {
    deleteBtn.disabled = false;
    deleteBtn.textContent = 'Delete';
  }
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
    'Email': row.email || '',
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
