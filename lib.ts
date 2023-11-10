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

const enum ToggleStorageName {
  MIC = 'disableMic',
  CAM = 'disableCam',
}

const enum ToggleEmoji {
  MIC = '🔇',
  CAM = '📷',
}

interface ToggleOptions {
  label: string;
  storageName: ToggleStorageName;
  key: string;
  direction: ToggleDirection;
  emoji: ToggleEmoji;
}

type ToggleOnChangeCallback = (callback: HTMLInputElement) => void

class Toggle {
  label: string;
  storageName: ToggleStorageName;
  key: string;
  direction: ToggleDirection;
  emoji: ToggleEmoji;
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
  
  set labelStyle(style: Partial<CSSStyleDeclaration>) {
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
  
  set checkboxStyle(style: Partial<CSSStyleDeclaration>) {
    Object.assign(this.checkboxEl.style, style);
  }
  
  get spanEl(): HTMLSpanElement {
    if (this.#spanEl)
      return this.#spanEl;
    
    const spanEl: HTMLSpanElement = document.createElement('span');
    spanEl.innerText = `Auto Disable ${this.label}`;
    return this.#spanEl = spanEl;
  }
  
  get buttonEnabled(): boolean {
    return this.buttonEl.dataset.isMuted === 'true';
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

const createToggles = () => <Record<ToggleStorageName, Toggle>>Object.fromEntries(([
  {
    label: 'Microphone',
    storageName: ToggleStorageName.MIC,
    key: 'd',
    direction: ToggleDirection.RIGHT,
    emoji: ToggleEmoji.MIC,
  },
  {
    label: 'Camera',
    storageName: ToggleStorageName.CAM,
    key: 'e',
    direction: ToggleDirection.LEFT,
    emoji: ToggleEmoji.CAM,
  },
] as ToggleOptions[]).map(options => [options.storageName, new Toggle(options)]));