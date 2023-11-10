const { Sequelize }  = require('sequelize')

module.exports = new Sequelize(
    'default_db',
    'gen_user',
    '1EcL_23B)nqz/g',
    {
        host: '46.19.64.79',
        port: '5432',
        dialect: 'postgres'
    }
)