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
            testDevotion: this._onTestDevotion,
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
            updateBurdenChecked: this._onUpdateBurdenChecked,
            openChallenge: this._onOpenChallenge
        }
    };

    static PARTS = {
        main: {
            root: true,
            template: "systems/temeraire/templates/actors/main.hbs"
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
                    checked,
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

    static async _onTestDevotion(event, target) {
        const item = this.actor.items.get(target.dataset.itemId);
        if (!item || !["duty", "desire"].includes(item.type)) return;

        const checked = Math.max(0, Number(item.system.checked) || 0);
        if (checked <= 0) {
            ui.notifications.warn(game.i18n.format("Temeraire.NothingToTest", { name: item.name }));
            return;
        }

        const roll = new Roll(`${checked}d6`);
        await roll.evaluate();
        const results = roll.dice[0].results.map(r => r.result);
        const hits = results.filter(result => result >= 5).length;
        const remainingChecked = checked - hits;
        const counterCandidates = type => this.actor.items
            .filter(i => i.type === type && i.id !== item.id && !i.system.denied && (Number(i.system.checked) || 0) < (Number(i.system.rank) || 0))
            .map(i => ({ id: i.id, name: i.name }));
        const counterDuties = counterCandidates("duty");
        const counterDesires = counterCandidates("desire");
        if (hits > 0) await item.update({ "system.checked": remainingChecked });
        const content = await foundry.applications.handlebars.renderTemplate(
            "systems/temeraire/templates/chatcards/testDevotion.hbs",
            {
                actorName: this.actor.name,
                title: game.i18n.format(item.type === "duty" ? "Temeraire.TestingDuty" : "Temeraire.TestingDesire", { name: item.name }),
                rolls: results,
                hits,
                choices: Array.from({ length: hits }, (_, index) => index + 1),
                counterDuties,
                counterDesires,
                checksRemoved: hits,
                remainingChecked
            }
        );

        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content,
            rolls: [roll],
            flags: { temeraire: { devotionTest: { type: item.type, itemId: item.id, hits, applied: false } } }
        });
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
        const danger = this.actor.system.dangers[dangerName];
        const windowContent = this.element.querySelector(".window-content");
        const scrollTop = windowContent?.scrollTop;

        const updates = { [`system.dangers.${dangerName}.checked`]: checked };

        // If all boxes are checked, increment danger level and reset checked
        if (checked === danger.boxes) {
            const newLevel = danger.value + 1;
            updates[`system.dangers.${dangerName}.value`] = newLevel;
            updates[`system.dangers.${dangerName}.checked`] = 0;

            // Send chat message
            const dangerLabel = game.i18n.localize(`Temeraire.DANGERS.${dangerName}`);
            const message = game.i18n.format("Temeraire.DangerLevelIncreased", {
                character: this.actor.name,
                danger: dangerLabel,
                level: newLevel
            });
            const fontSize = newLevel > 6 ? "font-size: 1.3em;" : "";
            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: `<strong style="color: #c41c3b;${fontSize}">${message}</strong>`
            });
        }

        await this.actor.update(updates);

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

    static async _onOpenChallenge(event, target) {
        const attributeName = target.dataset.attribute;
        const skillName = target.dataset.skill;
        const attribute = this.actor.system.attributes?.[attributeName];
        if (!attribute || skillName === "value" || typeof attribute[skillName] !== "number") return;
        const attributeValue = Number(attribute.value) || 0;
        const skillValue = Number(attribute[skillName]) || 0;
        const skillLabel = game.i18n.localize(`Temeraire.ATTRIBUTES.${attributeName}.${skillName}`);
        const trainedBonus = skillValue === 1 ? 1 : 0;
        const showTrained = skillValue === 1 || skillValue === 2;
        const trainedIsSelectable = skillValue === 2;
        const trainedLabelKey = skillValue === 2 ? "Temeraire.SKILL_LEVELS.Adept" : "Temeraire.SKILL_LEVELS.Trained";
        const showAdept = skillValue === 2;
        const showMasterSuccess = skillValue === 3;
        const burdens = this.actor.system.burdens ?? {};
        const burdenPenalty = Math.max(0, Number(burdens.duty) || 0, Number(burdens.desire) || 0);
        const diceToRoll = attributeValue + trainedBonus - burdenPenalty;
        const keepLowest = diceToRoll <= 0;
        const dice = Array.from({ length: keepLowest ? 2 : diceToRoll });
        const resources = Array.from(this.actor.items)
            .filter(item => item.type === "resource")
            .filter(item => (item.system.uses ?? 0) > 0)
            .map(item => ({ id: item.id, name: item.name }));

        const content = await foundry.applications.handlebars.renderTemplate(
            "systems/temeraire/templates/dialogs/challenge.hbs",
            {
                actorName: this.actor.name,
                attributeLabel: game.i18n.localize(`Temeraire.ATTRIBUTES.${attributeName}.label`),
                attributeValue,
                skillLabel,
                skillValue,
                trainedBonus,
                showTrained,
                trainedIsSelectable,
                trainedLabelKey,
                showAdept,
                showMasterSuccess,
                burdenPenalty,
                diceToRoll,
                keepLowest,
                dice,
                resources
            }
        );

        let dialogInstance;

        await foundry.applications.api.DialogV2.wait({
            window: { title: `${game.i18n.localize("Temeraire.Challenge")}: ${skillLabel} - ${this.actor.name}` },
            content,
            buttons: [{
                action: "roll",
                label: "Temeraire.Roll",
                type: "button",
                callback: async () => {
                    if (!dialogInstance) return;
                    const formElement = dialogInstance.element.querySelector("form");
                    const formData = new FormData(formElement);
                    const circumstance = Number(formData.get("circumstance")) || 0;
                    const trainedBonusChecked = formData.get("trainedBonus") === "1";
                    const adeptBonusChecked = formData.get("addOnFail") === "1";
                    const formidableBonusChecked = formData.get("formidableBonus") === "1";
                    const resourceId = formData.get("resourceId");

                    const resourceBonus = resourceId ? 1 : 0;
                    const selectableTrainedBonus = trainedBonusChecked ? 1 : 0;
                    const finalDiceToRoll = diceToRoll + circumstance + resourceBonus + selectableTrainedBonus;
                    const adjustedDiceToRoll = Math.max(0, finalDiceToRoll);
                    const keepLowest = adjustedDiceToRoll <= 0;

                    // Roll the dice
                    const roll = new Roll(`${keepLowest ? '2d6kl1' : adjustedDiceToRoll + 'd6'}`);
                    await roll.evaluate();

                    // Determine result based on modifiers
                    let successCount = 0;
                    const activeDice = roll.dice[0].results.filter(die => die.active);
                    const allDiceSucceeded = activeDice.length > 0 && activeDice.every(die => die.result >= 5);
                    for (const die of roll.dice[0].results) {
                        // Only count dice that are active (kept, not dropped)
                        if (die.active && die.result >= 5) successCount++;
                    }

                    // Apply formidable modifier
                    let formidableApplied = false;
                    if (formidableBonusChecked && successCount > 0) {
                        formidableApplied = true;
                        successCount--;
                    }

                    // Apply adept modifier if applicable
                    let adeptSuccess = false;
                    if (adeptBonusChecked && successCount === 0) {
                        adeptSuccess = true;
                        successCount = 1;
                    }

                    // Apply master success if applicable
                    let masterSuccess = skillValue === 3 ? 1 : 0;

                    // Get resource name if one was selected
                    let resourceName = null;
                    if (resourceId) {
                        const resourceItem = this.actor.items.get(resourceId);
                        if (resourceItem) {
                            resourceName = resourceItem.name;
                        }
                    }

                    const hasUnchecked = i => !i.system.denied && (Number(i.system.checked) || 0) < (Number(i.system.rank) || 0);
                    const invokableDuties = this.actor.items
                        .filter(i => i.type === "duty" && hasUnchecked(i))
                        .map(i => ({ id: i.id, name: i.name }));
                    const invokableDesires = this.actor.items
                        .filter(i => i.type === "desire" && hasUnchecked(i))
                        .map(i => ({ id: i.id, name: i.name }));

                    const chatContent = await foundry.applications.handlebars.renderTemplate(
                        "systems/temeraire/templates/chatcards/challengeRoll.hbs",
                        {
                            actorName: this.actor.name,
                            skillLabel,
                            attributeLabel: game.i18n.localize(`Temeraire.ATTRIBUTES.${attributeName}.label`),
                            attributeValue,
                            trainedBonus: skillValue === 1 || trainedBonusChecked ? 1 : 0,
                            trainedLabel: game.i18n.localize(trainedLabelKey),
                            actorId: this.actor.id,
                            duties: invokableDuties,
                            devotions: invokableDesires,
                            hasInvokableItems: !allDiceSucceeded && (invokableDuties.length > 0 || invokableDesires.length > 0),
                            circumstance,
                            burdenPenalty,
                            resourceName,
                            diceRolled: adjustedDiceToRoll,
                            rolls: roll.dice[0].results.map(r => r.result),
                            successCount,
                            masterSuccess,
                            totalHits: successCount + masterSuccess,
                            adeptSuccess,
                            formidableApplied,
                            keepLowest
                        }
                    );

                    await ChatMessage.create({
                        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                        content: chatContent,
                        rolls: [roll],
                        flags: {
                            temeraire: {
                                challenge: {
                                    dice: roll.dice[0].results.map(r => ({ result: r.result, active: r.active !== false })),
                                    formidableChecked: formidableBonusChecked,
                                    adeptChecked: adeptBonusChecked,
                                    masterSuccess
                                }
                            }
                        }
                    });

                    // Decrement resource uses if a resource was selected
                    if (resourceId) {
                        const resourceItem = this.actor.items.get(resourceId);
                        if (resourceItem) {
                            const currentUses = resourceItem.system.uses ?? 0;
                            await resourceItem.update({ "system.uses": Math.max(0, currentUses - 1) });
                        }
                    }

                    return true;
                }
            }, {
                action: "cancel",
                label: "Temeraire.Cancel",
                type: "button",
                callback: () => false
            }],
            rejectClose: false,
            render: (_event, dialog) => {
                dialogInstance = dialog;
                const input = dialog.element.querySelector("input[name='circumstance']");
                const circumstanceDisplay = dialog.element.querySelector("#challenge-circumstance");
                const trainedCheckbox = dialog.element.querySelector("[name='trainedBonus']");
                const adeptCheckbox = dialog.element.querySelector("[name='addOnFail']");
                const formidableCheckbox = dialog.element.querySelector("[name='formidableBonus']");
                const resourceSelect = dialog.element.querySelector("[name='resourceId']");
                const diceTotal = dialog.element.querySelector("[data-dice-total]");
                const diceDisplay = dialog.element.querySelector("[data-dice-display]");
                const buttons = dialog.element.querySelectorAll("button[data-circumstance-delta]");
                if (!input || !resourceSelect || !diceTotal || !diceDisplay || !circumstanceDisplay) return;

                // Initialize circumstance display
                circumstanceDisplay.textContent = String(input.value);

                const updateDiceToRoll = () => {
                    const value = Number(input.value);
                    const circumstance = Number.isFinite(value) ? Math.trunc(value) : 0;
                    const resourceBonus = resourceSelect.value ? 1 : 0;
                    const selectableTrainedBonus = trainedCheckbox?.checked ? 1 : 0;
                    const total = diceToRoll + circumstance + resourceBonus + selectableTrainedBonus;
                    const keepLowest = total <= 0;
                    const adjustedDiceToRoll = Math.max(0, total);
                    diceTotal.textContent = String(adjustedDiceToRoll);
                    diceDisplay.setAttribute(
                        "aria-label",
                        `${game.i18n.localize("Temeraire.DiceToRoll")}: ${adjustedDiceToRoll}${keepLowest ? `, ${game.i18n.localize("Temeraire.KeepLowest")}` : ""}`
                    );
                    const diceImages = Array.from({ length: keepLowest ? 2 : adjustedDiceToRoll }, () => {
                        const die = document.createElement("img");
                        die.src = "systems/temeraire/assets/misc/die.svg";
                        die.alt = "";
                        die.setAttribute("aria-hidden", "true");
                        return die;
                    });
                    if (keepLowest) {
                        const keepLowestLabel = document.createElement("span");
                        keepLowestLabel.className = "tem-challenge-dialog__keep-lowest";
                        keepLowestLabel.textContent = game.i18n.localize("Temeraire.KeepLowest");
                        diceImages.push(keepLowestLabel);
                    }
                    diceDisplay.replaceChildren(...diceImages);
                };

                const clampCircumstance = () => {
                    const value = Number(input.value);
                    const normalized = Number.isFinite(value) ? Math.trunc(value) : 0;
                    const clamped = Math.max(-1, Math.min(1, normalized));
                    input.value = String(clamped);
                    circumstanceDisplay.textContent = String(clamped);
                    for (const button of buttons) {
                        const delta = Number(button.dataset.circumstanceDelta);
                        button.disabled = delta < 0 ? input.value === "-1" : input.value === "1";
                    }
                    updateDiceToRoll();
                };

                for (const button of buttons) {
                    button.addEventListener("click", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const value = Number(input.value) || 0;
                        const newValue = value + Number(button.dataset.circumstanceDelta);
                        const clamped = Math.max(-1, Math.min(1, newValue));
                        input.value = String(clamped);
                        circumstanceDisplay.textContent = String(clamped);
                        clampCircumstance();
                    });
                }
                input.addEventListener("input", updateDiceToRoll);
                input.addEventListener("change", clampCircumstance);
                trainedCheckbox?.addEventListener("change", () => {
                    if (trainedCheckbox.checked && adeptCheckbox) {
                        adeptCheckbox.checked = false;
                    }
                    updateDiceToRoll();
                });
                adeptCheckbox?.addEventListener("change", () => {
                    if (adeptCheckbox.checked && trainedCheckbox) {
                        trainedCheckbox.checked = false;
                    }
                    updateDiceToRoll();
                });
                formidableCheckbox?.addEventListener("change", updateDiceToRoll);
                resourceSelect.addEventListener("change", updateDiceToRoll);
                clampCircumstance();
            }
        });
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

// A duty turns one failed die into a 6; a desire re-rolls every failed die. Posts the recalculated result.
async function postInvokeResult(message, actor, item) {
    const data = message.getFlag("temeraire", "challenge");
    const dice = data?.dice?.map(die => ({ ...die }));
    const failed = dice?.filter(die => die.active && die.result < 5) ?? [];
    if (!failed.length) return;

    let reroll = null;
    if (item.type === "duty") {
        failed[0].result = 6;
        failed[0].changed = true;
    } else {
        reroll = new Roll(`${failed.length}d6`);
        await reroll.evaluate();
        reroll.dice[0].results.forEach((r, i) => {
            failed[i].result = r.result;
            failed[i].changed = true;
        });
    }

    let successCount = dice.filter(die => die.active && die.result >= 5).length;
    const formidableApplied = data.formidableChecked && successCount > 0;
    if (formidableApplied) successCount--;
    const adeptSuccess = data.adeptChecked && successCount === 0;
    if (adeptSuccess) successCount = 1;
    const totalHits = successCount + (data.masterSuccess ?? 0);

    const level = totalHits === 0 ? "Defeat" : totalHits === 1 ? "Unstable" : totalHits === 2 ? "Success" : "Triumphant";
    const content = await foundry.applications.handlebars.renderTemplate(
        "systems/temeraire/templates/chatcards/challengeInvoke.hbs",
        {
            invokedName: game.i18n.format("Temeraire.ActorInvokes", { actor: actor.name, name: item.name }),
            dice,
            totalHits,
            level,
            resultLabel: game.i18n.localize({
                Defeat: "Temeraire.Defeat",
                Unstable: "Temeraire.UnstableResult",
                Success: "Temeraire.Success",
                Triumphant: "Temeraire.TriumphantSuccess"
            }[level]),
            resultDescription: game.i18n.localize({
                Defeat: "ResultDescriptions.Defeat",
                Unstable: "ResultDescriptions.UnstableResult",
                Success: "ResultDescriptions.Success",
                Triumphant: "ResultDescriptions.TriumphantSuccess"
            }[level])
        }
    );

    await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content,
        ...(reroll ? { rolls: [reroll] } : {})
    });
    if (message.canUserModify(game.user, "update")) {
        await message.setFlag("temeraire", "challenge", { ...data, dice });
    }
}

// Hook for challenge roll dice display toggle
Hooks.on("renderChatMessageHTML", (_message, html) => {
    const diceDisplay = html.querySelector("[data-toggle-dice]");
    const rollsContainer = html.querySelector("[data-toggle-trigger]");
    
    if (diceDisplay && rollsContainer) {
        rollsContainer.addEventListener("click", (event) => {
            event.stopPropagation();
            diceDisplay.classList.toggle("tem-challenge-roll__dice--hidden");
        });
    }

    const invokeSelect = html.querySelector("select[data-invoke-select]");
    const invokeButton = html.querySelector("button[data-invoke]");
    const updateInvokeButton = () => {
        if (invokeButton) invokeButton.disabled = !invokeSelect?.selectedOptions[0]?.dataset.invokeType;
    };

    invokeSelect?.addEventListener("change", updateInvokeButton);
    updateInvokeButton();

    invokeButton?.addEventListener("click", async (event) => {
        event.stopPropagation();
        const actor = game.actors.get(_message.speaker?.actor);
        const item = actor?.items.get(invokeSelect?.value);
        if (!actor?.isOwner || !["duty", "desire"].includes(item?.type)) return;

        const checked = Number(item.system.checked) || 0;
        if (item.system.denied || checked >= (Number(item.system.rank) || 0)) {
            ui.notifications.warn(game.i18n.format("Temeraire.CannotInvoke", { name: item.name }));
            return;
        }
        await item.update({ "system.checked": checked + 1 });
        if (checked + 1 >= (Number(item.system.rank) || 0)) {
            invokeSelect.selectedOptions[0].remove();
            invokeSelect.value = "";
            updateInvokeButton();
        }

        await postInvokeResult(_message, actor, item);
    });

    const applyChoicesButton = html.querySelector("button[data-apply-devotion-choices]");
    if (applyChoicesButton) {
        const testData = _message.getFlag("temeraire", "devotionTest");
        const choiceSelects = Array.from(html.querySelectorAll("select[data-devotion-choice]"));
        if (testData?.applied) {
            choiceSelects.forEach((select, index) => {
                select.value = testData.choices?.[index] ?? select.value;
                select.disabled = true;
            });
            applyChoicesButton.disabled = true;
        }

        applyChoicesButton.addEventListener("click", async (event) => {
            event.stopPropagation();
            const actor = game.actors.get(_message.speaker?.actor);
            const data = _message.getFlag("temeraire", "devotionTest");
            if (!actor?.isOwner || !data || data.applied) return;

            const choices = choiceSelects.map(select => select.value);
            for (const choice of choices) {
                if (choice === "burden") {
                    const current = Number(actor.system.burdens?.[data.type]) || 0;
                    await actor.update({ [`system.burdens.${data.type}`]: Math.min(5, current + 1) });
                    continue;
                }
                const counter = actor.items.get(choice);
                if (!counter || counter.id === data.itemId || !["duty", "desire"].includes(counter.type) || counter.system.denied) continue;
                const rank = Number(counter.system.rank) || 0;
                const current = Number(counter.system.checked) || 0;
                await counter.update({ "system.checked": Math.min(rank, current + 2) });
            }
            await _message.setFlag("temeraire", "devotionTest", { ...data, applied: true, choices });
        });
    }

    const resultDiv = html.querySelector("[data-toggle-result]");
    if (resultDiv) {
        resultDiv.addEventListener("click", (event) => {
            event.stopPropagation();
            const description = resultDiv.querySelector(".tem-challenge-roll__result-description");
            if (description) {
                description.classList.toggle("tem-challenge-roll__result-description--hidden");
            }
        });
    }
});
