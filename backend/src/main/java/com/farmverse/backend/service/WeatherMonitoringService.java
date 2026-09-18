package com.farmverse.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.farmverse.backend.model.Farm;
import com.farmverse.backend.model.User;
import com.farmverse.backend.model.WeatherObservation;
import com.farmverse.backend.repository.FarmRepository;
import com.farmverse.backend.repository.WeatherObservationRepository;
import com.farmverse.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class WeatherMonitoringService {

    private final FarmRepository farmRepository;
    private final WeatherObservationRepository observationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public WeatherMonitoringService(
            FarmRepository farmRepository,
            WeatherObservationRepository observationRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper) {
        this.farmRepository = farmRepository;
        this.observationRepository = observationRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    public Farm ownedFarm(Long farmId) {
        return farmRepository.findById(farmId)
                .filter(f -> f.getOwner().getId().equals(currentUser().getId()))
                .orElseThrow(() -> new IllegalArgumentException("Farm not found or access denied"));
    }

    public Map<String, Object> getCurrentWeather(double latitude, double longitude) {
        try {
            String url = "https://api.open-meteo.com/v1/forecast"
                    + "?latitude=" + latitude
                    + "&longitude=" + longitude
                    + "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
                    + "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code"
                    + "&forecast_days=7"
                    + "&timezone=auto";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new IllegalStateException("Weather provider returned HTTP " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode current = root.path("current");

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("latitude", latitude);
            result.put("longitude", longitude);
            result.put("temperatureC", current.path("temperature_2m").asDouble());
            result.put("humidityPercent", current.path("relative_humidity_2m").asDouble());
            result.put("rainfallMm", current.path("precipitation").asDouble());
            result.put("windSpeedKmh", current.path("wind_speed_10m").asDouble());
            result.put("weatherCode", current.path("weather_code").asInt());
            result.put("weatherDescription", weatherDescription(current.path("weather_code").asInt()));
            result.put("observedAt", LocalDateTime.now().toString());
            result.put("forecast", buildForecast(root.path("daily")));
            return result;
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to fetch live weather: " + ex.getMessage(), ex);
        }
    }

    public Map<String, Object> getFarmCurrentWeather(Long farmId) {
        Farm farm = ownedFarm(farmId);
        double[] coordinates = parseCoordinates(farm.getLocation());
        Map<String, Object> weather = getCurrentWeather(coordinates[0], coordinates[1]);
        weather.put("farmId", farm.getId());
        weather.put("farmName", farm.getName());
        return weather;
    }

    public WeatherObservation saveObservation(Long farmId, WeatherObservation observation) {
        Farm farm = ownedFarm(farmId);

        observation.setId(null);
        observation.setFarm(farm);
        if (observation.getObservedAt() == null) {
            observation.setObservedAt(LocalDateTime.now());
        }
        return observationRepository.save(observation);
    }

    public List<WeatherObservation> history(Long farmId) {
        ownedFarm(farmId);
        return observationRepository.findTop30ByFarmIdOrderByObservedAtDesc(farmId);
    }

    private double[] parseCoordinates(String location) {
        if (location == null || location.isBlank()) {
            throw new IllegalArgumentException(
                    "Farm location must contain coordinates in 'latitude, longitude' format");
        }

        String cleaned = location.trim()
                .replace("N", "")
                .replace("S", "-")
                .replace("E", "")
                .replace("W", "-");

        String[] parts = cleaned.split(",");
        if (parts.length != 2) {
            throw new IllegalArgumentException(
                    "Farm location must be in 'latitude, longitude' format");
        }

        return new double[] {
                Double.parseDouble(parts[0].trim()),
                Double.parseDouble(parts[1].trim())
        };
    }

    private List<Map<String, Object>> buildForecast(JsonNode daily) {
        List<Map<String, Object>> forecast = new ArrayList<>();
        JsonNode dates = daily.path("time");
        JsonNode max = daily.path("temperature_2m_max");
        JsonNode min = daily.path("temperature_2m_min");
        JsonNode rain = daily.path("precipitation_sum");
        JsonNode code = daily.path("weather_code");

        for (int i = 0; i < dates.size(); i++) {
            Map<String, Object> day = new LinkedHashMap<>();
            day.put("date", dates.get(i).asText());
            day.put("maxTemperatureC", max.get(i).asDouble());
            day.put("minTemperatureC", min.get(i).asDouble());
            day.put("rainfallMm", rain.get(i).asDouble());
            day.put("weatherCode", code.get(i).asInt());
            day.put("weatherDescription", weatherDescription(code.get(i).asInt()));
            forecast.add(day);
        }
        return forecast;
    }

    private String weatherDescription(int code) {
        return switch (code) {
            case 0 -> "Clear sky";
            case 1, 2, 3 -> "Partly cloudy";
            case 45, 48 -> "Fog";
            case 51, 53, 55, 56, 57 -> "Drizzle";
            case 61, 63, 65, 66, 67 -> "Rain";
            case 71, 73, 75, 77 -> "Snow";
            case 80, 81, 82 -> "Rain showers";
            case 85, 86 -> "Snow showers";
            case 95, 96, 99 -> "Thunderstorm";
            default -> "Unknown";
        };
    }
}
