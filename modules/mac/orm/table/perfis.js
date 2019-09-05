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
            Aplicacao: {
                hasOne: { table: 'mac.aplicacoes', foreignKeyLeft: 'aplicacao_id'}
            },
            Usuarios: {
                hasMany: { 
                    table: 'mac.usuarios', 
                    tableBridge: 'vinculacoes',
                    foreignKeyBridgeLeft: 'perfil_id', 
                    foreignKeyBridgeRight: 'usuario_id'
                }
            },
            Rotas: {
                hasMany: { 
                    table: 'mac.rotas', 
                    tableBridge: 'perfis_rotas',
                    foreignKeyBridgeLeft: 'perfil_id', 
                    foreignKeyBridgeRight: 'rota_id'
                }
            }
        }

        this.validations = {
            'nome': {
                notEmpty: {when: ['create'], msg: __('O Campo nome é obrigatório !')},
                unique: {msg: __("O nome '{nome}' já foi cadastrado !")}
            }
        }

    }
}

module.exports = new Perfis()
