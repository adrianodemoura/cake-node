/**
 * Rota listar
 * 
 * @author      Adriano Moura
 * @package     app.Core.Rotas
 */
'use strict'
/**
 * Retorna a lista paginada de um cadastro.
 */
module.exports = app => {
    /**
     * Retorna uma lista da collections
     * 
     * @access  {Authenticated}
     * @param   {String}    cadastro*   Nome do Cadastro que vai retornar a lista, exemplo: 'Mac.Usuario'
     * @param   {Boolean}   doc         Se existente retorna a documentação da página.
     * @param   {Number}    pagina      Número da página
     * @param   {Number}    limite      Limite de registros por página
     * @param   {String}    campos      Campos da lista, no formato: campo1:1,campo2:1
     * @param   {String}    filtro      Fitros da lista, no formato: alias.campo1 = valor1; alias.campo2 > valor2; alias.campo3 not in valor3. Cada filtro deve estar separado por ';' e os operadores entre espaços.
     * @param   {String}    ordem       Ordem da lista, no formato: campo1:asc,campo2:desc sem espaços.
     * @param   {String}    associacoes Associações do cadastro entre vírgulas.
     * @return  {Object}    retorno     Status da operação. lista: itens da pesquisa, paginacao: dados da paginação
     */
    app.get('/listar', async (req, res) => {
        const retorno   = {}
        const params    = app.settings.params

        try {
            const cadastro = (!!!params.cadastro) ? '' : params.cadastro
            if (!!!cadastro) {
                throw new Error(__('O parâmetro %cadastro% não foi informado!'))
            }

            const Table = await getTable(cadastro)
            if (!!!Table) {
                throw new Error(__('Não foi possível inicializar %'+cadastro+'%'))
            }

            const paramsFind    = {}
            paramsFind.limit    = (!!!params.limite) ? 10 : params.limite
            paramsFind.page     = (!!!params.pagina) ? 1  : params.pagina
            paramsFind.sort     = (!!!params.ordem)  ? {} : params.ordem
            paramsFind.where    = (!!!params.filtro) ? {} : params.filtro
            paramsFind.associations = !!!params.associacoes ? [] : params.associacoes.split(',')
            if (! paramsFind.associations.length ) {
                for (let typeAssociation in Table.associations) {
                    for (const Association in Table.associations[typeAssociation]) {
                        paramsFind.associations.push(Association)
                    }
                }
            }

            const lista = await Table.find(paramsFind)
            if (!lista) {
                throw new Error(Table.error)
            }

            retorno.status      = true
            retorno.msg         = __('Lista de %'+cadastro+'% recuperada com sucesso.')
            retorno.alertas     = Table.warnings
            retorno.paginacao   = lista.paging
            retorno.lista       = lista.itens
        } catch (error) {
            retorno.status  = false
            retorno.error   = error.message
            retorno.trace   = getTrace(error)
            gravaLog(error.message, 'error')
        }
        
        if (params.doc) {
            retorno.doc = await requireLib('doc')(CORE + '/rotas/listar.js')
        }
        res.removeHeader('x-powered-by')
        res.send(retorno)
    })
}