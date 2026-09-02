import FamilyService from '../../service/FamilyService.js'

export default {
    toolDescription: {
        name: "link_spouses",
        description: "Link two existing people as spouses in the family tree. This creates a symmetrical relationship where both people have each other listed as their spouse in the db.",
        input_schema: {
        type: "object",
        properties: {
            personId1: { type: "number", description: "primary key ID of the first person to link" },
            personId2: { type: "number", description: "primary key ID of the second person to link" },
        },
        required: ["personId1", "personId2"],
        },
    },
    runTool: async (input) => {
        if (!input.personId1 || !input.personId2) { throw Error('Two spouses are required') }

        return await FamilyService.linkSpouses(input.personId1, input.personId2)
    }
}