import { Sequelize } from 'sequelize';

const isTestEnv = process.env.NODE_ENV === 'test' || typeof global.vitest !== 'undefined'

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: isTestEnv ? ':memory:' : 'sqlite.db',
    dialectOptions: { foreignKeys: true } }
)

export default sequelize