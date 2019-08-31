/**
 * Schema Unidade
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.schema
 */
'use strict'
/**
 * Mantém o registro de perfis.
 */
const Schema = require (CORE + '/orm/schema.js')
class Unidade extends Schema {
    /**
     * Método de inicialização
     */
    constructor () {
        super()

        // schema
        this.schema.id = {
            title: __('Código'),
            type: 'number',
            width: 11,
            pk: true,
            comment: 'chave primária'
        }
        this.schema.nome = {
            title: __('Perfil'),
            type: 'string',
            width: 60,
            not_null: true,
            index: true,
            default: '',
            comment: 'nome do perfil'
        }

        this.schema.cpf_cnpj = {
            title: __('Cpf/Cnpj'),
            type: 'string',
            width: 14,
            not_null: true,
            index: true,
            default: '0',
            comment: 'cpf ou cnpj'
        }
    }

}

module.exports = new Unidade()
