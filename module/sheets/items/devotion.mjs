import BaseItemSheet from "./baseitem.mjs";

export default class DevotionItemSheet extends BaseItemSheet {
    static DEFAULT_OPTIONS = {
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        }
    };

    static PARTS = {
        main: {
            template: "systems/temeraire/templates/items/devotion.hbs"
        }
    };
}