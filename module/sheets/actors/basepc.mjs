const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export default class BaseActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    static DEFAULT_OPTIONS = {
        tag: "form",
        form: {
            submitOnChange: false,
            closeOnSubmit: true
        }
    };

      static PARTS = {
    main: {
      root: true,
      template: "systems/temeraire/templates/actor/humanpc.hbs",
      scrollable: [".items-list.scrollable"]
    }
  };


    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const actor = this.actor;

        const items = {};
        for (const item of actor.items) {
            items[item.type] ??= [];
            items[item.type].push(item);
        }

        context.actor = actor;
        context.system = actor.system;
        context.editable = this.isEditable;
        context.itemsByType = items;
        context.derived = this._prepareDerivedData(actor);

        return context;
    }

    _prepareDerivedData(actor) {
        return {};
    }
}
