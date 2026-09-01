import { Sequelize } from 'sequelize';
const sequelize = new Sequelize({dialect: 'sqlite', storage: 'sqlite.db', dialectOptions: { foreignKeys: true}})

export default sequelize