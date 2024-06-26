declare var browser: typeof chrome;

// For Firefox support
if (typeof browser !== 'undefined')
  // @ts-ignore
  chrome = browser;

const windowLoaded: Promise<void> = new Promise(resolve => window.onload = () => resolve());

const enum ToggleName {
  MIC = 'disableMic',
  CAM = 'disableCam',
}

type Settings = Record<ToggleName, boolean>;

const defaultSettings: Settings = {
  [ToggleName.MIC]: false,
  [ToggleName.CAM]: true,
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
  name: ToggleName;
  index: number;
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
  name: ToggleName;
  index: number;
  direction: ToggleDirection;
  emoji: ToggleEmoji;
  autoDisable: boolean;
  #buttonEl: HTMLDivElement | HTMLButtonElement;
  #labelEl: HTMLLabelElement;
  #checkboxEl: HTMLInputElement;
  #spanEl: HTMLSpanElement;
  #onChange: ToggleOnChangeCallback;
  
  constructor(options: ToggleOptions) {
    Object.assign(this, options, {
      autoDisable: settings[options.name],
    });
  }
  
  get buttonOnDOM(): boolean {
    return this.#buttonEl?.isConnected ?? false;
  }
  
  get buttonEl(): HTMLDivElement | HTMLButtonElement {
    return this.buttonOnDOM ?
      this.#buttonEl :
      this.#buttonEl = document.querySelectorAll<HTMLDivElement | HTMLButtonElement>(`[role="button"][data-is-muted]`)[this.index];
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
        settings[this.name] = checkboxEl.checked;
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
    return this.#buttonEl?.dataset.isMuted === 'true';
  }
  
  disable(): void {
    if (!this.disabled)
      this.#buttonEl?.click();
  }
  
  set checked(checked: boolean) {
    this.checkboxEl.checked = checked;
    if (checked)
      this.disable();
  }
}

const createToggles = () => <Record<ToggleName, Toggle>>Object.fromEntries(([
  {
    label: 'Microphone',
    name: ToggleName.MIC,
    index: 0,
    direction: ToggleDirection.RIGHT,
    emoji: ToggleEmoji.MIC,
  },
  {
    label: 'Camera',
    name: ToggleName.CAM,
    index: 1,
    direction: ToggleDirection.LEFT,
    emoji: ToggleEmoji.CAM,
  },
] satisfies ToggleOptions[]).map(options => [options.name, new Toggle(options)]));