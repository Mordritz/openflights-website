#include "server.hpp"
#include <iostream>
#include <string>

int main(int argc, char* argv[]) {
    std::string data_dir = "data";
    int port = 8080;

    // Parse command line arguments
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--data-dir" && i + 1 < argc) {
            data_dir = argv[++i];
        } else if (arg == "--port" && i + 1 < argc) {
            port = std::stoi(argv[++i]);
        } else if (arg == "--help" || arg == "-h") {
            std::cout << "Usage: " << argv[0] << " [options]\n"
                      << "Options:\n"
                      << "  --data-dir <path>  Path to data directory (default: data)\n"
                      << "  --port <number>    Port to listen on (default: 8080)\n"
                      << "  --help, -h         Show this help message\n";
            return 0;
        }
    }

    Server server;
    
    if (!server.initialize(data_dir)) {
        std::cerr << "Failed to initialize server" << std::endl;
        return 1;
    }

    try {
        server.run(port);
    } catch (const std::exception& e) {
        std::cerr << "Server error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}