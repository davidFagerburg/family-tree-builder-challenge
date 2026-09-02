import FamilyService from '../../service/FamilyService.js'

const TOOL_DESCRIPTION = `
Set the parents of a person already in the tree.
Parents must both already exist in the tree.
Both parents must be set at once. We don't yet support unknown parents, so you need to get both parents from the user or inform them that their family situation is not yet supported.
`.trim()


export default {
    toolDescription: {
        name: "set_parents",
        description: TOOL_DESCRIPTION,
        input_schema: {
        type: "object",
        properties: {
            childId: {type: 'number', description: 'the id of the child in the relationship'},
            parentId1: {type: 'number', description: 'the id of the first parent in the relationship'},
            parentId2: {type: 'number', description: 'the id of the second parent in the relationship'},
        },
        required: ['childId', 'parentId1', 'parentId2'],
        },
    },
    runTool: async (input) => {
        if (!input.childId || !input.parentId1 || !input.parentId2) { throw Error('All fields are required') }
        return await FamilyService.setParents(input.childId, input.parentId1, input.parentId2)
    }
}