opt server_output = "./events/server.luau"
opt client_output = "./events/client.luau"
opt typescript = true

event DialogueData = {
	from: Server,
	type: Reliable,
	call: SingleAsync,
	data: struct {
		success: boolean,
		dialogueId: string,
		data: struct {
			Interactions: map { [u16]: struct {
				Content: string,
				Title: string,
				Speed: f32,
				Responses: struct {
					Next: u8,
					Content: string,
					Speed: u8,
					TextColor: Color3?
				}[]
			} },
			ServerActions: set { u16 },
			ClientActions: map { [u16]: struct {
				before: struct {
					type: u8,
					data: enum "ActionData" {
						MoveCamera {
							target: CFrame,
							speed: f32
						}
					}
				}[]?,

				after: struct {
					type: u8,
					data: enum "ActionData" {
						MoveCamera {
							target: CFrame,
							speed: f32
						}
					}
				}[]?,
			}[] },
		}
	}
}

event InitiateDialogue = {
	from: Client,
	type: Reliable,
	call: SingleAsync,
	data: struct {
		id: string,
		nd: boolean
	},
}