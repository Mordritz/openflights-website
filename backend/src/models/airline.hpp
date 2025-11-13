#pragma once
#include <string>
#include <sstream>
#include "crow.h"

struct Airline {
    int id;
    std::string name;
    std::string alias;
    std::string iata;
    std::string icao;
    std::string callsign;
    std::string country;
    std::string active;

    // Convert to JSON for API responses
    crow::json::wvalue to_json() const {
        crow::json::wvalue json;
        json["id"] = id;
        json["name"] = name;
        json["alias"] = alias;
        json["iata"] = iata;
        json["icao"] = icao;
        json["callsign"] = callsign;
        json["country"] = country;
        json["active"] = active;
        return json;
    }

    // Convert to CSV string
    std::string to_csv() const {
        std::ostringstream oss;
        oss << id << "," << name << "," << alias << "," << iata << ","
            << icao << "," << callsign << "," << country << "," << active;
        return oss.str();
    }

    static std::string csv_header() {
        return "id,name,alias,iata,icao,callsign,country,active";
    }
};