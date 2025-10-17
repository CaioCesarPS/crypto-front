#!/bin/bash

# Docker Build and Management Scripts
# Convenience scripts for common Docker operations

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project name
PROJECT_NAME="crypt-front"

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_error ".env file not found!"
        print_info "Copy .env.example to .env and configure your environment variables"
        echo "  cp .env.example .env"
        exit 1
    fi
    print_success ".env file found"
}

# Build production image
build_prod() {
    print_info "Building production image..."
    check_env
    
    docker build \
        --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}" \
        --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
        -t ${PROJECT_NAME}:latest \
        -t ${PROJECT_NAME}:prod \
        .
    
    print_success "Production image built: ${PROJECT_NAME}:latest"
}

# Build development image
build_dev() {
    print_info "Building development image..."
    check_env
    
    docker build \
        -f Dockerfile.dev \
        -t ${PROJECT_NAME}:dev \
        .
    
    print_success "Development image built: ${PROJECT_NAME}:dev"
}

# Start development environment
dev() {
    print_info "Starting development environment..."
    check_env
    
    docker-compose -f docker-compose.dev.yml up
}

# Start development in background
dev_detached() {
    print_info "Starting development environment in background..."
    check_env
    
    docker-compose -f docker-compose.dev.yml up -d
    print_success "Development server started at http://localhost:3000"
    print_info "View logs with: npm run docker:logs:dev"
}

# Start production environment
prod() {
    print_info "Starting production environment..."
    check_env
    
    docker-compose up
}

# Start production in background
prod_detached() {
    print_info "Starting production environment in background..."
    check_env
    
    docker-compose up -d
    print_success "Production server started at http://localhost:3000"
    print_info "View logs with: npm run docker:logs"
}

# Stop all containers
stop() {
    print_info "Stopping all containers..."
    
    if docker-compose -f docker-compose.dev.yml ps -q 2>/dev/null | grep -q .; then
        docker-compose -f docker-compose.dev.yml down
        print_success "Development containers stopped"
    fi
    
    if docker-compose ps -q 2>/dev/null | grep -q .; then
        docker-compose down
        print_success "Production containers stopped"
    fi
}

# View logs
logs() {
    if [ "$1" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Clean up everything
clean() {
    print_warning "This will remove all containers, images, and volumes for ${PROJECT_NAME}"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        
        # Stop containers
        docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
        docker-compose down -v 2>/dev/null || true
        
        # Remove images
        docker rmi ${PROJECT_NAME}:latest ${PROJECT_NAME}:prod ${PROJECT_NAME}:dev 2>/dev/null || true
        
        print_success "Cleanup complete"
    else
        print_info "Cleanup cancelled"
    fi
}

# Health check
health() {
    print_info "Checking application health..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
    
    if [ "$response" = "200" ]; then
        print_success "Application is healthy (HTTP $response)"
        curl -s http://localhost:3000/api/health | jq .
    else
        print_error "Application is unhealthy (HTTP $response)"
        exit 1
    fi
}

# Show help
help() {
    echo "Docker Management Script for ${PROJECT_NAME}"
    echo ""
    echo "Usage: npm run docker:<command>"
    echo ""
    echo "Commands:"
    echo "  build:prod      Build production image"
    echo "  build:dev       Build development image"
    echo "  dev             Start development (with logs)"
    echo "  dev:bg          Start development in background"
    echo "  prod            Start production (with logs)"
    echo "  prod:bg         Start production in background"
    echo "  stop            Stop all containers"
    echo "  logs            View production logs"
    echo "  logs:dev        View development logs"
    echo "  clean           Remove all containers and images"
    echo "  health          Check application health"
    echo ""
    echo "Examples:"
    echo "  npm run docker:dev           # Start dev server"
    echo "  npm run docker:build:prod    # Build production image"
    echo "  npm run docker:prod:bg       # Start production in background"
    echo "  npm run docker:logs          # View logs"
    echo "  npm run docker:stop          # Stop everything"
}

# Main script
case "$1" in
    build:prod)
        build_prod
        ;;
    build:dev)
        build_dev
        ;;
    dev)
        dev
        ;;
    dev:bg)
        dev_detached
        ;;
    prod)
        prod
        ;;
    prod:bg)
        prod_detached
        ;;
    stop)
        stop
        ;;
    logs)
        logs prod
        ;;
    logs:dev)
        logs dev
        ;;
    clean)
        clean
        ;;
    health)
        health
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        help
        exit 1
        ;;
esac
