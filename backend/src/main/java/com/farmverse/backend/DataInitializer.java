package com.farmverse.backend;

import com.farmverse.backend.model.*;
import com.farmverse.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

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
    private CropRepository cropRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private IrrigationScheduleRepository irrigationRepository;

    @Autowired
    private FertilizerRepository fertilizerRepository;

    @Autowired
    private PestRecordRepository pestRepository;

    @Autowired
    private DiseaseRecordRepository diseaseRepository;

    @Autowired
    private YieldPredictionRepository yieldRepository;

    @Autowired
    private MarketPriceRepository marketRepository;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("====== VERIFYING FARMVERSE DATABASE SEEDING FOR ALL TABLES ======");

        // 1. Seed / Ensure Users
        try {
            User admin = userRepository.findByEmail("admin@farmverse.com").orElseGet(() ->
                userRepository.save(User.builder().name("System Administrator").email("admin@farmverse.com").password(passwordEncoder.encode("password123")).role(Role.ROLE_ADMIN).build())
            );
            User alice = userRepository.findByEmail("alice@farmverse.com").orElseGet(() ->
                userRepository.save(User.builder().name("Dr. Alice Agronomist").email("alice@farmverse.com").password(passwordEncoder.encode("password123")).role(Role.ROLE_AGRONOMIST).build())
            );
            User bob = userRepository.findByEmail("bob@farmverse.com").orElseGet(() ->
                userRepository.save(User.builder().name("Farmer Bob").email("bob@farmverse.com").password(passwordEncoder.encode("password123")).role(Role.ROLE_FARMER).build())
            );
            User arun = userRepository.findByEmail("arun.kumar@farmverse.io").orElseGet(() ->
                userRepository.save(User.builder().name("Arun Kumar").email("arun.kumar@farmverse.io").password(passwordEncoder.encode("password123")).role(Role.ROLE_FARMER).build())
            );
            User ramesh = userRepository.findByEmail("ramesh.patel@farmverse.io").orElseGet(() ->
                userRepository.save(User.builder().name("Ramesh Patel").email("ramesh.patel@farmverse.io").password(passwordEncoder.encode("password123")).role(Role.ROLE_FARMER).build())
            );
            User vijay = userRepository.findByEmail("vijay.raghavan@farmverse.io").orElseGet(() ->
                userRepository.save(User.builder().name("Vijayaraghavan S").email("vijay.raghavan@farmverse.io").password(passwordEncoder.encode("password123")).role(Role.ROLE_FARMER).build())
            );
            User priya = userRepository.findByEmail("priya.sundaram@farmverse.io").orElseGet(() ->
                userRepository.save(User.builder().name("Priya Sundaram").email("priya.sundaram@farmverse.io").password(passwordEncoder.encode("password123")).role(Role.ROLE_FARMER).build())
            );
            User murugan = userRepository.findByEmail("murugan.s@farmverse.io").orElseGet(() ->
                userRepository.save(User.builder().name("Murugan S").email("murugan.s@farmverse.io").password(passwordEncoder.encode("password123")).role(Role.ROLE_FARMER).build())
            );
        } catch (Exception e) {
            System.out.println("User seeding exception handled: " + e.getMessage());
        }

        User bobUser = userRepository.findByEmail("bob@farmverse.com").orElse(null);
        User arunUser = userRepository.findByEmail("arun.kumar@farmverse.io").orElse(null);
        User rameshUser = userRepository.findByEmail("ramesh.patel@farmverse.io").orElse(null);
        User vijayUser = userRepository.findByEmail("vijay.raghavan@farmverse.io").orElse(null);
        User priyaUser = userRepository.findByEmail("priya.sundaram@farmverse.io").orElse(null);
        User muruganUser = userRepository.findByEmail("murugan.s@farmverse.io").orElse(null);

        // 2. Seed Farms if empty
        try {
            if (farmRepository.count() < 7 && bobUser != null) {
                Farm farm1 = Farm.builder().name("Emerald Acres").location("Karur, Tamil Nadu").sizeAcres(45.5).soilType("Loamy Clay").owner(bobUser).build();
                Farm farm2 = Farm.builder().name("Green Valley Farm").location("Karur, Tamil Nadu").sizeAcres(5.0).soilType("Loamy Soil").owner(arunUser != null ? arunUser : bobUser).build();
                Farm farm3 = Farm.builder().name("Cauvery Delta Organic Farm").location("Thanjavur, Tamil Nadu").sizeAcres(8.5).soilType("Clay Loam").owner(rameshUser != null ? rameshUser : bobUser).build();
                Farm farm4 = Farm.builder().name("TexValley Agro").location("Erode, Tamil Nadu").sizeAcres(12.0).soilType("Black Cotton Soil").owner(vijayUser != null ? vijayUser : bobUser).build();
                Farm farm5 = Farm.builder().name("Anamalai Bio Plantation").location("Coimbatore, Tamil Nadu").sizeAcres(4.0).soilType("Red Loamy").owner(priyaUser != null ? priyaUser : bobUser).build();
                Farm farm6 = Farm.builder().name("Yercaud Foothill Farm").location("Salem, Tamil Nadu").sizeAcres(6.2).soilType("Red Soil").owner(muruganUser != null ? muruganUser : bobUser).build();
                Farm farm7 = Farm.builder().name("Vaigai Harvest Farm").location("Madurai, Tamil Nadu").sizeAcres(7.8).soilType("Deep Alluvial").owner(bobUser).build();

                farmRepository.saveAll(Arrays.asList(farm1, farm2, farm3, farm4, farm5, farm6, farm7));
                System.out.println("====== SEEDED 7 FARMS ======");
            }
        } catch (Exception e) {
            System.out.println("Farm seeding exception handled: " + e.getMessage());
        }

        List<Farm> allFarms = farmRepository.findAll();
        Farm f1 = allFarms.isEmpty() ? null : allFarms.get(0);
        Farm f2 = allFarms.size() > 1 ? allFarms.get(1) : f1;
        Farm f3 = allFarms.size() > 2 ? allFarms.get(2) : f1;
        Farm f4 = allFarms.size() > 3 ? allFarms.get(3) : f1;
        Farm f5 = allFarms.size() > 4 ? allFarms.get(4) : f1;
        Farm f6 = allFarms.size() > 5 ? allFarms.get(5) : f1;

        // 3. Seed Crops if empty
        try {
            if (cropRepository.count() < 7 && f1 != null) {
                Crop c1 = Crop.builder().farm(f1).name("Paddy Rice").variety("ADT 43 (Ponni)").season("Kharif").sowingDate(LocalDate.now().minusMonths(3)).expectedHarvestDate(LocalDate.now().plusMonths(1)).areaAcres(12.5).status(CropStatus.GROWING).notes("Healthy growth with sensor irrigation.").build();
                Crop c2 = Crop.builder().farm(f1).name("Sugarcane").variety("Co 0238 High Yield").season("Annual").sowingDate(LocalDate.now().minusMonths(6)).expectedHarvestDate(LocalDate.now().plusMonths(4)).areaAcres(15.0).status(CropStatus.GROWING).notes("High sucrose content cultivar.").build();
                Crop c3 = Crop.builder().farm(f1).name("Tomato").variety("PKM 1 Hybrid").season("Rabi").sowingDate(LocalDate.now().minusMonths(2)).expectedHarvestDate(LocalDate.now().plusWeeks(2)).areaAcres(5.0).status(CropStatus.HARVEST_READY).notes("Fruit set optimal, harvest ready.").build();
                Crop c4 = Crop.builder().farm(f2).name("Rice").variety("CO 51 High Yield").season("Kharif").sowingDate(LocalDate.now().minusMonths(2)).expectedHarvestDate(LocalDate.now().plusMonths(2)).areaAcres(5.0).status(CropStatus.GROWING).notes("Valley plot with drip irrigation.").build();
                Crop c5 = Crop.builder().farm(f4).name("Cotton").variety("MCU 5 Hybrid").season("Kharif").sowingDate(LocalDate.now().minusMonths(4)).expectedHarvestDate(LocalDate.now().plusMonths(2)).areaAcres(12.0).status(CropStatus.GROWING).notes("Boll formation stage.").build();
                Crop c6 = Crop.builder().farm(f5).name("Maize").variety("CO 6 Hybrid").season("Rabi").sowingDate(LocalDate.now().minusMonths(1)).expectedHarvestDate(LocalDate.now().plusMonths(3)).areaAcres(4.0).status(CropStatus.GROWING).notes("Seedling stage in red soil.").build();
                Crop c7 = Crop.builder().farm(f6).name("Turmeric").variety("BSR 2 Organic").season("Annual").sowingDate(LocalDate.now().minusMonths(5)).expectedHarvestDate(LocalDate.now().plusMonths(4)).areaAcres(6.2).status(CropStatus.GROWING).notes("Organic rhizome growth.").build();

                cropRepository.saveAll(Arrays.asList(c1, c2, c3, c4, c5, c6, c7));
                System.out.println("====== SEEDED 7 CROPS ======");
            }
        } catch (Exception e) {
            System.out.println("Crop seeding exception handled: " + e.getMessage());
        }

        // 4. Seed Devices safely checking MAC address
        try {
            if (f1 != null) {
                String[] macs = {"AA:BB:CC:DD:EE:01", "AA:BB:CC:DD:EE:02", "AA:BB:CC:DD:EE:03", "AA:BB:CC:DD:EE:04", "AA:BB:CC:DD:EE:05", "AA:BB:CC:DD:EE:06", "AA:BB:CC:DD:EE:07"};
                DeviceType[] types = {DeviceType.SOIL_NODE, DeviceType.VALVE, DeviceType.DHT_NODE, DeviceType.SOIL_NODE, DeviceType.VALVE, DeviceType.VALVE, DeviceType.SOIL_NODE};
                String[] names = {"Soil Node Alpha", "Irrigation Solenoid Valve #1", "Ambient Temp Node Delta", "Soil Probe Bravo", "Drip Valve Sector 2", "Smart Valve Cotton Plot", "Canopy Moisture Node"};
                Farm[] targetFarms = {f1, f1, f1, f2, f3, f4, f5};

                for (int i = 0; i < macs.length; i++) {
                    if (deviceRepository.findByMacAddress(macs[i]).isEmpty()) {
                        deviceRepository.save(Device.builder().name(names[i]).macAddress(macs[i]).type(types[i]).farm(targetFarms[i]).active(true).build());
                    }
                }
                System.out.println("====== SEEDED/VERIFIED DEVICES ======");
            }
        } catch (Exception e) {
            System.out.println("Device seeding exception handled: " + e.getMessage());
        }

        // 5. Seed Sensor Telemetry Data if empty
        try {
            if (sensorDataRepository.count() < 8) {
                List<Device> allDevices = deviceRepository.findAll();
                Device dev1 = allDevices.isEmpty() ? null : allDevices.get(0);
                if (dev1 != null) {
                    LocalDateTime now = LocalDateTime.now();
                    SensorData s1 = SensorData.builder().device(dev1).moisture(48.2).nitrogen(42.0).phosphorus(31.0).potassium(52.0).temperature(22.5).humidity(58.0).timestamp(now.minusHours(24)).build();
                    SensorData s2 = SensorData.builder().device(dev1).moisture(45.1).nitrogen(41.0).phosphorus(30.5).potassium(51.5).temperature(24.0).humidity(55.0).timestamp(now.minusHours(21)).build();
                    SensorData s3 = SensorData.builder().device(dev1).moisture(41.8).nitrogen(40.0).phosphorus(30.0).potassium(50.0).temperature(27.8).humidity(50.0).timestamp(now.minusHours(18)).build();
                    SensorData s4 = SensorData.builder().device(dev1).moisture(37.5).nitrogen(39.0).phosphorus(28.0).potassium(48.0).temperature(32.4).humidity(44.0).timestamp(now.minusHours(15)).build();
                    SensorData s5 = SensorData.builder().device(dev1).moisture(33.0).nitrogen(38.0).phosphorus(27.5).potassium(47.0).temperature(41.5).humidity(38.0).timestamp(now.minusHours(12)).build();
                    SensorData s6 = SensorData.builder().device(dev1).moisture(31.2).nitrogen(28.0).phosphorus(27.0).potassium(46.0).temperature(36.1).humidity(40.0).timestamp(now.minusHours(9)).build();
                    SensorData s7 = SensorData.builder().device(dev1).moisture(28.5).nitrogen(27.5).phosphorus(18.0).potassium(38.5).temperature(30.4).humidity(42.0).timestamp(now.minusHours(6)).build();
                    SensorData s8 = SensorData.builder().device(dev1).moisture(27.2).nitrogen(27.0).phosphorus(17.5).potassium(38.0).temperature(29.0).humidity(45.0).timestamp(now.minusHours(3)).build();

                    sensorDataRepository.saveAll(Arrays.asList(s1, s2, s3, s4, s5, s6, s7, s8));
                    System.out.println("====== SEEDED 8 SENSOR TELEMETRY READINGS ======");
                }
            }
        } catch (Exception e) {
            System.out.println("SensorData seeding exception handled: " + e.getMessage());
        }

        // 6. Seed Alerts if empty
        try {
            if (alertRepository.count() < 7 && f1 != null) {
                LocalDateTime now = LocalDateTime.now();
                Alert a1 = Alert.builder().farm(f1).message("Warning: Extreme soil temperature on Emerald Acres: 41.5°C.").severity(AlertSeverity.WARNING).resolved(false).timestamp(now.minusHours(12)).build();
                Alert a2 = Alert.builder().farm(f1).message("Critical Moisture Drop: Moisture levels on Emerald Acres fell to 28.5%.").severity(AlertSeverity.CRITICAL).resolved(false).timestamp(now.minusHours(6)).build();
                Alert a3 = Alert.builder().farm(f2).message("Low Nitrogen Index: Nitrogen deficiency detected on Green Valley Farm (22 ppm).").severity(AlertSeverity.WARNING).resolved(false).timestamp(now.minusHours(8)).build();
                Alert a4 = Alert.builder().farm(f3).message("High Soil Salinity: Electrical Conductivity spike on Cauvery Delta Farm (3.2 dS/m).").severity(AlertSeverity.WARNING).resolved(true).timestamp(now.minusHours(18)).build();
                Alert a5 = Alert.builder().farm(f4).message("Sub-optimal Moisture: Water stress detected on TexValley Agro cotton plot.").severity(AlertSeverity.WARNING).resolved(false).timestamp(now.minusHours(4)).build();
                Alert a6 = Alert.builder().farm(f5).message("Phosphorus Deficiency: Low phosphorus levels detected on Anamalai Bio Plantation.").severity(AlertSeverity.WARNING).resolved(true).timestamp(now.minusHours(14)).build();
                Alert a7 = Alert.builder().farm(f6).message("Extreme Heat Hazard: Soil temperature peak 43.2°C on Yercaud Foothill Farm.").severity(AlertSeverity.CRITICAL).resolved(false).timestamp(now.minusHours(2)).build();

                alertRepository.saveAll(Arrays.asList(a1, a2, a3, a4, a5, a6, a7));
                System.out.println("====== SEEDED 7 ALERTS ======");
            }
        } catch (Exception e) {
            System.out.println("Alert seeding exception handled: " + e.getMessage());
        }

        // 7. Seed Irrigation Schedules if empty
        try {
            if (irrigationRepository.count() < 7 && f1 != null) {
                IrrigationSchedule sch1 = IrrigationSchedule.builder().farm(f1).sector("Paddy Rice (Zone A)").timeOfDay("06:00 AM").durationMinutes(30).active(true).moistureTarget(60.0).currentMoisture(45.0).build();
                IrrigationSchedule sch2 = IrrigationSchedule.builder().farm(f1).sector("Tomato Field (Zone B)").timeOfDay("08:00 PM").durationMinutes(20).active(true).moistureTarget(65.0).currentMoisture(32.0).build();
                IrrigationSchedule sch3 = IrrigationSchedule.builder().farm(f2).sector("Green Valley Rice Plot").timeOfDay("05:30 AM").durationMinutes(40).active(true).moistureTarget(70.0).currentMoisture(50.0).build();
                IrrigationSchedule sch4 = IrrigationSchedule.builder().farm(f3).sector("Sugarcane Canal Drip").timeOfDay("07:00 AM").durationMinutes(60).active(true).moistureTarget(65.0).currentMoisture(58.0).build();
                IrrigationSchedule sch5 = IrrigationSchedule.builder().farm(f4).sector("Cotton East Sector Drip").timeOfDay("06:30 PM").durationMinutes(25).active(true).moistureTarget(55.0).currentMoisture(28.0).build();
                IrrigationSchedule sch6 = IrrigationSchedule.builder().farm(f5).sector("Maize Foothill Sector").timeOfDay("07:30 AM").durationMinutes(20).active(true).moistureTarget(60.0).currentMoisture(42.0).build();
                IrrigationSchedule sch7 = IrrigationSchedule.builder().farm(f6).sector("Turmeric Terrace Plot").timeOfDay("05:00 PM").durationMinutes(35).active(true).moistureTarget(65.0).currentMoisture(30.0).build();

                irrigationRepository.saveAll(Arrays.asList(sch1, sch2, sch3, sch4, sch5, sch6, sch7));
                System.out.println("====== SEEDED 7 IRRIGATION SCHEDULES ======");
            }
        } catch (Exception e) {
            System.out.println("Irrigation seeding exception handled: " + e.getMessage());
        }

        // 8. Seed Fertilizer Recommendations if empty
        try {
            if (fertilizerRepository.count() < 7) {
                FertilizerRecommendation f1Rec = FertilizerRecommendation.builder().cropName("Paddy Rice").fieldName("River Bank Block #1").fertilizerType("Urea & DAP Mix").dosageKgPerAcre(50.0).applicationStage("Tillering Stage").npkRatio("20-10-10").recommendedDate(LocalDate.now()).status("Scheduled").notes("Apply during morning hours.").build();
                FertilizerRecommendation f2Rec = FertilizerRecommendation.builder().cropName("Tomato").fieldName("Polyhouse Field #2").fertilizerType("Potassium Nitrate").dosageKgPerAcre(25.0).applicationStage("Fruiting Stage").npkRatio("13-0-45").recommendedDate(LocalDate.now().plusDays(3)).status("Scheduled").notes("Enhances fruit weight and color.").build();
                FertilizerRecommendation f3Rec = FertilizerRecommendation.builder().cropName("Sugarcane").fieldName("Canal Plot A").fertilizerType("Neem Coated Urea").dosageKgPerAcre(65.0).applicationStage("Vegetative Stage").npkRatio("46-0-0").recommendedDate(LocalDate.now().plusDays(5)).status("Scheduled").notes("Split application for optimum nitrogen uptake.").build();
                FertilizerRecommendation f4Rec = FertilizerRecommendation.builder().cropName("Cotton").fieldName("East Sector #3").fertilizerType("Complex NPK").dosageKgPerAcre(40.0).applicationStage("Flowering Stage").npkRatio("17-17-17").recommendedDate(LocalDate.now().plusDays(2)).status("Scheduled").notes("Boosts boll retention.").build();
                FertilizerRecommendation f5Rec = FertilizerRecommendation.builder().cropName("Maize").fieldName("Foothill Sector B").fertilizerType("Zinc Sulphate & Urea").dosageKgPerAcre(30.0).applicationStage("Seedling Stage").npkRatio("20-20-0").recommendedDate(LocalDate.now().plusDays(7)).status("Scheduled").notes("Prevents zinc deficiency in seedlings.").build();
                FertilizerRecommendation f6Rec = FertilizerRecommendation.builder().cropName("Turmeric").fieldName("Terrace Plot #2").fertilizerType("Bio-Potash & SSP").dosageKgPerAcre(45.0).applicationStage("Rhizome Stage").npkRatio("10-20-20").recommendedDate(LocalDate.now().plusDays(4)).status("Scheduled").notes("Encourages rhizome enlargement.").build();
                FertilizerRecommendation f7Rec = FertilizerRecommendation.builder().cropName("Banana").fieldName("Riverbed Plot 1").fertilizerType("Muriate of Potash").dosageKgPerAcre(35.0).applicationStage("Bunching Stage").npkRatio("0-0-60").recommendedDate(LocalDate.now().plusDays(6)).status("Scheduled").notes("Improves fruit sweetness and yield.").build();

                fertilizerRepository.saveAll(Arrays.asList(f1Rec, f2Rec, f3Rec, f4Rec, f5Rec, f6Rec, f7Rec));
                System.out.println("====== SEEDED 7 FERTILIZER RECOMMENDATIONS ======");
            }
        } catch (Exception e) {
            System.out.println("Fertilizer seeding exception handled: " + e.getMessage());
        }

        // 9. Seed Pest Records if empty
        try {
            if (pestRepository.count() < 7) {
                PestRecord p1 = PestRecord.builder().pestName("Stem Borer").cropAffected("Paddy Rice").severity("Medium").treatmentMethod("Neem Oil Spray & Chlorantraniliprole").status("Active").detectedDate(LocalDate.now().minusDays(5)).affectedArea("1.5 Acres").symptoms("Dead hearts and white heads in tillers").build();
                PestRecord p2 = PestRecord.builder().pestName("Fall Armyworm").cropAffected("Corn Crop").severity("High").treatmentMethod("Bacillus thuringiensis & Coragen").status("Active").detectedDate(LocalDate.now().minusDays(3)).affectedArea("2.0 Acres").symptoms("Whorl chewing and frass in stems").build();
                PestRecord p3 = PestRecord.builder().pestName("Green Peach Aphids").cropAffected("Tomato Field").severity("Medium").treatmentMethod("Imidacloprid & Ladybugs release").status("Active").detectedDate(LocalDate.now().minusDays(2)).affectedArea("0.8 Acres").symptoms("Leaf curling and sticky honeydew deposit").build();
                PestRecord p4 = PestRecord.builder().pestName("Whitefly Vector").cropAffected("Cotton Field").severity("Critical").treatmentMethod("Acetamiprid & Yellow Sticky Traps").status("Active").detectedDate(LocalDate.now().minusDays(6)).affectedArea("3.5 Acres").symptoms("Sooty mold growth on upper leaves").build();
                PestRecord p5 = PestRecord.builder().pestName("Rhizome Fly").cropAffected("Turmeric Plot").severity("Medium").treatmentMethod("Drenching Chlorpyrifos & Neem Cake").status("Active").detectedDate(LocalDate.now().minusDays(4)).affectedArea("1.2 Acres").symptoms("Yellowing of tillers and rotting rhizomes").build();
                PestRecord p6 = PestRecord.builder().pestName("Mealybug Infestation").cropAffected("Sugarcane Plot").severity("Low").treatmentMethod("Cryptolaemus beetles & Verticillium spray").status("Resolved").detectedDate(LocalDate.now().minusDays(10)).affectedArea("0.5 Acres").symptoms("White waxy secretion under leaf sheath").build();
                PestRecord p7 = PestRecord.builder().pestName("Leaf Folder Insect").cropAffected("Rice Paddy").severity("Medium").treatmentMethod("Cartap Hydrochloride 50% SP").status("Active").detectedDate(LocalDate.now().minusDays(1)).affectedArea("1.8 Acres").symptoms("Folded leaves with longitudinal white streaks").build();

                pestRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5, p6, p7));
                System.out.println("====== SEEDED 7 PEST RECORDS ======");
            }
        } catch (Exception e) {
            System.out.println("Pest seeding exception handled: " + e.getMessage());
        }

        // 10. Seed Disease Records if empty
        try {
            if (diseaseRepository.count() < 7) {
                DiseaseRecord dis1 = DiseaseRecord.builder().diseaseName("Early Blight").cropName("Tomato").confidencePercentage(94.8).symptoms("Concentric dark spots on lower leaves").recommendedFungicide("Mancozeb 75% WP").severity("Moderate").detectedDate(LocalDate.now().minusDays(2)).imageUrl("/assets/early_blight.jpg").build();
                DiseaseRecord dis2 = DiseaseRecord.builder().diseaseName("Common Rust").cropName("Corn").confidencePercentage(95.8).symptoms("Orange-brown urediniospores on leaf surface").recommendedFungicide("Azoxystrobin 23% EC").severity("Critical").detectedDate(LocalDate.now().minusDays(4)).imageUrl("/assets/corn_rust.jpg").build();
                DiseaseRecord dis3 = DiseaseRecord.builder().diseaseName("Rice Blast").cropName("Paddy Rice").confidencePercentage(96.4).symptoms("Diamond shaped spindle lesions on leaf blade").recommendedFungicide("Tricyclazole 75% WP").severity("High").detectedDate(LocalDate.now().minusDays(1)).imageUrl("/assets/rice_blast.jpg").build();
                DiseaseRecord dis4 = DiseaseRecord.builder().diseaseName("Red Rot").cropName("Sugarcane").confidencePercentage(94.2).symptoms("Red internal stalk tissue with transverse white patches").recommendedFungicide("Carbendazim & Trichoderma").severity("Critical").detectedDate(LocalDate.now().minusDays(7)).imageUrl("/assets/red_rot.jpg").build();
                DiseaseRecord dis5 = DiseaseRecord.builder().diseaseName("Bacterial Leaf Blight").cropName("Rice").confidencePercentage(93.5).symptoms("Water-soaked wavy yellow lesions along leaf margins").recommendedFungicide("Streptocycline + Copper Oxychloride").severity("High").detectedDate(LocalDate.now().minusDays(3)).imageUrl("/assets/bacterial_blight.jpg").build();
                DiseaseRecord dis6 = DiseaseRecord.builder().diseaseName("Powdery Mildew").cropName("Vegetable Crop").confidencePercentage(91.8).symptoms("White powdery fungal coating on upper leaf surface").recommendedFungicide("Wettable Sulfur 80% WP").severity("Moderate").detectedDate(LocalDate.now().minusDays(5)).imageUrl("/assets/powdery_mildew.jpg").build();
                DiseaseRecord dis7 = DiseaseRecord.builder().diseaseName("Citrus Canker").cropName("Citrus Orchard").confidencePercentage(95.1).symptoms("Raised corky yellow-halo lesions on foliage and fruit").recommendedFungicide("Copper Hydroxide 77% WP").severity("High").detectedDate(LocalDate.now().minusDays(6)).imageUrl("/assets/citrus_canker.jpg").build();

                diseaseRepository.saveAll(Arrays.asList(dis1, dis2, dis3, dis4, dis5, dis6, dis7));
                System.out.println("====== SEEDED 7 DISEASE RECORDS ======");
            }
        } catch (Exception e) {
            System.out.println("Disease seeding exception handled: " + e.getMessage());
        }

        // 11. Seed Yield Predictions if empty (and delete incomplete/null legacy records)
        try {
            List<YieldPrediction> nullYields = yieldRepository.findAll().stream()
                    .filter(y -> y.getVariety() == null || y.getAreaAcres() == null || y.getPredictedYieldTons() == null)
                    .toList();
            if (!nullYields.isEmpty()) {
                yieldRepository.deleteAll(nullYields);
                System.out.println("====== DELETED " + nullYields.size() + " NULL YIELD PREDICTION RECORDS ======");
            }

            if (yieldRepository.count() < 7) {
                YieldPrediction y1 = YieldPrediction.builder().cropName("Paddy Rice").variety("ADT 43 (Ponni)").areaAcres(12.5).predictedYieldTons(31.25).confidenceScore(91.5).riskFactors("Late season rainfall risk").optimalHarvestWindow("Oct 10 - Oct 20").build();
                YieldPrediction y2 = YieldPrediction.builder().cropName("Tomato").variety("PKM 1 Hybrid").areaAcres(5.0).predictedYieldTons(65.0).confidenceScore(88.0).riskFactors("High temperature heat stress").optimalHarvestWindow("Sep 20 - Sep 30").build();
                YieldPrediction y3 = YieldPrediction.builder().cropName("Sugarcane").variety("Co 0238").areaAcres(15.0).predictedYieldTons(540.0).confidenceScore(93.2).riskFactors("Water logging in monsoon").optimalHarvestWindow("Dec 15 - Dec 30").build();
                YieldPrediction y4 = YieldPrediction.builder().cropName("Rice").variety("CO 51").areaAcres(5.0).predictedYieldTons(13.5).confidenceScore(90.0).riskFactors("Blast spore vector threat").optimalHarvestWindow("Oct 15 - Oct 25").build();
                YieldPrediction y5 = YieldPrediction.builder().cropName("Cotton").variety("MCU 5").areaAcres(12.0).predictedYieldTons(14.4).confidenceScore(87.5).riskFactors("Whitefly pressure").optimalHarvestWindow("Nov 01 - Nov 15").build();
                YieldPrediction y6 = YieldPrediction.builder().cropName("Maize").variety("CO 6").areaAcres(4.0).predictedYieldTons(12.8).confidenceScore(89.2).riskFactors("Armyworm infestation risk").optimalHarvestWindow("Sep 25 - Oct 05").build();
                YieldPrediction y7 = YieldPrediction.builder().cropName("Turmeric").variety("BSR 2").areaAcres(6.2).predictedYieldTons(18.6).confidenceScore(92.0).riskFactors("Soil saturation in winter").optimalHarvestWindow("Jan 10 - Jan 25").build();

                yieldRepository.saveAll(Arrays.asList(y1, y2, y3, y4, y5, y6, y7));
                System.out.println("====== SEEDED 7 VALID YIELD PREDICTIONS ======");
            }
        } catch (Exception e) {
            System.out.println("Yield seeding exception handled: " + e.getMessage());
        }

        // 12. Seed Market Prices if empty
        try {
            if (marketRepository.count() < 7) {
                MarketPrice m1 = MarketPrice.builder().commodity("Paddy Rice (Ponni)").marketMandi("Karur Mandi").state("Tamil Nadu").modalPrice(2350.0).minPrice(2200.0).maxPrice(2500.0).priceChangePercent(3.2).priceDate(LocalDate.now()).build();
                MarketPrice m2 = MarketPrice.builder().commodity("Tomato (Hybrid)").marketMandi("Coimbatore Wholesale").state("Tamil Nadu").modalPrice(3200.0).minPrice(2800.0).maxPrice(3600.0).priceChangePercent(-2.5).priceDate(LocalDate.now()).build();
                MarketPrice m3 = MarketPrice.builder().commodity("Sugarcane").marketMandi("Erode Market").state("Tamil Nadu").modalPrice(3150.0).minPrice(3000.0).maxPrice(3300.0).priceChangePercent(1.1).priceDate(LocalDate.now()).build();
                MarketPrice m4 = MarketPrice.builder().commodity("Cotton (Long Staple)").marketMandi("Dindigul Mandi").state("Tamil Nadu").modalPrice(7450.0).minPrice(7100.0).maxPrice(7800.0).priceChangePercent(4.0).priceDate(LocalDate.now()).build();
                MarketPrice m5 = MarketPrice.builder().commodity("Maize Grain").marketMandi("Salem Market").state("Tamil Nadu").modalPrice(2180.0).minPrice(2050.0).maxPrice(2300.0).priceChangePercent(0.8).priceDate(LocalDate.now()).build();
                MarketPrice m6 = MarketPrice.builder().commodity("Turmeric (Finger)").marketMandi("Erode Mandi").state("Tamil Nadu").modalPrice(13850.0).minPrice(12500.0).maxPrice(15200.0).priceChangePercent(5.5).priceDate(LocalDate.now()).build();
                MarketPrice m7 = MarketPrice.builder().commodity("Banana (Grand Naine)").marketMandi("Tiruchirappalli Mandi").state("Tamil Nadu").modalPrice(1850.0).minPrice(1650.0).maxPrice(2100.0).priceChangePercent(-1.2).priceDate(LocalDate.now()).build();

                marketRepository.saveAll(Arrays.asList(m1, m2, m3, m4, m5, m6, m7));
                System.out.println("====== SEEDED 7 MARKET PRICES ======");
            }
        } catch (Exception e) {
            System.out.println("Market price seeding exception handled: " + e.getMessage());
        }

        System.out.println("====== FARMVERSE COMPLETE DATASET SEEDING VERIFIED ACROSS ALL 12 TABLES ======");
    }
}
