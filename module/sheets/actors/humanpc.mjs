import BaseActorSheet from "./basepc.mjs";

export default class HumanPCSheet extends BaseActorSheet {

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        context.isDragon = false;

        return context;
    }
}
