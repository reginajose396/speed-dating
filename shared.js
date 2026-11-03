import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const $ = id => document.getElementById(id);
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

export function toast(t) {
  let el = document.getElementById("toast");
  if (!el) { el = document.createElement("div"); el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.textContent = t; el.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("show"), 2200);
}

function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Round-robin rotation: everyone meets everyone once. Odd counts get one break per round.
// Firestore can't store arrays inside arrays, so each round is {t: [{a, b}]}; b is null for a break.
export function makeRounds(ids, count) {
  let arr = shuffle(ids); if (arr.length % 2) arr.push(null);
  const n = arr.length, total = Math.min(count || n - 1, n - 1), out = [];
  for (let r = 0; r < total; r++) {
    const t = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i], b = arr[n - 1 - i];
      t.push(a ? { a, b } : { a: b, b: null });
    }
    out.push({ t });
    arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
  }
  return out;
}
export const maxRounds = n => n < 2 ? 0 : (n % 2 ? n : n - 1);

// Groups: random and even, each running its own rotation, so nobody meets anyone outside their group.
// Bigger groups come first and tables number straight through, so each group keeps the same tables all night.
export const maxGroups = n => Math.max(1, Math.min(8, Math.floor(n / 2)));
export const groupSizes = (n, groups) => Array.from({ length: groups }, (_, i) => Math.floor(n / groups) + (i < n % groups ? 1 : 0));
export const maxGroupRounds = (n, groups) => Math.max(...groupSizes(n, groups).map(maxRounds));
export function makeGroupRounds(ids, groups, count) {
  if (groups < 2) return makeRounds(ids, count);
  const pool = shuffle(ids);
  const each = groupSizes(ids.length, groups).map((size, g) => makeRounds(pool.splice(0, size), count).map(r => r.t.map(p => ({ ...p, g }))));
  return Array.from({ length: Math.max(...each.map(e => e.length)) }, (_, r) => ({ t: each.flatMap(e => e[r] || []) }));
}
export const groupName = g => `Group ${String.fromCharCode(65 + g)}`;
// Everyone has a spot in round 1, so that says which group they're in. Null if the night isn't split up.
export const groupOf = (rounds, uid) => (rounds?.[0]?.t || []).find(p => p.a === uid || p.b === uid)?.g ?? null;

// Who this person is seated with in a round: {partner, table} or {partner:null} for a break.
export function seatFor(round, uid) {
  let table = 0;
  for (const p of round.t) {
    if (p.a && p.b) { table++; if (p.a === uid) return { partner: p.b, table }; if (p.b === uid) return { partner: p.a, table }; }
    else if (p.a === uid) return { partner: null, table: null };
  }
  return { partner: null, table: null };
}

// Everyone this person has met, through round index `upTo` (inclusive).
export function metIds(rounds, uid, upTo = Infinity) {
  const s = [];
  (rounds || []).forEach((r, i) => { if (i > upTo) return; const { partner } = seatFor(r, uid); if (partner) s.push(partner); });
  return s;
}

// Mutual picks only. Both "date" = date match; otherwise a friend match.
export function computeMatches(ids, picksOf) {
  const out = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = ids[i], b = ids[j], pa = picksOf(a)[b], pb = picksOf(b)[a];
    if (pa && pb) out.push({ a, b, type: pa === "date" && pb === "date" ? "date" : "friend" });
  }
  return out;
}

export function pickListHTML(ids, guests, picks, note = "") {
  if (!ids.length) return `<p class="empty">${note || "Nobody to pick from yet."}</p>`;
  return `<ul class="pick-list">${ids.map(id => {
    const g = guests[id] || { name: "Someone who left" }, v = picks[id] || "";
    return `<li><span class="badge">${g.badge ?? "?"}</span>
      <span class="g-main"><span class="g-name">${esc(g.name)}</span>${g.pronouns ? ` <span class="g-meta">(${esc(g.pronouns)})</span>` : ""}</span>
      <span class="seg" role="group" aria-label="Pick for ${esc(g.name)}">
        ${[["date", "Date"], ["friend", "Friend"], ["", "Pass"]].map(([k, t]) => `<button type="button" data-pick="${id}" data-v="${k}" aria-pressed="${v === k}">${t}</button>`).join("")}
      </span></li>`;
  }).join("")}</ul>`;
}

// Keep countdowns ticking on any element with data-ends="<ms timestamp>".
setInterval(() => {
  document.querySelectorAll("[data-ends]").forEach(el => {
    const left = Number(el.dataset.ends) - Date.now();
    el.textContent = fmt(left);
    el.classList.toggle("done", left <= 0);
  });
}, 500);
