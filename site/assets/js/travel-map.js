(() => {
  document.querySelectorAll('[data-travel-explorer]').forEach(root => {
    const popup = root.querySelector('[data-map-popup]');
    const countries = [...root.querySelectorAll('[data-country]')];
    const destinations = new Map([...root.querySelectorAll('[data-map-destination]')].map(el => [el.dataset.mapDestination, el]));
    let current = null, pinned = false, timer, anchor = null;
    const cancel = () => clearTimeout(timer);

    function close(restoreFocus = false) {
      cancel();
      const previous = current;
      current = null;
      pinned = false;
      popup.hidden = true;
      countries.forEach(el => {
        el.classList.remove('is-selected');
        el.setAttribute('aria-expanded', 'false');
      });
      if (restoreFocus) {
        const target = countries.find(el => el.dataset.country === previous);
        if (target) {
          target.dataset.skipFocus = 'true';
          target.focus();
          delete target.dataset.skipFocus;
        }
      }
    }

    function position() {
      if (!current) return;
      const bounds = root.getBoundingClientRect();
      const target = countries.find(el => el.dataset.country === current).getBoundingClientRect();
      const x = anchor ? anchor.x - bounds.left : target.left - bounds.left + target.width / 2;
      const y = anchor ? anchor.y - bounds.top : target.top - bounds.top + target.height / 2;
      const width = popup.offsetWidth, height = popup.offsetHeight;
      // Prefer the side with space, keeping the hovered country uncovered.
      let left = x + 18;
      if (left + width > bounds.width - 8) left = x - width - 18;
      const viewportBottom = window.innerHeight - bounds.top - height - 12;
      popup.style.left = `${Math.max(8, Math.min(left, bounds.width - width - 8))}px`;
      popup.style.top = `${Math.max(8, Math.min(y - 24, bounds.height - height - 8, viewportBottom))}px`;
    }

    function show(id, pin = false, point = null) {
      cancel();
      if (pinned && !pin) return;
      const destination = destinations.get(id);
      if (!destination) return;
      current = id;
      pinned = pin;
      anchor = point;
      root.querySelector('[data-map-title]').textContent = destination.dataset.name;
      root.querySelector('[data-map-content]').replaceChildren(destination.content.cloneNode(true));
      popup.hidden = false;
      countries.forEach(el => {
        const active = el.dataset.country === id;
        el.classList.toggle('is-selected', active);
        el.setAttribute('aria-expanded', String(active));
      });
      position();
    }

    const delayClose = () => {
      cancel();
      if (!pinned) timer = setTimeout(() => {
        if (!popup.contains(document.activeElement)) close();
      }, 300);
    };

    function revealOnPhone() {
      if (!window.matchMedia('(max-width: 600px), (max-width: 900px) and (max-height: 500px)').matches) return;
      const bounds = popup.getBoundingClientRect();
      if (bounds.bottom > window.innerHeight - 12 || bounds.top < 120) {
        popup.scrollIntoView({block: 'nearest', behavior: 'auto'});
      }
    }

    countries.forEach(el => {
      el.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'mouse' || pinned) return;
        cancel();
        if (destinations.get(el.dataset.country)?.content.querySelector('a')) {
          const point = {x: event.clientX, y: event.clientY};
          timer = setTimeout(() => show(el.dataset.country, false, point), 140);
        } else delayClose();
      });
      el.addEventListener('pointerleave', delayClose);
      el.addEventListener('focus', () => {
        if (!el.dataset.skipFocus) show(el.dataset.country, true);
      });
      el.addEventListener('click', event => {
        show(el.dataset.country, true, event.detail ? {x: event.clientX, y: event.clientY} : null);
        revealOnPhone();
      });
      el.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          show(el.dataset.country, true);
          popup.querySelector('a,button')?.focus();
          revealOnPhone();
        }
      });
    });
    popup.addEventListener('pointerenter', cancel);
    popup.addEventListener('pointerleave', delayClose);
    popup.addEventListener('focusin', () => { cancel(); pinned = true; });
    root.querySelector('[data-map-close]').addEventListener('click', () => close(true));
    root.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !popup.hidden) { event.preventDefault(); close(true); }
    });
    document.addEventListener('pointerdown', event => {
      if (!root.contains(event.target) || event.target === root.querySelector('svg')) close();
    });
    window.addEventListener('resize', () => { if (!popup.hidden) position(); });
  });
})();
