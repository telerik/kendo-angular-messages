#!/usr/bin/env sh

COMPONENT=$1
SOURCE=$2

if [ ! $# -eq 2 ]; then
  echo "
Appends the content of a new message(s) file to all existing locale-specific files.

Use this tool when creating new message(s) for an existing component.

1. Create a file containing the new message(s) and pass the path to it as a second argument to the command.
   Start and end the file with an empty row, and provide the same indentation for the
   new message(s) and their description(s) as in the existing files.
2. Run 'npm run append-message <component> <path-to-the-new-file>'
3. Commit the updated files from 'messages/component'
4. Cleanup and make sure that the new messages file is not committed
  "
  exit
fi

if [ ! -f "$SOURCE" ]; then
  echo "Input file '$SOURCE' does not exist"
  exit 1
fi

for file in ./messages/$COMPONENT/*.yml; do
    cat $SOURCE >> "$file"
done
