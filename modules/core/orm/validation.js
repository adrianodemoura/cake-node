/**
 * Class Validation
 */
'use strict'
/**
 * Mantem as validações dos campos de uma tabela ou um collection.
 * - A instância Table é obrigatória.
 * 
 * usage: const Validation = require (CORE + '/orm/validation')(this)
 * 
 */
class Validation {
    /**
     * Método start da validação
     *
     * @param   {Object}    Table   Instância table
     * @return  {Void}
     */
    constructor(Table='') {
        this.Table = Table
        this.validation = {
            'field': {
                string:     {msg: ''},
                unique:     {msg: ''},
                email:      {msg: ''},
                cpf:        {msg: ''},
                cnpj:       {msg: ''},
                notEmpty:   {msg: '', when: ['create','update']},
                inTable:    {msg: '', tableAssoc: '', fieldAssoc: 'id'},
                between:    {msg: '', band: []}
            }
        }
    }

    /**
     * Executa do teste do validation
     *
     * @return   {Array}    testErrors  Erros do objeto.
     */
    test() {
        let testErrors = []

        if (typeof this.Table === 'undefined') {
            testErrors.push(__('O parâmetro Table não foi informado!'))
        }
        if (typeof this.Table.query === 'undefined') {
            testErrors.push(__('O Table não possui função para pesquisa!'))
        }
        if (typeof this.Table.count === 'undefined') {
            testErrors.push(__('O Table não possui função para contagem!'))
        }

        if (testErrors.length>0) {
            for (i in testErrors) {
                console.log(testErrors[i])
            }
        }
        
        return testErrors
    }

    /**
     * Verifica se o valor é numérico
     *
     * @param   {String}    value       Valor a ser testado.
     * @return  {Boolean}   boolean     Verdadeiro se é número, Falso se não.
     */
    number(value = '') {
        let type = typeof value
        
        return (type === 'number') ? true : false
    }

    /**
     * Verifica se o valor é string
     *
     * @param   {String}    value       Valor a ser testado.
     * @return  {Boolean}   boolean     Verdadeiro se é string, Falso se não.
     */
    string(value = '') {
        let type = typeof value

        return (type === 'string') ? true : false
    }

    /**
     * Verifica se o valor está vazio
     *
     * @param   {String}    value   Valor a ser testado.
     * @return  {Boolean}   boolean     Falso se vazio, Verdadeiro se não
     */
    notEmpty(value='') {
        let vlr = value.toString()
        if (!vlr.length) {
            return false
        }

        return !vlr.length ? false : true
    }

    /**
     * Verifica se o valor está entre dois valores
     *
     * @param   {Array}     between     Matriz com o primeiro e segundo valor.
     * @param   {String}    value       Valor a ser testado.
     * @return  {Boolean}   boolean     Verdadeiro se está entre os valores, Falso se não.
     */
    between(value='', params={}) {
        const between = params.band || []

        return (value < between[0] || value > between[1]) ? false : true
    }

    /**
     * Verifica se o valor é um CPF válid
     *
     * @param   {String}    value   Valor do cpf a ser testado.
     * @return  {Boolean}   boolean     Verdadeiro se é válido, Falso se não.
     */
    cpf(value='') {
        let Soma = 0
        let Resto = 0
        if (value == "00000000000") {
            return false;
        }

        value = value.toString()
         
        for (let i=1; i<=9; i++) {
            Soma = Soma + parseInt(value.substring(i-1, i)) * (11 - i)
        }
        Resto = (Soma * 10) % 11

        if ((Resto == 10) || (Resto == 11)) {
            Resto = 0
        }
        if (Resto !== parseInt(value.substring(9, 10)) ) {
            return false
        }
       
        Soma = 0
        for (let i = 1; i <= 10; i++) {
            Soma = Soma + parseInt(value.substring(i-1, i)) * (12 - i)
        }
        Resto = (Soma * 10) % 11
       
        if ((Resto == 10) || (Resto == 11)) {
            Resto = 0
        }
        if (Resto != parseInt(value.substring(10, 11) ) ) {
            return false
        }

        return true
    }

    /**
     * Verifica se o value é um email válido.
     *
     * @param   {String}    value   valor a ser testado.
     * @paramn  {Boolean}   boolean     Verdadeiro se é válido, Falso se não.
     */
    email(value='') {
        let re = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/

        return re.test(value)
    }

    /**
     * Executa um tipo de validação.
     *
     * @param   {String}    validation   Nome da validação
     * @param   {Mixed}     value        Valor a ser validado
     * @param   {Object}    params       Parâmetros da validação.
     * @return  {Boolean}   boolean      Verdadeiro se passou na validação, Falso se não.
     */
    async validate( validation='', params={} ) {
        let msgError = !!!params.msg ? __('erro na validação ')+validation : params.msg

        return this[validation](params.value, params)
    }

    /** 
     * Retorna a duplicidde de um campo.
     *
     * @param   {String}    field   Nome do campo
     * @param   {String}    table   Nome da tabela
     * @param   {String}    value   Valor a ser pesquisado
     * @param   {Object}    db      Conexão de banco de dados
     * @param   {Boolean}   boolean Status da Operação Verdadeiro se existe, Falso se não.
     */
    async inTable(value = '', params={}) {
        let sql = "SELECT " + params.fieldAssoc + " FROM " + params.tableAssoc + " WHERE " + params.fieldAssoc + " = "+value
        let res = 0

        res = await this.Table.query(sql)
        return (res.length > 0) ? true : false
    }

    /**
     * Verifica a duplicidade de um campo.
     *
     * @param   {String}    field   Nome do campo a ser pesquisado
     * @param   {Object}    params  Parâmetros da pesquisa, como nome da tabela, campo de pesquisa, campo primaryKey e valor de pesquisa.
     * @return  {Boolean}   boolean Falso se não passou no teste, Verdadeiro se passou.
     */
    async unique(value='', params={}) {
        let total       = 0

        params.table    = !!!params.table   ? this.Table.table  : params.table
        params.field    = !!!params.field   ? 'id'  : params.field
        params.fieldPk  = !!!params.fieldPk ? 'id'  : params.fieldPk
        params.valuePk  = !!!params.valuePk ? 0     : params.valuePk

        let typeField   = !!!this.Table.schema[params.field].type ? 'string' : this.Table.schema[params.field].type
        let typeString  = (this.Table.db.typesString.indexOf(typeField.toLowerCase()) > -1) ? true : false
        value           = (typeString === true) ? '"'+value+'"' : value
        
        if (params.table === 'municipios') {
            console.log(typeString+' '+typeField+' '+value)
            console.log(this.Table.validationType)
        }

        params.where = {}
        params.where[params.field] = value
        if (this.Table.validationType !== 'create') {
            params.where[params.fieldPk+' <> '] = params.valuePk
        }

        total = await this.Table.count(params)

        return (total>0) ? false : true
    }
}

module.exports = (Table) => new Validation(Table)