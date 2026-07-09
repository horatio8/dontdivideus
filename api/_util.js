/* Shared helpers for the Don't Divide Us first-party data spine.
   Dependency-free: Node built-ins only (crypto + global fetch). */
const crypto = require("crypto");

const ALLOW = [
  "https://dontdivideus.vercel.app",
  "https://dontdivide.com.au",
  "https://www.dontdivide.com.au"
];
function allowOrigin(req) {
  const o = req.headers.origin || "";
  if (ALLOW.indexOf(o) !== -1) return o;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(o)) return o; // preview hosts
  return ALLOW[0];
}
function setCors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", allowOrigin(req));
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
}

function readRaw(req) {
  return new Promise(function (resolve, reject) {
    var data = "";
    req.on("data", function (c) { data += c; });
    req.on("end", function () { resolve(data); });
    req.on("error", reject);
  });
}
async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  var raw = await readRaw(req);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (e) { return {}; }
}

function uuid() { return crypto.randomUUID(); }
function sha256(s) { return crypto.createHash("sha256").update(String(s)).digest("hex"); }

function normEmail(e) { return String(e || "").trim().toLowerCase(); }
function normPhone(p) {
  if (!p) return "";
  var s = String(p).trim();
  var plus = s[0] === "+";
  s = s.replace(/[^\d]/g, "");
  if (plus) return "+" + s;
  if (/^0\d{9}$/.test(s)) return "+61" + s.slice(1); // AU: 0-led 10 digits
  if (/^61\d{9}$/.test(s)) return "+" + s;            // AU: 61-led 11 digits
  return s ? "+" + s : "";
}

var RC_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // Crockford, no 0/O/1/I/L
function referralCode(n) {
  n = n || 6;
  var b = crypto.randomBytes(n), out = "";
  for (var i = 0; i < n; i++) out += RC_ALPHABET[b[i] % RC_ALPHABET.length];
  return out;
}

// Stripe form encoding (nested → bracket notation)
function toFormBody(obj) {
  var parts = [];
  function enc(k, v) { parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(v)); }
  function walk(o, pfx) {
    Object.keys(o).forEach(function (k) {
      var v = o[k], key = pfx ? pfx + "[" + k + "]" : k;
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) v.forEach(function (it, i) {
        if (it && typeof it === "object") walk(it, key + "[" + i + "]"); else enc(key + "[" + i + "]", it);
      });
      else if (typeof v === "object") walk(v, key);
      else enc(key, v);
    });
  }
  walk(obj, "");
  return parts.join("&");
}
async function stripeGet(path) {
  var key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY unset");
  var r = await fetch("https://api.stripe.com/v1/" + path, { headers: { Authorization: "Bearer " + key } });
  return await r.json();
}
async function stripePost(path, body) {
  var key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY unset");
  var r = await fetch("https://api.stripe.com/v1/" + path, {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/x-www-form-urlencoded" },
    body: toFormBody(body)
  });
  return await r.json();
}

function configured() { return !!(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID); }

module.exports = {
  setCors, readRaw, readJson, uuid, sha256, normEmail, normPhone,
  referralCode, toFormBody, stripeGet, stripePost, configured
};
