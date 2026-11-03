(() => {
  const menuButton = document.getElementById('menu-button');
  const navigation = document.getElementById('navigation');

  if (!menuButton || !navigation) return;

  function closeMenu() {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = 'Menu';
  }

  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');

    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? 'Sluiten' : 'Menu';
  });

  document.addEventListener('keydown', event => {
    if (
      event.key === 'Escape' &&
      navigation.classList.contains('is-open')
    ) {
      closeMenu();
      menuButton.focus();
    }
  });

  window.matchMedia('(min-width: 721px)')
    .addEventListener('change', event => {
      if (event.matches) closeMenu();
    });
})();
