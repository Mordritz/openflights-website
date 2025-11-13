#pragma once
#include "../models/airport.hpp"
#include "../models/airline.hpp"
#include "../models/route.hpp"
#include <unordered_map>
#include <map>
#include <vector>
#include <string>
#include <optional>
#include <memory>

// Structure for one-hop route results
struct OneHopRoute {
    Route first_leg;
    Route second_leg;
    double total_distance_miles;
    std::string intermediate_airport_iata;
};

// Result structures for reports
struct AirportRouteCount {
    Airport airport;
    int route_count;
};

struct AirlineRouteCount {
    Airline airline;
    int route_count;
};

class DataStore {
public:
    DataStore();
    
    // Load data from CSV files
    bool load_data(const std::string& airports_path, 
                   const std::string& airlines_path, 
                   const std::string& routes_path);

    // 1. Individual Entity Retrieval
    std::optional<Airline> get_airline_by_iata(const std::string& iata) const;
    std::optional<Airport> get_airport_by_iata(const std::string& iata) const;
    
    // Helper methods for ID-based retrieval
    std::optional<Airline> get_airline_by_id(int id) const;
    std::optional<Airport> get_airport_by_id(int id) const;

    // 2.1 Reports Ordered by # Routes
    std::vector<AirportRouteCount> get_airports_by_airline_routes(const std::string& airline_iata) const;
    std::vector<AirlineRouteCount> get_airlines_by_airport_routes(const std::string& airport_iata) const;

    // 2.2 Reports Ordered by IATA Codes
    std::vector<Airline> get_all_airlines_sorted_by_iata() const;
    std::vector<Airport> get_all_airports_sorted_by_iata() const;

    // 2.3 Get ID (hard-coded system info)
    std::pair<int, std::string> get_system_id() const;

    // 3. Update Operations
    bool insert_airport(const Airport& airport);
    bool insert_airline(const Airline& airline);
    bool insert_route(const Route& route);
    
    bool remove_airport(int airport_id);
    bool remove_airline(int airline_id);
    bool remove_route(int airline_id, int source_airport_id, int dest_airport_id);
    
    bool modify_airport(int airport_id, const crow::json::rvalue& updates);
    bool modify_airline(int airline_id, const crow::json::rvalue& updates);
    bool modify_route(int airline_id, int source_airport_id, int dest_airport_id, 
                      const crow::json::rvalue& updates);

    // 4. One-hop Report
    std::vector<OneHopRoute> find_one_hop_routes(const std::string& source_iata, 
                                                   const std::string& dest_iata) const;

    // Utility
    size_t get_airport_count() const { return airports_by_id_.size(); }
    size_t get_airline_count() const { return airlines_by_id_.size(); }
    size_t get_route_count() const { return routes_.size(); }

private:
    // Primary storage: ID-based lookups
    std::unordered_map<int, Airport> airports_by_id_;
    std::unordered_map<int, Airline> airlines_by_id_;
    
    // Secondary indexes: IATA-based lookups
    std::unordered_map<std::string, int> airport_iata_to_id_;
    std::unordered_map<std::string, int> airline_iata_to_id_;
    
    // Route storage and indexes
    std::vector<Route> routes_;
    
    // Graph structure: adjacency list for route network
    // airport_id -> vector of routes originating from that airport
    std::unordered_map<int, std::vector<size_t>> routes_from_airport_;
    
    // airport_id -> vector of routes terminating at that airport
    std::unordered_map<int, std::vector<size_t>> routes_to_airport_;
    
    // airline_id -> vector of routes operated by that airline
    std::unordered_map<int, std::vector<size_t>> routes_by_airline_;

    // Helper methods
    void rebuild_route_indexes();
    double calculate_distance_miles(const Airport& a1, const Airport& a2) const;
    double haversine_distance(double lat1, double lon1, double lat2, double lon2) const;
};