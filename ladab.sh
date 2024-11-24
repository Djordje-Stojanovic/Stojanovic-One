# Lazy Database (ladab) function for easy Supabase operations
function ladab() {
    local DB_URL="https://supabase.stojanovic-one.com/rest/v1"
    local SERVICE_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTczMjM2NzA0MCwiZXhwIjo0ODg4MDQwNjQwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.8ve8LYnij0tpxDl2OcPGnJbsQq5usE2FvCjdTmUGo6Q"
    local ANON_KEY="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTczMjM2NzA0MCwiZXhwIjo0ODg4MDQwNjQwLCJyb2xlIjoiYW5vbiJ9.BscbHANlUH6Jf6fxojKT1mLEjZyyY1VH1-RyjVVr2K4"

    local HEADERS=(
        -H "apikey: $SERVICE_KEY"
        -H "Authorization: Bearer $SERVICE_KEY"
        -H "Content-Type: application/json"
    )

    # Colors and emojis
    local RED='\033[0;31m'
    local GREEN='\033[0;32m'
    local YELLOW='\033[1;33m'
    local BLUE='\033[0;34m'
    local NC='\033[0m'

    show_help() {
        echo -e "${BLUE}🔥 Lazy Database (ladab) - Simple Supabase CLI${NC}"
        echo
        echo -e "${YELLOW}Usage:${NC}"
        echo "  ladab <command> [options]"
        echo
        echo -e "${YELLOW}Data Commands:${NC}"
        echo "  ls [table]              📋 List tables or table contents"
        echo "  get <table> [query]     🔍 Get records with optional query"
        echo "  add <table> [json]      ➕ Add record (reads from stdin if json not provided)"
        echo "  del <table> [query]     ❌ Delete records matching query"
        echo "  up <table> [query]      📝 Update records (reads from stdin)"
        echo
        echo -e "${YELLOW}Query Options:${NC}"
        echo "  -l, --limit <n>         Limit results"
        echo "  -o, --order <column>    Order by column"
        echo "  -d, --desc              Order descending"
        echo "  -w, --where <query>     Where clause"
        echo
        echo -e "${YELLOW}RLS Commands:${NC}"
        echo "  rls ls [table]          🔒 List RLS policies"
        echo "  rls test <table>        🧪 Test RLS policies"
        echo "  rls allow <table>       🔓 Allow all access to table"
        echo "  rls deny <table>        🔐 Deny all access to table"
        echo
        echo -e "${YELLOW}Examples:${NC}"
        echo "  ladab ls                          # List all tables"
        echo "  ladab ls user_stocks              # List user_stocks contents"
        echo "  ladab get stocks -l 5 -o symbol   # Get 5 stocks ordered by symbol"
        echo "  ladab get users -w \"id=eq.123\"    # Get user with id 123"
        echo "  ladab rls allow available_symbols # Allow all access to table"
    }

    error() {
        echo -e "${RED}❌ Error: $1${NC}" >&2
        return 1
    }

    success() {
        echo -e "${GREEN}✅ Success: $1${NC}"
    }

    info() {
        echo -e "${BLUE}ℹ️  Info: $1${NC}"
    }

    format_json() {
        if command -v jq &>/dev/null; then
            jq '.' -C
        else
            cat
        fi
    }

    # Parse options
    local limit=""
    local order=""
    local desc=""
    local where=""
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -l|--limit)
                limit="?limit=$2"
                shift 2
                ;;
            -o|--order)
                order="&order=$2"
                shift 2
                ;;
            -d|--desc)
                desc=".desc"
                shift
                ;;
            -w|--where)
                where="&$2"
                shift 2
                ;;
            *)
                break
                ;;
        esac
    done

    case "$1" in
        "rls")
            case "$2" in
                "ls")
                    local table="$3"
                    if [ -z "$table" ]; then
                        info "Testing RLS on all tables..."
                        ladab ls | jq -r '.[]' | while read t; do
                            echo -e "\n${YELLOW}Table: $t${NC}"
                            ladab rls test "$t"
                        done
                    else
                        info "Testing RLS on table $table..."
                        ladab rls test "$table"
                    fi
                    ;;
                "test")
                    local table="$3"
                    [ -z "$table" ] && error "Table name required"
                    
                    info "1. Testing as anon..."
                    curl -s "$DB_URL/$table?limit=1" \
                        -H "apikey: $ANON_KEY" \
                        -H "Authorization: Bearer $ANON_KEY" | format_json
                    
                    info "2. Testing as service_role..."
                    curl -s "$DB_URL/$table?limit=1" \
                        -H "apikey: $SERVICE_KEY" \
                        -H "Authorization: Bearer $SERVICE_KEY" | format_json
                    ;;
                "allow")
                    local table="$3"
                    [ -z "$table" ] && error "Table name required"
                    
                    # Create policy using management API
                    curl -s -X POST "$DB_URL/policies" \
                        "${HEADERS[@]}" \
                        -d "{
                            \"name\": \"allow_all\",
                            \"table\": \"$table\",
                            \"definition\": \"true\",
                            \"check\": \"true\",
                            \"action\": \"ALL\"
                        }" | format_json
                    success "Added allow_all policy to $table"
                    ;;
                "deny")
                    local table="$3"
                    [ -z "$table" ] && error "Table name required"
                    
                    # Delete policy using management API
                    curl -s -X DELETE "$DB_URL/policies?name=eq.allow_all&table=eq.$table" \
                        "${HEADERS[@]}" | format_json
                    success "Removed all policies from $table"
                    ;;
                *)
                    show_help
                    ;;
            esac
            ;;
        "ls")
            local table="$2"
            if [ -z "$table" ]; then
                curl -s "$DB_URL/tables" "${HEADERS[@]}" | format_json
            else
                curl -s "$DB_URL/$table$limit$order$desc$where" "${HEADERS[@]}" | format_json
            fi
            ;;
        "get")
            local table="$2"
            [ -z "$table" ] && error "Table name required"
            curl -s "$DB_URL/$table$limit$order$desc$where" "${HEADERS[@]}" | format_json
            ;;
        "add")
            local table="$2"
            [ -z "$table" ] && error "Table name required"
            if [ -n "$3" ]; then
                echo "$3" | curl -s -X POST "$DB_URL/$table" "${HEADERS[@]}" -d @-
            else
                curl -s -X POST "$DB_URL/$table" "${HEADERS[@]}" -d @-
            fi | format_json
            ;;
        "del")
            local table="$2"
            [ -z "$table" ] && error "Table name required"
            [ -z "$where" ] && error "Where clause required for delete"
            curl -s -X DELETE "$DB_URL/$table?$where" "${HEADERS[@]}" | format_json
            ;;
        "up")
            local table="$2"
            [ -z "$table" ] && error "Table name required"
            [ -z "$where" ] && error "Where clause required for update"
            curl -s -X PATCH "$DB_URL/$table?$where" "${HEADERS[@]}" -d @- | format_json
            ;;
        *)
            show_help
            ;;
    esac
}
