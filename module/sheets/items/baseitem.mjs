const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export default class BaseItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
    static DEFAULT_OPTIONS = {
        tag: 'form',
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            updateUses: this._onUpdateUses,
            changeExpertiseLevel: this._onChangeExpertiseLevel
        }
    };

    static PARTS = {
        main: {
            template: "systems/temeraire/templates/items/baseitem.hbs"
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.multilineName = ["equipment", "resource"].includes(this.document.type);
        const fieldLabels = {
            description: "Description",
            level: "Level",
            rating: "Rating",
            uses: "Uses"
        };

        context.itemFields = Object.entries(this.document.system.toObject()).map(([name, value]) => {
            const isUsesCheckboxes = this.document.type === "resource" && name === "uses";
            const uses = Math.max(0, Math.min(5, Number(value) || 0));
            const isExpertiseLevel = this.document.type === "areaofexpertise" && name === "level";
            const level = Math.max(1, Math.min(3, Number(value) || 1));

            return {
                name,
                value,
                label: `Temeraire.${fieldLabels[name] ?? name}`,
                isBoolean: typeof value === "boolean",
                isTextarea: name === "description",
                isUsesCheckboxes,
                isExpertiseLevel,
                canDecreaseLevel: isExpertiseLevel && level > 1,
                canIncreaseLevel: isExpertiseLevel && level < 3,
                boxes: isUsesCheckboxes ? Array.from({ length: 5 }, (_, index) => ({
                    checked: index < uses,
                    number: index + 1
                })) : [],
                inputType: typeof value === "number" ? "number" : "text"
            };
        });

        return context;
    }

    static async _onUpdateUses(event, target) {
        if (this.document.type !== "resource") return;

        const boxGroup = target.closest(".tem-base-item-sheet__uses-boxes");
        if (!boxGroup) return;

        const uses = boxGroup.querySelectorAll("input[type='checkbox']:checked").length;
        await this.document.update({ "system.uses": uses });
    }

    static async _onChangeExpertiseLevel(event, target) {
        if (this.document.type !== "areaofexpertise") return;

        const delta = Number(target.dataset.delta);
        if (![-1, 1].includes(delta)) return;

        const currentLevel = Math.max(1, Math.min(3, Number(this.document.system.level) || 1));
        const level = Math.max(1, Math.min(3, currentLevel + delta));
        if (level === currentLevel) return;

        await this.document.update({ "system.level": level });
    }
}
