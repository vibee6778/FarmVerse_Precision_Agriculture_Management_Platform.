package com.farmverse.backend;

import com.farmverse.backend.model.*;
import com.farmverse.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmRepository farmRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Database already seeded
        }

        System.out.println("====== SEEDING FARMVERSE DEMO DATA ======");

        // 1. Seed Users
        User bob = User.builder()
                .name("Farmer Bob")
                .email("bob@farmverse.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_FARMER)
                .build();

        User alice = User.builder()
                .name("Dr. Alice Agronomist")
                .email("alice@farmverse.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ROLE_AGRONOMIST)
                .build();

        userRepository.saveAll(Arrays.asList(bob, alice));

        // 2. Seed a Farm for Bob
        Farm farm = Farm.builder()
                .name("Emerald Acres")
                .location("34.0522 N, 118.2437 W")
                .sizeAcres(45.5)
                .soilType("Loamy Clay")
                .owner(bob)
                .build();

        farmRepository.save(farm);

        // 3. Seed IoT Devices for Bob's Farm
        Device soilNode = Device.builder()
                .name("Soil Node Alpha")
                .macAddress("AA:BB:CC:DD:EE:01")
                .type(DeviceType.SOIL_NODE)
                .farm(farm)
                .active(true)
                .build();

        Device valve = Device.builder()
                .name("Irrigation Valve Solenoid")
                .macAddress("AA:BB:CC:DD:EE:02")
                .type(DeviceType.VALVE)
                .farm(farm)
                .active(true)
                .build();

        deviceRepository.saveAll(Arrays.asList(soilNode, valve));

        // 4. Seed Telemetry (Time-series data for the last 24 hours)
        LocalDateTime now = LocalDateTime.now();

        // 24 hours ago
        SensorData d1 = SensorData.builder().device(soilNode).moisture(48.2).nitrogen(42.0).phosphorus(31.0).potassium(52.0).temperature(22.5).humidity(58.0).timestamp(now.minusHours(24)).build();
        // 21 hours ago
        SensorData d2 = SensorData.builder().device(soilNode).moisture(45.1).nitrogen(41.0).phosphorus(30.5).potassium(51.5).temperature(24.0).humidity(55.0).timestamp(now.minusHours(21)).build();
        // 18 hours ago
        SensorData d3 = SensorData.builder().device(soilNode).moisture(41.8).nitrogen(40.0).phosphorus(30.0).potassium(50.0).temperature(27.8).humidity(50.0).timestamp(now.minusHours(18)).build();
        // 15 hours ago
        SensorData d4 = SensorData.builder().device(soilNode).moisture(37.5).nitrogen(39.0).phosphorus(28.0).potassium(48.0).temperature(32.4).humidity(44.0).timestamp(now.minusHours(15)).build();
        // 12 hours ago (High temperature spike - triggers temperature warning alert)
        SensorData d5 = SensorData.builder().device(soilNode).moisture(33.0).nitrogen(38.0).phosphorus(27.5).potassium(47.0).temperature(41.5).humidity(38.0).timestamp(now.minusHours(12)).build();
        // 9 hours ago
        SensorData d6 = SensorData.builder().device(soilNode).moisture(31.2).nitrogen(28.0).phosphorus(27.0).potassium(46.0).temperature(36.1).humidity(40.0).timestamp(now.minusHours(9)).build();
        // 6 hours ago (Low moisture - triggers critical moisture alert)
        SensorData d7 = SensorData.builder().device(soilNode).moisture(28.5).nitrogen(27.5).phosphorus(18.0).potassium(38.5).temperature(30.4).humidity(42.0).timestamp(now.minusHours(6)).build();
        // 3 hours ago
        SensorData d8 = SensorData.builder().device(soilNode).moisture(27.2).nitrogen(27.0).phosphorus(17.5).potassium(38.0).temperature(29.0).humidity(45.0).timestamp(now.minusHours(3)).build();

        sensorDataRepository.saveAll(Arrays.asList(d1, d2, d3, d4, d5, d6, d7, d8));

        // 5. Seed Alerts triggered by historical anomalies
        Alert tempAlert = Alert.builder()
                .farm(farm)
                .message("Warning: Extreme soil temperature detected on Farm 'Emerald Acres': 41.5°C. Risk of rapid water evaporation and heat distress to crop roots.")
                .severity(AlertSeverity.WARNING)
                .resolved(false)
                .timestamp(now.minusHours(12))
                .build();

        Alert moistureAlert = Alert.builder()
                .farm(farm)
                .message("Critical Moisture Drop: Moisture levels on Farm 'Emerald Acres' have fallen to 28.5% (Threshold: 30%). Triggering solenoid irrigation valve activation.")
                .severity(AlertSeverity.CRITICAL)
                .resolved(false)
                .timestamp(now.minusHours(6))
                .build();

        alertRepository.saveAll(Arrays.asList(tempAlert, moistureAlert));

        System.out.println("====== FARMVERSE SEEDING COMPLETE ======");
        System.out.println("Demo Farmers: bob@farmverse.com / password123");
        System.out.println("Demo Agronomists: alice@farmverse.com / password123");
    }
}
