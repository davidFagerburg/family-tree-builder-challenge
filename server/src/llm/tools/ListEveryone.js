import FamilyService from '../../service/FamilyService.js'

const TOOL_DESCRIPTION = `
List all people in the family tree currently.
Whenever you start a session, this should probably be your first tool call.

Returns a list of people, including:
- name
- id
- spouse_id (if they have one in the tree currently)
- parents' ids (if they have any in the tree currently)
`.trim()


export default {
    toolDescription: {
        name: "list_everyone",
        description: TOOL_DESCRIPTION,
        input_schema: {
        type: "object",
        properties: {
        },
        required: [],
        },
    },
    runTool: async () => {
        return await FamilyService.findAllPeople()
    }
}