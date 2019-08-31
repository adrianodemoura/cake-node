/**
 * Table Auditoria
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.schema
 */
'use strict'
/**
 * Mantém o registro de auditorias.
 */
const Schema = require (CORE + '/orm/schema.js')
class Auditoria extends Schema {
    /**
     * Método de inicialização da Auditoria
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
            width: 100,
            not_null: true,
            index: true,
            default: '',
            comment: 'caminho a ser consumido'
        }
        this.schema.tags = {
            title: __('Tags'),
            type: 'string',
            width: 200,
            not_null: true,
            index: true
        }
        this.schema.descricao = {
            title: __('Descrição'),
            type: 'string',
            width: 200,
            not_null: true
        }
        this.schema.ip = {
            title: __('ip'),
            type: 'string',
            not_null: true,
            width: 15,
            index: true
        }
        this.schema.criado = {
            title: __('Dt. Criação'),
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP'
        }
        this.schema.usuario_id = {
            title: __('idUsuário'),
            type: 'number'
        }
    }
}

module.exports = new Auditoria()
