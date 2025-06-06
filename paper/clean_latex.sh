#!/bin/sh
set -e

# Script to clean and format LaTeX files using latexindent in Docker + blank line cleanup
# Usage: ./clean_latex.sh [file.tex] or ./clean_latex.sh (cleans all .tex files)

cd "$(dirname "$0")"

clean_file() {
    local file="$1"
    echo "Cleaning and formatting $file..."
    
    # First, clean up excessive blank lines and common issues
    echo "  → Cleaning up blank lines and text issues..."
    
    # Create a temporary file for processing
    temp_file="${file}.tmp"
    
    # Clean up the file:
    # 1. Remove excessive blank lines (more than 2 consecutive)
    # 2. Remove trailing whitespace
    # 3. Fix common encoding issues
    # 4. Ensure file ends with single newline
    cat "$file" | \
        # Remove carriage returns and fix encoding
        tr -d '\r' | \
        # Remove trailing whitespace from each line
        sed 's/[[:space:]]*$//' | \
        # Replace multiple consecutive blank lines with max 2
        awk '
        BEGIN { blank_count = 0 }
        /^$/ { 
            blank_count++
            if (blank_count <= 2) print
            next
        }
        {
            blank_count = 0
            print
        }
        ' > "$temp_file"
    
    # Move cleaned file back
    mv "$temp_file" "$file"
    
    # Now run latexindent for proper LaTeX formatting
    if command -v docker >/dev/null 2>&1; then
        # Use the same LaTeX Docker image as compilation
        LATEX_IMAGE="blang/latex:ubuntu"
        
        echo "  → Running latexindent formatting..."
        
        # Check if latexindent is available in the container
        if docker run --rm -v "$PWD":/thesis -w /thesis $LATEX_IMAGE \
           sh -c 'command -v latexindent >/dev/null 2>&1' >/dev/null 2>&1; then
            
            # Format the file using latexindent (suppress perl warnings)
            docker run --rm -v "$PWD":/thesis -w /thesis $LATEX_IMAGE \
                sh -c 'export PERL_DISABLE_DEPRECATION_WARNINGS=1 && latexindent -w "'"$file"'" -s' >/dev/null 2>&1 || \
            docker run --rm -v "$PWD":/thesis -w /thesis $LATEX_IMAGE \
                latexindent -w "$file" >/dev/null 2>&1 || true
            
        else
            echo "  → Installing latexindent..."
            
            # Try to install latexindent and format
            docker run --rm -v "$PWD":/thesis -w /thesis $LATEX_IMAGE \
                sh -c 'apt-get update -qq >/dev/null 2>&1 && apt-get install -y -qq texlive-extra-utils >/dev/null 2>&1 && export PERL_DISABLE_DEPRECATION_WARNINGS=1 && latexindent -w "'"$file"'" -s' >/dev/null 2>&1 || \
            docker run --rm -v "$PWD":/thesis -w /thesis $LATEX_IMAGE \
                sh -c 'latexindent -w "'"$file"'"' >/dev/null 2>&1 || true
        fi
        
        # Final cleanup of any remaining excessive blank lines that latexindent might have introduced
        echo "  → Final blank line cleanup..."
        cat "$file" | \
            awk '
            BEGIN { blank_count = 0 }
            /^[[:space:]]*$/ { 
                blank_count++
                if (blank_count <= 2) print
                next
            }
            {
                blank_count = 0
                print
            }
            ' > "$temp_file"
        
        mv "$temp_file" "$file"
        
        echo "✓ Cleaned and formatted $file"
    else
        echo "❌ Docker not found. Please install Docker or use latexindent directly."
        exit 1
    fi
}

# If a specific file is provided, clean only that file
if [ $# -eq 1 ]; then
    if [ -f "$1" ]; then
        clean_file "$1"
    else
        echo "❌ File $1 not found"
        exit 1
    fi
else
    # Clean all .tex files in src directory
    echo "Cleaning all .tex files in src directory..."
    for file in src/*.tex; do
        if [ -f "$file" ]; then
            clean_file "$file"
        fi
    done
fi

echo "🎉 LaTeX cleaning and formatting complete!" 