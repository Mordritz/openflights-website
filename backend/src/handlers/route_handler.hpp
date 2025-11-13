#pragma once
#include "crow.h"
#include "crow/middlewares/cors.h"
#include "../database/data_store.hpp"

class RouteHandler {
public:
    static void register_routes(crow::App<crow::CORSHandler>& app, DataStore& store);
};