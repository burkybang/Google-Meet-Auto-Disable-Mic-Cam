Promise.all([
  settingsLoaded,
  windowLoaded,
]).then(async (): Promise<void> => {
  const togglesObj: Record<string, Toggle> = createToggles();
  const toggles: Toggle[] = Object.values(togglesObj);
  
  await new Promise<void>(resolve => {
    const observer: MutationObserver = new MutationObserver((): void => {
      if (!toggles.every(toggle =>
        toggle.buttonEl = document.querySelector(`[role="button"][aria-label$=" + ${toggle.key})" i][data-is-muted]`),
      )) return;
      
      observer.disconnect();
      resolve();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
  
  const preMeetingToggles: Toggle[] = toggles.filter((toggle: Toggle): boolean => {
    const isPreMeeting: boolean = toggle.buttonEl.tagName === 'DIV';
    if (isPreMeeting) {
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
    
    if (toggle.autoDisable)
      toggle.disable();
    
    return isPreMeeting;
  });
  
  if (preMeetingToggles.length)
    chrome.storage.sync.onChanged.addListener(
      changes => Object.entries(changes)
        .forEach(([storageName, {newValue}]) => togglesObj[storageName].checked = newValue),
    );
});