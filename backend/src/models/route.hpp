#pragma once
#include <string>
#include <sstream>
#include "crow.h"

struct Route {
    std::string airline_iata;
    int airline_id;
    std::string source_airport_iata;
    int source_airport_id;
    std::string dest_airport_iata;
    int dest_airport_id;
    std::string codeshare;
    int stops;
    std::string equipment;

    // Convert to JSON for API responses
    crow::json::wvalue to_json() const {
        crow::json::wvalue json;
        json["airline_iata"] = airline_iata;
        json["airline_id"] = airline_id;
        json["source_airport_iata"] = source_airport_iata;
        json["source_airport_id"] = source_airport_id;
        json["dest_airport_iata"] = dest_airport_iata;
        json["dest_airport_id"] = dest_airport_id;
        json["codeshare"] = codeshare;
        json["stops"] = stops;
        json["equipment"] = equipment;
        return json;
    }

    // Convert to CSV string
    std::string to_csv() const {
        std::ostringstream oss;
        oss << airline_iata << "," << airline_id << "," 
            << source_airport_iata << "," << source_airport_id << ","
            << dest_airport_iata << "," << dest_airport_id << "," 
            << codeshare << "," << stops << "," << equipment;
        return oss.str();
    }

    static std::string csv_header() {
        return "airline_iata,airline_id,source_airport_iata,source_airport_id,dest_airport_iata,dest_airport_id,codeshare,stops,equipment";
    }

    // Unique key for route identification
    std::string get_key() const {
        return std::to_string(airline_id) + "_" + 
               std::to_string(source_airport_id) + "_" + 
               std::to_string(dest_airport_id);
    }
};