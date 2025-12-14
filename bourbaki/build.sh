#!/bin/bash
# Build script for Bourbaki-style textbook

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Handle clean option
if [ "$1" == "clean" ]; then
    echo -e "${YELLOW}Cleaning build artifacts...${NC}"
    rm -rf build/
    rm -f main.pdf
    echo -e "${GREEN}✓ Clean complete!${NC}"
    exit 0
fi

# Handle help option
if [ "$1" == "help" ] || [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    echo -e "${BLUE}Bourbaki Textbook Build Script${NC}"
    echo ""
    echo "Usage: ./build.sh [option]"
    echo ""
    echo "Options:"
    echo "  (no option)  Build the complete PDF"
    echo "  clean        Remove all build artifacts"
    echo "  help         Show this help message"
    echo ""
    exit 0
fi

echo -e "${YELLOW}Building Bourbaki-style Foundations of Mathematics...${NC}"
echo ""

# Create build directory if it doesn't exist
mkdir -p build/chapters

# First pass
echo -e "${GREEN}Running first pass (generating auxiliary files)...${NC}"
pdflatex -output-directory=build -interaction=nonstopmode main.tex > /dev/null 2>&1

if [ ! -f build/main.pdf ]; then
    echo -e "${RED}First pass failed. Check build/main.log for errors.${NC}"
    echo -e "${YELLOW}Error details:${NC}"
    grep -A 5 "^!" build/main.log | head -20
    exit 1
fi

# Second pass (for table of contents)
echo -e "${GREEN}Running second pass (table of contents)...${NC}"
pdflatex -output-directory=build -interaction=nonstopmode main.tex > /dev/null 2>&1

if [ ! -f build/main.pdf ]; then
    echo -e "${RED}Second pass failed. Check build/main.log for errors.${NC}"
    echo -e "${YELLOW}Error details:${NC}"
    grep -A 5 "^!" build/main.log | head -20
    exit 1
fi

# Build index
echo -e "${GREEN}Building index...${NC}"
makeindex -s build/main.ist -t build/main.ilg -o build/main.ind build/main.idx 2>/dev/null

# Third pass (for references and index)
echo -e "${GREEN}Running third pass (cross-references and index)...${NC}"
pdflatex -output-directory=build -interaction=nonstopmode main.tex > /dev/null 2>&1

if [ ! -f build/main.pdf ]; then
    echo -e "${RED}Third pass failed. Check build/main.log for errors.${NC}"
    echo -e "${YELLOW}Error details:${NC}"
    grep -A 5 "^!" build/main.log | head -20
    exit 1
fi

# Copy PDF to bourbaki root
mv build/main.pdf .

echo ""
echo -e "${GREEN}✓ Build successful!${NC}"
echo -e "PDF output: ${YELLOW}main.pdf${NC}"
echo ""
echo "Page count: $(pdfinfo main.pdf 2>/dev/null | grep Pages | awk '{print $2}') pages"
echo ""