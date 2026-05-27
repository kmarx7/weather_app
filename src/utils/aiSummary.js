// Rule-based natural language summary generator
// Replace generateSummary() with an OpenAI API call when ready
export function generateSummary(cityName, weather, forecast, tasks, forecastTasks, profile) {
  if (!weather) return null;

  const temp = Math.round(weather.main?.temp ?? 0);
  const feelsLike = Math.round(weather.main?.feels_like ?? 0);
  const humidity = weather.main?.humidity ?? 0;
  const windSpeed = weather.wind?.speed ?? 0;
  const condition = weather.weather?.[0]?.main ?? '';
  const conditionKo = translateCondition(condition);

  const parts = [];

  // City + current temp
  parts.push(`${cityName}의 현재 기온은 ${temp}°C이며 체감온도는 ${feelsLike}°C입니다.`);

  // Weather condition
  if (condition) parts.push(`날씨 상태는 ${conditionKo}입니다.`);

  // Humidity
  if (humidity >= 80) parts.push(`습도가 ${humidity}%로 매우 높으니 제습기 사용을 권장합니다.`);
  else if (humidity >= 60) parts.push(`습도는 ${humidity}%로 다소 높습니다.`);

  // Wind
  if (windSpeed > 10) parts.push(`풍속이 ${windSpeed}m/s로 강하니 창문을 점검하세요.`);

  // Heat / cold advice
  if (temp >= 33) parts.push('폭염이 예상되니 야외 활동을 자제하고 수분을 자주 섭취하세요.');
  else if (temp >= 28) parts.push('더운 날씨이므로 물을 충분히 마시는 것이 좋습니다.');
  else if (temp <= 0) parts.push('기온이 0°C 이하이므로 수도 동파에 주의하세요.');
  else if (feelsLike <= 5) parts.push('체감온도가 낮으므로 외출 시 두꺼운 외투를 입으세요.');

  // Profile-based advice
  if (profile?.coldSensitivity === 'high' && temp <= 15) {
    parts.push('추위에 민감하신 분은 따뜻하게 입고 나가시길 권장합니다.');
  }
  if (profile?.heatSensitivity === 'high' && temp >= 26) {
    parts.push('더위에 민감하신 분은 시원한 실내 활동을 권장합니다.');
  }

  // Forecast summary
  if (forecastTasks && forecastTasks.length > 0) {
    parts.push(`앞으로 48시간 이내 ${forecastTasks.length}가지 주의사항이 예보에 포함되어 있습니다.`);
  }

  return parts.join(' ');
}

function translateCondition(condition) {
  const map = {
    Clear: '맑음', Clouds: '흐림', Rain: '비', Drizzle: '이슬비',
    Thunderstorm: '천둥번개', Snow: '눈', Mist: '안개', Fog: '짙은 안개',
    Haze: '황사/연무', Dust: '먼지', Sand: '모래바람', Smoke: '연기',
    Tornado: '토네이도', Squall: '돌풍',
  };
  return map[condition] ?? condition;
}
