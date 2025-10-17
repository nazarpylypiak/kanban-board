#!/bin/bash
export NX_TASKS_RUNNER_OUTPUT_STYLE=dynamic
cd ~/VSCodeProjects/kanban-board || exit

while true; do
  npx nx run-many -t serve
  echo "Press Ctrl+C to stop or wait 5s to restart..."
  sleep 5
done
