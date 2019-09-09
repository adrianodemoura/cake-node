/**
 * Class Crud
 *
 * @author 		Adriano Moura
 * @package 	app.Core.Orm.Behavior
 * @param       Instância Table
 */
/**
 * Mantém as funções de CRUD de uma table.
 * - Obrigatório o behavior 'finder'.
 */
const Behavior 	= require (CORE + '/orm/behavior/behavior')
class Crud extends Behavior {
    /**
     * Função para testar o behavior Crud
     *
     * @param   {Array}     testErrors  erros do teste.
     */
    test() {
        let testErrors = []

        if (typeof this.Table.query === 'undefined') {
            testErrors.push(__('A Table não possui função para pesquisa!'))
        }

        if (testErrors.length>0) {
            for (let i in testErrors) {
                console.log(testErrors[i])
            }
        }
        
        return testErrors
    }

    /**
     * Retorna a sql UPDATE ou INSERT com base no data.
     *
     * @return  {String}  sql   Sql no formato insert ou update
     */
    getSqlByData() {
        let sql         = ''
        let sqlFields   = []
        let sqlValues   = []
        let pk          = this.primaryKey
        let vlrPk       = 0
        let loop        = 0

        if (this.validationType === 'update') {
            sql = 'UPDATE '+this.table+' SET'        
        } else if (this.validationType === 'create') {
            sql = 'INSERT INTO '+this.table+' (fields) VALUES (values)'        
        }

        for (let field in this.schema) {
            let aliasField      = this.name.fourAlias()+field.humanize()

            if (!!! this.data[aliasField] ) {
                continue
            }

            let type            = this.schema[field].type
            let mask            = this.schema[field].mask || ''
            let typeString      = (this.db.typesString.indexOf(type.toLowerCase()) > -1)? true : false
            let typeDate        = (this.db.typesDate.indexOf(type.toLowerCase()) > -1)  ? true : false
            let vlr             = this.data[aliasField]

            if (mask.length>0 && !this.saveMask && mask.substr(0,1) === '#' && !typeDate) {
                vlr = String(vlr).replace(/\D/g,'')
            }

            if (typeString === true || typeDate === true) {
                if (vlr.constructor.name.toLowerCase() === 'number') {
                    vlr = vlr.toString()
                }
                vlr = vlr.replace(/'/g,'').replace(/"/g,'')
                if (typeDate === true) {
                    vlr = maskSql(vlr)
                }
                if (type === 'date') {
                    vlr = vlr.substr(0,10)
                }
                vlr = '"'+vlr+'"'
            }

            if (this.validationType === 'update' && field === pk) {
                vlrPk = parseInt(vlr)
                continue
            }

            if (this.validationType === 'update') {
                if (loop>0) {
                    sql += ', '
                }
                sql += ' '+field+' = '+vlr
            } else if (this.validationType === 'create') {
                sqlFields.push(field)
                sqlValues.push(vlr)
            }

            loop++
        }

        if (this.validationType == 'update') {
            sql += ' WHERE '+this.primaryKey+'='+vlrPk
        } else if (this.validationType === 'create') {
            sql = sql.replace('fields', sqlFields)
            sql = sql.replace('values', sqlValues)
        }

        return sql
    }

	/**
     * Limpa a tabela
     *
     * param {Object}   params  parâmetros do método. Se zeroFil igual true, a contagem também será resetada.
     */
    async truncate(params = {}) {
        params.table    = this.table
        params.zeroFill = !!!params.zeroFill ? true : params.zeroFill

        await this.query('DELETE FROM '+params.table)
        if (params.zeroFill) {
            let sqlZeroFill = this.db.getSqlZeroFill(params)
            await this.query(sqlZeroFill)
        }

        return true
    }

    /**
     * Executa código antes do método validate.
     * 
     * @param   {Object}    data        Dados do registro.
     * @return  {Boolean}   boolean     Verdadeiro se deve continuar, Falso se deve abortar.
     */
    async beforeValidate() {
        //console.log('passei aqui no core.orm.behavior.crud.beforeValidate')
        return true
    }

    /**
     * Executa a validação do registro.
     * 
     * @param   {Object}    schema      Estrutura de cada registro contendo suas validações.
     * @param   {Object}    data        Dados do registro a ser validado.
     */
    async validate() {
        const Validation = require (CORE + '/orm/validation')(this)

        if (! await this.beforeValidate()) {
            throw new Error(this.error)
        }

        const aliasPk = (this.alias+'_'+this.primaryKey).capitalize().humanize()

        // validanto campos vazios
        let totalErrors = 0
        for (let field in this.schema) {
            let validations = !!!this.validations[field] ? {} : this.validations[field]
            let aliasField  = (this.alias+'_'+field).capitalize().humanize()
            let titleField  = this.schema[field].title || aliasField

            if (validations.notEmpty && !!!this.data[aliasField]) {
                let paramsNotEmpty  = validations.notEmpty
                paramsNotEmpty.when = !!!paramsNotEmpty.when ? ['create', 'update'] : paramsNotEmpty.when

                if (paramsNotEmpty.when.indexOf(this.validationType) > -1) {
                    let msgError = validations.notEmpty.msg || __('Erro ao validar %'+titleField+'%')
                    this.error = msgError.replace('{' + field + '}', this.data[aliasField])
                    totalErrors++
                }
            }
        }
        if (this.error.length>0) {
            throw new Error(this.error)
        }

        // validando o conteúdo postado
        for (let aliasField in this.data) {
            let field = this.getFieldName(aliasField)
            if (!!!this.validations[field]) {
                continue
            }
            let validations = objectClone(this.validations[field])
            let title       = !!!this.schema[field].title ? field : this.schema[field].title

            if (Object.keys(validations).length) {
                for (let validation in validations) {
                    let paramsValidate      = validations[validation]
                    let msgError            = paramsValidate.msg || __('Erro ao validar %'+title+'%')

                    paramsValidate.field    = field
                    paramsValidate.table    = this.table
                    paramsValidate.alias    = this.alias
                    paramsValidate.value    = this.data[aliasField]
                    if (paramsValidate.value.constructor.name === 'String') {
                        if ( paramsValidate.value.substr(0,1) === "'") {
                            paramsValidate.value = paramsValidate.value.substr(1,paramsValidate.value.length)
                        }
                        if ( paramsValidate.value.substr(-1) === "'") {
                            paramsValidate.value = paramsValidate.value.substr(0,paramsValidate.value.length-1)
                        }
                        if ( paramsValidate.value.substr(0,1) === '"') {
                            paramsValidate.value = paramsValidate.value.substr(1,paramsValidate.value.length)
                        }
                        if ( paramsValidate.value.substr(-1) === '"') {
                            paramsValidate.value = paramsValidate.value.substr(0,paramsValidate.value.length-1)
                        }
                    }
                    paramsValidate.fieldPk  = this.primaryKey
                    paramsValidate.valuePk  = this.data[aliasPk] || 0
                    paramsValidate.when     = paramsValidate.when || ['create', 'update']

                    // vai um alerta se não tem índice.
                    if ( ['unique', 'inTable'].indexOf(validation) > -1 ) {
                        if (typeof (this.schema[field].index) === 'undefined') {
                            this.warnings[field] =  __('O campo %'+title+'% não possui índice !')
                        }
                    }

                    // executando a validação
                    if ( paramsValidate.when.indexOf(this.validationType) > -1 ) {
                        if ( ! await Validation.validate(validation, paramsValidate) ) {
                            this.error = msgError.replace('{' + field + '}', paramsValidate.value)
                            totalErrors++
                        }
                    }
                }
            }
        }
    }

    /**
     * Executa código antes do método save.
     * 
     * @param   {Object}    data        Dados do registro.
     * @return  {Boolean}   Verdadeiro se deve continuar, Falso se deve abortar.
     */
    async beforeSave() {
        //console.log('passei aqui no core.orm.behavior.crud.beforeSave de '+this.name)
        return true
    }

    /**
     * Sava o registro no banco de dados.
     * 
     * @param   {Object}    data    Dados do registro a ser salvo.
     * @param   {Boolean}   commit  Se verdadeiro vai iniciar um transação.
     */
    async save(data = {}, commit = true) {
        if (this.useTransaction && commit) {
            await this.query(this.db.transaction.begin)
        }

        try {
            // recuperando somente os dados da tabela
            if (! Object.keys(data).length) {
                throw new Error(__('Nenhum dado a ser salvo para o alias '+this.alias))
            }

            // limpando alguns atributos do registro
            let txtSave             = __('salvar')
            this.data               = data
            this.error              = ''
            this.lastId             = 0
            this.affectedRows       = 0
            const aliasPk           = (this.alias+'_'+this.primaryKey).capitalize().humanize()
            let vlrPk               = this.data[aliasPk] || 0

            // definindo o tipo de validação (create ou update)
            this.validationType = 'update'
            if (!!!this.data[aliasPk]) {
                this.validationType = 'create'
                txtSave = __('inserir')
            }
            if (this.forceCreate) {
                this.validationType = 'create'
            }

            // verifica se o registro realmente existe
            if (this.validationType === 'update') {
                const paramsCount = {table: '', where: {}}
                paramsCount.table = this.table
                paramsCount.where[this.primaryKey] = vlrPk
                let totPk = await this.count(paramsCount)
                if (!totPk) {
                    throw new Error(__('Registro inválido!'))
                }
            }

            // executando o validate
            await this.validate()
            if (this.error.length>0) {
                throw new Error(this.error)
            }

            // executando o beforeSave
            if (! await this.beforeSave()) {
                if (this.debug) { gravaLog(this.error, 'error_table_beforeSave') }
                throw new Error(this.error)
            }

            // campos criado e modificado
            if (this.fieldsCreateNow.length>0) {
                for (let loop in this.fieldsCreateNow) {
                    const aliasCreate = (this.alias+'_'+this.fieldsCreateNow[loop]).capitalize().humanize()
                    if (this.validationType !== 'create') {
                        delete this.data[aliasCreate]
                    } else {
                        this.data[aliasCreate] = maskSql(new Date())
                    }
                }
            }
            if (this.fieldsUpdateNow.length>0) {
                for (let loop in this.fieldsUpdateNow) {
                    const aliasUpdate = (this.alias+'_'+this.fieldsUpdateNow[loop]).capitalize().humanize()
                    this.data[aliasUpdate] = maskSql(new Date())
                }
            }

            // verifica se tem algo a salvar
            let sql     = this.getSqlByData()
            let execSql = false
            if (this.validationType === 'update') {
                if (sql.indexOf(',') > -1) {
                    execSql = true
                }
            } else {
                if (sql.indexOf('VALUES') > -1) {
                    execSql = true
                }
            }

            // salvando a table corrente
            if (execSql) {
                let res = await this.query(sql)
                if (res === false) {
                    this.error = __('Erro ao tentar '+txtSave+' o registro !')
                    throw new Error(this.error)
                }
                this.lastId         = await this.db.getLastId(this.table)
                this.affectedRows   = await this.db.getAffectedRows(this.table)
                vlrPk = this.lastId || vlrPk
            }

            // salvando associações
            if (! await this.saveAssociation(vlrPk) ) {
                throw new Error(this.error)
            }

            if (! await this.afterSave()) {
                this.error = (this.error.length !== 0) ? this.error : __('Erro depois de '+txtSave+' o registro !')
                if (this.debug) {
                    gravaLog(this.error, 'error_table_afterSave')
                }
                throw new Error(this.error)
            }

            //throw new Error(__('Não vou deixar salvar, mas cheguei no final do método table.save'))
            if (this.useTransaction && commit) {
                await this.query(this.db.transaction.commit)
            }

            return true
        } catch (error) {
            if (this.useTransaction && commit) {
                await this.query(this.db.transaction.rollback)
            }
            this.error = error.message

            return false
        }
    }

    /**
     * Salva os dados da associação
     *
     * @param   {Integer}   vlrId               Valor da primaryKey do registro corrente.
     * @param   {Object}    dataAssociation     Dados da associação
     * @return  {Boolean}   bollean             Verdadeiro em caso de sucessso, Falso se não.
     */
    async saveAssociation(vlrId=0) {
        let dataAssociation = {}
        for (let Association in this.associations.hasMany) {
            if (this.data[Association]) {
                if (this.data[Association].constructor.name === 'String') {
                    dataAssociation[Association] = this.data[Association].replace(/[\[\]]/g,'').replace(/[\(\)]/g,'').split(',')
                } else {
                    dataAssociation[Association] = this.data[Association]
                }
            }
        }

        try {
            if (! Object.keys(dataAssociation).length) {
                return true
            }

            let tableClean = []
            let tableInsert= []

            // montando cada sql INSERT
            for(let Association in dataAssociation) {
                if (!!!this.associations.hasMany[Association]) {
                    continue
                }
                const paramsAssociation = this.associations.hasMany[Association]
                if (!!!paramsAssociation.tableBridge) {
                    continue
                }
                const tableBridge       = paramsAssociation.tableBridge

                // tabelas a limpar
                tableClean[tableBridge] = paramsAssociation.foreignKeyBridgeLeft+'='+vlrId

                // tabela a incluir
                if (!!!tableInsert[tableBridge]) {
                    tableInsert[tableBridge] = []
                    for (let l in dataAssociation[Association]) {
                        let valueAssoc = dataAssociation[Association][l]
                        if (!!!valueAssoc) {
                            throw new Error(__('Não foi possível recuperar o valor relacionado de %'+Association+'%'))
                        }
                        tableInsert[tableBridge].push("INSERT INTO "+tableBridge+" ("+paramsAssociation.foreignKeyBridgeLeft+","+paramsAssociation.foreignKeyBridgeRight+") VALUES ("+vlrId+","+valueAssoc+")")
                    }
                } else {
                    for (let l in tableInsert[tableBridge]) {
                        let valueAssoc = dataAssociation[Association][l]
                        if (!!!valueAssoc) {
                            throw new Error(__('Não foi possível recuperar o valor relacionado de %'+Association+'%'))
                        }
                        tableInsert[tableBridge][l] = tableInsert[tableBridge][l].replace(') VALUES', ','+paramsAssociation.foreignKeyBridgeRight+') VALUES')
                        tableInsert[tableBridge][l] = tableInsert[tableBridge][l].substr(0,tableInsert[tableBridge][l].length-1)+','+valueAssoc+')'
                    }
                }
            }

            // limpando as tabela
            for (let table in tableClean) {
                let sqlDel = 'DELETE FROM '+table+' WHERE '+tableClean[table]
                if (! await this.query(sqlDel)) {
                    if (this.debug) {
                        console.log(sqlDel)
                    }
                    throw new Error(__('Erro ao tentar limpar relacionamentos!'))
                }
            }

            // inserindo os relacionamentos
            for (let table in tableInsert) {
                for (let l in tableInsert[table]) {
                    let sqlInsert = tableInsert[table][l]
                    if (! await this.query(sqlInsert)) {
                        throw new Error(__('Erro ao tentar salvar relacionamento!'))
                    }
                    let assocAffectedRows   = await this.db.getAffectedRows(table)
                }
            }

            return true
        } catch (error) {
            if (this.debug) {
                gravaLog(dataAssociation, 'error_data_association')
                gravaLog(error.message, 'error_save_association')
            }
            this.error = error.message
            return false
        }
    }

    /**
     * Executa chamada após o método save.
     * 
     * @return  {Boolean}   Verdadeiro se a operação save deve continuar, Falso se deve abortar.
     */
    async afterSave() {
        //console.log('passei aqui no core.table.behavior.crud.afterSave')
        return true
    }

    /**
     * Salva um faixa de registros
     * 
     * @param   {Object}    data        Lista com vários registros a serem salvos
     * @return  {Boolean}   boolean     Falso se falhou, ou status da operação.
     */
    async saveAll(data = {}) {
        let retorno = {}

        if (this.useTransaction) {
            await this.query(this.db.transaction.begin)
        }

        const totalData = Object.keys(data).length

        try {
            let totalCreate = 0
            let totalUpdate = 0

            if (totalData > this.maxSave) {
                throw new Error(__('A faixa não pode ultrapassar %'+this.maxSave+'% linhas!'))
            }

            for(let l in data) {
                if (! await this.save(data[l], false)) {
                    throw new Error(this.error)
                }

                if (this.affectedRows>0) {
                    if (this.validationType === 'create') {
                        totalCreate++
                    } else {
                        totalUpdate++
                    }
                }
            }

            if (this.useTransaction) {
                await this.query(this.db.transaction.commit)
            }

            retorno.status      = true
            retorno.total       = totalData
            retorno.totalCreate = totalCreate
            retorno.totalUpdate = totalUpdate
            this.msg            = retorno

            //throw new Error(__('Não vou deixar salvar, mas cheguei no final do método table.saveAll'))
            return true
        } catch (error) {
            if (this.useTransaction) {
                await this.query(this.db.transaction.rollback)
            }
            this.error          = error.message

            return false
        }
    }

    async beforeDelete(id=0) {
        //console.log('passei aqui no core.table.behavior.crud.beforeDelete')
        return true
    }

    /**
     * Executa a exclusão de um registro da table.
     *
     * @param   {Integer}   id          Id do registro a ser excluído
     * @return  {Boolean}   boolean     Verdadeiro em caso de sucesso, Falso se não.
     */
    async delete(id=0) {
        if (this.useTransaction) {
            await this.query(this.db.transaction.begin)
        }

        try {
            if (typeof id !== 'number') {
                throw new Error(__('O campo %id% não é numérico!'))
            }

            if ( ! await this.beforeDelete(id) ) {
                throw new Error(this.error)
            }

            let sql = "DELETE FROM "+this.table+" WHERE "+this.primaryKey+"="+id
            let res = await this.query(sql)
            if (!res) {
                throw new Error(__('Não foi possível excluir o registro '+id))
            }
            let totalDelete = await this.db.getAffectedRows(this.table)
            if (! totalDelete) {
                throw new Error(__('O %Id% %'+id+'% não foi localizado para exclusão!'))
            }

            if (! await this.afterDelete(id) ) {
                throw new Error(__('Não foi possível excluio o registro '+id))
            }

            if (this.useTransaction) {
                await this.query(this.db.transaction.commit)
            }

            return true
        } catch (error) {
            if (this.useTransaction) {
                await this.query(this.db.transaction.rollback)
            }
            this.error = error.message

            return false
        }
    }

    /**
     * Executa código após o método delete
     *
     * @param   {Integer}   id      Id do registro que foi excluído.
     * @return  {Boolean}   boolean Verdadeiro se ok, Falso se não.
     */
    async afterDelete(id=0) {
        //console.log('passei aqui no core.table.behavior.crud.afterDelete')
        return true
    }

    /**
     * Executa a eclusão de váriso registros de uma vez
     * 
     * @param   {Object}    where       Filro para exclusão.
     * @return  {Boolean}   boolean     Verdadeiro em caso de sucesso, Falso se não.
     */
    async deleteAll(where={}) {
        if (this.useTransaction) {
            await this.query(this.db.transaction.begin)
        }

        try {
            if (typeof where !== 'object') {
                where = this.getJsonSqlWhere(where)
            }

            let sql = 'DELETE FROM '+this.table+' WHERE '+this.getSqlWhere(where)
            let res = await this.query(sql)
            if (! res) {
                throw new Error(__('Ocorreu um erro ao tentar excluir um registro!'))
            }
            let totalDelete = await this.db.getAffectedRows(this.table)
            if (totalDeleted) {
                this.msg = totalDeleted+' '+__('registro(s0) excluído(s0) com sucesso.')
            } else {
                this.msg = __('Nenhum registro encontrado para exclusão!')
            }

            //throw new Error(__('Não vou deixar %deletar% todos, mas cheguei no final do método %deleteAll%'))
            if (this.useTransaction) {
                await this.query(this.db.transaction.commit)
            }

            return true
        } catch (error) {
            if (this.useTransaction) {
                await this.query(this.db.transaction.rollback)
            }
            this.error = error.message

            return false
        }
    }

    /**
     * Executa a atualização de vários registros
     *
     * @param   {Object}    fields      Campos no formato field:value
     * @param   {Object}    where       Filtros para o método, obrigatório.
     * @return  {Boolean}   boolean     Se verdadeiro atualiza o atributo msg da Table, se Falso o atributo error.
     */
    async updateAll(fields={}, where={}) {
        if (this.useTransaction) {
            await this.query(this.db.transaction.begin)
        }

        try {
            if (typeof fields !== 'object') {
                throw new Error(__('Campo(s) inválido(s)!'))
            }
            if (typeof where !== 'object') {
                where = this.getJsonSqlWhere(where)
            }
            if (!Object.keys(where).length) {
                throw new Error(__('Parâmetro %where% é obrigatório!'))
            }

            let sql = 'UPDATE '+this.table+' SET'
            let loop= 0
            for (let aliasField in fields) {
                let value           = fields[aliasField]
                let field           = this.getFieldName(aliasField)

                if (!!!this.schema[field]) {
                    throw new Error(__('Não foi possível identificar o campo %'+field+'% para atualização'))
                }

                let typeField       = this.schema[field].type
                let typeString      = this.db.typesString.indexOf(typeField) > -1   ? true : false
                let typeDate        = this.db.typesDate.indexOf(typeField) > -1     ? true : false

                if (typeString || typeDate) {
                    value = '"'+value+'"'
                } else {
                    value = (typeof value !== 'numeric') ? value : parseInt(value)
                }

                if (loop>0) {
                    sql += ', '
                }

                sql += ' '+field+'='+value
                loop++
            }
            sql += ' WHERE '+this.getSqlWhere(where)

            let res = await this.query(sql)
            if (! res) {
                throw new Error(__('Ocorreu um erro ao tentar atualizar o registro!'))
            }
            let totalUpdate = await this.db.getAffectedRows(this.table)
            if (totalUpdate) {
                this.msg = totalUpdate+' '+__('registro(s) atualizado(s) com sucesso.')
            } else if (this.db.error.length>0) {
                console.log(this.db.error)
                throw new Error(__('Nenhum registro encontrado para atualização!'))
            }

            //throw new Error(__('Não vou deixar %deletar% todos, mas cheguei no final do método %deleteAll%'))
            if (this.useTransaction) {
                await this.query(this.db.transaction.commit)
            }

            return true
        } catch (error) {
            if (this.useTransaction) {
                await this.query(this.db.transaction.rollback)
            }
            this.error = error.message
            if (this.debug) {
                gravaLog(error.message, 'error_update_all')
            }

            return false
        }
    }

    /**
     * Cria uma tabela no banco de dados.
     *
     * @param   {Obejct}    schema      Schema da Table com a configuraçaõ de cada campo.
     * @return  {Object}    retorno     Status da operação.
     */
    async createTable(params={}) {
        let retorno = {}
        try {
            params.table        = this.table
            params.fields       = objectClone(this.schema)
            params.associations = objectClone(this.associations)

            const listTables    = await this.db.listTables()

            if (params.delete) {
                if (! await this.db.dropTable(this.table) ) {
                    throw new Error('Não foi possível excluir a tabela %'+params.table+'%')
                }
            }

            // criando tabelas e recuperando configuração hasOne
            for(let Assoc in params.associations.hasOne) {
                if (!!! params.associations.hasOne[Assoc]) {
                    continue
                }
                if (!!! params.associations.hasOne[Assoc].tableRight) {
                    throw new Error(__('O Parâmetro tableRight não foi informado na associação hasOne de '+this.name+'.'+Assoc))
                }

                if (!!! params.associations.hasOne[Assoc].foreignKeyRight ) {
                    throw new Error(__('O Parâmetro foreignKeyRight não foi informado na associação hasOne de '+this.name+'.'+Assoc))
                }
            }

            let sqlCreate = this.db.getSqlCreate(params)
            if (! await this.query(sqlCreate)) {
                throw new Error (__('Erro ao tentar criar tabela %'+params.table+'%'))
            }

            let allTables       = await this.db.listTables()
            let paramsHasmany   = {'table': '', 'not_exists': true, 'fields': [], 'associations': {}}
            let tableBridge     = ''
            let tableRight      = ''
            let fieldBridge     = ''
            let fieldLeft       = ''
            let fieldRight      = ''

            // criando tabelas hasOne
            for(let Assoc in params.associations.hasMany) {
                if (!!!params.associations.hasMany[Assoc]) {
                    continue
                }
                // hasMany precisa ter a tabela do meio
                if (!!! params.associations.hasMany[Assoc].tableBridge) {
                    continue
                }
                if (!!! params.associations.hasMany[Assoc].tableRight) {
                    throw new Error(__('O Parâmetro tableRight não foi informado na associação hasMany '+this.name+'.'+Assoc))
                }
                if (!!! params.associations.hasMany[Assoc].foreignKeyRight) {
                    throw new Error(__('O Parâmetro foreignKeyRight não foi informado na associação hasMany '+this.name+'.'+Assoc))
                }
                if (!!! params.associations.hasMany[Assoc].foreignKeyLeft) {
                    throw new Error(__('O Parâmetro foreignKeyLeft não foi informado na associação hasMany '+this.name+'.'+Assoc))
                }

                const tableBridge = params.associations.hasMany[Assoc].tableBridge
                paramsHasmany['table'] = tableBridge

                tableRight  = params.associations.hasMany[Assoc].tableRight
                fieldLeft   = params.associations.hasMany[Assoc].foreignKeyBridgeRight
                fieldRight  = params.associations.hasMany[Assoc].foreignKeyBridgeRight
                fieldBridge = params.associations.hasMany[Assoc].foreignKeyBridgeLeft

                if (allTables.indexOf(tableRight) < 0) {
                    if (this.debug) {
                        //console.log(__('A tabela %'+tableRight+'% já foi instalada!'))
                    }
                    continue
                }

                if (paramsHasmany.fields.indexOf(fieldBridge) === -1) {
                    paramsHasmany.fields[fieldBridge] = {type: 'numeric', not_null: true}
                    paramsHasmany.associations['Assoc'] = {'hasOne': {'foreignKeyLeft':'', 'foreignKeyRight':'', 'tableRight':''}}

                    paramsHasmany.associations['Assoc']['hasOne']['foreignKeyLeft'] = fieldBridge
                    paramsHasmany.associations['Assoc']['hasOne']['foreignKeyRight']= this.primaryKey
                    paramsHasmany.associations['Assoc']['hasOne']['tableRight']     = this.table
                }

                if (paramsHasmany.fields.indexOf(fieldLeft) === -1) {
                    paramsHasmany.fields[fieldLeft] = {type: 'numeric', not_null: true}
                }
                if (paramsHasmany.fields.indexOf(fieldRight) === -1) {
                    paramsHasmany.fields[fieldRight] = {type: 'numeric', not_null: true}
                }

                if (!!!paramsHasmany.associations[Assoc]) {
                    paramsHasmany.associations[Assoc] = {'hasOne': {'foreignKeyLeft':'', 'foreignKeyRight':'', 'tableRight':''}}
                }
                paramsHasmany.associations[Assoc]['hasOne']['foreignKeyLeft'] = fieldLeft
                paramsHasmany.associations[Assoc]['hasOne']['foreignKeyRight']= params.associations.hasMany[Assoc].foreignKeyRight || 'id'
                paramsHasmany.associations[Assoc]['hasOne']['tableRight']     = tableRight
            }

            if (Object.keys(paramsHasmany.fields).length) {
                let sqlCreateHasMany = this.db.getSqlCreate(paramsHasmany)

                if (listTables.indexOf(paramsHasmany.table) > -1) {
                    const allFieldsHM   = await this.db.getAllFields(paramsHasmany.table)
                    let newFields       = []
                    for (let fieldHM in paramsHasmany.fields) {
                        if (!!! allFieldsHM[fieldHM]) {
                            newFields[fieldHM] = paramsHasmany.fields[fieldHM]
                        }
                    }
                    for (let field in newFields) {
                        let paramsNewColumn     = newFields[field]
                        let paramsNewConstrant  = {}
                        
                        paramsNewColumn.field   = field
                        paramsNewColumn.table   = paramsHasmany.table
                        
                        paramsNewConstrant.table        = paramsHasmany.table
                        paramsNewConstrant.fieldRight   = field
                        paramsNewConstrant.tableRight   = this.table
                        paramsNewConstrant.tableRightPk = this.primaryKey

                        if (! await this.db.addColumn(paramsNewColumn)) {
                            throw new Error (__('Não foi possível incluir novos campos na tabela %'+paramsNewColumn.table+'%'))
                        }
                        if (! await this.db.addConstraint(paramsNewConstrant)) {
                            throw new Error (__('Não foi possível incluir uma nova constrant para a tabela %'+paramsNewConstrant+'%'))
                        }
                    }
                } else {
                    if (! this.query(sqlCreateHasMany) ) {
                        console.log(this.error)
                        throw new Error(__('Não foi possível criar Associações de '+this.table))
                    }
                }
            }

            return true
        } catch (e) {
            this.error = e.message
            if (this.debug) {
                console.log(this.error)
            }
            return false
        }
    }
}

module.exports = new Crud()