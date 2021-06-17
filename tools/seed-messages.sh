#!/usr/bin/env sh

COMPONENT=$1
REFERENCE="messages/grid"

if [ ! $# -eq 1 ]; then
  echo "
Copies a messages file to all locales

Use this tool when creating messages for new components.

1. Create a new messages file in 'messages/<component>/<component>.en-US.yml'
2. Run 'npm run seed-messages <component>'
3. Commit new files from 'messages/component'
  "
  exit
fi

SOURCE=messages/$COMPONENT/$COMPONENT.en-US.yml
if [ ! -f "$SOURCE" ]; then
  echo "Input file '$SOURCE' does not exist"
  exit 1
fi

find $REFERENCE -name "*.yml" -not -name "*.en-US.yml" | \
  sed -E 's#.*\.(.*)\.yml$#\1#' | \
  grep -v en-US | \
  xargs -L 1 bash -c \
  "cp -v $SOURCE messages/$COMPONENT/$COMPONENT.\$0.yml"

