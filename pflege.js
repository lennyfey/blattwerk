(() => {
  "use strict";

  const profiles = {
    monstera: {
      name: "Monstera", botanical: "Monstera deliciosa", aliases: ["Fensterblatt"],
      image: "monstera", light: "filtered", temperature: "18–24 °C",
      warmDays: 6, coolDays: 10, retryDays: 3, feedDays: 28, feedType: "Grünpflanzendünger",
      measure: "Erde 2–3 cm tief prüfen. Bei einem großen Topf zusätzlich tiefer mit einem Holzstäbchen oder über das Topfgewicht kontrollieren.",
      water: "Wenn die obere Schicht trocken und der Ballen fast abgetrocknet ist, gründlich gießen. Überschuss ablaufen lassen.",
      placement: "Hell mit gefiltertem Licht aufstellen. Vor heißer Mittagssonne, Heizungsnähe und kalter Zugluft schützen.",
      url: "https://www.rhs.org.uk/plants/monstera"
    },
    snake: {
      name: "Bogenhanf", botanical: "Dracaena trifasciata", aliases: ["Sansevieria", "Schwiegermutterzunge"],
      image: "snake", light: "adaptable", temperature: "15–24 °C",
      warmDays: 12, coolDays: 21, retryDays: 5, feedDays: 42, feedType: "Kakteendünger",
      measure: "Ein Holzstäbchen am Topfrand bis etwa zur halben Ballentiefe führen. Bei tiefen Töpfen zusätzlich das Topfgewicht prüfen.",
      water: "Den Ballen weitgehend abtrocknen lassen. Sparsam gießen, die Blattrosette trocken halten und den Übertopf leeren.",
      placement: "Ein heller Platz ist günstig. Heller Halbschatten ist möglich. Langsam an direkte Sonne gewöhnen und kalte, nasse Plätze meiden.",
      url: "https://www.rhs.org.uk/plants/sansevieria/growing-guide"
    },
    pothos: {
      name: "Efeutute", botanical: "Epipremnum aureum", aliases: ["Epipremnum", "Pothos"],
      image: "pothos", light: "tolerant", temperature: "18–26 °C",
      warmDays: 6, coolDays: 10, retryDays: 3, feedDays: 28, feedType: "Grünpflanzendünger",
      measure: "Die oberen 2–3 cm fühlen. Bei schweren Töpfen mit einem Stäbchen prüfen, ob der Ballen darunter noch nass ist.",
      water: "Die Oberfläche abtrocknen lassen und erst gießen, wenn der Ballen darunter nur noch leicht feucht ist. Wasser ablaufen lassen.",
      placement: "Helles, indirektes Licht fördert Wachstum und Blattzeichnung. Halbschatten wird toleriert. Vor kalter Zugluft schützen.",
      url: "https://www.rhs.org.uk/plants/epipremnum/growing-guide"
    },
    peace: {
      name: "Einblatt", botanical: "Spathiphyllum", aliases: ["Friedenslilie", "Blattfahne"],
      image: "peace", light: "tolerant", temperature: "18–27 °C",
      warmDays: 4, coolDays: 7, retryDays: 2, feedDays: 28, feedType: "Zimmerpflanzendünger",
      measure: "Die oberen 1–2 cm mit dem Finger prüfen. Den Ballen darunter leicht feucht halten.",
      water: "Wenn die obere Schicht trocken ist, gleichmäßig gießen. Im Übertopf stehendes Wasser ausleeren.",
      placement: "Hell und indirekt aufstellen. Halbschatten ist möglich. Bei zugigen Fenstern oder direkt an der Heizung Abstand halten.",
      url: "https://www.rhs.org.uk/shows-events/rhs-urban-show/houseplant-profiles/houseplants-for-shade"
    },
    spider: {
      name: "Grünlilie", botanical: "Chlorophytum comosum", aliases: ["Chlorophytum", "Spinnenpflanze"],
      image: "spider", light: "tolerant", temperature: "15–25 °C",
      warmDays: 6, coolDays: 10, retryDays: 3, feedDays: 28, feedType: "Grünpflanzendünger",
      measure: "Die oberen 2–3 cm Erde prüfen und bei Bedarf den Topf anheben.",
      water: "Bei angetrockneter Oberfläche gießen und Wasser gut ablaufen lassen. Im Winter bei langsamem Wachstum seltener gießen.",
      placement: "Am besten hell und ohne heiße Mittagssonne. Bei wenig Licht wächst sie langsamer.",
      url: "https://www.rhs.org.uk/plants/spider-plants/growing-guide"
    },
    haworthia: {
      name: "Haworthia", botanical: "Haworthia / Haworthiopsis", aliases: ["Haworthiopsis"],
      image: "haworthia", light: "filtered", temperature: "10–26 °C",
      warmDays: 12, coolDays: 21, retryDays: 5, feedDays: 42, feedType: "Kakteendünger",
      measure: "Das Substrat mit einem Holzstäbchen bis etwa zur halben Ballentiefe prüfen. Ein trockener, leichter Topf ist ein zusätzlicher Hinweis.",
      water: "Erst kurz vor der vollständigen Austrocknung sparsam gießen. Im kühleren Winterstand besonders zurückhaltend sein.",
      placement: "Hell ohne starke direkte Sonne aufstellen. Luftiges Sukkulentensubstrat verwenden.",
      url: "https://www.rhs.org.uk/plants/haworthia"
    },
    zz: {
      name: "Glücksfeder", botanical: "Zamioculcas zamiifolia", aliases: ["Zamioculcas", "ZZ-Pflanze", "Zamie"],
      image: "zz", light: "tolerant", temperature: "Etwa 18–26 °C",
      warmDays: 12, coolDays: 21, retryDays: 5, feedDays: 100, feedType: "Grünpflanzendünger",
      measure: "Mit einem Stäbchen am Topfrand bis etwa zur halben Ballentiefe testen. Die Erde auch tiefer abtrocknen lassen.",
      water: "Erst gießen, wenn das Substrat weitgehend trocken ist. Staunässe vermeiden. Die Rhizome speichern Wasser.",
      placement: "Helles, gefiltertes Licht ist ein guter Start. Auch mäßig helle Plätze gehen. Zugluft und kalte Standorte meiden.",
      url: "https://plants.ces.ncsu.edu/plants/zamioculcas-zamiifolia/"
    },
    rubber: {
      name: "Gummibaum", botanical: "Ficus elastica", aliases: ["Ficus elastica"],
      image: "rubber", light: "filtered", temperature: "Etwa 18–26 °C",
      warmDays: 7, coolDays: 12, retryDays: 3, feedDays: 28, feedType: "Grünpflanzendünger",
      measure: "Die oberen 3–4 cm Erde fühlen und bei großen Töpfen zusätzlich tiefer prüfen.",
      water: "Die oberste Erdschicht abtrocknen lassen. Dann gründlich gießen, abtropfen lassen und den Übertopf leeren.",
      placement: "An ein helles Fenster mit gefiltertem Licht stellen. Starke Temperaturwechsel und Zugluft vermeiden.",
      url: "https://plants.ces.ncsu.edu/plants/ficus-elastica/"
    },
    orchid: {
      name: "Schmetterlingsorchidee", botanical: "Phalaenopsis", aliases: ["Phalaenopsis", "Schmetterlingsorchidee"],
      image: "orchid", light: "filtered", temperature: "Etwa 17–25 °C",
      warmDays: 6, coolDays: 9, retryDays: 2, feedDays: 21, feedType: "Orchideendünger",
      measure: "Bei Rindensubstrat sichtbare Wurzeln, Kondenswasser und Topfgewicht prüfen. Helle, silbrige Wurzeln und ein leichter Topf sprechen für Bedarf.",
      water: "Bei fast trockenem Substrat wässern und gut abtropfen lassen. Kein Wasser im Herz der Pflanze oder im Übertopf stehen lassen.",
      placement: "Hell, temperiert und ohne direkte Mittagssonne. Vor kalter Zugluft schützen.",
      url: "https://www.rhs.org.uk/plants/phalaenopsis/growing-guide"
    },
    aloe: {
      name: "Aloe vera", botanical: "Aloe vera", aliases: ["Echte Aloe", "Aloe"],
      image: "aloe", light: "sunny", temperature: "Warm, frostfrei",
      warmDays: 12, coolDays: 21, retryDays: 5, feedDays: 42, feedType: "Kakteendünger",
      measure: "Mit einem Stäbchen am Topfrand tiefer als die Oberfläche prüfen. Nur ein trockener, leichter Ballen spricht für Wasserbedarf.",
      water: "Fast vollständig trocknen lassen. In hellem, warmem Stand bei Bedarf wässern und vollständig abtropfen lassen. Im kühlen Winter sehr sparsam bleiben.",
      placement: "Sehr hell, gern mit direkter Sonne. Langsam daran gewöhnen und den Platz gut lüften.",
      url: "https://www.rhs.org.uk/plants/aloe"
    },
    custom: {
      name: "Eigene oder unbekannte Art", botanical: "", aliases: [],
      light: "unknown", temperature: "Artspezifisch",
      warmDays: 7, coolDays: 10, retryDays: 3, feedDays: null, feedType: null,
      measure: "Bei Erde zuerst an der Oberfläche und etwa 2 cm tief prüfen. Bei einem tiefen Topf auch das Gewicht oder ein Holzstäbchen nutzen.",
      water: "Gießbedarf und Trockenverträglichkeit hängen von der Art ab. Bei nassem Ballen warten. Bei trockenem Ballen das artspezifische Gießprofil prüfen.",
      placement: "Bis zur Bestimmung einen hellen Platz ohne starke Mittagssonne, kalte Zugluft oder direkte Heizungswärme wählen.",
      url: ""
    }
  };

  const seasons = [
    { name: "Winter", icon: "snow", tip: "Weniger Licht bremst das Wachstum. Prüfe auch tiefere Erdschichten und halte die Pflanzen von kalten Scheiben und Heizkörpern fern." },
    { name: "Frühling", icon: "sprout", tip: "Bei sichtbarem Neuaustrieb kannst du die Pflege langsam erhöhen. Gewöhne Blätter schrittweise an die kräftigere Sonne." },
    { name: "Sommer", icon: "sun", tip: "Hitze und viel Licht lassen kleine Töpfe schneller austrocknen. Prüfe die Erde öfter und filtere starke Mittagssonne bei empfindlichen Arten." },
    { name: "Herbst", icon: "leaf", tip: "Mit kürzeren Tagen trocknen viele Töpfe langsamer ab. Prüfe die Erde vor dem Gießen und achte beim Lüften auf kalte Zugluft." }
  ];

  const observations = {
    clear: { name: "Keine Auffälligkeit", advice: "" },
    yellow: { name: "Gelbe oder blasse Blätter", advice: "Feuchtigkeit und Abfluss prüfen. Auch wenig Licht, Schädlinge oder ältere Blätter kommen infrage. Bei anhaltender Aufhellung zuerst Art, Licht, Wurzeln und Substrat prüfen, bevor du die Düngung änderst." },
    brown: { name: "Braune Spitzen oder Flecken", advice: "Bei trockenen Blattspitzen auf Heizungsnähe, Gießschwankungen und Salzablagerungen achten. Trockene Flecken auf der Fensterseite können auf Sonnenbrand hindeuten." },
    wilt: { name: "Schlaffe Blätter", advice: "Die Feuchte tiefer im Topf prüfen. Bei trockenem Ballen nach Profil gießen. Bei nassem Ballen Wasser abgießen und bei anhaltender Welke die Wurzeln auf weiche oder faulige Stellen prüfen." },
    stretched: { name: "Lange, blasse Triebe", advice: "Den Lichtplatz im Tagesverlauf prüfen. Einen helleren Platz suchen und die Pflanze langsam an mehr Licht gewöhnen." },
    pests: { name: "Gespinste, Beläge oder Schädlinge", advice: "Die Pflanze von anderen trennen. Blattunterseiten und Triebspitzen ansehen und den Schädling vor einer Behandlung bestimmen." }
  };
  const moistureLevels = { dry: "Trocken", damp: "Leicht feucht", wet: "Nass" };
  const sunlight = {
    unknown: "Noch offen",
    filtered: "Keine direkte Sonne",
    gentle: "Kurze Morgen- oder Abendsonne",
    strong: "Starke oder längere direkte Sonne"
  };
  const lightLabels = {
    unknown: "Lichtbedarf noch offen",
    filtered: "Hell und indirekt",
    tolerant: "Hell und indirekt",
    adaptable: "Hell, Halbschatten möglich",
    sunny: "Sehr hell, mit direkter Sonne"
  };
  const visualLevels = { dark: "Dunkel", dim: "Mäßig hell", bright: "Hell", intense: "Sehr hell" };
  const limits = { plants: 250, readings: 300, comparisons: 150, history: 500, bytes: 2_000_000 };
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const normalize = value => value.toLocaleLowerCase("de").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("ß", "ss");
  const day = (date = new Date()) => [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, i) => String(part).padStart(i === 0 ? 4 : 2, "0")).join("-");
  const atNoon = value => new Date(value + "T12:00:00");
  const monthOf = value => Number(value.slice(5, 7));
  const shift = (value, count) => {
    const result = atNoon(value);
    result.setDate(result.getDate() + count);
    return day(result);
  };
  const daysBetween = (start, end) => Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000);
  const validDay = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && value >= "1900-01-01" && value <= "2199-12-31" && day(atNoon(value)) === value;
  const growing = value => monthOf(value) >= 4 && monthOf(value) <= 9;
  const season = value => seasons[Math.floor((monthOf(value) % 12) / 3)];
  const shortDate = value => new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" }).format(atNoon(value));
  const longDate = value => new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric" }).format(atNoon(value));
  const headerDate = value => new Intl.DateTimeFormat("de-DE", { weekday: "long", day: "numeric", month: "long" }).format(atNoon(value));
  const dueLabel = (date, today = day()) => {
    const difference = daysBetween(today, date);
    if (difference === 0) return "Heute";
    if (difference === 1) return "Morgen";
    if (difference < 0) return difference === -1 ? "1 Tag überfällig" : `${-difference} Tage überfällig`;
    return shortDate(date);
  };

  function guessProfile(name) {
    const words = ` ${normalize(name).replace(/[^a-z0-9]+/g, " ").trim()} `;
    let best = "custom";
    let score = 0;
    for (const [key, profile] of Object.entries(profiles)) {
      if (key === "custom") continue;
      for (const alias of [profile.name, profile.botanical, ...profile.aliases]) {
        const term = normalize(alias).replace(/[^a-z0-9]+/g, " ").trim();
        if (term.length > score && words.includes(" " + term + " ")) {
          best = key;
          score = term.length;
        }
      }
    }
    return best;
  }

  const hasRecentRepot = (plant, today) => {
    if (!plant.repottedOn) return false;
    const age = daysBetween(plant.repottedOn, today);
    return age >= 0 && age < 14;
  };

  function checkInterval(plant, today) {
    const profile = profiles[plant.profile];
    const interval = plant.interval ?? (growing(today) ? profile.warmDays : profile.coolDays);
    return hasRecentRepot(plant, today) ? Math.min(interval, profile.retryDays) : interval;
  }

  function nextCheck(plant, today) {
    const last = plant.history.find(item => item.kind === "check");
    if (!last) return plant.createdOn;
    const profile = profiles[plant.profile];
    const interval = Math.min(checkInterval(plant, today), hasRecentRepot(plant, last.on) ? profile.retryDays : Infinity);
    const wait = last.followUp ?? (!last.watered && last.moisture !== "dry" ? Math.min(interval, profile.retryDays) : interval);
    const planned = shift(last.on, wait);
    if (!plant.repottedOn || plant.repottedOn <= last.on) return planned;
    const reviewAfterRepot = shift(plant.repottedOn, profile.retryDays);
    return planned < reviewAfterRepot ? planned : reviewAfterRepot;
  }

  function feedPlan(plant, today) {
    const profile = profiles[plant.profile];
    if (!profile.feedDays) return { date: null, pause: "Art bestimmen, bevor du einen Düngeplan nutzt." };
    const last = plant.history.find(item => item.kind === "feed");
    const pauseUntil = plant.repottedOn && shift(plant.repottedOn, 42);
    let date = last ? shift(last.on, last.fertilized ? profile.feedDays : 7) : shift(plant.createdOn, 14);
    if (pauseUntil && date < pauseUntil) date = pauseUntil;
    if (!growing(today) && date <= today) {
      date = monthOf(today) < 4 ? `${today.slice(0, 4)}-04-01` : `${Number(today.slice(0, 4)) + 1}-04-01`;
    }
    if (!growing(date)) date = monthOf(date) < 4 ? `${date.slice(0, 4)}-04-01` : `${Number(date.slice(0, 4)) + 1}-04-01`;
    const pause = pauseUntil && pauseUntil > today
      ? `Umtopfpause bis ${shortDate(pauseUntil)}. Bei vorgedüngtem Substrat gilt die angegebene Wirkdauer.`
      : !growing(today) ? "Saisonpause bei wenig Licht oder fehlendem Wachstum." : "";
    return { date, pause };
  }

  function tasksFor(plants, today) {
    return plants.flatMap(plant => {
      const check = { plant, kind: "check", date: nextCheck(plant, today) };
      const feed = feedPlan(plant, today);
      return feed.date ? [check, { plant, kind: "feed", date: feed.date }] : [check];
    }).sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind) || a.plant.name.localeCompare(b.plant.name, "de"));
  }

  function wateringAdvice(profile, moisture) {
    if (moisture === "wet") return "Mit dem Gießen warten. Prüfe, ob Wasser im Übertopf steht, und gieße es gegebenenfalls ab.";
    if (moisture === "damp") return "Die Feuchte beobachten und bald erneut prüfen. Bei Erde auch kontrollieren, wie feucht der Ballen unter der Oberfläche ist.";
    if (moisture === "dry") return profile.water;
    return "";
  }

  function lightAssessment(profileKey, reading) {
    const { light } = profiles[profileKey];
    const level = reading.lux === null
      ? reading.visual
      : reading.lux < 540 ? "dark" : reading.lux < 2700 ? "dim" : reading.lux < 10800 ? "bright" : "intense";
    const label = visualLevels[level] ?? "Helligkeit noch offen";
    const assessed = (title, advice, tone, fits = false) => ({ title, advice, tone, fits, label });
    if (level === "dark") return assessed("Zu dunkel", "Einen helleren Platz näher am Fenster testen und tagsüber erneut vergleichen.", "warning");
    if (light === "unknown") return assessed("Lichtwert eingeordnet", "Wähle ein bekanntes Pflanzenprofil, um den Platz auf Eignung zu prüfen.", "neutral");
    if (reading.sun === "strong" && light !== "sunny" && light !== "adaptable") {
      return assessed("Direkte Sonne filtern", "Ein transparenter Vorhang oder mehr Abstand kann die starke Sonne abmildern. Danach erneut prüfen.", "warning");
    }
    if ((light === "filtered" && level === "dim") || (light === "sunny" && level !== "intense")) {
      return assessed("Eher zu dunkel", "Vergleiche den Platz mit einem helleren Standort auf Blatthöhe.", "warning");
    }
    if (reading.sun === "unknown") return assessed("Sonnenverlauf noch prüfen", "Beobachte zusätzlich zum Luxwert, ob und wann die Sonne direkt auf die Blätter fällt.", "neutral");
    if (light === "sunny" && reading.sun === "filtered") {
      return assessed("Hell, aber ohne direkte Sonne", "Ein Standort mit etwas direkter Sonne kann besser passen. Gewöhne die Pflanze schrittweise daran.", "neutral");
    }
    if (light === "adaptable" && reading.sun === "strong") {
      return assessed("Langsam an Sonne gewöhnen", "Starke Mittagssonne zunächst filtern und die Pflanze schrittweise an mehr Licht gewöhnen.", "neutral");
    }
    if ((light === "tolerant" || light === "adaptable") && level === "dim") {
      return assessed("Möglich, heller ist besser", "Die Art verträgt mäßig helles Licht. Für stärkeres Wachstum einen helleren Platz testen.", "neutral");
    }
    return assessed("Passender Kandidat", "Beobachte den Platz auch zu anderen Tageszeiten. Sonne und Helligkeit ändern sich mit Wetter und Jahreszeit.", "positive", true);
  }

  Object.assign(window.BW ??= {}, {
    profiles, observations, moistureLevels, sunlight, lightLabels, visualLevels, limits, own, normalize,
    day, shift, daysBetween, validDay, growing, season, shortDate, longDate, headerDate, dueLabel,
    guessProfile, hasRecentRepot, checkInterval, nextCheck, feedPlan, tasksFor, wateringAdvice, lightAssessment
  });
})();
