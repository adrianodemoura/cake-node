/**
 * Table Perfis
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.table
 */
'use strict'
/**
 * Mantém o cadastro perfis.
 */
const Table = require (CORE + '/orm/table.js')
class Perfis extends Table {
    /**
     * Inicialização
     */
    init() {
        this.table      = 'perfis'
        this.schemaName = 'perfil'

        this.associations = {
            Usuarios: {
                hasMany: {
                    table:                      'mac.usuarios', 
                    tableBridge:                'associacoes', 
                    foreignKeyBridgeLeft:       'perfil_id', 
                    foreignKeyBridgeRight:      'usuario_id',
                    fields:                     ['id', 'nome', 'ativo']
                }
            }
        }

        this.validations = {
            'nome': {
                notEmpty: {when: ['create','update'], msg: __('O Campo nome é obrigatório !')},
                unique: {msg: __("O nome '{nome}' já foi cadastrado !")}
            }
        }

    }
}

module.exports = new Perfis()
