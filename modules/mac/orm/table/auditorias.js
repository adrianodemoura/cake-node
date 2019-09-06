/**
 * Table Auditoria
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.table
 */
'use strict'
/**
 * Mantém a tabela de auditorias
 */
const Table = require (CORE + '/orm/table.js')
class Auditorias extends Table {
    /**
     * Inicializa a Table Auditorias
     */
    init() {
        this.table      = 'auditorias'
        this.schemaName = 'auditoria'

        // associações
        this.associations = {
            hasOne: {
                Usuarios: {
                    foreignKeyLeft: 'usuario_id',
                    tableRight: 'usuarios',
                    foreignKeyRight: 'id'
                }
            }
        }

        // validações
        this.validations = {
            'rota': {
                notEmpty: {when: ['create'], msg: __('O Campo %rota% é obrigatório !')}
            },
            'descricao': {
               notEmpty: {when: ['create'], msg: __('O Campo %descrição% é obrigatório !')}
            },
            'ip': {
                notEmpty: {when: ['create'], msg: __('O Campo %ip% é obrigatório !')}
            },
            'usuario_id': {
                inTable: {tableAssoc: 'usuarios', fieldAssoc: 'id', msg: __('Usuário inválido!')}
            }
        }
    }

    /**
     * Salva o registro da auditoria
     * Os parâmetros como descrição e tags é repassado pelo usuário, outros parâmetros como
     * ip, rota e id do usuário, são atualizados automaticamente pelo usuário.
     *
     * @param   {String}    descricao   Descriação da auditoria
     * @param   {String}    tags        Tags da auditoria, colocar entere espeaços.
     * @return  {Boolean}   boolean     Verdadeiro em caso de sucesso, Falso se ocorreu erro.
     */
    async auditar(descricao='', tags='') {
        let data = {}

        data['AudiIp']          = MEU_IP
        data['AudiRota']        = ROTA
        data['AudiUsuarioId']   = USUARIO.id || 0
        data['AudiDescricao']   = descricao
        data['AudiTags']        = tags

        if (! await this.save(data)) {
            return false
        }

        return true
    }
}

module.exports = new Auditorias()
