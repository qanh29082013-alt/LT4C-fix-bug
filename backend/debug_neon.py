import psycopg
import sys

candidates = [
    # T vs L, m vs M, i vs I vs 1 vs l
    "npg_S7miCU1XMLRP", # S7miCU1XMLRP (capital M, capital L)
    "npg_S7mICU1XMLRP",
    "npg_S7m1CU1XMLRP",
    "npg_S7mlCU1XMLRP",
    
    # Pooler host variations
    "npg_S7miCU1XMLRP",
]

host = "ep-small-field-aosurrzy.c-2.ap-southeast-1.aws.neon.tech"
db = "neondb"
user = "neondb_owner"

print("Starting Neon connection tests with Capital M...", flush=True)

for pwd in candidates:
    conn_str = f"postgresql://{user}:{pwd}@{host}/{db}?sslmode=require&connect_timeout=3"
    try:
        conn = psycopg.connect(conn_str)
        print(f"\n[SUCCESS] Connected successfully with password: {pwd}")
        conn.close()
        sys.exit(0)
    except Exception as e:
        print(f"Failed with {pwd}: {e}")

# Try pooler host as well
host_pooler = "ep-small-field-aosurrzy-pooler.c-2.ap-southeast-1.aws.neon.tech"
for pwd in candidates:
    conn_str = f"postgresql://{user}:{pwd}@{host_pooler}/{db}?sslmode=require&connect_timeout=3"
    try:
        conn = psycopg.connect(conn_str)
        print(f"\n[SUCCESS] Connected successfully to POOLER with password: {pwd}")
        conn.close()
        sys.exit(0)
    except Exception as e:
        print(f"Failed with {pwd} on pooler: {e}")

print("\n[FAILED] None of the passwords connected successfully.")
sys.exit(1)
