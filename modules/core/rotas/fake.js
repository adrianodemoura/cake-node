/**
 * Rota fake
 * 
 * @author      Adriano Moura
 * @package     app.Rotas
 */
'use strict'
/**
 * Executa o fake em um determinado cadastro. Só funciona no modo DEBUG.
 */
module.exports = app => {
    /**
     * Rota para executa o fake.
     * 
     * @access  {Authenticate}
     * @param   {String}    cadastro*       Nome do cadastro a ser populado, pode ser no formato Plugin.Table, a table é no plural.
     * @param   {Integer}   total*          Total de registros a incluir
     * @param   {Boolean}   doc             Se existente retorna a documentação da página.
     * @param   {Integer}   inc             Incremento inicial da faixa.
     * @param   {Boolean}   pk              Se verdadeiro inclui a chave primaryKey em cada registro fake.
     * @param   {Boolean}   force-create    Se verdadeiro força a inclusão para todas os registros, o padrão é true.
     * @param   {Boolean}   clean           Se verdadeiro exclui todos os registros do cadastro, o padrão é false.
     * @param   {Boolean}   assoc           Se verdadeiro inclui registros associados também. Necessário que o schema do table esteja com as associações configuradas.
     * @param   {Array}     fields          Matriz contendo os nomes do campos a serem fakeados, no formato [campo1,campo2].
     * @return  {Object}    retorno         Status da Operação
     */
    app.get('/fake', async (req, res) => {
        let retorno = {}

        try {
            if (!configure('debug')) {
                throw new Error(__('Este teste só pode ser realizado no modo DEBUG!'))
            }

            // limpando o cache
            const Cache     = require(CORE + '/lib/cache.js')
            Cache.clean()

            // parametros
            const params = app.settings.params
            const noFake = ['sistema.municipio', 'sistema.auditoria']

            const cadastro = (!!!params.cadastro) ? '' : params.cadastro
            if (!cadastro) {
                throw new Error(__('O parâmetro %cadastro% não foi informado!'))
            }
            if (noFake.indexOf(cadastro) >-1 ) {
                throw new Error(__('O cadastro %'+cadastro+'% não pode ser populado!'))
            }
            const totalFake = (!!!params.total) ? 0 : params.total
            if (!totalFake) {
                throw new Error(__('%total% inválido!'))
            }
            const Table     = await getTable(cadastro)
            if (!!!Table) {
                throw new Error(__('Não foi possível inicializar %'+cadastro+'%'))
            }
            const totalAntes = await Table.count()

            if (Table.table === 'usuarios') {
                Table.validations.cep = {between: {band:[30000000,40000000]}}
                Table.validations.cpf = {between: {band:[100000000,99999999999]}}
                Table.validations.celular = {between: {band:[31988011000,38988019009]}}
            }

            let inc             = (!!!params.inc)               ? 1     : params.inc
            let pk              = (!!!params.pk)                ? false : params.pk
            let force_create    = (!!!params.force_create)      ? true  : params.force_create
            const clean         = (!!!params.clean)             ? false : params.clean
            const assoc         = (!!!params.associacoes)       ? true  : params.associacoes
            const fields        = (!!!params.fields)            ? []    : params.fields

            Table.setBehavior('fake')

            if (clean) {
                await Table.truncate()
                inc = 1
                pk  = true
                force_create = true
            } else if (force_create) {
                inc = await Table.count()
                inc++
            }
            if (force_create) {
                Table.forceCreate = true
            }

            let dataFake = await Table.fake(totalFake, inc, pk, assoc, fields)
            if (! dataFake ) {
                throw new Error(Table.error)
            }
            if (! await Table.saveAll(dataFake) ) {
                throw new Error(Table.error)
            }

            retorno.status          = true
            retorno.warnings        = Table.validationWarnings
            retorno.totalAntes      = totalAntes
            retorno.totalUsuarios   = await Table.count()
        } catch (error) {
            retorno                 = {}
            retorno.status          = false
            retorno.msg             = error.message
            retorno.trace           = getTrace(error)
        }

        if (app.settings.params.doc) {
            retorno.doc             = await requireLib('doc')(CORE + '/rotas/fake.js')
        }
        retorno.time_spent          = ((Math.floor(Date.now() / 1000)) - START_TIME) + ' (seconds)'
        res.send(retorno)
    })
}