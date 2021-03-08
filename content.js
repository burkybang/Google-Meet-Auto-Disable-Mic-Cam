/**
 * @typedef Settings
 * @property {boolean} disableMic
 * @property {boolean} disableCam
 */

/** @type {Settings} */
const defaultSettings = {
  disableMic: false,
  disableCam: true,
};

/**
 * @typedef ButtonProps
 * @property {string} label
 * @property {string} key
 * @property {string} storageName
 * @property {'left'|'right'} direction
 * @property {HTMLDivElement} element
 */

/** @type {ButtonProps[]} */
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

/** @type {Promise<Settings>} */
const settingsLoaded = new Promise(resolve => chrome.storage.sync.get(resolve));

/** @type {Promise<void>} */
const windowLoaded = new Promise(resolve => window.onload = () => resolve());

/** @type {Promise<void>} */
const buttonsLoaded = new Promise(async resolve => {
  await windowLoaded;
  
  /** @type {MutationObserver} */
  const observer = new MutationObserver(() => {
    if (!buttons.every(button =>
      button.element = document.body.querySelector(`div[role="button"][aria-label$=" + ${button.key})" i][data-is-muted]`),
    )) return;
    
    observer.disconnect();
    resolve();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});

Promise.all([
  settingsLoaded,
  buttonsLoaded,
]).then(async ([/** Settings */ settings = {}]) => {
  settings = {...defaultSettings, ...settings};
  
  buttons.forEach(({label, storageName, direction, element}) => {
    
    /** @type {boolean} */
    const autoDisable = settings[storageName] === true;
    
    /** @return {void} */
    const disable = () => {
      if (element.dataset.isMuted === 'false')
        element.click();
    };
    
    /** @type {HTMLDivElement} */
    const tempDivEl = document.createElement('div');
    tempDivEl.innerHTML = `
      <label style="color:white; position:absolute; bottom:0; ${direction}:100px; z-index:1; cursor:pointer; white-space:nowrap;">
        <input type="checkbox" ${autoDisable ? 'checked' : ''} style="cursor:pointer; margin:0 4px 0 0; position:relative; top:1px;"/>
        <span>Auto Disable ${label}</span>
      </label>
    `;
    
    /** @type {HTMLInputElement} */
    const checkboxEl = tempDivEl.querySelector('input');
    checkboxEl.addEventListener('change', ({currentTarget}) => {
      if (currentTarget.checked)
        disable();
      
      settings[storageName] = currentTarget.checked;
      
      chrome.storage.sync.set(settings);
    });
    element.parentElement.append(tempDivEl.children[0]);
    
    if (!autoDisable) return;
    
    disable();
  });
  
});