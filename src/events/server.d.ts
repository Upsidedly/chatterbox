// Server generated by Zap v0.6.11 (https://github.com/red-blox/zap)
export declare const SendEvents: () => void
export declare const DialogueData: {
	Fire: (Player: Player, Value: {
		success: boolean,
		dialogueId: string,
		data: {
			Interactions: Map<number, {
				Content: string,
				Title: string,
				Speed: number,
				Responses: ({
					Next: number,
					Content: string,
					Speed: number,
					TextColor?: Color3,
				})[],
			}>,
			ServerActions: Set<number>,
			ClientActions: Map<number, ({
				before?: ({
					type: number,
					data: {
						ActionData: "MoveCamera",
						target: CFrame,
						speed: number,
					},
				})[],
				after?: ({
					type: number,
					data: {
						ActionData: "MoveCamera",
						target: CFrame,
						speed: number,
					},
				})[],
			})[]>,
		},
	}) => void;
	FireAll: (Value: {
		success: boolean,
		dialogueId: string,
		data: {
			Interactions: Map<number, {
				Content: string,
				Title: string,
				Speed: number,
				Responses: ({
					Next: number,
					Content: string,
					Speed: number,
					TextColor?: Color3,
				})[],
			}>,
			ServerActions: Set<number>,
			ClientActions: Map<number, ({
				before?: ({
					type: number,
					data: {
						ActionData: "MoveCamera",
						target: CFrame,
						speed: number,
					},
				})[],
				after?: ({
					type: number,
					data: {
						ActionData: "MoveCamera",
						target: CFrame,
						speed: number,
					},
				})[],
			})[]>,
		},
	}) => void;
	FireExcept: (Except: Player, Value: {
		success: boolean,
		dialogueId: string,
		data: {
			Interactions: Map<number, {
				Content: string,
				Title: string,
				Speed: number,
				Responses: ({
					Next: number,
					Content: string,
					Speed: number,
					TextColor?: Color3,
				})[],
			}>,
			ServerActions: Set<number>,
			ClientActions: Map<number, ({
				before?: ({
					type: number,
					data: {
						ActionData: "MoveCamera",
						target: CFrame,
						speed: number,
					},
				})[],
				after?: ({
					type: number,
					data: {
						ActionData: "MoveCamera",
						target: CFrame,
						speed: number,
					},
				})[],
			})[]>,
		},
	}) => void;
	FireList: (List: Player[], Value: {
		success: boolean,
		dialogueId: string,
		data: {
			Interactions: Map<number, {
				Content: string,
				Title: string,
				Speed: number,
				Responses: ({
					Next: number,
					Content: string,
					Speed: number,
					TextColor?: Color3,
				})[],
			}>,
			ServerActions: Set<number>,
			ClientActions: Map<number, ({
				before?: ({
					type: number,
					data: {
						ActionData: "MoveCamera",
						target: CFrame,
						speed: number,
					},
				})[],
				after?: ({
					type: number,
					data: {
						ActionData: "MoveCamera",
						target: CFrame,
						speed: number,
					},
				})[],
			})[]>,
		},
	}) => void;
	FireSet: (Set: Set<Player>, Value: {
		success: boolean,
		dialogueId: string,
		data: {
			Interactions: Map<number, {
				Content: string,
				Title: string,
				Speed: number,
				Responses: ({
					Next: number,
					Content: string,
					Speed: number,
					TextColor?: Color3,
				})[],
			}>,
			ServerActions: Set<number>,
			ClientActions: Map<number, ({
				before?: ({
					type: number,
					data: {
						ActionData: "MoveCamera",
						target: CFrame,
						speed: number,
					},
				})[],
				after?: ({
					type: number,
					data: {
						ActionData: "MoveCamera",
						target: CFrame,
						speed: number,
					},
				})[],
			})[]>,
		},
	}) => void
};
export declare const InitiateDialogue: {
	SetCallback: (Callback: (Player: Player, Value: {
		id: string,
		nd: boolean,
	}) => void) => () => void;
};
