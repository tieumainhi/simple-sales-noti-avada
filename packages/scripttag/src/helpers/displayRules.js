/**
 * @param {Object} setting
 * @returns {boolean}
 */
export function shouldShowOnCurrentPage(setting) {
  if (setting.enabled === false || setting.active === false) return false;

  const currentUrl = window.location.href;
  const excludedRules = parseUrlRules(setting.excludedUrls);
  if (excludedRules.some(rule => matchesUrlRule(currentUrl, rule))) {
    return false;
  }

  if (setting.allowShow !== 'specific') return true;

  const includedRules = parseUrlRules(setting.includedUrls);
  return includedRules.some(rule => matchesUrlRule(currentUrl, rule));
}

function parseUrlRules(value = '') {
  return String(value)
    .split(/\r?\n|,/)
    .map(rule => rule.trim())
    .filter(Boolean);
}

function matchesUrlRule(currentUrl, rule) {
  const normalizedUrl = currentUrl.replace(/\/$/, '');
  const normalizedRule = rule.replace(/\/$/, '');

  if (normalizedRule === '*') return true;
  if (normalizedRule.startsWith('/')) {
    return window.location.pathname.replace(/\/$/, '').includes(normalizedRule);
  }

  return normalizedUrl.includes(normalizedRule);
}
