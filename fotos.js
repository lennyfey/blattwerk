(() => {
  "use strict";

  const sourceLimit = 30 * 1024 * 1024;
  const photoLimit = 205_000;
  const base64Prefix = "data:image/jpeg;base64,";
  const urls = new Map();
  let opening;

  function openDatabase() {
    if (!window.indexedDB) return Promise.reject(new Error("Der Browser stellt keinen lokalen Fotospeicher bereit."));
    if (!opening) {
      opening = new Promise((resolve, reject) => {
        const request = indexedDB.open("blattwerk-fotos", 1);
        request.onupgradeneeded = () => request.result.createObjectStore("fotos");
        request.onsuccess = () => {
          const database = request.result;
          database.onversionchange = () => { database.close(); opening = null; };
          resolve(database);
        };
        request.onerror = () => reject(new Error("Der lokale Fotospeicher konnte nicht geöffnet werden."));
      }).catch(error => { opening = null; throw error; });
    }
    return opening;
  }

  async function transaction(mode, useStore) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = database.transaction("fotos", mode);
      const result = useStore(tx.objectStore("fotos"));
      tx.oncomplete = () => resolve(result?.result);
      tx.onabort = () => reject(new Error("Das Pflanzenfoto konnte im lokalen Speicher nicht verarbeitet werden. Prüfe den freien Gerätespeicher."));
    });
  }

  const get = id => transaction("readonly", store => store.get(id));
  const put = entries => entries.length ? transaction("readwrite", store => {
    for (const [id, blob] of entries) store.add(blob, id);
  }) : Promise.resolve();

  function remove(ids) {
    if (!ids.length) return Promise.resolve();
    return transaction("readwrite", store => {
      for (const id of ids) store.delete(id);
    }).then(() => {
      for (const id of ids) {
        urls.get(id)?.then(url => { if (url) URL.revokeObjectURL(url); }).catch(() => {});
        urls.delete(id);
      }
    });
  }

  function populate(container) {
    for (const image of container.querySelectorAll("img[data-plant-photo]")) {
      const id = image.dataset.plantPhoto;
      if (!id) continue;
      if (!urls.has(id)) urls.set(id, get(id).then(blob => blob ? URL.createObjectURL(blob) : null).catch(() => null));
      urls.get(id).then(url => {
        if (url && image.isConnected && image.dataset.plantPhoto === id) image.src = url;
      });
    }
  }

  async function imageFromBlob(blob, usable) {
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("Dieses Bildformat kann der Browser nicht öffnen. Wähle ein JPG, PNG oder WebP."));
        image.src = url;
      });
      return await usable(image);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function prepare(file) {
    if (!file.size || file.size > sourceLimit) throw new Error("Wähle ein Bild mit höchstens 30 MB.");
    const extension = /\.(?:jpe?g|png|webp|gif|avif|heic|heif)$/i.test(file.name ?? "");
    if (!/^image\/(?:jpeg|png|webp|gif|avif|heic|heif)$/i.test(file.type) && !(extension && (!file.type || file.type === "application/octet-stream"))) {
      throw new Error("Wähle ein Pflanzenfoto wie JPG, PNG oder WebP.");
    }
    return imageFromBlob(file, async image => {
      const { naturalWidth: width, naturalHeight: height } = image;
      if (!width || !height || width * height > 80_000_000) throw new Error("Dieses Foto hat sehr große Abmessungen. Wähle eine kleinere Kopie.");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Die Fotovorschau konnte nicht vorbereitet werden.");
      for (const [edge, quality] of [[1000, 0.84], [900, 0.74], [750, 0.68], [550, 0.66]]) {
        const scale = Math.min(1, edge / Math.max(width, height));
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        context.fillStyle = "#f6f7f2";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
        if (blob?.type === "image/jpeg" && blob.size <= photoLimit) return blob;
      }
      throw new Error("Das Foto konnte nicht ausreichend verkleinert werden.");
    });
  }

  function asDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Ein Pflanzenfoto konnte nicht für die Sicherung gelesen werden."));
      reader.readAsDataURL(blob);
    });
  }

  async function makeBackup(data) {
    const photos = Object.create(null);
    for (const plant of data.plants) {
      if (!plant.photoId) continue;
      const blob = await get(plant.photoId);
      if (!blob) throw new Error("Ein gespeichertes Pflanzenfoto fehlt. Prüfe die Fotos deiner Steckbriefe vor dem Export.");
      photos[plant.photoId] = await asDataUrl(blob);
    }
    return JSON.stringify({ ...data, photos });
  }

  async function importPhotos(data, photos) {
    const entries = [];
    const plants = [];
    for (const plant of data.plants) {
      if (!plant.photoId) {
        plants.push(plant);
        continue;
      }
      const error = new Error(`Das Foto von „${plant.name}“ in der Sicherung ist beschädigt.`);
      const encoded = photos[plant.photoId];
      if (typeof encoded !== "string" || !encoded.startsWith(base64Prefix) || encoded.length > base64Prefix.length + 4 * Math.ceil(photoLimit / 3)) throw error;
      try {
        const bytes = Uint8Array.from(atob(encoded.slice(base64Prefix.length)), letter => letter.charCodeAt(0));
        if (bytes.length > photoLimit || bytes[0] !== 255 || bytes[1] !== 216 || bytes.at(-2) !== 255 || bytes.at(-1) !== 217) throw error;
        const blob = new Blob([bytes], { type: "image/jpeg" });
        await imageFromBlob(blob, image => {
          if (!image.naturalWidth || !image.naturalHeight || Math.max(image.naturalWidth, image.naturalHeight) > 1000) throw error;
        });
        const photoId = window.BW.id();
        entries.push([photoId, blob]);
        plants.push({ ...plant, photoId });
      } catch {
        throw error;
      }
    }
    return { data: { ...data, plants }, entries };
  }

  window.BW.photos = { prepare, populate, put, remove, makeBackup, importPhotos };
})();
