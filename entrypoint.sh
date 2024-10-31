#!/bin/bash

# If an API key is provided via environment variable, set it in the config file
if [ -n "$OPENAI_API_KEY" ]; then
  echo "Setting OpenAI API key in the configuration file..."
  sed -i "s/; key =/key = ${OPENAI_API_KEY}/" /root/.aicliconfig >/dev/null 2>&1
fi

# Start PostgreSQL setup and display each step as it happens
#echo ""
#echo "===================================="
#echo "Setting up PostgreSQL for this session:"
#echo "------------------------------------"
#
## Step 1: Start the PostgreSQL service
#echo "1. Starting PostgreSQL service..."
#service postgresql start >/dev/null 2>&1
#
## Step 2: Modify authentication to allow local 'trust' access for the 'postgres' user
#echo "2. Modifying authentication to allow local 'trust' access for the 'postgres' user..."
#PG_HBA_FILE="/etc/postgresql/13/main/pg_hba.conf"
#sed -i "s/local\s*all\s*postgres\s*peer/local all postgres trust/" "$PG_HBA_FILE" >/dev/null 2>&1
#
## Step 3: Restart the PostgreSQL service to apply changes
#echo "3. Restarting PostgreSQL service to apply authentication changes..."
#service postgresql restart >/dev/null 2>&1
#
## Step 4: Set up PostgreSQL to allow root user access
#echo "4. Granting 'postgres' user superuser privileges and setting up root user access..."
#psql -U postgres -c "ALTER USER postgres PASSWORD 'root';" >/dev/null 2>&1
#psql -U postgres -c "ALTER USER postgres WITH SUPERUSER;" >/dev/null 2>&1
#
## Step 5: Create a database accessible to root
#echo "5. Creating a default 'root' database for convenience..."
#createdb -U postgres root >/dev/null 2>&1
#
#echo "===================================="
echo ""

# Add an echo statement to notify users that AI-CLI is automatically activated
cat <<EOF

====================================
AI predictions are already activated.
Enjoy using AI-CLI in this terminal session!
TIP: type a command and press "ctrl+x a" to trigger help
====================================

EOF

# Automatically source the AI-CLI activation script in .bashrc for both root and postgres users
echo "source /usr/local/share/ai-cli/ai-cli-activate-bash.sh" >> /root/.bashrc
echo "source /usr/local/share/ai-cli/ai-cli-activate-bash.sh" >> /var/lib/postgresql/.bashrc

# Ensure the user lands in the home directory
cd ~

# Start a bash shell to provide an interactive terminal
exec /bin/bash
