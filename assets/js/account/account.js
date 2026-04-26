import { initDropdown } from '../components/dropdown.js';

initDropdown('dropdownAccount');

const sidebar = document.querySelector('.sidebar');
const menuToggle = document.querySelector('.sidebar__menu-toggle');
const sidebarContent = document.querySelector('.sidebar__content');
const mobileMedia = window.matchMedia('(max-width: 768px)');

function syncSidebarState(isMobileMenuOpen) {
  if (!sidebar || !menuToggle || !sidebarContent) return;

  const isMobile = mobileMedia.matches;
  const shouldShowContent = !isMobile || isMobileMenuOpen;

  sidebar.classList.toggle('sidebar--open', isMobile && isMobileMenuOpen);
  menuToggle.setAttribute('aria-expanded', String(shouldShowContent && isMobile));
  sidebarContent.hidden = !shouldShowContent;
}

if (sidebar && menuToggle && sidebarContent) {
  let isMobileMenuOpen = false;

  syncSidebarState(isMobileMenuOpen);

  menuToggle.addEventListener('click', () => {
    if (!mobileMedia.matches) return;

    isMobileMenuOpen = !isMobileMenuOpen;
    syncSidebarState(isMobileMenuOpen);
  });

  mobileMedia.addEventListener('change', (event) => {
    if (!event.matches) {
      isMobileMenuOpen = false;
    }

    syncSidebarState(isMobileMenuOpen);
  });
}

function enviarDocumento  () {alert("Documento enviado")}