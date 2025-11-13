#include "data_store.hpp"
#include "csv_parser.hpp"
#include "../utils/string_utils.hpp"
#include <algorithm>
#include <cmath>
#include <iostream>

DataStore::DataStore() {}

bool DataStore::load_data(const std::string& airports_path, 
                          const std::string& airlines_path, 
                          const std::string& routes_path) {
    // Load airports
    auto airports = CSVParser::parse_airports(airports_path);
    for (const auto& airport : airports) {
        airports_by_id_[airport.id] = airport;
        if (!airport.iata.empty() && !utils::is_null(airport.iata)) {
            airport_iata_to_id_[utils::to_upper(airport.iata)] = airport.id;
        }
    }

    // Load airlines
    auto airlines = CSVParser::parse_airlines(airlines_path);
    for (const auto& airline : airlines) {
        airlines_by_id_[airline.id] = airline;
        if (!airline.iata.empty() && !utils::is_null(airline.iata)) {
            airline_iata_to_id_[utils::to_upper(airline.iata)] = airline.id;
        }
    }

    // Load routes
    routes_ = CSVParser::parse_routes(routes_path);
    rebuild_route_indexes();

    std::cout << "Data loading complete: " 
              << airports_by_id_.size() << " airports, "
              << airlines_by_id_.size() << " airlines, "
              << routes_.size() << " routes" << std::endl;

    return !airports_by_id_.empty() && !airlines_by_id_.empty();
}

void DataStore::rebuild_route_indexes() {
    routes_from_airport_.clear();
    routes_to_airport_.clear();
    routes_by_airline_.clear();

    for (size_t i = 0; i < routes_.size(); ++i) {
        const auto& route = routes_[i];
        routes_from_airport_[route.source_airport_id].push_back(i);
        routes_to_airport_[route.dest_airport_id].push_back(i);
        routes_by_airline_[route.airline_id].push_back(i);
    }
}

// 1. Individual Entity Retrieval
std::optional<Airline> DataStore::get_airline_by_iata(const std::string& iata) const {
    auto upper_iata = utils::to_upper(iata);
    auto it = airline_iata_to_id_.find(upper_iata);
    if (it != airline_iata_to_id_.end()) {
        return get_airline_by_id(it->second);
    }
    return std::nullopt;
}

std::optional<Airport> DataStore::get_airport_by_iata(const std::string& iata) const {
    auto upper_iata = utils::to_upper(iata);
    auto it = airport_iata_to_id_.find(upper_iata);
    if (it != airport_iata_to_id_.end()) {
        return get_airport_by_id(it->second);
    }
    return std::nullopt;
}

std::optional<Airline> DataStore::get_airline_by_id(int id) const {
    auto it = airlines_by_id_.find(id);
    if (it != airlines_by_id_.end()) {
        return it->second;
    }
    return std::nullopt;
}

std::optional<Airport> DataStore::get_airport_by_id(int id) const {
    auto it = airports_by_id_.find(id);
    if (it != airports_by_id_.end()) {
        return it->second;
    }
    return std::nullopt;
}

// 2.1a Get airports reached by airline, ordered by route count
std::vector<AirportRouteCount> DataStore::get_airports_by_airline_routes(
    const std::string& airline_iata) const {
    
    auto airline_opt = get_airline_by_iata(airline_iata);
    if (!airline_opt) {
        return {};
    }

    int airline_id = airline_opt->id;
    
    // Count routes per airport for this airline
    std::unordered_map<int, int> airport_route_counts;
    
    auto it = routes_by_airline_.find(airline_id);
    if (it != routes_by_airline_.end()) {
        for (size_t route_idx : it->second) {
            const auto& route = routes_[route_idx];
            airport_route_counts[route.source_airport_id]++;
            airport_route_counts[route.dest_airport_id]++;
        }
    }

    // Build result vector
    std::vector<AirportRouteCount> results;
    for (const auto& [airport_id, count] : airport_route_counts) {
        auto airport_opt = get_airport_by_id(airport_id);
        if (airport_opt) {
            results.push_back({*airport_opt, count});
        }
    }

    // Sort by route count (descending)
    std::sort(results.begin(), results.end(), 
              [](const AirportRouteCount& a, const AirportRouteCount& b) {
                  return a.route_count > b.route_count;
              });

    return results;
}

// 2.1b Get airlines serving airport, ordered by route count
std::vector<AirlineRouteCount> DataStore::get_airlines_by_airport_routes(
    const std::string& airport_iata) const {
    
    auto airport_opt = get_airport_by_iata(airport_iata);
    if (!airport_opt) {
        return {};
    }

    int airport_id = airport_opt->id;
    
    // Count routes per airline for this airport
    std::unordered_map<int, int> airline_route_counts;
    
    // Check routes from this airport
    auto from_it = routes_from_airport_.find(airport_id);
    if (from_it != routes_from_airport_.end()) {
        for (size_t route_idx : from_it->second) {
            airline_route_counts[routes_[route_idx].airline_id]++;
        }
    }

    // Check routes to this airport
    auto to_it = routes_to_airport_.find(airport_id);
    if (to_it != routes_to_airport_.end()) {
        for (size_t route_idx : to_it->second) {
            airline_route_counts[routes_[route_idx].airline_id]++;
        }
    }

    // Build result vector
    std::vector<AirlineRouteCount> results;
    for (const auto& [airline_id, count] : airline_route_counts) {
        auto airline_opt = get_airline_by_id(airline_id);
        if (airline_opt) {
            results.push_back({*airline_opt, count});
        }
    }

    // Sort by route count (descending)
    std::sort(results.begin(), results.end(), 
              [](const AirlineRouteCount& a, const AirlineRouteCount& b) {
                  return a.route_count > b.route_count;
              });

    return results;
}

// 2.2 Get all airlines/airports sorted by IATA
std::vector<Airline> DataStore::get_all_airlines_sorted_by_iata() const {
    std::vector<Airline> airlines;
    for (const auto& [id, airline] : airlines_by_id_) {
        if (!airline.iata.empty() && !utils::is_null(airline.iata)) {
            airlines.push_back(airline);
        }
    }
    
    std::sort(airlines.begin(), airlines.end(), 
              [](const Airline& a, const Airline& b) {
                  return a.iata < b.iata;
              });
    
    return airlines;
}

std::vector<Airport> DataStore::get_all_airports_sorted_by_iata() const {
    std::vector<Airport> airports;
    for (const auto& [id, airport] : airports_by_id_) {
        if (!airport.iata.empty() && !utils::is_null(airport.iata)) {
            airports.push_back(airport);
        }
    }
    
    std::sort(airports.begin(), airports.end(), 
              [](const Airport& a, const Airport& b) {
                  return a.iata < b.iata;
              });
    
    return airports;
}

// 2.3 Get system ID
std::pair<int, std::string> DataStore::get_system_id() const {
    return {12345, "Flight Data System v1.0"};
}

// 3. Insert operations
bool DataStore::insert_airport(const Airport& airport) {
    if (airports_by_id_.find(airport.id) != airports_by_id_.end()) {
        return false; // ID already exists
    }
    
    airports_by_id_[airport.id] = airport;
    if (!airport.iata.empty() && !utils::is_null(airport.iata)) {
        airport_iata_to_id_[utils::to_upper(airport.iata)] = airport.id;
    }
    return true;
}

bool DataStore::insert_airline(const Airline& airline) {
    if (airlines_by_id_.find(airline.id) != airlines_by_id_.end()) {
        return false; // ID already exists
    }
    
    airlines_by_id_[airline.id] = airline;
    if (!airline.iata.empty() && !utils::is_null(airline.iata)) {
        airline_iata_to_id_[utils::to_upper(airline.iata)] = airline.id;
    }
    return true;
}

bool DataStore::insert_route(const Route& route) {
    // Check if airline and airports exist
    if (airlines_by_id_.find(route.airline_id) == airlines_by_id_.end() ||
        airports_by_id_.find(route.source_airport_id) == airports_by_id_.end() ||
        airports_by_id_.find(route.dest_airport_id) == airports_by_id_.end()) {
        return false;
    }

    // Check for duplicate route
    std::string key = route.get_key();
    for (const auto& existing_route : routes_) {
        if (existing_route.get_key() == key) {
            return false; // Route already exists
        }
    }

    routes_.push_back(route);
    rebuild_route_indexes();
    return true;
}

// 3. Remove operations
bool DataStore::remove_airport(int airport_id) {
    auto it = airports_by_id_.find(airport_id);
    if (it == airports_by_id_.end()) {
        return false;
    }

    // Remove from IATA index
    const auto& iata = it->second.iata;
    if (!iata.empty()) {
        airport_iata_to_id_.erase(utils::to_upper(iata));
    }

    // Remove airport
    airports_by_id_.erase(it);

    // Remove all routes involving this airport
    routes_.erase(
        std::remove_if(routes_.begin(), routes_.end(),
                      [airport_id](const Route& r) {
                          return r.source_airport_id == airport_id || 
                                 r.dest_airport_id == airport_id;
                      }),
        routes_.end()
    );

    rebuild_route_indexes();
    return true;
}

bool DataStore::remove_airline(int airline_id) {
    auto it = airlines_by_id_.find(airline_id);
    if (it == airlines_by_id_.end()) {
        return false;
    }

    // Remove from IATA index
    const auto& iata = it->second.iata;
    if (!iata.empty()) {
        airline_iata_to_id_.erase(utils::to_upper(iata));
    }

    // Remove airline
    airlines_by_id_.erase(it);

    // Remove all routes for this airline
    routes_.erase(
        std::remove_if(routes_.begin(), routes_.end(),
                      [airline_id](const Route& r) {
                          return r.airline_id == airline_id;
                      }),
        routes_.end()
    );

    rebuild_route_indexes();
    return true;
}

bool DataStore::remove_route(int airline_id, int source_airport_id, int dest_airport_id) {
    std::string key = std::to_string(airline_id) + "_" + 
                     std::to_string(source_airport_id) + "_" + 
                     std::to_string(dest_airport_id);

    auto it = std::find_if(routes_.begin(), routes_.end(),
                          [&key](const Route& r) { return r.get_key() == key; });

    if (it == routes_.end()) {
        return false;
    }

    routes_.erase(it);
    rebuild_route_indexes();
    return true;
}

// 3. Modify operations
bool DataStore::modify_airport(int airport_id, const crow::json::rvalue& updates) {
    auto it = airports_by_id_.find(airport_id);
    if (it == airports_by_id_.end()) {
        return false;
    }

    Airport& airport = it->second;
    
    // Update fields if present
    if (updates.has("name")) airport.name = updates["name"].s();
    if (updates.has("city")) airport.city = updates["city"].s();
    if (updates.has("country")) airport.country = updates["country"].s();
    if (updates.has("latitude")) airport.latitude = updates["latitude"].d();
    if (updates.has("longitude")) airport.longitude = updates["longitude"].d();
    if (updates.has("altitude")) airport.altitude = updates["altitude"].i();
    if (updates.has("timezone")) airport.timezone = updates["timezone"].d();
    
    // IATA change requires index update
    if (updates.has("iata")) {
        std::string old_iata = utils::to_upper(airport.iata);
        std::string new_iata = utils::to_upper(std::string(updates["iata"].s()));
        
        airport_iata_to_id_.erase(old_iata);
        airport.iata = new_iata;
        if (!new_iata.empty()) {
            airport_iata_to_id_[new_iata] = airport_id;
        }
    }

    return true;
}

bool DataStore::modify_airline(int airline_id, const crow::json::rvalue& updates) {
    auto it = airlines_by_id_.find(airline_id);
    if (it == airlines_by_id_.end()) {
        return false;
    }

    Airline& airline = it->second;
    
    if (updates.has("name")) airline.name = updates["name"].s();
    if (updates.has("alias")) airline.alias = updates["alias"].s();
    if (updates.has("icao")) airline.icao = updates["icao"].s();
    if (updates.has("callsign")) airline.callsign = updates["callsign"].s();
    if (updates.has("country")) airline.country = updates["country"].s();
    if (updates.has("active")) airline.active = updates["active"].s();
    
    // IATA change requires index update
    if (updates.has("iata")) {
        std::string old_iata = utils::to_upper(airline.iata);
        std::string new_iata = utils::to_upper(std::string(updates["iata"].s()));
        
        airline_iata_to_id_.erase(old_iata);
        airline.iata = new_iata;
        if (!new_iata.empty()) {
            airline_iata_to_id_[new_iata] = airline_id;
        }
    }

    return true;
}

bool DataStore::modify_route(int airline_id, int source_airport_id, int dest_airport_id,
                             const crow::json::rvalue& updates) {
    std::string key = std::to_string(airline_id) + "_" + 
                     std::to_string(source_airport_id) + "_" + 
                     std::to_string(dest_airport_id);

    auto it = std::find_if(routes_.begin(), routes_.end(),
                          [&key](const Route& r) { return r.get_key() == key; });

    if (it == routes_.end()) {
        return false;
    }

    Route& route = *it;
    
    if (updates.has("codeshare")) route.codeshare = updates["codeshare"].s();
    if (updates.has("stops")) route.stops = updates["stops"].i();
    if (updates.has("equipment")) route.equipment = updates["equipment"].s();

    // ID changes require validation
    bool ids_changed = false;
    int new_airline_id = route.airline_id;
    int new_source_id = route.source_airport_id;
    int new_dest_id = route.dest_airport_id;

    if (updates.has("airline_id")) {
        new_airline_id = updates["airline_id"].i();
        if (airlines_by_id_.find(new_airline_id) == airlines_by_id_.end()) {
            return false;
        }
        ids_changed = true;
    }

    if (updates.has("source_airport_id")) {
        new_source_id = updates["source_airport_id"].i();
        if (airports_by_id_.find(new_source_id) == airports_by_id_.end()) {
            return false;
        }
        ids_changed = true;
    }

    if (updates.has("dest_airport_id")) {
        new_dest_id = updates["dest_airport_id"].i();
        if (airports_by_id_.find(new_dest_id) == airports_by_id_.end()) {
            return false;
        }
        ids_changed = true;
    }

    if (ids_changed) {
        route.airline_id = new_airline_id;
        route.source_airport_id = new_source_id;
        route.dest_airport_id = new_dest_id;
        rebuild_route_indexes();
    }

    return true;
}

// 4. One-hop route finding
std::vector<OneHopRoute> DataStore::find_one_hop_routes(
    const std::string& source_iata, 
    const std::string& dest_iata) const {
    
    auto source_opt = get_airport_by_iata(source_iata);
    auto dest_opt = get_airport_by_iata(dest_iata);
    
    if (!source_opt || !dest_opt) {
        return {};
    }

    int source_id = source_opt->id;
    int dest_id = dest_opt->id;

    std::vector<OneHopRoute> results;

    // Find all routes from source
    auto from_source_it = routes_from_airport_.find(source_id);
    if (from_source_it == routes_from_airport_.end()) {
        return {};
    }

    // For each intermediate airport reachable from source
    for (size_t first_leg_idx : from_source_it->second) {
        const Route& first_leg = routes_[first_leg_idx];
        
        // Only consider 0-stop routes
        if (first_leg.stops != 0) continue;

        int intermediate_id = first_leg.dest_airport_id;
        
        // Skip if intermediate is the destination (direct flight)
        if (intermediate_id == dest_id) continue;

        // Find routes from intermediate to destination
        auto from_intermediate_it = routes_from_airport_.find(intermediate_id);
        if (from_intermediate_it == routes_from_airport_.end()) continue;

        for (size_t second_leg_idx : from_intermediate_it->second) {
            const Route& second_leg = routes_[second_leg_idx];
            
            // Check if this goes to our destination with 0 stops
            if (second_leg.dest_airport_id == dest_id && second_leg.stops == 0) {
                auto intermediate_airport = get_airport_by_id(intermediate_id);
                if (!intermediate_airport) continue;

                // Calculate total distance
                double leg1_distance = calculate_distance_miles(*source_opt, *intermediate_airport);
                double leg2_distance = calculate_distance_miles(*intermediate_airport, *dest_opt);
                double total_distance = leg1_distance + leg2_distance;

                OneHopRoute one_hop;
                one_hop.first_leg = first_leg;
                one_hop.second_leg = second_leg;
                one_hop.total_distance_miles = total_distance;
                one_hop.intermediate_airport_iata = intermediate_airport->iata;

                results.push_back(one_hop);
            }
        }
    }

    // Sort by total distance (ascending)
    std::sort(results.begin(), results.end(),
              [](const OneHopRoute& a, const OneHopRoute& b) {
                  return a.total_distance_miles < b.total_distance_miles;
              });

    return results;
}

// Distance calculation using Haversine formula
double DataStore::calculate_distance_miles(const Airport& a1, const Airport& a2) const {
    return haversine_distance(a1.latitude, a1.longitude, a2.latitude, a2.longitude);
}

double DataStore::haversine_distance(double lat1, double lon1, double lat2, double lon2) const {
    const double R = 3958.8; // Earth radius in miles
    
    double dLat = (lat2 - lat1) * M_PI / 180.0;
    double dLon = (lon2 - lon1) * M_PI / 180.0;
    
    lat1 = lat1 * M_PI / 180.0;
    lat2 = lat2 * M_PI / 180.0;
    
    double a = std::sin(dLat / 2) * std::sin(dLat / 2) +
               std::sin(dLon / 2) * std::sin(dLon / 2) * std::cos(lat1) * std::cos(lat2);
    double c = 2 * std::atan2(std::sqrt(a), std::sqrt(1 - a));
    
    return R * c;
}