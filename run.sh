#!/bin/bash
# Navigate to project folder
cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Start the Flask server on port 5000
python3 server.py --port=5000