/**
 * Class Finder
 * - Obrigatório a instância Table.
 * 
 * @author 		Adriano Moura
 * @package 	app.Core.Orm.Behavior
 */
'use strict'
/**
 * Mantém as funções de pesquisa de uma table.
 */
const Behavior = require (CORE + '/orm/behavior/behavior')
class Finder extends Behavior {
    /**
     * Função para testar o behavior Query
     *
     * @param   {Array}     testErrors  erros do teste.
     */
    test() {
        let testErrors = []

        if (typeof this.query === 'undefined') {
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
     * Configura o histórico de sqls
     * 
     * @param   {String}    sql     Query a ser gravada
     */
    setLogSql(sql = '') {
        this.logSql[(Object.keys(this.logSql).length)+1] = sql
    }

    /**
     * Retorna o nome de um campo com base no seu alias
     *
     * @param   {String}  aliasField    No formato AliasField
     * @return  {String}  fieldName     Nome do campo, que esteja no atributo this.schema
     */
    getFieldName (aliasField='') {
      let fieldName   = aliasField
      const arrFields = aliasField.replace(/([A-Z])/g, ' $1').trim().replace(' ','.').replace(' ','_').toLowerCase().split('.')
      fieldName       = arrFields[1] || ''

      return fieldName
    }

    /**
     * Retorna o alias de um campo.
     *
     * @param   {String}    field           Nome do campo a ser formatado.
     * @param   {Object}    schemaField     Propriedades do campo.
     * @return  {String}    aliasField      Campo formatado para sql field as aliasField
     */
    getAliasField ( field = '', schemaField = {}, alias='' ) {
        let aliasField  = ''
        let typeField   = schemaField.type || 'string'
        let useMask     = !!!this.db.mask ? false : this.db.mask
        let mask        = schemaField.mask || false
        alias           = !alias.length ? this.alias : alias

        if (field.indexOf('.')>-1) {
            let arrField    = field.split('.')
            aliasField      = field.capitalize()+' AS '+arrField[0].capitalize()+arrField[1].capitalize().humanize()
        } else {
            aliasField      = alias.capitalize()+'.'+field+' AS '+alias.capitalize()+field.capitalize().humanize()
        }

        if (useMask) {
            if (this.db.typesDate.indexOf(typeField) > -1) {
                let arrField        = aliasField.split('AS')
                let dateFormat      = this.db.dateFormat        || ''
                let dateTimeFormat  = this.db.dateTimeFormat    || ''
                let vlrDefault      = schemaField.default       || ''
                let maskFormat      = (vlrDefault.length === 10) ? dateFormat : dateTimeFormat

                if (maskFormat.length>0) {
                    aliasField = maskFormat.replace('{field}', arrField[0])+' AS '+arrField[1]
                }
            } else {
                if (mask) {
                    let arrField    = aliasField.split('AS')
                    aliasField      = "MASK("+arrField[0]+",'"+mask+"')"+' AS '+arrField[1]
                }
            }
        }

        return aliasField
    }

	/**
	 * Retorna a sql where string em formato json.
	 * 
	 * @param 	{String} 	where 		Filtros da sql no formato string
	 * @return 	{Object} 	novoWhere 	Filtros da sql no formato json.
	 */
	getJsonSqlWhere(where = '') {
        let divisor 	= ';'
        let novoWhere   = {}
        let link 		= ''
        let operador 	= ':'
        const arrWhere  = where.split(divisor)

        operador = ( arrWhere[0].indexOf(':') > -1 ) ? ':' : operador

        for(let loop in arrWhere) {
        	link 	  	= ''
            operador    = ':'
        	let line 	= arrWhere[loop]

        	for (let i in this.db.operations) {
        		if (line.indexOf(' '+this.db.operations[i]+' ') > -1) {
        			operador = this.db.operations[i]
                    break
        		}
        	}
        	for (let o in this.db.links) {
        		if (line.indexOf(' '+this.db.links[o]+' ') > -1) {
        			link = this.db.links[o]
                    break
        		}
        	}

        	let arrLine 	= line.split(operador)
            if (!!!arrLine[1]) {
                this.error = __('Não foi possível identificar o campo do filtro!')
                return false
            }
            let value 		= arrLine[1].trim()
            let field 		= arrLine[0].replace(link,'').replace(operador,'').trim()
            if (field.indexOf(' ')>-1) {
                let arrField= field.split(' ')
                link        += arrField[0]
                field       = arrField[1].trim()
            }
            if (!!!this.schema[field]) {
                field = field.replace(this.alias,'')
                field = field.replace(/([A-Z])/g, '_'+' $1').replace(/\ /g,'').replace('_','')
                field = field.toLowerCase()
            }

            if (!!!this.schema[field]) {
                this.error = __("O campo %"+field+"% é inválido!")
                return false
            }

            let typeField = 'string'
            if (this.schema[field]) {
                typeField = this.schema[field].type || 'string'
            }

            if (operador === ':') {
                operador = '='
            }

            novoWhere[(link+' '+field+' '+operador).trim()] = value
        }

        return novoWhere
    }

    /**
     * Retorna a sql where no formato json
     *
     * @param 	{Object} where 		Objeto where no formato json.
     * @return 	{String} sqlWhere 	sql where no formato string.
     */
    getSqlWhere(where = {}) {
    	let sqlWhere 	= ''
    	let loop 		= 0
        let link 		= ''
        let operador 	= ''

    	for (let line in where) {
    		operador 	= '='
        	link 	  	= ''
    		let value 	= where[line]

    		for (let i in this.db.operations) {
        		if (line.indexOf(this.db.operations[i]) > -1) {
        			operador = this.db.operations[i]
        		}
        	}
        	for (let o in this.db.links) {
        		if (line.indexOf(this.db.links[o]) > -1) {
        			link = this.db.links[o]
        		}
        	}

        	let aliasField  = line.replace(link,'').replace(operador,'').trim()
            let field       = this.getFieldName(aliasField)
            if (field.indexOf(' ')>-1) {
                let arrField= field.split(' ')
                link        = 'AND '+arrField[0]
                field       = arrField[1]
            }
        	let typeField 	= this.schema[field].type

    		if (loop>0) {
    			link = (link==='') ? ' AND ' : ' '+link+' '
    		}

    		if (['numeric', 'integer', 'number', 'int'].indexOf(typeField)>-1) {
                value = (typeof value !== 'numeric') ? value : parseInt(value)
            } else {
            	value = "'"+value+"'"
            }
            if (operador === ':') {
                operador = '='
            }

    		sqlWhere += link.toUpperCase() + field +' '+ operador.toUpperCase() +' '+ value
    		loop++
    	}

    	return sqlWhere.trim()
    }

    /**
     * Retorna a sql da direita para relacionamentos 1:1
     * 
     * @param {String}  alias           Nome da alias da tabela da esquerda.
     * @param {Object}  foreignLeftKey  Nome do campo que liga a tabela da esquerda.
     * @param {Object}  schema          Schema da tabela da esquerda.
     * @param {Object}  associations    Parâmetros de cada associação, exemplo: {table: 'municipio', foreignKey: 'id', fields: ['id', 'nome'], sort: ['nome']}
     * @return {String} sql             Sql Join
     */
    getSqlHasOne(params={}) {
        let sql = ''

        try {
            const alias = this.alias

            if (!!!params.tableRight) {
                throw new Error(__('Tabela do lado direito inválida!'))
            }

            params.join         = params.join || 'LEFT JOIN'
            params.aliasRight   = params.aliasRight || params.tableRight.substr(0,4).capitalize()

            if (!!!params.foreignKeyRight) {
                throw new Error(__('Chave da tabela da direita inválida !'))
            }

            sql = params.join
            sql += ' '   + params.tableRight + ' ' + params.aliasRight
            sql += ' ON '+ params.aliasRight + '.' + params.foreignKeyRight
            sql += ' = ' + this.alias + '.' + params.foreignKeyLeft

        } catch (error) {
            sql = error.message
            if (this.debug) {
                console.log(error.message)
            }
        }

        return sql
    }

    /**
     * Retorna a sql do tipo hasMany (tem muitos 1:n)
     *
     * @param   {Object}    params  Parâmetros do relacionamento do tipo hasMany. tableRight, fields, schemaFields
     * @return  {String}    sql     Sql para hasMany.
     */
    getSqlHasMany(params={}) {
        let sql = ''

        try {
            if (!!!params.tableRight) {
                throw new Error(__('Tabela do lado direito inválida!'))
            }
            if (!!!params.fields) {
                throw new Error(__('Campos do lado direito inválidos!'))
            }
            if (!!!params.schema) {
                throw new Error(__('Esquema inválido!'))
            }

            params.aliasRight = params.aliasRight || params.tableRight.humanize().fourAlias()

            sql = 'SELECT fieldsRight FROM tableRight aliasRight'

            if (params.tableBridge) {
                params.aliasBridge = params.aliasBridge || params.tableBridge.humanize().fourAlias()
                sql += ' LEFT JOIN tableBridge aliasBridge ON aliasBridge.foreignKeyBridgeRight = aliasRight.foreignKeyRight'
                if (params.includeJoin) {
                    for (let i in params.includeJoin) {
                        sql += ' '+params.includeJoin[i]
                    }
                }
                sql += ' WHERE aliasBridge.foreignKeyBridgeLeft = valueKey'
            } else {
                if (params.includeJoin) {
                    for (let i in params.includeJoin) {
                        sql += ' '+params.includeJoin[i]
                    }
                }
                sql += ' WHERE aliasRight.foreignKeyRight = valueKey'
            }

            let newFieldsRight = ''
            for(let l in params.fields) {
                let field = params.fields[l]
                if (params.schema[field].hidden) {
                    continue
                }
                if (l>0) {
                    newFieldsRight += ', '
                }
                newFieldsRight += this.getAliasField(field, params.schema[field], params.aliasRight)
            }
            params.fields = (newFieldsRight.length>0) ? newFieldsRight : '*'


            sql = sql.replace('fieldsRight', params.fields)
                .replace('tableRight', params.tableRight)
                .replace('aliasRight', params.aliasRight)
                .replace('tableBridge', params.tableBridge)
                .replace('aliasBridge', params.aliasBridge)
                .replace('foreignKeyBridgeRight', params.foreignKeyBridgeRight)
                .replace('aliasRight', params.aliasRight)
                .replace('foreignKeyRight', params.foreignKeyRight)
                .replace('foreignKeyBridgeLeft', params.foreignKeyBridgeLeft)
            sql = sql.replaceAll('aliasBridge', params.aliasBridge)
        } catch (error) {
            this.error = error.message
            if (this.debug) {
                console.log(this.error)
            }
            sql = ''
        }

        return sql
    }

	/**
     * Retorna o resultado de um consulta do banco de dados.
     *
     * @param   {String}    sql     Query a ser executado pelo banco de dados.
     * @return  {Objec}     res     Resultado da query
     */
    async query(sql = '') {
        let res     = false
        let logSql  = configure('log_sql')

        try {
            if (sql.indexOf(';') > -1) {
                let arrSql = sql.split(';')
                for (let i in arrSql) {
                    if (logSql) { gravaLog(arrSql[i], 'sqls') }
                    res = await this.db.query(arrSql[i])
                }
            } else {
                if (logSql) { gravaLog(sql, 'sqls') }
                res = await this.db.query(sql)
            }
        } catch (error) {
            res = false
            gravaLog(error.message, 'error_sql')
            gravaLog(sql, 'error_sql')
            this.error = __('Erro ao executar query, verifique os logs!')
        }

        return res
    }

	/**
     * Retorna o total de registros conforme os parâmetros
     *
     * @param   {Object}    params  Parâmetros para a contagem
     * @return  {Boolean|Integer}   count,boolean   Total da pesquisa ou False em caso de erros.
     */
    async count(params = {}, sqlJoin=[]) {
        let count = 0
        try {
            params.table = !!!params.table ? this.table : params.table
            params.count = true
            if (!!!params.fieldsType || !params.fieldsType.length) {
                params.fieldsType = {}
                for (let field in this.schema) {
                    params.fieldsType[field] = this.schema[field].type
                }
            }

            let sqlCount = this.db.getSql(params, sqlJoin)
            let resCount = await this.query(sqlCount)
            if (!!!resCount) {
                throw new Error(__('Erro ao executar count!'))
            }
            return resCount[0].total
        } catch (error) {
            this.error = error.message
            gravaLog('erro ao executar '+this.name+'.count: '+error.message, 'error_count')
            return false;
        }
    }

	/**
     * Retorna o menor e o mairo valor de um campo.
     *
     * @param   {String}    field   Registro a ser pesquisado.
     * @return  {Object}    retorno Retorno da pesquisa, menor e maior valor
     */
    async getMinMax(field = 'id') {
        let retorno = {}
        let sql = "SELECT min("+this.alias+'.'+field+") as MinMax from "+this.table+' '+this.alias 
        sql += " UNION "
        sql += " SELECT max("+this.alias+'.'+field+") as MinMax from "+this.table+' '+this.alias 

        let res = await this.query(sql)
        if (!!res[0]['MinMax']) {
            retorno.min = res[0]['MinMax']
            retorno.max = res[1]['MinMax']
        }

        if (typeof this.schema[field].index === 'undefined') {
            this.warnings[field] = __("O Campo %"+field+"% não possui índice !")
        }

        return retorno
    }

	/**
     * Método find
     *
     * @param   {params}    Object      Parâmetros da busca. limit, page, where, sort, group
     * - o parâmetro limit deve ser um número que vai limitar o número de registros. limit não pode ultrapassar 100000
     * - o parâmero page, se não informado será usado 1.
     * - fields deve ser uma Array no formato: [Alias.field1, Alias.field2]
     * - group deve ser um Array no formato: [Alias.field1, Alias.field2]
     * - where deve ser um Object no formato: {[AND|OR] Alias.Field1 operation: Value2, Alias.Field2: Value2}
     * - sort deve ser um Object no formato: {Alias.Field1:Direction,Alias.Field2:Direction}. aonde alias é o alias da tabela, field1,2 são os registros e direction ASC ou DESC
     *
     * @return  {lista}     Object      Status da Operação. status, msg, paginacao, itens
     */
    async find(params = {}) {
        const lista = {status: true, msg: ''}

        try {
            // variácies locais
            let paginacao   = {}
            let noCount     = false
            let pk          = this.primaryKey
            let schemaFields= objectClone(this.schema)

            // parâmetros obrigatório para a pesquisa
            params.limit        = params.limit          || 10
            params.page         = params.page           || 1
            params.fieldHidden  = params.fieldHidden    || false
            params.type         = params.type           || 'all'
            params.fields       = params.fields         || []
            params.associations = params.associations   || []
            params.group        = params.group          || []
            params.table        = this.table
            params.alias        = this.alias
            params.fieldsType   = this.fieldsType

            // validando os parâmetros
            if (params.fields.constructor.name !== 'Array') {
                throw new Error('01 - '+__('O parâmetro %fields% deve ser do tipo %array%!'))
            }
            if (params.group.constructor.name !== 'Array') {
                throw new Error('02 - '+__('O parâmetro %group% deve ser do tipo %array%!'))
            }
            if (params.associations.constructor.name !== 'Array') {
                throw new Error('03 - '+__('O parâmetro %associations% deve ser do tipo %array%!'))
            }

            // se é um count
            if (params.type === 'count') {
                return await this.count(params, sqlJoin.hasOne)
            }

            // where
            params.where = !!!params.where ? {} : params.where
            if (typeof params.where === 'string') {
                params.where = this.getJsonSqlWhere(params.where)
                if (params.where === false) {
                    if (this.debug) {
                        console.log(params.where)
                    }
                    throw new Error('04 - '+this.error)
                }
            }

            // sort
            params.sort = params.sort || {}
            if (typeof params.sort === 'string') {
                params.sort = getStringToJson(params.sort)
            }
            if (this.forcePkOrderBy) { // inserindo primaryKey na ordenação
                if (!!!params.sort[pk] && pk) {
                    params.sort[pk] = 'ASC'
                }
            }
            if (this.debug) {
                if ( Object.keys(params.sort).length ) {
                    for (let field in params.sort) {
                        if (!!!this.schema[field].index) {
                           this.warnings[field] = __('Índice inexistente para o campo ')+field
                        }
                    }
                }
            }

            // sé é lista ou o primeiro, não executa o count
            if (['list','first'].indexOf(params.type) > -1) {
                noCount = true;
            }

            // paginação
            params.page  = (params.page<1) ? 1 : params.page
            params.limit = (params.limit>100000) ? 100000 : params.limit
            if (!noCount) {
                paginacao = {page: parseInt(params.page), count: 0, pageCount: 0, limit: params.limit}
            }
            if (! params.fields.length ) { // se não foi passado nenhum campo, pega todos da tabela corrente.
                params.fields = []
                for (let field in this.schema) {
                    params.fields.push(field)
                }
            }

            // configurando as associações
            const sqlJoin = {'hasOne': [], 'hasMany': []}
            for (const loop in params.associations) {
                const assocName = params.associations[loop]

                if (!!!this.associations.hasOne) {
                    continue
                }
                if (!!!this.associations.hasOne[assocName]) {
                    continue
                }

                // recuperando sql hasOne
                if (!!! this.associations.hasOne[assocName].fields) {
                    const schemaHasOne = await this.getSchema(this.associations.hasOne[assocName].tableRight)
                    for(const fieldHasOne in schemaHasOne.fieldsType) {
                        schemaFields[schemaHasOne.alias+'.'+fieldHasOne] = schemaHasOne.schema[fieldHasOne]
                        params.fields.push(schemaHasOne.alias+'.'+fieldHasOne)
                    }
                }
                sqlJoin.hasOne.push(this.getSqlHasOne(this.associations.hasOne[assocName]))
            }

            // renomeando campo a campo
            let newsFields = []
            for (const loop in params.fields) {
                const alias         = this.alias
                const field         = params.fields[loop]
                const schemaField   = schemaFields[field] || {}

                if (params.fieldHidden === false) {
                    let hidden = schemaField.hidden || false
                    hidden = !!!schemaField.pk ? hidden : false
                    if (hidden) {
                        continue
                    }
                }

                newsFields.push(this.getAliasField(field, schemaField, alias))
            }
            params.fields = newsFields

            // executando o count
            if (!noCount) {
                let cloneParams = objectClone(params)

                paginacao.count = await this.count(cloneParams, (sqlJoin.hasOne || []))
                if (paginacao.count === false) {
                    throw new Error('05 - '+__('Erro ao executar count!'))
                }
            }

            // verifica o sort
            if (this.debug) {
                if ( typeof params.sort !== 'undefined' ) {
                    if ( params.sort.constructor.name !== 'Object' ) {
                        throw new Error('06 - '+__('O Parâmetro sorte deve estar no formato {Alias.field:direction}'))
                    }
                }
            }

            // calculando a última página
            if (!noCount) {
                paginacao.pageCount = Math.ceil(paginacao.count / params.limit)
                if (params.page === '*') {
                    params.page = paginacao.pageCount
                }
                if (params.page>paginacao.pageCount) {
                    paginacao.page = paginacao.pageCount
                    params.page = paginacao.page
                }
                paginacao.page = parseInt(params.page)
            }

            // se é uma lista, o sort deve ser o segundo campo
            if (params.type === 'list' && !!!params.sort) {
                let field2 = params.fields[1].split(' ')[0]
                params.sort = {}
                params.sort[field2] = 'ASC'
            }

            // executando a query principal
            let sql = this.db.getSql(params, sqlJoin.hasOne)
            lista.itens = await this.query(sql)
            if (lista.itens === false) {
                gravaLog(params, 'params_'+this.table)
                throw new Error('07 - '+__('Erro ao recuperar a lista!'))
            }

            // se foi pedido uma lista
            if (params.type === 'list') {
                let newLista = {}
                let chaves = Object.keys(lista.itens[0])
                let field1 = chaves[0]
                let field2 = chaves[1]
                for(let line in lista.itens) {
                    let vlr1 = lista.itens[line][field1]
                    let vlr2 = lista.itens[line][field2]
                    newLista[vlr1] = vlr2
                }
                lista.itens = newLista
            }

            // configurando a paginação
            if (!noCount) {
                lista.paging = paginacao
            }
            // recuperando as associações do tipo hasMany
            for (const loop in params.associations) {
                const assocName = params.associations[loop]

                // recuperando sql hasOne
                if (this.associations.hasMany[assocName]) {
                    const schemaHasMany = await this.getSchema(this.associations.hasMany[assocName].tableRight)
                    if (!schemaHasMany) {
                        throw new Error(__('Não foi possível recuperar o schema de '+assocName+' '+this.associations.hasMany[assocName].tableRight))
                    }
                    this.associations.hasMany[assocName].schema = schemaHasMany.schema
                    
                    if (!!! this.associations.hasMany[assocName].fields) {
                        this.associations.hasMany[assocName].fields = []
                        for(const fieldHasMany in schemaHasMany.fieldsType) {
                            this.associations.hasMany[assocName].fields.push(fieldHasMany)
                        }
                    }
                    
                    sqlJoin.hasMany[assocName] = this.getSqlHasMany(this.associations.hasMany[assocName])
                }
            }
            for (let assocHasMany in sqlJoin.hasMany) {
                for (let loopItens in lista.itens) {
                    let sqlHasMany      = sqlJoin.hasMany[assocHasMany]
                    const nameFieldLeft = this.associations.hasMany[assocHasMany].foreignKeyLeft
                    const fieldLeft     = (this.alias+'_'+nameFieldLeft).capitalize().humanize()
                    const valueKey      = lista.itens[loopItens][fieldLeft]

                    if (sqlHasMany.length>0) {
                        sqlHasMany = sqlHasMany.replace('valueKey', valueKey)
                        let listHasMany = await this.query(sqlHasMany)
                        lista.itens[loopItens][assocHasMany] = listHasMany
                    }
                }
            }

            if (params.type === 'first') {
                return lista.itens[0]
            }

            return lista
        } catch (error) {
            this.error = error.message
            gravaLog(this.error, 'error_find', 'w+')
            gravaLog(getTrace(error), 'error_find')
            return false
        }
    }
}

module.exports = new Finder()