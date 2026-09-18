import { apiFetch } from './apiClient';

export const AVAILABLE_LOCATIONS = [
  { id: 'karur', name: 'Karur', district: 'Karur, Tamil Nadu', lat: 10.9601, lon: 78.0766 },
  { id: 'thanjavur', name: 'Thanjavur', district: 'Delta Region, Tamil Nadu', lat: 10.7870, lon: 79.1378 },
  { id: 'coimbatore', name: 'Coimbatore', district: 'Western Ghats, Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  { id: 'madurai', name: 'Madurai', district: 'Southern Region, Tamil Nadu', lat: 9.9252, lon: 78.1198 },
  { id: 'erode', name: 'Erode', district: 'North Western, Tamil Nadu', lat: 11.3410, lon: 77.7172 },
  { id: 'salem', name: 'Salem', district: 'Central Hills, Tamil Nadu', lat: 11.6643, lon: 78.1460 },
  { id: 'trichy', name: 'Trichy', district: 'Cauvery Basin, Tamil Nadu', lat: 10.7905, lon: 78.7047 },
];

const mockWeatherDataMap = {
  karur: {
    current: { location: 'Karur', district: 'Karur, Tamil Nadu', temperature: 32, feelsLike: 36, humidity: 74, windSpeed: 14, rainProbability: 65, uvIndex: 7, uvLevel: 'High', condition: 'Moderate Rain', sunrise: '06:08 AM', sunset: '06:42 PM', pressure: 1008, visibility: 8.5, lastUpdated: 'Just now' },
    alerts: [
      { id: 'alt-1', type: 'heavy_rain', severity: 'warning', title: 'Moderate to Heavy Rainfall Expected', description: 'Monsoon showers anticipated across Karur and Cauvery basin fields over the next 24 hours.', recommendation: 'Rain expected tomorrow. Consider postponing scheduled irrigation for Paddy and Sugarcane fields to prevent waterlogging.', issuedAt: 'Today, 08:30 AM' },
      { id: 'alt-2', type: 'humidity', severity: 'info', title: 'High Relative Humidity (74%)', description: 'Warm and humid soil microclimate may increase risk of fungal leaf spot in crops.', recommendation: 'Inspect Cotton & Maize leaves for mildew signs. Maintain proper drainage channels.', issuedAt: 'Today, 07:00 AM' },
    ],
    irrigationAdvice: 'Rain expected tomorrow (65% chance). Consider postponing irrigation for all open fields.',
    forecast: [
      { id: 'f1', day: 'Today', date: 'Aug 10', condition: 'Moderate Rain', tempMax: 32, tempMin: 24, rainProbability: 65, humidity: 74, windSpeed: 14 },
      { id: 'f2', day: 'Tue', date: 'Aug 11', condition: 'Heavy Rain', tempMax: 29, tempMin: 23, rainProbability: 85, humidity: 88, windSpeed: 18 },
      { id: 'f3', day: 'Wed', date: 'Aug 12', condition: 'Partly Cloudy', tempMax: 33, tempMin: 24, rainProbability: 25, humidity: 62, windSpeed: 12 },
      { id: 'f4', day: 'Thu', date: 'Aug 13', condition: 'Sunny', tempMax: 35, tempMin: 25, rainProbability: 10, humidity: 55, windSpeed: 10 },
      { id: 'f5', day: 'Fri', date: 'Aug 14', condition: 'Sunny', tempMax: 36, tempMin: 26, rainProbability: 5, humidity: 50, windSpeed: 11 },
      { id: 'f6', day: 'Sat', date: 'Aug 15', condition: 'Partly Cloudy', tempMax: 34, tempMin: 25, rainProbability: 30, humidity: 60, windSpeed: 13 },
      { id: 'f7', day: 'Sun', date: 'Aug 16', condition: 'Thunderstorm', tempMax: 31, tempMin: 23, rainProbability: 75, humidity: 82, windSpeed: 20 },
    ],
  },
  thanjavur: {
    current: { location: 'Thanjavur', district: 'Delta Region, Tamil Nadu', temperature: 30, feelsLike: 34, humidity: 82, windSpeed: 16, rainProbability: 80, uvIndex: 5, uvLevel: 'Moderate', condition: 'Heavy Rain', sunrise: '06:04 AM', sunset: '06:38 PM', pressure: 1006, visibility: 6.0, lastUpdated: 'Just now' },
    alerts: [
      { id: 'alt-3', type: 'heavy_rain', severity: 'critical', title: 'Heavy Delta Monsoon Alert', description: 'Heavy precipitation over Thanjavur paddy belts.', recommendation: 'Drain excess water from low-lying paddy nursery beds immediately.', issuedAt: 'Today, 06:00 AM' },
    ],
    irrigationAdvice: 'Heavy rain active. Turn off automatic drip and canal pumps for the next 48 hours.',
    forecast: [
      { id: 'f1', day: 'Today', date: 'Aug 10', condition: 'Heavy Rain', tempMax: 30, tempMin: 24, rainProbability: 80, humidity: 82, windSpeed: 16 },
      { id: 'f2', day: 'Tue', date: 'Aug 11', condition: 'Heavy Rain', tempMax: 28, tempMin: 23, rainProbability: 90, humidity: 90, windSpeed: 22 },
      { id: 'f3', day: 'Wed', date: 'Aug 12', condition: 'Moderate Rain', tempMax: 31, tempMin: 24, rainProbability: 55, humidity: 75, windSpeed: 14 },
      { id: 'f4', day: 'Thu', date: 'Aug 13', condition: 'Partly Cloudy', tempMax: 33, tempMin: 25, rainProbability: 20, humidity: 65, windSpeed: 10 },
      { id: 'f5', day: 'Fri', date: 'Aug 14', condition: 'Sunny', tempMax: 34, tempMin: 25, rainProbability: 10, humidity: 60, windSpeed: 9 },
      { id: 'f6', day: 'Sat', date: 'Aug 15', condition: 'Sunny', tempMax: 35, tempMin: 26, rainProbability: 15, humidity: 58, windSpeed: 11 },
      { id: 'f7', day: 'Sun', date: 'Aug 16', condition: 'Partly Cloudy', tempMax: 33, tempMin: 25, rainProbability: 35, humidity: 68, windSpeed: 13 },
    ],
  },
};

export const weatherService = {
  async getWeatherByLocation(locationId) {
    const key = locationId.toLowerCase();
    const locObj = AVAILABLE_LOCATIONS.find((l) => l.id === key) || AVAILABLE_LOCATIONS[0];

    try {
      const res = await apiFetch(`/weather/current?latitude=${locObj.lat}&longitude=${locObj.lon}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.temperature) {
          const fallback = mockWeatherDataMap[key] || mockWeatherDataMap.karur;
          return {
            ...fallback,
            current: {
              ...fallback.current,
              temperature: Math.round(data.temperature),
              humidity: data.humidity || fallback.current.humidity,
              windSpeed: data.windSpeed || fallback.current.windSpeed,
              location: locObj.name,
              district: locObj.district,
              lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          };
        }
      }
    } catch (err) {
      console.warn('API getWeatherByLocation failed, using fallback:', err);
    }

    if (mockWeatherDataMap[key]) {
      return {
        ...mockWeatherDataMap[key],
        current: {
          ...mockWeatherDataMap[key].current,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      };
    }

    return {
      current: {
        location: locObj.name,
        district: locObj.district,
        temperature: 33,
        feelsLike: 37,
        humidity: 60,
        windSpeed: 12,
        rainProbability: 20,
        uvIndex: 8,
        uvLevel: 'Very High',
        condition: 'Sunny',
        sunrise: '06:06 AM',
        sunset: '06:40 PM',
        pressure: 1010,
        visibility: 10,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      alerts: [
        {
          id: `alt-${key}`,
          type: 'high_temp',
          severity: 'warning',
          title: 'High Temperature Advisory',
          description: `Afternoon temperatures in ${locObj.name} expected to reach 35°C.`,
          recommendation: 'Ensure early morning or late evening irrigation to prevent heat stress.',
          issuedAt: 'Today, 08:00 AM',
        },
      ],
      irrigationAdvice: 'Warm & sunny conditions expected. Early morning irrigation recommended.',
      forecast: [
        { id: 'f1', day: 'Today', date: 'Aug 10', condition: 'Sunny', tempMax: 33, tempMin: 25, rainProbability: 20, humidity: 60, windSpeed: 12 },
        { id: 'f2', day: 'Tue', date: 'Aug 11', condition: 'Partly Cloudy', tempMax: 34, tempMin: 25, rainProbability: 30, humidity: 62, windSpeed: 14 },
        { id: 'f3', day: 'Wed', date: 'Aug 12', condition: 'Sunny', tempMax: 35, tempMin: 26, rainProbability: 10, humidity: 55, windSpeed: 10 },
        { id: 'f4', day: 'Thu', date: 'Aug 13', condition: 'Sunny', tempMax: 36, tempMin: 26, rainProbability: 5, humidity: 52, windSpeed: 11 },
        { id: 'f5', day: 'Fri', date: 'Aug 14', condition: 'Partly Cloudy', tempMax: 34, tempMin: 25, rainProbability: 25, humidity: 65, windSpeed: 13 },
        { id: 'f6', day: 'Sat', date: 'Aug 15', condition: 'Moderate Rain', tempMax: 31, tempMin: 24, rainProbability: 60, humidity: 78, windSpeed: 15 },
        { id: 'f7', day: 'Sun', date: 'Aug 16', condition: 'Cloudy', tempMax: 32, tempMin: 24, rainProbability: 40, humidity: 72, windSpeed: 12 },
      ],
    };
  },
};
