settingsLoaded.then(
  () => document.querySelector<HTMLDivElement>('#toggles')
    .append(...Object.values(createToggles()).map(toggle => toggle.labelEl)),
);