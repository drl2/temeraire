import {HumanPCActorModel, DragonPCActorModel, NPCActorModel} from "./module/models/actors.mjs";
import {AbilityItemModel, BondItemModel, ConnectionItemModel, CrewItemModel,
    DesireItemModel, ResourceItemModel, EquipmentItemModel, AreaOfExpertiseItemModel, DutyItemModel, TraitItemModel
    } from "./module/models/items.mjs";
import HumanPCSheet from "./module/sheets/actors/humanpc.mjs";
import DragonPCSheet from "./module/sheets/actors/dragonpc.mjs";
import NPCActorSheet from "./module/sheets/actors/npc.mjs";
import AbilityItemSheet from "./module/sheets/items/ability.mjs";
import BondItemSheet from "./module/sheets/items/bond.mjs";
import ConnectionItemSheet from "./module/sheets/items/connection.mjs";
import CrewItemSheet from "./module/sheets/items/crew.mjs";
import DutyItemSheet from "./module/sheets/items/duty.mjs";
import DesireItemSheet from "./module/sheets/items/desire.mjs";
import ResourceItemSheet from "./module/sheets/items/resource.mjs";
import EquipmentItemSheet from "./module/sheets/items/equipment.mjs";
import AreaOfExpertiseItemSheet from "./module/sheets/items/areaofexpertise.mjs";
import TraitItemSheet from "./module/sheets/items/trait.mjs";


Hooks.once("init", async () => {
     await foundry.applications.handlebars.loadTemplates([
        "systems/temeraire/templates/actors/bio.hbs",
        "systems/temeraire/templates/actors/devotions.hbs",
        "systems/temeraire/templates/actors/personal.hbs",
        "systems/temeraire/templates/actors/resources.hbs",
        "systems/temeraire/templates/actors/pcheader.hbs",
        "systems/temeraire/templates/actors/sidebar.hbs",
        "systems/temeraire/templates/actors/dangers.hbs",
        "systems/temeraire/templates/dialogs/initiativeSetup.hbs",
        "systems/temeraire/templates/chatcards/initiativeRoll.hbs"
    ]);

    CONFIG.Actor.dataModels = {
        "humancharacter": HumanPCActorModel,
        "dragoncharacter": DragonPCActorModel,
        "npc": NPCActorModel
    };

    CONFIG.Item.dataModels = {
        "ability": AbilityItemModel,
        "bond": BondItemModel,
        "connection": ConnectionItemModel,
        "crew": CrewItemModel,
        "duty": DutyItemModel,
        "desire": DesireItemModel,
        "resource": ResourceItemModel,
        "equipment": EquipmentItemModel,
        "areaofexpertise": AreaOfExpertiseItemModel,
        "trait": TraitItemModel
    };

    const {DocumentSheetConfig} = foundry.applications.apps;
    const actorClass = CONFIG.Actor.documentClass;
    const itemClass = CONFIG.Item.documentClass;
    

    DocumentSheetConfig.unregisterSheet(actorClass, "core", foundry.appv1.sheets.ActorSheet);
    DocumentSheetConfig.registerSheet(actorClass, "temeraire", HumanPCSheet, { types: ["humancharacter"], makeDefault: true });
    DocumentSheetConfig.registerSheet(actorClass, "temeraire", DragonPCSheet, { types: ["dragoncharacter"], makeDefault: true });
    DocumentSheetConfig.registerSheet(actorClass, "temeraire", NPCActorSheet, { types: ["npc"], makeDefault: true });

    DocumentSheetConfig.unregisterSheet(itemClass, "core", foundry.appv1.sheets.ItemSheet);
    DocumentSheetConfig.registerSheet(itemClass, "temeraire", AbilityItemSheet, { types: ["ability"], makeDefault: true });
    DocumentSheetConfig.registerSheet(itemClass, "temeraire", BondItemSheet, { types: ["bond"], makeDefault: true });
    DocumentSheetConfig.registerSheet(itemClass, "temeraire", ConnectionItemSheet, { types: ["connection"], makeDefault: true });
    DocumentSheetConfig.registerSheet(itemClass, "temeraire", CrewItemSheet, { types: ["crew"], makeDefault: true });
    DocumentSheetConfig.registerSheet(itemClass, "temeraire", DutyItemSheet, { types: ["duty"], makeDefault: true });
    DocumentSheetConfig.registerSheet(itemClass, "temeraire", DesireItemSheet, { types: ["desire"], makeDefault: true });
    DocumentSheetConfig.registerSheet(itemClass, "temeraire", ResourceItemSheet, { types: ["resource"], makeDefault: true });
    DocumentSheetConfig.registerSheet(itemClass, "temeraire", EquipmentItemSheet, { types: ["equipment"], makeDefault: true });
    DocumentSheetConfig.registerSheet(itemClass, "temeraire", AreaOfExpertiseItemSheet, { types: ["areaofexpertise"], makeDefault: true });
    DocumentSheetConfig.registerSheet(itemClass, "temeraire", TraitItemSheet, { types: ["trait"], makeDefault: true });

    const BaseActor = CONFIG.Actor.documentClass;
    CONFIG.Actor.documentClass = class TemeraireActor extends BaseActor {
        static getDefaultArtwork(actorData) {
            const artwork = super.getDefaultArtwork(actorData);
            if (actorData.type === "dragoncharacter") {
                return { ...artwork, img: "systems/temeraire/assets/actors/dragon.svg" };
            }

            return artwork;
        }
    };

    const BaseItem = CONFIG.Item.documentClass;

    CONFIG.Item.documentClass = class TemeraireItem extends BaseItem {
        static getDefaultArtwork(itemData) {
            const images = {
                duty: "systems/temeraire/assets/items/duty.svg",
                desire: "systems/temeraire/assets/items/desire.svg",
                resource: "systems/temeraire/assets/items/resource.svg",
                bond: "systems/temeraire/assets/items/bond.svg",
                connection: "systems/temeraire/assets/items/connection.svg",
                crew: "systems/temeraire/assets/items/crew.svg",
                ability: "systems/temeraire/assets/items/ability.svg",
                areaofexpertise: "systems/temeraire/assets/items/area-of-expertise.svg",
                trait: "systems/temeraire/assets/items/trait.svg",
                equipment: "systems/temeraire/assets/items/equipment.svg"
            };

            return images[itemData.type]
                ? { img: images[itemData.type] }
                : super.getDefaultArtwork(itemData);
        }
    };

    // Override Combat.getInitiativeFormula for custom initiative rolling
    const BaseCombat = CONFIG.Combat.documentClass;
    CONFIG.Combat.documentClass = class TemeraireCombat extends BaseCombat {
        async rollNPC(options = {}) {
            const skillAttribute = this.getFlag("temeraire", "initiativeSkillAttribute");
            if (!skillAttribute) {
                ui.notifications.warn(game.i18n.localize("Temeraire.InitiativeNotConfigured"));
                return this;
            }
            console.log("rollNPC called");
            // Get only NPC combatants
            const npcIds = this.combatants
                .filter(c => c.actor?.type === "npc")
                .map(c => c.id);
            console.log("Rolling NPCs only:", npcIds.length, "NPCs");
            return this.rollInitiative(npcIds, options);
        }
        
        async rollInitiative(ids = [], options = {}) {
            const skillAttribute = this.getFlag("temeraire", "initiativeSkillAttribute");
            
            // Check if skill attribute has been selected
            if (!skillAttribute) {
                ui.notifications.warn(game.i18n.localize("Temeraire.InitiativeNotConfigured"));
                return this;
            }
            
            console.log("rollInitiative called. skillAttribute flag:", skillAttribute, "ids:", ids, "options:", options);
            
            // Log what combatants are being passed
            for (const cId of ids) {
                const c = this.combatants.get(cId);
                console.log(`  Combatant: ${c.actor?.name} (type: ${c.actor?.type})`);
            }
            
            // If no skill attribute set, use default Foundry behavior
            if (!skillAttribute) {
                console.log("No custom initiative skill set, using default behavior");
                return super.rollInitiative(ids, options);
            }
            
            // If manual mode, don't roll anything
            if (skillAttribute === "manual") {
                console.log("Manual mode: skipping rolls completely");
                return this;
            }
            
            // Non-manual mode: build and execute rolls manually
            console.log("Non-manual mode: building custom rolls");
            
            const results = [];
            for (const combatantId of ids) {
                const combatant = this.combatants.get(combatantId);
                if (!combatant) continue;
                
                const actor = combatant.actor;
                if (!actor) continue;
                
                const [attrName, skillName] = skillAttribute.split(".");
                const attribute = actor.system.attributes?.[attrName];
                
                if (!attribute) {
                    console.warn("No attribute found for", actor.name, attrName);
                    continue;
                }
                
                const attrValue = Number(attribute.value) || 0;
                const skillValue = Number(attribute[skillName]) || 0;
                
                let formula;
                if (actor.type === "npc") {
                    const dice = Math.max(1, attrValue);
                    formula = `${dice}d6`;
                    console.log(`NPC ${actor.name}: ${formula}`);
                } else {
                    const trainedBonus = skillValue >= 1 ? 1 : 0;
                    const diceToRoll = Math.max(1, attrValue + trainedBonus);
                    formula = `${diceToRoll}d6`;
                    console.log(`PC ${actor.name}: ${formula}`);
                }
                
                // Roll the formula
                const roll = new Roll(formula);
                await roll.evaluate();
                
                // Count hits (5s and 6s on d6 dice)
                const hits = roll.dice[0]?.results?.filter(r => r.result >= 5).length || 0;
                console.log(`Roll result for ${actor.name}: ${formula} = ${hits} hits`);
                
                results.push({
                    id: combatantId,
                    roll: roll,
                    hits: hits
                });
            }
            
            // Update combatant initiatives with hit counts
            for (const result of results) {
                await this.setInitiative(result.id, result.hits);
            }
            
            // Emit the rollInitiative hook to trigger chat card creation
            Hooks.callAll("rollInitiative", this, results);
            
            return this;
        }
        
        getInitiativeFormula(combatantId) {
            console.log("getInitiativeFormula called for combatant:", combatantId);
            const skillAttribute = this.getFlag("temeraire", "initiativeSkillAttribute");
            console.log("  skillAttribute flag value:", skillAttribute);
            if (!skillAttribute) {
                console.log("  No skillAttribute, using default");
                return super.getInitiativeFormula(combatantId);
            }
            
            // Manual means no automatic roll - combatants order manually
            if (skillAttribute === "manual") {
                return "1d20";
            }
            
            const combatant = this.combatants.get(combatantId);
            const actor = combatant.actor;
            if (!actor) {
                console.warn("getInitiativeFormula: no actor found for combatant", combatantId);
                return super.getInitiativeFormula(combatantId);
            }
            
            const [attrName, skillName] = skillAttribute.split(".");
            const attribute = actor.system.attributes?.[attrName];
            if (!attribute) {
                console.warn("getInitiativeFormula: no attribute found", attrName, "in", actor.name, actor.system.attributes);
                return super.getInitiativeFormula(combatantId);
            }
            
            const attrValue = Number(attribute.value) || 0;
            const skillValue = Number(attribute[skillName]) || 0;
            
            console.log(`getInitiativeFormula for ${actor.name}: attrName=${attrName}, skillName=${skillName}, attrValue=${attrValue}, skillValue=${skillValue}, type=${actor.type}`);
            
            // NPCs roll just attribute value dice
            if (actor.type === "npc") {
                const dice = Math.max(1, attrValue);
                const formula = `${dice}d6`;
                console.log(`NPC formula: ${formula}`);
                return formula;
            }
            
            // PCs get trained/adept/master bonuses
            const trainedBonus = skillValue >= 1 ? 1 : 0;
            const diceToRoll = Math.max(1, attrValue + trainedBonus);
            const formula = `${diceToRoll}d6`;
            console.log(`PC formula: ${formula}`);
            
            return formula;
        }
    };
});

// Helper function to build all skill/attribute combinations
function buildInitiativeSkillOptions() {
    const attributes = {
        body: ["agility", "force", "lethality"],
        cunning: ["attention", "guile", "intuition"],
        manners: ["performance", "persuasion", "propriety"],
        steel: ["coercion", "direction", "endurance"]
    };
    
    const options = [];
    for (const [attrName, skills] of Object.entries(attributes)) {
        const attrLabel = game.i18n.localize(`Temeraire.ATTRIBUTES.${attrName}.label`);
        for (const skill of skills) {
            const skillLabel = game.i18n.localize(`Temeraire.ATTRIBUTES.${attrName}.${skill}`);
            options.push({
                value: `${attrName}.${skill}`,
                label: `${attrLabel}: ${skillLabel}`
            });
        }
    }
    return options;
}

// Hook for combat start - let GM select initiative skill/attribute
Hooks.on("combatStart", async (combat) => {
    if (!game.user.isGM) return;
    if (combat.getFlag("temeraire", "initiativeSkillAttribute")) return;
    
    const skillOptions = buildInitiativeSkillOptions();
    
    const content = await foundry.applications.handlebars.renderTemplate(
        "systems/temeraire/templates/dialogs/initiativeSetup.hbs",
        { skillOptions }
    );
    
    let selectedSkill = "manual"; // Default to manual
    
    // Create dialog instance with proper form handling
    const dialog = new foundry.applications.api.DialogV2({
        window: { 
            title: game.i18n.localize("Temeraire.InitiativeSetupTitle"),
            positioned: true,
            width: 400
        },
        content,
        buttons: [{
            action: "confirm",
            label: "Temeraire.Confirm",
            type: "button",
            callback: (event) => {
                // Capture value when button is clicked
                const form = event.currentTarget.closest(".dialog")?.querySelector("form");
                if (form) {
                    const select = form.querySelector("select[name='skillAttribute']");
                    selectedSkill = select?.value || "manual";
                    console.log("Selected skill in callback:", selectedSkill);
                }
            }
        }]
    });
    
    await dialog.render(true);
    const action = await new Promise(resolve => {
        const origClose = dialog.close.bind(dialog);
        dialog.close = async (options) => {
            resolve(true);
            return origClose(options);
        };
    });
    
    if (selectedSkill) {
        console.log("Setting initiative mode to:", selectedSkill);
        await combat.setFlag("temeraire", "initiativeSkillAttribute", selectedSkill);
        
        // In manual mode, set all combatants to initiative 0 so GM can edit them
        if (selectedSkill === "manual") {
            const updates = combat.combatants.map(c => ({
                _id: c.id,
                initiative: 0
            }));
            await combat.updateEmbeddedDocuments("Combatant", updates);
            console.log("Manual mode: Set all combatants to initiative 0");
        } else {
            console.log("Flag set. Players can now roll initiative with selected skill/attribute.");
        }
    }
});

// Hook to process initiative rolls and create chat card
Hooks.on("rollInitiative", async (combat, results) => {
    const skillAttribute = combat.getFlag("temeraire", "initiativeSkillAttribute");
    if (!skillAttribute) return;
    
    const combatants = results.map(result => {
        const combatant = combat.combatants.get(result.id);
        const actor = combatant.actor;
        const roll = result.roll;
        
        // Count hits (5 or 6 on each die)
        const rolls = roll.dice[0]?.results?.map(r => r.result) || [];
        const hits = rolls.filter(r => r >= 5).length;
        
        return {
            id: combatant.id,
            name: combatant.name,
            isNpc: actor?.type === "npc",
            rolls,
            hits
        };
    });
    
    const content = await foundry.applications.handlebars.renderTemplate(
        "systems/temeraire/templates/chatcards/initiativeRoll.hbs",
        { combatants }
    );
    
    // Find first PC vs NPC order
    const pcs = combatants.filter(c => !c.isNpc);
    const npcs = combatants.filter(c => c.isNpc);
    
    // Sort and resolve ties (PCs go first)
    const sortedCombatants = [];
    const sortByHits = (a, b) => b.hits - a.hits;
    
    pcs.sort(sortByHits);
    npcs.sort(sortByHits);
    
    for (let i = 0; i < Math.max(pcs.length, npcs.length); i++) {
        if (i < pcs.length) sortedCombatants.push(pcs[i]);
        if (i < npcs.length) sortedCombatants.push(npcs[i]);
    }
    
    // Update combat tracker with sorted results
    const turns = [];
    sortedCombatants.forEach((c, index) => {
        turns.push({
            _id: c.id,
            initiative: c.hits  // Set initiative to the hit count
        });
    });
    
    await combat.updateEmbeddedDocuments("Combatant", turns);
    
    // Post chat card
    await ChatMessage.create({
        speaker: { alias: game.i18n.localize("Temeraire.InitiativeRoll") },
        content
    });
});

