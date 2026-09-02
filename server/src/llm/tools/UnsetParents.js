import FamilyService from '../../service/FamilyService.js'

const TOOL_DESCRIPTION = `
Remove both parent links from a person.

This is a DESTRUCTIVE ACTION. Be careful!
`.trim()


export default {
    toolDescription: {
        name: "unset_parents",
        description: TOOL_DESCRIPTION,
        input_schema: {
        type: "object",
        properties: {
            personId: {type: 'number', description: 'the id of the person to remove parents from'},
        },
        required: ['personId'],
        },
    },
    runTool: async (input) => {
        if (!input.personId ) { throw Error('personId required to remove parents') }
        return await FamilyService.unsetParents(input.personId)
    }
}