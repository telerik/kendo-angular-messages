#!/usr/bin/env sh

COMPONENT=$1
REFERENCE="messages/grid"

if [ ! $# -eq 1 ]; then
  echo "
Appends the content of a new message(s) file to all existing locale-specific files.

Use this tool when creating new message(s) for an existing component.

1. Create a 'new-message.yml' file containing the new message in the root folder.
   Start and end the file with an empty row, and provide the same indentation for the
   new message(s) and their description(s) as in the existing files.
2. Run 'npm run append-message <component>'
3. Commit the updated files from 'messages/component'
  "
  exit
fi

SOURCE="new-message.yml"
if [ ! -f "$SOURCE" ]; then
  echo "Input file '$SOURCE' does not exist"
  exit 1
fi

for file in ./messages/$COMPONENT/*.yml; do
    cat $SOURCE >> "$file"
done

rm $SOURCE
