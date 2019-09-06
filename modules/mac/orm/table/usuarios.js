/**
 * Table Usuarios
 * 
 * @author      Adriano Moura
 * @package     app.mac.orm.table
 */
'use strict'
/**
 * Mantém o cadastro de usuários.
 */
const Table = require (CORE+'/orm/table.js')
class Usuarios extends Table {
    /**
     * Inicialização do usuário
     */
    init () {
        this.table          = 'usuarios'
        this.schemaName     = 'usuario'

        // associações
        this.associations = {
            Municipio: {
                hasOne: {
                    foreignKeyLeft: 'municipio_id',
                    tableRight: 'municipios',
                    foreignKeyRight: 'id'
                }
            },
            Perfis: {
                hasMany: {
                    foreignKeyLeft: 'id',
                    tableBridge: 'papeis',
                    foreignKeyBridgeLeft: 'usuario_id', 
                    foreignKeyBridgeRight: 'perfil_id',
                    tableRight: 'perfis',
                    foreignKeyRight: 'id',

                }
            },
            Unidades: {
                hasMany: {
                    foreignKeyLeft: 'id',
                    tableBridge: 'papeis',
                    foreignKeyBridgeLeft: 'usuario_id', 
                    foreignKeyBridgeRight: 'unidade_id',
                    tableRight: 'perfis',
                    foreignKeyRight: 'id'
                }
            },
            Aplicacoes: {
                hasMany: { 
                    foreignKeyLeft: 'id',
                    tableBridge: 'papeis',
                    foreignKeyBridgeLeft: 'usuario_id', 
                    foreignKeyBridgeRight: 'aplicacao_id',
                    tableRight: 'aplicacoes',
                    foreignKeyRight: 'id'
                }
            }
        }

        // validações
        this.validations = {
            'id': {
                number: {msg: __('O %ID% não é um tipo númerico!')}
            },
            'nome': {
                string: {msg: __('O %Nome% não é um tipo string!')},
                notEmpty: {when: ['create'], 'msg': __('O campo %nome% é obrigatório!')}
            },
            'senha': {
                notEmpty: {when: ['create'], 'msg': __('O campo %senha% é obrigatório!')}
            },
            'token': {
                notEmpty: {when: ['create'], 'msg': __('O campo %token% é obrigatório!')}
            },
            'email': {
                notEmpty: {when: ['create'], 'msg': __('O campo %e-mail% é obrigatório!')},
                unique: {msg: __("O %e-mail% %'{email}'% já foi cadastrado!")},
                email: {msg: __("O e-mail {email} não é inválido!")}
            },
            'municipio_id': {
                inTable: {tableAssoc: 'municipios', fieldAssoc: 'id', msg: __('Município inválido !')}
            },
            'ativo': {
                between: {band: [0,1], msg: __('O Campo %ativo% deve ser 0 ou 1')}
            },
            'salario': {
                between: {band: [998.07,10875.34], msg: __('O Salário está fora da faixa permitida!')}
            }
        }
    }

    /**
     * Método antes de excluir um registro.
     * - Impede a exclusão do usuário administrador.
     *
     * @param   {Integer}   id          Id a ser excluído
     * @pram    {Boolean}   boolean     Verdadeiro se foi executado, Falso se não.
     */
    async beforeDelete(id=0) {
        if (id === 1) {
            this.error = __('O Usuário administrador não pode ser excluído !')
            return false
        }

        return true
    }

    /**
     * Método antes de validar
     * - Caso exista, encripta a senha.
     *
     * @param   {Object}    data        Dados do registro.
     * @return  {Boolean}   boolean     Verdadeiro se deve continuar, Falso se não.
     */
    async beforeValidate() {
        if (this.data['UsuaSenha']) {
            this.data['UsuaSenha'] = geraSenha(this.data['UsuaSenha'])
        }
        if (this.validationType === 'create') {
            this.data['UsuaToken'] = geraToken()
        }
        if (this.data['Perfis'] || this.data['Unidades']) {
            const totPerfis     = (this.data['Perfis'].split(',').length)
            const totUnidades   = (this.data['Unidades'].split(',').length)
            if (totPerfis !== totUnidades) {
                throw new Error(__('O Total de Perfis está diferente do total de Unidades!'))
            }
            this.data['Aplicacoes'] = "["+(""+configure('codigo_sistema')+",").repeat(totPerfis).slice(0,-1)+"]"
        }

        return true
    }

    /**
     * Retorna as rotas do usuários
     *
     * @param   {Integer}   idUsuario   Id do usuário.
     * @param   {Integer}   idPerfil    Código do papel, no formato IdUsuario,IdPerfil,IdUnidade.
     * @return  {Object}    rotas       Lista de rotas do usuário pelo seu papel
     */
    async getMinhasRotas(idUsuario=0, codigoPapel=0) {
        let rotas = {}

        return rotas
    }

}

module.exports = new Usuarios()
