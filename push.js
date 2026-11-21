(() => {
  "use strict";

  const key = "blattwerk.push.v1";
  const daysOptions = [1, 2, 3, 7, 14, 28];
  const timeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const supported = () => window.isSecureContext && "Notification" in window && "PushManager" in window && "serviceWorker" in navigator;

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value.service === "string" && typeof value.code === "string" && typeof value.device === "string"
        ? value : null;
    } catch {
      return null;
    }
  }

  function save(value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      throw new Error("Der Browser konnte die Push-Einstellungen nicht lokal speichern.");
    }
  }

  function serverAddress(input) {
    let url;
    try { url = new URL(input.trim()); } catch { throw new Error("Gib die vollständige HTTPS-Adresse des Push-Dienstes ein."); }
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
      throw new Error("Verwende die HTTPS-Startadresse deines Push-Dienstes.");
    }
    return url.origin;
  }

  async function call(settings, action, body = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(settings.service + "/" + action, {
        method: "POST", redirect: "error", credentials: "omit", signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + settings.code },
        body: JSON.stringify({ device: settings.device, ...body })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Der Push-Dienst konnte die Anfrage nicht abschließen.");
      return data;
    } catch (error) {
      if (error.name === "AbortError" || error instanceof TypeError) throw new Error("Der Push-Dienst ist momentan nicht erreichbar.");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  function publicKey(raw) {
    if (typeof raw !== "string" || !/^[A-Za-z0-9_-]{87}$/.test(raw)) throw new Error("Der Push-Dienst hat einen ungültigen öffentlichen Schlüssel geliefert.");
    const bytes = Uint8Array.from(atob(raw.replaceAll("-", "+").replaceAll("_", "/") + "="), letter => letter.charCodeAt(0));
    if (bytes[0] !== 4 || bytes.length !== 65) throw new Error("Der Push-Dienst hat einen ungültigen öffentlichen Schlüssel geliefert.");
    return bytes;
  }

  async function connect(address, token) {
    const current = read();
    if (current?.active) throw new Error("Pausiere zuerst die aktuelle Erinnerung, bevor du den Dienst wechselst.");
    const service = serverAddress(address);
    const code = token.trim();
    if (!/^[A-Za-z0-9_-]{32,100}$/.test(code)) throw new Error("Gib den Einrichtungscode deines Push-Dienstes ein.");
    const device = current?.service === service ? current.device : crypto.randomUUID().replaceAll("-", "");
    const settings = { service, code, device, time: current?.time ?? "09:00", days: current?.days ?? 7, active: false, nextAt: null };
    const result = await call(settings, "config");
    if (result.version !== 1) throw new Error("Die Adresse gehört zu keiner passenden Version des Blattwerk-Push-Dienstes.");
    publicKey(result.publicKey);
    const connected = { ...settings, publicKey: result.publicKey };
    save(connected);
    return connected;
  }

  async function activate(settings, time, days) {
    if (!settings) throw new Error("Verbinde zuerst deinen Blattwerk-Push-Dienst.");
    if (!supported()) throw new Error("Auf dem iPhone öffnest du Blattwerk dafür über das Symbol auf dem Home-Bildschirm.");
    if (!window.BW.validTime(time) || !daysOptions.includes(days)) throw new Error("Wähle eine gültige Uhrzeit und einen Rhythmus.");
    if (!navigator.serviceWorker.controller) throw new Error("Warte, bis Blattwerk offline bereit ist. Lade die App bei Bedarf erneut.");
    const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    if (permission !== "granted") throw new Error("Erlaube Mitteilungen für Blattwerk in den Geräte- oder Browsereinstellungen.");
    const registration = await navigator.serviceWorker.ready;
    const keyBytes = publicKey(settings.publicKey);
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing ?? await registration.pushManager.subscribe({
      userVisibleOnly: true, applicationServerKey: keyBytes
    }).catch(error => {
      if (error.name === "NotAllowedError" || error.name === "AbortError") {
        throw new Error("Die Geräteanmeldung wurde unterbrochen. Tippe erneut auf „Push aktivieren“ und prüfe die Mitteilungseinstellungen.");
      }
      throw error;
    });
    try {
      const answer = await call(settings, "register", { endpoint: subscription.endpoint, time, days, zone: timeZone() });
      if (!Number.isFinite(answer.nextAt)) throw new Error("Der Push-Dienst hat keinen gültigen nächsten Zeitpunkt gemeldet.");
      const active = { ...settings, time, days, active: true, nextAt: answer.nextAt };
      save(active);
      return active;
    } catch (error) {
      if (!existing) await subscription.unsubscribe().catch(() => {});
      throw error;
    }
  }

  async function deactivate(settings) {
    const remote = await call(settings, "remove").then(() => true, () => false);
    if (supported() && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription && !(await subscription.unsubscribe()) && !remote) throw new Error("Die Geräteanmeldung konnte gerade nicht aufgehoben werden.");
    } else if (!remote) {
      throw new Error("Der Zeitplan konnte gerade nicht entfernt werden. Versuche es mit Internetverbindung erneut.");
    }
    const paused = { ...settings, active: false, nextAt: null };
    save(paused);
    return { paused, remote };
  }

  const refresh = settings => call(settings, "status");
  const test = settings => call(settings, "test");
  window.BW.push = { read, connect, activate, deactivate, refresh, test, supported, daysOptions };
})();
