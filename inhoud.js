(() => {
  const paginaInhoud = document.body.dataset.inhoud || '';
  const bestanden = ['algemeen'];

  if (paginaInhoud && paginaInhoud !== 'algemeen') {
    bestanden.push(paginaInhoud);
  }

  const data = {};

  function haal(pad) {
    const delen = pad.split('.');

    if (!(delen[0] in data)) return undefined;

    let huidig = data;

    for (const sleutel of delen) {
      if (
        huidig === null ||
        typeof huidig !== 'object' ||
        !(sleutel in huidig)
      ) {
        return '';
      }

      huidig = huidig[sleutel];
    }

    return huidig;
  }

  function tekstVan(waarde) {
    return typeof waarde === 'string' ? waarde.trim() : '';
  }

  function veiligeLink(waarde) {
    const tekst = tekstVan(waarde);

    if (!tekst) return '';

    try {
      const url = new URL(tekst);

      return url.protocol === 'https:' || url.protocol === 'http:'
        ? url.href
        : '';
    } catch (_) {
      return '';
    }
  }

  function fotoPad(waarde) {
    const pad = tekstVan(waarde);

    if (!pad) return '';
    if (/^https:\/\//i.test(pad)) return pad;
    if (/^[a-z][a-z0-9+.-]*:/i.test(pad) || pad.startsWith('//')) return '';

    const schoon = pad.replace(/^\/+/, '');

    return schoon.split('/').includes('..') ? '' : schoon;
  }

  function zetTekst(element, tekst) {
    element.replaceChildren();

    String(tekst).split(/\r?\n/).forEach((regel, index) => {
      if (index > 0) element.append(document.createElement('br'));
      element.append(document.createTextNode(regel));
    });
  }

  function maak(tag, klasse, tekst) {
    const element = document.createElement(tag);

    if (klasse) element.className = klasse;
    if (tekst) zetTekst(element, tekst);

    return element;
  }

  function maakWaarde(item, index) {
    const kaart = maak('article', 'value');

    kaart.append(
      maak('span', 'value-number', String(index + 1).padStart(2, '0')),
      maak('h3', '', tekstVan(item.titel))
    );

    if (tekstVan(item.tekst)) {
      kaart.append(maak('p', '', tekstVan(item.tekst)));
    }

    return kaart;
  }

  function maakVrouw(item, index) {
    const kaart = maak('article', 'founder');
    const beeld = maak('div', 'founder-visual');
    const pad = fotoPad(item.foto);

    if (pad) {
      const foto = document.createElement('img');

      foto.src = pad;
      foto.alt = tekstVan(item.naam);
      foto.loading = 'lazy';
      foto.decoding = 'async';

      beeld.classList.add('has-photo');
      beeld.append(foto);
    } else {
      beeld.setAttribute('aria-hidden', 'true');
      beeld.textContent = String(index + 1).padStart(2, '0');
    }

    kaart.append(beeld, maak('h3', '', tekstVan(item.naam)));

    if (tekstVan(item.rol)) {
      kaart.append(maak('p', 'founder-role', tekstVan(item.rol)));
    }

    if (tekstVan(item.tekst)) {
      kaart.append(maak('p', '', tekstVan(item.tekst)));
    }

    return kaart;
  }

  function maakBijeenkomst(item) {
    const kaart = maak('article', 'event');

    const datum = maak('div', 'event-date', tekstVan(item.datum));

    if (tekstVan(item.tijd)) {
      datum.append(maak('span', 'event-time', tekstVan(item.tijd)));
    }

    const inhoud = maak('div', 'event-body');

    inhoud.append(maak('h3', '', tekstVan(item.titel)));

    if (tekstVan(item.locatie)) {
      inhoud.append(maak('p', 'event-meta', tekstVan(item.locatie)));
    }

    if (tekstVan(item.beschrijving)) {
      inhoud.append(maak('p', '', tekstVan(item.beschrijving)));
    }

    const actie = maak('div', 'event-action');
    const url = veiligeLink(item.aanmeldlink);

    if (url) {
      const knop = maak(
        'a',
        'button',
        tekstVan(haal('bijeenkomsten.agenda_teksten.aanmeld_knop')) ||
          'Aanmelden'
      );

      knop.href = url;
      knop.target = '_blank';
      knop.rel = 'noopener noreferrer';
      actie.append(knop);
    } else {
      const notitie = tekstVan(
        haal('bijeenkomsten.agenda_teksten.geen_link')
      );

      if (notitie) actie.append(maak('p', 'event-note', notitie));
    }

    kaart.append(datum, inhoud, actie);

    return kaart;
  }

  const lijstMakers = {
    waarde: maakWaarde,
    vrouw: maakVrouw,
    bijeenkomst: maakBijeenkomst
  };

  function pasToe() {
    document.querySelectorAll('[data-tekst]').forEach(element => {
      const waarde = haal(element.dataset.tekst);

      if (waarde === undefined || waarde === null) return;

      const tekst = String(waarde).trim();

      if (tekst === '') {
        element.replaceChildren();
        element.hidden = true;
        return;
      }

      zetTekst(element, (element.dataset.prefix || '') + tekst);
    });

    document.querySelectorAll('img[data-foto]').forEach(foto => {
      const waarde = haal(foto.dataset.foto);

      if (waarde === undefined || waarde === null) return;

      const pad = fotoPad(waarde);

      if (!pad) {
        foto.hidden = true;
        return;
      }

      foto.src = pad;
      foto.hidden = false;

      if (foto.dataset.alt) {
        const alt = haal(foto.dataset.alt);

        if (typeof alt === 'string') foto.alt = alt;
      }
    });

    document.querySelectorAll('a[data-link]').forEach(link => {
      const waarde = haal(link.dataset.link);

      if (waarde === undefined || waarde === null) return;

      const url = veiligeLink(waarde);

      if (url) {
        link.href = url;
        link.hidden = false;
      } else {
        link.hidden = true;
      }
    });

    document.querySelectorAll('[data-niet-als]').forEach(element => {
      if (veiligeLink(haal(element.dataset.nietAls))) {
        element.hidden = true;
      }
    });

    document.querySelectorAll('[data-lijst]').forEach(houder => {
      const waarde = haal(houder.dataset.lijst);
      const maker = lijstMakers[houder.dataset.soort];

      if (waarde === undefined || !maker) return;

      const lijst = Array.isArray(waarde) ? waarde : [];

      houder.replaceChildren(
        ...lijst
          .filter(item => item && typeof item === 'object')
          .map((item, index) => maker(item, index))
      );
    });

    document.querySelectorAll('[data-leeg]').forEach(element => {
      const waarde = haal(element.dataset.leeg);

      if (Array.isArray(waarde) && waarde.length > 0) {
        element.hidden = true;
      }
    });
  }

  function laad(naam) {
    return fetch('content/' + naam + '.json', { cache: 'no-cache' })
      .then(antwoord => {
        if (!antwoord.ok) throw new Error(naam);
        return antwoord.json();
      })
      .then(inhoud => [naam, inhoud]);
  }

  Promise.allSettled(bestanden.map(laad)).then(resultaten => {
    resultaten.forEach(resultaat => {
      if (resultaat.status === 'fulfilled') {
        data[resultaat.value[0]] = resultaat.value[1];
      }
    });

    pasToe();
  });
})();
