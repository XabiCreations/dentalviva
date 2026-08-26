#!/bin/bash

set -e

HOST="aws-0-eu-west-1.pooler.supabase.com"
PORT="5432"
USER="postgres.gvlljlpsfqbyzokevgtj"
DB="postgres"
OUTPUT="supabase/schema_complete.sql"

if [ -z "$PGPASSWORD" ]; then
  echo "Introduce la contraseña de la base de datos Supabase:"
  read -s PGPASSWORD
  export PGPASSWORD
fi

echo "Exportando schema..."

/opt/homebrew/opt/postgresql@17/bin/pg_dump \
  --host="$HOST" \
  --port="$PORT" \
  --username="$USER" \
  --dbname="$DB" \
  --schema-only --no-owner --no-acl \
  -f "$OUTPUT"

echo "Schema exportado: $OUTPUT ($(wc -l < "$OUTPUT") líneas)"
echo "Recuerda hacer commit y push si quieres subir los cambios a GitHub."
