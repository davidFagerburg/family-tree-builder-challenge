import FamilyService from '../../service/FamilyService.js'

const TOOL_DESCRIPTION = `
Search the existing family tree for a person or people matching a description when you don't know the person's ID.
You can search by name, which you should include if you have one.
However, sometimes you may be searching for Joe's spouse or Jill's parents.

You can search by:
- name (string)
- siblings' names (array)
- spouse name (string)
- one parent's name (string)
- the other parent's name (string)
- childrens' names (array)

You can include as many or as few of these feilds as needed, but you should include at least one.
You should always include as many search elements as you know about about the person or people you're looking for.
For the array inputs, you can include as many or as few elements as needed.

Returns: a list of people matching the search criteria, including name and id.
If the person has not been created yet, an empty array will be returned.
`.trim()

export default {
    toolDescription: {
        name: "find_person",
        description: TOOL_DESCRIPTION,
        input_schema: {
            type: "object",
            properties: {
                name: { type: "string", description: "The name of the person you're looking for" },
                spouseName: { type: "string", description: "The name of the spouse of the person you're looking for" },
                parent1Name: { type: "string", description: "The name of the first parent of the person you're looking for" },
                parent2Name: { type: "string", description: "The name of the second parent of the person you're looking for" },
                childNames: { type: "array", items: { type: "string" }, description: "The names of the children of the person you're looking for" },
                siblingNames: { type: "array", items: { type: "string" }, description: "The names of the siblings of the person you're looking for" },
            },
            required: [],
        },
    },
    runTool: async (input) => {
        if (input.childNames && input.childNames.length === 0) { delete input.childNames }
        if (input.siblingNames && input.siblingNames.length === 0) { delete input.siblingNames }
        if (Object.keys(input).length === 0) { throw Error('You must include at least one search criteria') }


        return await FamilyService.findPerson({ ...input })
    }
}