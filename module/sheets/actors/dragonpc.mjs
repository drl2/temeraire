import BaseActorSheet from "./basepc.mjs";

export default class DragonPCSheet extends BaseActorSheet {

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        const types = Object.keys(game.i18n.translations.Temeraire.NPC_TYPES)
            .filter(type => type !== "human");

        context.weightclasses = Object.fromEntries([
            ["", ""],
            ...types.map(type => [type, `Temeraire.NPC_TYPES.${type}`])
        ]);


        context.isDragon = true;

        return context;
    }
}
