window.onload = () => {
  const disableCameraButton = document.querySelector('div[role="button"][aria-label^="Turn off camera ("]');
  if (disableCameraButton)
    disableCameraButton.click();
};