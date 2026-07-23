/* ================================================================
   EcoTrack - Shared App JavaScript
   Sidebar, Theme Toggle, Session Guard, Toast Helper
================================================================ */

// ----------------------------------------------------------------
// SIDEBAR LINKS CONFIG (Single source of truth for all pages)
// ----------------------------------------------------------------
const NAV_LINKS = [
  { href: 'dashboard.html',        icon: 'fa-gauge-high',      label: 'Dashboard',         section: 'MAIN' },
  { href: 'calculator.html',       icon: 'fa-calculator',      label: 'Carbon Calculator', section: 'MAIN' },
  { href: 'recommendations.html',  icon: 'fa-robot',           label: 'AI Recommendations',section: 'MAIN' },
  { href: 'analytics.html',        icon: 'fa-chart-bar',       label: 'Analytics',         section: 'MAIN' },
  { href: 'history.html',          icon: 'fa-clock-rotate-left',label: 'History',          section: 'MAIN' },
  { href: 'leaderboard.html',      icon: 'fa-trophy',          label: 'Leaderboard',       section: 'COMMUNITY' },
  { href: 'profile.html',          icon: 'fa-user-circle',     label: 'My Profile',        section: 'ACCOUNT' },
  { href: 'feedback.html',         icon: 'fa-star',            label: 'Feedback',          section: 'ACCOUNT' },
  { href: 'contact.html',          icon: 'fa-headset',         label: 'Contact / FAQ',     section: 'ACCOUNT' },
  { href: 'admin.html',            icon: 'fa-shield-halved',   label: 'Admin Panel',       section: 'ADMIN', badge: 'Admin' },
];

const SESSION_USER = {
  name: localStorage.getItem('eco_username') || 'Eco Champion',
  score: localStorage.getItem('eco_score') || '82',
  initial: (localStorage.getItem('eco_username') || 'E')[0].toUpperCase()
};

// ----------------------------------------------------------------
// RENDER SIDEBAR
// ----------------------------------------------------------------
function renderSidebar(activePage) {
  const sections = [...new Set(NAV_LINKS.map(l => l.section))];
  let sectionsHtml = '';
  sections.forEach(section => {
    const links = NAV_LINKS.filter(l => l.section === section);
    sectionsHtml += `<div class="sidebar-menu-section">${section}</div>`;
    links.forEach(link => {
      const isActive = link.href === activePage;
      sectionsHtml += `
        <a href="${link.href}" class="sidebar-link${isActive ? ' active' : ''}">
          <span class="sidebar-link-icon"><i class="fas ${link.icon}"></i></span>
          <span class="sidebar-link-label">${link.label}</span>
          ${link.badge ? `<span class="sidebar-badge">${link.badge}</span>` : ''}
        </a>`;
    });
  });

  const html = `
    <div class="sidebar" id="appSidebar">
      <div class="sidebar-header">
        <a href="index.html" class="sidebar-brand">
          <div class="brand-icon-sm"><i class="fas fa-leaf"></i></div>
          <span class="sidebar-brand-text fw-black"><span style="color:var(--primary)">Eco</span>Track</span>
        </a>
        <button class="sidebar-collapse-btn" id="sidebarCollapseBtn" title="Collapse sidebar">
          <i class="fas fa-chevron-left" id="collapseIcon"></i>
        </button>
      </div>
      <div class="sidebar-user" onclick="window.location.href='profile.html'">
        <div class="sidebar-avatar">${SESSION_USER.initial}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${SESSION_USER.name}</div>
          <div class="sidebar-user-score">🌿 Eco Score: ${SESSION_USER.score}</div>
        </div>
      </div>
      <nav class="sidebar-menu">${sectionsHtml}</nav>
      <div class="sidebar-footer">
        <a href="#" class="sidebar-link" onclick="logoutUser(event)">
          <span class="sidebar-link-icon"><i class="fas fa-right-from-bracket"></i></span>
          <span class="sidebar-link-label">Logout</span>
        </a>
      </div>
    </div>
    <div class="mobile-overlay" id="mobileOverlay"></div>`;

  const container = document.getElementById('sidebarContainer');
  if (container) container.innerHTML = html;
  else {
    const div = document.createElement('div');
    div.id = 'sidebarContainer';
    div.innerHTML = html;
    document.body.prepend(div);
  }

  initSidebarBehavior();
}

// ----------------------------------------------------------------
// SIDEBAR BEHAVIOR (Collapse + Mobile Toggle)
// ----------------------------------------------------------------
function initSidebarBehavior() {
  const sidebar = document.getElementById('appSidebar');
  const mainContent = document.getElementById('mainContent');
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  const collapseIcon = document.getElementById('collapseIcon');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileToggle = document.getElementById('mobileMenuToggle');

  const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  if (isCollapsed && window.innerWidth > 992) {
    sidebar.classList.add('collapsed');
    mainContent?.classList.add('expanded');
    collapseIcon.classList.replace('fa-chevron-left', 'fa-chevron-right');
    toggleLabelVisibility(true);
  }

  collapseBtn?.addEventListener('click', () => {
    const collapsed = sidebar.classList.toggle('collapsed');
    mainContent?.classList.toggle('expanded', collapsed);
    collapseIcon.classList.toggle('fa-chevron-left', !collapsed);
    collapseIcon.classList.toggle('fa-chevron-right', collapsed);
    localStorage.setItem('sidebar_collapsed', collapsed);
    toggleLabelVisibility(collapsed);
  });

  mobileToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
    mobileOverlay.classList.toggle('show');
  });

  mobileOverlay?.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    mobileOverlay.classList.remove('show');
  });
}

function toggleLabelVisibility(collapsed) {
  document.querySelectorAll('.sidebar-link-label, .sidebar-brand-text, .sidebar-user-info, .sidebar-menu-section, .sidebar-badge')
    .forEach(el => el.style.opacity = collapsed ? '0' : '1');
}

// ----------------------------------------------------------------
// RENDER TOPBAR
// ----------------------------------------------------------------
function renderTopbar(pageTitle, breadcrumb) {
  const html = `
    <div class="app-topbar">
      <div class="topbar-left">
        <button class="topbar-icon-btn" id="mobileMenuToggle" style="display:none">
          <i class="fas fa-bars"></i>
        </button>
        <div>
          <div class="page-title-header">${pageTitle}</div>
          <div class="breadcrumb-custom">
            <a href="dashboard.html">Dashboard</a>
            <i class="fas fa-chevron-right" style="font-size:0.6rem"></i>
            <span>${breadcrumb}</span>
          </div>
        </div>
      </div>
      <div class="topbar-right">
        <button class="topbar-icon-btn theme-toggle-app" title="Toggle Theme">
          <i class="fas fa-sun" id="themeIconApp"></i>
        </button>
        <a href="notifications.html" class="topbar-icon-btn" title="Notifications">
          <i class="fas fa-bell"></i>
          <div class="notif-dot"></div>
        </a>
        <a href="profile.html" class="topbar-icon-btn" title="Profile">
          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;color:white;">${SESSION_USER.initial}</div>
        </a>
      </div>
    </div>`;

  const container = document.getElementById('topbarContainer');
  if (container) container.innerHTML = html;

  // Mobile toggle show
  if (window.innerWidth <= 992) {
    const mobileBtn = document.getElementById('mobileMenuToggle');
    if (mobileBtn) mobileBtn.style.display = 'flex';
    mobileBtn?.addEventListener('click', () => {
      const sidebar = document.getElementById('appSidebar');
      const overlay = document.getElementById('mobileOverlay');
      sidebar?.classList.toggle('mobile-open');
      overlay?.classList.toggle('show');
    });
  }

  // Theme toggle
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  document.querySelectorAll('.theme-toggle-app').forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcon(next);
    });
  });
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIconApp');
  if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ----------------------------------------------------------------
// LOGOUT
// ----------------------------------------------------------------
async function logoutUser(e) {
  e?.preventDefault();
  try { await fetch('/api/logout'); } catch {}
  localStorage.removeItem('eco_username');
  localStorage.removeItem('eco_score');
  showAppToast('Logged out successfully!', 'success');
  setTimeout(() => window.location.href = 'login.html', 1200);
}

// ----------------------------------------------------------------
// GLOBAL TOAST HELPER
// ----------------------------------------------------------------
function showAppToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success:'fa-check-circle', error:'fa-exclamation-circle', info:'fa-info-circle', warning:'fa-triangle-exclamation' };
  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `<i class="fas ${icons[type]||icons.success}" style="color:var(--primary)"></i><div>${message}</div>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toast-out 0.4s ease forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, 4000);
}

// Expose globally
window.showAppToast = showAppToast;
window.logoutUser = logoutUser;
