if (/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(location.href))
  window.onload = () => {
    const disableCameraButton = document.querySelector('div[role="button"][aria-label="Turn off camera (ctrl + e)"]');
    if (disableCameraButton)
      disableCameraButton.click();
  };