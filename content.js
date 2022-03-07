const defaultSettings = {
    disableMic: false,
    disableCam: true,
};
const buttons = [
    {
        label: 'Microphone',
        storageName: 'disableMic',
        key: 'd',
        direction: 'right',
        element: null,
    },
    {
        label: 'Camera',
        storageName: 'disableCam',
        key: 'e',
        direction: 'left',
        element: null,
    },
];
const settingsLoaded = new Promise(resolve => chrome.storage.sync.get(resolve));
const windowLoaded = new Promise(resolve => window.onload = () => resolve());
const buttonsLoaded = new Promise(async (resolve) => {
    await windowLoaded;
    const observer = new MutationObserver(() => {
        if (!buttons.every(button => button.element = document.body.querySelector(`div[role="button"][aria-label$=" + ${button.key})" i][data-is-muted]`)))
            return;
        observer.disconnect();
        resolve();
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
});
Promise.all([
    settingsLoaded,
    buttonsLoaded,
]).then(async ([settings = {}]) => {
    settings = { ...defaultSettings, ...settings };
    buttons.forEach(({ label, storageName, direction, element }) => {
        const autoDisable = settings[storageName] === true;
        const disable = () => {
            if (element.dataset.isMuted === 'false')
                element.click();
        };
        const tempDivEl = document.createElement('div');
        tempDivEl.innerHTML = `
      <label style="color:white; position:absolute; bottom:0; ${direction}:100px; z-index:1; cursor:pointer; white-space:nowrap;">
        <input type="checkbox" ${autoDisable ? 'checked' : ''} style="cursor:pointer; margin:0 4px 0 0; position:relative; top:1px;"/>
        <span>Auto Disable ${label}</span>
      </label>
    `;
        const checkboxEl = tempDivEl.querySelector('input');
        checkboxEl.addEventListener('change', () => {
            if (checkboxEl.checked)
                disable();
            settings[storageName] = checkboxEl.checked;
            chrome.storage.sync.set(settings);
        });
        element.parentElement.append(tempDivEl.children[0]);
        if (!autoDisable)
            return;
        disable();
    });
});
