(() => {
  const $ = (selector) => document.querySelector(selector);
  const map = $('#map');
  const objectsNode = $('#objects');
  let records = [];
  const markers = new Map();

  function render() {
    const showSentimental = $('#sentimental-toggle').checked;
    const showPractical = $('#practical-toggle').checked;
    const query = $('#search').value.trim().toLocaleLowerCase();
    map.dataset.x = String(showSentimental);
    map.dataset.y = String(showPractical);
    const collisions = new Map();

    records.forEach((record) => {
      const marker = markers.get(record.id);
      marker.hidden = !`${record.name} ${record.description || ''}`.toLocaleLowerCase().includes(query);
      const baseX = showSentimental ? 5 + Number(record.sentimental) * 9 : 50;
      const baseY = showPractical ? 95 - Number(record.practical) * 9 : 50;
      const key = `${baseX}:${baseY}`;
      const collision = collisions.get(key) || 0;
      collisions.set(key, collision + 1);
      let x = baseX;
      let y = baseY;
      if (collision > 0) {
        if (showSentimental && showPractical) {
          const spread = marker.offsetHeight / map.clientHeight * 120 * collision;
          y += (baseY < 50 ? 1 : -1) * spread;
        } else if (showSentimental) {
          const spread = marker.offsetWidth / map.clientWidth * 120 * collision;
          x += (baseX < 50 ? 1 : -1) * spread;
        } else if (showPractical) {
          const spread = marker.offsetHeight / map.clientHeight * 120 * collision;
          y += (baseY < 50 ? 1 : -1) * spread;
        } else {
          const spread = marker.offsetWidth / map.clientWidth * 120 * collision;
          x += spread;
        }
      }
      x = Math.max(3, Math.min(97, x));
      y = Math.max(3, Math.min(97, y));
      marker.style.left = `${x}%`;
      marker.style.top = `${y}%`;
    });
  }

  function showDetails(record) {
    const panel = $('#object-details');
    panel.replaceChildren();
    const layout = document.createElement('div');
    layout.className = 'detail-layout';
    const image = document.createElement('img');
    image.src = record.image;
    image.alt = record.name;
    const copy = document.createElement('div');
    copy.className = 'detail-copy';
    const heading = document.createElement('h2');
    heading.textContent = record.name;
    const description = document.createElement('p');
    description.textContent = record.description || '';
    const meta = document.createElement('div');
    meta.className = 'detail-meta';
    const sentimental = document.createElement('div');
    sentimental.textContent = `sentimental value: ${record.sentimental}`;
    const practical = document.createElement('div');
    practical.textContent = `practical value: ${record.practical}`;
    meta.append(sentimental, practical);
    copy.append(heading, description, meta);
    layout.append(image, copy);
    panel.append(layout);
    $('#object-dialog').showModal();
  }

  function createMarkers() {
    objectsNode.replaceChildren();
    markers.clear();
    records.forEach((record) => {
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'object-marker';
      marker.setAttribute('aria-label', `${record.name}, sentimental value ${record.sentimental} of 10, practical value ${record.practical} of 10`);
      const image = document.createElement('img');
      image.src = record.image;
      image.alt = record.name;
      marker.append(image);
      marker.addEventListener('click', () => showDetails(record));
      markers.set(record.id, marker);
      objectsNode.append(marker);
    });
    render();
  }

  const objectDialog = $('#object-dialog');
  objectDialog.addEventListener('click', (event) => {
    const bounds = objectDialog.getBoundingClientRect();
    const clickedInside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    if (!clickedInside) objectDialog.close();
  });
  $('#search').addEventListener('input', render);
  $('#sentimental-toggle').addEventListener('change', render);
  $('#practical-toggle').addEventListener('change', render);

  fetch('./objects.json')
    .then((response) => {
      if (!response.ok) throw new Error(`Could not load objects.json (${response.status}).`);
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error('objects.json must contain a list of objects.');
      records = data;
      createMarkers();
    })
    .catch((error) => {
      console.error(error);
      objectsNode.textContent = window.location.protocol === 'file:'
        ? 'Open this page through a local web server to load objects.json. From the project folder, run: python3 -m http.server 8000'
        : `Could not load objects.json: ${error.message} Check that it is beside map.html and available at this site address.`;
    });
})();
