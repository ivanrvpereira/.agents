#!/usr/bin/env bash
set -euo pipefail

# doc-extract.sh — Extract documents to markdown using marker
# Supports: PDF, DOCX, PPTX, XLSX, EPUB, HTML, images (PNG, JPG, TIFF, etc.)

OP_GEMINI_REF="op://development/gemini-api-key/credential"

# DPI presets (only affect image-based processing: PDFs, images, scans)
# Default: 96/192 (marker defaults — good quality, ~13 MB/page in memory)
# Low:     72/96  (68% memory reduction — good for large documents)
# Minimum: 48/72  (crash recovery fallback only — layout accuracy degrades)
LOW_LOWRES_DPI=72
LOW_HIGHRES_DPI=96
MIN_LOWRES_DPI=48
MIN_HIGHRES_DPI=72

usage() {
  echo "Usage: doc-extract.sh <file|dir> [output_dir] [--use-llm] [--low-dpi]"
  echo ""
  echo "Supported formats: PDF, DOCX, PPTX, XLSX, EPUB, HTML, images"
  echo ""
  echo "Options:"
  echo "  --use-llm   LLM-enhanced extraction (Gemini 2.5 Flash via 1Password)"
  echo "  --low-dpi   Lower DPI (72/96) to reduce memory for large documents"
  exit 1
}

[[ $# -lt 1 ]] && usage

USE_LLM=false
LOW_DPI=false

for arg in "$@"; do
  case "$arg" in
    --use-llm) USE_LLM=true ;;
    --low-dpi) LOW_DPI=true ;;
  esac
done

POSITIONAL=()
for arg in "$@"; do
  case "$arg" in
    --use-llm|--low-dpi) ;;
    *) POSITIONAL+=("$arg") ;;
  esac
done
INPUT="${POSITIONAL[0]}"
OUTPUT_DIR="${POSITIONAL[1]:-}"

# Resolve input — marker batch mode needs a directory
if [[ -f "$INPUT" ]]; then
  STAGING_DIR=$(mktemp -d)
  cp "$INPUT" "$STAGING_DIR/"
  INPUT_DIR="$STAGING_DIR"
  FILENAME=$(basename "$INPUT")
  DOC_NAME="${FILENAME%.*}"
elif [[ -d "$INPUT" ]]; then
  INPUT_DIR="$INPUT"
  STAGING_DIR=""
  DOC_NAME=""
else
  echo "Error: $INPUT is not a file or directory" >&2
  exit 1
fi

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

if $USE_LLM; then
  MARKER_ARGS+=(--use_llm --gemini_model_name gemini-2.5-flash)
fi

# Run marker — inject API key if using LLM
run_marker() {
  if $USE_LLM; then
    GOOGLE_API_KEY=$(op read "$OP_GEMINI_REF") \
      uvx --from 'marker-pdf[full]' --with psutil marker "${MARKER_ARGS[@]}"
  else
    uvx --from 'marker-pdf[full]' --with psutil marker "${MARKER_ARGS[@]}"
  fi
}

# 3-tier crash recovery: default → low DPI → minimum DPI
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
    echo "Crashed with low DPI — retrying with minimum DPI ($MIN_LOWRES_DPI/$MIN_HIGHRES_DPI)..." >&2
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
