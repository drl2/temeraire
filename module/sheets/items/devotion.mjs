import BaseItemSheet from "./baseitem.mjs";

export default class DevotionItemSheet extends BaseItemSheet {
    static DEFAULT_OPTIONS = {
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            changeRank: this._onChangeRank,
            updateChecked: this._onUpdateChecked
        }
    };

    static PARTS = {
        main: {
            template: "systems/temeraire/templates/items/devotion.hbs"
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.multilineName = ["duty", "desire"].includes(this.document.type);
        const rank = Math.max(0, Math.min(5, Number(this.document.system.rank) || 0));
        const checked = Math.min(Math.max(0, Number(this.document.system.checked) || 0), rank);
        context.canDecreaseRank = rank > 0;
        context.canIncreaseRank = rank < 5;
        const typeLabels = this.document.type === "duty"
            ? { group: "Temeraire.DutyRankBoxes", box: "Temeraire.DutyRankBox" }
            : { group: "Temeraire.DesireRankBoxes", box: "Temeraire.DesireRankBox" };
        context.checkedBoxGroupLabel = game.i18n.localize(typeLabels.group);
        context.checkedBoxes = Array.from({ length: rank }, (_, index) => ({
            checked: index < checked,
            number: index + 1,
            label: `${game.i18n.localize(typeLabels.box)} ${index + 1}`
        }));
        return context;
    }

    static async _onUpdateChecked(event, target) {
        const boxGroup = target.closest(".tem-devotions__rank-boxes");
        if (!boxGroup) return;

        const checked = boxGroup.querySelectorAll("input[type='checkbox']:checked").length;
        await this.document.update({ "system.checked": checked });
    }

    static async _onChangeRank(event, target) {
        const delta = Number(target.dataset.delta);
        if (![-1, 1].includes(delta)) return;

        const rank = Math.max(0, Math.min(5, this.document.system.rank + delta));
        const checked = Math.min(this.document.system.checked, rank);
        if (rank === this.document.system.rank && checked === this.document.system.checked) return;

        await this.document.update({
            "system.rank": rank,
            "system.checked": checked
        });
    }
}