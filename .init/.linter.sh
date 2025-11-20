#!/bin/bash
cd /tmp/kavia/workspace/code-generation/react-to-do-list-244-253/todo_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

