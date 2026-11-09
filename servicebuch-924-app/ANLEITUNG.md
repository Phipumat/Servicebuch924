# 924 Servicebuch – Einrichtung

Die App besteht aus zwei Teilen:

- **Datenbank:** eine Google-Tabelle mit einem kleinen Apps Script (Datei `Code.gs`).
- **App:** die Dateien `index.html`, `manifest.webmanifest`, `sw.js` und die drei Icons, gehostet auf GitHub Pages.

Dauer: etwa 20 Minuten.

## 1. Google-Tabelle anlegen

1. Unter sheets.google.com eine neue Tabelle anlegen, zum Beispiel „924 Servicebuch“.
2. Im Menü **Erweiterungen → Apps Script** öffnen.
3. Den Inhalt von `Code.gs` komplett einfügen (vorhandenen Code ersetzen) und speichern.
4. Oben die Funktion **einrichten** auswählen und auf **Ausführen** klicken.
   - Google fragt nach Berechtigungen. Weil es dein eigenes Script ist, erscheint ein Warnhinweis. Auf „Erweitert“ und dann „Zu … wechseln (unsicher)“ klicken und zulassen.
5. Im **Ausführungsprotokoll** steht jetzt „Dein Zugangscode: …“. Notiere ihn.

Die Tabelle hat jetzt die Blätter „Serviceheft“ (mit deinen bisherigen Arbeiten) und „Einstellungen“.

## 2. Als Web-App bereitstellen

1. Oben rechts auf **Bereitstellen → Neue Bereitstellung** klicken.
2. Beim Zahnrad als Typ **Web-App** wählen.
3. Ausführen als: **Ich**. Zugriff: **Jeder**.
4. Auf **Bereitstellen** klicken und die **Web-App-URL** kopieren (endet auf `/exec`).

Der Zugriff „Jeder“ bedeutet nur, dass die Adresse erreichbar ist. Ohne den Zugangscode liefert das Script keine Daten und nimmt keine Änderungen an.

Wenn du `Code.gs` später änderst, gehst du auf **Bereitstellen → Bereitstellungen verwalten**, bearbeitest die Bereitstellung und wählst „Neue Version“. Dann bleibt die URL gleich.

## 3. App auf GitHub Pages stellen

1. In deinem Repo (zum Beispiel `Capo-Stuff`) einen Ordner `servicebuch` anlegen.
2. Diese Dateien hochladen: `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`.
   - `Code.gs` und diese Anleitung nicht hochladen, sie werden dort nicht gebraucht.
3. Ist GitHub Pages für das Repo schon aktiv, ist die App unter `https://<benutzername>.github.io/Capo-Stuff/servicebuch/` erreichbar. Sonst schaltest du Pages unter **Settings → Pages** ein (Branch `main`, Ordner `/root`).

Im Repo liegen weder Daten noch Zugangscode, darum darf es öffentlich sein.

## 4. Aufs Handy holen

Das macht jeder von euch beiden:

1. Die App-Adresse im Handy-Browser öffnen.
2. Die Einstellungen öffnen sich automatisch. Dort Web-App-URL, Zugangscode und den eigenen Namen eintragen und auf „Speichern und verbinden“ tippen.
3. Zum Startbildschirm hinzufügen:
   - **iPhone:** in Safari über Teilen auf „Zum Home-Bildschirm“ tippen.
   - **Android:** in Chrome über das Drei-Punkte-Menü „Zum Startbildschirm hinzufügen“ bzw. „App installieren“ wählen.

Achtung beim iPhone: Die Einstellungen werden in der Home-Bildschirm-App getrennt von Safari gespeichert. Am besten erst das Symbol anlegen, dann die App über das Symbol öffnen und dort die Zugangsdaten eintragen.

## Gut zu wissen

- **Offline:** Die App funktioniert ohne Netz, zum Beispiel in der Garage. Änderungen werden gemerkt und automatisch übertragen, sobald wieder Verbindung besteht. Oben rechts steht dann „Synchronisiert“.
- **Tabelle direkt bearbeiten:** Das geht, zum Beispiel um Kilometerstände nachzutragen. Die Spalte „arbeiten“ enthält die Kürzel der Wartungsposten: oel, zuendkerzen, zahnriemen, riemencheck, getriebeoel, bremsfluessigkeit, kuehlmittel, luftfilter, kraftstofffilter, verteiler, ventilspiel, scheinwerfer, bremsefahrwerk, unterboden, einwintern, hu.
- **Handy verloren:** Im Apps-Script-Editor die Funktion **zugangscodeErneuern** ausführen und den neuen Code auf dem anderen Handy eintragen.
- **App-Update:** Nach einer Änderung an `index.html` in `sw.js` die Versionsnummer (`sb924-v1` → `sb924-v2`) erhöhen, damit die Handys die neue Version laden.
