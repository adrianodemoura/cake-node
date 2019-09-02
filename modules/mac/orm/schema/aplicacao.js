/**
 * Schema Aplicacao
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.schema
 */
'use strict'
/**
 * Mantém o registro de aplicacao.
 */
const Schema = require (CORE + '/orm/schema.js')
class Aplicacao extends Schema {
    /**
     * Método de inicialização
     * 
     */
    constructor () {
        super()

        // schema
        this.schema.id = {
            title: __('Código'),
            type: 'number',
            width: 11,
            pk: true,
            index: true,
            comment: 'chave primária'
        }
        this.schema.nome = {
            title: __('Aplicação'),
            type: 'string',
            width: 60,
            not_null: true,
            index: true,
            default: '',
            comment: 'nome da aplicação'
        }
    }

}

module.exports = new Aplicacao()
