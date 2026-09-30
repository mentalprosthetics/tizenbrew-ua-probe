#!/usr/bin/env node
/*
 * TizenBrew module validator (no runtime deps except acorn for the ES5 check).
 *
 * Checks:
 *  - package.json parses, has no UTF-8 BOM (TizenBrew reports "Unknown Module"
 *    on a BOM-prefixed package.json), and carries the fields TizenBrew needs
 *    for its packageType (see reisxd/TizenBrew docs/MODULES.md).
 *  - Referenced files (appPath / main / serviceFile) exist.
 *  - HTML/JS/JSON/MD files have no BOM.
 *  - Every inline <script> in app/*.html and every *.js file parses as ES5
 *    (old Tizen Chromium, e.g. M47 on Tizen 3, has no let/const/arrows/etc).
 *
 * Usage: npm i --prefix /tmp/lint acorn@8 && NODE_PATH=/tmp/lint/node_modules node scripts/validate.js
 */
'use strict';
var fs = require('fs');
var path = require('path');

var root = process.cwd();
var errors = [];
var warnings = [];
function err(m) { errors.push(m); }
function warn(m) { warnings.push(m); }

var acorn;
try { acorn = require('acorn'); } catch (e) {
  console.error('acorn not found: npm i --prefix /tmp/lint acorn@8 and set NODE_PATH=/tmp/lint/node_modules');
  process.exit(2);
}

function hasBom(buf) { return buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf; }

function walk(dir, out) {
  fs.readdirSync(dir).forEach(function (name) {
    if (name === '.git' || name === 'node_modules') return;
    var p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out); else out.push(p);
  });
  return out;
}

function rel(p) { return path.relative(root, p).split(path.sep).join('/'); }

function checkEs5(code, label, lineOffset) {
  try {
    acorn.parse(code, { ecmaVersion: 5, sourceType: 'script', locations: true });
  } catch (e) {
    var line = e.loc ? e.loc.line + (lineOffset || 0) : '?';
    err(label + ':' + line + ' not valid ES5 (old Tizen Chromium): ' + e.message);
  }
}

// ---- package.json -------------------------------------------------------
var pkgPath = path.join(root, 'package.json');
var pkg = null;
if (!fs.existsSync(pkgPath)) {
  err('package.json missing');
} else {
  var raw = fs.readFileSync(pkgPath);
  if (hasBom(raw)) err('package.json starts with a UTF-8 BOM (TizenBrew shows "Unknown Module")');
  try { pkg = JSON.parse(raw.toString('utf8').replace(/^﻿/, '')); } catch (e) { err('package.json invalid JSON: ' + e.message); }
}

function need(field, type) {
  if (!pkg) return;
  var v = pkg[field];
  if (v === undefined || v === null || v === '') { err('package.json: missing "' + field + '"'); return; }
  if (type === 'array' ? !Array.isArray(v) : typeof v !== type) err('package.json: "' + field + '" should be ' + type);
}
function fileMustExist(field) {
  if (!pkg || typeof pkg[field] !== 'string' || !pkg[field]) return;
  var p = pkg[field].split(/[?#]/)[0];
  if (!fs.existsSync(path.join(root, p))) err('package.json: "' + field + '" points to missing file ' + p);
}

if (pkg) {
  need('name', 'string');
  need('version', 'string');
  need('appName', 'string');
  if (pkg.keys !== undefined && !Array.isArray(pkg.keys)) err('package.json: "keys" should be an array');
  if (pkg.packageType === 'app') {
    need('appPath', 'string');
    fileMustExist('appPath');
    if (pkg.websiteURL) warn('package.json: "websiteURL" is ignored for packageType "app"');
  } else if (pkg.packageType === 'mods') {
    need('websiteURL', 'string');
    if (pkg.websiteURL && !/^https?:\/\//.test(pkg.websiteURL)) err('package.json: websiteURL must be http(s)');
    need('main', 'string');
    fileMustExist('main');
  } else {
    err('package.json: packageType must be "app" or "mods" (got ' + JSON.stringify(pkg.packageType) + ')');
  }
  fileMustExist('serviceFile');
  if (Array.isArray(pkg.files)) {
    pkg.files.forEach(function (f) {
      if (!fs.existsSync(path.join(root, f))) err('package.json: "files" entry missing on disk: ' + f);
    });
  }
}

// ---- every file ---------------------------------------------------------
var files = walk(root, []);
files.forEach(function (f) {
  var r = rel(f);
  if (/^(scripts|\.github)\//.test(r)) return; // tooling, runs on Node not the TV
  var ext = path.extname(f).toLowerCase();
  if (['.html', '.htm', '.js', '.json', '.md', '.css'].indexOf(ext) < 0) return;
  var buf = fs.readFileSync(f);
  if (hasBom(buf)) err(r + ': starts with a UTF-8 BOM');
  var text = buf.toString('utf8').replace(/^﻿/, '');

  if (ext === '.js') checkEs5(text, r, 0);

  if (ext === '.html' || ext === '.htm') {
    if (!/^\s*<!DOCTYPE html>/i.test(text)) warn(r + ': no <!DOCTYPE html> (quirks mode)');
    if (!/<meta[^>]+charset/i.test(text)) warn(r + ': no <meta charset>');
    // Optional on-screen version marker must match package.json (stale-CDN detector).
    var vm = /\bvar\s+VERSION\s*=\s*['"]([^'"]+)['"]/.exec(text);
    if (vm && pkg && vm[1] !== pkg.version) err(r + ': VERSION ' + vm[1] + ' != package.json version ' + pkg.version);
    var re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    var m;
    while ((m = re.exec(text))) {
      var attrs = m[1];
      if (/\bsrc\s*=/.test(attrs)) continue;
      if (/type\s*=\s*["']?(module|text\/babel)/i.test(attrs)) { err(r + ': <script type=module/babel> will not run on old Tizen'); continue; }
      var before = text.slice(0, m.index + m[0].indexOf('>') + 1);
      var lineOffset = before.split('\n').length - 1;
      checkEs5(m[2], r + ' <script>', lineOffset);
    }
  }
});

warnings.forEach(function (w) { console.log('WARN  ' + w); });
errors.forEach(function (e) { console.log('ERROR ' + e); });
console.log(errors.length ? 'FAILED: ' + errors.length + ' error(s)' : 'OK: TizenBrew module looks valid (' + (pkg ? pkg.packageType + ' ' + pkg.version : '?') + ')');
process.exit(errors.length ? 1 : 0);
