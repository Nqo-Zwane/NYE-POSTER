import { CONFIG } from './config.js';

// Replace all img/ URLs with S3 URLs on page load
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll(
    '[style*="background-image: url(img/"]'
  );

  elements.forEach((element) => {
    const style = element.getAttribute('style');
    const updatedStyle = style.replace(
      /url\(img\//g,
      `url(${CONFIG.S3_BASE_URL}/img/`
    );
    element.setAttribute('style', updatedStyle);
  });
});
