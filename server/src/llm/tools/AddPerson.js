import FamilyService from '../../service/FamilyService.js'

export default {
    toolDescription: {
        name: "add_person",
        description: "Add a new person to the family tree.",
        input_schema: {
        type: "object",
        properties: {
            name: { type: "string" },
        },
        required: ["name"],
        },
    },
    runTool: async (input) => {
        if (!input.name) { throw Error('Name is a required field') }

        return await FamilyService.addPerson(input.name)
    }
}