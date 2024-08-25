import { ActivationMethod, ClientAction, ClientReturnChunk, Dialogue } from "..";

export class ChatterboxServer {
	public inDialogue: Map<number, string> = new Map();
	private dialogueChunks: Map<string, ClientReturnChunk>[] = [];

	setDialogueChunks() {
		let currentChunk = new Map<string, ClientReturnChunk>();
		let count = 0;

		for (const [id, dialogue] of this.dialogues) {
			const serverActions = new Set<number>();
			const clientActions = new Map<number, { before?: ClientAction[]; after?: ClientAction[] }>();
			for (const [actionId, action] of dialogue.Actions) {
				if (action.Server) {
					serverActions.add(actionId);
				}

				if (action.Client) {
					clientActions.set(actionId, action.Client);
				}
			}
			currentChunk.set(id, {
				ServerActions: serverActions,
				ClientActions: clientActions,
			});
			count++;

			if (count === 5) {
				this.dialogueChunks.push(currentChunk);
				currentChunk = new Map<string, ClientReturnChunk>();
				count = 0;
			}
		}

		if (count > 0) {
			this.dialogueChunks.push(currentChunk);
		}
	}

	constructor(
		private ServerEvents: typeof import("../events/server"),
		private dialogues: Map<string, Dialogue>,
	) {
		this.setDialogueChunks();
		ServerEvents.TerminateDialogue.SetCallback((player) => {
			const isTerminated = this.inDialogue.delete(player.UserId);
		});
		ServerEvents.GetClientDialoguesData.SetCallback((player) => {
			for (const chunk of this.dialogueChunks) {
				ServerEvents.ReturnClientDialoguesData.Fire(player, chunk as any);
			}
			ServerEvents.ReturnClientDialoguesDataFinished.Fire(player);
		});
		ServerEvents.InitiateDialogue.SetCallback((player, data) => {
			if (!dialogues.has(data.id)) return;
			if (this.inDialogue.has(player.UserId)) return;
			const dialogue = dialogues.get(data.id)!;
			const r = { success: dialogue.CanUse(player), dialogueId: data.id } as Parameters<
				(typeof ServerEvents)["DialogueData"]["Fire"]
			>[1];
			if (data.nd && r.success) {
				// const ServerActions = new Set<number>()
				// const ClientActions = new Map<number, { before?: ClientAction[], after?: ClientAction[] }>()
				// for (const [number, action] of dialogue.Actions) {
				//     if (action.Server) {
				//         ServerActions.add(number)
				//     }

				//     if (action.Client) {
				//         ClientActions.set(number, action.Client)
				//     }
				// }
				r.data = {
					Interactions: dialogue.Interactions,
					// ServerActions,
					// ClientActions: ClientActions as any
				};
			}
			ServerEvents.DialogueData.Fire(player, r);
			this.inDialogue.set(player.UserId, data.id);
			Promise.delay(dialogue.Interactions.size() * 20).then(() => {
				this.inDialogue.delete(player.UserId);
			});
		});
		for (const [id, dialogue] of dialogues) {
			for (const { method, attachment } of dialogue.ActivationMethods) {
				if (method === ActivationMethod.ProximityPrompt) {
					const prompt = new Instance("ProximityPrompt");
					prompt.Name = `CB_Dialogue_${id}_Prompt`;
					prompt.SetAttribute("CB_DialogueId", id);
					prompt.Parent = attachment;
				}
			}
		}
	}
}
