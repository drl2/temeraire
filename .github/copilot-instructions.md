# Temeraire Foundry System

This repository is a Foundry VTT game system for the Temeraire tabletop RPG.

## Project structure

- `temeraire.mjs`: system initialization and registration
- `module/models/`: Actor and Item data models
- `module/sheets/`: application and character sheet classes
- `templates/`: Handlebars sheet templates
- `less/temeraire.less`: source styles
- `temeraire.css`: compiled CSS
- `lang/en.json`: localization strings
- `packs/`: Foundry compendium packs
- `system.json`: system metadata, document types, and entry points

## Important conventions

- Use ES modules.
- Target Foundry VTT version 14, using appv2 and avoiding deprecated APIs and feattures.
- Actor types include `humancharacter` and `dragoncharacter`.
- Item types include `duty`, `desire`, `resource`, `equipment`, `areaofexpertise`, `connection`, `bond`, `trait`, `ability`, and `crew`.
- Edit LESS source files rather than editing `temeraire.css` directly.
- Compile styles with:
  `lessc less/temeraire.less temeraire.css`

## Before changing code

Inspect nearby model, sheet, and template code first. Preserve existing Foundry document type names and public data fields. Test changes in Foundry after compiling styles.
