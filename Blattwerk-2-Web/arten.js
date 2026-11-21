(() => {
  "use strict";

  const nc = slug => "https://plants.ces.ncsu.edu/plants/" + slug + "/";
  const succulent = "https://www.rhs.org.uk/plants/types/cacti-succulents/houseplants/growing-guide";
  const leafyFeed = "Grünpflanzendünger";
  const bloomFeed = "Zimmerpflanzen-Flüssigdünger nach Etikett";
  const cactusFeed = "Kakteendünger";
  const top = "Die oberen 2–3 cm Erde mit dem Finger prüfen. Bei einem tiefen Topf zusätzlich mit einem Stäbchen am Rand kontrollieren.";
  const shallow = "Die oberen 1–2 cm prüfen. Bei trockener Oberfläche auch knapp darunter nachfühlen.";
  const dryDeep = "Mit einem Stäbchen bis etwa zur halben Ballentiefe prüfen und das Topfgewicht vergleichen.";
  const tropical = "Etwa 18–26 °C";

  const additions = {
    pilea: {
      name: "Ufopflanze", botanical: "Pilea peperomioides", aliases: ["Pilea", "Ufo-Pflanze", "Chinesischer Geldbaum"],
      light: "filtered", temperature: tropical, warmDays: 5, coolDays: 9, retryDays: 3, feedDays: 28, feedType: leafyFeed,
      measure: top, water: "Wenn die obere Schicht trocken ist, gleichmäßig gießen. Das Wasser danach ablaufen lassen.",
      placement: "Hell mit indirektem Licht aufstellen. Den Topf gelegentlich drehen, wenn sich die Pflanze stark zum Fenster neigt.",
      url: "https://www.rhs.org.uk/plants/pilea/how-to-grow-pilea"
    },
    fiddle: {
      name: "Geigenfeige", botanical: "Ficus lyrata", aliases: ["Geigenblatt-Feige", "Fiddle Leaf Fig"],
      light: "filtered", temperature: tropical, warmDays: 7, coolDays: 12, retryDays: 4, feedDays: 35, feedType: leafyFeed,
      measure: "Bei größeren Töpfen die oberen 3–5 cm und tiefer am Rand prüfen.", water: "Die obere Schicht abtrocknen lassen. Gründlich gießen und stehendes Wasser entfernen.",
      placement: "Hell und warm mit indirektem Licht. Kalte Zugluft und abrupte Standortwechsel meiden.", url: nc("ficus-lyrata")
    },
    ficus: {
      name: "Birkenfeige", botanical: "Ficus benjamina", aliases: ["Benjamini", "Benjamin-Feige"],
      light: "filtered", temperature: tropical, warmDays: 6, coolDays: 10, retryDays: 3, feedDays: 35, feedType: leafyFeed,
      measure: top, water: "Nach leichtem Abtrocknen der oberen Schicht gießen und den Ballen abtropfen lassen.",
      placement: "Ein fester heller Platz mit gefilterter Sonne hilft. Kalte Zugluft und wechselnde Temperaturen können Blattfall fördern.", url: nc("ficus-benjamina")
    },
    dragon: {
      name: "Drachenbaum", botanical: "Dracaena marginata", aliases: ["Marginata", "Gerandeter Drachenbaum"],
      light: "tolerant", temperature: tropical, warmDays: 8, coolDays: 13, retryDays: 4, feedDays: 42, feedType: leafyFeed,
      measure: top, water: "Lass die Oberfläche und einen Teil des Ballens abtrocknen. Feuchten, schweren Topf noch stehen lassen.",
      placement: "Helles, gefiltertes Licht und gleichmäßige Wärme. Braune Spitzen können unter anderem von trockener Luft oder mineralhaltigem Wasser kommen.", url: "https://www.rhs.org.uk/plants/dracaena/how-to-grow-dracaena"
    },
    coleus: {
      name: "Buntnessel", botanical: "Coleus scutellarioides", aliases: ["Coleus", "Solenostemon"],
      light: "filtered", temperature: tropical, warmDays: 3, coolDays: 6, retryDays: 2, feedDays: 21, feedType: leafyFeed,
      measure: shallow, water: "Leicht feucht halten. Bei angetrockneter oberer Schicht wässern und überschüssiges Wasser abgießen.",
      placement: "Hell stellen und direkte Mittagssonne je nach Sorte filtern. Neues Wachstum zeigt, ob der Platz passt.", url: nc("coleus-scutellarioides")
    },
    calathea: {
      name: "Korbmarante", botanical: "Goeppertia orbifolia", aliases: ["Calathea", "Goeppertia", "Calathea orbifolia"],
      light: "filtered", temperature: "Etwa 18–25 °C", warmDays: 4, coolDays: 7, retryDays: 2, feedDays: 35, feedType: leafyFeed,
      measure: shallow, water: "Leicht feucht halten. Wenn die Oberfläche antrocknet, mit zimmerwarmem, möglichst kalkarmem Wasser gießen.",
      placement: "Helles Streulicht und höhere Luftfeuchte. Blattspitzen beim Lüften vor kalter Zugluft schützen.", url: "https://www.rhs.org.uk/plants/calathea/growing-guide"
    },
    maranta: {
      name: "Pfeilwurz", botanical: "Maranta leuconeura", aliases: ["Maranta", "Gebetspflanze", "Prayer Plant"],
      light: "filtered", temperature: tropical, warmDays: 4, coolDays: 7, retryDays: 2, feedDays: 35, feedType: leafyFeed,
      measure: shallow, water: "Bei angetrockneter Oberfläche gleichmäßig gießen. Bei wenig Wachstum im Winter langsamer nachgießen.",
      placement: "Hell bis halbschattig ohne starke Sonne. Feuchte, warme Luft und ein Platz abseits der Heizung sind günstig.", url: nc("maranta-leuconeura")
    },
    alocasia: {
      name: "Alokasie", botanical: "Alocasia × amazonica", aliases: ["Alocasia", "Alocasia Polly", "Pfeilblatt", "Elefantenohr"],
      light: "filtered", temperature: "Etwa 18–28 °C", warmDays: 4, coolDays: 8, retryDays: 2, feedDays: 28, feedType: leafyFeed,
      measure: shallow, water: "Während des Wachstums gleichmäßig leicht feucht halten. Bei Wachstumspause zurückhaltend gießen und Staunässe vermeiden.",
      placement: "Hell, warm und luftfeucht mit gefiltertem Licht. Am kühlen Fenster trocknet der Ballen langsamer ab.", url: nc("alocasia")
    },
    philo: {
      name: "Herzblatt-Philodendron", botanical: "Philodendron hederaceum", aliases: ["Philodendron", "Baumfreund", "Heartleaf"],
      light: "tolerant", temperature: tropical, warmDays: 6, coolDays: 10, retryDays: 3, feedDays: 28, feedType: leafyFeed,
      measure: top, water: "Die obere Schicht abtrocknen lassen, dann gründlich wässern und den Topf abtropfen lassen.",
      placement: "Helles indirektes Licht ist günstig. Grüne Formen kommen auch mit mäßig hellen Plätzen zurecht.", url: "https://www.rhs.org.uk/plants/philodendron/growing-guide"
    },
    adansonii: {
      name: "Kleines Fensterblatt", botanical: "Monstera adansonii", aliases: ["Monkey Leaf", "Monkey Mask", "Adansonii"],
      light: "filtered", temperature: tropical, warmDays: 5, coolDays: 9, retryDays: 3, feedDays: 28, feedType: leafyFeed,
      measure: top, water: "Bei angetrockneter Oberfläche und leicht feuchtem Ballen gießen. Luftiges Substrat und guten Ablauf bieten.",
      placement: "Hell mit indirektem Licht. Warme, etwas feuchtere Luft und eine Rankhilfe fördern kräftige Triebe.", url: nc("monstera-adansonii")
    },
    scindapsus: {
      name: "Gefleckte Efeutute", botanical: "Scindapsus pictus", aliases: ["Scindapsus", "Satin Pothos", "Silber-Efeutute"],
      light: "filtered", temperature: tropical, warmDays: 7, coolDays: 11, retryDays: 3, feedDays: 35, feedType: leafyFeed,
      measure: top, water: "Erst nach Antrocknen der oberen Erde wässern. Eine dauerhaft feuchte Tiefe spricht fürs Warten.",
      placement: "Hell mit gefiltertem Licht. Bei zu wenig Licht kann die silberne Zeichnung schwächer werden.", url: nc("scindapsus-pictus")
    },
    syngonium: {
      name: "Purpurtute", botanical: "Syngonium podophyllum", aliases: ["Syngonium", "Pfeilblatt-Purpurtute", "Arrowhead"],
      light: "tolerant", temperature: tropical, warmDays: 5, coolDays: 9, retryDays: 3, feedDays: 28, feedType: leafyFeed,
      measure: top, water: "Den Ballen leicht feucht halten und zwischen den Gießgängen oben antrocknen lassen.",
      placement: "Helles Streulicht, bei heller Blattzeichnung besonders fensternah mit Filter. Zugige kalte Fensterbänke meiden.", url: nc("syngonium-podophyllum")
    },
    anthurium: {
      name: "Flamingoblume", botanical: "Anthurium andraeanum", aliases: ["Anthurium", "Flamingopflanze"],
      light: "filtered", temperature: "Etwa 19–27 °C", warmDays: 5, coolDays: 9, retryDays: 3, feedDays: 35, feedType: bloomFeed,
      measure: shallow, water: "Nach Antrocknen der Oberfläche gießen. Im luftigen Substrat gleichmäßig leicht feucht und frei von Staunässe halten.",
      placement: "Hell ohne heiße Sonne und gern luftfeucht. Wenig Licht kann die Blütenbildung schwächen.", url: nc("anthurium-andraeanum")
    },
    castiron: {
      name: "Schusterpalme", botanical: "Aspidistra elatior", aliases: ["Aspidistra", "Metzgerpalme", "Cast Iron Plant"],
      light: "tolerant", temperature: "Etwa 15–24 °C", warmDays: 9, coolDays: 15, retryDays: 4, feedDays: 56, feedType: leafyFeed,
      measure: top, water: "Obere Schicht abtrocknen lassen. Gleichmäßig gießen, wenn das Substrat tiefer nur noch leicht feucht ist.",
      placement: "Auch für mäßig helle Plätze geeignet. Vor direkter Mittagssonne und dauerhaft nassem Substrat schützen.", url: nc("aspidistra-elatior")
    },
    jade: {
      name: "Geldbaum", botanical: "Crassula ovata", aliases: ["Crassula", "Pfennigbaum", "Jadebaum", "Jade Plant"],
      light: "sunny", temperature: "Warm und frostfrei", warmDays: 12, coolDays: 21, retryDays: 5, feedDays: 49, feedType: cactusFeed,
      measure: dryDeep, water: "Zwischen den Gießgängen weitgehend trocknen lassen. Im kühlen Winterstand seltener gießen.",
      placement: "Sehr hell, gern mit direkter Sonne nach langsamer Gewöhnung. Ein Topf mit Abflussloch hilft.", url: nc("crassula-ovata")
    },
    echeveria: {
      name: "Echeverie", botanical: "Echeveria elegans", aliases: ["Echeveria", "Mexikanische Schneeballrosette"],
      light: "sunny", temperature: "Warm und frostfrei", warmDays: 12, coolDays: 21, retryDays: 5, feedDays: 49, feedType: cactusFeed,
      measure: dryDeep, water: "Nur bei trockenem Substrat wässern. Den Boden benetzen und Wasser aus der Rosette fernhalten.",
      placement: "Sehr hell stellen und an kräftige Sonne gewöhnen. Kiesiges, durchlässiges Substrat hält den Ballen luftig.", url: "https://www.rhs.org.uk/plants/echeveria"
    },
    holiday: {
      name: "Weihnachtskaktus", botanical: "Schlumbergera", aliases: ["Schlumbergera", "Gliederkaktus", "Christmas Cactus"],
      light: "filtered", temperature: "Etwa 16–24 °C", warmDays: 8, coolDays: 7, retryDays: 3, feedDays: 35, feedType: bloomFeed,
      measure: shallow, water: "Während der Knospen- und Blütezeit leicht feucht halten. Nach der Blüte und bei Wachstumspausen zurückhaltender gießen.",
      placement: "Helles, gefiltertes Licht. Den Platz bei gebildeten Knospen möglichst stabil halten.", url: succulent
    },
    cero: {
      name: "Leuchterblume", botanical: "Ceropegia woodii", aliases: ["Ceropegia", "Kette der Herzen", "String of Hearts"],
      light: "filtered", temperature: "Etwa 16–25 °C", warmDays: 9, coolDays: 15, retryDays: 4, feedDays: 42, feedType: cactusFeed,
      measure: dryDeep, water: "Substrat zwischen den Gießgängen weitgehend abtrocknen lassen. Bei wenig Licht sparsamer gießen.",
      placement: "Einen hellen Platz mit sanfter Sonne wählen. Die langen Triebe als Hängepflanze oder an einer Rankhilfe führen.", url: nc("ceropegia-woodii")
    },
    hoya: {
      name: "Wachsblume", botanical: "Hoya carnosa", aliases: ["Hoya", "Porzellanblume"],
      light: "filtered", temperature: "Etwa 17–26 °C", warmDays: 8, coolDays: 13, retryDays: 4, feedDays: 35, feedType: bloomFeed,
      measure: top, water: "Gießen, wenn die obere Erde angetrocknet und der Ballen leichter ist. Im Winter vorsichtiger wässern.",
      placement: "Helles indirektes Licht mit etwas milder Sonne. Alte Blütenstiele stehen lassen, da dort erneut Blüten entstehen können.", url: nc("hoya-carnosa")
    },
    peperomia: {
      name: "Zwergpfeffer", botanical: "Peperomia obtusifolia", aliases: ["Peperomia", "Stumpfblättrige Peperomie", "Baby Rubber Plant"],
      light: "filtered", temperature: "Etwa 18–25 °C", warmDays: 8, coolDays: 13, retryDays: 4, feedDays: 42, feedType: leafyFeed,
      measure: top, water: "Substrat vor dem nächsten Gießen gut an-, aber nicht völlig austrocknen lassen. Bei kühlerem Stand weniger gießen.",
      placement: "Einen warmen, hellen Platz ohne harte Mittagssonne wählen.", url: nc("peperomia-obtusifolia")
    },
    fern: {
      name: "Schwertfarn", botanical: "Nephrolepis exaltata", aliases: ["Nephrolepis", "Bostonfarn", "Boston Fern"],
      light: "filtered", temperature: "Etwa 16–24 °C", warmDays: 3, coolDays: 6, retryDays: 2, feedDays: 35, feedType: leafyFeed,
      measure: shallow, water: "Den Wurzelballen gleichmäßig leicht feucht halten und Wasser gut ablaufen lassen.",
      placement: "Helles indirektes Licht und luftfeuchte Umgebung. Den Ballen an Heizung und zugigen Fenstern häufiger prüfen.", url: nc("nephrolepis-exaltata")
    },
    palm: {
      name: "Goldfruchtpalme", botanical: "Dypsis lutescens", aliases: ["Areca", "Arecapalme", "Chrysalidocarpus lutescens", "Dypsis"],
      light: "filtered", temperature: tropical, warmDays: 5, coolDays: 9, retryDays: 3, feedDays: 35, feedType: "Palmendünger",
      measure: top, water: "Die obere Schicht antrocknen lassen und den Rest leicht feucht halten. Bei wenig Licht langsamer nachgießen.",
      placement: "Hell und warm ohne starke Mittagssonne. Blattunterseiten regelmäßig auf Spinnmilben ansehen.", url: nc("chrysalidocarpus-lutescens")
    },
    strelitzia: {
      name: "Paradiesvogelblume", botanical: "Strelitzia reginae", aliases: ["Strelitzie", "Strelitzia", "Bird of Paradise"],
      light: "sunny", temperature: "Etwa 16–27 °C", warmDays: 6, coolDays: 11, retryDays: 3, feedDays: 28, feedType: bloomFeed,
      measure: "Die oberen 3–4 cm und im großen Topf zusätzlich den tieferen Ballen prüfen.", water: "Bei angetrockneter Oberfläche wässern und Überschuss ablaufen lassen. Im lichtarmen Winter eher trockener halten.",
      placement: "Sehr hell stellen. Vor einem Wechsel an einen sonnigen Platz langsam an stärkere Sonne gewöhnen.", url: nc("strelitzia-reginae")
    }
  };
  for (const [key, profile] of Object.entries(additions)) window.BW.profiles[key] = { image: key, ...profile };
})();
