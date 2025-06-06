# Thesis Compilation Project

## Project Structure

This project is organized into clear source and output directories:

```
thesis/final_thesis/
├── src/                    # Source files (LaTeX, images, styles)
│   ├── thesis.tex         # Main thesis file
│   ├── *.tex              # Chapter files
│   ├── *.cls, *.sty       # LaTeX class and style files
│   └── pdffigs/           # Images and figures
├── output/                 # Generated files (PDF, logs, auxiliary)
│   ├── thesis.pdf         # Final compiled thesis
│   └── *.aux, *.log, etc. # LaTeX auxiliary files
├── compile_thesis.sh       # Main compilation script
├── clean.sh               # Clean output directory
└── README.md              # This file
```

## Usage

- **Compile thesis**: `./compile_thesis.sh`
- **Clean outputs**: `./clean.sh`

The compilation script automatically:
- Uses Docker with Greek language support
- Reads source files from `src/`
- Outputs all files to `output/`
- Removes old PDF before compilation

## Original Documentation

# Thesis Prototype

This directory contains a LaTeX prototype used to generate the thesis PDF. The
`thesis.tex` file is the master document and pulls in the other `.tex` files to
assemble the final PDF.

## Main `.tex` Files

- **thesis.tex** – master file that loads the `ioniothesis` class and the
  `ioniostyle` package. It sets up packages (graphics, makeidx, babel, etc.),
  defines document settings, and includes all other chapters and appendices.
- **perilipsi.tex** – brief summary or abstract placed near the beginning of the
  thesis.
- **prologos.tex** – the prologue or preface chapter.
- **intro.tex** – introduction chapter.
- **sximata.tex** – chapter with example figures and tables. It frequently uses
  the figure macros defined in `ioniostyle.sty`.
- **telos.tex** – final chapter with concluding remarks.
- **biblio.tex** – bibliography items used by the `thebibliography` environment.
- **abbrev.tex** – list of abbreviations, formatted with the `\gl` macro.
- **glossari.tex** – glossary terms, also formatted with the `\gl` macro.

## Custom Commands

### `ioniothesis.cls`

The class file extends the standard `book` class and introduces custom commands
for chapter formatting and structure:

- `\frontmatter`, `\mainmatter`, `\backmatter` – control page numbering style
  and chapter numbering【F:thesis/prototype/ionio_thesis_pdf/ioniothesis.cls†L300-L314】.
- `\part`, `\chapter`, `\section` – redefined to use teletype fonts and custom
  numbering schemes【F:thesis/prototype/ionio_thesis_pdf/ioniothesis.cls†L315-L367】.
- Custom list labels such as `\labelitemi` and `\labelitemii` to modify bullet
  styles【F:thesis/prototype/ionio_thesis_pdf/ioniothesis.cls†L471-L481】.

### `ioniostyle.sty`

This style file defines helper macros used throughout the chapters:

- `\prof{\name}{\title}{\affiliation}` – formats committee member information.
- `\gl{\abbr}{\text}` – produces glossary or abbreviation entries.
- `\syl{\term}{\description}` – similar to `\gl`, but with narrower columns.
- `\proof{...}` – inline proof environment.
- Figure helpers `\myffig`, `\myffigadapt`, `\mytfig`, `\mytfigadapt`,
  `\myfig`, and `\myfigadapt` for arranging one or more images with captions.
  These commands are defined at the start of the style file【F:thesis/prototype/ionio_thesis_pdf/ioniostyle.sty†L1-L135】.


## Building the PDF

Run `./compile_thesis.sh` from this directory to build `thesis.pdf`.
If Docker is installed, the script automatically launches a container
with a full TeX Live distribution (`blang/latex:ctanfull`) to perform
the compilation. Without Docker it falls back to using locally
installed tools: `latexmk` when available or multiple `pdflatex`
runs with `makeindex`.
