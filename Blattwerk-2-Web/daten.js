(() => {
  "use strict";

  const { profiles, observations, moistureLevels, sunlight, visualLevels, limits, own, validDay, day, shift, checkInterval } = window.BW;
  const key = "blattwerk.v1";
  const utf8 = new TextEncoder();
  const format = "blattwerk";
  const version = 3;
  const backupBytes = 72_000_000;
  const intervals = [2, 3, 7, 14, 28];
  const validTime = value => typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
  const record = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const validId = value => typeof value === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(value);
  const validText = (value, max, required = false) => typeof value === "string" && value.length <= max && (!required || !!value.trim());
  const integerIn = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  const known = (value, values) => typeof value === "string" && own(values, value);
  const validInstant = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
    && validDay(value.slice(0, 10)) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;

  function blankData(examples = true) {
    return { format, version, prefs: { examples, calendarTime: "09:00", calendarDays: 7 }, plants: [], readings: [], comparisons: [] };
  }

  function examplePlants(today) {
    return [
      { id: "demo-monstera", profile: "monstera", name: "Monstera", place: "Wohnzimmer", offset: -1, note: "Am Ostfenster" },
      { id: "demo-snake", profile: "snake", name: "Bogenhanf", place: "Schlafzimmer", offset: 0, note: "Auf der Kommode" },
      { id: "demo-pothos", profile: "pothos", name: "Efeutute", place: "Bad", offset: 3, note: "Neben dem Fenster" }
    ].map(({ id, profile, name, place, offset, note }) => {
      const plant = { id, name, profile, place, notes: note, createdOn: shift(today, -70), repottedOn: null, interval: null, history: [] };
      const checkedOn = shift(today, offset - checkInterval(plant, today));
      plant.history = [
        { kind: "check", on: checkedOn, moisture: "dry", watered: true, leaves: true, location: true, finding: "clear", note: "", followUp: null },
        { kind: "feed", on: shift(checkedOn, -1), fertilized: true, note: "" }
      ];
      return plant;
    });
  }

  function id() {
    return crypto.randomUUID?.() ?? [...crypto.getRandomValues(new Uint8Array(16))]
      .map(value => value.toString(16).padStart(2, "0")).join("");
  }

  function parseData(json, maximum) {
    if (json.length > maximum || utf8.encode(json).length > maximum) throw new Error("Die Sicherung ist zu groß.");
    try {
      return JSON.parse(json);
    } catch {
      throw new Error("Die Datei enthält kein lesbares JSON. Wähle eine vollständige Blattwerk-Sicherung.");
    }
  }

  function normalizeData(data) {
    if (!record(data) || data.format !== format) throw new Error("Die Datei ist keine Blattwerk-Sicherung.");
    if (![1, 2, version].includes(data.version)) throw new Error("Diese Sicherung verwendet eine andere Blattwerk-Version.");
    const { prefs, plants, readings } = data;
    const comparisons = data.version === 1 ? [] : data.comparisons;
    if (!record(prefs) || typeof prefs.examples !== "boolean" || !validTime(prefs.calendarTime) || !intervals.includes(prefs.calendarDays)) {
      throw new Error("Die Einstellungen in dieser Sicherung sind ungültig.");
    }
    if (!Array.isArray(plants) || plants.length > limits.plants || !Array.isArray(readings) || readings.length > limits.readings) {
      throw new Error("Die Listen für Pflanzen oder Lichtmessungen fehlen oder sind zu groß.");
    }
    if (!Array.isArray(comparisons) || comparisons.length > limits.comparisons) {
      throw new Error("Die Liste der Kameravergleiche fehlt oder ist zu groß.");
    }

    const plantIds = new Set();
    const photoIds = new Set();
    const cleanPlants = plants.map((plant, index) => {
      const label = `Pflanze ${index + 1}`;
      if (!record(plant) || !validId(plant.id) || plantIds.has(plant.id) || !validText(plant.name, 80, true)
        || !known(plant.profile, profiles) || !validText(plant.place, 80, true) || !validText(plant.notes, 800)
        || !validDay(plant.createdOn) || (plant.repottedOn !== null && !validDay(plant.repottedOn))
        || (plant.interval !== null && !integerIn(plant.interval, 1, 90)) || !Array.isArray(plant.history) || plant.history.length > limits.history) {
        throw new Error(`${label} hat fehlende oder ungültige Angaben.`);
      }
      plantIds.add(plant.id);
      const photoId = data.version === version ? plant.photoId ?? null : null;
      if (photoId !== null && (!validId(photoId) || photoIds.has(photoId))) {
        throw new Error(`${label} hat einen ungültigen Fotoverweis.`);
      }
      if (photoId !== null) photoIds.add(photoId);
      const history = plant.history.map(item => {
        const error = new Error(`${label} hat einen ungültigen Verlaufseintrag.`);
        if (!record(item) || !validDay(item.on) || !validText(item.note, 400)) throw error;
        const { kind, on, note } = item;
        if (kind === "feed" && typeof item.fertilized === "boolean") return { kind, on, note, fertilized: item.fertilized };
        if (kind !== "check" || !known(item.moisture, moistureLevels) || typeof item.watered !== "boolean"
          || typeof item.leaves !== "boolean" || typeof item.location !== "boolean" || !known(item.finding, observations)
          || (item.followUp !== null && !integerIn(item.followUp, 1, 90))) throw error;
        const { moisture, watered, leaves, location, finding, followUp } = item;
        return { kind, on, note, moisture, watered, leaves, location, finding, followUp };
      }).sort((a, b) => b.on.localeCompare(a.on));
      const { id, name, profile, place, notes, createdOn, repottedOn, interval } = plant;
      return { id, name: name.trim(), profile, place: place.trim(), notes, createdOn, repottedOn, interval, photoId, history };
    });

    const readingIds = new Set();
    const cleanReadings = readings.map((reading, index) => {
      if (!record(reading) || !validId(reading.id) || readingIds.has(reading.id) || !known(reading.profile, profiles)
        || (reading.plantId !== null && !plantIds.has(reading.plantId)) || !validText(reading.spot, 80, true)
        || !known(reading.sun, sunlight) || !validInstant(reading.at)) {
        throw new Error(`Lichtmessung ${index + 1} hat fehlende oder ungültige Angaben.`);
      }
      const { id, plantId, profile, spot, sun, at, lux, visual, source } = reading;
      const validValue = source === "estimate"
        ? lux === null && known(visual, visualLevels)
        : (source === "manual" || source === "sensor") && Number.isFinite(lux) && lux >= 0 && lux <= 200000 && visual === null;
      if (!validValue) throw new Error(`Lichtmessung ${index + 1} hat einen ungültigen Messwert.`);
      readingIds.add(id);
      return { id, plantId, profile, spot: spot.trim(), sun, at, lux, visual, source };
    }).sort((a, b) => b.at.localeCompare(a.at));

    const comparisonIds = new Set();
    const cleanComparisons = comparisons.map((item, index) => {
      if (!record(item) || !validId(item.id) || comparisonIds.has(item.id) || !known(item.profile, profiles)
        || (item.plantId !== null && !plantIds.has(item.plantId)) || !validText(item.reference, 80, true)
        || !validText(item.target, 80, true) || !known(item.sun, sunlight) || !validInstant(item.at)
        || !Number.isFinite(item.delta) || Math.abs(item.delta) > 52) {
        throw new Error(`Kameravergleich ${index + 1} hat fehlende oder ungültige Angaben.`);
      }
      comparisonIds.add(item.id);
      const { id, plantId, profile, reference, target, at, delta, sun } = item;
      return { id, plantId, profile, reference: reference.trim(), target: target.trim(), at, delta, sun };
    }).sort((a, b) => b.at.localeCompare(a.at));

    return {
      format, version,
      prefs: { examples: prefs.examples, calendarTime: prefs.calendarTime, calendarDays: prefs.calendarDays },
      plants: cleanPlants,
      readings: cleanReadings,
      comparisons: cleanComparisons
    };
  }

  function readData(json) {
    return normalizeData(parseData(json, limits.bytes));
  }

  function readBackup(json) {
    const raw = parseData(json, backupBytes);
    const data = normalizeData(raw);
    writeData(data);
    const ids = new Set(data.plants.map(plant => plant.photoId).filter(Boolean));
    const photos = raw.photos ?? {};
    if (!record(photos) || Object.keys(photos).length !== ids.size || [...ids].some(id => !own(photos, id))) {
      throw new Error("Die Sicherung enthält fehlende oder zusätzliche Pflanzenfotos.");
    }
    return { data, photos };
  }

  function writeData(data) {
    const json = JSON.stringify(data);
    if (utf8.encode(json).length > limits.bytes) {
      throw new Error("Der lokale Speicher ist voll. Sichere deine Daten und lösche bei Bedarf alte Messwerte.");
    }
    return json;
  }

  function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  const icalText = value => value.replaceAll("\\", "\\\\").replace(/\r\n|\n|\r/g, "\\n").replaceAll(";", "\\;").replaceAll(",", "\\,");
  const icalStamp = date => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const icalLocal = (date, time) => date.replaceAll("-", "") + "T" + time.replace(":", "") + "00";

  function fold(line) {
    let size = 0;
    let output = "";
    for (const character of line) {
      const length = utf8.encode(character).length;
      if (size + length > 75) {
        output += "\r\n ";
        size = 1;
      }
      output += character;
      size += length;
    }
    return output;
  }

  function roundEvents(tasks, time, now = new Date()) {
    const today = day(now);
    const first = new Date(`${today}T${time}`) > now ? today : shift(today, 1);
    const end = shift(today, 30);
    const groups = new Map();
    for (const task of tasks) {
      if (task.date > end) break;
      const date = task.date < first ? first : task.date;
      if (!groups.has(date)) groups.set(date, []);
      const action = task.kind === "check" ? "Feuchtigkeit prüfen" : "Düngebedarf prüfen";
      groups.get(date).push(`${task.plant.name} (${task.plant.place}): ${action}`);
    }
    return [...groups].map(([date, descriptions]) => ({
      uid: `pflege-${date}`, date, time, title: "Blattwerk: Pflanzenrunde",
      text: descriptions.join("\n")
    }));
  }

  function calendarFile(events, now = new Date()) {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Blattwerk//Pflanzenpflege//DE", "CALSCALE:GREGORIAN"];
    for (const event of events) {
      lines.push("BEGIN:VEVENT", `UID:${event.uid}@blattwerk.local`, `DTSTAMP:${icalStamp(now)}`, `DTSTART:${icalLocal(event.date, event.time)}`,
        "DURATION:PT15M", "TRANSP:TRANSPARENT", `SUMMARY:${icalText(event.title)}`, `DESCRIPTION:${icalText(event.text)}`);
      if (event.every) lines.push(`RRULE:FREQ=DAILY;INTERVAL=${event.every}`);
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:PT0M", "DESCRIPTION:Pflanzenrunde", "END:VALARM", "END:VEVENT");
    }
    lines.push("END:VCALENDAR");
    return lines.map(fold).join("\r\n") + "\r\n";
  }

  Object.assign(window.BW, { key, intervals, validTime, blankData, examplePlants, id, readData, readBackup, backupBytes, writeData, download, roundEvents, calendarFile });
})();
