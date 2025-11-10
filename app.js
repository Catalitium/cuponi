const PARTNERS = [
  {
    id: 'farmared-ccs',
    nombre: 'FarmaRed Las Mercedes',
    categoria: 'Salud/Farmacia',
    descuento: 12,
    condiciones: 'No aplica a medicamentos controlados.',
    telefono: '+582129999999',
    whatsapp: 'https://wa.me/582129999999?text=Hola%2C%20vengo%20de%20Cuponi',
    direccion: 'Av. Ppal. Las Mercedes, Caracas',
    lat: 10.4806,
    lon: -66.8529
  },
  {
    id: 'areperia-sabor',
    nombre: 'Arepería Sabor Criollo',
    categoria: 'Comida',
    descuento: 15,
    condiciones: 'Válido en combos mediodía.',
    telefono: '+582127777777',
    whatsapp: 'https://wa.me/582127777777?text=Hola%2C%20vengo%20de%20Cuponi',
    direccion: 'Av. Urdaneta, Caracas',
    lat: 10.505,
    lon: -66.9146
  },
  {
    id: 'gim-energia',
    nombre: 'Gimnasio Energía',
    categoria: 'Gimnasio',
    descuento: 20,
    condiciones: 'Aplica en plan mensual.',
    telefono: '+582127111111',
    whatsapp: 'https://wa.me/582127111111?text=Hola%2C%20vengo%20de%20Cuponi',
    direccion: 'La Castellana, Caracas',
    lat: 10.4948,
    lon: -66.8485
  },
  {
    id: 'clinica-sonrisas',
    nombre: 'Clínica Sonrisas',
    categoria: 'Odontología',
    descuento: 10,
    condiciones: 'Consulta inicial incluida.',
    telefono: '+582129111111',
    whatsapp: 'https://wa.me/582129111111?text=Hola%2C%20vengo%20de%20Cuponi',
    direccion: 'Chacao, Caracas',
    lat: 10.496,
    lon: -66.853
  },
  {
    id: 'market-ahorro',
    nombre: 'Market Ahorro',
    categoria: 'Supermercado',
    descuento: 8,
    condiciones: 'No aplica a licores.',
    telefono: '+582127222222',
    whatsapp: 'https://wa.me/582127222222?text=Hola%2C%20vengo%20de%20Cuponi',
    direccion: 'Santa Fe, Caracas',
    lat: 10.4309,
    lon: -66.8526
  },
  {
    id: 'trans-express',
    nombre: 'Transporte Express',
    categoria: 'Transporte',
    descuento: 12,
    condiciones: 'Rutas urbanas diarias.',
    telefono: '+582127333333',
    whatsapp: 'https://wa.me/582127333333?text=Hola%2C%20vengo%20de%20Cuponi',
    direccion: 'Bello Monte, Caracas',
    lat: 10.4801,
    lon: -66.8663
  }
];

const STORAGE_KEYS = {
  moneda: 'moneda',
  tasa: 'tasa',
  nombre: 'nombre',
  favoritos: 'favoritos',
  ahorro: 'ahorroMes',
  layout: 'layoutMode'
};

const STATE = {
  moneda: localStorage.getItem(STORAGE_KEYS.moneda) || 'VES',
  tasa: parseFloat(localStorage.getItem(STORAGE_KEYS.tasa) || '40') || 40,
  nombre: localStorage.getItem(STORAGE_KEYS.nombre) || '',
  favoritos: JSON.parse(localStorage.getItem(STORAGE_KEYS.favoritos) || '[]'),
  ahorroMes: parseFloat(localStorage.getItem(STORAGE_KEYS.ahorro) || '0') || 0,
  compactView: (localStorage.getItem(STORAGE_KEYS.layout) || 'comfortable') === 'compact'
};

const ui = {
  tabs: document.querySelector('.tabs'),
  tabPanels: document.querySelectorAll('[role="tabpanel"]'),
  search: document.getElementById('search'),
  category: document.getElementById('category'),
  benefitsList: document.getElementById('benefits-list'),
  nearbyList: document.getElementById('nearby-list'),
  geoStatus: document.getElementById('geo-status'),
  moneda: document.getElementById('moneda'),
  tasa: document.getElementById('tasa'),
  order: document.getElementById('order'),
  calcOut: document.getElementById('calc-out'),
  addEntry: document.getElementById('add-entry'),
  nombre: document.getElementById('nombre'),
  saveNombre: document.getElementById('save-nombre'),
  ahorroMes: document.getElementById('ahorro-mes'),
  sumarAhorro: document.getElementById('sumar-ahorro'),
  resetAhorro: document.getElementById('reset-ahorro'),
  prefMoneda: document.getElementById('pref-moneda'),
  prefTasa: document.getElementById('pref-tasa'),
  savePref: document.getElementById('save-pref'),
  clearFilters: document.getElementById('clear-filters'),
  toast: document.getElementById('toast'),
  modalCodigo: document.getElementById('modal-codigo'),
  codigoOut: document.getElementById('codigo-out'),
  entriesContainer: document.getElementById('benefit-entries'),
  heroToggle: document.getElementById('hero-toggle'),
  heroForms: document.querySelectorAll('.hero-form'),
  quickFilters: document.getElementById('quick-filters'),
  resultsCount: document.getElementById('results-count'),
  viewToggle: document.getElementById('toggle-compact')
};

const dialogs = Array.from(document.querySelectorAll('dialog'));
let lastFocusElement = null;
let calcEntries = [];
let geoRequested = false;
let showOnlyFavorites = false;

const FRECUENCIAS = {
  mensual: { label: 'Mensual', factor: 1 },
  quincenal: { label: 'Quincenal', factor: 2 }
};

init();

function init() {
  renderCategorias();
  renderBeneficios();
  bindEvents();
  hydrateProfile();
  initCalc();
  applyPreferences();
  applyLayoutMode();
  handleThanksHash();
}

function bindEvents() {
  ui.tabs.addEventListener('click', onTabClick);
  ui.search.addEventListener('input', renderBeneficios);
  ui.category.addEventListener('change', renderBeneficios);
  ui.order?.addEventListener('change', renderBeneficios);
  ui.clearFilters?.addEventListener('click', clearFiltros);
  ui.benefitsList.addEventListener('click', handleCardActions);
  ui.nearbyList.addEventListener('click', handleCardActions);
  ui.moneda.addEventListener('change', onMonedaChange);
  ui.tasa.addEventListener('change', onTasaChange);
  ui.addEntry.addEventListener('click', () => addCalcEntry());
  ui.saveNombre.addEventListener('click', saveNombre);
  ui.sumarAhorro.addEventListener('click', sumarAhorro);
  ui.resetAhorro.addEventListener('click', resetAhorro);
  ui.savePref.addEventListener('click', savePreferences);
  ui.codigoOut.addEventListener('click', copyCodigo);
  ui.viewToggle?.addEventListener('click', toggleCompactView);
  document.addEventListener('click', handleModalTriggers);
  dialogs.forEach(dialog => {
    dialog.addEventListener('close', () => lastFocusElement?.focus());
    dialog.addEventListener('keydown', trapFocus);
  });
  window.addEventListener('hashchange', handleThanksHash);
  ui.heroToggle?.addEventListener('click', handleHeroToggle);
  ui.quickFilters?.addEventListener('click', handleQuickFilters);
  document.addEventListener('click', handleGoTab);
}

function renderCategorias() {
  const categorias = ['Todas', ...new Set(PARTNERS.map(p => p.categoria))];
  ui.category.innerHTML = categorias
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join('');
  ui.category.value = 'Todas';
  if (ui.order) {
    ui.order.value = ui.order.value || 'recomendado';
  }
}

function renderBeneficios() {
  const term = ui.search.value.trim().toLowerCase();
  const categoria = ui.category.value || 'Todas';
  let dataset = PARTNERS;
  if (showOnlyFavorites) {
    dataset = dataset.filter(p => isFavorito(p.id));
  }
  const list = dataset.filter(p => {
    const matchesText = p.nombre.toLowerCase().includes(term) || p.categoria.toLowerCase().includes(term);
    const matchesCat = categoria === 'Todas' || categoria === undefined || p.categoria === categoria;
    return matchesText && matchesCat;
  });
  const sorted = sortPartners(list);
  paintPartners(sorted, ui.benefitsList);
  updateResultsCount(sorted.length);
  syncQuickFilters();
}

function paintPartners(data, target) {
  target.innerHTML = '';
  if (!data.length) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'Sin resultados por ahora.';
    target.appendChild(empty);
    return;
  }

  data.forEach(partner => {
    const li = document.createElement('li');
    li.className = 'card';
    li.dataset.id = partner.id;
    li.innerHTML = `
      <div class="card-header">
        <div>
          <h3>${partner.nombre}</h3>
          <span class="badge">${partner.categoria}</span>
        </div>
        <span class="percent">${partner.descuento}%</span>
      </div>
      <p class="chip">${partner.condiciones}</p>
      <p class="muted">${partner.direccion}</p>
      <div class="card-actions">
        <button class="primary btn-usar" data-action="usar" data-id="${partner.id}">Usar</button>
        <button class="outline btn-wa" data-action="wa" data-url="${partner.whatsapp}">WhatsApp</button>
        <button class="outline btn-map" data-action="map" data-lat="${partner.lat}" data-lon="${partner.lon}">Mapa</button>
        <button class="ghost btn-fav" data-action="fav" aria-pressed="${isFavorito(partner.id)}">${isFavorito(partner.id) ? 'Quitar' : 'Favorito'}</button>
      </div>
    `;
    target.appendChild(li);
  });
}

function handleCardActions(e) {
  const button = e.target.closest('button');
  if (!button) return;
  const action = button.dataset.action;
  const card = button.closest('.card');
  if (!action || !card) return;
  const id = card.dataset.id;
  const partner = PARTNERS.find(p => p.id === id);
  if (!partner) return;

  switch (action) {
    case 'usar':
      openCodigo(partner.id);
      break;
    case 'wa':
      window.open(button.dataset.url, '_blank');
      break;
    case 'map':
      const lat = button.dataset.lat;
      const lon = button.dataset.lon;
      const url = `https://www.google.com/maps?q=${lat},${lon}`;
      window.open(url, '_blank');
      break;
    case 'fav':
      toggleFavorito(partner.id, button);
      break;
  }
}

function isFavorito(id) {
  return STATE.favoritos.includes(id);
}

function toggleFavorito(id, button) {
  if (isFavorito(id)) {
    STATE.favoritos = STATE.favoritos.filter(f => f !== id);
    showToast('Favorito eliminado');
  } else {
    STATE.favoritos.push(id);
    showToast('Guardado en favoritos');
  }
  persist('favoritos');
  button.setAttribute('aria-pressed', isFavorito(id));
  button.textContent = isFavorito(id) ? 'Quitar' : 'Favorito';
}

function onTabClick(e) {
  const btn = e.target.closest('button[data-tab]');
  if (!btn) return;
  const tab = btn.dataset.tab;
  document.querySelectorAll('.tabs button').forEach(b => {
    const active = b.dataset.tab === tab;
    b.setAttribute('aria-selected', active);
  });
  ui.tabPanels.forEach(panel => {
    panel.hidden = panel.id !== `tab-${tab}`;
  });
  if (tab === 'cerca' && !geoRequested) {
    geoOrdenar();
  }
}

async function copyCodigo() {
  const code = ui.codigoOut.textContent;
  if (!code) return;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(code);
    }
    showToast('Código copiado');
  } catch (err) {
    console.error('Clipboard no disponible', err);
  }
}

function openCodigo(partnerId) {
  const code = genCodigo(partnerId);
  ui.codigoOut.textContent = code;
  openDialog(ui.modalCodigo);
}

function genCodigo(id) {
  const key = `${id}${new Date().toISOString().slice(0, 13).replace(/[-:T]/g, '')}`;
  return (hash(key) % 1000000).toString().padStart(6, '0');
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function geoOrdenar() {
  if (!navigator.geolocation) {
    ui.geoStatus.textContent = 'Tu dispositivo no tiene geolocalización disponible.';
    return;
  }
  geoRequested = true;
  ui.geoStatus.textContent = 'Buscando tu ubicación…';
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      const ordenados = [...PARTNERS]
        .map(p => ({ ...p, distancia: haversine(latitude, longitude, p.lat, p.lon) }))
        .sort((a, b) => a.distancia - b.distancia);
      paintPartners(ordenados, ui.nearbyList);
      annotateDistances(ordenados);
      ui.geoStatus.textContent = 'Aliados ordenados por distancia estimada.';
    },
    () => {
      ui.geoStatus.textContent = 'No pudimos acceder a tu ubicación.';
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

function annotateDistances(lista) {
  const items = ui.nearbyList.querySelectorAll('.card');
  items.forEach((item, index) => {
    const partner = lista[index];
    if (!partner) return;
    const badge = item.querySelector('.badge');
    badge.textContent = `${partner.categoria} · ${partner.distancia.toFixed(1)} km`;
  });
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(d) {
  return d * (Math.PI / 180);
}

function onMonedaChange() {
  STATE.moneda = ui.moneda.value;
  persist('moneda');
  applyPreferences();
  updateCalcResult();
}

function onTasaChange() {
  const value = parseFloat(ui.tasa.value);
  if (!isNaN(value)) {
    STATE.tasa = value;
    persist('tasa');
    applyPreferences();
    updateCalcResult();
  }
}

function persist(key) {
  switch (key) {
    case 'moneda':
      localStorage.setItem(STORAGE_KEYS.moneda, STATE.moneda);
      break;
    case 'tasa':
      localStorage.setItem(STORAGE_KEYS.tasa, STATE.tasa);
      break;
    case 'nombre':
      localStorage.setItem(STORAGE_KEYS.nombre, STATE.nombre);
      break;
    case 'favoritos':
      localStorage.setItem(STORAGE_KEYS.favoritos, JSON.stringify(STATE.favoritos));
      break;
    case 'ahorro':
      localStorage.setItem(STORAGE_KEYS.ahorro, STATE.ahorroMes);
      break;
    case 'layout':
      localStorage.setItem(STORAGE_KEYS.layout, STATE.compactView ? 'compact' : 'comfortable');
      break;
  }
}

function hydrateProfile() {
  ui.nombre.value = STATE.nombre;
  ui.prefMoneda.value = STATE.moneda;
  ui.prefTasa.value = STATE.tasa;
  ui.moneda.value = STATE.moneda;
  ui.tasa.value = STATE.tasa;
  updateAhorroUI();
}

function saveNombre() {
  STATE.nombre = ui.nombre.value.trim();
  persist('nombre');
  showToast('Nombre guardado');
}

function sumarAhorro() {
  const monto = parseFloat(prompt('¿Cuánto ahorraste? Ingresa el monto en VES.')); // local storage en VES
  if (isNaN(monto) || monto <= 0) return;
  STATE.ahorroMes += monto;
  persist('ahorro');
  updateAhorroUI();
  showToast('Ahorro sumado');
}

function resetAhorro() {
  STATE.ahorroMes = 0;
  persist('ahorro');
  updateAhorroUI();
  showToast('Ahorro reiniciado');
}

function updateAhorroUI() {
  const usdValue = STATE.tasa ? STATE.ahorroMes / STATE.tasa : 0;
  ui.ahorroMes.textContent = `${formatCurrency(STATE.ahorroMes, 'VES')} (${formatCurrency(usdValue, 'USD')})`;
}

function savePreferences() {
  STATE.moneda = ui.prefMoneda.value;
  STATE.tasa = parseFloat(ui.prefTasa.value) || STATE.tasa;
  persist('moneda');
  persist('tasa');
  hydrateProfile();
  updateCalcResult();
  showToast('Preferencias guardadas');
}

function applyPreferences() {
  ui.moneda.value = STATE.moneda;
  ui.tasa.value = STATE.tasa;
  ui.prefMoneda.value = STATE.moneda;
  ui.prefTasa.value = STATE.tasa;
}

function initCalc() {
  addCalcEntry({ monto: 40, descuento: 10, frecuencia: 'mensual' });
  addCalcEntry({ monto: 25, descuento: 15, frecuencia: 'quincenal' });
  updateCalcResult();
}

function addCalcEntry(initial = {}) {
  const entry = {
    id: uid(),
    monto: initial.monto || 0,
    descuento: initial.descuento || 10,
    frecuencia: initial.frecuencia || 'mensual'
  };
  calcEntries.push(entry);
  renderEntry(entry);
  updateCalcResult();
}

function renderEntry(entry) {
  const wrapper = document.createElement('div');
  wrapper.className = 'entry';
  wrapper.dataset.id = entry.id;
  wrapper.innerHTML = `
    <div class="row">
      <label>Monto sin beneficio
        <input type="number" inputmode="decimal" step="0.01" value="${entry.monto}" data-field="monto">
      </label>
    </div>
    <div class="row-inline">
      <label>Descuento %
        <input type="number" inputmode="decimal" step="1" value="${entry.descuento}" data-field="descuento">
      </label>
      <label>Frecuencia
        <select data-field="frecuencia">
          ${Object.entries(FRECUENCIAS)
            .map(([key, cfg]) => `<option value="${key}" ${entry.frecuencia === key ? 'selected' : ''}>${cfg.label}</option>`)
            .join('')}
        </select>
      </label>
    </div>
    <button type="button" class="ghost" data-remove>Eliminar</button>
  `;
  wrapper.addEventListener('input', onEntryChange);
  wrapper.querySelector('[data-remove]').addEventListener('click', () => removeEntry(entry.id, wrapper));
  ui.entriesContainer.appendChild(wrapper);
}

function onEntryChange(e) {
  const field = e.target.dataset.field;
  if (!field) return;
  const entryEl = e.currentTarget;
  const id = entryEl.dataset.id;
  const entry = calcEntries.find(item => item.id === id);
  if (!entry) return;
  if (field === 'frecuencia') {
    entry.frecuencia = e.target.value;
  } else {
    entry[field] = parseFloat(e.target.value) || 0;
  }
  updateCalcResult();
}

function removeEntry(id, node) {
  calcEntries = calcEntries.filter(entry => entry.id !== id);
  node.remove();
  if (!calcEntries.length) addCalcEntry();
  updateCalcResult();
}

function updateCalcResult() {
  const total = calcEntries.reduce((acc, entry) => {
    const factor = FRECUENCIAS[entry.frecuencia]?.factor || 1;
    return acc + entry.monto * (entry.descuento / 100) * factor;
  }, 0);
  const currency = STATE.moneda;
  if (currency === 'VES') {
    ui.calcOut.textContent = formatCurrency(total, 'VES');
  } else {
    const ves = total * STATE.tasa;
    ui.calcOut.textContent = `${formatCurrency(total, 'USD')} (≈ ${formatCurrency(ves, 'VES')})`;
  }
}

function formatCurrency(amount, currency) {
  const formatter = new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: currency === 'USD' ? 'USD' : 'VES',
    minimumFractionDigits: 2
  });
  return formatter.format(amount || 0);
}

function sortPartners(list) {
  const order = ui.order?.value || 'recomendado';
  const copy = [...list];
  if (order === 'descuento') {
    return copy.sort((a, b) => b.descuento - a.descuento);
  }
  if (order === 'nombre') {
    return copy.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
  return copy.sort((a, b) => {
    const favA = Number(isFavorito(b.id)) - Number(isFavorito(a.id));
    if (favA !== 0) return favA;
    return b.descuento - a.descuento;
  });
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    ui.toast.hidden = true;
  }, 2200);
}

function handleModalTriggers(e) {
  const openTarget = e.target.closest('[data-open]');
  if (openTarget) {
    const id = openTarget.dataset.open;
    const dialog = document.getElementById(id);
    if (dialog) {
      openDialog(dialog);
    }
  }
  const closeBtn = e.target.closest('[data-close]');
  if (closeBtn) {
    const dialog = closeBtn.closest('dialog');
    dialog?.close();
  }
}

function openDialog(dialog) {
  lastFocusElement = document.activeElement;
  if (!dialog.open) {
    dialog.showModal();
  }
  const firstFocusable = getFocusable(dialog)[0];
  firstFocusable?.focus();
}

function getFocusable(container) {
  return Array.from(container.querySelectorAll('button, [href], input, select, textarea'))
    .filter(el => !el.hasAttribute('disabled'));
}

function trapFocus(event) {
  if (event.key !== 'Tab') return;
  const dialog = event.currentTarget;
  const focusable = getFocusable(dialog);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function handleThanksHash() {
  if (location.hash === '#gracias-empleado') {
    showToast('¡Gracias! Te contactaremos pronto.');
  } else if (location.hash === '#gracias-empresa') {
    showToast('¡Gracias! Revisaremos tu registro.');
  }
}

function handleHeroToggle(e) {
  if (!ui.heroToggle) return;
  const button = e.target.closest('button[data-intent]');
  if (!button) return;
  const intent = button.dataset.intent;
  ui.heroToggle.querySelectorAll('button').forEach(btn => {
    btn.setAttribute('aria-selected', btn === button);
  });
  ui.heroForms.forEach(form => {
    const isActive = form.dataset.intent === intent;
    form.hidden = !isActive;
  });
}

function handleQuickFilters(e) {
  if (!ui.quickFilters) return;
  const button = e.target.closest('button[data-chip]');
  if (!button) return;
  const value = button.dataset.chip;
  if (value === 'favoritos') {
    showOnlyFavorites = !showOnlyFavorites;
  } else {
    showOnlyFavorites = false;
    ui.category.value = value || 'Todas';
  }
  renderBeneficios();
}

function updateResultsCount(total) {
  if (!ui.resultsCount) return;
  const label = total === 1 ? '1 aliado' : `${total} aliados`;
  ui.resultsCount.textContent = label;
}

function syncQuickFilters() {
  if (!ui.quickFilters) return;
  const current = ui.category.value || 'Todas';
  ui.quickFilters.querySelectorAll('button[data-chip]').forEach(button => {
    if (button.dataset.chip === 'favoritos') {
      button.classList.toggle('active', showOnlyFavorites);
      button.setAttribute('aria-pressed', String(showOnlyFavorites));
    } else {
      const active = !showOnlyFavorites && button.dataset.chip === current;
      button.classList.toggle('active', active);
    }
  });
}

function clearFiltros() {
  ui.search.value = '';
  ui.category.value = 'Todas';
  if (ui.order) ui.order.value = 'recomendado';
  showOnlyFavorites = false;
  renderBeneficios();
}

function toggleCompactView() {
  STATE.compactView = !STATE.compactView;
  applyLayoutMode();
  persist('layout');
}

function applyLayoutMode() {
  document.body.classList.toggle('compact-cards', STATE.compactView);
  updateViewToggleLabel();
}

function updateViewToggleLabel() {
  if (!ui.viewToggle) return;
  ui.viewToggle.textContent = STATE.compactView ? 'Vista detallada' : 'Vista compacta';
}

function handleGoTab(e) {
  const trigger = e.target.closest('[data-go-tab]');
  if (!trigger) return;
  const targetTab = trigger.dataset.goTab;
  const tabButton = document.querySelector(`.tabs button[data-tab="${targetTab}"]`);
  tabButton?.click();
}

function uid() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
