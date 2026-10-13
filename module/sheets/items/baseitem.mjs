const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export default class BaseItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
    static DEFAULT_OPTIONS = {
        tag: 'form',
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        }
    };

    static PARTS = {
        main: {
            template: "systems/temeraire/templates/items/baseitem.hbs"
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const fieldLabels = {
            description: "Description",
            level: "Level",
            rating: "Rating",
            uses: "Uses"
        };

        context.itemFields = Object.entries(this.document.system.toObject()).map(([name, value]) => ({
            name,
            value,
            label: `Temeraire.${fieldLabels[name] ?? name}`,
            isBoolean: typeof value === "boolean",
            isTextarea: name === "description",
            inputType: typeof value === "number" ? "number" : "text"
        }));

        return context;
    }
}
