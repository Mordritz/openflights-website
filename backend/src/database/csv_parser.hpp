#pragma once
#include "../models/airport.hpp"
#include "../models/airline.hpp"
#include "../models/route.hpp"
#include <vector>
#include <string>

class CSVParser {
public:
    static std::vector<Airport> parse_airports(const std::string& filepath);
    static std::vector<Airline> parse_airlines(const std::string& filepath);
    static std::vector<Route> parse_routes(const std::string& filepath);
};