/**
 * Schema Papel
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.schema
 */
'use strict'
/**
 * Mantém o registro de papel.
 */
const Schema = require (CORE + '/orm/schema.js')
class Papel extends Schema {
    /**
     * Método de inicialização
     */
    constructor () {
        super()

        this.schema.usuario_id = {
            title: __('id do Usuário'),
            type: 'number',
            comment: 'ligação com usuário'
        }
        this.schema.perfil_id = {
            title: __('id do Perfil'),
            type: 'number',
            comment: 'ligação com perfis'
        }
        this.schema.unidade_id = {
            title: __('id do Unidade'),
            type: 'number',
            comment: 'ligação com a unidade'
        }
    }

}

module.exports = new Papel()
