/**
 * Schema Rota
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.schema
 */
'use strict'
/**
 * Mantém o registro de rota.
 */
const Schema = require (CORE + '/orm/schema.js')
class Rota extends Schema {
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
        this.schema.rota = {
            title: __('Rota'),
            type: 'string',
            width: 60,
            not_null: true,
            index: true,
            default: '',
            comment: 'caminho da rota'
        }
        this.schema.aplicacao_id = {
            title: __('Id da Aplicação'),
            type: 'number',
            not_null: true,
            default: 0,
            comment: 'aplicação da rota'
        }
    }

}

module.exports = new Rota()
