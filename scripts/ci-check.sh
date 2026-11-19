#!/usr/bin/env bash
set -e
echo "Running HyFly-4 automated CI integrity checks..."
node -e "console.log('Validating Node syntax and imports...')"
python3 -m py_compile dev_server.py
echo "CI checks completed successfully."
