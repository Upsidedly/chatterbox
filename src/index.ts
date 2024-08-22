import { RunService } from "@rbxts/services";
import ClientEvents from './events/client';
import ServerEvents from './events/server'

interface ClientOptions {
}

export function ClientInit() {
    if (!RunService.IsClient()) {
        error("This is a client-only method");
    }
}

interface Response {
    /**
     * The ID of the next interaction to start after this response has been selected
     */
    Next: number,
    /**
     * The content (text) of the response
     */
    Content: string,
    Speed: number,
    /**
     * The color of the response's text
     */
    TextColor: Color3
}

interface Interaction {
    /**
     * The content of the interaction (what the character(s) is saying.)
     * This can include formatting codes.
     */
    Content: string,
    /**
     * The title of the person(s) saying the text.
     */
    Title: string,
    /**
     * The speed in which new characters should appear
     * @default 0.03
     */
    Speed: number
    /**
     * The user's responses to the content of the interaction.
     * Responses point to the ID of the next interaction
     */
    Responses: Response[]
}

export enum ActivationMethod {
    ProximityPrompt
}

export enum ActionType {
    MoveCamera
}

type ClientAction = {
    type: ActionType.MoveCamera,
    data: {
        target: CFrame,
        speed: number,
    }
}

interface Dialogue {
    Interactions: Map<number, Interaction>,
    CanUse: (player: Player) => boolean,
    Actions: Map<number, {
        Server: {
            before?: (player: Player) => void,
            after?: (player: Player) => void,
        },
        Client: {
            before?: ClientAction[],
            after?: ClientAction[],
        }
    }>,
    ActivationMethods: {
        method: ActivationMethod.ProximityPrompt,
        attachment: Attachment
    }[]
}

interface ServerOptions {
    DialogueFolder?: Folder,
    LoadDialoguesFromFolder?: boolean,
    LoadDialogueFromOptions?: boolean,
    Dialogues?: Record<string, Dialogue>
}

function GetDialogueModules(instance: Instance, list: ModuleScript[] = []): ModuleScript[] {
    instance.GetDescendants()
    for (const child of instance.GetChildren()) {
        if (child.IsA('ModuleScript')) {
            list.push(child);
        }

        if (child.IsA('Folder')) {
            GetDialogueModules(child, list);
        }
    }
    return list;
}

function IsTable(a: unknown): a is Record<string | number, unknown> {
    return type(a) === 'table'
}

class ChatterboxServer {
    public inDialogue: Map<Player, string> = new Map()
    constructor(dialogues: Record<string, Dialogue>) {
        ServerEvents.InitiateDialogue.SetCallback((player, data) => {
            if (!dialogues[data.id]) return
            const r = { success: dialogues[data.id].CanUse(player), dialogueId: data.id } as Parameters<typeof ServerEvents['DialogueData']['Fire']>[1]
            if (data.nd && r.success) {
                const dialogue = dialogues[data.id]
                const ServerActions = new Set<number>()
                const ClientActions = new Map<number, { before?: ClientAction[], after?: ClientAction[] }>()
                for (const [number, action] of dialogue.Actions) {
                    if (action.Server) {
                        ServerActions.add(number)
                    }

                    if (action.Client) {
                        ClientActions.set(number, action.Client)
                    }
                }
                r.data = { Interactions: dialogue.Interactions, ServerActions, ClientActions: ClientActions as any }
            }
            ServerEvents.DialogueData.Fire(player, r)
            this.inDialogue.set(player, data.id);
            Promise.delay(dialogues[data.id].Interactions.size() * 20).then(() => {
                this.inDialogue.delete(player)
            })
        })
    }
}

export function ServerInit(options: ServerOptions) {
    if (!RunService.IsServer()) {
        error("This is a server-only method");
    }

    if (!("DialogueFolder" in options) && !("Dialogues" in options)) return

    const dialogueModules = (options.DialogueFolder ? options.DialogueFolder.GetDescendants().filter((v) => v.IsA('ModuleScript')) : [])

    const dialogues: Record<string, Dialogue> = {}

    for (const dialogueModule of dialogueModules) {
        const dialogue = require(dialogueModule)
        if (!IsTable(dialogue) || !("interactions" in dialogue) || !("actions" in dialogue)) continue
        dialogues[dialogueModule.Name] = dialogue as unknown as Dialogue
    }

    for (const [dialogueName, dialogue] of pairs(dialogues)) {
        dialogues[dialogueName] = dialogue
    }

    return new ChatterboxServer(dialogues)
}
