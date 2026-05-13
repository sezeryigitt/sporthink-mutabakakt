#!/bin/sh

EXPECTED_NAME="Sezer Yiğit"
EXPECTED_EMAIL="sezeryigit.tr@gmail.com"

CURRENT_NAME="$(git config user.name)"
CURRENT_EMAIL="$(git config user.email)"

if [ "$CURRENT_NAME" != "$EXPECTED_NAME" ]; then
  echo "Wrong git user.name: $CURRENT_NAME"
  echo "Expected: $EXPECTED_NAME"
  exit 1
fi

if [ "$CURRENT_EMAIL" != "$EXPECTED_EMAIL" ]; then
  echo "Wrong git user.email: $CURRENT_EMAIL"
  echo "Expected: $EXPECTED_EMAIL"
  exit 1
fi

echo "Git identity verified: $CURRENT_NAME <$CURRENT_EMAIL>"
exit 0