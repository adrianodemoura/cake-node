/**
 * Schema Papel
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.schema
 */
'use strict'
/**
 * Mantém o registro de papeis.
 */
const Schema = require (CORE + '/orm/schema.js')
class Papel extends Schema {
    /**
     * Método de inicialização
     */
    constructor () {
        super()

        // schema
        this.schema.usuario_id = {
            title: __('id do Usuário'),
            type: 'number',
            width: 11,
            index: true,
            comment: 'id da unidade'
        }
        this.schema.perfil_id = {
            title: __('id do Perfil'),
            type: 'number',
            width: 11,
            index: true,
            comment: 'id do perfil'
        }
        this.schema.unidade_id = {
            title: __('id da Unidade'),
            type: 'number',
            width: 11,
            index: true,
            comment: 'id da unidade'
        }
        this.schema.aplicacao_id = {
            title: __('id da Aplicação'),
            type: 'number',
            width: 11,
            index: true,
            comment: 'id da aplicação'
        }
    }

}

module.exports = new Papel()
