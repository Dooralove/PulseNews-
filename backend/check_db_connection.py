import psycopg2
import os

def check_connection():
    try:
        # Get database connection parameters from environment variables
        dbname = os.getenv('POSTGRES_DB', 'pulsenews')
        user = os.getenv('POSTGRES_USER', 'pulsenews')
        password = os.getenv('POSTGRES_PASSWORD', 'pulsenews123')
        host = os.getenv('POSTGRES_HOST', 'db')
        port = os.getenv('POSTGRES_PORT', '5432')

        print(f"Attempting to connect to database '{dbname}' on {host}:{port} as user '{user}'")
        
        # Try to connect to the database
        conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port
        )
        
        print("✓ Successfully connected to the database!")
        
        # Get a cursor
        cursor = conn.cursor()
        
        # List all databases
        cursor.execute("SELECT datname FROM pg_database;")
        print("\nAvailable databases:")
        for db in cursor.fetchall():
            print(f"- {db[0]}")
        
        # Check if our database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (dbname,))
        if not cursor.fetchone():
            print(f"\n❌ Database '{dbname}' does not exist!")
        else:
            print(f"\n✓ Database '{dbname}' exists!")
            
            # List all tables in the current database
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            
            tables = cursor.fetchall()
            if tables:
                print("\nTables in the database:")
                for table in tables:
                    print(f"- {table[0]}")
            else:
                print("\nNo tables found in the database.")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    check_connection()
