#pragma once
#include <string>
#include <vector>
#include <sstream>
#include <algorithm>
#include <cctype>

namespace utils {

// Trim whitespace from both ends
inline std::string trim(const std::string& str) {
    auto start = str.begin();
    while (start != str.end() && std::isspace(*start)) {
        start++;
    }
    auto end = str.end();
    do {
        end--;
    } while (std::distance(start, end) > 0 && std::isspace(*end));
    return std::string(start, end + 1);
}

// Split string by delimiter
inline std::vector<std::string> split(const std::string& str, char delimiter) {
    std::vector<std::string> tokens;
    std::string token;
    std::istringstream tokenStream(str);
    while (std::getline(tokenStream, token, delimiter)) {
        tokens.push_back(token);
    }
    return tokens;
}

// Convert string to uppercase
inline std::string to_upper(const std::string& str) {
    std::string result = str;
    std::transform(result.begin(), result.end(), result.begin(), ::toupper);
    return result;
}

// Check if string represents null value in OpenFlights data
inline bool is_null(const std::string& str) {
    return str == "\\N" || str.empty();
}

// Safe string to int conversion
inline int safe_stoi(const std::string& str, int default_value = 0) {
    if (is_null(str)) return default_value;
    try {
        return std::stoi(trim(str));
    } catch (...) {
        return default_value;
    }
}

// Safe string to double conversion
inline double safe_stod(const std::string& str, double default_value = 0.0) {
    if (is_null(str)) return default_value;
    try {
        return std::stod(trim(str));
    } catch (...) {
        return default_value;
    }
}

} // namespace utils