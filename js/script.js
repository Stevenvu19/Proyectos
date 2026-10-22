// Conversión automática y extracción de categorías únicas en array
const CATEGORIAS_CARTA = [
  'Todos',
  ...[...new Set(DB_CARTA.flatMap(plato => plato.cat))].sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' })
  )
];

// Estructura de almacenamiento
let AppData = {
  insumos: [],
  pedidos: [],
  ventas: [],
  cart: []
};

let catAct = 'Todos';
let pagAct = 1;
const itmsPorPag = 3;
let chTendencia = null;

// Control de paginación para Insumos, Pedidos y Ventas
let pagIngresos = 1;
let pagPedidos = 1;
let pagVentas = 1;
let pagRepOtros = 1; // Paginación para otros platos vendidos
const registrosPorPagina = 5; 
const registrosPorPaginaOtrosPlatos = 7; // Mínimo 7 registros por página

/* ========== PERSISTENCIA ========== */
function fnCarData() {
  const g = localStorage.getItem(KEY_DAT);
  if (g) {
    try {
      AppData = JSON.parse(g);
    } catch (e) {
      console.error('Error parse data', e);
    }
  }
}

function fnGuaData() {
  localStorage.setItem(KEY_DAT, JSON.stringify(AppData));
  fnActuEspacioSidebar(); // Actualiza el sidebar al guardar cualquier cambio
}

/* ========== UTILIDADES FECHA DE SISTEMA (dd/mm/yyyy hh:mm am/pm) ========== */
function fnFmtFecPeru(d = new Date()) {
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const anio = d.getFullYear();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  h = h ? h : 12;
  const hStr = String(h).padStart(2, '0');
  return `${dia}/${mes}/${anio} ${hStr}:${m} ${ampm}`;
}

function fnLimpiarStr(s) {
  return (s || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/* ========== RELOJ EN TIEMPO REAL ========== */
function fnIniReloj() {
  const el = document.getElementById('clk-txt');
  setInterval(() => {
    el.innerText = fnFmtFecPeru();
  }, 1000);
  el.innerText = fnFmtFecPeru();
}

/* ========== LOGIN & SESIÓN ========== */
function fnLog(e) {
  e.preventDefault();
  const u = document.getElementById('log-usr').value.trim();
  const p = document.getElementById('log-pwd').value.trim();
  const err = document.getElementById('log-msg-err');

  if (u === 'admin' && p === 'admin') {
    err.style.display = 'none';
    localStorage.setItem('AIDAMAR_SESION_ACTIVA', 'true');
    const box = document.getElementById('sec-login');
    box.classList.add('log-hide');
  } else {
    err.style.display = 'block';
  }
}

function fnConfLogout() {
  fnClMod('mod-logout');
  localStorage.removeItem('AIDAMAR_SESION_ACTIVA');
  
  fnNav('v-ingresos', document.querySelector('[data-v=v-ingresos]'));
  localStorage.setItem('AIDAMAR_VISTA_ACTIVA', 'v-ingresos');

  const box = document.getElementById('sec-login');
  box.classList.remove('log-hide');
  document.getElementById('log-pwd').value = '';
}

/* ========== VER / OCULTAR CONTRASEÑA LOGIN ========== */
function fnTogglePassword() {
  const pwdInput = document.getElementById('log-pwd');
  const eyeIcon = document.getElementById('eye-icon');

  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    eyeIcon.classList.remove('fa-eye');
    eyeIcon.classList.add('fa-eye-slash');
  } else {
    pwdInput.type = 'password';
    eyeIcon.classList.remove('fa-eye-slash');
    eyeIcon.classList.add('fa-eye');
  }
}

/* ========== NAVEGACIÓN Y HAMBURGUESA ========== */
function fnNav(vId, btn) {
  document.querySelectorAll('.vista-panel').forEach(v => v.classList.remove('v-act'));
  const tgt = document.getElementById(vId);
  if (tgt) tgt.classList.add('v-act');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('nav-act'));
  if (btn) btn.classList.add('nav-act');

  document.getElementById('app-sbar').classList.remove('sbar-open');

  if (vId === 'v-reportes') {
    pagRepOtros = 1;
    fnActReportes();
  }
}

function fnTogSbar() {
  document.getElementById('app-sbar').classList.toggle('sbar-open');
}

function fnTogDd() {
  document.getElementById('perfil-dd-menu').classList.toggle('dd-show');
}

window.onclick = function(e) {
  if (!e.target.closest('.perfil-dd')) {
    const dd = document.getElementById('perfil-dd-menu');
    if (dd) dd.classList.remove('dd-show');
  }
};

/* ========== MODALES ========== */
function fnOpMod(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('mod-show');
}

function fnClMod(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('mod-show');
}

/* ========== 1. VISTA INGRESOS ========== */
function fnActualizarFiltroCategoriasIngresos() {
  const selectCat = document.getElementById('flt-ins-cat');
  if (!selectCat) return;

  const valorActual = selectCat.value;
  const categoriasUnicas = [...new Set(AppData.insumos.map(i => i.cat))];

  selectCat.innerHTML = `<option value="TODOS">Todas las categorías</option>`;
  categoriasUnicas.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.innerText = cat;
    selectCat.appendChild(option);
  });

  if ([...selectCat.options].some(opt => opt.value === valorActual)) {
    selectCat.value = valorActual;
  } else {
    selectCat.value = 'TODOS';
  }
}

function fnFltInsumos() {
  fnRenInsumos();
}

function fnRenInsumos() {
  fnActualizarFiltroCategoriasIngresos();

  const q = fnLimpiarStr(document.getElementById('srch-ins').value);
  const catFiltro = document.getElementById('flt-ins-cat').value;
  const tb = document.getElementById('tb-ins');
  tb.innerHTML = '';
  
  let sumaGastos = 0;

  let insumosFiltrados = AppData.insumos.filter(ins => {
    const matchCat = (catFiltro === 'TODOS' || ins.cat === catFiltro);
    const textoBusqueda = fnLimpiarStr(`${ins.desc} ${ins.prov}`);
    const matchTxt = textoBusqueda.includes(q);
    return matchCat && matchTxt;
  });

  if (!insumosFiltrados.length) {
    tb.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:24px; color:var(--txt-muted);">No se encontraron insumos registrados.</td>
      </tr>`;
    document.getElementById('lbl-tot-insumos').innerText = 'S/ 0.00';
    fnEliminarContenedorPaginacion('v-ingresos');
    return;
  }

  insumosFiltrados.forEach(ins => {
    sumaGastos += parseFloat(ins.ptot) || 0;
  });
  document.getElementById('lbl-tot-insumos').innerText = `S/ ${sumaGastos.toFixed(2)}`;

  const totalPag = Math.ceil(insumosFiltrados.length / registrosPorPagina) || 1;
  if (pagIngresos > totalPag) pagIngresos = totalPag;
  const start = (pagIngresos - 1) * registrosPorPagina;
  const pageItems = insumosFiltrados.slice(start, start + registrosPorPagina);

  pageItems.forEach((ins) => {
    const tr = document.createElement('tr');
    tr.className = 'tr-fade';
    tr.innerHTML = `
      <td><strong>#${ins.id}</strong></td>
      <td style="text-align:left;"><strong>${ins.desc}</strong></td>
      <td><span style="background:#e0f2fe; color:var(--c-teal); padding:3px 8px; border-radius:4px; font-size:10px; font-weight:600;">${ins.cat}</span></td>
      <td>S/ ${parseFloat(ins.punit).toFixed(2)}</td>
      <td>${ins.cant}</td>
      <td><span style="background:#f1f5f9; padding:3px 8px; border-radius:4px; font-weight:600;">${ins.med || 'und'}</span></td>
      <td style="font-weight:700; color:var(--c-teal);">S/ ${parseFloat(ins.ptot).toFixed(2)}</td>
      <td>${ins.prov}</td>
      <td style="font-size:10px; color:var(--txt-muted);">${ins.fecha}</td>
      <td style="text-align:center;">
        <div class="act-btns" style="justify-content:center;">
          <button class="act-btn act-edt" onclick="fnEdInsumo(${ins.id})" title="Actualizar">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="act-btn act-del" onclick="fnConfDelIns(${ins.id})" title="Eliminar">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tb.appendChild(tr);
  });

  fnRenderPaginacionTabla('v-ingresos', pagIngresos, totalPag, (nuevaPag) => {
    pagIngresos = nuevaPag;
    fnRenInsumos();
  });
}

function fnOpModInsumo() {
  document.getElementById('t-mod-ins').innerHTML = '<i class="fa-solid fa-box"></i> Registrar Insumo';
  document.getElementById('frm-ins').reset();
  document.getElementById('ins-id').value = '';
  document.getElementById('ins-ptot').value = '0.00';
  fnOpMod('mod-insumo');
}

function fnCalcTotIns() {
  const pu = parseFloat(document.getElementById('ins-punit').value) || 0;
  const ca = parseFloat(document.getElementById('ins-cant').value) || 0;
  document.getElementById('ins-ptot').value = (pu * ca).toFixed(2);
}

function fnSavInsumo(e) {
  e.preventDefault();
  const id = document.getElementById('ins-id').value;
  const desc = document.getElementById('ins-desc').value.trim();
  const cat = document.getElementById('ins-cat').value;
  const punit = parseFloat(document.getElementById('ins-punit').value) || 0;
  const cant = parseFloat(document.getElementById('ins-cant').value) || 0;
  const med = document.getElementById('ins-med').value;
  const ptot = (punit * cant);
  const prov = document.getElementById('ins-prov').value.trim();
  const fecha = fnFmtFecPeru();

  if (id) {
    const idx = AppData.insumos.findIndex(x => x.id == id);
    if (idx !== -1) {
      AppData.insumos[idx] = { ...AppData.insumos[idx], desc, cat, punit, cant, med, ptot, prov };
    }
  } else {
    const nuevoId = AppData.insumos.length ? Math.max(...AppData.insumos.map(x => x.id)) + 1 : 101;
    AppData.insumos.unshift({ id: nuevoId, desc, cat, punit, cant, med, ptot, prov, fecha });
  }

  fnGuaData();
  fnRenInsumos();
  fnClMod('mod-insumo');
}

function fnEdInsumo(id) {
  const ins = AppData.insumos.find(x => x.id == id);
  if (!ins) return;
  document.getElementById('t-mod-ins').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Actualizar Insumo';
  document.getElementById('ins-id').value = ins.id;
  document.getElementById('ins-desc').value = ins.desc;
  document.getElementById('ins-cat').value = ins.cat;
  document.getElementById('ins-punit').value = ins.punit;
  document.getElementById('ins-cant').value = ins.cant;
  document.getElementById('ins-med').value = ins.med || 'und';
  document.getElementById('ins-ptot').value = parseFloat(ins.ptot).toFixed(2);
  document.getElementById('ins-prov').value = ins.prov;
  fnOpMod('mod-insumo');
}

function fnConfDelIns(id) {
  document.getElementById('txt-del-msg').innerText = `¿Está seguro de eliminar el ID de insumo #${id}?, esta acción no se puede deshacer.`;
  const btn = document.getElementById('btn-conf-del');
  btn.onclick = () => {
    AppData.insumos = AppData.insumos.filter(x => x.id != id);
    fnGuaData();
    fnRenInsumos();
    fnClMod('mod-del');
  };
  fnOpMod('mod-del');
}

/* ========== 2. VISTA CARTA ========== */
function fnSetCat(cat, btn) {
  catAct = cat;
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('cp-act'));
  if (btn) btn.classList.add('cp-act');
  pagAct = 1;
  fnRenCarta();
}

function fnFltCarta() {
  pagAct = 1;
  fnRenCarta();
}

function fnRenCarta() {
  const q = fnLimpiarStr(document.getElementById('srch-carta').value);
  const grid = document.getElementById('grid-platos');
  grid.innerHTML = '';

  let list = DB_CARTA.filter(p => {
    const platoCats = Array.isArray(p.cat) ? p.cat : [p.cat];
    const matchCat = (catAct === 'Todos' || platoCats.includes(catAct));
    const matchTxt = fnLimpiarStr(p.nom).includes(q) || fnLimpiarStr(p.desc).includes(q);
    return matchCat && matchTxt;
  });

  list.sort((a, b) => a.nom.localeCompare(b.nom, 'es', { sensitivity: 'base' }));

  const totalPag = Math.ceil(list.length / itmsPorPag) || 1;
  if (pagAct > totalPag) pagAct = totalPag;
  const start = (pagAct - 1) * itmsPorPag;
  const pageItems = list.slice(start, start + itmsPorPag);

  if (!pageItems.length) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; color:var(--txt-muted);">No se encontraron platos con esa descripción.</div>`;
  } else {
    pageItems.forEach(p => {
      const card = document.createElement('div');
      card.className = 'plato-card tr-fade';

      const platoCats = Array.isArray(p.cat) ? p.cat : [p.cat];
      let etiquetaMostrar = catAct !== 'Todos' && platoCats.includes(catAct) ? catAct : platoCats[0];

      card.innerHTML = `
        <div class="plato-img-box">
          <img src="${p.img}" alt="${p.nom}" loading="lazy">
          <span class="plato-tag">${etiquetaMostrar}</span>
        </div>

        <div class="plato-body">
          <h4 class="plato-title">${p.nom}</h4>
          <p class="plato-desc">${p.desc}</p>
        
          <div class="plato-ftr">
            <span class="plato-price">S/ ${p.pre.toFixed(2)}</span>

            <button class="btn-add-cart" onclick="fnAddCart(${p.id})">
              <i class="fa-solid fa-plus"></i>Agregar
            </button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  const pagBox = document.getElementById('pag-carta');
  pagBox.innerHTML = '';

  if (totalPag > 1) {
    const btnAnt = document.createElement('button');
    btnAnt.className = `pag-btn ${pagAct === 1 ? 'disabled' : ''}`;
    btnAnt.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    btnAnt.disabled = pagAct === 1;
    btnAnt.onclick = () => {
      if (pagAct > 1) {
        pagAct--;
        fnRenCarta();
      }
    };
    pagBox.appendChild(btnAnt);

    let pages = [];
    if (totalPag <= 7) {
      for (let i = 1; i <= totalPag; i++) pages.push(i);
    } else {
      if (pagAct <= 4) {
        pages = [1, 2, 3, 4, 5, '...', totalPag];
      } else if (pagAct >= totalPag - 3) {
        pages = [1, '...', totalPag - 4, totalPag - 3, totalPag - 2, totalPag - 1, totalPag];
      } else {
        pages = [1, '...', pagAct - 1, pagAct, pagAct + 1, '...', totalPag];
      }
    }

    pages.forEach(p => {
      if (p === '...') {
        const span = document.createElement('span');
        span.className = 'pag-ellipsis';
        span.innerText = '...';
        span.style.padding = '0 6px';
        span.style.display = 'flex';
        span.style.alignItems = 'center';
        span.style.justifyContent = 'center';
        span.style.color = 'var(--txt-muted)';
        pagBox.appendChild(span);
      } else {
        const b = document.createElement('button');
        b.className = `pag-btn ${p === pagAct ? 'pg-act' : ''}`;
        b.innerText = p;
        b.onclick = () => {
          pagAct = p;
          fnRenCarta();
        };
        pagBox.appendChild(b);
      }
    });

    const btnSig = document.createElement('button');
    btnSig.className = `pag-btn ${pagAct === totalPag ? 'disabled' : ''}`;
    btnSig.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    btnSig.disabled = pagAct === totalPag;
    btnSig.onclick = () => {
      if (pagAct < totalPag) {
        pagAct++;
        fnRenCarta();
      }
    };
    pagBox.appendChild(btnSig);
  }
}

function fnResetCarta() {
  const inputSrch = document.getElementById('srch-carta');
  if (inputSrch) inputSrch.value = '';
  
  const pillTodos = document.querySelector('.cat-pill');
  if (pillTodos) {
    fnSetCat('Todos', pillTodos);
  } else {
    catAct = 'Todos';
    pagAct = 1;
    fnRenCarta();
  }
}

/* ========== CARRITO Y PEDIDOS ========== */
function fnSeguirAgregando() {
  fnClMod('mod-carrito');
  fnNav('v-carta', document.querySelector('[data-v=v-carta]'));
}

function fnVerificarCarrito() {
  if (!AppData.cart || AppData.cart.length === 0) {
    fnOpMod('mod-alerta');
  } else {
    fnOpMod('mod-carrito');
  }
}

function fnAddCart(id) {
  const p = DB_CARTA.find(x => x.id === id);
  if (!p) return;
  const exist = AppData.cart.find(x => x.id === id);
  if (exist) {
    exist.cant += 1;
  } else {
    AppData.cart.push({ id: p.id, nom: p.nom, pre: p.pre, cant: 1 });
  }
  fnActCartBadge();
  fnRenCartModal();

  const btnFlt = document.getElementById('btn-flt-cart');
  btnFlt.style.transform = 'scale(1.03)';
  setTimeout(() => btnFlt.style.transform = 'scale(1)', 200);
}

function fnActCartBadge() {
  const tot = AppData.cart.reduce((a, b) => a + b.cant, 0);
  document.getElementById('cart-cnt').innerText = tot;
}

function fnRenCartModal() {
  const tb = document.getElementById('tb-cart-items');
  tb.innerHTML = '';
  let tot = 0;

  if (!AppData.cart.length) {
    tb.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:18px; color:var(--txt-muted);">El carrito está vacío</td></tr>`;
  } else {
    AppData.cart.forEach((it, idx) => {
      const sub = it.pre * it.cant;
      tot += sub;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: left;"><strong>${it.nom}</strong></td>
        <td>
          <div>
            <button style="border:none; background:#edf7fa; border-radius:4px; margin-right: 8px; padding:2px 8px; cursor:pointer;" onclick="fnModCantCart(${idx}, -1)">-</button>
            <span>${it.cant}</span>
            <button style="border:none; background:#edf7fa; border-radius:4px; margin-left: 8px; padding:2px 8px; cursor:pointer;" onclick="fnModCantCart(${idx}, 1)">+</button>
          </div>
        </td>
        <td style="font-weight:700;">S/ ${sub.toFixed(2)}</td>
        <td><button class="act-btn act-del" onclick="fnDelItmCart(${idx})"><i class="fa-solid fa-trash"></i></button></td>
      `;
      tb.appendChild(tr);
    });
  }

  document.getElementById('cart-total-txt').innerText = `S/ ${tot.toFixed(2)}`;
}

function fnModCantCart(idx, d) {
  if (AppData.cart[idx]) {
    AppData.cart[idx].cant += d;
    if (AppData.cart[idx].cant <= 0) {
      if (AppData.cart.length < 2) {
        document.getElementById('txt-del-msg').innerText = 'Debe tener al menos un registro en el carrito.';
        fnOpMod('mod-del');
        AppData.cart[idx].cant = 1;
        return;
      }
      AppData.cart.splice(idx, 1);
    }
  }
  fnActCartBadge();
  fnRenCartModal();
}

function fnDelItmCart(idx) {
  if (AppData.cart.length <= 1) {
    document.getElementById('txt-del-msg').innerText = 'Debe tener al menos un registro en el carrito.';
    const btnConf = document.getElementById('btn-conf-del');
    if (btnConf) btnConf.style.display = 'none';
    fnOpMod('mod-del');
    return;
  } else {
    const btnConf = document.getElementById('btn-conf-del');
    if (btnConf) btnConf.style.display = 'inline-flex';
  }

  AppData.cart.splice(idx, 1);
  fnActCartBadge();
  fnRenCartModal();
}

function fnRegPedido() {
  if (!AppData.cart.length) {
    alert('Por favor agregue al menos un plato a la comanda.');
    return;
  }

  const inputMesa = document.getElementById('cart-mesa');
  if (!inputMesa.value.trim()) {
    inputMesa.focus();
    inputMesa.setCustomValidity('Este campo es obligatorio.');
    inputMesa.reportValidity();
    return;
  } else {
    inputMesa.setCustomValidity('');
  }

  const mesa = inputMesa.value.trim();
  const obs = document.getElementById('cart-obs').value.trim() || '';
  const tot = AppData.cart.reduce((a, b) => a + (b.pre * b.cant), 0);
  const nuevoId = AppData.pedidos.length ? Math.max(...AppData.pedidos.map(x => x.id)) + 1 : 1;

  AppData.pedidos.unshift({
    id: nuevoId,
    mesa,
    obs,
    fecha: fnFmtFecPeru(),
    total: tot,
    items: [...AppData.cart]
  });

  AppData.cart = [];
  inputMesa.value = '';
  document.getElementById('cart-obs').value = '';
  fnActCartBadge();
  fnGuaData();
  fnRenPedidos();
  fnClMod('mod-carrito');
  fnNav('v-pedidos', document.querySelector('[data-v=v-pedidos]'));
}

/* ========== 3. VISTA PEDIDOS ========== */
function fnRenPedidos() {
  const tb = document.getElementById('tb-ped');
  tb.innerHTML = '';

  if (!AppData.pedidos.length) {
    tb.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--txt-muted);">No hay pedidos pendientes de cobro.</td></tr>`;
    fnEliminarContenedorPaginacion('v-pedidos');
    return;
  }

  const totalPag = Math.ceil(AppData.pedidos.length / registrosPorPagina) || 1;
  if (pagPedidos > totalPag) pagPedidos = totalPag;
  const start = (pagPedidos - 1) * registrosPorPagina;
  const pageItems = AppData.pedidos.slice(start, start + registrosPorPagina);

  pageItems.forEach(p => {
    const totalCant = p.items.reduce((acc, i) => acc + i.cant, 0);
    const descTexto = `${totalCant} ${totalCant === 1 ? 'Pedido' : 'Pedidos'}`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#PED-${p.id}</strong></td>
      <td><span style="font-weight:700; color:var(--c-teal);">${p.mesa}</span></td>
      <td style="font-size:10px;">${descTexto}</td>
      <td><span style="font-size:10px; color:var(--txt-muted);">${p.obs || '—'}</span></td>
      <td style="font-size:10px;">${p.fecha}</td>
      <td style="font-size:10px; font-weight:800; color:var(--c-orange);">S/ ${p.total.toFixed(2)}</td>
      <td style="text-align:center;">
        <div class="act-btns" style="justify-content:center;">
          <button class="act-btn act-pay" onclick="fnOpCobro(${p.id})" title="Cobrar Pedido">
            <i class="fa-solid fa-hand-holding-dollar"></i>
          </button>
          <button class="act-btn act-edt" onclick="fnEdPedido(${p.id})" title="Editar / Actualizar">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="act-btn act-del" onclick="fnConfDelPed(${p.id})" title="Eliminar">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tb.appendChild(tr);
  });

  fnRenderPaginacionTabla('v-pedidos', pagPedidos, totalPag, (nuevaPag) => {
    pagPedidos = nuevaPag;
    fnRenPedidos();
  });
}

function fnEdPedido(id) {
  const p = AppData.pedidos.find(x => x.id === id);
  if (!p) return;
  AppData.cart = JSON.parse(JSON.stringify(p.items));
  document.getElementById('cart-mesa').value = p.mesa;
  document.getElementById('cart-obs').value = p.obs;
  AppData.pedidos = AppData.pedidos.filter(x => x.id !== id);
  fnActCartBadge();
  fnRenCartModal();
  fnOpMod('mod-carrito');
}

function fnConfDelPed(id) {
  document.getElementById('txt-del-msg').innerText = `¿Realmente deseas eliminar el pedido #PED-${id}?, esta acción no se puede restablecer.`;
  const btn = document.getElementById('btn-conf-del');
  btn.onclick = () => {
    AppData.pedidos = AppData.pedidos.filter(x => x.id !== id);
    fnGuaData();
    fnRenPedidos();
    fnClMod('mod-del');
  };
  fnOpMod('mod-del');
}

/* ========== COBRAR PEDIDO ========== */
let pedEnCobro = null;
function fnOpCobro(id) {
  pedEnCobro = AppData.pedidos.find(x => x.id === id);
  if (!pedEnCobro) return;

  document.getElementById('cob-ped-id').value = pedEnCobro.id;
  document.getElementById('cob-total-txt').innerText = `S/ ${pedEnCobro.total.toFixed(2)}`;
  document.getElementById('cob-mesa-lbl').innerText = pedEnCobro.mesa;
  document.getElementById('cob-mpago').value = 'Efectivo';
  document.getElementById('cob-efec-in').value = pedEnCobro.total.toFixed(2);
  document.getElementById('cob-virt-in').value = '0.00';
  fnTogModoPago();
  fnCalcVuelto();
  fnOpMod('mod-cobro');
}

function fnTogModoPago() {
  const mp = document.getElementById('cob-mpago').value;
  const gE = document.getElementById('grp-pago-efec');
  const gV = document.getElementById('grp-pago-virt');
  const inputVirt = document.getElementById('cob-virt-in');
  const inputEfec = document.getElementById('cob-efec-in');

  if (mp === 'Efectivo') {
    gE.style.display = 'block';
    gV.style.display = 'none';
    inputVirt.readOnly = false;
    if (pedEnCobro) {
      inputEfec.value = pedEnCobro.total.toFixed(2);
      inputVirt.value = '0.00';
    }
  } else if (mp === 'Virtual') {
    gE.style.display = 'none';
    gV.style.display = 'block';
    inputVirt.readOnly = true;
    if (pedEnCobro) {
      inputVirt.value = pedEnCobro.total.toFixed(2);
      inputEfec.value = '0.00';
    }
  } else {
    gE.style.display = 'block';
    gV.style.display = 'block';
    inputVirt.readOnly = false;
    if (pedEnCobro) {
      const mitad = (pedEnCobro.total / 2).toFixed(2);
      inputEfec.value = mitad;
      inputVirt.value = (pedEnCobro.total - mitad).toFixed(2);
    }
  }
  fnCalcVuelto();
}

function fnCalcVuelto() {
  if (!pedEnCobro) return;
  const mp = document.getElementById('cob-mpago').value;
  const tot = pedEnCobro.total;
  const ef = parseFloat(document.getElementById('cob-efec-in').value) || 0;
  const vi = parseFloat(document.getElementById('cob-virt-in').value) || 0;

  let pagado = 0;
  if (mp === 'Efectivo') pagado = ef;
  else if (mp === 'Virtual') pagado = vi;
  else pagado = ef + vi;

  let restante = 0;
  let vuelto = 0;

  if (pagado < tot) {
    restante = tot - pagado;
    vuelto = 0;
  } else {
    restante = 0;
    vuelto = pagado - tot;
  }

  document.getElementById('cob-restante-txt').innerText = `S/ ${restante.toFixed(2)}`;
  document.getElementById('cob-vuelto-txt').innerText = `S/ ${vuelto.toFixed(2)}`;
}

function fnConfCobro() {
  if (!pedEnCobro) return;
  const mp = document.getElementById('cob-mpago').value;
  const ef = parseFloat(document.getElementById('cob-efec-in').value) || 0;
  const vi = parseFloat(document.getElementById('cob-virt-in').value) || 0;
  const tot = pedEnCobro.total;

  let pagado = (mp === 'Efectivo') ? ef : (mp === 'Virtual' ? vi : ef + vi);
  if (pagado < tot) {
    fnOpMod('mod-monto-insuficiente');
    return;
  }

  const vuelto = Math.max(0, pagado - tot);
  let detPago = '';
  if (mp === 'Efectivo') detPago = `Efectivo S/ ${ef.toFixed(2)}`;
  else if (mp === 'Virtual') detPago = `Virtual S/ ${vi.toFixed(2)}`;
  else detPago = `Efectivo: S/ ${ef.toFixed(2)} + Virtual: S/ ${vi.toFixed(2)}`;

  const tktId = `TKT-${String(AppData.ventas.length + 1).padStart(3, '0')}`;
  const nuevaVenta = {
    id: tktId,
    cli: pedEnCobro.mesa,
    mpago: mp,
    det: detPago,
    fecha: fnFmtFecPeru(),
    tot: tot,
    rec: pagado,
    vue: vuelto,
    items: pedEnCobro.items
  };

  AppData.ventas.unshift(nuevaVenta);
  AppData.pedidos = AppData.pedidos.filter(x => x.id !== pedEnCobro.id);

  fnGuaData();
  fnRenPedidos();
  fnRenVentas();
  fnClMod('mod-cobro');
  fnVerTicket(nuevaVenta);
}

/* ========== 4. VISTA VENTAS ========== */
function fnRenVentas() {
  fnActualizarFiltroMetodosPago(); // Actualiza dinámicamente el selector según las ventas

  const q = fnLimpiarStr(document.getElementById('srch-vta').value);
  const mp = document.getElementById('flt-mpago').value;
  const tb = document.getElementById('tb-vtas');
  tb.innerHTML = '';

  let list = AppData.ventas.filter(v => {
    const matchMp = (mp === 'TODOS' || v.mpago === mp);
    const matchTxt = fnLimpiarStr(v.id).includes(q) || fnLimpiarStr(v.cli).includes(q);
    return matchMp && matchTxt;
  });
  
  let sumaVentas = 0;

  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:var(--txt-muted);">No se encontraron ventas registradas.</td></tr>`;
    document.getElementById('lbl-tot-ventas').innerText = 'S/ 0.00';
    fnEliminarContenedorPaginacion('v-ventas');
    return;
  }

  list.forEach(v => {
    sumaVentas += parseFloat(v.tot) || 0;
  });
  document.getElementById('lbl-tot-ventas').innerText = `S/ ${sumaVentas.toFixed(2)}`;

  const totalPag = Math.ceil(list.length / registrosPorPagina) || 1;
  if (pagVentas > totalPag) pagVentas = totalPag;
  const start = (pagVentas - 1) * registrosPorPagina;
  const pageItems = list.slice(start, start + registrosPorPagina);

  pageItems.forEach(v => {
    const tr = document.createElement('tr');
    tr.className = 'tr-fade';
    tr.innerHTML = `
      <td><strong>${v.id}</strong></td>
      <td>${v.cli}</td>
      <td><span style="background:#e0f2fe; color:var(--c-teal); padding:3px 8px; border-radius:6px; font-size:10px; font-weight:700;">${v.mpago}</span></td>
      <td style="font-size:10px;">${v.det}</td>
      <td style="font-size:10px;">${v.fecha}</td>
      <td style="font-weight:800; color:var(--c-teal);">S/ ${v.tot.toFixed(2)}</td>
      <td style="text-align:center;">
        <div class="act-btns" style="justify-content:center;">
          <button class="act-btn act-prt" onclick="fnVerTicketId('${v.id}')" title="Imprimir">
            <i class="fa-solid fa-print"></i>
          </button>
          <button class="act-btn act-del" onclick="fnConfDelVenta('${v.id}')" title="Eliminar">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tb.appendChild(tr);
  });

  fnRenderPaginacionTabla('v-ventas', pagVentas, totalPag, (nuevaPag) => {
    pagVentas = nuevaPag;
    fnRenVentas();
  });
}

function fnActualizarFiltroMetodosPago() {
  const selectMp = document.getElementById('flt-mpago');
  if (!selectMp) return;

  const valorActual = selectMp.value;
  // Extrae métodos de pago únicos de las ventas registradas y los ordena alfabéticamente
  const metodosUnicos = [...new Set(AppData.ventas.map(v => v.mpago))].sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' })
  );

  selectMp.innerHTML = `<option value="TODOS">Métodos de Pago</option>`;
  metodosUnicos.forEach(mp => {
    const option = document.createElement('option');
    option.value = mp;
    option.innerText = mp;
    selectMp.appendChild(option);
  });

  // Mantiene la selección actual si aún existe, de lo contrario vuelve a "TODOS"
  if ([...selectMp.options].some(opt => opt.value === valorActual)) {
    selectMp.value = valorActual;
  } else {
    selectMp.value = 'TODOS';
  }
}

// Generador visual de los botones de paginación para tablas
function fnRenderPaginacionTabla(vistaId, paginaActual, totalPaginas, callbackCambioPagina) {
  const vistaPanel = document.getElementById(vistaId);
  if (!vistaPanel) return;

  let pagBox = vistaPanel.querySelector('.pag-box-tabla');
  if (!pagBox) {
    pagBox = document.createElement('div');
    pagBox.className = 'pag-box pag-box-tabla';
    const tblBox = vistaPanel.querySelector('.tbl-box');
    if (tblBox && tblBox.parentNode) {
      tblBox.parentNode.insertBefore(pagBox, tblBox.nextSibling);
    } else {
      vistaPanel.appendChild(pagBox);
    }
  }

  pagBox.innerHTML = '';

  if (totalPaginas <= 1) return;

  const btnAnt = document.createElement('button');
  btnAnt.className = `pag-btn ${paginaActual === 1 ? 'disabled' : ''}`;
  btnAnt.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  btnAnt.disabled = paginaActual === 1;
  btnAnt.onclick = () => {
    if (paginaActual > 1) callbackCambioPagina(paginaActual - 1);
  };
  pagBox.appendChild(btnAnt);

  let pages = [];
  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) pages.push(i);
  } else {
    if (paginaActual <= 4) {
      pages = [1, 2, 3, 4, 5, '...', totalPaginas];
    } else if (paginaActual >= totalPaginas - 3) {
      pages = [1, '...', totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
    } else {
      pages = [1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas];
    }
  }

  pages.forEach(p => {
    if (p === '...') {
      const span = document.createElement('span');
      span.className = 'pag-ellipsis';
      span.innerText = '...';
      span.style.padding = '0 6px';
      span.style.display = 'flex';
      span.style.alignItems = 'center';
      span.style.justifyContent = 'center';
      span.style.color = 'var(--txt-muted)';
      pagBox.appendChild(span);
    } else {
      const b = document.createElement('button');
      b.className = `pag-btn ${p === paginaActual ? 'pg-act' : ''}`;
      b.innerText = p;
      b.onclick = () => callbackCambioPagina(p);
      pagBox.appendChild(b);
    }
  });

  const btnSig = document.createElement('button');
  btnSig.className = `pag-btn ${paginaActual === totalPaginas ? 'disabled' : ''}`;
  btnSig.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  btnSig.disabled = paginaActual === totalPaginas;
  btnSig.onclick = () => {
    if (paginaActual < totalPaginas) callbackCambioPagina(paginaActual + 1);
  };
  pagBox.appendChild(btnSig);
}

function fnEliminarContenedorPaginacion(vistaId) {
  const vistaPanel = document.getElementById(vistaId);
  if (!vistaPanel) return;
  const pagBox = vistaPanel.querySelector('.pag-box-tabla');
  if (pagBox) pagBox.innerHTML = '';
}

function fnFltVtas() {
  fnRenVentas();
}

function fnVerTicketId(id) {
  const v = AppData.ventas.find(x => x.id === id);
  if (v) fnVerTicket(v);
}

function fnVerTicket(v) {
  document.getElementById('tkt-num').innerText = `TICKET VENTA #${v.id}`;
  document.getElementById('tkt-fecha').innerText = v.fecha;
  document.getElementById('tkt-cli').innerText = `Cliente/Mesa: ${v.cli}`;
  document.getElementById('tkt-tot').innerText = `S/ ${v.tot.toFixed(2)}`;
  document.getElementById('tkt-met').innerText = v.mpago;
  document.getElementById('tkt-rec').innerText = `S/ ${(v.rec || v.tot).toFixed(2)}`;
  document.getElementById('tkt-vue').innerText = `S/ ${(v.vue || 0).toFixed(2)}`;

  const itBox = document.getElementById('tkt-items');
  itBox.innerHTML = '';
  (v.items || []).forEach(it => {
    const row = document.createElement('div');
    row.className = 'tkt-row';
    row.innerHTML = `<span>${it.cant}x ${it.nom}</span><span>S/ ${(it.cant * it.pre).toFixed(2)}</span>`;
    itBox.appendChild(row);
  });

  fnOpMod('mod-tkt');
}

function fnConfDelVenta(id) {
  document.getElementById('txt-del-msg').innerText = `¿Está seguro de eliminar el ticket ${id}? Esto afectará los reportes.`;
  
  const btn = document.getElementById('btn-conf-del');
  
  btn.onclick = () => {
    AppData.ventas = AppData.ventas.filter(x => x.id !== id);
    fnGuaData();
    fnRenVentas();
    fnClMod('mod-del');
  };

  fnOpMod('mod-del');
}

/* ========== 5. VISTA REPORTES & GRÁFICOS ========== */
function fnObtenerFechaLocal() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function fnResetFechasHoy() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const diaActual = String(ahora.getDate()).padStart(2, '0');

  const primerDiaMes = `${anio}-${mes}-01`;
  const fechaHoy = `${anio}-${mes}-${diaActual}`;

  document.getElementById('rep-fdesde').value = primerDiaMes;
  document.getElementById('rep-fhasta').value = fechaHoy;
  fnActReportes();
}

function fnOpModRepExcel() {
  const repDesde = document.getElementById('rep-fdesde').value;
  const repHasta = document.getElementById('rep-fhasta').value;

  document.getElementById('exc-fdesde').value = repDesde;
  document.getElementById('exc-fhasta').value = repHasta;

  fnOpMod('mod-excel');

  setTimeout(() => {
    fnFltExcTablas();
  }, 50);
}

function fnValFechas() {
  const d = document.getElementById('rep-fdesde');
  const h = document.getElementById('rep-fhasta');
  if (d.value && h.value) {
    if (d.value > h.value) {
      d.value = h.value;
    }
  }
}

function parsearFechaPeru(strFecha) {
  if (!strFecha) return null;
  const partes = strFecha.split(' ');
  if (!partes.length) return null;
  const fechaPartes = partes[0].split('/');
  if (fechaPartes.length !== 3) return null;
  return new Date(`${fechaPartes[2]}-${fechaPartes[1]}-${fechaPartes[0]}T00:00:00`);
}

function fnActReportes() {
  const fDesdeStr = document.getElementById('rep-fdesde').value;
  const fHastaStr = document.getElementById('rep-fhasta').value;
  
  const fDesde = fDesdeStr ? new Date(fDesdeStr + 'T00:00:00') : null;
  const fHasta = fHastaStr ? new Date(fHastaStr + 'T23:59:59') : null;

  let ventasFiltradas = AppData.ventas.filter(v => {
    if (!fDesde && !fHasta) return true;
    const fechaVta = parsearFechaPeru(v.fecha);
    if (!fechaVta) return true;
    if (fDesde && fechaVta < fDesde) return false;
    if (fHasta && fechaVta > fHasta) return false;
    return true;
  });

  let insumosFiltrados = AppData.insumos.filter(i => {
    if (!fDesde && !fHasta) return true;
    const fechaIns = parsearFechaPeru(i.fecha);
    if (!fechaIns) return true;
    if (fDesde && fechaIns < fDesde) return false;
    if (fHasta && fechaIns > fHasta) return false;
    return true;
  });

  let totVtas = 0;
  let totGastos = 0;
  let cntVtas = 0;
  const ventasPorDia = {};
  const gastosPorDia = {};

  ventasFiltradas.forEach(v => {
    totVtas += v.tot;
    cntVtas++;
    const fechaDia = v.fecha ? v.fecha.split(' ')[0] : 'Desconocido';
    ventasPorDia[fechaDia] = (ventasPorDia[fechaDia] || 0) + v.tot;
  });

  insumosFiltrados.forEach(i => {
    totGastos += i.ptot;
    const fechaDia = i.fecha ? i.fecha.split(' ')[0] : 'Desconocido';
    gastosPorDia[fechaDia] = (gastosPorDia[fechaDia] || 0) + i.ptot;
  });

  const ganancia = totVtas - totGastos;

  document.getElementById('kpi-ventas').innerText = `S/ ${totVtas.toFixed(2)}`;
  document.getElementById('kpi-gastos').innerText = `S/ ${totGastos.toFixed(2)}`;

  const lblGananciaText = document.getElementById('kpi-ganancia-lbl');
  if (lblGananciaText) {
    if (ganancia < 0) {
      lblGananciaText.innerText = "Pérdida";
      lblGananciaText.style.color = "var(--c-red)";
    } else {
      lblGananciaText.innerText = "Ganancia";
      lblGananciaText.style.color = "#16a34a";
    }
  }

  const lblGananciaVal = document.getElementById('kpi-ganancia-val');
  lblGananciaVal.innerText = `S/ ${Math.abs(ganancia).toFixed(2)}`;

  lblGananciaVal.classList.remove('text-danger-custom', 'text-success-custom');
  if (ganancia < 0) {
    lblGananciaVal.classList.add('text-danger-custom');
  } else if (ganancia > 0) {
    lblGananciaVal.classList.add('text-success-custom');
  }

  const icoGananciaBox = document.querySelector('.kpi-ico-ganancia');
  if (icoGananciaBox) {
    icoGananciaBox.classList.remove('is-ganancia', 'is-perdida');
    if (ganancia < 0) {
      icoGananciaBox.classList.add('is-perdida');
    } else {
      icoGananciaBox.classList.add('is-ganancia');
    }
  }

  document.getElementById('kpi-count').innerText = cntVtas;

  fnRenChartLineal(ventasPorDia, gastosPorDia);
  fnRenTopPlatos(ventasFiltradas);
}

function fnObtenerRankingPlatos(ventasFiltradas) {
  const conteoPlatos = {};

  ventasFiltradas.forEach(v => {
    (v.items || []).forEach(it => {
      const nom = it.nom;
      const cant = parseInt(it.cant) || 0;
      const pre = parseFloat(it.pre) || 0;

      if (!conteoPlatos[nom]) {
        const platoBD = DB_CARTA.find(p => p.nom === nom);
        const img = platoBD ? platoBD.img : 'img/icono/logo.png';

        conteoPlatos[nom] = {
          nom: nom,
          cant: 0,
          total: 0,
          img: img
        };
      }
      conteoPlatos[nom].cant += cant;
      conteoPlatos[nom].total += cant * pre;
    });
  });

  const ranking = Object.values(conteoPlatos).sort((a, b) => b.cant - a.cant || b.total - a.total);
  return ranking;
}

function fnRenTopPlatos(ventasFiltradas) {
  const ranking = fnObtenerRankingPlatos(ventasFiltradas);
  const gridTop3 = document.getElementById('rep-top3-grid');
  const tbOtros = document.getElementById('tb-rep-otros-platos');
  const pagBoxOtros = document.getElementById('pag-rep-otros');

  gridTop3.innerHTML = '';
  tbOtros.innerHTML = '';
  if (pagBoxOtros) pagBoxOtros.innerHTML = '';

  if (!ranking.length) {
    gridTop3.innerHTML = `<div style="text-align:center; width:100%; color:var(--txt-muted); padding:16px;">No hay datos de platos vendidos en este período.</div>`;
    
    tbOtros.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:16px; color:var(--txt-muted);">No hay ventas registradas.</td>
      </tr>`;
    return;
  }

  // Top 3
  const top3 = ranking.slice(0, 3);
  top3.forEach((plato, idx) => {
    const medallas = ['🥇 #1', '🥈 #2', '🥉 #3'];
    const card = document.createElement('div');
    card.className = `top3-card rank-${idx + 1}`;
    card.innerHTML = `
      <span class="top3-badge">${medallas[idx]}</span>
      <img src="${plato.img}" alt="${plato.nom}" class="top3-img" onerror="this.src='img/icono/logo.png'">
      <div class="top3-name">${plato.nom}</div>
      <div class="top3-qty">${plato.cant} unidad${plato.cant > 1 ? 'es' : ''}</div>
      <div class="top3-monto">Recaudado: S/ ${plato.total.toFixed(2)}</div>
    `;
    gridTop3.appendChild(card);
  });

  // Del 4° lugar hacia abajo (Otros platos vendidos)
  const qOtros = fnLimpiarStr(document.getElementById('srch-rep-otros') ? document.getElementById('srch-rep-otros').value : '');
  
  const todosOtros = ranking.slice(3);
  
  // Mapeamos cada plato conservando su posición real en el ranking general
  const todosOtrosConPosicion = todosOtros.map((plato, index) => ({
    ...plato,
    posicionReal: index + 4
  }));

  const otrosFiltrados = todosOtrosConPosicion.filter(plato => {
    if (!qOtros) return true;
    const matchNum = String(plato.posicionReal).includes(qOtros);
    const matchDesc = fnLimpiarStr(plato.nom).includes(qOtros);
    return matchNum || matchDesc;
  });

  if (!otrosFiltrados.length) {
    tbOtros.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:16px; color:var(--txt-muted);">No se encontraron registros con esa búsqueda.</td></tr>`;
    return;
  }

  const totalPagOtros = Math.ceil(otrosFiltrados.length / registrosPorPaginaOtrosPlatos) || 1;
  if (pagRepOtros > totalPagOtros) pagRepOtros = totalPagOtros;
  const start = (pagRepOtros - 1) * registrosPorPaginaOtrosPlatos;
  const pageOtros = otrosFiltrados.slice(start, start + registrosPorPaginaOtrosPlatos);

  pageOtros.forEach((plato) => {
    const tr = document.createElement('tr');
    tr.className = 'tr-fade';
    tr.innerHTML = `
      <td><strong>#${plato.posicionReal}</strong></td>
      <td style="text-align: left; text-transform: uppercase;"><strong>${plato.nom}</strong></td>
      <td><span style="background:#e0f2fe; color:var(--c-teal); padding:3px 10px; border-radius:12px; font-weight:700;">${plato.cant}</span></td>
      <td style="font-weight:700; color:var(--c-teal);">S/ ${plato.total.toFixed(2)}</td>
    `;
    tbOtros.appendChild(tr);
  });

  if (totalPagOtros > 1 && pagBoxOtros) {
    fnRenderPaginacionGenerica(pagBoxOtros, pagRepOtros, totalPagOtros, (nuevaPag) => {
      pagRepOtros = nuevaPag;
      fnRenTopPlatos(ventasFiltradas);
    });
  }
}

function fnFltRepOtros() {
  pagRepOtros = 1;
  fnActReportes();
}

// Función auxiliar para renderizar la barra de paginación
function fnRenderPaginacionGenerica(contenedor, paginaActual, totalPaginas, callbackCambio) {
  contenedor.innerHTML = '';
  if (totalPaginas <= 1) return;

  const btnAnt = document.createElement('button');
  btnAnt.className = `pag-btn ${paginaActual === 1 ? 'disabled' : ''}`;
  btnAnt.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  btnAnt.disabled = paginaActual === 1;
  btnAnt.onclick = () => {
    if (paginaActual > 1) callbackCambio(paginaActual - 1);
  };
  contenedor.appendChild(btnAnt);

  let pages = [];
  if (totalPaginas <= 7) {
    for (let i = 1; i <= totalPaginas; i++) pages.push(i);
  } else {
    if (paginaActual <= 4) {
      pages = [1, 2, 3, 4, 5, '...', totalPaginas];
    } else if (paginaActual >= totalPaginas - 3) {
      pages = [1, '...', totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
    } else {
      pages = [1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas];
    }
  }

  pages.forEach(p => {
    if (p === '...') {
      const span = document.createElement('span');
      span.className = 'pag-ellipsis';
      span.innerText = '...';
      span.style.padding = '0 6px';
      span.style.display = 'flex';
      span.style.alignItems = 'center';
      span.style.justifyContent = 'center';
      span.style.color = 'var(--txt-muted)';
      contenedor.appendChild(span);
    } else {
      const b = document.createElement('button');
      b.className = `pag-btn ${p === paginaActual ? 'pg-act' : ''}`;
      b.innerText = p;
      b.onclick = () => callbackCambio(p);
      contenedor.appendChild(b);
    }
  });

  const btnSig = document.createElement('button');
  btnSig.className = `pag-btn ${paginaActual === totalPaginas ? 'disabled' : ''}`;
  btnSig.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  btnSig.disabled = paginaActual === totalPaginas;
  btnSig.onclick = () => {
    if (paginaActual < totalPaginas) callbackCambio(paginaActual + 1);
  };
  contenedor.appendChild(btnSig);
}

function fnRenChartLineal(ventasDia, gastosDia) {
  const ctx = document.getElementById('ch-tendencia-lineal').getContext('2d');
  if (chTendencia) chTendencia.destroy();

  const fechasUnicas = [...new Set([...Object.keys(ventasDia), ...Object.keys(gastosDia)])].sort((a, b) => {
    const pA = a.split('/');
    const pB = b.split('/');

    if(pA.length === 3 && pB.length === 3) {
      return new Date(`${pA[2]}-${pA[1]}-${pA[0]}`) - new Date(`${pB[2]}-${pB[1]}-${pB[0]}`);
    }
    return 0;
  });

  const dataVentas = fechasUnicas.map(f => ventasDia[f] || 0);
  const dataGastos = fechasUnicas.map(f => gastosDia[f] || 0);
  
  // Cálculo de la ganancia diaria por fecha (Ventas - Gastos)
  const dataGanancia = fechasUnicas.map((f, idx) => {
    return (dataVentas[idx] - dataGastos[idx]);
  });

  chTendencia = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: fechasUnicas.length ? fechasUnicas : ['Sin datos'],
      
      datasets: [
        {
          label: 'Ventas (S/)',
          data: dataVentas.length ? dataVentas : [0],
          borderColor: '#0083a0',
          backgroundColor: 'rgba(0, 131, 160, 0.2)',
          borderWidth: 2.5,
          fill: true // <--- Agregado para habilitar el relleno
        },
        {
          label: 'Gastos (S/)',
          data: dataGastos.length ? dataGastos : [0],
          borderColor: '#ed1c24',
          backgroundColor: 'rgba(237, 28, 36, 0.2)',
          borderWidth: 2.5,
          fill: true // <--- Agregado para habilitar el relleno
        },
        {
          label: 'Ganancia (S/)',
          data: dataGanancia.length ? dataGanancia : [0],
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.2)',
          borderWidth: 2.5,
          fill: true // <--- Agregado para habilitar el relleno
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: { y: { beginAtZero: true } }
    }
  });

  const legendContainer = document.getElementById('ch-legend-container');
  if (legendContainer) {
    legendContainer.innerHTML = `
      <div class="chart-legend-item">
        <span class="chart-legend-box" style="background-color: rgba(0, 131, 160, 0.2); border: 2px solid #0083a0;"></span>
        <span>Ventas (S/)</span>
      </div>
      
      <div class="chart-legend-item">
        <span class="chart-legend-box" style="background-color: rgba(237, 28, 36, 0.2); border: 2px solid #ed1c24;"></span>
        <span>Gastos (S/)</span>
      </div>

      <div class="chart-legend-item">
        <span class="chart-legend-box" style="background-color: rgba(22, 163, 74, 0.2); border: 2px solid #16a34a;"></span>
        <span>Ganancia (S/)</span>
      </div>
    `;
  }
}

/* ========== MODAL EXCEL / EXPORTACIÓN ========== */
function fnFltExcTablas() {
  const fDesdeStr = document.getElementById('exc-fdesde').value;
  const fHastaStr = document.getElementById('exc-fhasta').value;
  
  const fDesde = fDesdeStr ? new Date(fDesdeStr + 'T00:00:00') : null;
  const fHasta = fHastaStr ? new Date(fHastaStr + 'T23:59:59') : null;

  const tbI = document.querySelector('#tbl-exc-ins tbody');
  const tbV = document.querySelector('#tbl-exc-vta tbody');
  tbI.innerHTML = '';
  tbV.innerHTML = '';

  let insumosFiltrados = AppData.insumos.filter(i => {
    if (!fDesde && !fHasta) return true;
    const fechaIns = parsearFechaPeru(i.fecha);
    if (!fechaIns) return true;
    if (fDesde && fechaIns < fDesde) return false;
    if (fHasta && fechaIns > fHasta) return false;
    return true;
  });

  let ventasFiltradas = AppData.ventas.filter(v => {
    if (!fDesde && !fHasta) return true;
    const fechaVta = parsearFechaPeru(v.fecha);
    if (!fechaVta) return true;
    if (fDesde && fechaVta < fDesde) return false;
    if (fHasta && fechaVta > fHasta) return false;
    return true;
  });

  const LIMITE_VISUAL = 100;
  const insumosLimitados = insumosFiltrados.slice(0, LIMITE_VISUAL);
  const ventasLimitadas = ventasFiltradas.slice(0, LIMITE_VISUAL);

  if (!insumosLimitados.length) {
    tbI.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; color:var(--txt-muted);">No hay insumos en este rango.</td>
      </tr>`;
  } else {
    let htmlIns = '';

    insumosLimitados.forEach(i => {
      htmlIns += `
        <tr>
          <td>${i.desc}</td>
          <td>${i.cat}</td>
          <td>${i.cant}</td>
          <td>${i.med || 'und'}</td>
          <td>S/ ${i.ptot.toFixed(2)}</td>
          <td>${i.prov}</td>
          <td>${i.fecha}</td>
        </tr>`;
    });

    if (insumosFiltrados.length > LIMITE_VISUAL) {
      htmlIns += `
        <tr>
          <td colspan="7" style="text-align:center; color:var(--c-orange); font-weight:bold;">... y ${insumosFiltrados.length - LIMITE_VISUAL} registros más ocultos (se descargarán todos al exportar).</td>
        </tr>`;
    }

    tbI.innerHTML = htmlIns;
  }

  if (!ventasLimitadas.length) {
    tbV.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; color:var(--txt-muted);">No hay ventas en este rango.</td>
      </tr>`;
  } else {
    let htmlVta = '';

    ventasLimitadas.forEach(v => {
      htmlVta += `
        <tr>
          <td>${v.id}</td>
          <td>${v.cli}</td>
          <td>${v.mpago}</td>
          <td>S/ ${v.tot.toFixed(2)}</td>
          <td>${v.fecha}</td>
        </tr>`;
    });

    if (ventasFiltradas.length > LIMITE_VISUAL) {
      htmlVta += `
        <tr>
          <td colspan="5" style="text-align:center; color:var(--c-orange); font-weight:bold;">... y ${ventasFiltradas.length - LIMITE_VISUAL} registros más ocultos (se descargarán todos al exportar).
        </tr>`;
    }

    tbV.innerHTML = htmlVta;
  }
}

async function fnDescargarCSV() {
  const fDesdeStr = document.getElementById('exc-fdesde') ? document.getElementById('exc-fdesde').value : '';
  const fHastaStr = document.getElementById('exc-fhasta') ? document.getElementById('exc-fhasta').value : '';
  
  const fDesde = fDesdeStr ? new Date(fDesdeStr + 'T00:00:00') : null;
  const fHasta = fHastaStr ? new Date(fHastaStr + 'T23:59:59') : null;

  let insumosFiltrados = AppData.insumos.filter(i => {
    if (!fDesde && !fHasta) return true;
    const fechaIns = parsearFechaPeru(i.fecha);
    if (!fechaIns) return true;
    if (fDesde && fechaIns < fDesde) return false;
    if (fHasta && fechaIns > fHasta) return false;
    return true;
  });

  let ventasFiltradas = AppData.ventas.filter(v => {
    if (!fDesde && !fHasta) return true;
    const fechaVta = parsearFechaPeru(v.fecha);
    if (!fechaVta) return true;
    if (fDesde && fechaVta < fDesde) return false;
    if (fHasta && fechaVta > fHasta) return false;
    return true;
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Cevichería AidaMar';
  workbook.created = new Date();

  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0083A0' }
  };

  const headerFont = {
    name: 'Tahoma',
    size: 10,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  };

  const titleFont = {
    name: 'Tahoma',
    size: 14,
    bold: true,
    color: { argb: 'FF0083A0' }
  };

  const subTitleFont = {
    name: 'Tahoma',
    size: 10,
    italic: true,
    color: { argb: 'FF627D8E' }
  };

  const totalRowFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8FAFC' }
  };

  const borderThin = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  };

  // HOJA 1: GASTOS
  const wsGastos = workbook.addWorksheet('gastos', {
    views: [{ state: 'frozen', ySplit: 4, xSplit: 0, showGridLines: false }],
    pageSetup: {
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      printTitlesRow: '1:4'
    }
  });

  let textoFechaGastos = `Generado el: ${fnFmtFecPeru()}`;
  if (fDesdeStr && fHastaStr) {
    const [aD, mD, dD] = fDesdeStr.split('-');
    const [aH, mH, dH] = fHastaStr.split('-');
    textoFechaGastos = `Reporte generado desde: ${dD}/${mD}/${aD} hasta ${dH}/${mH}/${aH}`;
  } else if (fDesdeStr) {
    const [aD, mD, dD] = fDesdeStr.split('-');
    textoFechaGastos = `Reporte generado desde: ${dD}/${mD}/${aD}`;
  } else if (fHastaStr) {
    const [aH, mH, dH] = fHastaStr.split('-');
    textoFechaGastos = `Reporte generado hasta: ${dH}/${mH}/${aH}`;
  }

  wsGastos.addRow(['CEVICHERÍA AIDAMAR - REPORTE DE GASTOS']);
  wsGastos.getRow(1).getCell(1).font = titleFont;
  wsGastos.addRow([textoFechaGastos]);
  wsGastos.getRow(2).getCell(1).font = subTitleFont;
  wsGastos.addRow([]);

  const headersGastos = ['ID', 'Descripción', 'Categoría', 'P. Unitario', 'Cantidad', 'Unidad', 'Total (S/)', 'Proveedor', 'Fecha Registro'];
  const rowHeaderGastos = wsGastos.addRow(headersGastos);
  rowHeaderGastos.height = 24;

  rowHeaderGastos.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  let totalGastosSum = 0;
  insumosFiltrados.forEach((i, idx) => {
    const ptot = parseFloat(i.ptot) || 0;
    totalGastosSum += ptot;

    const row = wsGastos.addRow([
      i.id,
      i.desc,
      i.cat,
      parseFloat(i.punit) || 0,
      parseFloat(i.cant) || 0,
      i.med || 'und',
      ptot,
      i.prov,
      i.fecha
    ]);

    row.height = 20;

    if (idx % 2 === 1) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      });
    }

    row.eachCell((cell, colNumber) => {
      cell.border = borderThin;
      cell.font = { name: 'Tahoma', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };

      if (colNumber === 4 || colNumber === 7) {
        cell.numFmt = '"S/" #,##0.00';
      }
    });
  });

  const rowTotalGastos = wsGastos.addRow(['', '', '', '', '', 'TOTAL GASTOS', totalGastosSum, '', '']);
  rowTotalGastos.height = 20;
  rowTotalGastos.eachCell((cell) => {
    cell.fill = totalRowFill;
    cell.font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FFED1C24' } };
    cell.border = borderThin;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.numFmt = '"S/" #,##0.00';
  });

  wsGastos.columns.forEach(column => {
    let maxLength = 12;
    column.eachCell({ includeEmpty: false }, cell => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = Math.min(maxLength + 4, 40);
  });

  // HOJA 2: VENTAS
  const wsVentas = workbook.addWorksheet('ventas', {
    views: [{ state: 'frozen', ySplit: 4, xSplit: 0, showGridLines: false }],
    pageSetup: {
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      printTitlesRow: '1:4'
    }
  });

  let textoFechaVentas = `Generado el: ${fnFmtFecPeru()}`;
  if (fDesdeStr && fHastaStr) {
    const [aD, mD, dD] = fDesdeStr.split('-');
    const [aH, mH, dH] = fHastaStr.split('-');
    textoFechaVentas = `Reporte generado desde: ${dD}/${mD}/${aD} hasta ${dH}/${mH}/${aH}`;
  } else if (fDesdeStr) {
    const [aD, mD, dD] = fDesdeStr.split('-');
    textoFechaVentas = `Reporte generado desde: ${dD}/${mD}/${aD}`;
  } else if (fHastaStr) {
    const [aH, mH, dH] = fHastaStr.split('-');
    textoFechaVentas = `Reporte generado hasta: ${dH}/${mH}/${aH}`;
  }

  wsVentas.addRow(['CEVICHERÍA AIDAMAR - REPORTE DE VENTAS']);
  wsVentas.getRow(1).getCell(1).font = titleFont;
  wsVentas.addRow([textoFechaVentas]);
  wsVentas.getRow(2).getCell(1).font = subTitleFont;
  wsVentas.addRow([]);

  const headersVentas = ['N° Ticket', 'Cliente / Mesa', 'Método de Pago', 'Detalle de Pago', 'Total Pagado (S/)', 'Fecha / Hora'];
  const rowHeaderVentas = wsVentas.addRow(headersVentas);
  rowHeaderVentas.height = 24;

  rowHeaderVentas.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  });

  let totalVentasSum = 0;
  ventasFiltradas.forEach((v, idx) => {
    const tot = parseFloat(v.tot) || 0;
    totalVentasSum += tot;

    const row = wsVentas.addRow([
      v.id,
      v.cli,
      v.mpago,
      v.det,
      tot,
      v.fecha
    ]);

    row.height = 20;

    if (idx % 2 === 1) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      });
    }

    row.eachCell((cell, colNumber) => {
      cell.border = borderThin;
      cell.font = { name: 'Tahoma', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };

      if (colNumber === 5) {
        cell.numFmt = '"S/" #,##0.00';
      }
    });
  });

  const rowTotalVentas = wsVentas.addRow(['', '', '', 'TOTAL VENTAS', totalVentasSum, '']);
  rowTotalVentas.height = 22;
  rowTotalVentas.eachCell((cell) => {
    cell.fill = totalRowFill;
    cell.font = { name: 'Tahoma', size: 10, bold: true, color: { argb: 'FF16A34A' } };
    cell.border = borderThin;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.numFmt = '"S/" #,##0.00';
  });

  wsVentas.columns.forEach(column => {
    let maxLength = 12;
    column.eachCell({ includeEmpty: false }, cell => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });

    column.width = Math.min(maxLength + 4, 40);
  });

  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, '0');
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const anio = ahora.getFullYear();
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  const nombreArchivo = `Reporte_AidaMar_${dia}${mes}${anio}_${horas}${minutos}${segundos}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", nombreArchivo);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function fnRenCategoriasCarta() {
  const catTabsBox = document.getElementById('cat-tabs');
  if (!catTabsBox) return;
  catTabsBox.innerHTML = '';

  CATEGORIAS_CARTA.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `cat-pill ${cat === catAct ? 'cp-act' : ''}`;
    btn.innerText = cat;
    btn.onclick = (e) => fnSetCat(cat, e.currentTarget);
    catTabsBox.appendChild(btn);
  });
}

/* ========== INICIALIZACIÓN GLOBAL ========== */
window.addEventListener('DOMContentLoaded', () => {
  fnCarData();
  fnActuEspacioSidebar(); // Carga inicial del estado del almacenamiento
  fnIniReloj();
  fnRenInsumos();
  fnRenCategoriasCarta();
  fnRenCarta();
  fnRenPedidos();
  fnRenVentas();
  fnActCartBadge();
  fnResetFechasHoy();

  const sesionActiva = localStorage.getItem('AIDAMAR_SESION_ACTIVA');
  if (sesionActiva === 'true') {
    const box = document.getElementById('sec-login');
    if (box) box.classList.add('log-hide');
  }
});

/* ========== CUALQUIER EXTENSIÓN DE EXCEL Y PREVISUALIZACIÓN ========== */
let excelWorkbookActual = null;

function fnOpModCargarExcel() {
  document.getElementById('inp-excel-file').value = '';
  document.getElementById('excel-file-info').style.display = 'none';
  document.getElementById('excel-sheet-tabs').style.display = 'none';
  document.getElementById('excel-table-box').style.display = 'none';
  document.getElementById('thead-excel').innerHTML = '';
  document.getElementById('tbody-excel').innerHTML = '';
  excelWorkbookActual = null;
  
  const dropzone = document.getElementById('excel-dropzone');
  if (dropzone && !dropzone.dataset.hasEvents) {
    dropzone.dataset.hasEvents = 'true';
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-over');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fnProcesarArchivoExcel({ target: { files: e.dataTransfer.files } });
      }
    });
  }

  fnOpMod('mod-cargar-excel');
}

function fnProcesarArchivoExcel(e) {
  const file = e.target.files[0];
  if (!file) return;

  document.getElementById('excel-filename').innerText = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  document.getElementById('excel-file-info').style.display = 'block';

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = new Uint8Array(evt.target.result);
      excelWorkbookActual = XLSX.read(data, { type: 'array' });

      const tabsBox = document.getElementById('excel-sheet-tabs');
      tabsBox.innerHTML = '';
      tabsBox.style.display = 'flex';

      excelWorkbookActual.SheetNames.forEach((sheetName, index) => {
        const btn = document.createElement('button');
        btn.className = `cat-pill ${index === 0 ? 'cp-act' : ''}`;
        btn.innerText = sheetName;
        btn.onclick = (event) => {
          document.querySelectorAll('#excel-sheet-tabs .cat-pill').forEach(b => b.classList.remove('cp-act'));
          event.currentTarget.classList.add('cp-act');
          fnMostrarHojaExcel(sheetName);
        };
        tabsBox.appendChild(btn);
      });

      fnMostrarHojaExcel(excelWorkbookActual.SheetNames[0]);

    } catch (err) {
      alert('Error al leer el archivo Excel.');
      console.error(err);
    }
  };

  reader.readAsArrayBuffer(file);
}

function fnMostrarHojaExcel(sheetName) {
  if (!excelWorkbookActual) return;

  const worksheet = excelWorkbookActual.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  const thead = document.getElementById('thead-excel');
  const tbody = document.getElementById('tbody-excel');
  thead.innerHTML = '';
  tbody.innerHTML = '';

  if (!jsonData || jsonData.length === 0) {
    tbody.innerHTML = `<tr><td style="text-align:center; padding:18px; color:var(--txt-muted);">La hoja está vacía.</td></tr>`;
    document.getElementById('excel-table-box').style.display = 'block';
    return;
  }

  const headerRow = document.createElement('tr');
  const headers = jsonData[0];
  headers.forEach(h => {
    const th = document.createElement('th');
    th.innerText = h !== '' ? h : '—';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const LIMITE_FILAS_PREVIEW = 150;
  const totalFilas = Math.min(jsonData.length, LIMITE_FILAS_PREVIEW);

  let filasHTML = '';
  for (let i = 1; i < totalFilas; i++) {
    const row = jsonData[i];
    filasHTML += '<tr>';
    row.forEach(cell => {
      filasHTML += `<td>${cell}</td>`;
    });
    filasHTML += '</tr>';
  }

  if (jsonData.length > LIMITE_FILAS_PREVIEW) {
    filasHTML += `<tr><td colspan="${headers.length}" style="text-align:center; color:var(--c-orange); font-weight:bold; padding: 12px;">Mostrando las primeras ${LIMITE_FILAS_PREVIEW} filas de ${jsonData.length} totales para garantizar fluidez en el sistema.</td></tr>`;
  }

  tbody.innerHTML = filasHTML;
  document.getElementById('excel-table-box').style.display = 'block';
}

/* ========== CÁLCULO DE ESPACIO Y GESTIÓN DE BACKUP ========== */
function fnOpModAlmacenamiento() {
  const dataStr = localStorage.getItem(KEY_DAT) || JSON.stringify(AppData);
  const bytesUsados = new Blob([dataStr]).size;
  const kbUsados = (bytesUsados / 1024).toFixed(2);
  
  const bytesTotales = 5242880;
  const bytesLibres = Math.max(0, bytesTotales - bytesUsados);
  const mbLibres = (bytesLibres / (1024 * 1024)).toFixed(2);
  
  let porcentajeUsado = ((bytesUsados / bytesTotales) * 100);
  if (bytesUsados > 0 && porcentajeUsado < 1) {
    porcentajeUsado = 1;
  }
  
  const regDisponiblesEstimados = Math.floor(bytesLibres / 200);

  document.getElementById('alm-usado').innerText = `${kbUsados} KB (${porcentajeUsado.toFixed(1)}%)`;
  document.getElementById('alm-libre').innerText = `${mbLibres} MB`;
  document.getElementById('alm-reg-disp').innerText = `~${regDisponiblesEstimados.toLocaleString()} registros`;

  const barFill = document.getElementById('alm-bar-fill');
  if (barFill) {
    barFill.style.width = `${Math.min(100, porcentajeUsado)}%`;
    
    if (porcentajeUsado > 85) {
      barFill.style.backgroundColor = 'var(--c-red)';
    } else if (porcentajeUsado > 60) {
      barFill.style.backgroundColor = 'var(--c-orange)';
    } else {
      barFill.style.backgroundColor = 'var(--c-teal)';
    }
  }

  const totIng = AppData.insumos.length;
  const totPed = AppData.pedidos.length;
  const totVta = AppData.ventas.length;

  document.getElementById('alm-tot-ing').innerText = totIng;
  document.getElementById('alm-tot-ped').innerText = totPed;
  document.getElementById('alm-tot-vta').innerText = totVta;

  // Validar si existen registros en cualquiera de las 3 vistas
  const hayRegistros = (totIng > 0 || totPed > 0 || totVta > 0);

  const btnGuardar = document.getElementById('btn-guardar-registro');
  const btnEliminar = document.getElementById('btn-eliminar-registro');

  if (btnGuardar) {
    btnGuardar.disabled = !hayRegistros;
    btnGuardar.style.opacity = hayRegistros ? '1' : '0.4';
    btnGuardar.style.cursor = hayRegistros ? 'pointer' : 'not-allowed';
  }

  if (btnEliminar) {
    btnEliminar.disabled = !hayRegistros;
    btnEliminar.style.opacity = hayRegistros ? '1' : '0.4';
    btnEliminar.style.cursor = hayRegistros ? 'pointer' : 'not-allowed';
  }

  fnOpMod('mod-almacenamiento');
}

/* ========== CÁLCULO DE ESPACIO EN SIDEBAR ========== */
function fnActuEspacioSidebar() {
  const elUsado = document.getElementById('sbar-alm-usado');
  const elPorcentaje = document.getElementById('sbar-alm-porcentaje');
  const elBarFill = document.getElementById('sbar-alm-bar-fill');

  if (!elUsado || !elPorcentaje || !elBarFill) return;

  const dataStr = localStorage.getItem(KEY_DAT) || JSON.stringify(AppData);
  const bytesUsados = new Blob([dataStr]).size;
  const kbUsados = (bytesUsados / 1024).toFixed(1);
  const bytesTotales = 5242880; // 5 MB

  let porcentajeUsado = (bytesUsados / bytesTotales) * 100;
  if (bytesUsados > 0 && porcentajeUsado < 1) {
    porcentajeUsado = 1;
  }

  elUsado.innerText = `${kbUsados} KB`;
  elPorcentaje.innerText = `${porcentajeUsado.toFixed(1)}%`;
  elBarFill.style.width = `${Math.min(100, porcentajeUsado)}%`;

  if (porcentajeUsado > 85) {
    elBarFill.style.backgroundColor = 'var(--c-red)';
    elPorcentaje.style.color = 'var(--c-red)';
  } else if (porcentajeUsado > 60) {
    elBarFill.style.backgroundColor = 'var(--c-orange)';
    elPorcentaje.style.color = 'var(--c-orange)';
  } else {
    elBarFill.style.backgroundColor = 'var(--c-teal)';
    elPorcentaje.style.color = 'var(--c-teal)';
  }
}

function fnMostrarModalInfo(titulo, mensaje, icono = 'fa-circle-info', color = 'var(--c-teal)') {
  const titleEl = document.getElementById('info-sys-title');
  titleEl.style.color = color;
  titleEl.innerHTML = `<i class="fa-solid ${icono}"></i> ${titulo}`;
  document.getElementById('info-sys-msg').innerHTML = mensaje;
  fnOpMod('mod-info-sistema');
}

function fnGuardarRegistroAccion() {
  const totIng = AppData.insumos.length;
  const totPed = AppData.pedidos.length;
  const totVta = AppData.ventas.length;

  if (totIng === 0 && totPed === 0 && totVta === 0) {
    fnMostrarModalInfo('Sin Registros', 'No hay registros en el sistema para guardar.', 'fa-triangle-exclamation', 'var(--c-orange)');
    return;
  }

  const tbody = document.getElementById('tb-prev-guardar');
  tbody.innerHTML = `
    <tr><td>Historial de Insumos</td><td><strong>${totIng}</strong></td></tr>
    <tr><td>Historial de Pedidos</td><td><strong>${totPed}</strong></td></tr>
    <tr><td>Historial de Ventas</td><td><strong>${totVta}</strong></td></tr>
  `;

  fnClMod('mod-almacenamiento');
  fnOpMod('mod-prev-guardar');
}

function fnEjecutarGuardarBackup() {
  fnClMod('mod-prev-guardar');
  
  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, '0');
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const anio = ahora.getFullYear();
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');

  const timeStamp = `${dia}${mes}${anio}_${horas}${minutos}${segundos}`;
  const nombreArchivo = `Backup_AidaMar_${timeStamp}.json`;

  const dataExport = JSON.stringify(AppData, null, 2);
  
  const blob = new Blob([dataExport], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  fnMostrarModalInfo(
    'Copia de Seguridad Guardada',
    `Se generó una copia de seguridad correctamente con el nombre ${nombreArchivo}<br/>`,
    'fa-circle-check',
    '#16a34a'
  );
}

function fnCancelarGuardarBackup() {
  fnClMod('mod-prev-guardar');
  fnMostrarModalInfo('Operación Cancelada', 'Se canceló la descarga de la copia de seguridad.', 'fa-ban', 'var(--c-red)');
}

function fnReiniciarRegistroAccion() {
  const totIng = AppData.insumos.length;
  const totPed = AppData.pedidos.length;
  const totVta = AppData.ventas.length;

  if (totIng === 0 && totPed === 0 && totVta === 0) {
    fnMostrarModalInfo('Sin Registros', 'No hay registros guardados en el sistema para eliminar.', 'fa-circle-exclamation', 'var(--c-orange)');
    return;
  }

  const tbody = document.getElementById('tb-prev-reiniciar');
  tbody.innerHTML = `
    <tr><td>Historial de Ingresos</td><td><strong style="color:var(--c-red);">${totIng}</strong></td></tr>
    <tr><td>Historial de Pedidos</td><td><strong style="color:var(--c-red);">${totPed}</strong></td></tr>
    <tr><td>Historial de Ventas</td><td><strong style="color:var(--c-red);">${totVta}</strong></td></tr>
  `;

  fnClMod('mod-almacenamiento');
  fnOpMod('mod-prev-reiniciar');
}

function fnCancelarReiniciar() {
  fnClMod('mod-prev-reiniciar');
  fnMostrarModalInfo('Operación Cancelada', 'Se canceló la eliminación de registros.', 'fa-ban', 'var(--c-red)');
}

function fnPreguntarBackupAntesDeReiniciar() {
  fnClMod('mod-prev-reiniciar');
  fnOpMod('mod-conf-backup-reiniciar');
}

function fnConfirmarReiniciarConBackup(deseaBackup) {
  fnClMod('mod-conf-backup-reiniciar');

  if (deseaBackup) {
    fnEjecutarGuardarBackup();
  }

  AppData = { insumos: [], pedidos: [], ventas: [], cart: [] };
  fnGuaData();

  fnRenInsumos();
  fnRenPedidos();
  fnRenVentas();
  fnActCartBadge();
  fnActReportes();

  fnMostrarModalInfo(
    'Eliminación Completa',
    'Se eliminaron exitosamente todos los registros del sistema.',
    'fa-trash-can',
    'var(--c-red)'
  );
}

function fnProcesarCargarBackup(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      // Intentamos parsear el contenido del archivo JSON
      const dataCargada = JSON.parse(evt.target.result);

      // Validamos que la estructura contenga los módulos requeridos del sistema
      if (dataCargada && typeof dataCargada === 'object' && Array.isArray(dataCargada.insumos) && Array.isArray(dataCargada.pedidos) && Array.isArray(dataCargada.ventas)) {
        
        // Validar si el archivo JSON está completamente vacío de registros
        const totalRegistros = dataCargada.insumos.length + dataCargada.pedidos.length + dataCargada.ventas.length;
        
        if (totalRegistros === 0) {
          fnClMod('mod-almacenamiento');
          fnMostrarModalInfo('Archivo Vacío', 'El archivo JSON no contiene ningún registro en el sistema, por lo que no se ha cargado ningún backup.', 'fa-triangle-exclamation', 'var(--c-orange)');
          return;
        }

        // Si la estructura es válida y contiene registros, se cargan los datos al sistema
        AppData = dataCargada;
        fnGuaData();

        fnRenInsumos();
        fnRenPedidos();
        fnRenVentas();
        fnActCartBadge();
        fnActReportes();

        fnClMod('mod-almacenamiento');
        fnMostrarModalInfo('Carga Exitosa', `Se cargó correctamente los registros desde el archivo <strong>${file.name}</strong>.`, 'fa-circle-check', '#16a34a');
      
      } else {
        // Si el JSON no tiene la estructura correcta de AidaMar
        fnClMod('mod-almacenamiento');
        fnMostrarModalInfo('Archivo Inválido', 'El archivo seleccionado no tiene una estructura válida de backup.', 'fa-triangle-exclamation', 'var(--c-red)');
      }

    } catch (err) {
      // Si ocurre un error de sintaxis en el JSON
      fnClMod('mod-almacenamiento');
      fnMostrarModalInfo('Error al Leer', 'Ocurrió un error al procesar el archivo JSON.', 'fa-triangle-exclamation', 'var(--c-red)');
    }
  };
  
  reader.readAsText(file);
}