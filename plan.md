# Temeraire Foundry System Development Plan

1. **Define the game rules contract**
   - Document actor types, item types, fields, limits, derived values, and roll mechanics.
   - Decide which fields are editable, calculated, or derived from owned Items.

2. **Correct system registration**
   - Reconcile declarations in `system.json` with registrations in `temeraire.mjs`.
   - Add or remove the `npc` actor type consistently.
   - Register proper models for `duty` and `trait`; currently `duty` maps to `DesireItemModel`, while several imported models are unused.

3. **Finish data models**
   - Complete schemas in `module/models/actors.mjs` and `module/models/items.mjs`.
   - Add defaults, validation ranges, and derived data.
   - Verify that invalid values are rejected cleanly.

4. **Create test documents**
   - In Foundry, create one actor of each supported type.
   - Create one Item of every supported type.
   - Confirm documents load, save, duplicate, and reopen without validation errors.

5. **Build shared sheet context**
   - Implement `_prepareContext` in the actor sheets.
   - Expose actor data, owned items grouped by type, editable state, and derived values.
   - Remove temporary `console.warn` logging.

6. **Implement the human character sheet**
   - Build the template structure for biography, attributes, skills, dangers, burdens, and owned Items.
   - Add editable form fields using Foundry document paths.
   - Confirm values persist after submitting and reopening.

7. **Implement the dragon character sheet**
   - Reuse shared character-sheet structure where appropriate.
   - Add dragon-specific biography fields such as breed, age, education, and weight class.
   - Keep human- and dragon-specific presentation separate without duplicating all logic.

8. **Add Item management**
   - Support creating, editing, deleting, sorting, and displaying owned Items.
   - Add suitable Item sheets for descriptive and numeric Item types.
   - Ensure every declared Item type has a usable model and sheet behavior.

9. **Add game interactions**
   - Implement attribute or skill rolls.
   - Add controls for danger boxes, burdens, resources, devotion checks, and similar counters.
   - Use Foundry chat messages and notifications consistently.

10. **Add localization**
    - Move visible labels, field names, item names, and notifications into `lang/en.json`.
    - Avoid hard-coded user-facing text in templates and JavaScript.

11. **Build the visual system**
    - Add styles to `less/temeraire.less`, then compile with:
      `lessc less/temeraire.less temeraire.css`
    - Style desktop and narrow-window layouts.
    - Test form controls, tabs, lists, counters, and empty states in Foundry.

12. **Add regression checks**
    - Test system startup with no console errors.
    - Test every actor and Item type.
    - Test form submission, invalid values, deletion, duplication, and reload behavior.
    - Test both a GM and player user where permissions affect behavior.

13. **Package a playable first release**
    - Update `README.md` with installation, supported features, and known limitations.
    - Replace placeholder author metadata in `system.json`.
    - Increment the system version.
    - Create a small sample world or compendium content for manual testing.

## First milestone

All document types register correctly, human and dragon actors can be created, and both sheets can edit and persist their core fields. Everything else can build on that stable foundation.
