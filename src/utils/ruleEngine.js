export function evaluateRule(rule, weatherData, profile) {
  if (!rule.enabled || !weatherData) return false;

  const { type, operator, value } = rule;
  let actual = null;

  if (type === 'weather') {
    const main = weatherData.weather?.[0]?.main?.toLowerCase() ?? '';
    const desc = weatherData.weather?.[0]?.description?.toLowerCase() ?? '';
    actual = `${main} ${desc}`;
  } else if (type === 'temp') {
    actual = weatherData.main?.temp ?? null;
  } else if (type === 'feels_like') {
    actual = weatherData.main?.feels_like ?? null;
  } else if (type === 'humidity') {
    actual = weatherData.main?.humidity ?? null;
  } else if (type === 'wind') {
    actual = weatherData.wind?.speed ?? null;
  }

  if (actual === null) return false;

  let threshold = Number(value);

  // Apply profile sensitivity adjustments
  if (profile) {
    if (type === 'temp' || type === 'feels_like') {
      if (operator === 'below' && profile.coldSensitivity === 'high') threshold += 5;
      if (operator === 'below' && profile.coldSensitivity === 'low') threshold -= 5;
      if (operator === 'above' && profile.heatSensitivity === 'high') threshold -= 2;
      if (operator === 'above' && profile.heatSensitivity === 'low') threshold += 2;
    }
  }

  switch (operator) {
    case 'includes': return typeof actual === 'string' && actual.includes(String(value).toLowerCase());
    case 'above': return actual > threshold;
    case 'below': return actual < threshold;
    case 'equals': return actual === threshold;
    default: return false;
  }
}

export function evaluateForecastRule(rule, forecastList, hoursAhead = 48) {
  if (!rule.enabled || !forecastList) return null;
  const { type, operator, value } = rule;
  const cutoff = Date.now() + hoursAhead * 3600 * 1000;

  for (const item of forecastList) {
    const dt = item.dt * 1000;
    if (dt > cutoff) continue;

    let actual = null;
    if (type === 'forecast_weather') {
      const main = item.weather?.[0]?.main?.toLowerCase() ?? '';
      const desc = item.weather?.[0]?.description?.toLowerCase() ?? '';
      actual = `${main} ${desc}`;
    } else if (type === 'forecast_temp') {
      actual = item.main?.temp ?? null;
    }

    if (actual === null) continue;
    const threshold = Number(value);

    let match = false;
    switch (operator) {
      case 'includes': match = typeof actual === 'string' && actual.includes(String(value).toLowerCase()); break;
      case 'above': match = actual > threshold; break;
      case 'below': match = actual < threshold; break;
      case 'equals': match = actual === threshold; break;
    }

    if (match) {
      const date = new Date(dt);
      const timeStr = date.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      return { matched: true, time: timeStr };
    }
  }
  return null;
}
