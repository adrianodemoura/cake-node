// importações do core
require('./modules/core/config/bootstrap') // variáveis globais do core
require('./modules/core/lib/global') // funções globais do core

// importações
const express   = require('express')
const bodyParser= require('body-parser')
const multer    = require('multer')
const ambiente  = require('./config/ambiente')
const config    = require('./config/config_'+ambiente.ambiente)
const rotas     = require('./config/routes')
const upload    = multer() // necessário para envio body raw

// bootstrap da app
require('./config/bootstrap')

// iniciando app
const app = express();

// configurações do node
process.env['NODE_ENV'] = ambiente.ambiente

// configurando o idioma do app e do core, cada plugin deve executar o mesmo no seu bootstrap.
setLocale('core')

// incrementando o app
app.use(upload.array()) // necessário para envio body form-data
app.use(bodyParser.json()) // necessário para o envio body raw
app.use(bodyParser.urlencoded({ extended: false })) // necessário para envio body x-wwww-form-urlencoded

// favicon
app.get('/favicon.ico', (req, res) => {
    res.removeHeader('X-Powered-By')
    res.sendFile(process.cwd() + '/cakenode.ico')
})

// vigiando todas as requisições
app.use( async (req, res, next) => {
    // start do tempo de execução (em segundos)
    global.START_TIME = Math.floor(Date.now() / 1000)

    // variáveis locais
    let arrUrl      = req.originalUrl.split('/')
    let rota        = '/'
    rota            = (!!!arrUrl[1]) ? '/'  : '/'+arrUrl[1]
    rota            = (!!!arrUrl[2]) ? rota : '/'+arrUrl[1]+'/'+arrUrl[2]
    if ( rota.indexOf('?') > -1 ) {
        rota = rota.substr(0,rota.indexOf('?')-1)
    }

    // aproveitando a xepa pra criar variáveis globais
    const meuIp     = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    global.MEU_IP   = meuIp.replace('::ffff:','')
    global.ROTA     = req.path

    // executando o redirecionamentos de rota
    if (rotas.redirect[rota]) {
        rota = rotas.redirect[rota]
        res.removeHeader('X-Powered-By')
        return res.redirect(rota)
    }

    // incluindo no app os parâmetros do cliente (headers, body e request)
    let parametros = await require(CORE + '/lib/request')(req)
    app.set('params', parametros)

    // se não está na rota de autenticação, executa a autenticação pelo token.
    if (rotas.no_authentication.indexOf(rota)<0) {
        retornoAutenticacao = await require(MODULES + '/mac/lib/autenticacao')(app.settings.params)
        if (!retornoAutenticacao.status) {
            return res.status(403).send({status: false, msg: retornoAutenticacao.msg})
        }
    }

    try {
        require('./modules/core/rotas'+rota)(app) // core
    } catch (error) { // modules diferent core
        try {
            arrArq  = rota.split('/')
            require('./modules/' + arrArq[1] + '/rotas/' + arrArq[2])(app) // plugin
        } catch (error) {
            gravaLog(error.message, 'error_route')
            res.status(404).send({status: false, msg: __("Não foi possível consumir a rota %"+rota+"%")})
        }
    }
   
    next()
})

// ouvindo
app.listen ( config.server.port, 
    err => console.info(err 
        ? `Erro na porta ${config.server.port}` 
        : `App rodando sobre a porta ${config.server.port}`+ ' - ambiente: '+process.env.NODE_ENV)
);