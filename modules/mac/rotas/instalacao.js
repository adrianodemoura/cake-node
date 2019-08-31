/**
 * Rota mac/instalacao
 *
 * @author      Adriano Moura
 * @package     app.mac.rotas
 */
'use strict'
/**
 * Executa a instalação inicial validando o 'email' e 'senha' passado como parâmetros e 
 * devolve ao cliente um novo token para consumir as demais rotas.
 */
const fs = require('fs')
module.exports = app => {
    /**
     * Executa a instalação inicial da aplicação.
     * 
     * @access  {Public}
     * @param   {String}    email*      e-mail do novo usuário administrador.
     * @param   {String}    senha*      senha do novo usuário administrador.
     * @param   {Boolean}   doc         Se existente retorna a documentação da página.
     * @param   {String}    nome        Nome do usuário administrador.
     * @return  {Object}    retorno     Status da operação.
     */
    app.get('/mac/instalacao', async (req, res) =>  {
        const retorno   = {}
        const Cache     = require(CORE + '/lib/cache.js')
        const ambiente  = require(ROOT + '/config/ambiente')
        const config    = require(ROOT + '/config/config')
        const configEnv = require(ROOT + '/config/config_' + ambiente.ambiente)
        const driver    = !!!configEnv.data_sources['default'].driver ? 'mysql' : configEnv.data_sources['default'].driver.toLowerCase()
        const configDb  = configEnv.data_sources['default']
        const conexao   = await require(CORE + '/orm/database/driver/'+driver)(configDb)

        // limpando o cache
        Cache.clean()

        if (conexao.error.length) {
            res.send({status: false, msg: 'Erro ao conectar com o banco de dados!'})
        }

        try {
            const adminNome     = (!!app.settings.params.nome)  ? app.settings.params.nome  : 'Administrador '+config.sistema
            const adminEmail    = (!!app.settings.params.email) ? app.settings.params.email : ''
            const adminSenha    = (!!app.settings.params.senha) ? app.settings.params.senha : ''
            const dropAll       = (!!app.settings.params.drop)  ? app.settings.params.drop  : false
            let csvMunicipio  = (!!app.settings.params.csv)   ? app.settings.params.csv   : 'min'
            if (['full', 'min'].indexOf(csvMunicipio) === -1)
            {
                throw new Error('01 - '+__("O Parâmetro CSV deve ser 'full' ou 'min'!"))
            }

            if (!!!configEnv.data_sources) {
                throw new Error('01 - '+__('Nenhuma conexão com o banco de dados foi detectada, a instalação não pode continuar!'))
            }

            if (!!!Object.keys(configEnv.data_sources).length) {
                throw new Error('02 - '+__('Ao menus uma conexão é necessária para continuar a instalação!'))
            }

            if (!!!adminEmail || !!!adminSenha) {
                throw new Error('03 - '+__('Os parâmetros %email% e %senha% são obrigatórios para a instalação!'))
            }

            // excluindo tudo antes
            if (dropAll && configEnv.debug) {
                if (! await conexao.query("DROP TABLE IF EXISTS associacoes") ) {
                    throw new Error('05 - '+__('Erro ao tentar excluira a tablea %associacoes%!'))
                }
                if (! await conexao.query("DROP TABLE IF EXISTS auditorias") ) {
                    throw new Error('06 - '+__('Erro ao tentar excluira a tablea %auditorias%!'))
                }
                if (! await conexao.query("DROP TABLE IF EXISTS perfis") ) {
                    throw new Error('07 - '+__('Erro ao tentar excluira a tablea %perfis%!'))
                }
                if (! await conexao.query("DROP TABLE IF EXISTS unidades") ) {
                    throw new Error('08 - '+__('Erro ao tentar excluira a tablea %unidades%!'))
                }
                if (! await conexao.query("DROP TABLE IF EXISTS usuarios") ) {
                    throw new Error('09 - '+__('Erro ao tentar excluira a tablea %usuarios%!'))
                }
                if (! await conexao.query("DROP TABLE IF EXISTS municipios") ) {
                    throw new Error('10 - '+__('Erro ao tentar excluira a tablea %municipios%!'))
                }
            }

            // verificando se existem mais usuários
            const listTables = await conexao.listTables()
            if (listTables.length > 1) {
                throw new Error('11 - '+__('A instalação inicial já foi inicializada!'))
            }

            // instalando os perfis
            const Perfis = await getTable('mac.perfis')
            if (! await Perfis.createTable({delete: true})) {
                throw new Error('12 - '+Perfis.error)
            }
            let dataPerfis = {
                0: {PerfId: 1, PerfNome: 'ADMINISTRADOR'},
                1: {PerfId: 2, PerfNome: 'SUPERVISOR'},
                2: {PerfId: 3, PerfNome: 'USUÁRIO'},
                3: {PerfId: 4, PerfNome: 'VISITANTE'}
            }
            Perfis.forceCreate = true
            if (! await Perfis.saveAll(dataPerfis)) {
                throw new Error('13 - '+Perfis.error)
            }

            // instalando as unidades
            const Unidades = await getTable('mac.unidades')
            if (! await Unidades.createTable({delete: true})) {
                throw new Error('14 - '+Unidades.error)
            }
            let dataUnidades = {
                0: {UnidId: 10, UnidCpfCnpj: 10, UnidNome: 'UNIDADE GERAL'},
                1: {UnidId: 20, UnidCpfCnpj: 20, UnidNome: 'UNIDADE DA DIREITA'},
                2: {UnidId: 30, UnidCpfCnpj: 30, UnidNome: 'UNIDADE DA ESQUERDA'},
                3: {UnidId: 40, UnidCpfCnpj: 40, UnidNome: 'UNIDADE CENTRAL'}
            }
            Unidades.forceCreate = true
            if (! await Unidades.saveAll(dataUnidades)) {
                throw new Error('15 - '+Unidades.error)
            }

            // instalando os municípios
            const Municipios = await getTable('mac.municipios')
            Municipios.forceCreate = true
            if (! await Municipios.createTable({delete: true})) {
                throw new Error('16 - '+Municipios.error)
            }
            // importando municipios
            const linhasMunicipios  = fs.readFileSync(MODULES + '/mac/config/schema/municipios_'+csvMunicipio+'.csv', 'utf8').toString().split('\n')
            const arrCampos         = linhasMunicipios[0].replace("\r","").split(';')
            let csvLoop             = 0
            let csvTotal            = linhasMunicipios.length
            let dataMunicipios      = []
            for (let i=1; i<linhasMunicipios.length; i++) {
                let linha = linhasMunicipios[i].trim()
                if (linha.length>0) {
                    let arrLinha = linhasMunicipios[i].split(';')

                    dataMunicipios[csvLoop] = {}
                    dataMunicipios[csvLoop]['MuniId']           = arrLinha[0]
                    dataMunicipios[csvLoop]['MuniNome']         = arrLinha[1].trim()
                    dataMunicipios[csvLoop]['MuniUf']           = arrLinha[2].trim()
                    dataMunicipios[csvLoop]['MuniCodiEstd']    = arrLinha[3]
                    dataMunicipios[csvLoop]['MuniDescEstd']    = arrLinha[4].trim()
                }

                csvLoop++
                if (csvLoop >= 1000 || i >= (csvTotal-1)) {
                    if (! await Municipios.saveAll(dataMunicipios)) {
                        throw new Error('17 - '+Municipios.error)
                    }
                    csvLoop         = 0
                    dataMunicipios  = []
                }
            }

            // instalando usuarios
            const Usuarios = await getTable('mac.usuarios')
            if (! await Usuarios.createTable({delete: true})) {
                throw new Error('18 - '+Usuarios.error)
            }
            let dataUsuarios = {
                0: {
                    UsuaId: 1, UsuaNome: adminNome, UsuaEmail: adminEmail, UsuaSenha: adminSenha, UsuaSalario: 10000.19,
                    Perfis: '[1,1,1]', 
                    Unidades: '[10,20,30]'
                }
            }
            Usuarios.forceCreate = true
            if (! await Usuarios.saveAll(dataUsuarios)) {
                throw new Error('19 - '+Usuarios.error)
            }


            Usuarios.schema.token.hidden = false
            Usuarios.db.mask = false
            const dataUsuario = await Usuarios.find({'type': 'first', 'where':{'Usua.id':1}})
            if (!dataUsuario) {
                throw new Error('20 - '+__('Erro ao tentar recuperar dados do usuário!'))
            }

            // instalando a auditoria
            const Auditorias = await getTable('mac.auditorias')
            if (! await Auditorias.createTable({delete:true})) {
                throw new Error ('21 - '+Auditorias.error)
            }
            global.USUARIO = {id: 1}
            if (! await Auditorias.auditar('Instalação da API realizada com sucesso.', 'instalacao')) {
                throw new Error ('22 - '+Auditorias.error)
            }

            // criando o config geral
            config.salt         = geraToken()
            const fileSystem    = require('fs')
            let configText      = ""
            configText          += "/**\n"
            configText          += " * Configurações gerais da API\n"
            configText          += " *\n"
            configText          += " * @author  "+adminNome+"\n"
            configText          += " * @date    "+maskBr(new Date().toLocaleString())+"\n"
            configText          += " */\n"
            configText          += "'use strict'\n"
            configText          += "/**\n"
            configText          += " * Mantém as configurações da API\n"
            configText          += " */\n"
            configText          += "module.exports = "+JSON.stringify(config, null, 2)
            fileSystem.writeFile('./config/config.js', configText, function(err) {
                if (err) {
                    throw new Error('23 - '+err)
                }
            })

            const fileSqlInstall = './modules/mac/config/schema/install_'+Auditorias.driver+'.sql'
            if (fileSystem.existsSync(fileSqlInstall)) {
                if (! await Auditorias.db.query('DROP FUNCTION IF EXISTS MASK;')) {
                    throw new Error('24 - '+__('Não foi possível excluir a função MASK!'))
                }
                let textoSql = fileSystem.readFileSync(fileSqlInstall, 'utf8').toString()
                //console.log(textoSql)
                if (! await Auditorias.db.query(textoSql)) {
                    throw new Error('25 - '+__('Não foi possível instalar o install de '+Auditorias.driver))
                }
            }

            // retorno
            retorno.status  = true
            retorno.msg     = __('Instalação executada com sucesso, copie seu token para consumir as demais rotas.')
            retorno.token   = dataUsuario.UsuaToken
            retorno.driver  = Auditorias.driver

            gravaLog(__('Instalação inicial executada com sucesso!'), 'installation')
            console.log(__('Instalação inicial executada com sucesso!'))
        } catch (error) {
            console.log(error.message)
            gravaLog(error.message, 'errors_installation')
            retorno.status  = false
            retorno.error   = error.message
            retorno.trace   = getTrace(error)
        }

        if (app.settings.params.doc) {
            retorno.doc     = await requireLib('doc')(MODULES + '/mac/rotas/instalacao.js')
        }
        res.send(retorno)
    })

}