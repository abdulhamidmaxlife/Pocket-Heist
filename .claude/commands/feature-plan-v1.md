 ---
description: Create a feature plan file using a spec file
argument-hint: Spec file (markdown)
allowed-tools: Read, Write, Glob, Bash(git switch:*)
---

You are helping to spin up a detailed feature plan for this application, from a spec file provided in the user input below. Always adhere to any rules or requirements set out in any CLAUDE.md files when responding.

User input: $ARGUMENTS

## High level behavior

Your job will be to plan (in Plan mode) the feature described in this above spec (provided as user input above) into:

- You should explore the project codebase understand existing patterns and then design the implementation plan.
- Provide code example whereever required
- Use the exact structure as defined in the plan template file here: @_plans/template.md
- You need to create a detailed markdown plan file (<feature_slug>.md) under the @_plans/ directory

Then save the plan file (exit Plan mode and switch to Write mode) to disk and print a short summary of what you did.

After the file is saved, respond to the user with a short summary in this exact format:

Branch: <branch_name>
Plan file: @_plans/<feature_slug>.md
Title: <feature_title>

You DO NOT implement the plan, you only create the plan file and save it in the folder @_plans/. The implementation will be done in a separate task after this. You should not write any code for the feature in this task, only the plan file with detailed steps and code examples where necessary.