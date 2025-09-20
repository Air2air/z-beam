#!/bin/bash

# Vercel wrapper with proper environment
export PATH="/usr/local/bin:$PATH"
exec /usr/local/bin/vercel "$@"
