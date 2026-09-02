import FamilyService from '../../service/FamilyService.js'

const TOOL_DESCRIPTION = `
Rename a person. Used to correct spelling or otherwise correct a name
`.trim()


export default {
    toolDescription: {
        name: "rename_person",
        description: TOOL_DESCRIPTION,
        input_schema: {
        type: "object",
        properties: {
            personId: {type: 'number', description: 'the id of the person to rename'},
            name: {type: 'string', description: 'the corrected name'},
        },
        required: ['personId', 'name'],
        },
    },
    runTool: async (input) => {
        if (!input.personId || !input.name) { throw Error('All fields are required') }
        return await FamilyService.renamePerson(input.personId, input.name)
    }
}