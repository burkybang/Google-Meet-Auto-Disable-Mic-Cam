Promise.all([
    settingsLoaded,
    windowLoaded,
]).then(async () => {
    const togglesObj = createToggles();
    const toggles = Object.values(togglesObj);
    let originalPageTitle;
    let buttonObserver;
    let titleChangeTimerUp = false;
    const observeButtons = () => {
        if (!originalPageTitle)
            return;
        const titleElements = [originalPageTitle];
        const camToggle = togglesObj["disableCam"];
        if (!camToggle.disabled)
            titleElements.unshift(camToggle.emoji);
        const micToggle = togglesObj["disableMic"];
        if (micToggle.disabled)
            titleElements.unshift(micToggle.emoji);
        document.title = titleElements.join(' ');
    };
    const isValidStorageName = (name) => name in togglesObj;
    const syncStorageListener = (changes) => Object.entries(changes).forEach(([name, { newValue }]) => {
        if (isValidStorageName(name) && typeof newValue === 'boolean')
            togglesObj[name].checked = newValue;
    });
    const observeNavigation = () => {
        if (!toggles.every(toggle => toggle.buttonEl))
            return;
        if (!originalPageTitle && document.title && (document.title !== 'Meet' || titleChangeTimerUp)) {
            originalPageTitle = document.title;
            toggles.forEach(toggle => {
                if (toggle.autoDisable)
                    toggle.disable();
            });
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
    const navigationObserver = new MutationObserver(observeNavigation);
    navigationObserver.observe(document.body, { childList: true });
    observeNavigation();
    setTimeout(() => titleChangeTimerUp = true, 500);
});
