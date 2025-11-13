#include "server.hpp"
#include "handlers/airline_handler.hpp"
#include "handlers/airport_handler.hpp"
#include "handlers/route_handler.hpp"
#include <iostream>

Server::Server() : app_() {}

bool Server::initialize(const std::string& data_dir) {
    std::string airports_path = data_dir + "/airports.csv";
    std::string airlines_path = data_dir + "/airlines.csv";
    std::string routes_path = data_dir + "/routes.csv";

    std::cout << "Loading data from: " << data_dir << std::endl;
    
    if (!store_.load_data(airports_path, airlines_path, routes_path)) {
        std::cerr << "Failed to load data files" << std::endl;
        return false;
    }

    // Enable CORS for frontend development
    auto& cors = app_.get_middleware<crow::CORSHandler>();
    cors.global()
        .origin("*")
        .methods("GET"_method, "POST"_method, "PATCH"_method, "DELETE"_method, "OPTIONS"_method)
        .headers("Content-Type", "Accept");

    // Register all route handlers
    AirlineHandler::register_routes(app_, store_);
    AirportHandler::register_routes(app_, store_);
    RouteHandler::register_routes(app_, store_);

    // Health check endpoint
    CROW_ROUTE(app_, "/api/health")
    ([]() {
        crow::json::wvalue json;
        json["status"] = "healthy";
        json["service"] = "Flight Data System";
        return crow::response(200, json);
    });

    std::cout << "Server initialized successfully" << std::endl;
    return true;
}

void Server::run(int port) {
    std::cout << "Starting server on port " << port << std::endl;
    std::cout << "API Documentation:" << std::endl;
    std::cout << "  GET    /api/airlines/<iata>                - Get airline by IATA" << std::endl;
    std::cout << "  GET    /api/airlines/<iata>/airports       - Get airports served by airline" << std::endl;
    std::cout << "  GET    /api/airlines                       - Get all airlines sorted by IATA" << std::endl;
    std::cout << "  GET    /api/airports/<iata>                - Get airport by IATA" << std::endl;
    std::cout << "  GET    /api/airports/<iata>/airlines       - Get airlines serving airport" << std::endl;
    std::cout << "  GET    /api/airports                       - Get all airports sorted by IATA" << std::endl;
    std::cout << "  GET    /api/routes/one-hop?source=X&dest=Y - Find one-hop routes" << std::endl;
    std::cout << "  GET    /api/system/id                      - Get system ID" << std::endl;
    std::cout << "  GET    /api/stats                          - Get database statistics" << std::endl;
    std::cout << "  POST   /api/airlines                       - Insert airline" << std::endl;
    std::cout << "  POST   /api/airports                       - Insert airport" << std::endl;
    std::cout << "  POST   /api/routes                         - Insert route" << std::endl;
    std::cout << "  PATCH  /api/airlines/<id>                  - Modify airline" << std::endl;
    std::cout << "  PATCH  /api/airports/<id>                  - Modify airport" << std::endl;
    std::cout << "  PATCH  /api/routes/<aid>/<sid>/<did>       - Modify route" << std::endl;
    std::cout << "  DELETE /api/airlines/<id>                  - Delete airline" << std::endl;
    std::cout << "  DELETE /api/airports/<id>                  - Delete airport" << std::endl;
    std::cout << "  DELETE /api/routes/<aid>/<sid>/<did>       - Delete route" << std::endl;
    std::cout << std::endl;
    
    app_.port(port).multithreaded().run();
}