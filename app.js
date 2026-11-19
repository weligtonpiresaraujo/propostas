(function () {
  'use strict';
  var WHATS = '5561992551099';
  var app = document.getElementById('app');
  var modal = document.getElementById('modal');
  var corpo = document.getElementById('corpo');
  var titulo = document.getElementById('titulo-janela');
  var icone = document.getElementById('icone-janela');
  var btnProx = document.getElementById('proxima');
  var btnX = document.getElementById('x');
  var abertoPeloApp = false;
  var ultimoFoco = null;
  var acaoAtual = null;
  var icones = {};
  var teclado = false;
  document.addEventListener('keydown', function () { teclado = true; }, true);
  document.addEventListener('pointerdown', function () { teclado = false; }, true);

  // Ícones da janela: copiados dos próprios botões da página (conteúdo fixo, nada vem do usuário).
  document.querySelectorAll('[data-abre]').forEach(function (a) {
    var svg = a.querySelector('svg');
    if (svg) {
      var copia = svg.cloneNode(true);
      copia.querySelectorAll('[stroke]').forEach(function (el) { el.setAttribute('stroke', '#fff'); });
      if (copia.getAttribute('stroke')) copia.setAttribute('stroke', '#fff');
      icones[a.getAttribute('data-abre')] = copia;
    }
    a.addEventListener('click', function () { abertoPeloApp = true; ultimoFoco = a; });
  });

  function mostrar() {
    var id = location.hash.slice(1);
    var painel = /^[a-z]+$/.test(id) ? document.getElementById('p-' + id) : null;
    if (!painel) {
      if (modal.classList.contains('aberto')) {
        modal.classList.remove('aberto');
        app.removeAttribute('inert');
        app.removeAttribute('aria-hidden');
        if (ultimoFoco && teclado) ultimoFoco.focus();
      }
      return;
    }
    document.querySelectorAll('.painel').forEach(function (p) { p.classList.toggle('ativo', p === painel); });
    titulo.textContent = painel.getAttribute('data-titulo');
    icone.replaceChildren();
    if (icones[id]) icone.appendChild(icones[id].cloneNode(true));
    modal.classList.toggle('foto', id === 'santinho');

    var prox = painel.getAttribute('data-proxima');
    var acao = painel.getAttribute('data-acao');
    btnProx.classList.remove('whats');
    acaoAtual = null;
    if (acao === 'whats') {
      btnProx.hidden = false; btnProx.textContent = 'Enviar pelo WhatsApp'; btnProx.classList.add('whats');
      acaoAtual = enviarWhats;
    } else if (acao === 'baixar') {
      btnProx.hidden = false; btnProx.textContent = 'Salvar imagem'; btnProx.classList.add('whats');
      acaoAtual = baixarSantinho;
    } else if (prox) {
      btnProx.hidden = false;
      btnProx.textContent = painel.getAttribute('data-rotulo') || (prox === 'votar' ? 'Como votar ›' : 'Próxima ›');
      acaoAtual = function () { location.replace('#' + prox); };
    } else {
      btnProx.hidden = true;
    }
    if (!modal.classList.contains('aberto')) {
      modal.classList.add('aberto');
      app.setAttribute('inert', '');
      app.setAttribute('aria-hidden', 'true');
    }
    corpo.scrollTop = 0;
    // Contagem anônima de qual janela foi aberta (GoatCounter, sem cookies)
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: 'janela-' + id, title: painel.getAttribute('data-titulo'), event: true });
      }
    } catch (e) {}
    if (teclado) btnX.focus({ preventScroll: true });
    else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  btnProx.addEventListener('click', function () { if (acaoAtual) acaoAtual(); });

  var form = document.getElementById('form-sugestao');
  var erro = document.getElementById('f-erro');
  form.addEventListener('input', function () { erro.classList.remove('mostrar'); });
  form.addEventListener('submit', function (e) { e.preventDefault(); enviarWhats(); });

  function enviarWhats() {
    var v = function (id) { return document.getElementById(id).value.replace(/\s+/g, ' ').trim(); };
    var nome = v('f-nome').slice(0, 80), quadra = v('f-quadra').slice(0, 10),
        lote = v('f-lote').slice(0, 10), texto = document.getElementById('f-texto').value.trim().slice(0, 1000);
    if (!nome || !quadra || !lote || !texto) { erro.classList.add('mostrar'); corpo.scrollTop = corpo.scrollHeight; return; }
    erro.classList.remove('mostrar');
    var msg = 'Olá, Weligton! Tenho uma sugestão para a segurança do Villa Suíça.\n' +
      'Nome: ' + nome + '\nQuadra: ' + quadra + ' · Lote: ' + lote + '\nSugestão: ' + texto;
    window.location.href = 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(msg);
  }

  function baixarSantinho() {
    var a = document.createElement('a');
    a.href = 'santinho-weligton.jpg';
    a.download = 'santinho-weligton.jpg';
    document.body.appendChild(a); a.click(); a.remove();
  }

  function fechar() {
    if (abertoPeloApp && history.length > 1) { abertoPeloApp = false; history.back(); }
    else { history.replaceState(null, '', location.pathname + location.search); mostrar(); }
  }
  document.getElementById('fechar').addEventListener('click', fechar);
  btnX.addEventListener('click', fechar);
  modal.addEventListener('click', function (e) { if (e.target === modal) fechar(); });
  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('aberto')) return;
    if (e.key === 'Escape') { fechar(); return; }
    if (e.key === 'Tab') {
      var focaveis = modal.querySelectorAll('button:not([hidden]), a[href], input, textarea');
      var vis = Array.prototype.filter.call(focaveis, function (el) { return el.offsetParent !== null; });
      if (!vis.length) return;
      var primeiro = vis[0], ultimo = vis[vis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    }
  });
  window.addEventListener('hashchange', mostrar);
  mostrar();
})();
