#include "route_handler.hpp"

void RouteHandler::register_routes(crow::App<crow::CORSHandler>& app, DataStore& store) {
    // 2.3 Get system ID
    CROW_ROUTE(app, "/api/system/id")
    ([&store]() {
        auto [id, name] = store.get_system_id();
        crow::json::wvalue json;
        json["id"] = id;
        json["name"] = name;
        return crow::response(200, json);
    });

    // 3. Insert route
    CROW_ROUTE(app, "/api/routes").methods(crow::HTTPMethod::POST)
    ([&store](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body) {
            return crow::response(400, "Invalid JSON");
        }

        Route route;
        route.airline_iata = body.has("airline_iata") ? std::string(body["airline_iata"].s()) : "";
        route.airline_id = body["airline_id"].i();
        route.source_airport_iata = body.has("source_airport_iata") ? std::string(body["source_airport_iata"].s()) : "";
        route.source_airport_id = body["source_airport_id"].i();
        route.dest_airport_iata = body.has("dest_airport_iata") ? std::string(body["dest_airport_iata"].s()) : "";
        route.dest_airport_id = body["dest_airport_id"].i();
        route.codeshare = body.has("codeshare") ? std::string(body["codeshare"].s()) : "";
        route.stops = body.has("stops") ? body["stops"].i() : 0;
        route.equipment = body.has("equipment") ? std::string(body["equipment"].s()) : "";

        if (store.insert_route(route)) {
            return crow::response(201, route.to_json());
        }
        return crow::response(409, "Route already exists or invalid IDs");
    });

    // 3. Delete route
    CROW_ROUTE(app, "/api/routes/<int>/<int>/<int>").methods(crow::HTTPMethod::DELETE)
    ([&store](int airline_id, int source_id, int dest_id) {
        if (store.remove_route(airline_id, source_id, dest_id)) {
            return crow::response(200, "Route removed successfully");
        }
        return crow::response(404, "Route not found");
    });

    // 3. Modify route
    CROW_ROUTE(app, "/api/routes/<int>/<int>/<int>").methods(crow::HTTPMethod::PATCH)
    ([&store](const crow::request& req, int airline_id, int source_id, int dest_id) {
        auto body = crow::json::load(req.body);
        if (!body) {
            return crow::response(400, "Invalid JSON");
        }

        if (store.modify_route(airline_id, source_id, dest_id, body)) {
            return crow::response(200, "Route modified successfully");
        }
        return crow::response(404, "Route not found or invalid update");
    });

    // Stats endpoint
    CROW_ROUTE(app, "/api/stats")
    ([&store]() {
        crow::json::wvalue json;
        json["airports"] = store.get_airport_count();
        json["airlines"] = store.get_airline_count();
        json["routes"] = store.get_route_count();
        return crow::response(200, json);
    });
}