import FamilyService from '../../service/FamilyService.js'

const TOOL_DESCRIPTION = `
Add a new person to the family tree.

Allows adding duplicate names only when explicitly requested by the allow_duplicate parameter.
Don't request to add duplicates unless you've confirmed with the user that two people have the same name.
`.trim()

export default {
    toolDescription: {
        name: "add_person",
        description: TOOL_DESCRIPTION,
        input_schema: {
        type: "object",
        properties: {
            name: { type: "string", description: "The name of the person to add" },
            allow_duplicates: { type: "boolean", description: "If true, allow duplicate names" },
        },
        required: ["name"],
        },
    },
    runTool: async (input) => {
        if (!input.name) { throw Error('Name is a required field') }
        const allowDuplicates = input.allow_duplicates || false

        if (!allowDuplicates) {
            const matchingPeople = await FamilyService.findPerson({name: input.name})
            if (matchingPeople.length > 0) { throw Error(`Name already exists: ${input.name}`) }
        }
        
        return await FamilyService.addPerson(input.name)
    }
}