window.onload = () => {
  const disableCameraButton = document.querySelector('div[role="button"][aria-label="Turn off camera (ctrl + e)"]');
  if (disableCameraButton)
    disableCameraButton.click();
};