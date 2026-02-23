#!/usr/bin/env bash
set -euo pipefail

# marker.sh — Extract documents to markdown using marker-pdf
# Supports: PDF, images (PNG/JPG/TIFF/etc.), PPTX, DOCX, XLSX, HTML, EPUB
# Usage: marker.sh <input> [output_dir] [--use-llm] [--low-dpi]

OP_GEMINI_REF="op://development/gemini-api-key/credential"

# DPI presets (affects image-based processing: PDFs, images, scans)
# Default: 96/192 (marker defaults — good quality, ~13 MB/page in memory)
# Low:     72/96  (68% memory reduction, slight quality loss — good for large docs)
# Minimum: 48/72  (used only as crash recovery fallback)
DEFAULT_LOWRES_DPI=96
DEFAULT_HIGHRES_DPI=192
LOW_LOWRES_DPI=72
LOW_HIGHRES_DPI=96
MIN_LOWRES_DPI=48
MIN_HIGHRES_DPI=72

usage() {
  echo "Usage: marker.sh <input|input_dir> [output_dir] [options]"
  echo ""
  echo "Supported: PDF, images (PNG/JPG/TIFF/etc.), PPTX, DOCX, XLSX, HTML, EPUB"
  echo ""
  echo "Options:"
  echo "  --use-llm              LLM-enhanced extraction (Gemini 2.5 Flash, requires GOOGLE_API_KEY)"
  echo "  --low-dpi              Lower DPI (72/96), ~68% less memory — for large documents"
  echo "  --force-ocr            Force OCR on all pages (fixes garbled text, enables inline math)"
  echo "  --page-range=0,5-10   Convert specific pages only"
  echo ""
  echo "On crash, auto-retries with minimum DPI (48/72)."
  exit 1
}

[[ $# -lt 1 ]] && usage

USE_LLM=false
LOW_DPI=false
FORCE_OCR=false
PAGE_RANGE=""

# Parse flags from any position
for arg in "$@"; do
  case "$arg" in
    --use-llm) USE_LLM=true ;;
    --low-dpi) LOW_DPI=true ;;
    --force-ocr) FORCE_OCR=true ;;
    --page-range=*) PAGE_RANGE="${arg#--page-range=}" ;;
  esac
done

# Strip flags from positional args
POSITIONAL=()
skip_next=false
for arg in "$@"; do
  if $skip_next; then skip_next=false; continue; fi
  case "$arg" in
    --use-llm|--low-dpi|--force-ocr|--page-range=*) ;;
    *) POSITIONAL+=("$arg") ;;
  esac
done
INPUT="${POSITIONAL[0]}"
OUTPUT_DIR="${POSITIONAL[1]:-}"

# Resolve input — marker needs a directory
if [[ -f "$INPUT" ]]; then
  STAGING_DIR=$(mktemp -d)
  cp "$INPUT" "$STAGING_DIR/"
  INPUT_DIR="$STAGING_DIR"
  DOC_NAME=$(basename "${INPUT%.*}")
elif [[ -d "$INPUT" ]]; then
  INPUT_DIR="$INPUT"
  STAGING_DIR=""
  DOC_NAME=""
else
  echo "Error: $INPUT is not a file or directory" >&2
  exit 1
fi

# Default output dir
if [[ -z "$OUTPUT_DIR" ]]; then
  OUTPUT_DIR=$(mktemp -d)
  echo "Output: $OUTPUT_DIR" >&2
fi
mkdir -p "$OUTPUT_DIR"

# Build marker args
MARKER_ARGS=(
  "$INPUT_DIR"
  --output_dir "$OUTPUT_DIR"
  --output_format markdown
  --disable_image_extraction
  --disable_multiprocessing
)

if $LOW_DPI; then
  MARKER_ARGS+=(--lowres_image_dpi "$LOW_LOWRES_DPI" --highres_image_dpi "$LOW_HIGHRES_DPI")
fi

if $FORCE_OCR; then
  MARKER_ARGS+=(--force_ocr)
fi

if [[ -n "$PAGE_RANGE" ]]; then
  MARKER_ARGS+=(--page_range "$PAGE_RANGE")
fi

if $USE_LLM; then
  MARKER_ARGS+=(--use_llm --gemini_model_name gemini-2.5-flash)
fi

# Run marker — inject API key from 1Password if using LLM
run_marker() {
  if $USE_LLM; then
    GOOGLE_API_KEY=$(op read "$OP_GEMINI_REF") \
      uvx --from 'marker-pdf' --with psutil marker "${MARKER_ARGS[@]}"
  else
    uvx --from 'marker-pdf' --with psutil marker "${MARKER_ARGS[@]}"
  fi
}

if ! run_marker; then
  if ! $LOW_DPI; then
    echo "Marker crashed — retrying with low DPI ($LOW_LOWRES_DPI/$LOW_HIGHRES_DPI)..." >&2
    MARKER_ARGS+=(--lowres_image_dpi "$LOW_LOWRES_DPI" --highres_image_dpi "$LOW_HIGHRES_DPI")
    if ! run_marker; then
      echo "Still failing — retrying with minimum DPI ($MIN_LOWRES_DPI/$MIN_HIGHRES_DPI)..." >&2
      NEW_ARGS=()
      skip_next=false
      for arg in "${MARKER_ARGS[@]}"; do
        if $skip_next; then skip_next=false; continue; fi
        case "$arg" in
          --lowres_image_dpi)  NEW_ARGS+=("$arg" "$MIN_LOWRES_DPI"); skip_next=true ;;
          --highres_image_dpi) NEW_ARGS+=("$arg" "$MIN_HIGHRES_DPI"); skip_next=true ;;
          *) NEW_ARGS+=("$arg") ;;
        esac
      done
      MARKER_ARGS=("${NEW_ARGS[@]}")
      run_marker
    fi
  else
    echo "Marker crashed with low DPI — retrying with minimum DPI ($MIN_LOWRES_DPI/$MIN_HIGHRES_DPI)..." >&2
    NEW_ARGS=()
    skip_next=false
    for arg in "${MARKER_ARGS[@]}"; do
      if $skip_next; then skip_next=false; continue; fi
      case "$arg" in
        --lowres_image_dpi)  NEW_ARGS+=("$arg" "$MIN_LOWRES_DPI"); skip_next=true ;;
        --highres_image_dpi) NEW_ARGS+=("$arg" "$MIN_HIGHRES_DPI"); skip_next=true ;;
        *) NEW_ARGS+=("$arg") ;;
      esac
    done
    MARKER_ARGS=("${NEW_ARGS[@]}")
    if ! run_marker; then
      echo "Marker failed even with minimum DPI" >&2
      exit 1
    fi
  fi
fi

# Print path to output markdown
if [[ -n "$DOC_NAME" ]]; then
  MD_FILE="$OUTPUT_DIR/$DOC_NAME/$DOC_NAME.md"
  if [[ -f "$MD_FILE" ]]; then
    echo "$MD_FILE"
  else
    find "$OUTPUT_DIR" -name "*.md" -not -name "*_meta*" | head -1
  fi
else
  find "$OUTPUT_DIR" -name "*.md" -not -name "*_meta*"
fi

# Cleanup staging dir
if [[ -n "$STAGING_DIR" ]]; then
  rm -rf "$STAGING_DIR"
fi
