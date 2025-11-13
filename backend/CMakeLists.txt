cmake_minimum_required(VERSION 3.16)
project(flight_server LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

include(FetchContent)

# -------------------------
# 1. Fetch standalone Asio
# -------------------------
FetchContent_Declare(
    asio
    GIT_REPOSITORY https://github.com/chriskohlhoff/asio.git
    GIT_TAG asio-1-28-0
)
FetchContent_MakeAvailable(asio)
set(ASIO_INCLUDE_DIR "${asio_SOURCE_DIR}/asio/include")

# -------------------------
# 2. Fetch Crow
# -------------------------
# Make Crow use standalone Asio, not Boost
set(CROW_USE_ASIO ON CACHE BOOL "" FORCE)
set(CROW_USE_BOOST OFF CACHE BOOL "" FORCE)

FetchContent_Declare(
    crow
    GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
    GIT_TAG v1.3
)
FetchContent_MakeAvailable(crow)

# -------------------------
# 3. Source files
# -------------------------
set(SOURCES
    src/main.cpp
    src/server.cpp
    src/database/data_store.cpp
    src/database/csv_parser.cpp
    src/handlers/airport_handler.cpp
    src/handlers/airline_handler.cpp
    src/handlers/route_handler.cpp
)

# -------------------------
# 4. Create executable
# -------------------------
add_executable(flight_server ${SOURCES})

# -------------------------
# 5. Include directories
# -------------------------
target_include_directories(flight_server PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${ASIO_INCLUDE_DIR}        # <-- standalone Asio headers
    ${crow_SOURCE_DIR}/include # <-- Crow headers
)

# -------------------------
# 6. Compile definitions
# -------------------------
target_compile_definitions(flight_server PRIVATE
    CROW_USE_ASIO
)

# -------------------------
# 7. Link libraries
# -------------------------
target_link_libraries(flight_server PRIVATE
    Crow::Crow
    pthread
)

# -------------------------
# 8. Output directory
# -------------------------
set_target_properties(flight_server PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)

# -------------------------
# 9. Copy data directory
# -------------------------
add_custom_command(TARGET flight_server POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/data
    ${CMAKE_BINARY_DIR}/bin/data
    COMMENT "Copying data files to build directory"
)

message(STATUS "Backend configured successfully (Crow + standalone Asio)")
