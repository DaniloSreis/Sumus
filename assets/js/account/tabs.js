const tabs = document.querySelectorAll('.settings__tab');
const panels = document.querySelectorAll('.settings__panel');

function showPanel(e, index) {
  tabs.forEach((tab, index) => {
    tab.setAttribute('aria-selected', 'false');
    panels[index].setAttribute('aria-hidden', 'true');
  });
  e.currentTarget.setAttribute('aria-selected', 'true');
  panels[index].setAttribute('aria-hidden', 'false');
}

function switchTab() {
  tabs.forEach((tab, index) =>
    tab.addEventListener('click', (e) => {
      showPanel(e, index);
    }),
  );

  tabs.forEach((tab, index) => {
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        showPanel(e, index);
      }
    });
  });
}

switchTab();
