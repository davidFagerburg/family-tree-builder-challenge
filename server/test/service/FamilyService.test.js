import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import FamilyService from '../../src/service/FamilyService.js'
import db from '../../src/config/database.js'

describe('FamilyService Integration Tests (SQLite In-Memory)', () => {
  
  // Wipe and rebuild the database layout before each individual test block
  beforeEach(async () => {
    await db.sync({ force: true })
  })

  // Safe connection teardown after the full suite finishes execution
  afterAll(async () => {
    await db.close()
  })

  describe('addPerson', () => {
    it('should insert a person into the database', async () => {
      const person = await FamilyService.addPerson('John Doe')
      
      expect(person.id).toBeDefined()
      expect(person.name).toBe('John Doe')
    })
  })

  describe('linkSpouses', () => {
    it('should mutually connect two records together as spouses', async () => {
      const alice = await FamilyService.addPerson('Alice')
      const bob = await FamilyService.addPerson('Bob')

      await FamilyService.linkSpouses(alice.id, bob.id)

      // Pull fresh snapshots out of our test database
      const dbAlice = await FamilyService.findPersonById(alice.id)
      const dbBob = await FamilyService.findPersonById(bob.id)

      expect(dbAlice.spouse_id).toBe(bob.id)
      expect(dbBob.spouse_id).toBe(alice.id)
    })

    it('should fail with an execution error if bigamy is attempted', async () => {
      const alice = await FamilyService.addPerson('Alice')
      const bob = await FamilyService.addPerson('Bob')
      const charlie = await FamilyService.addPerson('Charlie')

      await FamilyService.linkSpouses(alice.id, bob.id)

      // Attempt to link Alice to Charlie should fail immediately
      await expect(FamilyService.linkSpouses(alice.id, charlie.id))
        .rejects
        .toThrow('one or more of the persons is already linked to a spouse')
    })
  })

  describe('setParents & Lineage Loop Guard', () => {
    it('should assign a child to a married parental couple', async () => {
      const dad = await FamilyService.addPerson('Michael')
      const mom = await FamilyService.addPerson('Sarah')
      const child = await FamilyService.addPerson('John Junior')

      await FamilyService.linkSpouses(dad.id, mom.id)
      await FamilyService.setParents(child.id, dad.id, mom.id)

      const dbChild = await FamilyService.findPersonById(child.id)
      expect(dbChild.parent_1_id).toBe(dad.id)
      expect(dbChild.parent_2_id).toBe(mom.id)
    })

    it('should intercept changes and throw an exception on loop creation', async () => {
      const grandparent = await FamilyService.addPerson('Alex')
      const grandparent2 = await FamilyService.addPerson('Alexis')

      await FamilyService.linkSpouses(grandparent.id, grandparent2.id)

      const parent = await FamilyService.addPerson('Sam')
      const parent2 = await FamilyService.addPerson('Sammy')

      await FamilyService.linkSpouses(parent.id, parent2.id)

      const child = await FamilyService.addPerson('Charlie')
      const anotherPerson = await FamilyService.addPerson('Charles')

      await FamilyService.linkSpouses(child.id, anotherPerson.id)

      // Setup standard 3-generation chain
      await FamilyService.setParents(parent.id, grandparent.id, grandparent2.id)
      await FamilyService.setParents(child.id, parent.id, parent2.id)

      // Attempt to break rules: assign Charlie (the child) as the parent of Alex (grandparent)
      // This will invoke your external recursive_lineage_check.sql file validation
      await expect(FamilyService.setParents(grandparent.id, child.id, anotherPerson.id))
        .rejects
        .toThrow('Circular lineage error')
    })
  })

  describe('findPerson Complex Query Handling', () => {
    it('should filter across multiple distinct family properties', async () => {
      const parentA = await FamilyService.addPerson('Robert')
      const parentB = await FamilyService.addPerson('Mary')
      const child = await FamilyService.addPerson('Timmy')

      await FamilyService.linkSpouses(parentA.id, parentB.id)
      await FamilyService.setParents(child.id, parentA.id, parentB.id)

      // Execute complex search block
      const result = await FamilyService.findPerson({
        parent1Name: 'Robert',
        parent2Name: 'Mary'
      })

      expect(result).not.toBeNull()
      expect(result.name).toBe('Timmy')
    })
  })
})
