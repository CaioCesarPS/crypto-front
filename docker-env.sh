#!/bin/bash

# Quick script to export environment variables and build/run Docker

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_error ".env.local file not found!"
    echo "Please create it with:"
    echo "  cp .env.example .env.local"
    exit 1
fi

print_success ".env.local found"

# Load and export environment variables
print_info "Loading environment variables..."
set -a
source .env.local
set +a

# Verify critical variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    print_error "NEXT_PUBLIC_SUPABASE_URL is not set in .env.local"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    print_error "NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local"
    exit 1
fi

print_success "Environment variables loaded:"
echo "  NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}"
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."

# Execute docker-compose command
case "${1:-up}" in
    build)
        print_info "Building Docker image..."
        docker-compose build --no-cache
        print_success "Build completed!"
        ;;
    up)
        print_info "Starting Docker containers..."
        docker-compose up
        ;;
    up-d)
        print_info "Starting Docker containers in background..."
        docker-compose up -d
        print_success "Containers started!"
        echo "View logs with: docker-compose logs -f"
        ;;
    down)
        print_info "Stopping Docker containers..."
        docker-compose down
        print_success "Containers stopped!"
        ;;
    restart)
        print_info "Restarting Docker containers..."
        docker-compose down
        docker-compose up -d
        print_success "Containers restarted!"
        ;;
    rebuild)
        print_info "Rebuilding and restarting..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        print_success "Rebuild completed!"
        echo "View logs with: docker-compose logs -f"
        ;;
    logs)
        docker-compose logs -f
        ;;
    *)
        echo "Usage: $0 {build|up|up-d|down|restart|rebuild|logs}"
        echo ""
        echo "Commands:"
        echo "  build    - Build Docker image with environment variables"
        echo "  up       - Start containers (foreground)"
        echo "  up-d     - Start containers (background)"
        echo "  down     - Stop containers"
        echo "  restart  - Restart containers"
        echo "  rebuild  - Rebuild and restart everything"
        echo "  logs     - View container logs"
        exit 1
        ;;
esac
