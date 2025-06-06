#!/bin/sh
set -e
cd "$(dirname "$0")"

# Create output directory if it doesn't exist
mkdir -p output

# Remove old PDF if it exists
rm -f output/thesis.pdf

run_latex() {
  if command -v latexmk >/dev/null 2>&1; then
    latexmk -pdf -interaction=nonstopmode -output-directory=../output -cd src/thesis.tex
  else
    cd src
    pdflatex -output-directory=../output -interaction=nonstopmode thesis.tex
    makeindex ../output/thesis.idx
    pdflatex -output-directory=../output -interaction=nonstopmode thesis.tex
    pdflatex -output-directory=../output -interaction=nonstopmode thesis.tex
    cd ..
  fi
}

# Prefer a dockerised LaTeX environment when Docker is available.
if command -v docker >/dev/null 2>&1; then
  # Use ubuntu image (3.9GB) for better Greek language support
  # ctanbasic (500MB) is missing Greek language packages needed for this thesis
  LATEX_IMAGE="blang/latex:ubuntu"
  
  # Alternative images to try if ctanbasic is insufficient:
  # blang/latex:ubuntu (3.9GB) - older but stable, good package coverage
  # blang/latex:ctanfull (5.6GB) - complete package set, use as last resort
  # silkeh/latex:medium (800MB) - good middle ground
  
  docker run --rm -v "$PWD":/thesis -w /thesis $LATEX_IMAGE \
    sh -c 'mkdir -p output && \
           latexmk -pdf -interaction=nonstopmode -output-directory=output -cd src/thesis.tex || \
           (cd src && \
            pdflatex -output-directory=../output -interaction=nonstopmode thesis.tex && \
            makeindex ../output/thesis.idx && \
            pdflatex -output-directory=../output -interaction=nonstopmode thesis.tex && \
            pdflatex -output-directory=../output -interaction=nonstopmode thesis.tex)'
else
  run_latex
fi

# Clean up backup files created by latexindent after build completes
if [ -f "output/thesis.pdf" ]; then
  echo "Build completed! Cleaning up backup files..."
  if ls src/*.bak* 1> /dev/null 2>&1; then
    rm -f src/*.bak*
    echo "✓ Removed backup files"
  else
    echo "✓ No backup files to clean"
  fi
else
  echo "Build failed - PDF not generated"
fi
