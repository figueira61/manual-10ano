// Documento falso mínimo para testar a montagem no DOM, sem dependências.
// Só o que js/quiz.js e js/render.js usam: createElement, createTextNode, appendChild, textContent,
// className/classList, setAttribute, addEventListener, onclick, click(), querySelector(All) por classe/etiqueta.

class No {
  constructor() { this.childNodes = []; this.parentNode = null; }
  get firstChild() { return this.childNodes[0] || null; }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; }
  get children() { return this.childNodes.filter((n) => n instanceof Elemento); }
}

class Texto extends No {
  constructor(t) { super(); this.data = String(t); }
  get textContent() { return this.data; }
  set textContent(t) { this.data = String(t); }
}

class Elemento extends No {
  constructor(etiqueta) {
    super();
    this.tagName = String(etiqueta).toUpperCase();
    this.attrs = {};
    this.ouvintes = {};
    this.classes = new Set();
    this.onclick = null;
    this.style = {};
    const self = this;
    this.classList = {
      add(...c) { c.forEach((x) => self.classes.add(x)); },
      remove(...c) { c.forEach((x) => self.classes.delete(x)); },
      contains(c) { return self.classes.has(c); },
      toggle(c, f) { const t = f === undefined ? !self.classes.has(c) : f; if (t) self.classes.add(c); else self.classes.delete(c); return t; },
    };
  }

  get className() { return Array.from(this.classes).join(' '); }
  set className(v) { this.classes = new Set(String(v).split(/\s+/).filter(Boolean)); }

  get textContent() { return this.childNodes.map((n) => n.textContent).join(''); }
  set textContent(t) {
    this.childNodes.forEach((n) => { n.parentNode = null; });
    this.childNodes = [];
    if (t !== '' && t !== undefined && t !== null) this.appendChild(new Texto(t));
  }

  appendChild(no) {
    if (no.parentNode) no.parentNode.removeChild(no);
    no.parentNode = this;
    this.childNodes.push(no);
    return no;
  }

  removeChild(no) {
    const i = this.childNodes.indexOf(no);
    if (i >= 0) this.childNodes.splice(i, 1);
    no.parentNode = null;
    return no;
  }

  setAttribute(k, v) {
    this.attrs[k] = String(v);
    if (k === 'class') this.className = v;
  }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }

  addEventListener(tipo, fn) { (this.ouvintes[tipo] = this.ouvintes[tipo] || []).push(fn); }
  removeEventListener(tipo, fn) {
    const l = this.ouvintes[tipo] || [];
    const i = l.indexOf(fn);
    if (i >= 0) l.splice(i, 1);
  }

  // Dispara um evento: os ouvintes registados e, no clique, o onclick.
  // Com { bubbles: true } o evento sobe pelos pais até alguém chamar stopPropagation().
  dispatch(tipo, extra) {
    const ev = Object.assign({ type: tipo, target: this, stopPropagation() { this.parada = true; } }, extra);
    this.entregar(ev);
  }

  entregar(ev) {
    (this.ouvintes[ev.type] || []).slice().forEach((fn) => fn(ev));
    if (ev.type === 'click' && typeof this.onclick === 'function') this.onclick(ev);
    if (ev.bubbles && !ev.parada && this.parentNode && this.parentNode.entregar) this.parentNode.entregar(ev);
  }

  click() { if (!this.disabled) this.dispatch('click'); }
  focus() {
    this.focado = true;
    if (globalThis.document) globalThis.document.activeElement = this;
  }

  // Seletores simples: ".classe", "etiqueta" ou "etiqueta.classe".
  corresponde(sel) {
    const m = /^([a-z0-9]*)((?:\.[\w-]+)*)$/i.exec(sel);
    if (!m) throw new Error('Seletor não suportado: ' + sel);
    if (m[1] && this.tagName !== m[1].toUpperCase()) return false;
    return m[2].split('.').filter(Boolean).every((c) => this.classes.has(c));
  }

  // Aceita combinadores de descendência ("a b").
  querySelectorAll(sel) {
    const partes = sel.trim().split(/\s+/);
    const raiz = this;
    const r = [];
    const casa = (no) => {
      if (!no.corresponde(partes[partes.length - 1])) return false;
      let k = partes.length - 2;
      for (let a = no.parentNode; k >= 0 && a && a !== raiz; a = a.parentNode) {
        if (a.corresponde && a.corresponde(partes[k])) k -= 1;
      }
      return k < 0;
    };
    const ir = (no) => no.children.forEach((f) => { if (casa(f)) r.push(f); ir(f); });
    ir(this);
    return r;
  }

  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}

const PROPRIEDADES = ['type', 'name', 'hidden', 'disabled', 'tabIndex', 'autocomplete', 'checked', 'value', 'href'];

// Serializa a árvore de forma estável (para comparar o DOM antes e depois de uma alteração).
function serializar(no) {
  if (no instanceof Texto) return JSON.stringify(no.data);
  const attrs = Object.keys(no.attrs).sort().map((k) => k + '=' + no.attrs[k]);
  PROPRIEDADES.forEach((p) => { if (no[p] !== undefined) attrs.push('.' + p + '=' + no[p]); });
  const cab = no.tagName.toLowerCase() + (no.className ? '.' + no.className.split(' ').join('.') : '') + (attrs.length ? '[' + attrs.join(',') + ']' : '');
  return '(' + cab + no.childNodes.map((n) => ' ' + serializar(n)).join('') + ')';
}

function criarDocumento() {
  const ouvintes = {};
  return {
    ouvintes,
    addEventListener(t, fn) { (ouvintes[t] = ouvintes[t] || []).push(fn); },
    removeEventListener(t, fn) { const l = ouvintes[t] || []; const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); },
    dispatch(t, extra) { const ev = Object.assign({ type: t }, extra); (ouvintes[t] || []).slice().forEach((fn) => fn(ev)); },
    createElement: (t) => new Elemento(t),
    createElementNS: (ns, t) => new Elemento(t),
    createTextNode: (t) => new Texto(t),
  };
}

module.exports = { criarDocumento, serializar, Elemento, Texto };
