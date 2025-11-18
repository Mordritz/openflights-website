#include "airport_handler.hpp"

void AirportHandler::register_routes(crow::App<crow::CORSHandler>& app, DataStore& store) {
    // 1.2 Get airport by IATA
    CROW_ROUTE(app, "/api/airports/<string>")
    ([&store](const std::string& iata) {
        auto airport = store.get_airport_by_iata(iata);
        if (airport) {
            return crow::response(200, airport->to_json());
        }
        return crow::response(404, "Airport not found");
    });

    // 2.1b Get airlines by airport routes
    CROW_ROUTE(app, "/api/airports/<string>/airlines")
    ([&store](const std::string& iata) {
        auto results = store.get_airlines_by_airport_routes(iata);
        
        auto airport = store.get_airport_by_iata(iata);
        if (!airport) {
            return crow::response(404, "Airport not found");
        }

        crow::json::wvalue json;
        json["airport_name"] = airport->name;
        json["airport_iata"] = airport->iata;
        
        std::vector<crow::json::wvalue> airlines_json;
        for (const auto& result : results) {
            crow::json::wvalue item;
            item["airline"] = result.airline.to_json();
            item["route_count"] = result.route_count;
            airlines_json.push_back(std::move(item));
        }
        json["airlines"] = std::move(airlines_json);
        json["total_airlines"] = results.size();

        return crow::response(200, json);
    });

    // 2.2b Get all airports sorted by IATA
    CROW_ROUTE(app, "/api/airports")
    ([&store]() {
        auto airports = store.get_all_airports_sorted_by_iata();
        
        crow::json::wvalue json;
        std::vector<crow::json::wvalue> airports_json;
        for (const auto& airport : airports) {
            airports_json.push_back(airport.to_json());
        }
        json["airports"] = std::move(airports_json);
        json["total"] = airports.size();

        return crow::response(200, json);
    });

    // 3. Insert airport
    CROW_ROUTE(app, "/api/airports").methods(crow::HTTPMethod::POST)
    ([&store](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) {
            return crow::response(400, "Invalid JSON");
        }

        Airport airport;
        airport.id = body["id"].i();
        airport.name = body["name"].s();
        airport.city = body["city"].s();
        airport.country = body["country"].s();
        airport.iata = body["iata"].s();
        airport.icao = body.has("icao") ? std::string(body["icao"].s()) : "";
        airport.latitude = body["latitude"].d();
        airport.longitude = body["longitude"].d();
        airport.altitude = body.has("altitude") ? body["altitude"].i() : 0;
        airport.timezone = body.has("timezone") ? body["timezone"].d() : 0.0;
        airport.dst = body.has("dst") ? std::string(body["dst"].s()) : "U";
        airport.tz_database = body.has("tz_database") ? std::string(body["tz_database"].s()) : "";
        airport.type = body.has("type") ? std::string(body["type"].s()) : "airport";
        airport.source = body.has("source") ? std::string(body["source"].s()) : "User";

        if (store.insert_airport(airport)) {
            return crow::response(201, airport.to_json());
        }
        return crow::response(409, "Airport ID already exists");
    });

    // 3. Delete airport
    CROW_ROUTE(app, "/api/airports/<int>").methods(crow::HTTPMethod::DELETE)
    ([&store](int id) {
        if (store.remove_airport(id)) {
            return crow::response(200, "Airport removed successfully");
        }
        return crow::response(404, "Airport not found");
    });

    // 3. Modify airport
    CROW_ROUTE(app, "/api/airports/<int>").methods(crow::HTTPMethod::PATCH)
    ([&store](const crow::request& req, int id) {
        auto body = crow::json::load(req.body);
        if (!body) {
            return crow::response(400, "Invalid JSON");
        }

        if (store.modify_airport(id, body)) {
            auto airport = store.get_airport_by_id(id);
            return crow::response(200, airport->to_json());
        }
        return crow::response(404, "Airport not found");
    });

    // 4. One-hop routes
    CROW_ROUTE(app, "/api/routes/one-hop")
    ([&store](const crow::request& req) {
        auto source = req.url_params.get("source");
        auto dest = req.url_params.get("dest");
        
        if (!source || !dest) {
            return crow::response(400, "Missing source or dest parameter");
        }

        auto results = store.find_one_hop_routes(source, dest);
        
        crow::json::wvalue json;
        json["source"] = source;
        json["destination"] = dest;
        
        std::vector<crow::json::wvalue> routes_json;
        for (const auto& one_hop : results) {
            crow::json::wvalue route_data;
            route_data["first_leg"] = one_hop.first_leg.to_json();
            route_data["second_leg"] = one_hop.second_leg.to_json();
            route_data["intermediate_airport"] = one_hop.intermediate_airport_iata;
            route_data["total_distance_miles"] = one_hop.total_distance_miles;
            routes_json.push_back(std::move(route_data));
        }
        json["routes"] = std::move(routes_json);
        json["total_routes"] = results.size();

        return crow::response(200, json);
    });
}