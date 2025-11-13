#include "csv_parser.hpp"
#include "../utils/string_utils.hpp"
#include <fstream>
#include <iostream>

std::vector<Airport> CSVParser::parse_airports(const std::string& filepath) {
    std::vector<Airport> airports;
    std::ifstream file(filepath);
    
    if (!file.is_open()) {
        std::cerr << "Error: Could not open airports file: " << filepath << std::endl;
        return airports;
    }

    std::string line;
    int line_num = 0;
    while (std::getline(file, line)) {
        line_num++;
        if (line.empty()) continue;

        auto tokens = utils::split(line, ',');
        if (tokens.size() < 14) {
            std::cerr << "Warning: Skipping malformed airport line " << line_num << std::endl;
            continue;
        }

        Airport airport;
        airport.id = utils::safe_stoi(tokens[0]);
        airport.name = utils::trim(tokens[1]);
        airport.city = utils::trim(tokens[2]);
        airport.country = utils::trim(tokens[3]);
        airport.iata = utils::trim(tokens[4]);
        airport.icao = utils::trim(tokens[5]);
        airport.latitude = utils::safe_stod(tokens[6]);
        airport.longitude = utils::safe_stod(tokens[7]);
        airport.altitude = utils::safe_stoi(tokens[8]);
        airport.timezone = utils::safe_stod(tokens[9]);
        airport.dst = utils::trim(tokens[10]);
        airport.tz_database = utils::trim(tokens[11]);
        airport.type = utils::trim(tokens[12]);
        airport.source = utils::trim(tokens[13]);

        airports.push_back(airport);
    }

    file.close();
    std::cout << "Loaded " << airports.size() << " airports" << std::endl;
    return airports;
}

std::vector<Airline> CSVParser::parse_airlines(const std::string& filepath) {
    std::vector<Airline> airlines;
    std::ifstream file(filepath);
    
    if (!file.is_open()) {
        std::cerr << "Error: Could not open airlines file: " << filepath << std::endl;
        return airlines;
    }

    std::string line;
    int line_num = 0;
    while (std::getline(file, line)) {
        line_num++;
        if (line.empty()) continue;

        auto tokens = utils::split(line, ',');
        if (tokens.size() < 8) {
            std::cerr << "Warning: Skipping malformed airline line " << line_num << std::endl;
            continue;
        }

        Airline airline;
        airline.id = utils::safe_stoi(tokens[0]);
        airline.name = utils::trim(tokens[1]);
        airline.alias = utils::trim(tokens[2]);
        airline.iata = utils::trim(tokens[3]);
        airline.icao = utils::trim(tokens[4]);
        airline.callsign = utils::trim(tokens[5]);
        airline.country = utils::trim(tokens[6]);
        airline.active = utils::trim(tokens[7]);

        airlines.push_back(airline);
    }

    file.close();
    std::cout << "Loaded " << airlines.size() << " airlines" << std::endl;
    return airlines;
}

std::vector<Route> CSVParser::parse_routes(const std::string& filepath) {
    std::vector<Route> routes;
    std::ifstream file(filepath);
    
    if (!file.is_open()) {
        std::cerr << "Error: Could not open routes file: " << filepath << std::endl;
        return routes;
    }

    std::string line;
    int line_num = 0;
    while (std::getline(file, line)) {
        line_num++;
        if (line.empty()) continue;

        auto tokens = utils::split(line, ',');
        if (tokens.size() < 9) {
            std::cerr << "Warning: Skipping malformed route line " << line_num << std::endl;
            continue;
        }

        Route route;
        route.airline_iata = utils::trim(tokens[0]);
        route.airline_id = utils::safe_stoi(tokens[1]);
        route.source_airport_iata = utils::trim(tokens[2]);
        route.source_airport_id = utils::safe_stoi(tokens[3]);
        route.dest_airport_iata = utils::trim(tokens[4]);
        route.dest_airport_id = utils::safe_stoi(tokens[5]);
        route.codeshare = utils::trim(tokens[6]);
        route.stops = utils::safe_stoi(tokens[7]);
        route.equipment = tokens.size() > 8 ? utils::trim(tokens[8]) : "";

        routes.push_back(route);
    }

    file.close();
    std::cout << "Loaded " << routes.size() << " routes" << std::endl;
    return routes;
}