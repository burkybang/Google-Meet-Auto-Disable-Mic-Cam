Promise.all([
  settingsLoaded,
  windowLoaded,
]).then(async (): Promise<void> => {
  const togglesObj: Record<ToggleStorageName, Toggle> = createToggles();
  const toggles: Toggle[] = Object.values(togglesObj);
  
  let originalPageTitle: string;
  let buttonObserver: MutationObserver;
  
  const observeButtons = () => document.title =
    (togglesObj[ToggleStorageName.MIC].disabled ? `${togglesObj[ToggleStorageName.MIC].emoji} ` : '') +
    (togglesObj[ToggleStorageName.CAM].disabled ? '' : `${togglesObj[ToggleStorageName.CAM].emoji} `) +
    originalPageTitle;
  
  const isValidStorageName = (storageName: string): storageName is ToggleStorageName => storageName in togglesObj;
  
  const syncStorageListener = (changes: { [p: string]: chrome.storage.StorageChange }) =>
    Object.entries(changes).forEach(([storageName, {newValue}]): void => {
      if (isValidStorageName(storageName) && typeof newValue === 'boolean')
        togglesObj[storageName].checked = newValue;
    });
  
  const observeNavigation = (): void => {
    if (!toggles.every(toggle => toggle.buttonEl)) return;
    
    if (!originalPageTitle) {
      originalPageTitle = document.title;
      toggles.forEach(toggle => {
        if (toggle.autoDisable)
          toggle.disable();
      });
      observeButtons();
    }
    
    const isPreMeeting: boolean = toggles.every(toggle => {
      const buttonIsDiv: boolean = toggle.buttonEl.tagName === 'DIV';
      if (buttonIsDiv) {
        toggle.onChange((checkboxEl: HTMLInputElement): void => {
          if (checkboxEl.checked)
            toggle.disable();
        });
        
        toggle.labelStyle = {
          color: 'white',
          position: 'absolute',
          bottom: '0',
          [toggle.direction]: '100px',
          zIndex: '1',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        };
        
        toggle.checkboxStyle = {
          cursor: 'pointer',
          margin: '0 4px 0 0',
          position: 'relative',
          top: '1px',
        };
        
        toggle.buttonEl.parentElement.append(toggle.labelEl);
      }
      
      return buttonIsDiv;
    });
    
    if (isPreMeeting)
      chrome.storage.sync.onChanged.addListener(syncStorageListener);
    else
      chrome.storage.sync.onChanged.removeListener(syncStorageListener);
    
    if (toggles.some(toggle => !toggle.buttonOnDOM)) {
      buttonObserver?.disconnect();
    } else {
      buttonObserver = new MutationObserver(observeButtons);
      toggles.forEach(toggle => buttonObserver.observe(toggle.buttonEl, {attributes: true}));
    }
  };
  
  observeNavigation();
  
  const navigationObserver: MutationObserver = new MutationObserver(observeNavigation);
  navigationObserver.observe(document.body, {childList: true});
});