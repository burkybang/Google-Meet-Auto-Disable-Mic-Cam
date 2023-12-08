Promise.all([
  settingsLoaded,
  windowLoaded,
]).then(async (): Promise<void> => {
  const togglesObj: Record<ToggleName, Toggle> = createToggles();
  const toggles: Toggle[] = Object.values(togglesObj);
  
  let originalPageTitle: string;
  let buttonObserver: MutationObserver;
  let titleChangeTimerUp: boolean = false;
  
  const observeButtons = (): void => {
    if (!originalPageTitle) return;
    
    const titleElements: (ToggleEmoji | string)[] = [originalPageTitle];
    
    const camToggle: Toggle = togglesObj[ToggleName.CAM];
    if (!camToggle.disabled)
      titleElements.unshift(camToggle.emoji);
    
    const micToggle: Toggle = togglesObj[ToggleName.MIC];
    if (micToggle.disabled)
      titleElements.unshift(micToggle.emoji);
    
    document.title = titleElements.join(' ');
  };
  
  const isValidStorageName = (name: string): name is ToggleName => name in togglesObj;
  
  const syncStorageListener = (changes: { [p: string]: chrome.storage.StorageChange }) =>
    Object.entries(changes).forEach(([name, {newValue}]): void => {
      if (isValidStorageName(name) && typeof newValue === 'boolean')
        togglesObj[name].checked = newValue;
    });
  
  const observeNavigation = (): void => {
    if (!toggles.every(toggle => toggle.buttonEl)) return;
    
    if (!originalPageTitle && document.title && (document.title !== 'Meet' || titleChangeTimerUp)) {
      originalPageTitle = document.title;
      setTimeout(() => toggles.forEach(toggle => toggle.autoDisable && toggle.disable()), 500);
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
  
  const navigationObserver: MutationObserver = new MutationObserver(observeNavigation);
  navigationObserver.observe(document.body, {childList: true});
  
  observeNavigation();
  
  setTimeout(() => titleChangeTimerUp = true, 500);
});