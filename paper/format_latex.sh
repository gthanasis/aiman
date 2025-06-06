#!/bin/sh
set -e

# Script to format LaTeX files using latexindent in Docker
# Usage: ./format_latex.sh [file.tex] or ./format_latex.sh (formats all .tex files)

cd "$(dirname "$0")"

format_file() {
    local file="$1"
    echo "Formatting $file..."
    
    if command -v docker >/dev/null 2>&1; then
        # Use the same LaTeX Docker image as compilation
        LATEX_IMAGE="blang/latex:ubuntu"
        
        # Check if latexindent is available in the container
        if docker run --rm -v "$PWD":/thesis -w /thesis $LATEX_IMAGE \
           sh -c 'command -v latexindent >/dev/null 2>&1'; then
            
            # Format the file using latexindent (suppress perl warnings)
            docker run --rm -v "$PWD":/thesis -w /thesis $LATEX_IMAGE \
                sh -c 'export PERL_DISABLE_DEPRECATION_WARNINGS=1 && latexindent -w "'"$file"'" -s 2>/dev/null || latexindent -w "'"$file"'"'
            
            echo "✓ Formatted $file"
        else
            echo "⚠ latexindent not available in Docker image. Trying to install..."
            
            # Try to install latexindent and format
            docker run --rm -v "$PWD":/thesis -w /thesis $LATEX_IMAGE \
                sh -c 'apt-get update -qq && apt-get install -y -qq texlive-extra-utils && export PERL_DISABLE_DEPRECATION_WARNINGS=1 && latexindent -w "'"$file"'" -s 2>/dev/null || latexindent -w "'"$file"'"'
            
            echo "✓ Installed latexindent and formatted $file"
        fi
    else
        echo "❌ Docker not found. Please install Docker or use latexindent directly."
        exit 1
    fi
}

# If a specific file is provided, format only that file
if [ $# -eq 1 ]; then
    if [ -f "$1" ]; then
        format_file "$1"
    else
        echo "❌ File $1 not found"
        exit 1
    fi
else
    # Format all .tex files in src directory
    echo "Formatting all .tex files in src directory..."
    for file in src/*.tex; do
        if [ -f "$file" ]; then
            format_file "$file"
        fi
    done
fi

echo "🎉 LaTeX formatting complete!" 