/**
 * 924 Servicebuch – Datenbank in Google Sheets
 * In die Google-Tabelle einfügen: Erweiterungen → Apps Script.
 * 1. Einmal die Funktion „einrichten“ ausführen (erzeugt Tabellenblätter und Zugangscode).
 * 2. Als Web-App bereitstellen: Ausführen als „Ich“, Zugriff „Jeder“.
 */
const BLATT_LOG = 'Serviceheft';
const BLATT_CFG = 'Einstellungen';
const KOPF_LOG = ['id', 'datum', 'genauigkeit', 'km', 'kosten', 'arbeiten', 'notiz', 'von', 'erstellt'];

function einrichten() {
  const ss = SpreadsheetApp.getActive();
  let log = ss.getSheetByName(BLATT_LOG);
  if (!log) log = ss.insertSheet(BLATT_LOG);
  if (log.getLastRow() === 0) {
    log.getRange('A:I').setNumberFormat('@');
    log.appendRow(KOPF_LOG);
    log.setFrozenRows(1);
    log.getRange(1, 1, 1, KOPF_LOG.length).setFontWeight('bold');
    zeileAnhaengen(log, {id: 'seed1', date: '2025-08-15', prec: 'month', tasks: ['oel', 'getriebeoel', 'zahnriemen', 'riemencheck', 'scheinwerfer'],
      text: 'Motoröl- und Getriebeölwechsel. Keil- und Zahnriemen erneuert. Defekten Temperaturfühler am Kühler erneuert. Tachowelle ausgetauscht, defektes Zahnrad des Kilometerzählers ersetzt. Klappmechanik der Frontscheinwerfer überholt, LED-Leuchtmittel verbaut.'});
    zeileAnhaengen(log, {id: 'seed2', date: '2026-11-01', prec: 'day', tasks: ['zuendkerzen'], text: 'Neue Zündkerzen.'});
  }
  let cfg = ss.getSheetByName(BLATT_CFG);
  if (!cfg) cfg = ss.insertSheet(BLATT_CFG);
  if (cfg.getLastRow() === 0) {
    cfg.getRange('A:B').setNumberFormat('@');
    cfg.appendRow(['schluessel', 'wert']);
    cfg.setFrozenRows(1);
  }
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('PIN')) props.setProperty('PIN', Utilities.getUuid().replace(/-/g, '').slice(0, 10));
  Logger.log('Dein Zugangscode: ' + props.getProperty('PIN'));
}

/** Neuen Zugangscode erzeugen (z. B. wenn ein Handy verloren geht). */
function zugangscodeErneuern() {
  const pin = Utilities.getUuid().replace(/-/g, '').slice(0, 10);
  PropertiesService.getScriptProperties().setProperty('PIN', pin);
  Logger.log('Neuer Zugangscode: ' + pin);
}

function doGet() {
  return ausgabe({ok: true, info: '924 Servicebuch'});
}

function doPost(e) {
  let b;
  try { b = JSON.parse(e.postData.contents); } catch (err) { return ausgabe({error: 'format'}); }
  const pin = PropertiesService.getScriptProperties().getProperty('PIN');
  if (!pin || b.pin !== pin) { Utilities.sleep(1500); return ausgabe({error: 'pin'}); }
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const ss = SpreadsheetApp.getActive();
    if (b.op === 'add') eintragHinzufuegen(ss.getSheetByName(BLATT_LOG), b.entry);
    else if (b.op === 'del') eintragLoeschen(ss.getSheetByName(BLATT_LOG), b.id);
    else if (b.op === 'odo') cfgSetzen('kilometerstand', b.odo);
    else if (b.op === 'ov') cfgSetzen('intervalle', b.ov);
    else if (b.op !== 'load') return ausgabe({error: 'op'});
    return ausgabe({ok: true, state: zustandLesen()});
  } finally {
    lock.releaseLock();
  }
}

function zustandLesen() {
  const sh = SpreadsheetApp.getActive().getSheetByName(BLATT_LOG);
  const v = sh.getDataRange().getDisplayValues();
  v.shift();
  const log = v.filter(r => r[0]).map(r => ({
    id: r[0], date: r[1], prec: r[2] || 'day', km: zahl(r[3]), cost: zahl(r[4]),
    tasks: r[5] ? r[5].split(',').map(s => s.trim()).filter(Boolean) : [], text: r[6], by: r[7]
  }));
  return {odo: cfgLesen('kilometerstand') || {km: null, date: null}, ov: cfgLesen('intervalle') || {}, log: log};
}

function eintragHinzufuegen(sh, e) {
  if (!e || !e.id || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return;
  const ids = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getDisplayValues().map(r => r[0]);
  if (ids.indexOf(String(e.id)) !== -1) return; // schon vorhanden (Wiederholung nach Verbindungsabbruch)
  zeileAnhaengen(sh, e);
}

function zeileAnhaengen(sh, e) {
  const row = [e.id, e.date, e.prec || 'day', e.km == null ? '' : e.km, e.cost == null ? '' : e.cost,
    (e.tasks || []).join(','), e.text || '', e.by || '', new Date().toISOString()].map(String);
  const r = sh.getLastRow() + 1;
  sh.getRange(r, 1, 1, row.length).setNumberFormat('@').setValues([row]);
}

function eintragLoeschen(sh, id) {
  const ids = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 1).getDisplayValues().map(r => r[0]);
  const i = ids.indexOf(String(id));
  if (i > 0) sh.deleteRow(i + 1);
}

function cfgLesen(key) {
  const v = SpreadsheetApp.getActive().getSheetByName(BLATT_CFG).getDataRange().getDisplayValues();
  for (let i = 1; i < v.length; i++) if (v[i][0] === key) { try { return JSON.parse(v[i][1]); } catch (e) { return null; } }
  return null;
}

function cfgSetzen(key, val) {
  const sh = SpreadsheetApp.getActive().getSheetByName(BLATT_CFG);
  const v = sh.getDataRange().getDisplayValues();
  const json = JSON.stringify(val);
  for (let i = 1; i < v.length; i++) if (v[i][0] === key) { sh.getRange(i + 1, 2).setNumberFormat('@').setValue(json); return; }
  sh.getRange(sh.getLastRow() + 1, 1, 1, 2).setNumberFormat('@').setValues([[key, json]]);
}

function zahl(x) {
  if (x === '' || x == null) return null;
  const n = Number(String(x).replace(',', '.'));
  return isFinite(n) ? n : null;
}

function ausgabe(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
