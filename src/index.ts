import { RunService, ProximityPromptService } from "@rbxts/services";
import { ChatterboxServer } from "./structures/ChatterboxServer";
import { ChatterboxClient } from "./structures/ChatterboxClient";

export interface ClientOptions {}

export type ClientReturnChunk = {
	ServerActions: Set<number>;
	ClientActions: Map<
		number,
		{
			before?: ClientAction[];
			after?: ClientAction[];
		}
	>;
};

export async function ClientInit() {
	if (!RunService.IsClient()) {
		error("This is a client-only method");
	}
	const ClientEvents = await import("./events/client");
	ClientEvents.GetClientDialoguesData.Fire();
	const dialogues = new Map<string, ClientReturnChunk>();
	ClientEvents.ReturnClientDialoguesData.SetCallback((data) => {
		for (const [id, chunk] of data) {
			dialogues.set(id, chunk as any);
		}
	});
	return new Promise<ChatterboxClient>((res) =>
		ClientEvents.ReturnClientDialoguesDataFinished.SetCallback(() =>
			res(new ChatterboxClient(ClientEvents, dialogues)),
		),
	);
}

export interface Response {
	/**
	 * The ID of the next interaction to start after this response has been selected
	 */
	Next: number;
	/**
	 * The content (text) of the response
	 */
	Content: string;
	Speed: number;
	/**
	 * The color of the response's text
	 */
	TextColor?: Color3;
}

export interface Interaction {
	/**
	 * The content of the interaction (what the character(s) is saying.)
	 * This can include formatting codes.
	 */
	Content: string;
	/**
	 * The title of the person(s) saying the text.
	 */
	Title: string;
	/**
	 * The speed in which new characters should appear
	 * @default 0.03
	 */
	Speed: number;
	/**
	 * Optionally use no responses but move to a new interaction (takes priority over responses)
	 */
	Next?: number;
	/**
	 * The user's responses to the content of the interaction.
	 * Responses point to the ID of the next interaction
	 */
	Responses: Response[];
}

export enum ActivationMethod {
	ProximityPrompt,
}

export enum ActionType {
	MoveCamera,
}

export type ClientAction = {
	type: ActionType.MoveCamera;
	data: {
		target: CFrame;
		speed: number;
	};
};

export interface Dialogue {
	Interactions: Map<number, Interaction>;
	CanUse: (player: Player) => boolean;
	Actions: Map<
		number,
		{
			Server: {
				before?: (player: Player) => void;
				after?: (player: Player) => void;
			};
			Client: {
				before?: ClientAction[];
				after?: ClientAction[];
			};
		}
	>;
	ActivationMethods: {
		method: ActivationMethod.ProximityPrompt;
		attachment: Attachment;
	}[];
}

export interface ServerOptions {
	DialogueFolder?: Folder;
	LoadDialoguesFromFolder?: boolean;
	LoadDialogueFromOptions?: boolean;
	Dialogues?: Record<string, Dialogue>;
}

function GetDialogueModules(instance: Instance, list: ModuleScript[] = []): ModuleScript[] {
	instance.GetDescendants();
	for (const child of instance.GetChildren()) {
		if (child.IsA("ModuleScript")) {
			list.push(child);
		}

		if (child.IsA("Folder")) {
			GetDialogueModules(child, list);
		}
	}
	return list;
}

function IsTable(a: unknown): a is Record<string | number, unknown> {
	return type(a) === "table";
}

export async function ServerInit(options: ServerOptions) {
	if (!RunService.IsServer()) {
		error("This is a server-only method");
	}

	const ServerEvents = await import("./events/server");

	if (!("DialogueFolder" in options) && !("Dialogues" in options)) return;

	const dialogueModules = options.DialogueFolder ? GetDialogueModules(options.DialogueFolder) : [];

	const dialogues = new Map<string, Dialogue>();

	for (const dialogueModule of dialogueModules) {
		const dialogue = require(dialogueModule);
		if (!IsTable(dialogue)) continue;
		dialogues.set(dialogueModule.Name, dialogue as unknown as Dialogue);
	}

	for (const [dialogueName, dialogue] of pairs(dialogues)) {
		dialogues.set(dialogueName, dialogue);
	}

	return new ChatterboxServer(ServerEvents, dialogues);
}
