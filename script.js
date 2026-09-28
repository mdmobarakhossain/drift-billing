/* ---------------- helpers ---------------- */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const BN = "০১২৩৪৫৬৭৮৯";
const norm = s => String(s ?? "").replace(/[০-৯]/g, d => BN.indexOf(d));
const num = v => { const n = parseFloat(norm(v).replace(/,/g, "")); return isNaN(n) ? 0 : n; };
const rupee = n => "₹" + (Number(n)||0).toLocaleString("en-IN", {minimumFractionDigits:2, maximumFractionDigits:2});
const rupee0 = n => "₹" + Math.round(Number(n)||0).toLocaleString("en-IN");
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } }
};
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

function toast(msg){
  const t = $("toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ---------------- shop settings ---------------- */
const DEFAULT_SHOP = {
  name:"DRIFT", code:"DRF",
  tagline:"Car Accessories • Premium Quality • Style Your Ride",
  address:"Jodthbhim, Newtown, Baligari, West Bengal - 700160",
  phone:"+91 81588 66716", email:"", gstin:"",
  logo:"",
  notes:"Thank you for shopping with Drift!\nGoods once sold are subject to store policy.\nWarranty, if any, is as per the manufacturer's terms.\nPlease keep this bill for future reference.",
  thanks:"Thank you • Drive safe • Visit again"
};
let shop = Object.assign({}, DEFAULT_SHOP, store.get("shop2", {}));

const CAR_SVG = `<svg viewBox="0 0 64 64" aria-hidden="true">
<path d="M4 27h13M1 33h14M6 39h11" stroke="#12b5e5" stroke-width="2.6" stroke-linecap="round" fill="none"/>
<g transform="translate(33 30) skewX(-10) translate(-33 -30)"><path fill-rule="evenodd" fill="#fff" d="M20 13h16c11 0 18 7 18 16s-7 16-18 16H20zM29 21v16h6c5.500 0 9-3 9-8s-3.500-8-9-8z"/></g>
<path d="M16 50c9 3.500 24 3.500 33 0" stroke="#ff4d2e" stroke-width="3.200" stroke-linecap="round" fill="none"/>
<circle cx="50" cy="50" r="1.800" fill="#ffc21a"/>
</svg>`;
const ICON = {
  pin:  `<span class="ic i-pin"><svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.500A2.500 2.500 0 1 1 12 6.500a2.500 2.500 0 0 1 0 5z"/></svg></span>`,
  wa:   `<span class="ic i-wa"><svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-7.700 13.600L3 21l4.500-1.200A9 9 0 1 0 12 3z" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M9.200 7.800c-.5.500-.8 1.300-.3 2.500.8 1.800 2.200 3.200 4 4 1.200.5 2 .2 2.500-.3l.5-.9-2-1-.8.7c-1-.4-2-1.400-2.400-2.400l.7-.8-1-2z" fill="#fff"/></svg></span>`,
  call: `<span class="ic i-call"><svg viewBox="0 0 24 24" fill="#fff"><path d="M6.600 10.800a15 15 0 0 0 6.600 6.600l2.200-2.200a1 1 0 0 1 1-.25 11.400 11.400 0 0 0 3.600.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.500a1 1 0 0 1 1 1c0 1.300.2 2.500.6 3.600a1 1 0 0 1-.25 1z"/></svg></span>`,
  mail: `<span class="ic i-mail"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><rect x="3" y="5.500" width="18" height="13" rx="2"/><path d="M3.500 7l8.500 6.500L20.500 7"/></svg></span>`
};
function monogram(){ return (shop.name.trim()[0] || "S").toUpperCase(); }
function setLogo(el, src){
  el.innerHTML = src ? `<img alt="" src="${src}">` : CAR_SVG;
}
function applyShop(){
  const nm = [...shop.name.trim()]; $("shopName").innerHTML = nm.length ? `<span class="d">${esc(nm[0])}</span>${esc(nm.slice(1).join(""))}` : "";
  $("shopTag").textContent = shop.tagline;
  const chips = [];
  if(shop.address) chips.push(`<span class="chip2">${ICON.pin}${esc(shop.address)}</span>`);
  if(shop.phone) chips.push(`<span class="chip2">${ICON.wa}${ICON.call}${esc(shop.phone)}</span>`);
  if(shop.email) chips.push(`<span class="chip2">${ICON.mail}${esc(shop.email)}</span>`);
  if(shop.gstin) chips.push(`<span class="chip2 gstc">GSTIN: ${esc(shop.gstin)}</span>`);
  $("contact").innerHTML = chips.join("");
  setLogo($("logo"), shop.logo);
  $("notesList").innerHTML = shop.notes.split("\n").filter(l => l.trim()).map(l => `<li>${esc(l)}</li>`).join("");
  $("thanks").textContent = shop.thanks;
  $("wmText").textContent = shop.name;
  $("paper").style.setProperty("--wmsize", Math.max(70, Math.min(190, 950 / Math.max(shop.name.length, 1))) + "px");
  document.title = shop.name + " – Billing";
}

/* ---------------- data ---------------- */
let bills = store.get("bills", []);
let counter = store.get("counter", 0);
let pays = [];            // payments received for the bill on screen
let filter = "all";
let editing = false;      // true once the bill on screen is saved
let dirty = false;
const ROWS = 12;
const rates = {};

const sumPays = a => Math.round(a.reduce((s, p) => s + p.amt, 0) * 100) / 100;
function mkPay(amt, mode){ const d = new Date(); return {amt: Math.round(amt * 100) / 100, mode: mode || $("mode").value, ts: d.getTime(), date: fmtDate(d), time: fmtTime(d)}; }
function legacyPays(b){
  const amt = b.paid > 0 ? Math.min(b.paid, b.total) : b.total;
  return amt > 0 ? [{amt, mode: b.mode, ts: b.ts, date: b.date, time: b.time}] : [];
}
const billPaid = b => Array.isArray(b.payments) ? sumPays(b.payments) : sumPays(legacyPays(b));
const billDue = b => Math.max(0, Math.round((b.total - billPaid(b)) * 100) / 100);
function currentPays(total){
  const raw = $("paid").value.trim();
  if(!editing){
    const amt = raw === "" ? total : Math.min(num(raw), total);   // extra cash = change returned
    return amt > 0 ? [mkPay(amt)] : [];
  }
  if(raw === "") return pays;
  const v = Math.min(num(raw), total);
  if(Math.abs(v - sumPays(pays)) < 0.005) return pays;
  return v > 0 ? [mkPay(v)] : [];
}

function nextNo(){ return `${shop.code || "INV"}-${String(counter + 1).padStart(5, "0")}`; }
function buildRates(){
  Object.keys(rates).forEach(k => delete rates[k]);
  const names = new Set();
  [...bills].reverse().forEach(b => (b.items||[]).forEach(i => { if(i.name){ rates[i.name.toLowerCase()] = i.rate; names.add(i.name); } }));
  $("prods").innerHTML = [...names].map(n => `<option value="${esc(n)}">`).join("");
}

/* ---------------- rows ---------------- */
function makeRow(){
  const tr = document.createElement("tr");
  tr.className = "empty";
  tr.innerHTML = `<td class="sl"></td>
    <td><input class="name" list="prods" autocomplete="off" placeholder="Item name"></td>
    <td><input class="n qty" inputmode="decimal"></td>
    <td><input class="n rate" inputmode="decimal"></td>
    <td class="amt"></td>
    <td class="np"><button class="x" type="button" tabindex="-1" title="Remove row">×</button></td>`;
  return tr;
}
function buildRows(n){
  const tb = $("rows"); tb.innerHTML = "";
  for(let i = 0; i < n; i++) tb.appendChild(makeRow());
}
function addRow(focus = true){
  const tr = makeRow(); tr.classList.add("added"); $("rows").appendChild(tr);
  if(focus) tr.querySelector(".name").focus();
  return tr;
}
$("addRow").onclick = () => addRow();
$("rows").addEventListener("click", e => {
  const b = e.target.closest(".x"); if(!b) return;
  const tr = b.closest("tr");
  if($("rows").children.length <= 1){ tr.querySelectorAll("input").forEach(i => i.value = ""); }
  else { tr.classList.add("gone"); setTimeout(() => { tr.remove(); calc(); }, reduced ? 0 : 180); }
  dirty = true; calc();
});
/* Enter key moves: name → qty → rate → next row */
$("rows").addEventListener("keydown", e => {
  if(e.key !== "Enter" || e.target.tagName !== "INPUT") return;
  e.preventDefault();
  const all = [...$("rows").querySelectorAll("input")];
  const i = all.indexOf(e.target);
  if(all[i+1]) all[i+1].focus(); else addRow();
});
/* auto-fill qty & rate for products used before */
$("rows").addEventListener("change", e => {
  if(!e.target.classList.contains("name")) return;
  const key = e.target.value.trim().toLowerCase();
  if(key in rates){
    const tr = e.target.closest("tr");
    if(!tr.querySelector(".rate").value) tr.querySelector(".rate").value = rates[key];
    if(!tr.querySelector(".qty").value) tr.querySelector(".qty").value = 1;
    calc();
  }
});

/* ---------------- calculations ---------------- */
let shown = 0, raf = 0, totalNow = 0;
function animateTotal(to){
  cancelAnimationFrame(raf);
  totalNow = to;
  if(reduced){ shown = to; $("total").textContent = rupee(to); return; }
  const from = shown, t0 = performance.now(), dur = 380;
  (function step(t){
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    shown = from + (to - from) * e;
    $("total").textContent = rupee(shown);
    if(p < 1) raf = requestAnimationFrame(step); else shown = to;
  })(t0);
}
function calc(){
  let sub = 0, nItems = 0, qtyTot = 0;
  document.querySelectorAll("#rows tr").forEach(tr => {
    const q = num(tr.querySelector(".qty").value), r = num(tr.querySelector(".rate").value);
    const a = q * r; sub += a;
    tr.querySelector(".amt").textContent = a ? a.toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2}) : "";
    const filled = !!(tr.querySelector(".name").value.trim() || a);
    tr.classList.toggle("empty", !filled);
    if(filled){ nItems++; qtyTot += q; }
  });
  $("itemSum").innerHTML = nItems ? `<b>${nItems}</b> item${nItems > 1 ? "s" : ""} &nbsp;•&nbsp; Total qty <b>${+qtyTot.toFixed(2)}</b>` : "";
  const dv = num($("discount").value), du = $("discUnit").value;
  $("discount").closest(".row").classList.toggle("zero", !dv);
  $("offer").closest(".row").classList.toggle("zero", !num($("offer").value));
  $("tax").closest(".row").classList.toggle("zero", !num($("tax").value));
  const discAmt = du === "%" ? sub * dv / 100 : dv;
  const offer = num($("offer").value);
  const taxable = Math.max(0, sub - discAmt - offer);
  const tv = num($("tax").value), tu = $("taxUnit").value;
  const taxAmt = tu === "%" ? taxable * tv / 100 : tv;
  const total = Math.round((taxable + taxAmt) * 100) / 100;

  $("subtotal").textContent = rupee(sub);
  $("discHint").textContent = du === "%" && dv ? "− " + rupee(discAmt) : "";
  $("taxHint").textContent = tu === "%" && tv ? "+ " + rupee(taxAmt) : "";
  if(total !== totalNow || !$("total").textContent.trim() ) animateTotal(total);

  const raw = $("paid").value.trim();
  const eff = raw === "" ? (editing ? sumPays(pays) : total) : num(raw);
  const due = Math.max(0, Math.round((total - eff) * 100) / 100);
  const bal = $("balance");
  if(total <= 0){ $("balLabel").textContent = "Balance"; bal.textContent = "—"; bal.className = ""; }
  else if(due > 0.004){ $("balLabel").textContent = "Balance due"; bal.textContent = rupee(due); bal.className = "due"; }
  else if(raw !== "" && num(raw) > total + 0.004){ $("balLabel").textContent = "Change to return"; bal.textContent = rupee(num(raw) - total); bal.className = ""; }
  else { $("balLabel").textContent = "Status"; bal.textContent = "Fully paid ✓"; bal.className = "ok"; }

  const showPay = editing && due > 0.004;
  $("dueBox").hidden = !showPay;
  if(showPay){
    $("dueAmt").textContent = rupee(due);
    const r = $("rcv").value.trim();
    $("payBtn").textContent = "Pay " + rupee(r === "" ? due : Math.min(num(r), due));
  }
  $("payHist").innerHTML = editing && pays.length
    ? "<b>Payments received</b><br>" + pays.map(p => `${esc(p.date)} &nbsp;•&nbsp; ${rupee(p.amt)} (${esc(p.mode)})`).join("<br>") : "";
  return {sub, discAmt, offer, taxAmt, total, due};
}

/* single listener for every field on the bill (works with Bengali & English keyboards) */
function onEdit(e){
  const el = e.target;
  if(el.classList && el.classList.contains("n") && /[০-৯]/.test(el.value)) el.value = norm(el.value);
  if(el.id === "cCar"){ const p = el.selectionStart; el.value = el.value.toUpperCase(); el.setSelectionRange(p, p); }
  if(e.isTrusted && el.id !== "rcv" && el.id !== "rcvMode"){ dirty = true; updateStatus(); }
  calc();
}
["input","change","keyup"].forEach(ev => $("paper").addEventListener(ev, onEdit));

/* ---------------- date / time / status ---------------- */
const fmtDate = d => d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}).replace(/ /g,"-");
const fmtTime = d => d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
function tick(){ if(editing) return; const d = new Date(); $("billDate").textContent = fmtDate(d); $("billTime").textContent = fmtTime(d); }
setInterval(tick, 1000);
function updateStatus(){
  const s = $("status");
  if(editing && !dirty){ s.textContent = "Saved ✓"; s.className = "saved"; }
  else if(editing){ s.textContent = "Unsaved changes"; s.className = ""; }
  else { s.textContent = "Draft"; s.className = ""; }
}

/* ---------------- new / load / save / print ---------------- */
function newBill(){
  buildRows(ROWS);
  ["cName","cPhone","cAddr","cCar","discount","offer","tax","paid"].forEach(id => $(id).value = "");
  $("mode").value = "Cash"; $("discUnit").value = "₹"; $("taxUnit").value = "₹";
  $("billNo").textContent = nextNo();
  pays = []; $("rcv").value = "";
  editing = false; dirty = false; shown = 0; totalNow = -1;
  tick(); calc(); updateStatus();
}
function loadBill(b){
  const n = Math.max(ROWS, b.items.length);
  buildRows(n);
  [...$("rows").children].forEach((tr, i) => {
    const it = b.items[i]; if(!it) return;
    tr.querySelector(".name").value = it.name;
    tr.querySelector(".qty").value = it.qty || "";
    tr.querySelector(".rate").value = it.rate || "";
  });
  $("cName").value = b.customer.name === "Walk-in Customer" ? "" : b.customer.name;
  $("cPhone").value = b.customer.phone || ""; $("cAddr").value = b.customer.address || ""; $("cCar").value = b.customer.carNo || "";
  $("discount").value = b.discountRaw?.v || ""; $("discUnit").value = b.discountRaw?.u || "₹";
  $("offer").value = b.offer || "";
  $("tax").value = b.taxRaw?.v || ""; $("taxUnit").value = b.taxRaw?.u || "₹";
  $("mode").value = b.mode; $("rcvMode").value = b.mode; $("rcv").value = "";
  pays = Array.isArray(b.payments) ? b.payments.map(p => ({...p})) : legacyPays(b);
  $("paid").value = String(sumPays(pays));
  $("billNo").textContent = b.billNo; $("billDate").textContent = b.date; $("billTime").textContent = b.time;
  editing = true; dirty = false; shown = 0; totalNow = -1;
  calc(); updateStatus();
}
function collect(){
  const c = calc();
  const payments = currentPays(c.total);
  const items = [];
  document.querySelectorAll("#rows tr").forEach(tr => {
    const name = tr.querySelector(".name").value.trim();
    const qty = num(tr.querySelector(".qty").value), rate = num(tr.querySelector(".rate").value);
    if(name || qty * rate) items.push({name, qty, rate, amount: qty * rate});
  });
  const now = new Date();
  return {
    billNo: $("billNo").textContent, date: $("billDate").textContent, time: $("billTime").textContent,
    ts: now.getTime(),
    customer: {name: $("cName").value.trim() || "Walk-in Customer", phone: $("cPhone").value.trim(), address: $("cAddr").value.trim(), carNo: $("cCar").value.trim().toUpperCase()},
    items, subtotal: c.sub, discount: c.discAmt, offer: c.offer, tax: c.taxAmt, total: c.total,
    discountRaw: {v: num($("discount").value), u: $("discUnit").value},
    taxRaw: {v: num($("tax").value), u: $("taxUnit").value},
    mode: $("mode").value, paid: sumPays(payments),
    due: Math.max(0, Math.round((c.total - sumPays(payments)) * 100) / 100), payments
  };
}
function persist(){ return store.set("bills", bills) && store.set("counter", counter); }
function save(silent){
  if(editing && !dirty){ if(!silent) toast("Already saved"); return true; }
  const b = collect();
  if(!b.items.length){ toast("Add at least one item first"); return false; }
  const idx = bills.findIndex(x => x.billNo === b.billNo);
  if(idx >= 0){ b.ts = bills[idx].ts; bills[idx] = b; }
  else { bills.unshift(b); counter++; }
  if(!persist()){ toast("Could not save — allow browser storage for this page"); return false; }
  editing = true; dirty = false; pays = b.payments; $("paid").value = String(b.paid);
  tick(); calc(); updateStatus(); buildRates(); refreshCount();
  const st = $("stamp"), isDue = b.due > 0.004;
  st.textContent = isDue ? "DUE" : "PAID"; st.classList.toggle("due", isDue);
  st.classList.remove("go"); void st.offsetWidth; st.classList.add("go");
  toast(isDue ? `Saved ${b.billNo} • Due ${rupee(b.due)}` : `Saved ${b.billNo} ✓ Fully paid`);
  return true;
}
$("saveBtn").onclick = () => save();
$("payBtn").onclick = () => {
  const c = calc(), raw = $("rcv").value.trim();
  const amt = raw === "" ? c.due : Math.min(num(raw), c.due);
  if(!(amt > 0)){ toast("Enter the amount received"); return; }
  pays = [...pays, mkPay(amt, $("rcvMode").value)];
  $("paid").value = String(sumPays(pays)); $("rcv").value = "";
  dirty = true;
  if(save(true)){
    const after = calc();
    toast(after.due > 0.004 ? `${rupee(amt)} received • ${rupee(after.due)} still due` : `${rupee(amt)} received • Bill fully paid ✓`);
  }
};
$("newBtn").onclick = () => {
  if(dirty && !confirm("This bill has unsaved changes. Start a new bill anyway?")) return;
  newBill(); setTab("bill"); toast("New bill ready");
};
$("printBtn").onclick = () => { if(save(true)) { $("total").textContent = rupee(totalNow); setTimeout(() => window.print(), 60); } };
window.addEventListener("beforeprint", () => { cancelAnimationFrame(raf); $("total").textContent = rupee(totalNow); });

$("size").onchange = e => {
  const v = e.target.value;
  $("pageSize").textContent = v === "80mm" ? "@page{size:80mm auto;margin:2mm}" : `@page{size:${v};margin:8mm}`;
  $("paper").style.maxWidth = v === "80mm" ? "340px" : "860px";
  $("paper").classList.toggle("narrow", v === "80mm");
};

/* ---------------- tabs ---------------- */
function moveInd(){
  const b = document.querySelector(".tabs button.on");
  $("ind").style.left = b.offsetLeft + "px"; $("ind").style.width = b.offsetWidth + "px";
}
function setTab(name){
  document.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === name));
  $("tab-bill").hidden = name !== "bill"; $("tab-view").hidden = name !== "view";
  $("saveBtn").hidden = $("printBtn").hidden = $("size").hidden = name !== "bill";
  moveInd();
  if(name === "view") renderView();
}
document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => setTab(b.dataset.tab));
addEventListener("resize", moveInd);
if(document.fonts) document.fonts.ready.then(moveInd);

/* ---------------- saved bills view ---------------- */
function refreshCount(){ $("cnt").textContent = bills.length; }
function renderView(){
  const q = $("q").value.trim().toLowerCase();
  const list = bills.filter(b => (filter === "all" || (filter === "due") === (billDue(b) > 0.004)) && (!q ||
    b.billNo.toLowerCase().includes(q) || b.customer.name.toLowerCase().includes(q) ||
    (b.customer.phone||"").includes(q) || (b.customer.carNo||"").toLowerCase().includes(q) || b.items.some(i => i.name.toLowerCase().includes(q))));

  const now = new Date();
  let tS=0,tN=0,mS=0,mN=0,aS=0;
  bills.forEach(b => {
    const d = new Date(b.ts); aS += b.total;
    if(d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth()){ mS += b.total; mN++;
      if(d.getDate()===now.getDate()){ tS += b.total; tN++; } }
  });
  $("stToday").textContent = rupee0(tS); $("stTodayN").textContent = tN + (tN===1?" bill":" bills");
  $("stMonth").textContent = rupee0(mS); $("stMonthN").textContent = mN + (mN===1?" bill":" bills");
  let dS = 0, dN = 0;
  bills.forEach(b => { const d = billDue(b); if(d > 0.004){ dS += d; dN++; } });
  $("stDue").textContent = rupee0(dS); $("stDueN").textContent = dN + (dN === 1 ? " bill pending" : " bills pending");
  $("fAll").textContent = bills.length; $("fDue").textContent = dN; $("fPaid").textContent = bills.length - dN;
  $("stAll").textContent = rupee0(aS); $("stAllN").textContent = bills.length + (bills.length===1?" bill":" bills");

  $("billList").innerHTML = list.map((b, i) => {
    const due = billDue(b), paid = billPaid(b), isDue = due > 0.004;
    const digits = String(b.customer.phone || "").replace(/\D/g, "");
    const wa = digits.length >= 10 ? "91" + digits.slice(-10) : "";
    const who = b.customer.name === "Walk-in Customer" ? "Hello" : "Hello " + b.customer.name;
    const msg = `${who}, a gentle reminder from ${shop.name}: your due amount for bill ${b.billNo} is ${rupee(due)}. Please pay at your convenience. Thank you! ${shop.phone || ""}`;
    const status = isDue
      ? `<span class="chip due">DUE ${rupee(due)}</span><br><small style="color:var(--muted)">Paid ${rupee(paid)} of ${rupee(b.total)}</small>`
      : `<span class="chip ok">PAID ✓</span><br><small style="color:var(--muted)">${esc(b.mode)}</small>`;
    return `
    <tr class="${isDue ? "due" : "paid"}" style="animation-delay:${Math.min(i,12)*30}ms">
      <td class="no">${esc(b.billNo)}</td>
      <td>${esc(b.date)}<br><small style="color:var(--muted)">${esc(b.time)}</small></td>
      <td>${esc(b.customer.name)}${b.customer.carNo ? `<br><span class="plate-chip"><i>IND</i><b>${esc(b.customer.carNo)}</b></span>` : ""}<br><small style="color:var(--muted)">${b.items.length} item${b.items.length===1?"":"s"}${b.customer.phone ? " • " + esc(b.customer.phone) : ""}</small></td>
      <td>${status}</td>
      <td class="r">${rupee(b.total)}</td>
      <td style="white-space:nowrap;text-align:right">
        <button class="btn small ${isDue ? "green" : ""}" data-open="${esc(b.billNo)}">${isDue ? "Open &amp; Pay" : "Open"}</button>
        ${isDue && wa ? `<a class="btn small wa" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${encodeURIComponent(msg)}">Remind</a>` : ""}
        <button class="btn small danger" data-del="${esc(b.billNo)}">Delete</button>
      </td>
    </tr>`;
  }).join("");
  $("emptyMsg").hidden = list.length > 0;
  $("emptyMsg").textContent = bills.length ? (filter === "due" && !q ? "No pending dues 🎉" : "No bill matches your search.") : "No bills yet. Save your first bill and it will show up here.";
}
$("q").addEventListener("input", renderView);
document.querySelectorAll(".filters button").forEach(btn => btn.onclick = () => {
  filter = btn.dataset.f;
  document.querySelectorAll(".filters button").forEach(x => x.classList.toggle("on", x === btn));
  renderView();
});
$("billList").addEventListener("click", e => {
  const o = e.target.closest("[data-open]"), d = e.target.closest("[data-del]");
  if(o){ const b = bills.find(x => x.billNo === o.dataset.open); if(b){ loadBill(b); setTab("bill"); window.scrollTo({top:0,behavior:"smooth"}); } }
  if(d && confirm("Delete bill " + d.dataset.del + "? This cannot be undone.")){
    bills = bills.filter(x => x.billNo !== d.dataset.del); persist(); buildRates(); refreshCount(); renderView(); toast("Bill deleted");
  }
});

/* ---------------- backup / restore / excel ---------------- */
function download(name, text, type){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], {type}));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
const stamp = () => new Date().toISOString().slice(0,10);
$("bkBtn").onclick = () => {
  download(`billing-backup-${stamp()}.json`, JSON.stringify({version:1, shop, bills, counter}, null, 1), "application/json");
  toast("Backup downloaded");
};
$("csvBtn").onclick = () => {
  const q = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["Bill No","Date","Time","Customer","Phone","Items","Subtotal","Discount","Offer","Tax","Total","Payment","Paid","Due"];
  const rows = bills.map(b => [b.billNo,b.date,b.time,b.customer.name,b.customer.phone,
    b.items.map(i => `${i.name} x${i.qty}`).join("; "),b.subtotal,b.discount,b.offer,b.tax,b.total,b.mode,billPaid(b),billDue(b)].map(q).join(","));
  download(`bills-${stamp()}.csv`, "\uFEFF" + [head.map(q).join(","), ...rows].join("\r\n"), "text/csv;charset=utf-8");
};
$("rsBtn").onclick = () => $("rsFile").click();
$("rsFile").onchange = e => {
  const f = e.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = () => {
    try{
      const d = JSON.parse(r.result);
      if(!Array.isArray(d.bills)) throw 0;
      const map = new Map(bills.map(b => [b.billNo, b]));
      d.bills.forEach(b => map.set(b.billNo, b));
      bills = [...map.values()].sort((a,b) => b.ts - a.ts);
      counter = Math.max(counter, d.counter || 0, ...bills.map(b => parseInt(String(b.billNo).split("-").pop(),10) || 0));
      if(d.shop){ shop = Object.assign({}, DEFAULT_SHOP, d.shop); store.set("shop2", shop); applyShop(); }
      persist(); buildRates(); refreshCount(); renderView();
      if(!editing) $("billNo").textContent = nextNo();
      toast("Restored " + d.bills.length + " bills");
    }catch(err){ toast("This is not a valid backup file"); }
    e.target.value = "";
  };
  r.readAsText(f);
};

/* ---------------- settings dialog ---------------- */
let tmpLogo = "";
const fields = {sName:"name", sCode:"code", sTag:"tagline", sAddr:"address", sPhone:"phone", sEmail:"email", sGst:"gstin", sNotes:"notes", sThanks:"thanks"};
$("setBtn").onclick = () => {
  Object.entries(fields).forEach(([id, k]) => $(id).value = shop[k] || "");
  tmpLogo = shop.logo; setLogo($("sLogoPrev"), tmpLogo);
  $("dlg").showModal();
};
$("sCancel").onclick = () => $("dlg").close();
$("sLogoDel").onclick = () => { tmpLogo = ""; setLogo($("sLogoPrev"), ""); };
$("sLogoFile").onchange = e => {
  const f = e.target.files[0]; if(!f) return;
  const img = new Image();
  img.onload = () => {
    const s = Math.min(1, 300 / Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = img.width * s; c.height = img.height * s;
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    tmpLogo = c.toDataURL("image/png"); setLogo($("sLogoPrev"), tmpLogo);
  };
  img.src = URL.createObjectURL(f);
};
$("sSave").onclick = () => {
  Object.entries(fields).forEach(([id, k]) => shop[k] = $(id).value.trim());
  shop.code = (shop.code || "INV").toUpperCase().replace(/[^A-Z0-9]/g, "");
  shop.logo = tmpLogo;
  if(!store.set("shop2", shop)) toast("Could not store shop details in this browser");
  applyShop(); setLogo($("sLogoPrev"), tmpLogo);
  if(!editing) $("billNo").textContent = nextNo();
  $("dlg").close(); toast("Shop details saved");
};

/* ---------------- start ---------------- */
applyShop(); buildRates(); refreshCount(); newBill(); setTab("bill");
try{ navigator.storage && navigator.storage.persist && navigator.storage.persist(); }catch(e){}
