# Temeraire Foundry System Development Plan

## Current status

- Actor models for `humancharacter`, `dragoncharacter`, and `npc` are registered.
- Item models for all ten declared Item types are registered, including `duty` and `trait`.
- Human, Dragon, and NPC actor sheets are registered.
- Each declared Item type has its own sheet class, backed by `BaseItemSheet`.
- `BaseActorSheet` prepares actor data, editability, owned items grouped by type, and a derived-data hook.
- The actor template is still empty, and the concrete actor and Item sheets are currently shell classes.
- Foundry document creation and persistence have not yet been manually verified.

## Next work

1. **Define the game rules contract**
   - Document supported actor and Item types, field names, limits, defaults, derived values, and roll mechanics.
   - Decide which values are editable, calculated, or derived from owned Items.
   - Resolve the exact `npcType` choices and any remaining model validation requirements.

2. **Finish and verify data models**
   - Review schemas in `module/models/actors.mjs` and `module/models/items.mjs`.
   - Correct and verify field defaults, required values, integer constraints, and min/max ranges.
   - Test invalid values during document creation and update; confirm they are rejected without corrupting the document.

3. **Complete shared sheet context**
   - Keep shared actor behavior in `module/sheets/actors/basepc.mjs`.
   - Add configured attribute data for reusable controls and type-specific labels or limits.
   - Add shared Item context where needed in `module/sheets/items/baseitem.mjs`.
   - Add derived values as display-only data unless the rules require persistence.

4. **Implement the actor templates and forms**
   - Build shared markup for biography, attributes, skills, dangers, burdens, and owned Items.
   - Add editable inputs using Foundry document paths such as `system.attributes.body.value`.
   - Give Human, Dragon, and NPC sheets their distinct fields and layouts while reusing common controls.
   - Confirm form submission persists values and read-only users see non-editable output.

5. **Implement Item sheet layouts**
   - Add a template and field controls for each registered Item sheet.
   - Share common form behavior through `BaseItemSheet`, but keep type-specific layouts and fields separate.
   - Confirm numeric, descriptive, and devotion-style Items save and reopen correctly.

6. **Create and verify Foundry test documents**
   - Create one Actor of each supported type: human, dragon, and NPC.
   - Create one Item of every registered type.
   - Confirm each document loads, saves, duplicates, and reopens without validation errors.
   - Test valid and invalid values for representative fields in each model family.
   - Verify the implemented sheets display the saved values and expose the correct editable controls.

7. **Add Item management**
   - Support creating, editing, deleting, sorting, and displaying owned Items from actor sheets.
   - Group owned Items by type using the existing `itemsByType` context.
   - Confirm empty groups and missing owned Items render cleanly.

8. **Add game interactions**
   - Implement attribute and skill rolls.
   - Add controls for danger boxes, burdens, resources, devotion checks, and similar counters.
   - Use Foundry chat messages and notifications consistently.

9. **Add localization and visual styling**
   - Move visible labels, field names, item names, and notifications into `lang/en.json`.
   - Add styles to `less/temeraire.less`, then compile with `lessc less/temeraire.less temeraire.css`.
   - Test desktop and narrow-window layouts, controls, lists, counters, and empty states.

10. **Add regression checks**
    - Test system startup with no console errors.
    - Test every Actor and Item type, including sheet registration.
    - Test form submission, invalid values, deletion, duplication, and reload behavior.
    - Test both GM and player permissions where editing behavior differs.

11. **Package a playable first release**
    - Update `README.md` with installation, supported features, and known limitations.
    - Replace placeholder author metadata in `system.json`.
    - Increment the system version.
    - Create sample Actors, Items, or compendium content for manual testing.

## Current milestone

The registration and model/sheet scaffolding is in place. The next milestone is a usable Human character sheet with shared context, editable core fields, and persistence verified in Foundry. Dragon and NPC layouts, Item templates, and game interactions follow after that foundation.
