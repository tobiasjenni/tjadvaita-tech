// Focus mode keeps the same iframe alive, including any running meditation.
(() => {
  const button = document.querySelector('.focus-toggle');
  document.querySelector('.practice-dock').addEventListener('click', event => {
    if (event.target.closest('a[aria-current="page"]')) event.preventDefault();
  });
  button.addEventListener('click', () => {
    const focused = document.body.classList.toggle('focus-mode');
    button.setAttribute('aria-pressed',String(focused));
    button.setAttribute('aria-label',focused ? 'Exit focus mode' : 'Enter focus mode');
    button.title = focused ? 'Exit focus mode' : 'Focus mode';
    button.querySelector('span').textContent = focused ? 'Exit focus' : 'Focus';
  });
})();
