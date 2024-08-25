import { ProximityPromptService } from "@rbxts/services";
import { ClientReturnChunk, Dialogue } from "..";

export class ChatterboxClient {
	private dialogueCache: Map<string, { Interactions: Dialogue["Interactions"] }> = new Map();
	constructor(
		private ClientEvents: typeof import("../events/client"),
		private dialogues: Map<string, ClientReturnChunk>,
	) {
		ClientEvents.DialogueData.SetCallback((data) => {
			if (!data.success) return;
			if (!this.dialogueCache.has(data.dialogueId)) this.dialogueCache.set(data.dialogueId, data.data!);
			// Handle UI :)
			ClientEvents.TerminateDialogue.Fire();
		});
		ProximityPromptService.PromptTriggered.Connect((prompt) => {
			const id = prompt.GetAttribute("CB_DialogueId") as string | undefined;
			if (!id) return;
			const dialogue = this.dialogues.get(id);
			if (!dialogue) return;
			ClientEvents.InitiateDialogue.Fire({ id, nd: !this.dialogueCache.has(id) });
		});
	}
}
