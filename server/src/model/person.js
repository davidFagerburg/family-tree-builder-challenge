import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../config/database.js'

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const queryPath = path.join(__dirname, './recursive_lineage_check.sql');
const RECURSIVE_LINEAGE_CHECK_SQL = fs.readFileSync(queryPath, 'utf8');

const Person = sequelize.define('Person', {
    name: DataTypes.STRING,
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    parent_1_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    parent_2_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    spouse_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    validate: {
        async preventAncestryLoops() {
            if (!this.id || (!this.parent_1_id && this.parent_2_id)) return

            if (this.parent_1_id === this.id || this.parent_2_id === this.id) {
                throw Error('Ancestry loop detected')
            }

            const loopingRecords = await sequelize.query(
                RECURSIVE_LINEAGE_CHECK_SQL,
                {
                    replacements: {
                        childId: this.id,
                        p1: this.parent_1_id || 0,
                        p2: this.parent_2_id || 0
                    },
                    type: Sequelize.QueryTypes.SELECT
                }
            )

            if (loopingRecords.length > 0) {
                throw Error(`Circular lineage error: "${this.name}" is already an existing ancestor`)
            }
        }
    }
})

Person.belongsTo(Person, { foreignKey: { name: 'parent_1_id', allowNull: true }, as: 'Parent1' })
Person.belongsTo(Person, { foreignKey: { name: 'parent_2_id', allowNull: true }, as: 'Parent2' })
Person.belongsTo(Person, { foreignKey: { name: 'spouse_id', allowNull: true }, as: 'Spouse' })
Person.hasMany(Person, { foreignKey: 'parent_1_id', as: 'Children1' })
Person.hasMany(Person, { foreignKey: 'parent_2_id', as: 'Children2' })

export default Person