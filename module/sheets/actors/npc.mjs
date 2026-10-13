import BaseActorSheet from "./basepc.mjs";

export default class NPCActorSheet extends BaseActorSheet {
	static PARTS = {
		main: {
			root: true,
			template: "systems/temeraire/templates/actor/npc.hbs"
		}
	};
}
