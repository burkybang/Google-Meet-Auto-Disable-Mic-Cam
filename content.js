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

/** @type {Promise<Settings>} */
const settingsLoaded = new Promise(resolve => chrome.storage.sync.get(resolve));

/** @type {Promise<void>} */
const windowLoaded = new Promise(resolve => window.onload = () => resolve());

Promise.all([
  settingsLoaded,
  windowLoaded,
]).then(([/**Settings*/settings = {}]) => {
  Object.assign(settings, defaultSettings);
  
  /**
   * @type {{
   *   label: string,
   *   buttonKey: string,
   *   storageName: string,
   *   direction: 'left'|'right',
   * }[]}
   */
  const buttons = [
    {
      label: 'Microphone',
      storageName: 'disableMic',
      buttonKey: 'd',
      direction: 'right',
    },
    {
      label: 'Camera',
      storageName: 'disableCam',
      buttonKey: 'e',
      direction: 'left',
    },
  ];
  
  buttons.forEach(({label, storageName, buttonKey, direction}) => {
    
    /** @type {HTMLDivElement} */
    const button = document.querySelector(`div[role="button"][aria-label$=" + ${buttonKey})"][data-is-muted]`);
    if (!button) return;
    
    /** @type {boolean} */
    const autoDisable = settings[storageName] === true;
    
    /** @return {void} */
    const disable = () => {
      if (button.dataset.isMuted === 'false')
        button.click();
    };
    
    /** @type {HTMLDivElement} */
    const disableNode = document.createElement('div');
    disableNode.innerHTML = `
      <label style="color:white; position:absolute; bottom:0; ${direction}:100px; z-index:1; cursor:pointer; white-space:nowrap;">
        <input type="checkbox" ${autoDisable ? 'checked' : ''} style="cursor:pointer; margin:0 4px 0 0; position:relative; top:1px;"/>
        <span>Auto Disable ${label}</span>
      </label>
    `;
    
    /** @type {HTMLInputElement} */
    const checkbox = disableNode.querySelector('input');
    checkbox.addEventListener('change', event => {
      if (event.target.checked)
        disable();
      
      settings[storageName] = event.target.checked;
      
      chrome.storage.sync.set(settings);
    });
    button.parentElement.appendChild(disableNode.querySelector('label'));
    
    if (!autoDisable) return;
    
    disable();
  });
  
});