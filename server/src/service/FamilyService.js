import Person from '../model/person.js'
import db from '../config/database.js'
import { Op } from 'sequelize'

export default class FamilyService {
    constructor() { }

    static async addPerson(name) {
        return await Person.create({ name: name })
    }

    static async linkSpouses(personId1, personId2) {
        const [person1, person2] = await Promise.all([
            Person.findByPk(personId1),
            Person.findByPk(personId2)
        ])

        if (person1 === null || person2 === null) {
            throw Error(`person not found with ids: ${personId1} (${person1 === null ? 'not ' : ''}found), ${personId2} (${person2 === null ? 'not ' : ''}found)`)
        }

        if (person1.spouse_id === null && person2.spouse_id === null) {
            person1.spouse_id = person2.id
            person2.spouse_id = person1.id
            await Promise.all([person1.save(), person2.save()])
        } else {
            throw Error(`one or more of the persons is already linked to a spouse. remarriage not yet supported.`)
        }
    }

    static async setParents(childId, parentId1, parentId2) {
        const [child, parent1, parent2] = await Promise.all([
            Person.findByPk(childId),
            Person.findByPk(parentId1),
            Person.findByPk(parentId2)
        ])
        if (child === null) { throw Error(`child not found with id: ${childId}`) }
        if (parent1 === null) { throw Error(`parent 1 not found with id: ${parentId1}`) }
        if (parent2 === null) { throw Error(`parent 2 not found with id: ${parentId2}`) }

        // make sure parents are spouses
        if (parent1.spouse_id !== parent2.id) throw Error('half siblings and mixed families not yet supported. These parents are not married')

        child.parent_1_id = parent1.id
        child.parent_2_id = parent2.id
        
        await child.save()
    }

    static async unsetSpouse(personId) {
        const spouse1 = await Person.findByPk(personId)
        if (!spouse1) { throw Error(`cannot unset spouse - person not found with id: ${personId}`) }
        if (!spouse1.spouse_id) { throw Error('no spouse to unset') }

        const spouse2 = await Person.findByPk(spouse1.spouse_id)
        if (!spouse2) { throw Error(`cannot unset spouse - person's spouse not found with id: ${personId}`) }

        spouse1.spouse_id = null
        spouse2.spouse_id = null

        await Promise.all([spouse1.save(), spouse2.save()])
    }

    static async renamePerson(personId, name) {
        const person = await Person.findByPk(personId)
        if (!person) { throw Error(`cannot rename - person not found with id: ${personId}`) }

        person.name = name
        await person.save()
    }

    static async findPersonById(id) {
        return await Person.findByPk(id)
    }

    static async findAllPeople() {
        return await Person.findAll()
    }

    static async getPersonGraph() {
        const people = await Person.findAll()
        const graph = {
            people: [],
            parentEdges: [],
            spouseEdges: []
        }
        for (const person of people) {
            graph.people.push({ name: person.name, id: `${person.id}` })
            if (person.spouse_id) {
                graph.spouseEdges.push({
                    personAId: `${person.id}`,
                    personBId: `${person.spouse_id}`
                })
            }
            if (person.parent_1_id) {
                graph.parentEdges.push({
                    parentId: `${person.parent_1_id}`,
                    childId: `${person.id}`
                })
            }
            if (person.parent_2_id) {
                graph.parentEdges.push({
                    parentId: `${person.parent_2_id}`,
                    childId: `${person.id}`
                })
            }
        }
        return graph
    }

    static async findPerson({name, spouseName, parent1Name, parent2Name, childNames, siblingNames}) {
        const queryOptions = {
            where: {
                [Op.and]: []
            },
            include: []
        }

        if (name) { queryOptions.where[Op.and].push({ name: name }) }

        if (spouseName) {
            queryOptions.include.push({
                model: Person,
                as: 'Spouse',
                where: { name: spouseName },
                required: true
            })
        }

        if (parent1Name || parent2Name) {
            const parentNames = [parent1Name, parent2Name].filter(Boolean)

            queryOptions.include.push({
                model: Person,
                as: 'Parent1',
                required: false
            },{
                model: Person,
                as: 'Parent2',
                required: false
            })
            
            if (parentNames.length === 1) {
                queryOptions.where[Op.and].push({
                    [Op.or]: [
                        { '$Parent1.name$': parentNames[0] },
                        { '$Parent2.name$': parentNames[0] }
                    ]
                })
            } else if (parentNames.length === 2) {
                queryOptions.where[Op.and].push({
                    [Op.or]: [
                        {
                            [Op.and]: [
                                { '$Parent1.name$': parent1Name },
                                { '$Parent2.name$': parent2Name }
                            ]
                        },
                        {
                            [Op.and]: [
                                { '$Parent1.name$': parent2Name },
                                { '$Parent2.name$': parent1Name }
                            ]
                        }
                    ]
                })
            }
        }

        if (childNames && childNames.length > 0) {
            queryOptions.include.push(
                {
                    model: Person,
                    as: 'Children1',
                    required: false
                },
                {
                    model: Person,
                    as: 'Children2',
                    required: false
                }
            )

            queryOptions.where[Op.and].push({
                [Op.or]: [
                    { '$Children1.name$': { [Op.in]: childNames } },
                    { '$Children2.name$': { [Op.in]: childNames } }
                ]
            })
        }

        if (siblingNames && siblingNames.length > 0) {
            queryOptions.where[Op.and].push({
                [Op.or]: [
                    {
                        parent_1_id: {
                            [Op.in]: db.literal(`(
                                SELECT p.parent_1_id FROM People p WHERE p.name IN (:siblingNames) AND p.parent_1_id IS NOT NULL
                                UNION
                                SELECT p.parent_2_id FROM People p WHERE p.name IN (:siblingNames) AND p.parent_2_id IS NOT NULL
                            )`)
                        }
                    },
                    {
                        parent_2_id: {
                            [Op.in]: db.literal(`(
                                SELECT p.parent_1_id FROM People p WHERE p.name IN (:siblingNames) AND p.parent_1_id IS NOT NULL
                                UNION
                                SELECT p.parent_2_id FROM People p WHERE p.name IN (:siblingNames) AND p.parent_2_id IS NOT NULL
                            )`)
                        }
                    }
                ]
            });
            queryOptions.bind = { siblingNames: siblingNames }
        }

        if (queryOptions.where[Op.and].length === 0) {
            throw Error("No valid query options provided")
        }

        return await Person.findAll(queryOptions)
    }

}
