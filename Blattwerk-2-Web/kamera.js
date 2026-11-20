(() => {
  "use strict";

  const maxPhotoBytes = 40 * 1024 * 1024;
  const emptyPhoto = () => ({ aperture: "", shutter: "", iso: "", metadata: null, status: "", error: false, ticket: 0 });
  const draft = () => ({ reference: "", target: "", subject: "custom", sun: "unknown", ref: emptyPhoto(), other: emptyPhoto() });

  function numeric(input) {
    const text = String(input).trim().replace(",", ".");
    return /^\d{1,8}(?:\.\d{1,8})?$/.test(text) ? Number(text) : NaN;
  }

  function shutterSeconds(input) {
    const text = String(input).trim().replace(/[⁄∕]/g, "/").replace(/\s*s$/i, "").replace(/\s/g, "");
    const [first, second, unexpected] = text.split("/");
    if (unexpected !== undefined) return NaN;
    return second === undefined ? numeric(first) : numeric(first) / numeric(second);
  }

  function exposure(values) {
    const f = numeric(String(values.aperture).trim().replace(/^[fƒ]\s*\/?\s*/i, ""));
    const seconds = shutterSeconds(values.shutter);
    const iso = numeric(String(values.iso).trim().replace(/^ISO\s*/i, ""));
    if (!Number.isFinite(f) || f < 0.5 || f > 64) throw new Error("Gib eine Blende zwischen f/0,5 und f/64 ein.");
    if (!Number.isFinite(seconds) || seconds < 0.00001 || seconds > 60) throw new Error("Gib eine Belichtungszeit wie 1/120 oder 0,01 s ein.");
    if (!Number.isFinite(iso) || iso < 10 || iso > 204800 || !Number.isInteger(iso)) throw new Error("Gib einen ISO-Wert als ganze Zahl zwischen 10 und 204800 ein.");
    return { f, seconds, iso, ev: Math.log2(f ** 2 * 100 / (seconds * iso)) };
  }

  function numberTag(tag) {
    const value = tag?.value;
    if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
    if (Array.isArray(value)) {
      if (value.length === 1 && typeof value[0] === "number") return value[0];
      if (value.length === 2 && value.every(Number.isFinite) && value[1] !== 0) return value[0] / value[1];
    }
    return undefined;
  }

  const textTag = tag => typeof tag?.description === "string" ? tag.description.trim().slice(0, 160) : "";
  const roundText = value => Number(value.toFixed(8)).toString();

  function photoExposure(exif) {
    const seconds = numberTag(exif.ExposureTime);
    const f = numberTag(exif.FNumber);
    const iso = numberTag(exif.ISOSpeedRatings) ?? numberTag(exif.PhotographicSensitivity)
      ?? numberTag(exif.ISOSpeed) ?? numberTag(exif.RecommendedExposureIndex) ?? numberTag(exif.StandardOutputSensitivity);
    if (!seconds || !f || !iso) {
      throw new Error("In dieser Datei fehlen Blende, Belichtungszeit oder ISO. Wähle das Original aus Fotos oder trage die Werte über „Belichtung eingeben“ ein.");
    }
    if ((numberTag(exif.Flash) ?? 0) & 1) throw new Error("Bei diesem Foto wurde der Blitz ausgelöst. Fotografiere den Platz noch einmal ohne Blitz.");
    const settings = { aperture: roundText(f), shutter: roundText(seconds), iso: String(iso) };
    if (seconds < 1 && Math.abs(1 / seconds - Math.round(1 / seconds)) < 0.0001) settings.shutter = "1/" + Math.round(1 / seconds);
    const reading = exposure(settings);
    return {
      ...settings,
      metadata: {
        ev: reading.ev,
        camera: [textTag(exif.Make), textTag(exif.Model)].filter(Boolean).join(" "),
        lens: textTag(exif.LensModel),
        focalLength: numberTag(exif.FocalLengthIn35mmFilm) ?? numberTag(exif.FocalLength),
        bias: numberTag(exif.ExposureBiasValue)
      }
    };
  }

  async function fromPhoto(file) {
    if (file.size > maxPhotoBytes) throw new Error("Das Foto ist zu groß. Wähle ein Foto mit höchstens 40 MB.");
    if (!window.ExifReader) throw new Error("Die Fotoauswertung ist gerade nicht verfügbar. Gib die drei Belichtungswerte ein.");
    let tags;
    try {
      tags = window.ExifReader.load(await file.arrayBuffer(), { expanded: true });
    } catch {
      throw new Error("Das Bild konnte nicht ausgewertet werden. Wähle ein JPEG- oder HEIC-Original oder gib die Belichtungswerte ein.");
    }
    return photoExposure(tags.exif ?? {});
  }

  function pairDelta(reference, other) {
    const first = reference.metadata;
    const second = other.metadata;
    if (first && second && ((first.camera && second.camera && first.camera !== second.camera)
      || (first.lens && second.lens && first.lens !== second.lens)
      || (Number.isFinite(first.focalLength) && Number.isFinite(second.focalLength)
        && Math.abs(first.focalLength - second.focalLength) > 0.1))) {
      throw new Error("Die Fotos stammen von unterschiedlichen Kameras, Objektiven oder Zoomstufen. Verwende für beide Bilder dieselbe Kamera und 1×.");
    }
    if (first && second && Math.abs((first.bias ?? 0) - (second.bias ?? 0)) > 0.25) {
      throw new Error("Die Fotos haben unterschiedliche Belichtungskorrekturen. Stelle den Belichtungsregler für beide Fotos auf 0.");
    }
    const difference = (second?.ev ?? exposure(other).ev) - (first?.ev ?? exposure(reference).ev);
    return Math.round(difference * 10000) / 10000;
  }

  const ratioFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

  function outcome(difference) {
    if (Math.abs(difference) < 0.5) return "Ähnlich hell";
    const factor = 2 ** Math.abs(difference);
    const factorLabel = factor >= 10 ? "über 10×" : "etwa " + ratioFormat.format(factor) + "×";
    return difference > 0 ? "Vergleichsplatz " + factorLabel + " so hell" : "Referenzplatz " + factorLabel + " so hell";
  }

  function sunAdvice(profile, sun) {
    const type = window.BW.profiles[profile].light;
    if (sun === "unknown") return "Beobachte separat, wann direkte Sonne auf die Blätter fällt.";
    if (sun === "strong" && (type === "tolerant" || type === "filtered")) {
      return "Für diese Pflanze starke direkte Sonne am Vergleichsplatz mit einem hellen Vorhang filtern.";
    }
    if (sun === "strong" && type !== "unknown") return "Gewöhne die Pflanze schrittweise an starke direkte Sonne.";
    if (sun === "filtered" && type === "sunny") return "Diese Pflanze bevorzugt sehr helles Licht. Beobachte, ob sie am Platz genügend Licht über den Tag bekommt.";
    return "Vergleiche zusätzlich den Sonnenverlauf und die Temperatur am neuen Platz.";
  }

  window.BW.camera = { draft, exposure, photoExposure, fromPhoto, pairDelta, outcome, sunAdvice };
})();
