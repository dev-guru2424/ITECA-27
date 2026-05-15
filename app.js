/* ============================================
   ITECA'27 - Main Application Logic
   Firebase + PHPMailer Version
   ============================================ */

// ==========================================
// CONFIGURATION
// ==========================================

// ⚠️ Replace this URL with your PHP backend URL
// For local XAMPP testing: 'http://localhost/xampp/ITECA\'27/backend/sendmail.php'
// For InfinityFree/000webhost: 'https://your-domain.com/sendmail.php'
const PHP_BACKEND_URL ='https://iteca.free.nf/sendmail.php';

// Event date for countdown (change as needed)
const EVENT_DATE = new Date('2027-05-15T09:00:00');

// Registration close date
const REG_CLOSE_DATE = new Date('2027-05-10T23:59:59');

// Competition data
const COMPETITIONS = [
  { id: 'debugging',       name: 'DEBUGGING',           icon: '🐛', team: 'solo',    min: 1, max: 1 },
  { id: 'blind-coding',    name: 'BLIND CODING',        icon: '🙈', team: 'solo',    min: 1, max: 1 },
  { id: 'program-dev',     name: 'PROGRAM DEVELOPMENT', icon: '💻', team: 'solo',    min: 1, max: 1 },
  { id: 'web-design',      name: 'WEB DESIGN',          icon: '🌐', team: 'solo',    min: 1, max: 1 },
  { id: 'poster-making',   name: 'POSTER MAKING',       icon: '🎨', team: 'solo',    min: 1, max: 1 },
  { id: 'ppt-presentation',name: 'PPT PRESENTATION',    icon: '📊', team: 'duo',     min: 2, max: 2 },
  { id: 'software-mktg',   name: 'SOFTWARE MARKETING',  icon: '📈', team: 'group',   min: 2, max: 4 },
];

// Admin credentials
const ADMIN_USER = "ITECA'27";
const ADMIN_PASS = 'iteca*27';

// ==========================================
// STATE
// ==========================================
let selectedCompetition = null;
let teamMemberCount = 0;

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Hide loader after short delay
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 1200);

  renderCompetitions();
  startCountdown();
  generateQR();
  initAutoUppercase();
  checkRegistrationClosed();
});

// ==========================================
// THEME TOGGLE
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
// COUNTDOWN TIMER
// ==========================================
function startCountdown() {
  function update() {
    const now = new Date();
    const diff = EVENT_DATE - now;

    if (diff <= 0) {
      document.getElementById('cd-days').textContent = '00';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent = '00';
      document.getElementById('cd-secs').textContent = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// ==========================================
// CHECK REGISTRATION CLOSED
// ==========================================
function checkRegistrationClosed() {
  if (new Date() > REG_CLOSE_DATE) {
    showToast('Registration has closed!', 'error');
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('submit-btn').textContent = 'Closed';
  }
}

// ==========================================
// RENDER COMPETITION CARDS
// ==========================================
function renderCompetitions() {
  const grid = document.getElementById('comp-grid');
  grid.innerHTML = '';

  COMPETITIONS.forEach(comp => {
    const teamLabel = comp.team === 'solo' ? '👤 Solo' :
                      comp.team === 'duo'  ? '👥 2 Members' :
                      `👥 ${comp.min}-${comp.max} Members`;

    const card = document.createElement('div');
    card.className = 'comp-card';
    card.id = `card-${comp.id}`;
    card.onclick = () => selectCompetition(comp);
    card.innerHTML = `
      <div class="check-mark">✓</div>
      <div class="comp-card-content">
        <div class="comp-icon">${comp.icon}</div>
        <h3>${comp.name}</h3>
        <div class="comp-meta">${teamLabel}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ==========================================
// SELECT COMPETITION
// ==========================================
function selectCompetition(comp) {
  // Check if registration is closed
  if (new Date() > REG_CLOSE_DATE) {
    showToast('Registration has closed!', 'error');
    return;
  }

  // Deselect all cards
  document.querySelectorAll('.comp-card').forEach(c => c.classList.remove('selected'));

  // Select this card
  document.getElementById(`card-${comp.id}`).classList.add('selected');
  selectedCompetition = comp;

  // Show form
  const formSection = document.getElementById('reg-form-section');
  formSection.classList.add('active');
  document.getElementById('form-title').textContent = `Register for ${comp.name}`;

  // Update form subtitle
  const subText = comp.team === 'solo' ? 'Single participant registration' :
                  comp.team === 'duo'  ? 'Team of 2 members required' :
                  `Team of ${comp.min} to ${comp.max} members`;
  document.getElementById('form-subtitle').textContent = subText;

  // Handle team section
  const teamSection = document.getElementById('team-section');
  const teamContainer = document.getElementById('team-members-container');
  const addBtn = document.getElementById('add-member-btn');
  teamContainer.innerHTML = '';
  teamMemberCount = 0;

  if (comp.team === 'solo') {
    // Solo — hide team section
    teamSection.classList.add('hidden');
  } else if (comp.team === 'duo') {
    // PPT — exactly 2, show 1 extra member field (leader + 1)
    teamSection.classList.remove('hidden');
    document.getElementById('team-title').textContent = 'Team Member 2';
    addBtn.classList.add('hidden');
    addTeamMember();
  } else {
    // Software Marketing — 2 to 4, leader is 1, need 1 to 3 more
    teamSection.classList.remove('hidden');
    document.getElementById('team-title').textContent = 'Additional Team Members';
    addBtn.classList.remove('hidden');
    addTeamMember(); // Start with 1 extra member (total 2)
  }

  // Scroll to form
  formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==========================================
// DYNAMIC TEAM MEMBERS
// ==========================================
function addTeamMember() {
  if (!selectedCompetition) return;

  // Calculate max additional members (excluding leader)
  const maxExtra = selectedCompetition.max - 1;
  if (teamMemberCount >= maxExtra) {
    showToast(`Maximum ${selectedCompetition.max} members allowed`, 'error');
    return;
  }

  teamMemberCount++;
  const container = document.getElementById('team-members-container');

  const row = document.createElement('div');
  row.className = 'member-row';
  row.id = `member-row-${teamMemberCount}`;
  row.innerHTML = `
    <input type="text" class="team-roll" placeholder="Roll Number" data-uppercase="true" />
    <input type="text" class="team-name" placeholder="Name" data-uppercase="true" />
  `;
  container.appendChild(row);

  // Apply auto-uppercase to new inputs
  row.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => { inp.value = inp.value.toUpperCase(); });
  });

  // Hide add button if max reached
  if (teamMemberCount >= maxExtra) {
    document.getElementById('add-member-btn').classList.add('hidden');
  }
}

// ==========================================
// AUTO UPPERCASE
// ==========================================
function initAutoUppercase() {
  const rollInput = document.getElementById('roll-number');
  const nameInput = document.getElementById('participant-name');
  rollInput.addEventListener('input', () => { rollInput.value = rollInput.value.toUpperCase(); });
  nameInput.addEventListener('input', () => { nameInput.value = nameInput.value.toUpperCase(); });
}

// ==========================================
// CANCEL REGISTRATION
// ==========================================
function cancelRegistration() {
  document.getElementById('reg-form-section').classList.remove('active');
  document.querySelectorAll('.comp-card').forEach(c => c.classList.remove('selected'));
  selectedCompetition = null;
  document.getElementById('reg-form').reset();
  document.getElementById('team-members-container').innerHTML = '';
}

// ==========================================
// SUBMIT REGISTRATION (Firebase + PHPMailer)
// ==========================================
async function submitRegistration() {
  // Validate competition selected
  if (!selectedCompetition) {
    showToast('Please select a competition first', 'error');
    return;
  }

  // Check registration closed
  if (new Date() > REG_CLOSE_DATE) {
    showToast('Registration has closed!', 'error');
    return;
  }

  const rollNumber = document.getElementById('roll-number').value.trim().toUpperCase();
  const name = document.getElementById('participant-name').value.trim().toUpperCase();

  // Validate required fields
  if (!rollNumber || !name) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  // Collect team members
  let teamMembers = [];
  if (selectedCompetition.team !== 'solo') {
    const rows = document.querySelectorAll('.member-row');
    for (const row of rows) {
      const tRoll = row.querySelector('.team-roll').value.trim().toUpperCase();
      const tName = row.querySelector('.team-name').value.trim().toUpperCase();
      if (!tRoll || !tName) {
        showToast('Please fill in all team member details', 'error');
        return;
      }
      teamMembers.push({ roll: tRoll, name: tName });
    }

    // Validate team size
    const totalMembers = 1 + teamMembers.length; // leader + extras
    if (totalMembers < selectedCompetition.min) {
      showToast(`Minimum ${selectedCompetition.min} members required`, 'error');
      return;
    }
    if (totalMembers > selectedCompetition.max) {
      showToast(`Maximum ${selectedCompetition.max} members allowed`, 'error');
      return;
    }
  }

  // Generate email from roll number
  const email = rollNumber.toLowerCase() + '@vhnsnc.edu.in';

  // Build team string for storage
  const teamStr = teamMembers.length > 0
    ? teamMembers.map(m => `${m.roll} - ${m.name}`).join(' | ')
    : 'N/A';

  // Show loading state
  const submitBtn = document.getElementById('submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    // ── Step 1: Check for duplicate registration in Firebase ──
    const isDuplicate = await checkDuplicate(selectedCompetition.name, rollNumber);
    if (isDuplicate) {
      showToast('You have already registered for this competition!', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    // ── Step 2: Save registration to Firebase Firestore ──
    const registrationData = {
      competition: selectedCompetition.name,
      rollNumber: rollNumber,
      name: name,
      email: email,
      teamMembers: teamStr
    };

    await addRegistration(registrationData);

    // ── Step 3: Send confirmation email via PHP backend ──
    try {
      const emailResponse = await fetch(PHP_BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          name: name,
          competition: selectedCompetition.name,
          teamMembers: teamStr
        })
      });

      const emailResult = await emailResponse.json();

      if (emailResult.status === 'success') {
        console.log('📧 Email sent successfully');
      } else {
        console.warn('📧 Email failed:', emailResult.message);
        // Don't show error to user — registration already saved
      }
    } catch (emailError) {
      // Email sending failed but registration is saved
      console.warn('📧 Email service unreachable:', emailError);
    }

    // ── Step 4: Show success and reset form ──
    showToast(`Successfully registered for ${selectedCompetition.name}! 🎉`, 'success');
    cancelRegistration();

  } catch (error) {
    console.error('Registration error:', error);
    showToast('Registration failed. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
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

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================
// QR CODE GENERATION
// ==========================================
function generateQR() {
  const container = document.getElementById('qr-code-container');
  const urlText = document.getElementById('qr-url-text');

  // Use current page URL (will be GitHub Pages URL after deploy)
  const url = window.location.href;
  urlText.textContent = url;

  // Generate QR using qrcode.js library
  if (typeof QRCode !== 'undefined') {
    new QRCode(container, {
      text: url,
      width: 180,
      height: 180,
      colorDark: '#1a1a2e',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

// ==========================================
// ADMIN MODAL
// ==========================================
function openAdminModal() {
  document.getElementById('admin-modal').classList.add('active');
}
function closeAdminModal() {
  document.getElementById('admin-modal').classList.remove('active');
  document.getElementById('admin-user').value = '';
  document.getElementById('admin-pass').value = '';
}

function handleAdminLogin() {
  const user = document.getElementById('admin-user').value;
  const pass = document.getElementById('admin-pass').value;

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    // Store session and redirect
    sessionStorage.setItem('iteca-admin', 'true');
    window.location.href = 'admin.html';
  } else {
    showToast('Invalid credentials', 'error');
  }
}

// Enter key support for admin login
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.getElementById('admin-modal').classList.contains('active')) {
    handleAdminLogin();
  }
});
