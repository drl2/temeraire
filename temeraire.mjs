import {HumanPCActorModel, DragonPCActorModel, NPCActorModel} from "./module/models/actors.mjs";
import {AbilityItemModel, BondItemModel, ConnectionItemModel, CrewItemModel,
    DesireItemModel, ResourceItemModel, EquipmentItemModel, AreaOfExpertiseItemModel
    } from "./module/models/items.mjs";
import HumanPCSheet from "./module/sheets/actors/humanpc.mjs";
import DragonPCSheet from "./module/sheets/actors/dragonpc.mjs";


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
        "duty": DesireItemModel,
        "desire": DesireItemModel,
        "resource": ResourceItemModel,
        "equipment": EquipmentItemModel,
        "areaofexpertise": AreaOfExpertiseItemModel
    };

    const { api, sheets } = foundry.applications;
    const {DocumentSheetConfig} = foundry.applications.apps;
    const actorClass = CONFIG.Actor.documentClass;
    const itemClass = CONFIG.Item.documentClass;
    

    DocumentSheetConfig.unregisterSheet(actorClass, "core", foundry.appv1.sheets.ActorSheet);
    DocumentSheetConfig.registerSheet(actorClass, "temeraire", HumanPCSheet, { types: ["humancharacter"], makeDefault: true });
    DocumentSheetConfig.registerSheet(actorClass, "temeraire", DragonPCSheet, { types: ["dragoncharacter"], makeDefault: true });

    DocumentSheetConfig.unregisterSheet(Item, "core", foundry.appv1.sheets.ItemSheet);


});

