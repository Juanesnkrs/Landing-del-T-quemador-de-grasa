/* ===== CONFIGURACIÓN: editar solo aquí ===== */
const CONFIG = {
  whatsapp: "573208784337",          // confirmar que sigue activo
  pixelId: "",                       // ID de Pixel de Meta (vacío = desactivado)
  ga4Id: "",                         // ID de GA4, ej. G-XXXXXXX (vacío = desactivado)
  kits: [                            // price: precio de venta real en COP
    { n: 1, label: "1 frasco",  price: 89000  },
    { n: 2, label: "2 frascos", price: 149000 },
    { n: 3, label: "3 frascos", price: 199000 }
  ]
};
/* ============================================ */
const cop = v => "$" + v.toLocaleString("es-CO") + " COP";
const wa = t => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(t)}`;
const track = (name, data) => {
  try { if (window.fbq) fbq("track", name, data); } catch (e) {}
  try { if (window.gtag) gtag("event", name, data); } catch (e) {}
};
if (CONFIG.pixelId) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
  fbq("init", CONFIG.pixelId); fbq("track", "PageView");
}
if (CONFIG.ga4Id) {
  const s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + CONFIG.ga4Id; document.head.appendChild(s);
  window.dataLayer = window.dataLayer || []; window.gtag = function(){ dataLayer.push(arguments); };
  gtag("js", new Date()); gtag("config", CONFIG.ga4Id);
}
document.getElementById("y").textContent = new Date().getFullYear();
const sel = document.getElementById("kit");
CONFIG.kits.forEach(k => {
  const o = document.createElement("option");
  o.value = `${k.label} - ${cop(k.price)}`; o.textContent = `${k.label} (${cop(k.price)})`;
  o.dataset.n = k.n; if (k.n === 2) o.selected = true; sel.appendChild(o);
  const p = document.querySelector(`[data-price="${k.n}"]`);
  if (p) p.innerHTML = `${cop(k.price)}<div class="small" style="font:400 .85rem 'Source Sans 3',sans-serif">≈ ${cop(Math.round(k.price / k.n))} por frasco</div>`;
});
document.querySelectorAll("[data-kit]").forEach(a => a.addEventListener("click", () => {
  const o = [...sel.options].find(x => x.dataset.n === a.dataset.kit); if (o) sel.value = o.value;
  track("AddToCart", { content_name: o ? o.value : "" });
}));
document.querySelectorAll("[data-wa]").forEach(a => {
  a.href = wa(a.dataset.wa); a.target = "_blank"; a.rel = "noopener";
  a.addEventListener("click", () => track("Contact"));
});
document.querySelectorAll("[data-track]").forEach(a => a.addEventListener("click", () => track(a.dataset.track)));
document.getElementById("orderForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target, msg = document.getElementById("msg"), btn = f.querySelector("button");
  const d = Object.fromEntries(new FormData(f).entries());
  if (!f.checkValidity() || d["bot-field"]) { msg.textContent = "Completa todos los campos y acepta la política de privacidad."; return; }
  msg.textContent = ""; btn.disabled = true; btn.textContent = "Enviando…";
  const body = new URLSearchParams(new FormData(f)).toString();
  try { await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }); } catch (err) {}
  track("Lead", { content_name: d.kit });
  const texto = ["Hola, quiero confirmar mi pedido contraentrega:", "",
    `Kit: ${d.kit}`, `Nombre: ${d.nombre}`, `Teléfono: ${d.telefono}`,
    `Ciudad: ${d.ciudad}`, `Dirección: ${d.direccion}`, "", "Quedo atento a la confirmación del despacho."].join("\n");
  window.location.href = wa(texto);
});
/* Animaciones de entrada al hacer scroll */
(() => {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { threshold: .15 });
  els.forEach(e => io.observe(e));
  document.querySelectorAll("[data-count]").forEach(el => {
    const end = +el.dataset.count, o = new IntersectionObserver(([x]) => {
      if (!x.isIntersecting) return; o.disconnect();
      let n = 0; const t = setInterval(() => { n += Math.ceil(end / 25); if (n >= end) { n = end; clearInterval(t); } el.textContent = n; }, 40);
    }); o.observe(el);
  });
})();
