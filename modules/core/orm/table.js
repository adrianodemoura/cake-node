/**
 * Classe Table pai de todos.
 */
 'use strict'
 /**
  * Mantém a table pai de todas.
  * - O Alias padrão será as 4 primeiras letras do nome da tabela, iniciando em maiúsculo.
  * - A primaryKey padrão será o campo ID.
  * - O displayField padrão será o segundo campo da tabela.
  * - A tabela poderá ter os seguintes campos para atualização automática: criado, create, modificado e modify
  * - Para os campos data o formato padrão será 'yyyy-MM-dd hh:mm:ss'
  * - As associações podem ser: hasOne (1:1) e hasMany (1:n)
  * - O Atributo schema é importante para cada classe, nele serão configurados os atributos de cada campo.
  * - Validações gerais podem ser feitas no método beforeValidate, para validações com acesso ao banco de dados, dê preferência ao método beforeSave.
  */
class Table {
    /**
     * Método start
     *
     * @param   {String}    table           Nome da tabela
     * @param   {String}    driver          Nome do data source
     * @param   {Object}    custoSchema     Schema customizado
     */
    constructor(ds='default') {
        this.ds             = ds

        const config        = require(ROOT + '/config/config_' + process.env['NODE_ENV'])
        const configDb      = config.data_sources[this.ds] || {}
        const driver        = !!!configDb.driver ? 'mysql' : configDb.driver.toLowerCase()

        this.module                 = ''
        this.driver                 = driver
        this.table                  = ''
        this.schemaName             = ''
        this.debug                  = false
        this.primaryKey             = ''
        this.displayField           = ''
        this.name                   = this.constructor.name
        this.schema                 = {}
        this.associations           = {}
        this.validations            = {}
        this.fieldsType             = {}
        this.fieldsUpdateNow        = []
        this.fieldsCreateNow        = []
        this.behaviors              = []
        this.data                   = {}
        this.logSql                 = {}
        this.useTransaction         = !!!configDb.transaction ? false : configDb.transaction
        this.lastId                 = 0
        this.affectedRows           = 0
        this.msg                    = ''
        this.error                  = ''
        this.warnings               = {}
        this.validationType         = 'create'
        this.forceCreate            = false
        this.saveMask               = false
        this.forcePkOrderBy         = true
        this.maxSave                = 10000
        this.db                     = require(CORE + '/orm/database/driver/'+driver)(configDb)
    }

    /**
     * Limpando alguns atributos. 
     * 
     * Útil para cada requisição, o histórico fica nos logs.
     */
    clean() {
        this.msg                = ''
        this.error              = ''
        this.warnings           = {}
        this.logSql             = {}
        this.data               = {}
        this.startTransaction   = false
        this.lastId             = 0
    }

    /**
     * Retorna do cache, o schema de uma table.
     *
     * @param   {String}    table   Nome da tabela.
     * @return  {Object}    schema  Schema da table.
     */
    getSchema(table='') {
        const Cache             = require (CORE + '/lib/cache.js')
        const schemaCacheName   = table.length>0 ? 'schema_'+table.toLowerCase() : 'schema_'+this.table
        let schema              = Cache.read(schemaCacheName)

        return schema
    }

    /**
     * Retorna informações da table
     *
     * @return    {Object}    info  Informações da tabela.
     */
   info() {
      let info          = {}

      info.table        = this.table
      info.primaryKey   = this.primaryKey
      info.module       = this.module

      return info
   }

    /**
     * inclui um behavior
     *
     * @param   {String}    behavior    Nome do behavior.
     * @return  {Boolean}   boolean     Veradeiro em caso de sucesso, Falso se não.
     */
    async setBehavior(behavior='') {

        if (typeof behavior !== 'string') {
            console.log(__('O parâmetro %behavior% deve ser uma string!'))
            return false
        }
        behavior = behavior.toLowerCase()

        if (this.behaviors.indexOf(behavior) < 0) {
            this.behaviors.push(behavior)
        } else {
            return false
        }

        const arq = '/orm/behavior/'+behavior
        try { // core
            const newBehavior   = require(CORE + arq)
            let methodsBehavior = Object.getOwnPropertyNames( Object.getPrototypeOf(newBehavior) )
            for (let loop in methodsBehavior) {
                let methodName = methodsBehavior[loop]
                if (methodName !== 'constructor' && !!!this[methodName]) {
                    this[methodName] = newBehavior[methodName]
                }
            }
        } catch (error) {
            try { // plugins
                const arrBehavior   = behavior.split('.')
                const newBehavior   = require(MODULES + '/' + arrBehavior[0] + '/orm/behavior/' + arrBehavior[1])
                const methodsBehavior = Object.getOwnPropertyNames( Object.getPrototypeOf(newBehavior) )
                for (let loop in methodsBehavior) {
                    let methodName = methodsBehavior[loop]
                    if (methodName !== 'constructor' && !!!this[methodName]) {
                        this[methodName] = newBehavior[methodName]
                    }
                }
            } catch (error) {
                if (this.debug) {
                    console.log('error orm.setBehavior: '+error.message)
                }
            }
        }

        return true
    }

    /**
     * configua o schema
     * 
     * @return  {void}
     */
    async setSchema() {

        await this.init()
        this.alias              = this.table.humanize().fourAlias()

        const Cache             = require (CORE + '/lib/cache.js')
        const schemaCacheName   = 'schema_'+this.table
        let gravarCache         = false
        let schemaCache         = Cache.read(schemaCacheName)

        if (!Object.keys(schemaCache).length) {
            gravarCache = true
            schemaCache = {'primaryKey': '', 'schema': {}, 'alias': this.alias, 'fieldsUpdateNow': [], 'fieldsCreateNow': [], 'fieldsType': {}}

            const schema = require(MODULES + '/' + this.module.toLowerCase() + '/orm/schema/' + this.schemaName.toLowerCase())

            schemaCache.schema          = schema.schema

            for (let field in schemaCache.schema) {
                if (typeof (schemaCache.schema[field].pk) !== 'undefined') { // primary key
                    schemaCache.primaryKey = field
                }

                schemaCache.fieldsType[field] = schemaCache.schema[field].type // campo=type

                if (['modificado', 'modified'].indexOf(field) > -1) { // campos que são atualizados a todo update
                    schemaCache.fieldsUpdateNow.push(field)
                }
                if (['criado', 'created'].indexOf(field) > -1) { // campos que são atualizados a todo insert
                    schemaCache.fieldsCreateNow.push(field)
                }
            }
        }

        this.schema             = schemaCache.schema
        this.primaryKey         = schemaCache.primaryKey
        this.fieldsType         = schemaCache.fieldsType
        this.fieldsUpdateNow    = schemaCache.fieldsUpdateNow
        this.fieldsCreateNow    = schemaCache.fieldsCreateNow

        if (gravarCache === true) {
            Cache.write(schemaCache, schemaCacheName)
        }

        this.setBehavior('finder')
        this.setBehavior('crud')
    }
}

module.exports = Table