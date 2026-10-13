const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

async function updateItemAndRestoreScroll(sheet, item, updates) {
    const windowContent = sheet.element.querySelector(".window-content");
    const scrollTop = windowContent?.scrollTop;

    await item.update(updates);

    if (scrollTop === undefined) return;

    await new Promise(resolve => requestAnimationFrame(resolve));
    const refreshedWindowContent = sheet.element.querySelector(".window-content");
    if (refreshedWindowContent) refreshedWindowContent.scrollTop = scrollTop;
}

export default class BaseActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    static DEFAULT_OPTIONS = {
        classes: ["temeraire-sheet"],
        window: {
            resizable: true
        },
        position: {
            width: 700,
            height: 600
        },
        tag: "form",
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            createAreaOfExpertise: this._onCreateAreaOfExpertise,
            editAreaOfExpertise: this._onEditAreaOfExpertise,
            deleteAreaOfExpertise: this._onDeleteAreaOfExpertise,
            createConnection: this._onCreateConnection,
            editConnection: this._onEditConnection,
            deleteConnection: this._onDeleteConnection,
            updateDangerChecked: this._onUpdateDangerChecked,
            changeDangerBoxes: this._onChangeDangerBoxes,
            createDevotionItem: this._onCreateDevotionItem,
            editDevotionItem: this._onEditDevotionItem,
            deleteDevotionItem: this._onDeleteDevotionItem,
            updateDevotionChecked: this._onUpdateDevotionChecked,
            updateDevotionDenied: this._onUpdateDevotionDenied,
            changeDevotionRank: this._onChangeDevotionRank,
            createPersonalItem: this._onCreatePersonalItem,
            editPersonalItem: this._onEditPersonalItem,
            deletePersonalItem: this._onDeletePersonalItem,
            createResourceItem: this._onCreateResourceItem,
            editResourceItem: this._onEditResourceItem,
            deleteResourceItem: this._onDeleteResourceItem,
            updateResourceUses: this._onUpdateResourceUses,
            updateBurdenChecked: this._onUpdateBurdenChecked
        }
    };

    static PARTS = {
        main: {
            root: true,
            template: "systems/temeraire/templates/actor/main.hbs"
        }
    };

    static TABS = {
        primary: {
            initial: "bio",
            labelPrefix: "Temeraire.TABS",
            tabs: [
                { id: "bio" },
                { id: "devotions" },
                { id: "personal" },
                { id: "resources" }
            ]
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
        context.resourceRows = (items.resource ?? []).map(item => {
            const uses = Math.max(0, Math.min(5, Number(item.system.uses ?? 1)));
            return {
                id: item.id,
                name: item.name,
                uses,
                description: item.system.description,
                boxes: Array.from({ length: 5 }, (_, index) => ({
                    checked: index < uses,
                    number: index + 1
                }))
            };
        });
        context.devotionRows = Object.fromEntries(["duty", "desire"].map(type => [
            type,
            (items[type] ?? []).map(item => {
                const rank = Math.max(0, Math.min(5, Number(item.system.rank) || 0));
                const checked = Math.min(Math.max(0, Number(item.system.checked) || 0), rank);

                return {
                    id: item.id,
                    name: item.name,
                    denied: item.system.denied,
                    rank,
                    boxes: Array.from({ length: rank }, (_, index) => ({
                        checked: index < checked,
                        number: index + 1
                    })),
                    atMinimumRank: rank <= 0,
                    atMaximumRank: rank >= 5
                };
            })
        ]));
        context.burdenBoxes = Object.fromEntries(
            Object.entries(actor.system.burdens ?? {}).map(([name, checked]) => [
                name,
                Array.from({ length: 5 }, (_, index) => ({
                    number: index + 1,
                    checked: index < checked
                }))
            ])
        );
        context.dangerRows = Object.entries(actor.system.dangers ?? {}).map(([name, danger]) => ({
            name,
            value: danger.value,
            boxes: Array.from({ length: danger.boxes }, (_, index) => ({
                checked: index < danger.checked,
                number: index + 1
            })),
            atMinimumBoxes: danger.boxes <= 2,
            atMaximumBoxes: danger.boxes >= 4
        }));

        context.tabs = this._prepareTabs("primary");

        context.derived = this._prepareDerivedData(actor);

        return context;
    }

    _prepareDerivedData(actor) {
        return {};
    }

    async _preparePartContext(partId, context, options) {
        context = await super._preparePartContext(partId, context, options);
        if (partId in context.tabs) context.tab = context.tabs[partId];
        return context;
    }

    async _onChangeForm(formConfig, event) {
        const target = event.target;
        const itemId = target.dataset.areaOfExpertiseLevel;
        if (!itemId) return super._onChangeForm(formConfig, event);

        const item = this.actor.items.get(itemId);
        const level = Number(target.value);
        if (!item || item.type !== "areaofexpertise" || ![1, 2, 3].includes(level)) return;

        await updateItemAndRestoreScroll(this, item, { "system.level": level });
    }



    /* user event handlers */

    static async _onCreateAreaOfExpertise(event, target) {
        await this.actor.createEmbeddedDocuments("Item", [{
            name: game.i18n.localize("Temeraire.NewAreaOfExpertise"),
            type: "areaofexpertise"
        }]);
    }

    static async _onCreateConnection(event, target) {
        await this.actor.createEmbeddedDocuments("Item", [{
            name: game.i18n.localize("Temeraire.NewConnection"),
            type: "connection"
        }]);
    }

    static async _onCreateDevotionItem(event, target) {
        const itemType = target.dataset.itemType;
        const nameKeys = {
            duty: "Temeraire.NewDuty",
            desire: "Temeraire.NewDesire"
        };
        const nameKey = nameKeys[itemType];
        if (!nameKey) return;

        await this.actor.createEmbeddedDocuments("Item", [{
            name: game.i18n.localize(nameKey),
            type: itemType
        }]);
    }

    static async _onEditDevotionItem(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        await item?.sheet?.render(true);
    }

    static async _onDeleteDevotionItem(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        if (!item || !["duty", "desire"].includes(item.type)) return;

        const titleKey = item.type === "duty" ? "Temeraire.DeleteDuty" : "Temeraire.DeleteDesire";
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize(titleKey) },
            content: game.i18n.format("Temeraire.ConfirmDeleteDevotion", { name: item.name }),
            rejectClose: false
        });
        if (!confirmed) return;

        await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
    }

    static async _onUpdateDevotionChecked(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        if (!item || !["duty", "desire"].includes(item.type)) return;

        const boxGroup = target.closest(".tem-devotions__rank-boxes");
        const checked = boxGroup.querySelectorAll("input[type='checkbox']:checked").length;
        await updateItemAndRestoreScroll(this, item, { "system.checked": checked });
    }

    static async _onUpdateDevotionDenied(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        if (!item || !["duty", "desire"].includes(item.type)) return;

        await updateItemAndRestoreScroll(this, item, { "system.denied": target.checked });
    }

    static async _onChangeDevotionRank(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        const delta = Number(target.dataset.delta);
        if (!item || !["duty", "desire"].includes(item.type) || ![-1, 1].includes(delta)) return;

        const rank = Math.max(0, Math.min(5, item.system.rank + delta));
        const checked = Math.min(item.system.checked, rank);
        if (rank === item.system.rank && checked === item.system.checked) return;

        await updateItemAndRestoreScroll(this, item, {
            "system.rank": rank,
            "system.checked": checked
        });
    }

    static async _onCreatePersonalItem(event, target) {
        const itemType = target.dataset.itemType;
        const nameKeys = {
            bond: "Temeraire.NewBond",
            trait: "Temeraire.NewTrait",
            ability: "Temeraire.NewAbility"
        };
        const nameKey = nameKeys[itemType];
        if (!nameKey) return;

        await this.actor.createEmbeddedDocuments("Item", [{
            name: game.i18n.localize(nameKey),
            type: itemType
        }]);
    }

    static async _onEditPersonalItem(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        if (!item || !["bond", "trait", "ability"].includes(item.type)) return;

        await item.sheet?.render(true);
    }

    static async _onDeletePersonalItem(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        if (!item || !["bond", "trait", "ability"].includes(item.type)) return;

        const titleKey = `Temeraire.Delete${item.type[0].toUpperCase()}${item.type.slice(1)}`;
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize(titleKey) },
            content: game.i18n.format("Temeraire.ConfirmDeletePersonalItem", { name: item.name }),
            rejectClose: false
        });
        if (!confirmed) return;

        await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
    }

    static async _onCreateResourceItem(event, target) {
        const itemType = target.dataset.itemType;
        const nameKeys = {
            resource: "Temeraire.NewResource",
            equipment: "Temeraire.NewEquipment",
            crew: "Temeraire.NewCrew"
        };
        const nameKey = nameKeys[itemType];
        if (!nameKey) return;

        await this.actor.createEmbeddedDocuments("Item", [{
            name: game.i18n.localize(nameKey),
            type: itemType
        }]);
    }

    static async _onEditResourceItem(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        if (!item || !["resource", "equipment", "crew"].includes(item.type)) return;

        await item.sheet?.render(true);
    }

    static async _onDeleteResourceItem(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        if (!item || !["resource", "equipment", "crew"].includes(item.type)) return;

        const titleKey = `Temeraire.Delete${item.type[0].toUpperCase()}${item.type.slice(1)}`;
        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize(titleKey) },
            content: game.i18n.format("Temeraire.ConfirmDeleteResourceItem", { name: item.name }),
            rejectClose: false
        });
        if (!confirmed) return;

        await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
    }

    static async _onUpdateResourceUses(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        if (!item || item.type !== "resource") return;

        const boxGroup = target.closest(".tem-resources__uses-boxes");
        const uses = boxGroup.querySelectorAll("input[type='checkbox']:checked").length;
        await updateItemAndRestoreScroll(this, item, { "system.uses": uses });
    }

    static async _onEditAreaOfExpertise(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        await item?.sheet?.render(true);
    }

    static async _onEditConnection(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        await item?.sheet?.render(true);
    }

    static async _onUpdateDangerChecked(event, target) {
        const dangerName = target.dataset.dangerName;
        const dangerRow = target.closest(".tem-sidebar__danger");
        const checked = dangerRow.querySelectorAll("input[type='checkbox']:checked").length;
        const windowContent = this.element.querySelector(".window-content");
        const scrollTop = windowContent?.scrollTop;

        await this.actor.update({ [`system.dangers.${dangerName}.checked`]: checked });

        if (scrollTop === undefined) return;

        await new Promise(resolve => requestAnimationFrame(resolve));
        const refreshedWindowContent = this.element.querySelector(".window-content");
        if (refreshedWindowContent) refreshedWindowContent.scrollTop = scrollTop;
    }

    static async _onUpdateBurdenChecked(event, target) {
        const burdenName = target.dataset.burden;
        if (!["duty", "desire"].includes(burdenName)) return;

        const burdenRow = target.closest(".tem-devotions__burden-boxes");
        const checked = burdenRow.querySelectorAll("input[type='checkbox']:checked").length;

        await this.actor.update({ [`system.burdens.${burdenName}`]: checked });
    }

    static async _onChangeDangerBoxes(event, target) {
        const dangerName = target.dataset.dangerName;
        const danger = this.actor.system.dangers[dangerName];
        const delta = Number(target.dataset.delta);
        if (!danger || ![-1, 1].includes(delta)) return;

        const boxes = Math.max(2, Math.min(4, danger.boxes + delta));
        const checked = Math.min(danger.checked, boxes);
        if (boxes === danger.boxes && checked === danger.checked) return;

        const windowContent = this.element.querySelector(".window-content");
        const scrollTop = windowContent?.scrollTop;

        await this.actor.update({
            [`system.dangers.${dangerName}.boxes`]: boxes,
            [`system.dangers.${dangerName}.checked`]: checked
        });

        if (scrollTop === undefined) return;

        await new Promise(resolve => requestAnimationFrame(resolve));
        const refreshedWindowContent = this.element.querySelector(".window-content");
        if (refreshedWindowContent) refreshedWindowContent.scrollTop = scrollTop;
    }

    static async _onDeleteConnection(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        if (!item) return;

        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("Temeraire.DeleteConnection") },
            content: game.i18n.format("Temeraire.ConfirmDeleteConnection", { name: item.name }),
            rejectClose: false
        });
        if (!confirmed) return;

        await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
    }

    static async _onDeleteAreaOfExpertise(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        if (!item) return;

        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("Temeraire.DeleteAreaOfExpertise") },
            content: game.i18n.format("Temeraire.ConfirmDeleteAreaOfExpertise", { name: item.name }),
            rejectClose: false
        });
        if (!confirmed) return;

        await this.actor.deleteEmbeddedDocuments("Item", [item.id]);
    }



}
