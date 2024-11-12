/**
 * Creates global configuration for the TrainingPeaks Virtual map overlay
 * @module config
 */
(() => {
  /**
   * Configuration for the TrainingPeaks Virtual map overlay
   * @type {Object}
   * @property {string} url - URL of the overlay image
   * @property {number} north - Northern boundary latitude
   * @property {number} south - Southern boundary latitude
   * @property {number} east - Eastern boundary longitude
   * @property {number} west - Western boundary longitude
   */
  globalThis.tpVirtualMap = {
    url: document.currentScript.dataset.overlayUrl,
    north: -1.374593,
    south: -1.482999,
    east: 149.686722,
    west: 149.578094,
  };
})();
