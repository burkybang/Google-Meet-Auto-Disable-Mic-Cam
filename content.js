Promise.all([
    settingsLoaded,
    windowLoaded,
]).then(async () => {
    const togglesObj = createToggles();
    const toggles = Object.values(togglesObj);
    let originalPageTitle;
    let buttonObserver;
    const observeButtons = () => document.title =
        (togglesObj["disableMic"].disabled ? `${togglesObj["disableMic"].emoji} ` : '') +
            (togglesObj["disableCam"].disabled ? '' : `${togglesObj["disableCam"].emoji} `) +
            originalPageTitle;
    const isValidStorageName = (storageName) => storageName in togglesObj;
    const syncStorageListener = (changes) => Object.entries(changes).forEach(([storageName, { newValue }]) => {
        if (isValidStorageName(storageName) && typeof newValue === 'boolean')
            togglesObj[storageName].checked = newValue;
    });
    const observeNavigation = () => {
        if (!toggles.every(toggle => toggle.buttonEl))
            return;
        if (!originalPageTitle) {
            originalPageTitle = document.title;
            toggles.forEach(toggle => {
                if (toggle.autoDisable)
                    toggle.disable();
            });
            observeButtons();
        }
        const isPreMeeting = toggles.every(toggle => {
            const buttonIsDiv = toggle.buttonEl.tagName === 'DIV';
            if (buttonIsDiv) {
                toggle.onChange((checkboxEl) => {
                    if (checkboxEl.checked)
                        toggle.disable();
                });
                toggle.labelStyle = {
                    color: 'white',
                    position: 'absolute',
                    bottom: '0',
                    [toggle.direction]: '100px',
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
                toggle.buttonEl.parentElement.append(toggle.labelEl);
            }
            return buttonIsDiv;
        });
        if (isPreMeeting)
            chrome.storage.sync.onChanged.addListener(syncStorageListener);
        else
            chrome.storage.sync.onChanged.removeListener(syncStorageListener);
        if (toggles.some(toggle => !toggle.buttonOnDOM)) {
            buttonObserver?.disconnect();
        }
        else {
            buttonObserver = new MutationObserver(observeButtons);
            toggles.forEach(toggle => buttonObserver.observe(toggle.buttonEl, { attributes: true }));
        }
    };
    observeNavigation();
    const navigationObserver = new MutationObserver(observeNavigation);
    navigationObserver.observe(document.body, { childList: true });
});
