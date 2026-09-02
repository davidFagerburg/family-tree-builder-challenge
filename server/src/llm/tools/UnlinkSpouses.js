import FamilyService from '../../service/FamilyService.js'

const TOOL_DESCRIPTION = `
Remove spouse relationship from a person.
Also removes spouse_id feild from this person's spouse.

This is a DESTRUCTIVE ACTION. Be careful!
`.trim()


export default {
    toolDescription: {
        name: "unlink_spouses",
        description: TOOL_DESCRIPTION,
        input_schema: {
        type: "object",
        properties: {
            personId: {type: 'number', description: 'the id of the person to remove a spouse from'},
        },
        required: ['personId'],
        },
    },
    runTool: async (input) => {
        if (!input.personId ) { throw Error('personId required to remove spouse relationship') }
        return await FamilyService.unsetSpouse(input.personId)
    }
}