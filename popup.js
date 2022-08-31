fetch('icon/logo.svg')
    .then(response => response.text())
    .then(svg => document.querySelector('#logo').innerHTML = svg);
settingsLoaded.then(() => document.querySelector('#toggles')
    .append(...Object.values(createToggles()).map(toggle => toggle.labelEl)));
