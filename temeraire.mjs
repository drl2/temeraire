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
        "systems/temeraire/templates/actor/bio.hbs",
        "systems/temeraire/templates/actor/devotions.hbs",
        "systems/temeraire/templates/actor/personal.hbs",
        "systems/temeraire/templates/actor/resources.hbs",
        "systems/temeraire/templates/actor/pcheader.hbs",
        "systems/temeraire/templates/actor/sidebar.hbs",
        "systems/temeraire/templates/actor/dangers.hbs"
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

const BaseItem = CONFIG.Item.documentClass;

/* do this later if I can find good icons */
// CONFIG.Item.documentClass = class TemeraireItem extends BaseItem {
//     static getDefaultArtwork(itemData) {
//         const images = {
//             duty: "systems/temeraire/assets/items/resource.webp",
//             desire: "icons/svg/item-bag.svg",
//             resource: "icons/svg/item-bag.svg",
//             bond: "icons/svg/item-bag.svg",
//             connection: "icons/svg/item-bag.svg",
//             crew: "icons/svg/item-bag.svg",
//             ability: "icons/svg/item-bag.svg",
//             areaofexpertise: "icons/svg/item-bag.svg",
//             trait: "icons/svg/item-bag.svg",
//             crew: "icons/svg/item-bag.svg"
//         };

//         return images[itemData.type]
//             ? { img: images[itemData.type] }
//             : super.getDefaultArtwork(itemData);
//     }
// };

});

