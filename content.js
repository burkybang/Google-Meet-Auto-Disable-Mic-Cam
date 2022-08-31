Promise.all([
    settingsLoaded,
    windowLoaded,
]).then(async () => {
    const togglesObj = createToggles();
    const toggles = Object.values(togglesObj);
    await new Promise(resolve => {
        const observer = new MutationObserver(() => {
            if (!toggles.every(toggle => toggle.buttonEl = document.querySelector(`div[role="button"][aria-label$=" + ${toggle.key})" i][data-is-muted]`)))
                return;
            observer.disconnect();
            resolve();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
    toggles.forEach((toggle) => {
        const { direction, buttonEl, autoDisable } = toggle;
        toggle.onChange((checkboxEl) => {
            if (checkboxEl.checked)
                toggle.disable();
        });
        toggle.labelStyle = {
            color: 'white',
            position: 'absolute',
            bottom: '0',
            [direction]: '100px',
            zIndex: '1',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
        };
        toggle.checkboxStyle = {
            cursor: 'pointer',
            margin: '0 4px 0 0',
            position: 'relative',
            top: '1px',
        };
        buttonEl.parentElement.append(toggle.labelEl);
        if (autoDisable)
            toggle.disable();
    });
    chrome.storage.sync.onChanged.addListener(changes => Object.entries(changes)
        .forEach(([storageName, { newValue }]) => togglesObj[storageName].checked = newValue));
});
