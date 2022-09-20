declare var browser: typeof chrome;

// For Firefox support
if (typeof browser !== 'undefined')
  // @ts-ignore
  chrome = browser;

const windowLoaded: Promise<void> = new Promise(resolve => window.onload = () => resolve());

interface Settings {
  disableMic: boolean;
  disableCam: boolean;
}

const defaultSettings: Settings = {
  disableMic: false,
  disableCam: true,
};

let settings: Settings;

const settingsLoaded: Promise<Settings> = (chrome.storage.sync.get() as Promise<Settings>)
  .then(storageSettings => settings = ({...defaultSettings, ...storageSettings}));

const enum ToggleDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

interface ToggleOptions {
  label: string;
  storageName: string;
  key: string;
  direction: ToggleDirection;
}

type ToggleOnChangeCallback = (callback: HTMLInputElement) => void

class Toggle {
  label: string;
  storageName: string;
  key: string;
  direction: ToggleDirection;
  autoDisable: boolean;
  buttonEl: HTMLDivElement;
  #labelEl: HTMLLabelElement;
  #checkboxEl: HTMLInputElement;
  #spanEl: HTMLSpanElement;
  #onChange: ToggleOnChangeCallback;
  
  constructor(options: ToggleOptions) {
    Object.assign(this, options, {
      autoDisable: settings[options.storageName],
    });
  }
  
  get labelEl(): HTMLLabelElement {
    if (this.#labelEl)
      return this.#labelEl;
    
    const labelEl: HTMLLabelElement = document.createElement('label');
    labelEl.append(this.checkboxEl, this.spanEl);
    return this.#labelEl = labelEl;
  }
  
  set labelStyle(style: Record<string, string>) {
    Object.assign(this.labelEl.style, style);
  }
  
  get checkboxEl(): HTMLInputElement {
    if (this.#checkboxEl)
      return this.#checkboxEl;
    
    const checkboxEl: HTMLInputElement = document.createElement('input');
    checkboxEl.type = 'checkbox';
    if (this.autoDisable)
      checkboxEl.checked = true;
    
    checkboxEl.addEventListener('change', (): void => {
      this.#onChange?.(this.checkboxEl);
      settings[this.storageName] = checkboxEl.checked;
      chrome.storage.sync.set(settings);
    });
    
    return this.#checkboxEl = checkboxEl;
  }
  
  set checkboxStyle(style: Record<string, string>) {
    Object.assign(this.checkboxEl.style, style);
  }
  
  get spanEl(): HTMLSpanElement {
    if (this.#spanEl)
      return this.#spanEl;
    
    const spanEl: HTMLSpanElement = document.createElement('span');
    spanEl.innerText = `Auto Disable ${this.label}`;
    return this.#spanEl = spanEl;
  }
  
  onChange(callback: ToggleOnChangeCallback): void {
    this.#onChange = callback;
  }
  
  disable(): void {
    if (!this.buttonEl) return;
    if (this.buttonEl.dataset.isMuted === 'false')
      this.buttonEl.click();
  }
  
  set checked(checked: boolean) {
    this.checkboxEl.checked = checked;
    if (checked)
      this.disable();
  }
}

const createToggles = () => Object.fromEntries(([
  {
    label: 'Microphone',
    storageName: 'disableMic',
    key: 'd',
    direction: ToggleDirection.RIGHT,
  },
  {
    label: 'Camera',
    storageName: 'disableCam',
    key: 'e',
    direction: ToggleDirection.LEFT,
  },
] as ToggleOptions[]).map(options => [options.storageName, new Toggle(options)]));