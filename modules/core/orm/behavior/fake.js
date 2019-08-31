/**
 * Class Behavior Fake
 * - Obrigatório a instância Table.
 * 
 * @author 		Adriano Moura
 * @package 	app.Core.Orm.Behavior
 */
/**
 * Retorna um objeto com dados fake de uma Table.
 */
const Behavior = require (CORE + '/orm/behavior/behavior')
class Fake extends Behavior {
    /**
     * Executa o teste da classe Fake
     *
     * @return {Void}
     */
    test () {
        let testErrors = []

        if (!this.alias) {
            testErrors.push(__('O alias não foi definido !'))
        }

        if (! Object.keys(this.schema).length ) {
            testErrors.push(__('O schema não foi definido !'))
        }

        if (testErrors.length>0) {
            for (i in testErrors) {
                console.log(testErrors[i])
            }
        }

        // se não existe a função maskSql

        return testErrors
    }

    /**
     * Retorna o valor fake de um campo
     *
     * @param   {String}    field   Nome do campo
     * @return  {Mixed}     vlr     Valor fake do campo
     */
    getValue(field='', inc=1) {
        let vlr         = ''
        let schemaField = !!!this.schema[field] ? {} : this.schema[field]

        const validations   = this.validations[field]   || {}
        let genericType     = 'string'
        let type            = schemaField.type          || 'string'
        let width           = schemaField.width         || 0
        let list            = schemaField.list          || []
        let between         = validations.between       || []
        let band            = between.band              || []
        let vlrDefault      = schemaField.default       || ''
        let pk              = !!!schemaField.pk         ? false     : true
        let chaves          = (list instanceof Array)   ? list : Object.keys(list)
        let typeValidate    = ''

        typeValidate        = !!!validations.email  ? typeValidate : 'email'
        typeValidate        = !!!validations.cpf    ? typeValidate : 'cpf'
        typeValidate        = !!!validations.cnpj   ? typeValidate : 'cnpj'

        if (this.db.typesNumber.indexOf(type) > -1) {
            genericType = 'number'
        }
        if (this.db.typesDate.indexOf(type) > -1) {
            genericType = 'timestamp'
        }

        if (list.length>0 && type === 'string') {
            genericType = 'number'
            vlr         = 0
        }

        switch (genericType) {
            case 'number':
                vlr = 0
                if (chaves.length>0) {
                    let tamanho     = chaves.length
                    let randomico   = Math.floor(Math.random()*tamanho)

                    vlr = parseInt(chaves[randomico])
                }

                if (band.length>0) {
                    let fixo = 0
                    let posD = band[1].toString().indexOf('.')
                    if (posD>-1) {
                        fixo = band[1].toString().length - posD - 1
                    }
                    if (fixo == 0) {
                        posD = band[0].toString().indexOf('.')
                        if (posD>-1) {
                            fixo = band[0].toString().length - posD - 1
                        }   
                    }

                    vlr = ((Math.random() * (band[1] - band[0])) + band[0]).toFixed(fixo)
                }
                break

            case 'timestamp':
                vlr = maskSql(new Date())
                break

            default:
                vlr = field+' '+inc+' '
                vlr = vlr.repeat(width).substr(0,width).trim()
        }

        if (typeValidate === 'email') {
            vlr         = field+inc
            vlr         = vlr.repeat(width).substr(0,width).trim()
            let per     = Math.floor(Math.random() * (30 - 10 + 1)) + 10
            let posiAt  = width - Math.floor((vlr.length / 100) * per)
            let newVlr  = vlr.substr(0,posiAt)+'@'+vlr
            vlr         = newVlr.substr(0,width).trim()
            vlr         = vlr.substr(0,width-7)+'.com.br'
        }

        if (typeValidate === 'cpf') {
            let ini = 100000000
            let fim = 99999999999
            let diff = Math.floor(Math.random() * (fim - ini + 1)) + ini
            vlr = ini + diff
            vlr = vlr.toString().repeat(width).substr(0,width).trim()
        }

        if (typeValidate === 'cnpj') {
            let ini = 1000000000000
            let fim = 99999999999999
            let diff = Math.floor(Math.random() * (fim - ini + 1)) + ini
            vlr = ini + diff
            vlr = vlr.toString().repeat(width).substr(0,width).trim()
        }

        if (pk === true) {
            vlr = inc
        }

        if (genericType === 'number') {
            if (!vlr.toString().length) {
                vlr = 0
            }
        }

        return vlr
    }

    /**
     * Retorna os dados fake de uma tabela
     * 
     * @param   {Integer}   tot             Total de registros fake.
     * @param   {Integer}   inc             Incremento inicial
     * @param   {Boolean}   includePk       Se verdadeiro vai incluir valor da primarykey, se não ignora o campo.
     * @param   {Boolean}   includeAssoc    Se verdadeiro vai incluir os dados dos relacionamentos também.
     * @param   {Array}     fields          Campos do fake
     * @return  {Boolean|Json} boolean|json Objeto com dados fake ou falso em caso de erros.
     */
    async fake(tot=0, inc=1, includePk=false, includeAssoc=true, fields=[] ) {
        let data = {}
        try {
            // recuperando as associações hasMany
            let listHasMany = []
            for (let association in this.associations) {
                for (let typeAssoc in this.associations[association]) {
                    if ( typeAssoc === 'hasMany' ) {
                        listHasMany.push(association)
                    }
                }
            }

            if (! fields.length) {
                for (let field in this.schema) {
                    if (listHasMany.indexOf(field) < 0) {
                        fields.push(field)
                    }
                }
            }

            // recuperando a lista para campo com validação inTable
            for (let field in this.validations) {
                let prop = this.validations[field]

                if (prop['list']) {
                    continue
                }
                if (!!!prop['inTable']) {
                    continue
                }

                // recuperando a lista para relacionamentos hasOne (1:1)
                let tableList   = prop.inTable['tableAssoc'] || ''
                let fieldList   = prop.inTable.fieldAssoc || 'id'
                let sqlList     = "SELECT "+fieldList+" FROM "+tableList+" ORDER BY "+fieldList
                let dataList    = await this.db.query(sqlList)
                let listList    = []
                for (let idList in dataList) {
                    listList.push(dataList[idList][fieldList])
                }
                this.schema[field].list = listList
            }

            // caso pediu associações, recupera uma lista de cada associação.
            let listAssoc = {}
            if (includeAssoc) {
                for (let a in listHasMany ) {

                    let assocName   = listHasMany[a]
                    let propHasMany = this.associations[assocName].hasMany
                    if (!!! propHasMany.table) {
                        throw new Error(__('O Parâmero table é obrigatório para a associação de '+assocName))
                    }
                    const Table = await getTable(propHasMany.table)
                    if (!Table) {
                        throw new Error(__('Não foi possível instanciar a Table da associação %'+assocName+'%'))
                    }

                    listAssoc[assocName] = []

                    let sqlAssoc    = 'SELECT '+Table.primaryKey+' FROM '+Table.table+' ORDER BY '+Table.primaryKey

                    let lista = await this.db.query(sqlAssoc)
                    if (!lista) {
                        throw new Error(__('Não foi possível recuperar a lista de '+assocName))
                    }
                    for (let a in lista) {
                        listAssoc[assocName].push(lista[a][Table.primaryKey])
                    }
                }
            }

            // loop em cada campo
            for (let field in this.schema) {
                const aliasField = (this.alias+'_'+field).capitalize().humanize()

                if (fields.indexOf(field) === -1) {
                    continue
                }

                let pk = !!!this.schema[field].pk ? false : true
                if (includePk === false && pk === true) {
                    continue
                }

                for (let i = 0; i<tot; i++) {
                    if (!!!data[i]) {
                        data[i] = {}
                    }
                    data[i][aliasField] = this.getValue(field, (inc+i))

                    if (!includeAssoc) {
                        continue
                    }

                    // criando campos associados do tipo bridge (hasMany)
                    for (let a in listHasMany ) {
                        let assocName       = listHasMany[a]
                        let totRange        = Math.round((listAssoc[assocName].length * 0.7))
                        data[i][assocName]  = sortear(listAssoc[assocName],totRange)
                    }
                }
            }

            return data
        } catch (error) {
            this.error = error.message
            if (configure('debug')) {
                console.log(error.message)
                this.test()
            }

            return false
        }
    }
}

module.exports = new Fake()