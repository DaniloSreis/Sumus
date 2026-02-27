export function initDropdown(containerId) {
  const container = document.getElementById(containerId);

  // Selector Caching
  const button = container.querySelector('.dropdown__button');
  const label = container.querySelector('.dropdown__button-text');
  const list = container.querySelector('.dropdown__list');
  const options = Array.from(container.querySelectorAll("div[role='option'"));

  // State Machine
  function setDropdownState(isOpen, shouldFocus = true) {
    button.setAttribute('aria-expanded', isOpen);
    list.style.display = isOpen ? 'block' : 'none';

    if (isOpen) {
      options[0].focus();
    } else if (shouldFocus) {
      button.focus();
    }
  }

  // DRY (Don't Repeat Yourself)
  function selectOption(optionElement) {
    options.forEach((opt) => {
      const isSelected = opt === optionElement;
      opt.setAttribute('aria-selected', isSelected);
    });

    label.textContent = optionElement.textContent;
    setDropdownState(false);
  }

  function handleKeyboardNavigation(e) {
    const currentIndex = options.indexOf(document.activeElement);

    const actions = {
      // Avaliação de short-circuit
      ArrowDown: () =>
        currentIndex < options.length - 1 && options[currentIndex + 1].focus(),
      ArrowUp: () => currentIndex > 0 && options[currentIndex - 1].focus(),
      Escape: () => setDropdownState(false),
      Enter: () => selectOption(document.activeElement),
      ' ': () => selectOption(document.activeElement),
    };

    if (actions[e.key]) {
      e.preventDefault();
      actions[e.key]();
    }
  }

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'false';
    setDropdownState(isOpen);
  });

  // Event Bubbling e Delegation acontece aqui
  list.addEventListener('keydown', handleKeyboardNavigation);
  // Event Bubbling e Delegation acontece aqui
  list.addEventListener('click', (e) => {
    const option = e.target.closest("[role='option']");
    if (option) selectOption(option);
  });

  document.addEventListener('click', (e) => {
    const isClickInside = container.contains(e.target);
    if (!isClickInside) {
      setDropdownState(false, false);
    }
  });
}
