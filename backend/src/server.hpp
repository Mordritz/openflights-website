#pragma once
#include "crow.h"
#include "crow/middlewares/cors.h"
#include "database/data_store.hpp"

class Server {
public:
    Server();
    bool initialize(const std::string& data_dir);
    void run(int port = 8080);

private:
    crow::App<crow::CORSHandler> app_;
    DataStore store_;
};