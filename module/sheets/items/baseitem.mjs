const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export default class BaseItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
    static DEFAULT_OPTIONS = {
        tag: 'form',
        form: {
            submitOnChange: false,
            closeOnSubmit: true
        }
    }

    async _prepareContext(options) {
        return super._prepareContext(options);
    }
}
