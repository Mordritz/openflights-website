#include "airline_handler.hpp"

void AirlineHandler::register_routes(crow::App<crow::CORSHandler>& app, DataStore& store) {
    // 1.1 Get airline by IATA
    CROW_ROUTE(app, "/api/airlines/<string>")
    ([&store](const std::string& iata) {
        auto airline = store.get_airline_by_iata(iata);
        if (airline) {
            return crow::response(200, airline->to_json());
        }
        return crow::response(404, "Airline not found");
    });

    // 2.1a Get airports by airline routes
    CROW_ROUTE(app, "/api/airlines/<string>/airports")
    ([&store](const std::string& iata) {
        auto results = store.get_airports_by_airline_routes(iata);
        
        auto airline = store.get_airline_by_iata(iata);
        if (!airline) {
            return crow::response(404, "Airline not found");
        }

        crow::json::wvalue json;
        json["airline_name"] = airline->name;
        json["airline_iata"] = airline->iata;
        
        std::vector<crow::json::wvalue> airports_json;
        for (const auto& result : results) {
            crow::json::wvalue airport_data = result.airport.to_json();
            airport_data["route_count"] = result.route_count;
            airports_json.push_back(std::move(airport_data));
        }
        json["airports"] = std::move(airports_json);
        json["total_airports"] = results.size();

        return crow::response(200, json);
    });

    // 2.2a Get all airlines sorted by IATA
    CROW_ROUTE(app, "/api/airlines")
    ([&store]() {
        auto airlines = store.get_all_airlines_sorted_by_iata();
        
        crow::json::wvalue json;
        std::vector<crow::json::wvalue> airlines_json;
        for (const auto& airline : airlines) {
            airlines_json.push_back(airline.to_json());
        }
        json["airlines"] = std::move(airlines_json);
        json["total"] = airlines.size();

        return crow::response(200, json);
    });

    // 3. Insert airline
    CROW_ROUTE(app, "/api/airlines").methods(crow::HTTPMethod::POST)
    ([&store](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) {
            return crow::response(400, "Invalid JSON");
        }

        Airline airline;
        airline.id = body["id"].i();
        airline.name = body["name"].s();
        airline.alias = body.has("alias") ? std::string(body["alias"].s()) : "";
        airline.iata = body["iata"].s();
        airline.icao = body.has("icao") ? std::string(body["icao"].s()) : "";
        airline.callsign = body.has("callsign") ? std::string(body["callsign"].s()) : "";
        airline.country = body.has("country") ? std::string(body["country"].s()) : "";
        airline.active = body.has("active") ? std::string(body["active"].s()) : "Y";

        if (store.insert_airline(airline)) {
            return crow::response(201, airline.to_json());
        }
        return crow::response(409, "Airline ID already exists");
    });

    // 3. Delete airline
    CROW_ROUTE(app, "/api/airlines/<int>").methods(crow::HTTPMethod::DELETE)
    ([&store](int id) {
        if (store.remove_airline(id)) {
            return crow::response(200, "Airline removed successfully");
        }
        return crow::response(404, "Airline not found");
    });

    // 3. Modify airline
    CROW_ROUTE(app, "/api/airlines/<int>").methods(crow::HTTPMethod::PATCH)
    ([&store](const crow::request& req, int id) {
        auto body = crow::json::load(req.body);
        if (!body) {
            return crow::response(400, "Invalid JSON");
        }

        if (store.modify_airline(id, body)) {
            auto airline = store.get_airline_by_id(id);
            return crow::response(200, airline->to_json());
        }
        return crow::response(404, "Airline not found");
    });
}