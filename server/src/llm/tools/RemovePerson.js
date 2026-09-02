import FamilyService from '../../service/FamilyService.js'

const TOOL_DESCRIPTION = `
Remove a person from the tree.
Only works after spouse and parental links have been removed from this person.

This is a DESTRUCTIVE ACTION. Be careful!
`.trim()


export default {
    toolDescription: {
        name: "remove_person",
        description: TOOL_DESCRIPTION,
        input_schema: {
        type: "object",
        properties: {
            personId: {type: 'number', description: 'the id of the person to remove'},
        },
        required: ['personId'],
        },
    },
    runTool: async (input) => {
        if (!input.personId ) { throw Error('personId required to remove a person') }
        return await FamilyService.removePerson(input.personId)
    }
}