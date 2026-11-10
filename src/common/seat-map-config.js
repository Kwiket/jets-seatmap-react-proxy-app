import { CONFIG_DATA } from './constants';

/**
 * Builds the seat map config from the config sent by the host page. The host config is layered over
 * the app defaults, including the built-in credentials; colorTheme is merged one level deeper so the
 * host can override single colors.
 * @param {object} [hostConfig] - Partial config sent by the host page
 * @returns {object} Complete seat map config
 */
export const buildSeatMapConfig = (hostConfig = {}) => ({
  ...CONFIG_DATA,
  ...hostConfig,
  colorTheme: { ...CONFIG_DATA.colorTheme, ...hostConfig.colorTheme },
});
