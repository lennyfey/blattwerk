(() => {
  "use strict";

  const BW = window.BW;
  const ui = BW.ui;
  const view = document.querySelector("#view");
  const dialog = document.querySelector("#dialog");
  const dialogContent = document.querySelector("#dialog-content");
  const confirmation = document.querySelector("#confirmation");
  const confirmationContent = document.querySelector("#confirmation-content");
  const banner = document.querySelector("#storage-banner");
  const toast = document.querySelector("#toast");
  const views = ["uebersicht", "pflanzen", "licht", "wissen", "sicherung"];
  const route = () => views.find(name => location.hash === "#" + name) ?? "uebersicht";
  const field = (form, name) => form.elements.namedItem(name);
  const newLightDraft = () => ({ subject: "custom", spot: "", lux: "", visual: "", sun: "unknown", sensorLux: "" });
  const sensorAvailable = window.isSecureContext && typeof window.AmbientLightSensor === "function";
  const inAppCamera = window.isSecureContext && Boolean(navigator.mediaDevices?.getUserMedia)
    && typeof window.ImageCapture?.prototype?.takePhoto === "function";
  const photoKeys = ["ref", "other"];

  let activeView = route();
  let database = BW.blankData();
  let lastRaw = null;
  let storageProblem = "";
  let recoveryCopy = null;
  let waitingForSync = false;
  let demoPlants = BW.examplePlants(BW.day());
  let displayedDay = BW.day();
  let search = "";
  let room = "";
  let taskTab = "due";
  let roundRunning = false;
  let lightMode = "camera";
  let lightDraft = newLightDraft();
  let cameraDraft = BW.camera.draft();
  let cameraSession = null;
  let demoLightName = "";
  let liveSensor = null;
  let sensorSamples = [];
  let sensorTimer = null;
  let sensorValue = null;
  let sensorMessage = "";
  let toastTimer = null;
  let focusBeforeDialog = null;
  let confirmCallback = null;
  let fileRequest = 0;
  let plantPhotoDraft = null;
  let installPrompt = null;
  let offlineState = window.isSecureContext && "serviceWorker" in navigator ? "pending" : "unavailable";

  const inDemo = () => !storageProblem && !database.plants.length && database.prefs.examples;
  const visiblePlants = () => inDemo() ? demoPlants : database.plants;
  const findPlant = id => visiblePlants().find(plant => plant.id === id);
  const selectedPlant = (subject = lightDraft.subject) => database.plants.find(plant => "p:" + plant.id === subject);
  const selectedProfile = (subject = lightDraft.subject) => selectedPlant(subject)?.profile ?? (BW.own(BW.profiles, subject) ? subject : "custom");

  function notify(text) {
    clearTimeout(toastTimer);
    toast.textContent = text;
    toast.classList.add("on");
    toastTimer = setTimeout(() => toast.classList.remove("on"), 5200);
  }

  function loadFromBrowser() {
    let raw;
    try {
      raw = localStorage.getItem(BW.key);
    } catch {
      storageProblem = "Der Browser blockiert den lokalen Speicher. Öffne Blattwerk in einem Browserfenster mit aktiviertem Website-Speicher.";
      return;
    }
    lastRaw = raw;
    recoveryCopy = null;
    storageProblem = "";
    try {
      database = raw === null ? BW.blankData() : BW.readData(raw);
    } catch {
      database = BW.blankData(false);
      recoveryCopy = raw;
      storageProblem = "Die gespeicherten Daten konnten nicht gelesen werden. In der Datensicherung kannst du die Rohdaten sichern oder eine gültige Sicherung wiederherstellen.";
    }
  }

  function persist(next, recover = false) {
    if (storageProblem && !recover) throw new Error(storageProblem);
    if (waitingForSync) throw new Error("Ein anderer Tab hat die Daten geändert. Schließe dieses Formular und öffne es erneut.");
    const raw = BW.writeData(next);
    try {
      if (localStorage.getItem(BW.key) !== lastRaw) {
        waitingForSync = true;
        throw new Error("Ein anderer Tab hat die Daten geändert. Schließe dieses Formular und öffne es erneut.");
      }
      localStorage.setItem(BW.key, raw);
    } catch (error) {
      if (waitingForSync) throw error;
      throw new Error("Speichern war nicht möglich. Prüfe die Speichereinstellungen des Browsers oder sichere und entferne ältere Einträge.");
    }
    database = next;
    lastRaw = raw;
    storageProblem = "";
    recoveryCopy = null;
  }

  function syncIfNeeded() {
    if (!waitingForSync || dialog.open || confirmation.open) return;
    waitingForSync = false;
    loadFromBrowser();
    render();
    notify("Änderungen aus dem anderen Tab wurden geladen.");
  }

  function updatePlant(plant, updating) {
    if (inDemo()) {
      demoPlants = updating ? demoPlants.map(item => item.id === plant.id ? updating : item) : demoPlants.filter(item => item.id !== plant.id);
      return;
    }
    const plants = updating ? database.plants.map(item => item.id === plant.id ? updating : item) : database.plants.filter(item => item.id !== plant.id);
    const unlink = item => item.plantId === plant.id ? { ...item, plantId: null, profile: plant.profile } : item;
    const readings = updating ? database.readings : database.readings.map(unlink);
    const comparisons = updating ? database.comparisons : database.comparisons.map(unlink);
    persist({ ...database, plants, readings, comparisons });
  }

  function readingDraft() {
    const lux = lightDraft.lux.trim();
    if (lux) {
      if (!/^\d{1,6}$/.test(lux) || Number(lux) > 200000) return null;
      return { lux: Number(lux), visual: null, sun: lightDraft.sun, source: lux === lightDraft.sensorLux ? "sensor" : "manual" };
    }
    return BW.own(BW.visualLevels, lightDraft.visual)
      ? { lux: null, visual: lightDraft.visual, sun: lightDraft.sun, source: "estimate" }
      : null;
  }

  function render() {
    displayedDay = BW.day();
    const plants = visiblePlants();
    const demo = inDemo();
    if (room && !plants.some(plant => plant.place === room)) room = "";
    if (lightDraft.subject.startsWith("p:") && !selectedPlant()) lightDraft.subject = "custom";
    if (cameraDraft.subject.startsWith("p:") && !selectedPlant(cameraDraft.subject)) cameraDraft.subject = "custom";
    banner.hidden = !storageProblem;
    banner.innerHTML = storageProblem
      ? `<p>${ui.safe(storageProblem)}</p>${activeView !== "sicherung" ? '<a href="#sicherung">Zur Datensicherung</a>' : ""}`
      : "";
    for (const control of document.querySelectorAll("[data-nav]")) {
      if (control.dataset.nav === activeView) control.setAttribute("aria-current", "page");
      else control.removeAttribute("aria-current");
    }
    switch (activeView) {
      case "pflanzen": view.innerHTML = ui.plantsPage(plants, displayedDay, search, room, demo); break;
      case "licht":
        if (lightMode === "camera") {
          view.innerHTML = ui.cameraPage(database, cameraDraft, inAppCamera);
          updateCameraResult();
        } else {
          view.innerHTML = ui.lightPage(database, lightDraft, selectedProfile(), readingDraft(), demoLightName, sensorAvailable);
          updateSensorDisplay();
          field(view.querySelector("form"), "visual").disabled = Boolean(lightDraft.lux.trim());
        }
        break;
      case "wissen": view.innerHTML = ui.knowledgePage(); break;
      case "sicherung": view.innerHTML = ui.backupPage(database, recoveryCopy !== null); break;
      default: view.innerHTML = ui.dashboard(plants, displayedDay, taskTab, demo);
    }
    BW.photos.populate(view);
  }

  function goTo(name) {
    if (route() !== name || location.hash !== "#" + name) {
      location.hash = name;
      return;
    }
    if (dialog.open) closeDialog();
    render();
    window.scrollTo(0, 0);
    view.querySelector("h1")?.focus({ preventScroll: true });
  }

  function present(markup, autofocus = "#dialog-title") {
    if (!dialog.open) focusBeforeDialog = document.activeElement;
    dialogContent.innerHTML = markup;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    dialogContent.querySelector(autofocus)?.focus({ preventScroll: true });
    BW.photos.populate(dialogContent);
  }

  function closeDialog() {
    roundRunning = false;
    if (dialog.open) dialog.close();
  }

  function ask(title, text, label, callback, tone = "danger") {
    confirmCallback = callback;
    confirmationContent.innerHTML = `<div class="dialog-body">
      <header class="dialog-head"><h2 id="confirmation-title">${ui.safe(title)}</h2></header>
      <p>${ui.safe(text)}</p><div class="form-actions">
        ${ui.button("Abbrechen", "cancel-confirm")}
        ${ui.button(label, "confirm", tone)}
      </div></div>`;
    confirmation.showModal();
    confirmationContent.querySelector('[data-action="cancel-confirm"]').focus();
  }

  function openPlantForm(plant = null) {
    if (storageProblem) {
      goTo("sicherung");
      return;
    }
    const choices = [...new Set(database.plants.map(item => item.place))].sort((a, b) => a.localeCompare(b, "de"));
    clearPlantPhotoDraft();
    plantPhotoDraft = { original: plant?.photoId ?? null, file: null, url: null, removed: false, pending: false, ticket: 0 };
    present(ui.plantForm(plant, choices, BW.day(), !plant || !inDemo()));
    if (plant) dialog.querySelector("form").dataset.profileChosen = "true";
  }

  function clearPlantPhotoDraft() {
    if (plantPhotoDraft?.url) URL.revokeObjectURL(plantPhotoDraft.url);
    plantPhotoDraft = null;
  }

  function updatePlantPhoto(form, text = "", error = false) {
    const preview = form.querySelector("#plant-photo-preview");
    const draft = plantPhotoDraft;
    if (!preview || !draft) return;
    const savedPhoto = !draft.removed && !draft.file ? draft.original : "";
    preview.dataset.plantPhoto = savedPhoto || "";
    preview.src = draft.url || ui.photoSource(field(form, "profile").value);
    const status = form.querySelector("#plant-photo-status");
    status.textContent = text || (savedPhoto ? "Eigenes Foto gespeichert." : draft.file ? "Foto zum Speichern bereit."
      : "Dein Foto erscheint auf der Pflanzenkarte.");
    status.className = error ? "error-text" : "help";
    form.querySelector('[data-action="plant-photo-remove"]').hidden = !savedPhoto && !draft.file && !draft.pending;
    if (savedPhoto) BW.photos.populate(form);
  }

  async function choosePlantPhoto(input) {
    const form = input.form;
    const file = input.files[0];
    input.value = "";
    const draft = plantPhotoDraft;
    if (!file || !draft || form.dataset.saving) return;
    const ticket = ++draft.ticket;
    draft.pending = true;
    updatePlantPhoto(form, "Foto wird vorbereitet …");
    try {
      const blob = await BW.photos.prepare(file);
      if (draft !== plantPhotoDraft || ticket !== draft.ticket || !form.isConnected) return;
      if (draft.url) URL.revokeObjectURL(draft.url);
      Object.assign(draft, { file: blob, url: URL.createObjectURL(blob), removed: false, pending: false });
      updatePlantPhoto(form);
    } catch (error) {
      if (draft !== plantPhotoDraft || ticket !== draft.ticket || !form.isConnected) return;
      draft.pending = false;
      updatePlantPhoto(form, error.message, true);
    }
  }

  function removePlantPhoto(form) {
    const draft = plantPhotoDraft;
    if (!draft || form.dataset.saving) return;
    if (draft.url) URL.revokeObjectURL(draft.url);
    Object.assign(draft, { ticket: draft.ticket + 1, file: null, url: null, pending: false, removed: true });
    updatePlantPhoto(form, "Das eigene Foto wird beim Speichern entfernt.");
  }

  function findProfiles(form, chosen = field(form, "profile").value) {
    const query = field(form, "profileSearch").value;
    field(form, "profile").innerHTML = ui.profilesOptions(chosen, query);
    const count = ui.profileMatches(query).length;
    const help = form.querySelector("#profile-help");
    help.textContent = query.trim() ? (count ? ui.countText(count, "passendes Profil", "passende Profile")
      : "Keine passende Art gefunden. Versuche einen anderen Namen oder wähle eine eigene Art.")
      : `Suche in ${count} Arten oder wähle eine eigene Art.`;
  }

  const dueTasks = () => {
    const today = BW.day();
    return BW.tasksFor(visiblePlants(), today).filter(task => task.date <= today);
  };

  function openTask(plant, kind, remaining = 0) {
    if (!plant) return;
    present(ui.taskForm(plant, kind, BW.day(), remaining, inDemo()));
  }

  function continueRound() {
    const tasks = dueTasks();
    if (tasks.length) {
      roundRunning = true;
      const { plant, kind } = tasks[0];
      openTask(plant, kind, tasks.length);
    } else {
      closeDialog();
      notify("Pflanzenrunde abgeschlossen.");
    }
  }

  function openCalendar() {
    const now = new Date();
    const today = BW.day(now);
    const next = new Date(`${today}T${database.prefs.calendarTime}`) > now ? today : BW.shift(today, 1);
    const upcoming = BW.roundEvents(BW.tasksFor(database.plants, today), database.prefs.calendarTime, now).length;
    present(ui.calendarDialog(database, today, upcoming, next));
  }

  function formError(form, text, input = null) {
    const output = form.querySelector("[data-form-error]");
    output.textContent = text;
    output.hidden = !text;
    if (input) {
      input.setAttribute("aria-invalid", "true");
      input.focus();
    }
    return false;
  }

  function clearError(form) {
    for (const input of form.querySelectorAll('[aria-invalid="true"]')) input.removeAttribute("aria-invalid");
    formError(form, "");
  }

  function intervalValue(input) {
    if (input.validity.badInput || (input.value && (!/^\d+$/.test(input.value) || !input.validity.valid))) return NaN;
    return input.value ? Number(input.value) : null;
  }

  async function submitPlant(form) {
    if (form.dataset.saving) return false;
    const name = field(form, "name").value.trim();
    const place = field(form, "place").value.trim();
    const repotted = field(form, "repottedOn");
    const every = field(form, "interval");
    const interval = intervalValue(every);
    const today = BW.day();
    const profile = field(form, "profile").value;
    if (!name) return formError(form, "Gib der Pflanze einen Namen.", field(form, "name"));
    if (!place) return formError(form, "Gib einen Standort an, zum Beispiel Bad.", field(form, "place"));
    if (repotted.validity.badInput || (repotted.value && (!BW.validDay(repotted.value) || repotted.value > today))) {
      return formError(form, "Gib ein gültiges Umtopfdatum bis einschließlich heute ein.", repotted);
    }
    if (Number.isNaN(interval)) return formError(form, "Der Prüfrhythmus muss eine ganze Zahl von 1 bis 90 Tagen sein.", every);
    if (!BW.own(BW.profiles, profile)) return formError(form, "Wähle eines der Pflanzenprofile.", field(form, "profile"));
    const existing = form.dataset.id ? findPlant(form.dataset.id) : null;
    if (form.dataset.id && !existing) return formError(form, "Die Pflanze ist nicht mehr vorhanden.");
    if (!existing && database.plants.length >= BW.limits.plants) return formError(form, "Es sind bereits 250 Pflanzen angelegt.");
    const draft = plantPhotoDraft;
    if (draft?.pending) return formError(form, "Das Foto wird noch vorbereitet.");
    let photoId = draft?.removed ? null : existing?.photoId ?? null;
    let plant;
    const stagedId = draft?.file ? BW.id() : null;
    const saveButton = form.querySelector('[type="submit"]');
    form.dataset.saving = "true";
    saveButton.disabled = true;
    const draftDetails = { name, place, profile, notes: field(form, "notes").value.trim(), repottedOn: repotted.value || null, interval };
    try {
      if (stagedId) {
        await BW.photos.put([[stagedId, draft.file]]);
        if (!form.isConnected || !dialog.open || draft !== plantPhotoDraft) {
          void BW.photos.remove([stagedId]).catch(() => {});
          return false;
        }
        photoId = stagedId;
      }
      const details = { ...draftDetails, photoId };
      if (existing) {
        plant = { ...existing, ...details };
        updatePlant(existing, plant);
      } else {
        plant = { ...details, id: BW.id(), createdOn: today, history: [] };
        persist({ ...database, prefs: { ...database.prefs, examples: false }, plants: [...database.plants, plant] });
      }
    } catch (error) {
      if (stagedId) void BW.photos.remove([stagedId]).catch(() => {});
      throw error;
    } finally {
      delete form.dataset.saving;
      saveButton.disabled = false;
    }
    if (existing?.photoId && existing.photoId !== photoId) void BW.photos.remove([existing.photoId]).catch(() => {});
    clearPlantPhotoDraft();
    search = "";
    room = "";
    taskTab = "due";
    render();
    present(ui.plantDetail(plant, today, inDemo()));
    notify(existing ? "Änderungen gespeichert." : "Steckbrief angelegt.");
    return true;
  }

  function submitTask(form, kind) {
    const plant = findPlant(form.dataset.id);
    if (!plant) return formError(form, "Diese Pflanze ist nicht mehr vorhanden.");
    const on = BW.day();
    const note = field(form, "note").value.trim();
    if (plant.history.length >= BW.limits.history) return formError(form, "Der Pflegeverlauf ist voll. Sichere deine Daten und entferne bei Bedarf Einträge im Steckbrief.");
    let item;
    if (kind === "check") {
      const moisture = field(form, "moisture").value;
      const followUpControl = field(form, "followUp");
      const followUp = intervalValue(followUpControl);
      if (!BW.own(BW.moistureLevels, moisture)) return formError(form, "Wähle aus, wie feucht das Substrat ist.", form.querySelector('[name="moisture"]'));
      if (Number.isNaN(followUp)) return formError(form, "Gib für die nächste Prüfung 1 bis 90 ganze Tage ein.", followUpControl);
      item = {
        kind, on, note, moisture, followUp, watered: field(form, "watered").checked, leaves: field(form, "leaves").checked,
        location: field(form, "location").checked, finding: field(form, "finding").value
      };
    } else {
      const choice = field(form, "fertilized").value;
      if (choice !== "yes" && choice !== "no") return formError(form, "Wähle aus, ob du gedüngt oder die Düngung verschoben hast.", form.querySelector('[name="fertilized"]'));
      item = { kind, on, note, fertilized: choice === "yes" };
    }
    const history = [item, ...plant.history].sort((a, b) => b.on.localeCompare(a.on));
    updatePlant(plant, { ...plant, history });
    render();
    if (roundRunning) continueRound();
    else {
      closeDialog();
      notify("Pflege im Verlauf gespeichert.");
    }
    return true;
  }

  function updateTaskAdvice(form) {
    const plant = findPlant(form.dataset.id);
    if (!plant) return;
    const moisture = field(form, "moisture").value;
    const advice = dialogContent.querySelector("#water-advice");
    advice.textContent = BW.wateringAdvice(BW.profiles[plant.profile], moisture);
    advice.hidden = !advice.textContent;
    advice.classList.toggle("warning", moisture === "wet");
    const finding = dialogContent.querySelector("#finding-advice");
    finding.textContent = BW.observations[field(form, "finding").value].advice;
    finding.hidden = !finding.textContent;
  }

  function submitCalendar(form) {
    const mode = field(form, "mode").value;
    const time = field(form, "time").value;
    const every = Number(field(form, "every").value);
    const now = new Date();
    const start = field(form, "start").value;
    if (!BW.validTime(time)) return formError(form, "Wähle eine gültige Uhrzeit.", field(form, "time"));
    let events;
    if (mode === "repeat") {
      if (!BW.validDay(start) || new Date(`${start}T${time}`) <= now) {
        return formError(form, "Der Beginn muss in der Zukunft liegen. Wähle ein späteres Datum oder eine spätere Uhrzeit.", field(form, "start"));
      }
      if (!BW.intervals.includes(every)) return formError(form, "Wähle einen der verfügbaren Abstände.", field(form, "every"));
      events = [{
        uid: "runde-" + start, date: start, time, every,
        title: "Blattwerk: Pflanzenrunde", text: "Öffne Blattwerk. Prüfe Feuchtigkeit, Blätter und Standort. Gieße nach Bedarf."
      }];
    } else {
      events = BW.roundEvents(BW.tasksFor(database.plants, BW.day(now)), time, now);
      if (!events.length) return formError(form, "In den nächsten 30 Tagen sind keine eigenen Aufgaben geplant.");
    }
    const prefs = { ...database.prefs, calendarTime: time, calendarDays: mode === "repeat" ? every : database.prefs.calendarDays };
    if (!storageProblem && (time !== database.prefs.calendarTime || prefs.calendarDays !== database.prefs.calendarDays)) persist({ ...database, prefs });
    BW.download(mode === "repeat" ? "blattwerk-pflanzenrunde.ics" : "blattwerk-pflegetermine.ics", BW.calendarFile(events, now), "text/calendar;charset=utf-8");
    closeDialog();
    notify("ICS-Datei bereit. Öffne sie in deinem Kalender.");
    return true;
  }

  function updateLightForm(form, includeList = false) {
    lightDraft.subject = field(form, "subject").value;
    lightDraft.spot = field(form, "spot").value;
    lightDraft.lux = field(form, "lux").value;
    lightDraft.visual = field(form, "visual").value;
    lightDraft.sun = field(form, "sun").value;
    field(form, "visual").disabled = Boolean(lightDraft.lux.trim());
    const profile = selectedProfile();
    view.querySelector("#light-profile").textContent = BW.lightLabels[BW.profiles[profile].light];
    view.querySelector("#light-result").innerHTML = ui.lightResult(profile, readingDraft());
    if (includeList) {
      view.querySelector("#readings-list").innerHTML = ui.lightReadings(database.readings, database.plants, lightDraft.subject, profile);
    }
  }

  function submitLight(form) {
    updateLightForm(form);
    const spot = lightDraft.spot.trim();
    const draft = readingDraft();
    if (!spot) return formError(form, "Gib den Messplatz ein, zum Beispiel Badfenster.", field(form, "spot"));
    if (!draft) return lightDraft.lux.trim()
      ? formError(form, "Gib einen ganzzahligen Luxwert von 0 bis 200000 ein.", field(form, "lux"))
      : formError(form, "Gib einen Luxwert ein oder wähle eine Helligkeitsschätzung.", field(form, "visual"));
    if (database.readings.length >= BW.limits.readings) return formError(form, "Es sind bereits 300 Lichtmessungen gespeichert. Sichere und entferne bei Bedarf ältere Messwerte.");
    const reading = {
      ...draft, id: BW.id(), spot, at: new Date().toISOString(),
      plantId: selectedPlant()?.id ?? null, profile: selectedProfile()
    };
    persist({ ...database, readings: [reading, ...database.readings] });
    updateLightForm(form, true);
    notify("Standortmessung gespeichert.");
    return true;
  }

  function updateCameraResult() {
    const output = view.querySelector("#camera-result");
    if (!output) return;
    let markup = "";
    try {
      const difference = BW.camera.pairDelta(cameraDraft.ref, cameraDraft.other);
      markup = ui.cameraResult(difference, selectedProfile(cameraDraft.subject), cameraDraft.sun);
    } catch {
      // The submit action shows validation feedback when the user saves.
    }
    if (output.innerHTML !== markup) output.innerHTML = markup;
  }

  function updatePhotoStatus(key) {
    const slot = cameraDraft[key];
    const status = view.querySelector(`[data-photo-status="${key}"]`);
    if (status) {
      status.textContent = slot.status;
      status.className = slot.error ? "error-text" : "help";
    }
  }

  function readCameraPhoto(input) {
    const file = input.files[0];
    if (!file) return;
    input.value = "";
    void analysePhoto(input.dataset.photo, file);
  }

  async function analysePhoto(key, file) {
    if (!photoKeys.includes(key)) return;
    const draft = cameraDraft;
    const slot = draft[key];
    const ticket = ++slot.ticket;
    const isCurrent = () => cameraDraft === draft && slot.ticket === ticket;
    Object.assign(slot, { aperture: "", shutter: "", iso: "", metadata: null, error: false, status: "Belichtung wird gelesen …" });
    function showPhoto(openDetails = false) {
      const form = view.querySelector('[data-form="camera"]');
      if (!form) return;
      for (const name of ["aperture", "shutter", "iso"]) field(form, key + "-" + name).value = slot[name];
      if (openDetails) form.querySelector(`[data-exposure="${key}"]`).open = true;
      clearError(form);
      updatePhotoStatus(key);
      updateCameraResult();
    }
    showPhoto();
    try {
      const result = await BW.camera.fromPhoto(file);
      if (!isCurrent()) return;
      Object.assign(slot, result, { status: "Belichtungsdaten aus dem Foto übernommen." });
    } catch (error) {
      if (!isCurrent()) return;
      Object.assign(slot, { error: true, status: error.message });
    }
    showPhoto(slot.error);
  }

  function releaseCamera() {
    const session = cameraSession;
    cameraSession = null;
    if (!session) return;
    session.stream?.getTracks().forEach(track => track.stop());
    session.video.srcObject = null;
  }

  function previewMessage(message, warning = false) {
    const status = dialog.querySelector("#camera-preview-status");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("warning", warning);
  }

  async function openCameraPreview(key) {
    if (!photoKeys.includes(key)) return;
    if (!inAppCamera) {
      document.getElementById(key + "-camera")?.click();
      return;
    }
    releaseCamera();
    present(ui.cameraDialog(key));
    const video = dialog.querySelector("#camera-preview-video");
    const take = dialog.querySelector('[data-action="camera-take"]');
    const session = { key, video, stream: null };
    cameraSession = session;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      if (cameraSession !== session || !dialog.open) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      session.stream = stream;
      video.srcObject = stream;
      video.hidden = false;
      await video.play();
      if (cameraSession !== session) return;
      take.disabled = false;
      previewMessage("Richte die Rückkamera auf das matte Blatt und werte dann das Foto aus.");
    } catch {
      if (cameraSession !== session) return;
      releaseCamera();
      video.hidden = true;
      previewMessage("Die Kamera konnte nicht geöffnet werden. Wähle ein Foto aus der Mediathek oder aus Dateien.", true);
    }
  }

  async function takeCameraPhoto(control) {
    const session = cameraSession;
    const track = session?.stream?.getVideoTracks()[0];
    if (!track) return;
    control.disabled = true;
    previewMessage("Foto wird aufgenommen …");
    try {
      const image = await new window.ImageCapture(track).takePhoto({ fillLightMode: "off" });
      if (cameraSession !== session) return;
      releaseCamera();
      closeDialog();
      await analysePhoto(session.key, image);
    } catch {
      if (cameraSession !== session) return;
      releaseCamera();
      session.video.hidden = true;
      previewMessage("Die Kamera konnte das Foto nicht speichern. Nimm es in der Kamera-App auf und wähle es danach hier aus.", true);
    }
  }

  function submitCamera(form) {
    const reference = cameraDraft.reference.trim();
    const target = cameraDraft.target.trim();
    if (!reference) return formError(form, "Gib den Namen deines Referenzplatzes ein.", field(form, "reference"));
    if (!target) return formError(form, "Gib den Namen deines Vergleichsplatzes ein.", field(form, "target"));
    if (BW.normalize(reference) === BW.normalize(target)) return formError(form, "Gib zwei unterschiedliche Platznamen ein.", field(form, "target"));
    for (const [key, label] of [["ref", "Referenzplatz"], ["other", "Vergleichsplatz"]]) {
      const slot = cameraDraft[key];
      try {
        BW.camera.exposure(slot);
      } catch (error) {
        form.querySelector(`[data-exposure="${key}"]`).open = true;
        return formError(form, `Beim ${label} fehlen gültige Belichtungsdaten. ${error.message}`, field(form, key + "-aperture"));
      }
    }
    const delta = BW.camera.pairDelta(cameraDraft.ref, cameraDraft.other);
    if (database.comparisons.length >= BW.limits.comparisons) return formError(form, "Es sind bereits 150 Vergleiche gespeichert. Sichere und entferne bei Bedarf ältere Vergleiche.");
    const comparison = {
      id: BW.id(), at: new Date().toISOString(), reference, target, delta, sun: cameraDraft.sun,
      plantId: selectedPlant(cameraDraft.subject)?.id ?? null, profile: selectedProfile(cameraDraft.subject)
    };
    persist({ ...database, comparisons: [comparison, ...database.comparisons] });
    const { subject } = cameraDraft;
    cameraDraft = { ...BW.camera.draft(), subject };
    render();
    view.querySelector("#comparison-title")?.scrollIntoView({ block: "nearest" });
    notify("Kameravergleich gespeichert.");
    return true;
  }

  function deleteComparison(id) {
    const comparison = database.comparisons.find(item => item.id === id);
    if (!comparison) return;
    ask("Vergleich löschen?", `Der Vergleich zwischen „${comparison.reference}“ und „${comparison.target}“ wird gelöscht.`, "Vergleich löschen", () => {
      persist({ ...database, comparisons: database.comparisons.filter(item => item.id !== id) });
      const list = view.querySelector("#comparisons-list");
      if (list) list.innerHTML = ui.comparisonList(database.comparisons, database.plants);
      notify("Vergleich gelöscht.");
    });
  }

  function updateSensorDisplay() {
    const control = view.querySelector("#sensor-button");
    if (!control) return;
    control.textContent = liveSensor ? "Sensor stoppen" : "Sensor starten";
    view.querySelector("#sensor-status").textContent = sensorMessage || "Halte einen unterstützten Gerätesensor auf Blatthöhe in Richtung des Lichts. Vermeide Schatten durch deine Hand.";
    view.querySelector("#sensor-value").innerHTML = `${sensorValue === null ? "—" : ui.numberFormat.format(sensorValue)} <small>lx</small>`;
    view.querySelector("#sensor-tools").hidden = sensorValue === null;
  }

  function stopSensor(message = "", keepValue = false) {
    clearTimeout(sensorTimer);
    const device = liveSensor;
    liveSensor = null;
    device?.stop();
    sensorSamples = [];
    if (!keepValue) sensorValue = null;
    sensorMessage = message;
    updateSensorDisplay();
  }

  function toggleSensor() {
    if (liveSensor) {
      stopSensor("Messung beendet.", true);
      return;
    }
    const alternative = " Nutze den Luxwert eines externen Messgeräts oder die Helligkeitsschätzung.";
    if (!window.isSecureContext) {
      stopSensor("Der Sensor benötigt eine HTTPS-Adresse." + alternative);
      return;
    }
    if (typeof window.AmbientLightSensor !== "function") {
      stopSensor("Dieser Browser stellt keinen Helligkeitssensor bereit." + alternative);
      return;
    }
    try {
      const device = new window.AmbientLightSensor({ frequency: 3 });
      liveSensor = device;
      sensorValue = null;
      sensorSamples = [];
      sensorMessage = "Sensor wird gestartet …";
      updateSensorDisplay();
      device.addEventListener("reading", () => {
        if (liveSensor !== device || !Number.isFinite(device.illuminance) || device.illuminance < 0 || device.illuminance > 200000) return;
        clearTimeout(sensorTimer);
        sensorSamples = [...sensorSamples.slice(-4), device.illuminance];
        const sorted = [...sensorSamples].sort((a, b) => a - b);
        sensorValue = Math.round(sorted[Math.floor(sorted.length / 2)]);
        sensorMessage = "Messung läuft. Übernimm den Wert, sobald er stabil ist.";
        updateSensorDisplay();
      });
      device.addEventListener("error", () => {
        if (liveSensor === device) stopSensor("Der Helligkeitssensor ist nicht verfügbar oder der Zugriff wurde blockiert." + alternative);
      });
      device.start();
      sensorTimer = setTimeout(() => stopSensor("Der Helligkeitssensor liefert keinen Messwert." + alternative), 6500);
    } catch {
      stopSensor("Der Zugriff auf den Helligkeitssensor ist hier nicht möglich." + alternative);
    }
  }

  function takeSensorValue() {
    if (sensorValue === null) return;
    const form = view.querySelector('[data-form="light"]');
    const snapshot = String(sensorValue);
    lightDraft.sensorLux = snapshot;
    field(form, "lux").value = snapshot;
    stopSensor("Messwert übernommen.", true);
    clearError(form);
    updateLightForm(form);
    field(form, "lux").focus();
  }

  function statusImport(text) {
    const output = view.querySelector("#import-status");
    if (!output) return;
    output.textContent = text;
    output.hidden = !text;
  }

  async function importFile(input) {
    const file = input.files[0];
    input.value = "";
    if (!file) return;
    const request = ++fileRequest;
    statusImport("");
    try {
      if (file.size > BW.backupBytes) throw new Error("Die Sicherung ist zu groß. Maximal 72 MB sind möglich.");
      const bytes = await file.arrayBuffer();
      if (request !== fileRequest || activeView !== "sicherung") return;
      let text;
      try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      } catch {
        throw new Error("Die Datei enthält ungültige Zeichen. Wähle eine vollständige Blattwerk-Sicherung im UTF-8-Format.");
      }
      const archive = BW.readBackup(text);
      const { data: restored, entries } = await BW.photos.importPhotos(archive.data, archive.photos);
      if (request !== fileRequest || activeView !== "sicherung") return;
      const expectedRaw = lastRaw;
      const hasData = lastRaw !== null;
      const counts = data => ui.countText(data.plants.length, "Pflanze", "Pflanzen") + ", "
        + ui.countText(data.readings.length, "Lichtmessung", "Lichtmessungen") + " und "
        + ui.countText(data.comparisons.length, "Kameravergleich", "Kameravergleiche");
      const introduction = `Die Sicherung enthält ${counts(restored)}.`;
      const effect = recoveryCopy !== null ? " Sie ersetzt die aktuell beschädigten Daten."
        : hasData ? ` Sie ersetzt den aktuellen Stand mit ${counts(database)}.` : "";
      ask("Sicherung wiederherstellen?", introduction + effect, hasData ? "Vorhandene Daten ersetzen" : "Wiederherstellen", async () => {
        const oldPhotos = database.plants.map(plant => plant.photoId).filter(Boolean);
        try {
          await BW.photos.put(entries);
          if (lastRaw !== expectedRaw || request !== fileRequest) throw new Error("Die Daten haben sich geändert. Wähle die Sicherung erneut.");
          persist(restored, true);
        } catch (error) {
          void BW.photos.remove(entries.map(([id]) => id)).catch(() => {});
          statusImport(error.message);
          syncIfNeeded();
          return;
        }
        void BW.photos.remove(oldPhotos).catch(() => {});
        search = "";
        room = "";
        taskTab = "due";
        lightDraft = newLightDraft();
        cameraDraft = BW.camera.draft();
        demoLightName = "";
        render();
        notify("Sicherung wiederhergestellt.");
      }, hasData ? "danger" : "primary");
    } catch (error) {
      if (request === fileRequest && activeView === "sicherung") statusImport(error.message || "Die Datei konnte nicht gelesen werden.");
    }
  }

  function deletePlant(plant) {
    ask("Pflanze löschen?", `„${plant.name}“ wird mit ihrem Pflegeverlauf gelöscht. Lichtmessungen und Kameravergleiche werden dem Pflanzenprofil zugeordnet.`, "Pflanze löschen", () => {
      updatePlant(plant, null);
      if (plant.photoId) void BW.photos.remove([plant.photoId]).catch(() => {});
      closeDialog();
      render();
      notify("Pflanze gelöscht.");
    });
  }

  function deleteLog(plant, index) {
    const item = plant.history[index];
    if (!item) return;
    ask("Verlaufseintrag entfernen?", `Der Eintrag vom ${BW.longDate(item.on)} wird entfernt. Blattwerk berechnet die nächsten Termine neu.`, "Eintrag entfernen", () => {
      const updated = { ...plant, history: plant.history.filter((_, at) => at !== index) };
      updatePlant(plant, updated);
      render();
      present(ui.plantDetail(updated, BW.day(), inDemo()));
    });
  }

  function deleteReading(id) {
    const reading = database.readings.find(item => item.id === id);
    if (!reading) return;
    ask("Messung löschen?", `Die gespeicherte Messung „${reading.spot}“ wird gelöscht.`, "Messung löschen", () => {
      persist({ ...database, readings: database.readings.filter(item => item.id !== id) });
      view.querySelector("#readings-list").innerHTML = ui.lightReadings(database.readings, database.plants, lightDraft.subject, selectedProfile());
      notify("Messung gelöscht.");
    });
  }

  function refreshPlantCards() {
    const results = view.querySelector("#plant-results");
    results.innerHTML = ui.plantCards(visiblePlants(), BW.day(), search, room);
    BW.photos.populate(results);
  }

  async function downloadBackup(button) {
    button.disabled = true;
    try {
      const backup = await BW.photos.makeBackup(database);
      BW.download(`blattwerk-sicherung-${BW.day()}.json`, backup, "application/json;charset=utf-8");
      notify("Sicherung als JSON heruntergeladen.");
    } catch (error) {
      statusImport(error.message);
      notify(error.message);
    } finally {
      button.disabled = false;
    }
  }

  function updateOfflineStatus() {
    const status = dialog.querySelector("#offline-status");
    if (!status) return;
    const messages = {
      ready: "Offline bereit. Blattwerk ist auf diesem Gerät gespeichert.",
      pending: "Blattwerk bereitet die Offline-Dateien vor.",
      unavailable: "Öffne Blattwerk über eine HTTPS-Adresse oder den lokalen Starter, um die Offline-Funktion zu aktivieren.",
      error: "Die Offline-Dateien konnten noch nicht geladen werden. Lade Blattwerk bei bestehender Verbindung erneut."
    };
    status.textContent = messages[offlineState];
    status.classList.toggle("warning", offlineState === "error" || offlineState === "unavailable");
  }

  function openInstallDialog() {
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    present(ui.installDialog(standalone, !standalone && installPrompt !== null));
    updateOfflineStatus();
  }

  function openPushDialog() {
    const settings = BW.push.read();
    present(ui.pushDialog(settings));
    const status = dialog.querySelector("#push-status");
    if (!settings?.active) return;
    void BW.push.refresh(settings).then(answer => {
      if (!status.isConnected || !dialog.open) return;
      if (!answer.active) status.textContent = "Der Dienst hat gerade keinen aktiven Zeitplan. Speichere den Zeitplan erneut.";
      else if (Number.isFinite(answer.nextAt)) {
        const next = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(answer.nextAt));
        status.textContent = `Nächste Pflanzenrunde am ${next}.`;
      }
    }).catch(() => {
      if (status.isConnected && dialog.open) status.textContent = "Der Push-Dienst ist momentan nicht erreichbar. Versuche es später erneut.";
    });
  }

  async function submitPush(form, type) {
    const button = form.querySelector('button[type="submit"]');
    if (button.disabled) return;
    button.disabled = true;
    try {
      const settings = type === "push-connect"
        ? await BW.push.connect(field(form, "pushService").value, field(form, "pushCode").value)
        : await BW.push.activate(BW.push.read(), field(form, "pushTime").value, Number(field(form, "pushDays").value));
      if (form.isConnected && dialog.open) present(ui.pushDialog(settings));
    } finally {
      button.disabled = false;
    }
  }

  async function pushAction(control, action) {
    const settings = BW.push.read();
    if (!settings) return;
    control.disabled = true;
    try {
      if (action === "push-off") {
        const { paused, remote } = await BW.push.deactivate(settings);
        if (control.isConnected && dialog.open) present(ui.pushDialog(paused, remote
          ? "Push-Erinnerungen pausiert." : "Auf diesem Gerät pausiert. Der Dienst war gerade nicht erreichbar."));
      } else {
        await BW.push.test(settings);
        if (control.isConnected && dialog.open) dialog.querySelector("#push-status").textContent = "Der Mitteilungsdienst hat die Testanfrage angenommen.";
      }
    } catch (error) {
      if (control.isConnected && dialog.open) dialog.querySelector("#push-status").textContent = error.message;
    } finally {
      control.disabled = false;
    }
  }

  async function promptInstall() {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    try {
      await prompt.prompt();
    } catch {
      notify("Nutze die Installationsoption im Browsermenü.");
    }
    if (dialog.querySelector("#offline-status")) openInstallDialog();
  }

  function dispatchAction(control) {
    const { action, id, kind, tab, item } = control.dataset;
    switch (action) {
      case "add": openPlantForm(); break;
      case "edit": if (findPlant(id)) openPlantForm(findPlant(id)); break;
      case "detail": if (findPlant(id)) present(ui.plantDetail(findPlant(id), BW.day(), inDemo())); break;
      case "delete-plant": if (findPlant(id)) deletePlant(findPlant(id)); break;
      case "delete-log": if (findPlant(id)) deleteLog(findPlant(id), Number(item)); break;
      case "delete-reading": deleteReading(id); break;
      case "delete-comparison": deleteComparison(id); break;
      case "task": roundRunning = false; openTask(findPlant(id), kind); break;
      case "round-start": continueRound(); break;
      case "round-tab": {
        const fromTabs = Boolean(control.closest(".segmented"));
        taskTab = tab;
        render();
        if (fromTabs) view.querySelector(`.segmented [data-tab="${tab}"]`)?.focus({ preventScroll: true });
        else {
          const heading = view.querySelector("#runde-title");
          heading?.focus({ preventScroll: true });
          heading?.scrollIntoView({ block: "start" });
        }
        break;
      }
      case "reset-filter":
        search = "";
        room = "";
        render();
        view.querySelector("#plant-search")?.focus();
        break;
      case "plant-light": {
        const plant = findPlant(id);
        if (!plant) break;
        const demo = inDemo();
        lightDraft = { ...newLightDraft(), spot: plant.place, subject: demo ? plant.profile : "p:" + plant.id };
        cameraDraft = { ...BW.camera.draft(), reference: plant.place, subject: lightDraft.subject };
        lightMode = "camera";
        demoLightName = demo ? plant.name : "";
        goTo("licht");
        break;
      }
      case "examples-on":
      case "examples-off": {
        const show = action === "examples-on";
        persist({ ...database, prefs: { ...database.prefs, examples: show } });
        if (show) demoPlants = BW.examplePlants(BW.day());
        taskTab = "due";
        render();
        view.querySelector("h1")?.focus({ preventScroll: true });
        break;
      }
      case "menu": present(ui.moreMenu()); break;
      case "close": closeDialog(); break;
      case "cancel-confirm":
        confirmCallback = null;
        confirmation.close();
        break;
      case "confirm": {
        const callback = confirmCallback;
        confirmCallback = null;
        confirmation.close();
        callback?.();
        break;
      }
      case "calendar": openCalendar(); break;
      case "push": openPushDialog(); break;
      case "push-test":
      case "push-off": void pushAction(control, action); break;
      case "install": openInstallDialog(); break;
      case "install-prompt": void promptInstall(); break;
      case "light-mode":
        if (lightMode === control.dataset.mode) break;
        stopSensor();
        lightMode = control.dataset.mode;
        render();
        view.querySelector('[data-action="light-mode"][aria-pressed="true"]')?.focus({ preventScroll: true });
        break;
      case "camera-file": document.getElementById(control.dataset.input)?.click(); break;
      case "plant-photo-pick":
        if (!control.closest("form").dataset.saving) document.getElementById(control.dataset.input)?.click();
        break;
      case "plant-photo-remove": removePlantPhoto(control.closest("form")); break;
      case "camera-preview": void openCameraPreview(control.dataset.slot); break;
      case "camera-take": void takeCameraPhoto(control); break;
      case "camera-fallback":
        releaseCamera();
        closeDialog();
        document.getElementById(control.dataset.slot + "-photo")?.click();
        break;
      case "sensor": toggleSensor(); break;
      case "sensor-value": takeSensorValue(); break;
      case "import": view.querySelector("#import-file").click(); break;
      case "export": void downloadBackup(control); break;
      case "raw-export":
        BW.download(`blattwerk-rohdaten-${BW.day()}.txt`, recoveryCopy, "text/plain;charset=utf-8");
        notify("Rohdaten heruntergeladen.");
        break;
    }
  }

  document.addEventListener("click", event => {
    const control = event.target.closest("[data-action]");
    if (control) {
      try {
        dispatchAction(control);
      } catch (error) {
        notify(error.message);
        syncIfNeeded();
      }
      return;
    }
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const href = anchor.getAttribute("href").slice(1);
    if (href === "hauptinhalt") {
      event.preventDefault();
      document.querySelector("main").focus();
    } else if (views.includes(href)) {
      event.preventDefault();
      goTo(href);
    }
  });

  document.addEventListener("submit", async event => {
    const form = event.target;
    const { form: type } = form.dataset;
    if (!type) return;
    event.preventDefault();
    clearError(form);
    try {
      if (type === "plant") await submitPlant(form);
      else if (type === "check" || type === "feed") submitTask(form, type);
      else if (type === "light") submitLight(form);
      else if (type === "camera") submitCamera(form);
      else if (type === "calendar") submitCalendar(form);
      else if (type === "push-connect" || type === "push-plan") await submitPush(form, type);
    } catch (error) {
      formError(form, error.message);
      if (!dialog.open && !confirmation.open) syncIfNeeded();
    }
  });

  document.addEventListener("input", event => {
    const input = event.target;
    if (input.id === "plant-search") {
      search = input.value;
      refreshPlantCards();
    } else if (input.form?.dataset.form === "plant" && input.name === "name" && !input.form.dataset.profileChosen) {
      findProfiles(input.form, BW.guessProfile(input.value));
      updatePlantPhoto(input.form);
    } else if (input.form?.dataset.form === "plant" && input.name === "profileSearch") {
      findProfiles(input.form);
    } else if (input.form?.dataset.form === "light" && ["lux", "spot"].includes(input.name)) {
      if (input.name === "lux") lightDraft.sensorLux = "";
      updateLightForm(input.form);
    } else if (input.form?.dataset.form === "camera") {
      if (input.dataset.exposureValue) {
        const { slot, exposureValue } = input.dataset;
        const photo = cameraDraft[slot];
        photo.ticket += 1;
        Object.assign(photo, { [exposureValue]: input.value, metadata: null, error: false, status: "Belichtungsdaten von Hand eingegeben." });
        updatePhotoStatus(slot);
        updateCameraResult();
      } else if (input.name === "reference" || input.name === "target") {
        cameraDraft[input.name] = input.value;
      }
      clearError(input.form);
    }
    input.removeAttribute("aria-invalid");
  });

  document.addEventListener("change", event => {
    const input = event.target;
    const type = input.form?.dataset.form;
    if (input.id === "plant-room") {
      room = input.value;
      refreshPlantCards();
    } else if (input.id === "import-file") {
      void importFile(input);
    } else if (type === "plant" && input.hasAttribute("data-plant-file")) {
      void choosePlantPhoto(input);
    } else if (type === "camera" && input.dataset.photo) {
      void readCameraPhoto(input);
    } else if (type === "camera" && (input.name === "subject" || input.name === "sun")) {
      cameraDraft[input.name] = input.value;
      updateCameraResult();
    } else if (type === "plant" && input.name === "profile") {
      input.form.dataset.profileChosen = "true";
      updatePlantPhoto(input.form);
    } else if (type === "check" && ["moisture", "finding"].includes(input.name)) {
      updateTaskAdvice(input.form);
    } else if (type === "calendar" && input.name === "mode") {
      for (const element of input.form.querySelectorAll("[data-repeat]")) element.hidden = input.value !== "repeat";
      clearError(input.form);
    } else if (type === "light" && ["subject", "sun", "visual"].includes(input.name)) {
      if (input.name === "subject") {
        const spot = field(input.form, "spot");
        if (!spot.value.trim() || spot.value === selectedPlant()?.place) {
          const plant = database.plants.find(item => "p:" + item.id === input.value);
          if (plant) spot.value = plant.place;
        }
        demoLightName = "";
        view.querySelector("[data-demo-light]")?.remove();
      }
      updateLightForm(input.form, input.name === "subject");
    }
  });

  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    releaseCamera();
    clearPlantPhotoDraft();
    roundRunning = false;
    const destination = focusBeforeDialog?.isConnected ? focusBeforeDialog : view.querySelector("h1");
    destination?.focus({ preventScroll: true });
    focusBeforeDialog = null;
    syncIfNeeded();
  });
  confirmation.addEventListener("cancel", () => { confirmCallback = null; });
  confirmation.addEventListener("close", syncIfNeeded);

  window.addEventListener("hashchange", () => {
    if (activeView === "licht") stopSensor();
    activeView = route();
    closeDialog();
    render();
    window.scrollTo(0, 0);
    view.querySelector("h1")?.focus({ preventScroll: true });
  });
  window.addEventListener("storage", event => {
    if (event.key !== BW.key && event.key !== null) return;
    waitingForSync = true;
    syncIfNeeded();
  });
  function refreshDate() {
    if (!document.hidden && displayedDay !== BW.day() && !dialog.open && !confirmation.open) render();
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      refreshDate();
      return;
    }
    if (liveSensor) stopSensor("Messung pausiert, während Blattwerk im Hintergrund ist.", true);
    if (cameraSession?.stream) {
      cameraSession.video.hidden = true;
      releaseCamera();
      dialog.querySelector('[data-action="camera-take"]').disabled = true;
      previewMessage("Die Kamera wurde beim Wechsel in den Hintergrund beendet. Öffne sie bei Bedarf erneut.", true);
    }
  });
  window.addEventListener("pagehide", () => {
    if (liveSensor) stopSensor();
    releaseCamera();
  });
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    if (dialog.querySelector("#offline-status")) openInstallDialog();
  });
  window.addEventListener("appinstalled", () => { installPrompt = null; });
  setInterval(refreshDate, 60_000);

  for (const target of document.querySelectorAll("[data-icon]")) target.innerHTML = ui.icon(target.dataset.icon);
  loadFromBrowser();
  render();
  if (offlineState === "pending") {
    const showReady = () => {
      if (!navigator.serviceWorker.controller) return;
      offlineState = "ready";
      updateOfflineStatus();
    };
    navigator.serviceWorker.addEventListener("controllerchange", showReady);
    showReady();
    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).catch(() => {
      if (offlineState !== "ready") {
        offlineState = "error";
        updateOfflineStatus();
      }
    });
  }
})();
