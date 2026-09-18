package com.farmverse.backend.config;

import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Configuration
public class DatabaseBootstrapConfig {

    @Bean
    public static BeanFactoryPostProcessor databaseInitializerPostProcessor() {
        return (ConfigurableListableBeanFactory beanFactory) -> {
            String dbUrl = "jdbc:postgresql://localhost:5432/";
            String defaultDb = "postgres";
            String targetDb = "farmverse_db";
            String username = "postgres";
            String password = "root";

            try (Connection conn = DriverManager.getConnection(dbUrl + defaultDb, username, password);
                 Statement stmt = conn.createStatement()) {

                ResultSet rs = stmt.executeQuery(
                        "SELECT 1 FROM pg_database WHERE datname = '" + targetDb + "'"
                );

                if (!rs.next()) {
                    System.out.println("====== PostgreSQL: Creating database '" + targetDb + "' ======");
                    stmt.executeUpdate("CREATE DATABASE " + targetDb);
                    System.out.println("====== PostgreSQL: Database '" + targetDb + "' created successfully! ======");
                } else {
                    System.out.println("====== PostgreSQL: Database '" + targetDb + "' verified existing. ======");
                }
            } catch (Exception e) {
                System.err.println("DatabaseBootstrapConfig notice: " + e.getMessage());
            }
        };
    }
}
