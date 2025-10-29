import psycopg2

try:
    # Connect to the database using the same credentials from docker-compose.yml
    conn = psycopg2.connect(
        dbname="pulsenews",
        user="pulsenews",
        password="pulsenews123",
        host="db",
        port="5432"
    )
    
    # Create a cursor object
    cursor = conn.cursor()
    
    # Get the list of all tables
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    
    # Fetch all the tables
    tables = cursor.fetchall()
    
    if tables:
        print("Tables in the database:")
        for table in tables:
            print(f"- {table[0]}")
    else:
        print("No tables found in the database.")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")
