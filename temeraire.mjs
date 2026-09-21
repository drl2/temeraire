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


Hooks.once("init", () => {
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


});

