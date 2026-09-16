const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export default class HumanPCSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    static DEFAULT_OPTIONS = {
        tag: 'form',  // REQUIRED for dialogs and forms
        form: {
            submitOnChange: false,
            closeOnSubmit: true
        }
    }

    async _prepareContext(options) {
        let context = await super._prepareContext(options);
                
console.warn("HumanPCSheet._prepareContext: context=", context);
        return context;
    }

}