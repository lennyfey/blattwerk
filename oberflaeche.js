(() => {
  "use strict";

  const BW = window.BW;
  const {
    profiles, observations, moistureLevels, sunlight, lightLabels, visualLevels, intervals,
    season, shortDate, longDate, headerDate, dueLabel, nextCheck, feedPlan,
    tasksFor, checkInterval, hasRecentRepot, growing, lightAssessment, normalize
  } = BW;
  const drawings = {
    brand: '<path d="M5 20c4-5 8-9 14-13M7 16C5.5 10 11 5 20 5c0 7-3.5 12-10 12M10.5 13l.5-3m2 2 3-.5"/>',
    home: '<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-6h6v6"/>',
    plant: '<path d="M12 17v-5m0 1C6 13 4 10 4 6c5 0 8 2 8 7Zm0 1c0-6 3-9 8-10 0 5-2 8-8 10ZM5 17h14l-2 4H7z"/>',
    sprout: '<path d="M7 21h10m-5 0v-7m0-1C6 13 4 10 4 6c5 0 8 2 8 7Zm0 1c0-6 3-9 8-10 0 5-2 8-8 10Z"/>',
    leaf: '<path d="M20 4c0 9-4 14-10 14a5 5 0 0 1-5-5c0-6 6-9 15-9Z"/><path d="M4 21c3-5 6-8 11-11"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
    snow: '<path d="M12 2v20M3.4 7l17.2 10M3.4 17 20.6 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-.8-1-4M20 14l-4 .8 1 4M4 14l4 .8-1 4m13-8.8-4-.8 1-4"/>',
    book: '<path d="M12 6c-3-2-5-2-9-2v15c4 0 6 0 9 2 3-2 5-2 9-2V4c-4 0-6 0-9 2Zm0 0v15"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4m-5 4h18m-13 4h2m4 0h2"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9m-9 4h4"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    list: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2m-7 7 1.5 1.5 2.5-3m-4 7 1.5 1.5 2.5-3m2-3h2m-2 5h2"/>',
    drop: '<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z"/><path d="M9 15a3 3 0 0 0 2 2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    circleCheck: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.7 2.7L16 9"/>',
    pin: '<path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
    search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/>',
    close: '<path d="m6 6 12 12m0-12L6 18"/>',
    edit: '<path d="m14 6 4 4M4 20l4-1L20 7a2.1 2.1 0 0 0-3-3L5 16z"/>',
    trash: '<path d="M4 7h16m-14 0 1 14h10l1-14M9 7V4h6v3m-5 4v6m4-6v6"/>',
    thermometer: '<path d="M9 14.7V6a3 3 0 0 1 6 0v8.7a5 5 0 1 1-6 0Z"/><path d="M12 10v7"/><circle cx="12" cy="17.5" r="1.2"/>',
    download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
    upload: '<path d="M12 16V4m-4 4 4-4 4 4M4 16v4h16v-4"/>',
    camera: '<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="3.25"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>',
    bell: '<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zm5 3a2 2 0 0 0 4 0"/>',
    bulb: '<path d="M9 18h6m-5 3h4M8 15c0-2-3-3.5-3-7a7 7 0 0 1 14 0c0 3.5-3 5-3 7Z"/>',
    alert: '<path d="M12 3 2.8 20h18.4L12 3Zm0 6v4m0 3h.01"/>'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[name] ?? drawings.leaf}</svg>`;
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const safe = value => String(value).replace(/[&<>"']/g, character => entities[character]);
  const tag = (text, tone = "", symbol = "") => `<span class="tag ${tone}">${symbol ? icon(symbol) : ""}${safe(text)}</span>`;
  const button = (label, action, tone = "secondary", symbol = "", attrs = "") =>
    `<button class="button ${tone}" type="button" data-action="${action}" ${attrs}>${symbol ? icon(symbol) : ""}${safe(label)}</button>`;
  const link = (label, view, tone, symbol = "") =>
    `<a class="button ${tone}" href="#${view}">${symbol ? icon(symbol) : ""}${safe(label)}</a>`;
  const addButton = (isDesktop = false) => button("Pflanze hinzufügen", "add", "primary" + (isDesktop ? " desktop-action" : ""), "plus");
  const plantAttr = id => `data-id="${safe(id)}"`;
  const optional = ' <span class="muted">(optional)</span>';
  const selected = (left, right) => left === right ? "selected" : "";
  const countText = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;
  const opts = (options, value) => Object.entries(options)
    .map(([key, option]) => `<option value="${safe(key)}" ${selected(key, value)}>${safe(typeof option === "string" ? option : option.name)}</option>`).join("");
  function profileMatches(query) {
    const words = normalize(query).split(/[^a-z0-9]+/).filter(Boolean);
    return Object.entries(profiles).filter(([key, profile]) => key !== "custom"
      && words.every(word => normalize([profile.name, profile.botanical, ...profile.aliases].join(" ")).includes(word)))
      .sort((a, b) => a[1].name.localeCompare(b[1].name, "de"));
  }
  function profilesOptions(chosen, query = "") {
    const matches = profileMatches(query);
    if (profiles[chosen] && chosen !== "custom" && !matches.some(([key]) => key === chosen)) matches.unshift([chosen, profiles[chosen]]);
    return opts({ custom: profiles.custom, ...Object.fromEntries(matches) }, chosen);
  }
  const emptyError = '<p class="error-text" data-form-error role="alert" hidden></p>';
  const sourceLink = (label, url) => `<a href="${safe(url)}" target="_blank" rel="noopener noreferrer">${safe(label)}</a>`;
  const numberFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
  const instantFormat = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" });
  const readingSources = { sensor: "Gerätesensor", manual: "Lux-Eingabe", estimate: "Schätzung" };

  function pageHeader(title, subtitle, action = "", dated = false) {
    return `<header class="page-header"><div><h1 tabindex="-1">${safe(title)}</h1>
      <p class="${dated ? "date-line" : ""}">${dated ? icon("calendar") : ""}${safe(subtitle)}</p></div>${action}</header>`;
  }

  const photoSource = profile => profiles[profile]?.image ? "assets/" + profiles[profile].image + ".jpg" : "assets/mark.svg";

  function photo(plant) {
    return plant.photoId || profiles[plant.profile].image
      ? `<img class="plant-photo" src="${photoSource(plant.profile)}" ${plant.photoId ? `data-plant-photo="${safe(plant.photoId)}"` : ""} width="48" height="48" alt="" decoding="async">`
      : `<span class="plant-photo">${icon("sprout")}</span>`;
  }

  function careText(item) {
    if (item.kind === "feed") return item.fertilized ? "Gedüngt" : "Düngen verschoben";
    return item.watered ? "Geprüft und gegossen" : "Feuchtigkeit geprüft";
  }

  const taskName = kind => kind === "check" ? "Feuchtigkeit prüfen" : "Düngebedarf prüfen";
  const taskIcon = kind => kind === "check" ? "drop" : "sprout";

  function completed(plants, min, today) {
    return plants.flatMap(plant => plant.history.filter(item => item.on >= min && item.on <= today).map(item => ({ plant, item })))
      .sort((a, b) => b.item.on.localeCompare(a.item.on));
  }

  function taskRow({ plant, kind, date }, today) {
    return `<div class="task-row">
      <button class="task-plant" type="button" data-action="detail" ${plantAttr(plant.id)}>
        ${photo(plant)}<span><strong>${safe(plant.name)}</strong><span class="small">${safe(plant.place)}</span></span>
      </button>
      <div class="task-info"><span class="task-kind">${icon(taskIcon(kind))}${taskName(kind)}</span>
      ${tag(dueLabel(date, today), date < today ? "warning" : date === today ? "positive" : "")}</div>
      ${button("Prüfen", "task", "secondary compact task-button", "", `${plantAttr(plant.id)} data-kind="${kind}" aria-label="${safe(plant.name + ": " + taskName(kind))}"`)}
    </div>`;
  }

  function historyRow({ plant, item }) {
    return `<div class="task-row">
      <button class="task-plant" type="button" data-action="detail" ${plantAttr(plant.id)}>
        ${photo(plant)}<span><strong>${safe(plant.name)}</strong><span class="small">${safe(plant.place)}</span></span>
      </button>
      <div class="task-info"><span class="task-kind">${icon(taskIcon(item.kind))}${careText(item)}</span>${tag(shortDate(item.on), "positive")}</div>
      <span class="stat-icon task-button">${icon("check")}</span>
    </div>`;
  }

  function roundList({ due, future, history, tab, today, plantCount }) {
    if (tab === "history" && history.length) return history.slice(0, 60).map(historyRow).join("");
    const tasks = tab === "due" ? due : tab === "next" ? future : [];
    if (tasks.length) return tasks.map(task => taskRow(task, today)).join("");
    const messages = {
      due: plantCount ? ["Alles auf dem aktuellen Stand", "Die nächsten Prüftermine findest du unter Demnächst."] : ["Deine Pflanzenrunde ist leer", "Lege deine erste Pflanze an, um einen Prüftermin zu erhalten."],
      next: ["Keine anstehenden Termine", "Neue Termine entstehen, wenn du Pflanzen anlegst oder Pflegeschritte dokumentierst."],
      history: ["Noch keine Pflege dokumentiert", "Hier siehst du die Einträge der letzten 14 Tage."]
    };
    return `<div class="quiet"><strong>${messages[tab][0]}</strong><p class="muted small">${messages[tab][1]}</p></div>`;
  }

  function dashboard(plants, today, tab, demo) {
    const tasks = tasksFor(plants, today);
    const due = tasks.filter(task => task.date <= today);
    const future = tasks.filter(task => task.date > today);
    const history = completed(plants, BW.shift(today, -13), today);
    const finishedToday = history.filter(({ item }) => item.on === today).length;
    const current = season(today);
    const names = new Set(due.map(task => task.plant.id)).size;
    const summary = names === 1
      ? "<strong>Eine Pflanze</strong> braucht heute einen Blick."
      : names > 1 ? `<strong>${names} Pflanzen</strong> stehen heute zur Prüfung an.` : "Deine offenen und anstehenden Aufgaben findest du hier.";
    const stats = [
      ["Fällige Aufgaben", due.length, "clock", "warm", 'data-action="round-tab" data-tab="due"'],
      [plants.length === 1 ? "Pflanze" : "Pflanzen", plants.length, "plant", "lime", 'href="#pflanzen"'],
      ["Heute erledigt", finishedToday, "circleCheck", "", 'data-action="round-tab" data-tab="history"']
    ].map(([label, count, symbol, tone, attrs]) => {
      const content = `<span class="stat-icon ${tone}">${icon(symbol)}</span><span><strong>${count}</strong><span class="stat-label">${label}</span></span>`;
      return symbol === "plant" ? `<a class="card stat" ${attrs}>${content}</a>` : `<button class="card stat" type="button" ${attrs}>${content}</button>`;
    }).join("");
    return pageHeader("Übersicht", headerDate(today), addButton(true), true) + `
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-body">
          <div class="hero-eyebrow">${icon(current.icon)} ${current.name === "Frühling" ? "Frühlingspflege" : current.name + "pflege"}</div>
          <h2 id="hero-title">Zeit für deine<br> Pflanzenrunde.</h2>
          <p>${summary}</p>
          ${due.length ? button("Pflanzenrunde starten", "round-start", "accent", "list")
            : plants.length ? button("Nächste Termine ansehen", "round-tab", "accent", "calendar", 'data-tab="next"')
              : button("Erste Pflanze hinzufügen", "add", "accent", "plus")}
        </div>
      </section>
      <div class="stats" aria-label="Pflegestatistik">${stats}</div>
      <div class="dashboard-grid">
        <section id="runde" aria-labelledby="runde-title">
          <div class="section-head"><h2 id="runde-title" tabindex="-1" class="section-title">Pflanzenrunde</h2>
            ${demo ? tag("Beispielgarten", "positive", "leaf") : ""}
          </div>
          <div class="card round-card">
            <div class="segmented" role="group" aria-label="Aufgaben filtern">
              ${[["due", "Fällig"], ["next", "Demnächst"], ["history", "Erledigt"]].map(([key, name]) =>
                `<button type="button" data-action="round-tab" data-tab="${key}" aria-pressed="${tab === key}" aria-controls="round-tasks">${name}</button>`).join("")}
            </div>
            <div id="round-tasks">${roundList({ due, future, history, tab, today, plantCount: plants.length })}</div>
            <div class="round-footer"><span>${demo ? "Zum Ausprobieren" : "Prüfen, dann bei Bedarf gießen"}</span>
              ${button("Erinnerung", "calendar", "text compact", "calendar")}
            </div>
          </div>
          ${demo ? `<div class="example-note">${button("Beispiele ausblenden", "examples-off", "text compact")}</div>`
            : plants.length === 0 ? `<div class="example-note">${button("Beispielgarten ansehen", "examples-on", "text compact")}</div>` : ""}
        </section>
        <aside class="aside-cards" aria-label="Hilfen für die Pflanzenpflege">
          <div class="section-head"><h2 class="section-title">Standort & Saison</h2></div>
          <article class="card feature light">
            <span class="feature-icon">${icon("sun")}</span>
            <h3>Passt der Lichtplatz?</h3>
            <p>Vergleiche Fenster, Regale und andere Standorte auf Blatthöhe.</p>
            ${link("Lichtmesser öffnen", "licht", "secondary")}
          </article>
          <article class="card feature season-card">
            <div class="season-title"><span class="feature-icon warm">${icon(current.icon)}</span><h3>Im ${current.name}</h3></div>
            <p>${current.tip}</p>
          </article>
        </aside>
      </div>`;
  }

  function plantCards(plants, today, search, room) {
    const query = normalize(search.trim());
    const visible = plants.filter(plant => (!room || plant.place === room) &&
      normalize([plant.name, plant.place, profiles[plant.profile].name, profiles[plant.profile].botanical].join(" ")).includes(query))
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
    const label = countText(visible.length, "Pflanze", "Pflanzen");
    if (!visible.length) return `<div class="card empty-card"><strong>Keine Pflanze gefunden</strong>
      <p class="muted">Passe deine Suche oder den Standortfilter an.</p>${button("Filter zurücksetzen", "reset-filter", "secondary")}</div>`;
    return `<p class="muted small">${label}</p><div class="plant-grid">${visible.map(plant => {
      const profile = profiles[plant.profile];
      const first = nextCheck(plant, today);
      return `<button class="card plant-card" type="button" data-action="detail" ${plantAttr(plant.id)}>
        ${photo(plant)}
        <span class="plant-card-body"><strong>${safe(plant.name)}</strong>
          ${profile.botanical ? `<span class="small muted">${safe(profile.botanical)}</span>` : ""}
          <span class="small muted">${icon("pin")} ${safe(plant.place)}</span>
          ${tag(dueLabel(first, today), first <= today ? "warning" : "positive", "drop")}
        </span></button>`;
    }).join("")}</div>`;
  }

  function plantsPage(plants, today, search, room, demo) {
    const heading = pageHeader("Meine Pflanzen", "Steckbriefe, Standorte und Pflegeverläufe", addButton(true));
    if (!plants.length) return heading + `<section class="card empty-card"><span class="feature-icon">${icon("plant")}</span>
      <h2 class="section-title">Dein Pflanzenzimmer ist leer</h2><p class="muted">Erstelle einen Steckbrief mit Name und Standort.</p>
      <div class="cluster">${addButton()}${button("Beispielgarten ansehen", "examples-on", "secondary")}</div></section>`;
    const places = [...new Set(plants.map(plant => plant.place))].sort((a, b) => a.localeCompare(b, "de"));
    return heading + `
      <div class="filter-bar">
        <div class="input-icon"><span>${icon("search")}</span><label class="visually-hidden" for="plant-search">Pflanzen suchen</label>
          <input id="plant-search" type="search" placeholder="Name, Art oder Raum suchen" value="${safe(search)}"></div>
        <div><label class="visually-hidden" for="plant-room">Standort filtern</label><select id="plant-room">
          <option value="">Alle Standorte</option>${places.map(place => `<option value="${safe(place)}" ${selected(place, room)}>${safe(place)}</option>`).join("")}
        </select></div>
      </div>
      ${demo ? '<p class="muted small" style="margin-bottom:.7rem">Beispielgarten zum Ausprobieren</p>' : ""}
      <div id="plant-results" class="stack">${plantCards(plants, today, search, room)}</div>`;
  }

  function dialogHeader(title, subtitle = "", extra = "") {
    return `<header class="dialog-head"><div>${extra}<h2 id="dialog-title" tabindex="-1">${safe(title)}</h2>
      ${subtitle ? `<p>${safe(subtitle)}</p>` : ""}</div><button class="icon-button" data-action="close" type="button" aria-label="Schließen">${icon("close")}</button></header>`;
  }

  function plantForm(plant, places, today, allowPhoto = true) {
    return `<div class="dialog-body">${dialogHeader(plant ? "Pflanze bearbeiten" : "Pflanze hinzufügen",
      plant ? plant.name : "Name und Standort genügen für deinen ersten Prüftermin.")}
      <form class="stack" data-form="plant" ${plant ? plantAttr(plant.id) : ""} novalidate>
        <div class="form-grid columns">
          <label class="field"><span>Name</span><input name="name" maxlength="80" required placeholder="z. B. Monstera" value="${safe(plant?.name ?? "")}"></label>
          <label class="field"><span>Standort</span><input name="place" maxlength="80" required list="known-places" placeholder="z. B. Bad" value="${safe(plant?.place ?? "")}"></label>
          <datalist id="known-places">${places.map(place => `<option value="${safe(place)}"></option>`).join("")}</datalist>
          <div class="wide profile-picker">
            <div class="form-grid columns">
              <label class="field"><span>Art suchen</span><input name="profileSearch" type="search" maxlength="80" placeholder="z. B. Calathea oder Pilea"></label>
              <label class="field"><span id="profile-label">Art für den Steckbrief</span><select name="profile" aria-labelledby="profile-label" aria-describedby="profile-help">${profilesOptions(plant?.profile ?? "custom")}</select></label>
            </div>
            <p id="profile-help" class="help">Suche in ${Object.keys(profiles).length - 1} Arten oder wähle eine eigene Art.</p>
          </div>
          ${allowPhoto ? `<section class="wide photo-input" aria-labelledby="own-photo-title">
            <img class="plant-photo" id="plant-photo-preview" src="${photoSource(plant?.profile ?? "custom")}"
              data-plant-photo="${safe(plant?.photoId ?? "")}" alt="Vorschau des Pflanzenbilds" width="80" height="80">
            <div class="photo-input-content">
              <strong id="own-photo-title">Eigenes Pflanzenfoto</strong>
              <p id="plant-photo-status" class="help" role="status">${plant?.photoId ? "Eigenes Foto gespeichert." : "Dein Foto erscheint auf der Pflanzenkarte und bleibt auf dem Gerät."}</p>
              <input type="file" id="plant-photo-file" accept="image/*,.heic,.heif" data-plant-file hidden>
              <input type="file" id="plant-photo-camera" accept="image/*" capture="environment" data-plant-file hidden>
              <div class="cluster">
                ${button("Foto auswählen", "plant-photo-pick", "secondary compact", "camera", 'data-input="plant-photo-file"')}
                ${button("Foto aufnehmen", "plant-photo-pick", "soft compact camera-capture", "", 'data-input="plant-photo-camera"')}
                ${button("Eigenes Foto entfernen", "plant-photo-remove", "text compact", "", plant?.photoId ? "" : "hidden")}
              </div>
            </div>
          </section>` : ""}
          <label class="field"><span id="repot-label">Zuletzt umgetopft${optional}</span><input type="date" name="repottedOn" min="1900-01-01" max="${today}" aria-labelledby="repot-label" aria-describedby="repot-help" value="${plant?.repottedOn ?? ""}">
            <span class="help" id="repot-help">Das Datum passt Prüfungen und Düngepause an.</span></label>
          <label class="field"><span id="interval-label">Eigener Prüfrhythmus${optional}</span><input type="number" name="interval" min="1" max="90" step="1" placeholder="Automatisch" aria-labelledby="interval-label" aria-describedby="interval-help" value="${plant?.interval ?? ""}">
            <span class="help" id="interval-help">Abstand in Tagen. Leer nutzt das Profil und die Jahreszeit.</span></label>
          <label class="field wide"><span>Notizen${optional}</span><textarea name="notes" maxlength="800" placeholder="z. B. am Ostfenster, 14-cm-Topf">${safe(plant?.notes ?? "")}</textarea></label>
        </div>
        ${emptyError}
        <div class="form-actions">${button("Abbrechen", "close")}<button type="submit" class="button primary">${icon("check")} Speichern</button></div>
      </form></div>`;
  }

  function plantDetail(plant, today, demo) {
    const profile = profiles[plant.profile];
    const irrigation = nextCheck(plant, today);
    const feeding = feedPlan(plant, today);
    const lastWatered = plant.history.find(item => item.kind === "check" && item.watered);
    const lastFed = plant.history.find(item => item.kind === "feed" && item.fertilized);
    const growth = growing(today);
    const period = growth ? "April bis September" : "Oktober bis März";
    const feedAdvice = profile.feedType
      ? `${profile.feedType} bei tatsächlichem Wachstum etwa alle ${profile.feedDays} Tage prüfen. Als Einstieg etwa ½ der Etikettdosis im Gießwasser verwenden. Bei vorgedüngter Erde die angegebene Wirkdauer beachten.`
      : "Das Düngemittel und die Menge hängen von Art, Substrat und Wachstum ab.";
    const logs = plant.history.map((item, index) => `<li>
      <div class="section-head"><span><strong>${careText(item)}</strong> <span class="muted small">· ${shortDate(item.on)}</span></span>
      <button class="icon-button" data-action="delete-log" type="button" ${plantAttr(plant.id)} data-item="${index}" aria-label="Verlaufseintrag vom ${safe(shortDate(item.on))} entfernen">${icon("trash")}</button></div>
      ${item.kind === "check" ? `<p class="muted small">${moistureLevels[item.moisture]}${item.leaves ? " · Blätter geprüft" : ""}${item.location ? " · Standort geprüft" : ""}${item.finding === "clear" ? "" : " · " + observations[item.finding].name}</p>` : ""}
      ${item.note ? `<p>${safe(item.note)}</p>` : ""}
      </li>`).join("");
    return `<div class="dialog-body">
      ${dialogHeader(plant.name, profile.botanical || "Eigener Steckbrief", demo ? tag("Beispielpflanze", "positive") : "")}
      <div class="detail-hero">${photo(plant)}<div><strong>${icon("pin")} ${safe(plant.place)}</strong>
        <p class="small">${plant.repottedOn ? "Umgetopft am " + longDate(plant.repottedOn) : "Umtopfdatum offen"}</p>
        ${plant.notes ? `<p class="small">${safe(plant.notes)}</p>` : ""}</div></div>
      <div class="care-grid">
        <section class="care-panel"><h3>${icon("drop")} Feuchtigkeit & Gießen</h3>
          ${tag("Nächste Prüfung: " + dueLabel(irrigation, today), irrigation <= today ? "warning" : "positive")}
          <p>${profile.measure} ${profile.water}</p>
          <p class="muted">Prüfrhythmus aktuell etwa ${checkInterval(plant, today)} Tage (${period}).${hasRecentRepot(plant, today) ? " Nach dem Umtopfen die Feuchte enger im Blick behalten." : ""}</p>
          <p class="muted">${lastWatered ? "Zuletzt gegossen am " + longDate(lastWatered.on) : "Gießen noch nicht dokumentiert."}</p>
        </section>
        <section class="care-panel"><h3>${icon("sprout")} Düngen</h3>
          ${feeding.date ? tag("Nächste Prüfung: " + dueLabel(feeding.date, today), "positive") : ""}
          ${feeding.pause ? `<p><strong>${safe(feeding.pause)}</strong></p>` : ""}
          <p>${feedAdvice}</p>
          ${lastFed ? `<p class="muted">Zuletzt gedüngt am ${longDate(lastFed.on)}</p>` : ""}
        </section>
        <section class="care-panel"><h3>${icon("sun")} Licht & Standort</h3>
          <p>${profile.placement}</p><p class="muted">${icon("thermometer")} ${profile.temperature}</p>
          ${button("Licht hier prüfen", "plant-light", "text compact", "sun", plantAttr(plant.id))}
        </section>
        <section class="care-panel"><h3>${icon("list")} Rundgang</h3>
          <p>Blattunterseiten, Topfabfluss und Zugluft prüfen. Bei Auffälligkeiten findest du im Rundgang passende Prüfschritte.</p>
          ${link("Pflegewissen ansehen", "wissen", "text compact")}
        </section>
      </div>
      <div class="cluster">
        ${button("Feuchtigkeit prüfen", "task", "primary", "drop", `${plantAttr(plant.id)} data-kind="check"`)}
        ${button("Düngen dokumentieren", "task", "secondary", "sprout", `${plantAttr(plant.id)} data-kind="feed"`)}
      </div>
      <details class="details-panel"><summary>Pflegeverlauf (${plant.history.length})</summary>
        ${logs ? `<ul class="log-list">${logs}</ul>` : '<p class="muted small">Der erste Eintrag entsteht beim Speichern einer Prüfung.</p>'}</details>
      ${profile.url ? `<p class="sources small muted">${sourceLink("Fachquelle zum Pflanzenprofil", profile.url)}</p>` : ""}
      <div class="form-actions">${button("Bearbeiten", "edit", "secondary", "edit", plantAttr(plant.id))}
      ${button("Löschen", "delete-plant", "text danger-text", "trash", plantAttr(plant.id))}</div>
    </div>`;
  }

  function taskForm(plant, kind, today, remaining, demo) {
    const profile = profiles[plant.profile];
    const feed = feedPlan(plant, today);
    const extra = remaining > 0 ? tag(`Pflanzenrunde · ${remaining} offen`, "positive")
      : demo ? tag("Beispielpflanze", "positive") : "";
    const title = kind === "check" ? "Feuchtigkeit prüfen" : "Düngebedarf prüfen";
    const subtitle = `${plant.name} · ${plant.place}`;
    return `<div class="dialog-body">${dialogHeader(title, subtitle, extra)}
      <form class="stack" data-form="${kind}" ${plantAttr(plant.id)} novalidate>
        ${kind === "check" ? `
          <div class="notice"><strong>So prüfst du</strong><p>${profile.measure}</p>
            ${hasRecentRepot(plant, today) ? "<p>Frisch umgetopft: Beobachte, wie schnell das neue Substrat abtrocknet.</p>" : ""}</div>
          <fieldset><legend>Wie feucht ist das Substrat?</legend><div class="radio-cards">
            ${Object.entries(moistureLevels).map(([value, name]) => `<label class="radio-card"><input type="radio" name="moisture" value="${value}" required><span>${name}</span></label>`).join("")}
          </div></fieldset>
          <div id="water-advice" class="notice" aria-live="polite" hidden></div>
          <fieldset><legend>Erledigt${optional}</legend>
            <label class="check-option"><input type="checkbox" name="watered"> Ich habe gegossen</label>
            <label class="check-option"><input type="checkbox" name="leaves"> Blätter, Blattunterseiten und Triebe geprüft</label>
            <label class="check-option"><input type="checkbox" name="location"> Licht, Temperatur, Zugluft und Übertopf geprüft</label>
          </fieldset>
          <div class="form-grid columns">
            <label class="field"><span>Auffälligkeit</span><select name="finding">${opts(observations, "clear")}</select></label>
            <label class="field"><span>Erneut prüfen in Tagen${optional}</span><input name="followUp" type="number" min="1" max="90" step="1" placeholder="Automatisch"></label>
          </div>
          <div id="finding-advice" class="notice warning" aria-live="polite" hidden></div>
        ` : `
          <div class="notice ${feed.pause ? "warning" : ""}"><strong>${safe(feed.pause || "Düngen bei sichtbarem Wachstum")}</strong>
            <p>${profile.feedType ? `Mit ${profile.feedType} bei Wachstum etwa alle ${profile.feedDays} Tage prüfen. Mit etwa ½ der Etikettdosis beginnen und auf leicht feuchtes Substrat geben.`
              : "Dünger, Dosis und Rhythmus passend zur Art und zum Substrat wählen."}</p></div>
          <fieldset><legend>Was hast du gemacht?</legend>
            <label class="check-option"><input type="radio" name="fertilized" value="yes" required> Ich habe gedüngt</label>
            <label class="check-option"><input type="radio" name="fertilized" value="no" required> Düngen verschoben</label>
          </fieldset>
        `}
        <label class="field"><span>Notiz${optional}</span><textarea name="note" maxlength="400" placeholder="Was ist dir aufgefallen?"></textarea></label>
        ${emptyError}
        <div class="form-actions">${button("Abbrechen", "close")}<button type="submit" class="button primary">${icon("check")} ${remaining > 1 ? "Speichern & weiter" : "Pflege speichern"}</button></div>
      </form></div>`;
  }

  function lightValue(reading) {
    return reading.lux === null ? visualLevels[reading.visual] : numberFormat.format(reading.lux) + " lx";
  }

  function lightResult(profile, reading) {
    if (!reading) return '<p class="muted small">Gib einen Luxwert ein oder schätze die Helligkeit, um den Standort einzuordnen.</p>';
    const outcome = lightAssessment(profile, reading);
    const level = Object.values(visualLevels).indexOf(outcome.label);
    return `<div class="light-output ${outcome.tone}"><div class="cluster">
      ${tag(outcome.label, outcome.tone)} <strong>${outcome.title}</strong></div>
      <ol class="meter" aria-hidden="true">${[0, 1, 2, 3].map(i => `<li class="${i <= level ? "lit" : ""}"></li>`).join("")}</ol>
      <p class="small">${outcome.advice}</p></div>`;
  }

  function lightReadings(readings, plants, subject, profile) {
    if (!readings.length) return '<p class="muted">Speichere deinen ersten Standort. Vergleiche mindestens zwei Plätze bei ähnlichem Wetter und ähnlicher Uhrzeit.</p>';
    const distinct = new Map();
    for (const reading of readings) {
      const target = reading.plantId ? "p:" + reading.plantId : reading.profile;
      const spot = normalize(reading.spot);
      if (target === subject && !distinct.has(spot)) distinct.set(spot, reading);
    }
    const fits = [...distinct.values()].filter(item => lightAssessment(profile, item).fits);
    const best = distinct.size >= 2 && fits.length === 1 ? fits[0] : null;
    return `${best ? `<div class="notice small"><strong>${safe(best.spot)}</strong> passt von den verglichenen Plätzen am ehesten. Prüfe den Platz auch zu anderen Tageszeiten.</div>`
      : distinct.size >= 2 && fits.length > 1 ? '<div class="notice small">Mehrere Plätze passen zum Profil. Vergleiche zusätzlich den Sonnenverlauf und die Temperatur.</div>'
        : distinct.size >= 2 ? '<div class="notice warning small">Noch kein klar passender Platz. Prüfe die Empfehlungen bei den Messungen oder teste einen weiteren Standort.</div>' : ""}
      <div>${readings.map(reading => {
        const plant = plants.find(item => item.id === reading.plantId);
        const outcome = lightAssessment(plant?.profile ?? reading.profile, reading);
        return `<article class="reading-card"><div><strong>${safe(reading.spot)}</strong>
          <p class="muted">${safe(plant?.name ?? profiles[reading.profile].name)} · ${safe(instantFormat.format(new Date(reading.at)))}</p>
          <p>${safe(lightValue(reading))} · ${readingSources[reading.source]} · ${sunlight[reading.sun]}</p>
          ${tag(outcome.title, outcome.tone)}
          <p class="muted">${outcome.advice}</p></div>
          <button class="icon-button" type="button" data-action="delete-reading" ${plantAttr(reading.id)} aria-label="Messung für ${safe(reading.spot)} löschen">${icon("trash")}</button></article>`;
      }).join("")}</div>`;
  }

  function subjectOptions(plants, subject) {
    const options = plants.map(plant => `<option value="p:${safe(plant.id)}" ${selected("p:" + plant.id, subject)}>${safe(plant.name)}</option>`).join("");
    return (options ? `<optgroup label="Meine Pflanzen">${options}</optgroup>` : "")
      + `<optgroup label="Pflanzenprofile">${profilesOptions(subject)}</optgroup>`;
  }

  function lightHeader(mode) {
    return pageHeader("Lichtmesser", "Tageslicht prüfen und einen passenden Platz finden") + `
      <div class="segmented light-modes" role="group" aria-label="Messmethode">
        ${button("Kameravergleich", "light-mode", "", "camera", `data-mode="camera" aria-pressed="${mode === "camera"}"`)}
        ${button("Lux & Einschätzung", "light-mode", "", "sun", `data-mode="lux" aria-pressed="${mode === "lux"}"`)}
      </div>`;
  }

  function lightPage(data, draft, profile, estimate, demoName, sensorAvailable) {
    return lightHeader("lux") + `
      <div class="two-column">
        <section class="card card-padding stack" aria-labelledby="measure-title">
          <h2 id="measure-title" class="section-title">Standort prüfen</h2>
          ${sensorAvailable ? `<div class="sensor-box">
            <div class="sensor-head"><span class="feature-icon">${icon("sun")}</span><output id="sensor-value" class="sensor-value">— <small>lx</small></output>
              ${button("Sensor starten", "sensor", "secondary compact", "", 'id="sensor-button"')}
            </div>
            <p id="sensor-status" class="help" role="status">Halte einen unterstützten Gerätesensor auf Blatthöhe in Richtung des Lichts. Vermeide Schatten durch deine Hand.</p>
            <div id="sensor-tools" class="cluster" hidden>${button("Messwert übernehmen", "sensor-value", "soft compact", "check")}</div>
          </div>` : ""}
          ${demoName ? `<p class="notice" data-demo-light>Das Lichtprofil ist für die Beispielpflanze ${safe(demoName)} vorausgewählt. Du kannst eigene Standorte speichern.</p>` : ""}
          <form class="stack" data-form="light" novalidate>
            <div class="form-grid columns">
              <label class="field"><span id="light-subject-label">Pflanze oder Profil</span><select name="subject" aria-labelledby="light-subject-label" aria-describedby="light-profile">${subjectOptions(data.plants, draft.subject)}</select>
                <span class="help" id="light-profile">${lightLabels[profiles[profile].light]}</span></label>
              <label class="field"><span>Messplatz</span><input name="spot" placeholder="z. B. Bad, neben dem Fenster" maxlength="80" required value="${safe(draft.spot)}"></label>
              <label class="field"><span>Luxwert${optional}</span><input name="lux" inputmode="numeric" maxlength="6" placeholder="z. B. 4200" value="${safe(draft.lux)}">
                <span class="help">Ganze Zahl vom Luxmeter.</span></label>
              <label class="field"><span>Helligkeit ohne Luxwert</span><select name="visual"><option value="">Einschätzen …</option>
                  ${opts(visualLevels, draft.visual)}</select></label>
              <label class="field wide"><span>Direkte Sonne auf Blatthöhe</span><select name="sun">${opts(sunlight, draft.sun)}</select></label>
            </div>
            <div id="light-result">${lightResult(profile, estimate)}</div>${emptyError}
            <div class="form-actions"><button type="submit" class="button primary">${icon("check")} Standort speichern</button></div>
          </form>
          <details class="details-panel"><summary>Ohne Sensor einschätzen</summary>
            <p class="muted small">Halte tagsüber deine Hand über weißes Papier auf Blatthöhe. Kaum sichtbarer Schatten spricht für einen dunklen Platz, ein weicher für indirektes Licht. Eine klare Schattenkante in der Sonne weist auf direktes Licht hin. Prüfe morgens, mittags und nachmittags und notiere die direkte Sonne separat.</p>
          </details>
        </section>
        <section class="card card-padding stack" aria-labelledby="readings-title">
          <h2 id="readings-title" class="section-title">Gespeicherte Standorte</h2>
          <div id="readings-list" class="stack">${lightReadings(data.readings, data.plants, draft.subject, profile)}</div>
          <p class="help">Lux ist eine Momentaufnahme. Tagesdauer, Lichtquelle und Jahreszeit beeinflussen, wie gut der Platz passt.</p>
        </section>
      </div>`;
  }

  function cameraSlot(key, name, spotField, spot, photo, liveCamera) {
    const title = key === "ref" ? "Referenzplatz" : "Vergleichsplatz";
    const example = key === "ref" ? "z. B. Ostfenster" : "z. B. Badregal";
    const inputProps = 'type="file" accept="image/*,.heic,.heif" hidden';
    return `<fieldset class="camera-slot">
      <legend>${title}</legend>
      <label class="field"><span>${name}</span><input name="${spotField}" required maxlength="80" placeholder="${example}" value="${safe(spot)}"></label>
      <input ${inputProps} id="${key}-camera" data-photo="${key}" capture="environment">
      <input ${inputProps} id="${key}-photo" data-photo="${key}">
      <div class="cluster">
        ${button("Kamera öffnen", "camera-preview", "soft compact" + (liveCamera ? "" : " camera-capture"), "camera", `data-slot="${key}" aria-label="Kamera öffnen für ${title}"`)}
        ${button("Foto wählen", "camera-file", "secondary compact", "", `data-input="${key}-photo" aria-label="Foto wählen für ${title}"`)}
      </div>
      <p class="${photo.error ? "error-text" : "help"}" data-photo-status="${key}" role="status">${safe(photo.status || "Original aus der Fotomediathek oder aus Dateien wählen.")}</p>
      <details class="details-panel" data-exposure="${key}" ${photo.error ? "open" : ""}>
        <summary>Belichtung eingeben</summary>
        <p class="help">Auf dem iPhone findest du die Werte in „Fotos“ über die Info-Taste am Bild.</p>
        <div class="camera-values">
          ${[["aperture", "Blende", "f/1,8"], ["shutter", "Belichtungszeit", "1/120"], ["iso", "ISO", "100"]].map(([field, label, placeholder]) =>
            `<label class="field"><span>${label}</span><input name="${key}-${field}" data-exposure-value="${field}" data-slot="${key}" maxlength="26" placeholder="${placeholder}" value="${safe(photo[field])}"></label>`).join("")}
        </div>
      </details>
    </fieldset>`;
  }

  function cameraResult(difference, profile, sun) {
    return `<div class="light-output positive">
      <strong>${safe(BW.camera.outcome(difference))}</strong>
      <p class="small">${BW.camera.sunAdvice(profile, sun)}</p>
    </div>`;
  }

  function comparisonList(comparisons, plants) {
    return comparisons.length ? comparisons.map(item => {
      const plant = plants.find(plant => plant.id === item.plantId);
      const name = plant?.name ?? (item.profile === "custom" ? "" : profiles[item.profile].name);
      return `<article class="reading-card"><div><strong>${safe(item.reference)} und ${safe(item.target)}</strong>
        <p class="muted">${name ? safe(name) + " · " : ""}${safe(instantFormat.format(new Date(item.at)))}</p>
        ${tag(BW.camera.outcome(item.delta), "positive")}
        <p class="muted">${BW.camera.sunAdvice(plant?.profile ?? item.profile, item.sun)}</p></div>
        <button class="icon-button" data-action="delete-comparison" ${plantAttr(item.id)} type="button" aria-label="Vergleich ${safe(item.reference)} und ${safe(item.target)} löschen">${icon("trash")}</button></article>`;
    }).join("") : '<p class="muted">Hier findest du deine gespeicherten Lichtvergleiche.</p>';
  }

  function cameraPage(data, draft, liveCamera) {
    return lightHeader("camera") + `
      <div class="two-column camera-columns">
        <section class="card card-padding stack" aria-labelledby="camera-title">
          <h2 id="camera-title" class="section-title">Zwei Lichtplätze vergleichen</h2>
          <div class="notice camera-guide" role="note">
            <span class="feature-icon">${icon("camera")}</span>
            <div><p><strong>Fotografiere dasselbe matte weiße Blatt an beiden Plätzen auf Blatthöhe.</strong></p>
            <p>Halte Papier und Handy jeweils gleich. Das Blatt soll das Bild füllen. Verwende die 1×-Kamera, automatische Belichtung und fotografiere ohne Blitz und eigenen Schatten.</p>
            <p>Du kannst auch beide Bilder in der Kamera-App aufnehmen und danach die Originale auswählen.</p></div>
          </div>
          <form class="stack" data-form="camera" novalidate>
            <div class="camera-slots">
              ${cameraSlot("ref", "Name des Referenzplatzes", "reference", draft.reference, draft.ref, liveCamera)}
              ${cameraSlot("other", "Name des Vergleichsplatzes", "target", draft.target, draft.other, liveCamera)}
            </div>
            <div class="form-grid columns">
              <label class="field"><span>Pflanze oder Profil</span><select name="subject">${subjectOptions(data.plants, draft.subject)}</select></label>
              <label class="field"><span>Direkte Sonne am Vergleichsplatz</span><select name="sun">${opts(sunlight, draft.sun)}</select></label>
            </div>
            <div id="camera-result" aria-live="polite"></div>${emptyError}
            <div class="form-actions"><button class="button primary" type="submit">${icon("check")} Vergleich speichern</button></div>
          </form>
        </section>
        <section class="card card-padding stack" aria-labelledby="comparison-title">
          <h2 id="comparison-title" class="section-title">Gespeicherte Vergleiche</h2>
          <div id="comparisons-list">${comparisonList(data.comparisons, data.plants)}</div>
          <p class="help">Die Belichtungsdaten ergeben einen ungefähren Vergleich. Die Fotos bleiben auf diesem Gerät. Wähle als Referenz möglichst einen Platz, an dem die Pflanze gut wächst.</p>
        </section>
      </div>`;
  }

  function cameraDialog(key) {
    const title = key === "ref" ? "Referenzplatz fotografieren" : "Vergleichsplatz fotografieren";
    return `<div class="dialog-body">${dialogHeader(title, "Halte das Blatt gleichmäßig ins Bild. Warte, bis sich die Belichtung beruhigt hat.")}
      <video id="camera-preview-video" class="camera-video" autoplay muted playsinline hidden aria-label="Kameravorschau"></video>
      <p id="camera-preview-status" class="notice" role="status">Rückkamera wird geöffnet …</p>
      <div class="form-actions">
        ${button("Foto aus Dateien oder Mediathek wählen", "camera-fallback", "secondary", "", `data-slot="${key}"`)}
        ${button("Foto auswerten", "camera-take", "primary", "camera", "disabled")}
      </div>
    </div>`;
  }

  function knowledgePage() {
    return pageHeader("Pflegewissen", "Worauf du bei deiner Pflanzenrunde achten kannst") + `
      <div class="two-column">
        <section class="card guide-card"><span class="feature-icon">${icon("drop")}</span><h2 class="section-title">Feuchtigkeit prüfen</h2>
          <ol class="guide-list">
            <li>Bei den meisten Erdsubstraten in den oberen 2–3 cm fühlen. Feuchtigkeitsliebende Pflanzen prüfst du oberflächlicher. Bei großen Töpfen und Sukkulenten auch tiefer testen.</li>
            <li>Ein Holzstäbchen vorsichtig entlang des Topfrands einführen und auf anhaftende, feuchte Erde achten. Bei Rinde eher Gewicht, sichtbare Wurzeln und Kondenswasser prüfen.</li>
            <li>Den Übertopf auf stehendes Wasser kontrollieren. Gieße erst, wenn es laut Pflanzenprofil und Feuchtezustand passt.</li>
          </ol>
          <p class="sources small">${sourceLink("University of Minnesota Extension: Gießen und Wachstum", "https://extension.umn.edu/houseplants/spring-houseplant-care")}</p>
        </section>
        <section class="card guide-card"><span class="feature-icon warm">${icon("sun")}</span><h2 class="section-title">Licht, Wärme und Zugluft</h2>
          <ul class="guide-list">
            <li>Miss auf Blatthöhe zu mehreren Uhrzeiten. Vergleiche ähnliche Wetterbedingungen und beobachte, wann direkte Sonne auf die Blätter fällt.</li>
            <li>Fenster, durchsichtige Vorhänge und der Abstand verändern die Helligkeit. Ein Bad ohne Tageslicht braucht für Pflanzen auf Dauer geeignete Zusatzbeleuchtung.</li>
            <li>Achte auf kalte Scheiben, Luftzug beim Lüften und trockene Warmluft der Heizung. Gewöhne Pflanzen an stärkere Sonne langsam.</li>
          </ul>
          <p class="sources small">${sourceLink("University of Minnesota Extension: Licht für Zimmerpflanzen", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/lighting-for-indoor-plants")}</p>
        </section>
        <section class="card guide-card"><span class="feature-icon">${icon("sprout")}</span><h2 class="section-title">Düngen & umtopfen</h2>
          <ul class="guide-list">
            <li>In der Wachstumszeit bei sichtbarem Wachstum düngen. Starte bei vielen Zimmerpflanzen mit etwa der halben Etikettdosis. Der Steckbrief nennt Düngertyp und Prüfabstand.</li>
            <li>Beim Umtopfen meist nur eine Topfgröße größer wählen und auf ein Abflussloch achten. Frisches Substrat verändert die Feuchte. Anfänglich häufiger prüfen.</li>
            <li>Blattwerk plant nach dem Umtopfen sechs Wochen Düngepause als Richtwert. Beachte die angegebene Wirkdauer vorgedüngter Erde.</li>
          </ul>
          <p class="sources small">${sourceLink("University of Minnesota Extension: Dünger nach dem Einpflanzen", "https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/fertilizing-and-watering-container-plants")}</p>
        </section>
        <section class="card guide-card"><span class="feature-icon warm">${icon("search")}</span><h2 class="section-title">Auffälligkeiten einordnen</h2>
          <p>Ähnliche Symptome können verschiedene Ursachen haben. Prüfe zuerst Feuchte, Licht, Wurzeln und Blattunterseiten.</p>
          ${Object.values(observations).filter(item => item.advice).map(item =>
            `<details class="details-panel"><summary>${item.name}</summary><p class="small muted">${item.advice}</p></details>`).join("")}
          <p class="sources small">${sourceLink("University of Minnesota Extension: Schädlinge an Zimmerpflanzen", "https://extension.umn.edu/yard-and-garden-insects/insects-on-indoor-plants")}</p>
        </section>
      </div>`;
  }

  function backupPage(data, hasBrokenCopy) {
    return pageHeader("Datensicherung", "Sichern und auf einem anderen Gerät weitermachen") + `
      <div class="backup-grid">
        <section class="card guide-card"><span class="feature-icon">${icon("download")}</span><h2 class="section-title">Sicherung herunterladen</h2>
          <p>Die JSON-Datei enthält deine Pflanzen, eigenen Fotos, Pflegeverläufe und Lichtmessungen.</p>
          <p class="muted small">${countText(data.plants.length, "Pflanze", "Pflanzen")} · ${countText(data.readings.length, "Lichtmessung", "Lichtmessungen")} · ${countText(data.comparisons.length, "Kameravergleich", "Kameravergleiche")}</p>
          <div class="cluster">
            ${hasBrokenCopy ? button("Rohdaten sichern", "raw-export", "primary", "download") : button("JSON exportieren", "export", "primary", "download")}
          </div>
        </section>
        <section class="card guide-card"><span class="feature-icon">${icon("upload")}</span><h2 class="section-title">Sicherung wiederherstellen</h2>
          <p>Blattwerk prüft die Datei und fragt vor dem Ersetzen deiner vorhandenen Daten nach.</p>
          <input type="file" id="import-file" accept=".json,application/json" hidden>
          <p id="import-status" class="error-text" role="alert" hidden></p>
          <div class="cluster">${button("JSON-Datei wählen", "import", "secondary", "upload")}</div>
        </section>
      </div>
      <p class="notice small" style="margin-top:.85rem">Deine Änderungen werden automatisch in diesem Browser gespeichert. Für einen Gerätewechsel oder eine andere Webadresse exportiere eine Sicherung und importiere sie dort.</p>`;
  }

  function calendarDialog(data, today, upcoming, start) {
    return `<div class="dialog-body">${dialogHeader("Kalender-Erinnerung", "Öffne die ICS-Datei in deinem Handy-Kalender und aktiviere dort die Benachrichtigung.")}
      <form class="stack" data-form="calendar" novalidate>
        <fieldset class="stack"><legend>Welche Erinnerung möchtest du?</legend>
          <label class="choice-card"><input type="radio" name="mode" value="repeat" checked><span>Regelmäßige Pflanzenrunde
            <span class="help">Eine wiederkehrende Erinnerung an deinen Rundgang.</span></span></label>
          <label class="choice-card"><input type="radio" name="mode" value="upcoming" ${upcoming ? "" : "disabled"}><span>Geplante Aufgaben der nächsten 30 Tage
            <span class="help">${upcoming ? "Ein Termin je Tag mit offenen Aufgaben. Überfällige Aufgaben kommen in den ersten Termin." : "Aktuell stehen keine eigenen Aufgaben in den nächsten 30 Tagen an."}</span></span></label>
        </fieldset>
        <div class="form-grid columns">
          <label class="field" data-repeat><span>Beginn</span><input type="date" name="start" min="${today}" max="2199-12-31" required value="${start}"></label>
          <label class="field" data-repeat><span>Wiederholen</span><select name="every">${intervals.map(days => `<option value="${days}" ${selected(days, data.prefs.calendarDays)}>Alle ${days} Tage</option>`).join("")}</select></label>
          <label class="field"><span>Uhrzeit</span><input type="time" name="time" required value="${data.prefs.calendarTime}"></label>
        </div>
        <p class="help">Kalendertermine übernehmen den Stand beim Export. Entferne bei einem neuen Import bei Bedarf alte Termine.</p>${emptyError}
        <div class="form-actions">${button("Schließen", "close")}<button type="submit" class="button primary">${icon("download")} ICS herunterladen</button></div>
      </form></div>`;
  }

  function moreMenu() {
    return `<div class="dialog-body">${dialogHeader("Mehr")}
      <div class="menu-links">
        ${button("Kalender-Erinnerung", "calendar", "secondary", "calendar")}
        ${button("Push-Erinnerungen", "push", "secondary", "bell")}
        ${button("App installieren", "install", "secondary", "phone")}
        ${link("Datensicherung", "sicherung", "secondary", "archive")}
      </div></div>`;
  }

  function pushDialog(settings, message = "") {
    const canReceive = BW.push.supported();
    const active = Boolean(settings?.active);
    const next = active && Number.isFinite(settings.nextAt)
      ? "Nächste Pflanzenrunde am " + instantFormat.format(new Date(settings.nextAt)) + "." : "";
    return `<div class="dialog-body">${dialogHeader("Push-Erinnerungen", "Erinnert dich an deine Pflanzenrunde, auch wenn Blattwerk geschlossen ist.")}
      ${!canReceive ? '<p class="notice warning small">Öffne Blattwerk auf dem iPhone über das Symbol auf dem Home-Bildschirm. Aktiviere dort die Mitteilungen.</p>' : ""}
      <p class="notice" id="push-status" role="status">${safe(message || (active ? next || "Push ist eingerichtet." : settings ? "Push-Dienst verbunden. Wähle jetzt deinen Zeitplan." : "Verbinde zuerst einen eingerichteten Blattwerk-Push-Dienst."))}</p>
      ${settings ? `<form class="stack" data-form="push-plan" novalidate>
          <div class="form-grid columns">
            <label class="field"><span>Uhrzeit</span><input name="pushTime" type="time" value="${safe(settings.time)}" required></label>
            <label class="field"><span>Wiederholen</span><select name="pushDays">${BW.push.daysOptions.map(days =>
              `<option value="${days}" ${selected(days, settings.days)}>${days === 1 ? "Täglich" : "Alle " + days + " Tage"}</option>`).join("")}</select></label>
          </div>
          ${emptyError}
          <div class="form-actions">
            ${active ? button("Test senden", "push-test", "secondary", "bell") : ""}
            <button type="submit" class="button primary" ${canReceive ? "" : "disabled"}>${icon("bell")} ${active ? "Zeitplan speichern" : "Push aktivieren"}</button>
            ${active ? button("Pausieren", "push-off", "secondary") : ""}
          </div>
        </form>` : ""}
      ${!active ? `${settings ? '<details class="details-panel"><summary>Push-Dienst wechseln</summary>' : ""}
        ${settings ? "" : '<p class="help">Adresse und Code erhältst du bei der einmaligen Einrichtung am Laptop. Die Anleitung liegt im Paket „Blattwerk-Push-Dienst“.</p>'}
        <form class="stack" data-form="push-connect" novalidate>
          <label class="field"><span>Adresse des Push-Dienstes</span><input name="pushService" placeholder="https://…workers.dev" type="url" autocomplete="off" maxlength="240" value="${safe(settings?.service ?? "")}" required></label>
          <label class="field"><span>Einrichtungscode</span><input name="pushCode" type="password" required maxlength="100" autocomplete="off"></label>
          ${emptyError}<div class="form-actions"><button type="submit" class="button secondary">Dienst verbinden</button></div>
        </form>
        ${settings ? "</details>" : ""}` : ""}
      <p class="help">Der Dienst erhält die Browser-Anmeldung, Uhrzeit und Zeitzone. Push wird für jedes Gerät einzeln eingerichtet.</p>
    </div>`;
  }

  function installDialog(standalone, offer) {
    return `<div class="dialog-body">${dialogHeader(standalone ? "Offline-Nutzung" : "Blattwerk installieren")}
      <p class="notice" id="offline-status" role="status"></p>
      ${offer ? button("Jetzt installieren", "install-prompt", "primary", "phone") : ""}
      ${standalone ? "" : `<div class="stack">
        <p><strong>Auf dem iPhone</strong><br>Öffne die App in Safari. Wähle „Teilen“, „Zu Home-Bildschirm hinzufügen“ und „Als Web-App öffnen“.</p>
        <p><strong>Am Computer</strong><br>Nutze in Edge oder Chrome die Installationsoption in der Adressleiste oder im Browsermenü.</p>
      </div>`}
      <p class="help">Öffne die App nach dem Installieren einmal mit Verbindung. Wenn sie als offline bereit angezeigt wird, kannst du sie anschließend ohne Internet öffnen.</p>
    </div>`;
  }

  Object.assign(BW, {
    ui: {
      icon, safe, button, countText, dashboard, plantsPage, plantCards, plantForm, plantDetail, profileMatches, profilesOptions, photoSource,
      taskForm, lightPage, lightReadings, lightResult, cameraPage, cameraResult, cameraDialog, comparisonList,
      knowledgePage, backupPage, calendarDialog, moreMenu, installDialog, pushDialog, numberFormat
    }
  });
})();
