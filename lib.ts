declare var browser: typeof chrome;

// For Firefox support
if (typeof browser !== 'undefined')
  // @ts-ignore
  chrome = browser;

const windowLoaded: Promise<void> = new Promise(resolve => window.onload = () => resolve());

const enum ToggleStorageName {
  MIC = 'disableMic',
  CAM = 'disableCam',
}

type Settings = Record<ToggleStorageName, boolean>;

const defaultSettings: Settings = {
  [ToggleStorageName.MIC]: false,
  [ToggleStorageName.CAM]: true,
};

let settings: Settings;

const settingsLoaded: Promise<Settings> = (chrome.storage.sync.get() as Promise<Settings>)
  .then(storageSettings => settings = ({...defaultSettings, ...storageSettings}));

const enum ToggleDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

const enum ToggleEmoji {
  MIC = '🔇',
  CAM = '📷',
}

type ToggleOptions = {
  label: string;
  storageName: ToggleStorageName;
  key: string;
  direction: ToggleDirection;
  emoji: ToggleEmoji;
};

type ToggleOnChangeCallback = (callback: HTMLInputElement) => void;

type ExcludeMatchingProperties<TObject, TValue> = Pick<TObject, {
  [K in keyof TObject]-?: TObject[K] extends TValue ? never : K;
}[keyof TObject]>;

type ExcludeMethods<TObject> = ExcludeMatchingProperties<TObject, Function>;

type CreateElementOptions<El extends HTMLElement> = Partial<ExcludeMethods<El>>;

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
  
  createElement<
    TagName extends keyof HTMLElementTagNameMap,
    El extends HTMLElementTagNameMap[TagName] = HTMLElementTagNameMap[TagName],
  >(
    tagName: TagName,
    options: CreateElementOptions<El> = {},
  ) {
    return Object.assign(document.createElement(tagName), options);
  }
  
  get labelEl(): HTMLLabelElement {
    return this.#labelEl ??= (() => {
      const labelEl: HTMLLabelElement = this.createElement('label');
      labelEl.append(this.checkboxEl, this.spanEl);
      return labelEl;
    })();
  }
  
  set labelStyle(style: Partial<CSSStyleDeclaration>) {
    Object.assign(this.labelEl.style, style);
  }
  
  get checkboxEl(): HTMLInputElement {
    return this.#checkboxEl ??= (() => {
      const checkboxEl: HTMLInputElement = this.createElement('input', {
        type: 'checkbox',
        checked: this.autoDisable,
      });
      
      checkboxEl.addEventListener('change', (): void => {
        this.#onChange?.(this.checkboxEl);
        settings[this.storageName] = checkboxEl.checked;
        chrome.storage.sync.set(settings);
      });
      
      return checkboxEl;
    })();
  }
  
  set checkboxStyle(style: Partial<CSSStyleDeclaration>) {
    Object.assign(this.checkboxEl.style, style);
  }
  
  get spanEl(): HTMLSpanElement {
    return this.#spanEl ??= this.createElement('span', {
      textContent: `Auto Disable ${this.label}`,
    });
  }
  
  onChange(callback: ToggleOnChangeCallback): void {
    this.#onChange = callback;
  }
  
  get disabled(): boolean {
    return this.buttonEl?.dataset.isMuted === 'true';
  }
  
  disable(): void {
    if (!this.disabled)
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