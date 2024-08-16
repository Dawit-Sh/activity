#!/bin/bash

# Prompt for user input
read -p "Enter the year: " YEAR
read -p "Enter the month (e.g., January): " MONTH
read -p "Enter the book title: " TITLE
read -p "Enter the rating (0-5): " RATING

# Validate inputs
if ! [[ "$RATING" =~ ^[0-5]$ ]]; then
    echo "Rating must be between 0 and 5."
    exit 1
fi

# Define file and temporary JSON file
FILE="${YEAR}.json"
TEMP_JSON=$(mktemp)

# Define the initial JSON structure
INITIAL_JSON='{
    "January": [],
    "February": [],
    "March": [],
    "April": [],
    "May": [],
    "June": [],
    "July": [],
    "August": [],
    "September": [],
    "October": [],
    "November": [],
    "December": []
}'

# Check if the JSON file exists
if [ -f "$FILE" ]; then
    echo "Updating existing JSON file..."
else
    echo "Creating new JSON file..."
    # Create the file and initialize it with the default structure
    echo "$INITIAL_JSON" > "$FILE"
fi

# Update the JSON file
jq --arg month "$MONTH" --arg title "$TITLE" --argjson rating "$RATING" '
    .[$month] += [{ "title": $title, "rating": $rating }]
' "$FILE" > "$TEMP_JSON"

# Check if the temp file was created and has content
if [ -s "$TEMP_JSON" ]; then
    # Replace the original file with the updated one
    mv "$TEMP_JSON" "$FILE"
    echo "Book logged successfully!"
else
    echo "Failed to create or update the JSON file."
    exit 1
fi

# Clean up
rm -f "$TEMP_JSON"
