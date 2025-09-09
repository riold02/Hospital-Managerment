#!/bin/bash

# ============================================================================
# DOCKER SCRIPTS FOR HOSPITAL MANAGEMENT SYSTEM
# Scripts để quản lý Docker containers dễ dàng
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install it first."
        exit 1
    fi
}

# Function to start production environment
start_production() {
    print_header "Starting Production Environment"
    check_docker
    check_docker_compose
    
    print_status "Building and starting production containers..."
    docker-compose up -d --build
    
    print_status "Waiting for services to be healthy..."
    sleep 10
    
    print_status "Backend API: http://localhost:3001"
    print_status "Redis: localhost:6379"
    
    docker-compose ps
}

# Function to start development environment
start_development() {
    print_header "Starting Development Environment"
    check_docker
    check_docker_compose
    
    print_status "Building and starting development containers..."
    docker-compose -f docker-compose.dev.yml up -d --build
    
    print_status "Waiting for services to be healthy..."
    sleep 10
    
    print_status "Backend API: http://localhost:3001"
    print_status "Redis: localhost:6379"
    
    docker-compose -f docker-compose.dev.yml ps
}

# Function to stop all containers
stop_all() {
    print_header "Stopping All Containers"
    
    print_status "Stopping production containers..."
    docker-compose down
    
    print_status "Stopping development containers..."
    docker-compose -f docker-compose.dev.yml down
    
    print_status "All containers stopped!"
}

# Function to view logs
view_logs() {
    local service=${1:-backend}
    
    print_header "Viewing Logs for $service"
    
    if docker-compose ps | grep -q "$service"; then
        docker-compose logs -f "$service"
    elif docker-compose -f docker-compose.dev.yml ps | grep -q "$service"; then
        docker-compose -f docker-compose.dev.yml logs -f "$service"
    else
        print_error "Service $service not found in running containers"
    fi
}

# Function to restart service
restart_service() {
    local service=${1:-backend}
    
    print_header "Restarting Service: $service"
    
    if docker-compose ps | grep -q "$service"; then
        docker-compose restart "$service"
    elif docker-compose -f docker-compose.dev.yml ps | grep -q "$service"; then
        docker-compose -f docker-compose.dev.yml restart "$service"
    else
        print_error "Service $service not found in running containers"
    fi
}

# Function to clean up
cleanup() {
    print_header "Cleaning Up Docker Resources"
    
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Stopping all containers..."
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
        
        print_status "Removing unused containers, networks, and images..."
        docker system prune -f
        
        print_status "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show status
show_status() {
    print_header "Container Status"
    
    echo -e "\n${BLUE}Production Environment:${NC}"
    docker-compose ps
    
    echo -e "\n${BLUE}Development Environment:${NC}"
    docker-compose -f docker-compose.dev.yml ps
    
    echo -e "\n${BLUE}System Resources:${NC}"
    docker system df
}

# Test admin script: login admin and try to create staff
# Requires env ADMIN_EMAIL, ADMIN_PASSWORD
test_admin() {
    print_header "Testing Admin Permissions via Docker"
    local email=${ADMIN_EMAIL:-admin@hospital.com}
    local password=${ADMIN_PASSWORD:-Admin123!}
    print_status "Logging in as $email"
    local token
    token=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
        -H 'Content-Type: application/json' \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    local jwt
    jwt=$(echo "$token" | jq -r '.data.token // empty')
    if [ -z "$jwt" ]; then print_error "Failed to login as admin"; echo "$token"; return 1; fi
    print_status "Got JWT"

    print_status "Creating staff (should succeed for admin)"
    local resp
    resp=$(curl -s -X POST http://localhost:3001/api/v1/staff \
        -H "Authorization: Bearer $jwt" -H 'Content-Type: application/json' \
        -d '{"first_name":"Test","last_name":"User","email":"test.user+'"$(date +%s)""@example.com","role":"STAFF"}')
    echo "$resp" | jq .
}

# Function to show help
show_help() {
    print_header "Docker Scripts Help"
    
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start-prod     Start production environment"
    echo "  start-dev      Start development environment"
    echo "  stop           Stop all containers"
    echo "  logs [SERVICE] View logs for a service (default: backend)"
    echo "  restart [SERVICE] Restart a service (default: backend)"
    echo "  status         Show status of all containers"
    echo "  cleanup        Clean up all Docker resources"
    echo "  test-admin     Login as admin and create a staff"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start-prod"
    echo "  $0 start-dev"
    echo "  $0 logs postgres"
    echo "  $0 restart backend"
}

# Main script logic
case "${1:-help}" in
    "start-prod"|"start-prod")
        start_production
        ;;
    "start-dev"|"start-dev")
        start_development
        ;;
    "stop"|"stop")
        stop_all
        ;;
    "logs"|"logs")
        view_logs "$2"
        ;;
    "restart"|"restart")
        restart_service "$2"
        ;;
    "status"|"status")
        show_status
        ;;
    "cleanup"|"cleanup")
        cleanup
        ;;
    "test-admin"|"test-admin")
        test_admin
        ;;
    "help"|"help"|*)
        show_help
        ;;
esac
