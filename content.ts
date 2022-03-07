interface Settings {
  disableMic: boolean;
  disableCam: boolean;
}

const defaultSettings: Settings = {
  disableMic: false,
  disableCam: true,
};

interface ButtonProps {
  label: string;
  key: string;
  storageName: string;
  direction: 'left' | 'right';
  element: HTMLDivElement;
}

const buttons: ButtonProps[] = [
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

const settingsLoaded: Promise<Settings> = new Promise(resolve => chrome.storage.sync.get(resolve));

const windowLoaded: Promise<void> = new Promise(resolve => window.onload = () => resolve());

const buttonsLoaded: Promise<void> = new Promise(async resolve => {
  await windowLoaded;
  
  const observer: MutationObserver = new MutationObserver((): void => {
    if (!buttons.every(button =>
      button.element = document.body.querySelector(`div[role="button"][aria-label$=" + ${button.key})" i][data-is-muted]`),
    )) return;
    
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
]).then(async ([settings = {}]): Promise<void> => {
  settings = {...defaultSettings, ...settings};
  
  buttons.forEach(({label, storageName, direction, element}): void => {
    const autoDisable: boolean = settings[storageName] === true;
    
    const disable = (): void => {
      if (element.dataset.isMuted === 'false')
        element.click();
    };
    
    const tempDivEl: HTMLDivElement = document.createElement('div');
    tempDivEl.innerHTML = `
      <label style="color:white; position:absolute; bottom:0; ${direction}:100px; z-index:1; cursor:pointer; white-space:nowrap;">
        <input type="checkbox" ${autoDisable ? 'checked' : ''} style="cursor:pointer; margin:0 4px 0 0; position:relative; top:1px;"/>
        <span>Auto Disable ${label}</span>
      </label>
    `;
    
    const checkboxEl: HTMLInputElement = tempDivEl.querySelector('input');
    checkboxEl.addEventListener('change', (): void => {
      if (checkboxEl.checked)
        disable();
      
      settings[storageName] = checkboxEl.checked;
      
      chrome.storage.sync.set(settings);
    });
    element.parentElement.append(tempDivEl.children[0]);
    
    if (!autoDisable) return;
    
    disable();
  });
  
});