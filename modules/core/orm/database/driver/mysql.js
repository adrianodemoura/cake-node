/**
 * Conexão com banco de dados MySQL
 *
 * @author  Adriano Moura
 */
'use strict'
/**
 * Mantém a conexão com o banco de dados mysql
 */
const mysql         = require('mysql')
class db {
	/**
	 * Método star da calse Database
	 *
	 * @param 	{Object} 	config 	Configurações de conexão
	 */
    constructor(config={}) {
        config.timezone    = config.timezone || "UTC"

        this.db             = mysql.createConnection(config)
        this.nameDb         = config.database
    	this.error          = ''
        this.lastInsertId   = 0
        this.affectedRows   = 0
        this.links          = ['and', 'or', 'union']
        this.operations     = ['<=','>=','<>','!=', 'not in','like','in','not between','between',':','=','<','>']
        this.typesString    = ['string', 'varchar', 'char', 'text', 'mediumtext']
        this.typesNumber    = ['number', 'int', 'tinyint', 'integer', 'double', 'float', 'decimal', 'bigint', 'enum', 'real', 'numeric', 'real']
        this.typesDate      = ['date', 'datetime', 'timestamp', 'time']
        this.transaction    = {begin: 'START TRANSACTION', commit: 'COMMIT', rollback: 'ROLLBACK'}
        this.dateFormat     = config.dateFormat     || ''
        this.dateTimeFormat = config.dateTimeFormat || ''
        this.mask           = config.mask           || false
    }

    /**
     * Retorna o operador que está contido no registro.
     *
     * @param   {String}    field       Registro, possivelmente com seus links ou operadores.
     * @return  {String}    link        Link de ligação entre os filtros.
     */
    getLink ( field='' ) {
        let link = 'AND'
        field = field.toLowerCase()
        if (field.indexOf(' ')>-1) {
            for (let i in this.links) {
                if ( field.indexOf(this.links[i]) > -1) {
                    link = this.links[i]
                    break
                }
            }
        }

        return link.toUpperCase()
    }

    /**
     * Retorna o operador que está contido num registro.
     *
     * @param   {String}    field       Registro, possivelmente com seus links ou operadores.
     * @return  {String}    operation   Operador
     */
    getOperation ( field='' ) {
        let operation = '='
        field = field.toLowerCase()
        if (field.indexOf(' ')>-1) {
            for (let i in this.operations) {
                if ( field.indexOf(this.operations[i]) > -1) {
                    operation = this.operations[i]
                    break
                }
            }
        }

        return operation
    }

    /**
     * Retorna o nome do registro, limpando seus links e operadores
     *
     * @param   {String}    field       Registro, possivelmente conteudo seus links e operadores.
     * @return  {String}    nameField   Nome do registro.
     */
    getFieldName ( field='' ) {
        let fieldName   = field
        let arrField    = field.split('.')
        fieldName       = (arrField[1]) ? arrField[1] : fieldName

        for (let i in this.operations) {
            fieldName = fieldName.replace(this.operations[i],'')
        }
        for (let i in this.links) {
            fieldName = fieldName.replace(this.links[i],'')
        }

        return fieldName.trim()
    }

    /**
     * Retorna o alias de um registro
     *
     * @param   {String}    register    Registro a ser configurado.
     * @param   {String}    aliasTable  Alias da tabela
     * @return  {Array}     arrField    Matriz com o alias e o registro, no formato Alias.field
     */
    getAliasTableField (register='', aliasTable='') {

        let arrField = register.split('.')
        
        if (!!!arrField[1]) {
            arrField[0] = aliasTable
            arrField[1] = register
        }

        return arrField
    }

    /**
     * Retorna a sql
     *
     * @param   {Object}    params      parâmetros da query: fields, table, alias, where, group, order by
     * @return  {String}    sql         Sql no formato mysql
     */
    getSql (params={}, sqlJoin=[]) {
        params.fields = params.fields   || '*'
        params.limit  = params.limit    || 10
        params.alias  = params.alias    || params.table.substring(0,4)

        // tipos de cada campo
        params.fieldsType = params.fieldsType || []

        // sql
        let sql = 'SELECT '
        if (!!params.distinct) {
            sql += 'DISTINCT '
        }
        sql += params.fields+' FROM '+params.table+' '+params.alias

        // sqlCount
        if (!!params.count) {
            sql = 'SELECT COUNT(1) as total FROM '+params.table+' '+params.alias
        }

        // join
        if (sqlJoin.length) {
            for (let loop in sqlJoin) {
                sql += ' '+sqlJoin[loop]
            }
        }

        // where
        if (!!params.where && Object.keys(params.where).length) {
            sql += ' WHERE '
            let loop = 0
            for(let register in params.where) {
                let value     = params.where[register]
                let field     = this.getFieldName(register)
                let fieldType = !!!params.fieldsType[field] ? 'string' : params.fieldsType[field]
                let arrField  = this.getAliasTableField(register, params.alias)
                let link      = this.getLink(register)
                let operation = this.getOperation(register)

                if ( this.typesString.indexOf(fieldType) > -1 ) {
                    if (["'",'"'].indexOf(value.substring(0,1)) <0) {
                        value = "'"+value+"'"
                    }
                }

                if (loop>0) {
                    sql += ' '+link+' '
                }

                if (['between', 'not between'].indexOf(operation) > -1) {
                    if (! this.typesString.indexOf(fieldType) > -1) {
                        value = value.replace(/[()]/g,'')
                    }
                    let arrValue = value.split(',')
                    value = arrValue[0]+' AND '+arrValue[1]
                }

                if (['in', 'not in'].indexOf(operation) > -1) {
                    if (value.indexOf('(') === -1) {
                        value = '('+value
                    }
                    if (value.indexOf(')') === -1) {
                        value = value+')'
                    }
                }

                sql += arrField[0]+'.'+field + ' '+ operation+' ' + value
                loop++
            }
        }

        // group
        if (!!params.group && Object.keys(params.group).length) {
            sql += ' GROUP BY '
            let l = 0
            for(let register in params.sort) {
                let arrField = this.getAliasTableField(register, params.alias)
                if (l) {
                    sql += ', '
                }
                sql += arrField[0] + '.' + arrField[1]
                l++
            }
        }

        // sort
        if (!!params.sort && Object.keys(params.sort).length) {
            sql += ' ORDER BY '
            let l = 0
            for(let loop in params.sort) {
                let direction = !!!params.sort[loop] ? 'ASC' : params.sort[loop]
                let arrField = this.getAliasTableField(loop, params.alias)

                if (l) {
                    sql += ', '
                }
                sql += arrField[0] + '.' + arrField[1] +' '+ direction.toUpperCase()
                l++
            }
        }

        // limit
        if (!!params.page && !!!params.count) {
            let start = (params.page-1) * params.limit
            let end = params.limit

            sql += ' LIMIT '+start+','+end
        }

        return sql
    }

    /**
     * Retorna a SQL para criar uma tabela
     *
     * @param   {Object}    params      Parâmetros da tabela
     * @return  {String}    sqlCreate   Sql para criar a tabela.
     */
    getSqlCreate (params={}) {
        if (!!!params.table) {
            return ''
        }

        const typesNoWidth      = ['double']
        let fields              = ''
        let indices             = ''

        params.pk               = params.pk                 || ''
        params.default_charset  = params.default_charset    || 'utf8'
        params.engine           = params.engine             || 'InnoDB'

        let sqlCreate = "CREATE TABLE"

        if (params.not_exists) {
            sqlCreate += " IF NOT EXISTS"
        }

        sqlCreate += " {table} ({fields}"
        
        sqlCreate += " {pk}"
        
        sqlCreate += " {indices})"
        
        sqlCreate += " ENGINE={engine}" 
        
        if (params.auto_increment) {
            sqlCreate += " AUTO_INCREMENT={auto_increment}"
        }

        sqlCreate += " DEFAULT CHARSET={default_charset}"

        let loop = 0

        for(let field in params.fields) {
            params.fields[field].type = params.fields[field].type || 'VARCHAR' 
            if (['number','numeric'].indexOf(params.fields[field].type.toLowerCase()) >-1) {
                params.fields[field].type = 'INTEGER'
            }
            if (params.fields[field].type.toLowerCase() === 'string') {
                params.fields[field].type = 'VARCHAR'
            }

            if (!!!params.fields[field].width) {
                if (this.typesNumber.indexOf(params.fields[field].type.toLowerCase()) > -1) {
                    params.fields[field].width = 11
                }
            }

            if (params.fields[field].pk) {
                params.pk = ', PRIMARY KEY('+field+')'
            }


            if (loop>0) { fields += ', '}

            // {field} {type}({width}) {not_null} {auto_increment} {default}
            fields += field+' '+params.fields[field].type.toUpperCase()

            if (params.fields[field].index) {
                if (indices.length>0 || params.pk.length>0 || fields.length>0) {
                    indices += ', '
                }
                let typeIndex = (params.fields[field].index.toString().toLowerCase() == 'unique') ? 'UNIQUE' : 'KEY'
                indices += typeIndex+' i_'+params.table.toLowerCase()+'_'+field.toLowerCase()+' ('+field+')'
            }

            if (params.fields[field].width && typesNoWidth.indexOf(params.fields[field].type.toLowerCase()) === -1) {
                fields += '('+params.fields[field].width
                if (typeof params.fields[field].precision !== 'undefined') {
                    fields += ','+params.fields[field].precision
                }
                fields += ')'
            }
            if (params.fields[field].pk) {
                fields += ' AUTO_INCREMENT'
            }
            if (params.fields[field].not_null) {
                fields += ' NOT NULL'
                if (!!!params.fields[field].default) {
                    if ( this.typesString.indexOf(params.fields[field].type.toLowerCase()) > -1 ) {
                        params.fields[field].default = "''"
                    } else {
                        params.fields[field].default = 0
                    }
                } else {
                    if ( this.typesString.indexOf(params.fields[field].type.toLowerCase()) > -1 ) {
                        params.fields[field].default = "'"+params.fields[field].default+"'"
                    }
                    if ( this.typesDate.indexOf(params.fields[field].type.toLowerCase()) > -1 && params.fields[field].default.toString().toLowerCase() !== 'current_timestamp') {
                        params.fields[field].default = "'"+params.fields[field].default+"'"
                    }
                }
            }
            if (typeof params.fields[field].default !== 'undefined') {
                fields += ' DEFAULT '+params.fields[field].default
            }
            loop++
        }

        // associations
        if (params.associations) {
            for(let Assoc in params.associations) {

                if (params.associations[Assoc].hasOne) { // hasOne (1:1)
                    let field           = params.associations[Assoc].hasOne.foreignKeyLeft  || '{foreignKeyLeft}'
                    let tableRight      = params.associations[Assoc].hasOne.tableRight      || '{tableRight}'
                    let foreignKeyRight = params.associations[Assoc].hasOne.foreignKeyRight || '{foreignKeyRight}'
                    let nameConstraint  = params.table.toLowerCase()+'_'+tableRight.toLowerCase()+'_'+field.toLowerCase()

                    indices += ', KEY i_'+params.table.toLowerCase()+'_'+field.toLowerCase()+' ('+field.toLowerCase()+')'
                    indices += ", CONSTRAINT "+nameConstraint+" FOREIGN KEY ("+field+") REFERENCES "+tableRight+" ("+foreignKeyRight+") ON DELETE CASCADE ON UPDATE CASCADE"
                }
            }
        }

        sqlCreate = sqlCreate.replace('{table}', params.table)
        sqlCreate = sqlCreate.replace('{fields}', fields)
        sqlCreate = sqlCreate.replace('{indices}', indices)
        sqlCreate = sqlCreate.replace('{pk}', params.pk)
        sqlCreate = sqlCreate.replace('{engine}', params.engine)
        sqlCreate = sqlCreate.replace('{auto_increment}', params.auto_increment)
        sqlCreate = sqlCreate.replace('{default_charset}', params.default_charset)

        return sqlCreate
    }

    /**
     * Retorna o último ID
     *
     * @param   {String}    table   Nome da tabela.
     * @return  {Number}    lastId  Último id.
     */
    async getLastId() {
        return this.lastInsertId
    }

    /**
     * Retorna o número de linhas afetadas
     *
     * @param   {String}    table   Nome da tabela
     * @return  {Object}    res     Resposta changes
     */
    async getAffectedRows() {
        return this.affectedRows
    }

    /**
     * Executa a query
     *
     * @param 	{String} 	sql 	Query a ser executada.
     * @return 	{Handle} 	res 	Resposta da query.
     */
    async query (sql='') {
    	let res     = false
        let error   = ''

        try {
        	await new Promise((resolve, reject) => {
                this.db.query(sql, function(err, results) {
                    if (err) {
                        error = err.message
                    } else {
                    	res = results
                    }

                    return err ? reject(err) : resolve()
                })
            })
        } catch (e) {
            error = e.message
            console.log(error+': '+sql)
        }
        if (error.length) {
            this.error = error
            if (this.debug) {
                console.log(sql)
                console.log(err.message) 
            }
        }

        this.lastInsertId = res.insertId        || 0
        this.affectedRows = res.affectedRows    || 0

        return res
    }

    /**
     * Lista todas as tabelas do banco
     *
     * @return 	{Array} 	res 	Lista com todas as tabelas.
     */
    async listTables () {
    	let allTables 	= []
    	let sql 		= "SHOW TABLES"
    	let res 		= await this.query(sql)
    	for (let i in res) {
    		allTables.push(res[i]['Tables_in_'+this.nameDb])
    	}

    	return allTables
    }

    /**
     * Executa a eclusão de uma tabela
     *
     * @param   {String}    table       Nome da tabela a ser excluída.
     * @return  {Boolean}   boolean     Verdadeiro em caso de sucesso, Falso se não.
     */
    async dropTable (table='') {
    	let sql 	= "DROP TABLE IF EXISTS "+table
    	if (! await this.query(sql)) {
    		return false
    	}
    	return true
    }

    /**
     * retorna todos os campos de uma tabela
     *
     * @param 	{String} 	table 		Nome da tabela
     * @return 	{Object} 	allFields 	objeto com todos os campos e suas propriedades
     */
    async getAllFields (table='') {
	    let allFields = {}

	    let sql = "SELECT * FROM information_schema.columns WHERE table_name='"+table+"' ORDER BY table_name, ordinal_position"

	    let results = await this.query(sql)

	    for(let i in results) {
	        let prop    = results[i]
	        let field   = prop.COLUMN_NAME
	        let schema  = {}
	        schema.name = field
	        schema.alias = field.humanize()
	        schema.null = 1
	        schema.type = prop.DATA_TYPE
	        schema.default = prop.COLUMN_DEFAULT

	        if (prop.COLUMN_KEY === 'PRI') {
	            schema.pk = 1
	        }
	        if (prop.COLUMN_KEY.length) {
	            schema.index = 1
	        }
	        if (prop.IS_NULLABLE === 'NO') {
	            schema.null = 0
	        }
	        if (!!prop.CHARACTER_MAXIMUM_LENGTH) {
	            schema.width = prop.CHARACTER_MAXIMUM_LENGTH
	        }
	        if (['timestamp'].indexOf(prop.DATA_TYPE)>-1) {
	            schema.width = 19
	        }

	        allFields[field] = schema
	    }

	    return allFields
	}

    /**
     * Cria uma nova coluna na tablea
     *
     * @params    {Object}    params  Parâmetros da colunas
     * @return  {Boolean}   boolean     Verdadeiro em caso de sucesso, falso se não.
     */
    async addColumn (params={}) {
        if (!!!params.table || !!!params.field || !!!params.type) {
            console.log(params)
            return false
        }

        let sql = "ALTER TABLE "+params.table+" ADD "+params.field+" "+params.type
        if (params.default) {
            sql += " DEFAULT "+params.default
        }
        if (params.not_null) {
            sql += " NOT NULL"
        }
        if (params.comment) {
            sql += " COMMENT '"+params.comment+"'"
        }

        if (! await this.query(sql)) {
            console.log(sql)
            return false
        }

        return true
    }

    /**
     * Cria uma nova coluna na tablea
     *
     * @params    {Object}    params  Parâmetros da colunas
     * @return  {Boolean}   boolean     Verdadeiro em caso de sucesso, falso se não.
     */
    async addConstraint (params={}) {
        if (!!!params.table || !!!params.tableRight || !!!params.fieldRight || !!!params.tableRightPk) {
            console.log(params)
            return false
        }
        if (!!!params.name) {
            params.name = params.table+'_'+params.tableRight+'_'+params.fieldRight+'_fk'
        }

        //ALTER TABLE cakenode_bd.vinculacoes ADD CONSTRAINT vinculacoes_fk 
        //FOREIGN KEY (usuario_id) REFERENCES cakenode_bd.usuarios(id) 
        //ON DELETE CASCADE ON UPDATE CASCADE;

        let sql = "ALTER TABLE "+params.table+" ADD CONSTRAINT "+params.name
        sql += " FOREIGN KEY ("+params.fieldRight+")"
        sql += " REFERENCES "+params.tableRight+"("+params.tableRightPk+")"
        if (!!!params.onDelete) {
            sql += " ON DELETE CASCADE"
        }
        if (!!!params.onDelete) {
            sql += " ON UPDATE CASCADE"
        }

        if (! await this.query(sql)) {
            console.log(sql)
            return false
        }

        return true
    }
}

module.exports = (config) => new db(config)