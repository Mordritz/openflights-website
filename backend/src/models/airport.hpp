#pragma once
#include <string>
#include <sstream>
#include "crow.h"

struct Airport {
    int id;
    std::string name;
    std::string city;
    std::string country;
    std::string iata;
    std::string icao;
    double latitude;
    double longitude;
    int altitude;
    double timezone;
    std::string dst;
    std::string tz_database;
    std::string type;
    std::string source;

    // Convert to JSON for API responses
    crow::json::wvalue to_json() const {
        crow::json::wvalue json;
        json["id"] = id;
        json["name"] = name;
        json["city"] = city;
        json["country"] = country;
        json["iata"] = iata;
        json["icao"] = icao;
        json["latitude"] = latitude;
        json["longitude"] = longitude;
        json["altitude"] = altitude;
        json["timezone"] = timezone;
        json["dst"] = dst;
        json["tz_database"] = tz_database;
        json["type"] = type;
        json["source"] = source;
        return json;
    }

    // Convert to CSV string
    std::string to_csv() const {
        std::ostringstream oss;
        oss << id << "," << name << "," << city << "," << country << ","
            << iata << "," << icao << "," << latitude << "," << longitude << ","
            << altitude << "," << timezone << "," << dst << "," << tz_database << ","
            << type << "," << source;
        return oss.str();
    }

    static std::string csv_header() {
        return "id,name,city,country,iata,icao,latitude,longitude,altitude,timezone,dst,tz_database,type,source";
    }
};