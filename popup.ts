fetch('icon/logo.svg')
  .then(response => response.text())
  .then(svg => document.querySelector<HTMLDivElement>('#logo').innerHTML = svg);

settingsLoaded.then(
  () => document.querySelector<HTMLDivElement>('#toggles')
    .append(...Object.values(createToggles()).map(toggle => toggle.labelEl)),
);