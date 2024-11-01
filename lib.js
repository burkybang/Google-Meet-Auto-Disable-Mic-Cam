if (typeof browser !== 'undefined')
    chrome = browser;
const windowLoaded = new Promise(resolve => window.onload = () => resolve());
const defaultSettings = {
    ["disableMic"]: false,
    ["disableCam"]: true,
};
let settings;
const settingsLoaded = chrome.storage.sync.get()
    .then(storageSettings => settings = ({ ...defaultSettings, ...storageSettings }));
class Toggle {
    label;
    name;
    index;
    direction;
    emoji;
    autoDisable;
    #buttonEl;
    #labelEl;
    #checkboxEl;
    #spanEl;
    #onChange;
    constructor(options) {
        Object.assign(this, options, {
            autoDisable: settings[options.name],
        });
    }
    get buttonOnDOM() {
        return this.#buttonEl?.isConnected ?? false;
    }
    get buttonEl() {
        return this.buttonOnDOM ?
            this.#buttonEl :
            this.#buttonEl = document.querySelectorAll(`[role="button"][data-is-muted]`)[this.index];
    }
    createElement(tagName, options = {}) {
        return Object.assign(document.createElement(tagName), options);
    }
    get labelEl() {
        return this.#labelEl ??= (() => {
            const labelEl = this.createElement('label');
            labelEl.append(this.checkboxEl, this.spanEl);
            return labelEl;
        })();
    }
    set labelStyle(style) {
        Object.assign(this.labelEl.style, style);
    }
    get checkboxEl() {
        return this.#checkboxEl ??= (() => {
            const checkboxEl = this.createElement('input', {
                type: 'checkbox',
                checked: this.autoDisable,
            });
            checkboxEl.addEventListener('change', () => {
                this.#onChange?.(this.checkboxEl);
                settings[this.name] = checkboxEl.checked;
                chrome.storage.sync.set(settings);
            });
            return checkboxEl;
        })();
    }
    set checkboxStyle(style) {
        Object.assign(this.checkboxEl.style, style);
    }
    get spanEl() {
        return this.#spanEl ??= this.createElement('span', {
            textContent: `Auto Disable ${this.label}`,
        });
    }
    onChange(callback) {
        this.#onChange = callback;
    }
    get disabled() {
        return this.#buttonEl?.dataset.isMuted === 'true';
    }
    disable() {
        if (!this.disabled)
            this.#buttonEl?.click();
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
        name: "disableMic",
        index: 0,
        direction: "right",
        emoji: "\uD83D\uDD07",
    },
    {
        label: 'Camera',
        name: "disableCam",
        index: 1,
        direction: "left",
        emoji: "\uD83D\uDCF7",
    },
].map(options => [options.name, new Toggle(options)]));
