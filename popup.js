settingsLoaded.then(() => document.querySelector('#toggles')
    .append(...Object.values(createToggles()).map(toggle => toggle.labelEl)));
