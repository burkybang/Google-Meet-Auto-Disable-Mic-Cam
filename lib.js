const windowLoaded = new Promise(resolve => window.onload = () => resolve());
const defaultSettings = {
    disableMic: false,
    disableCam: true,
};
let settings;
const settingsLoaded = chrome.storage.sync.get()
    .then(storageSettings => settings = ({ ...defaultSettings, ...storageSettings }));
class Toggle {
    label;
    storageName;
    key;
    direction;
    autoDisable;
    buttonEl;
    #labelEl;
    #checkboxEl;
    #spanEl;
    #onChange;
    constructor(options) {
        Object.assign(this, options, {
            autoDisable: settings[options.storageName],
        });
    }
    get labelEl() {
        if (this.#labelEl)
            return this.#labelEl;
        const labelEl = document.createElement('label');
        labelEl.append(this.checkboxEl, this.spanEl);
        return this.#labelEl = labelEl;
    }
    set labelStyle(style) {
        Object.assign(this.labelEl.style, style);
    }
    get checkboxEl() {
        if (this.#checkboxEl)
            return this.#checkboxEl;
        const checkboxEl = document.createElement('input');
        checkboxEl.type = 'checkbox';
        if (this.autoDisable)
            checkboxEl.checked = true;
        checkboxEl.addEventListener('change', () => {
            this.#onChange?.(this.checkboxEl);
            settings[this.storageName] = checkboxEl.checked;
            chrome.storage.sync.set(settings);
        });
        return this.#checkboxEl = checkboxEl;
    }
    set checkboxStyle(style) {
        Object.assign(this.checkboxEl.style, style);
    }
    get spanEl() {
        if (this.#spanEl)
            return this.#spanEl;
        const spanEl = document.createElement('span');
        spanEl.innerText = `Auto Disable ${this.label}`;
        return this.#spanEl = spanEl;
    }
    onChange(callback) {
        this.#onChange = callback;
    }
    disable() {
        if (!this.buttonEl)
            return;
        if (this.buttonEl.dataset.isMuted === 'false')
            this.buttonEl.click();
    }
    set checked(checked) {
        this.checkboxEl.checked = checked;
        if (checked)
            this.disable();
    }
}
const createToggles = () => Object.fromEntries([
    {
        label: 'Microphone',
        storageName: 'disableMic',
        key: 'd',
        direction: "right",
    },
    {
        label: 'Camera',
        storageName: 'disableCam',
        key: 'e',
        direction: "left",
    },
].map(options => [options.storageName, new Toggle(options)]));
