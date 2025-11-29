# Stage 1: Build environment
FROM gcc:12 AS builder

# Install CMake and build dependencies
RUN apt-get update && apt-get install -y \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy CMake configuration files
COPY CMakeLists.txt ./
COPY backend/CMakeLists.txt ./backend/

# Copy source code
COPY backend/src ./backend/src

# Copy data files
COPY data ./data

# Create build directory and build the application
RUN cmake -B build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build build --config Release -j$(nproc)

# Stage 2: Runtime environment
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libstdc++6 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -u 1001 appuser

# Set working directory
WORKDIR /app

# Copy built executable and data from builder stage
COPY --from=builder /app/build/bin/flight_server ./flight_server
COPY --from=builder /app/build/bin/data ./data

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port (Backend infra will override with PORT env var)
EXPOSE 8080

# Run the server
# Backend infra sets PORT env var, default to 8080 if not set
CMD sh -c './flight_server --port ${PORT:-8080} --data-dir data'
