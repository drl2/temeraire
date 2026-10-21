import BaseActorSheet from "./basepc.mjs";

export default class NPCActorSheet extends BaseActorSheet {
	static DEFAULT_OPTIONS = {
		actions: {
			rollNpcChallenge: NPCActorSheet._onRollNpcChallenge,
			changeResistance: NPCActorSheet._onChangeResistance,
			updateResistanceSpent: NPCActorSheet._onUpdateResistanceSpent
		}
	};

	static PARTS = {
		main: {
			root: true,
			template: "systems/temeraire/templates/actors/npc.hbs"
		}
	};

	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const resistance = Math.max(1, Number(this.actor.system.resistance) || 1);
		const spent = Math.min(Math.max(0, Number(this.actor.system.resistanceSpent) || 0), resistance);

		context.resistanceBoxes = Array.from({ length: resistance }, (_, index) => ({
			number: index + 1,
			checked: index < spent
		}));
		context.resistanceValue = resistance;
		context.atMinimumResistance = resistance <= 1;
		return context;
	}

	static async _onChangeResistance(event, target) {
		const delta = Number(target.dataset.delta);
		if (![-1, 1].includes(delta)) return;

		const resistance = Math.max(1, (Number(this.actor.system.resistance) || 1) + delta);
		const spent = Math.min(Number(this.actor.system.resistanceSpent) || 0, resistance);
		await this.actor.update({
			"system.resistance": resistance,
			"system.resistanceSpent": spent
		});
	}

	static async _onUpdateResistanceSpent(event, target) {
		const boxGroup = target.closest(".tem-npc-sheet__resistance-boxes");
		const spent = boxGroup.querySelectorAll("input[type='checkbox']:checked").length;
		await this.actor.update({ "system.resistanceSpent": spent });
	}

	static async _onRollNpcChallenge(event, target) {
		const attributeName = target.dataset.attribute;
		const attribute = this.actor.system.attributes?.[attributeName];
		if (!attribute) return;

		const dice = Math.max(0, Number(attribute.value) || 0);
		const attributeLabel = game.i18n.localize(`Temeraire.ATTRIBUTES.${attributeName}.label`);

		const keepLowest = dice <= 0;
		const roll = new Roll(keepLowest ? "2d6kl1" : `${dice}d6`);
		await roll.evaluate();
		const results = roll.dice[0].results.map(r => r.result);
		const hits = roll.dice[0].results.filter(die => die.active && die.result >= 5).length;

		const content = await foundry.applications.handlebars.renderTemplate(
			"systems/temeraire/templates/chatcards/npcChallenge.hbs",
			{ actorName: this.actor.name, attributeLabel, dice, rolls: results, hits, keepLowest }
		);

		await ChatMessage.create({
			speaker: ChatMessage.getSpeaker({ actor: this.actor }),
			content,
			rolls: [roll]
		});
	}
}
