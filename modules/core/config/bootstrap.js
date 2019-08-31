/**
 * Bootstrap
 * 
 * variáveis globais do core
 */
'use strict'
/**
 * Diretório da aplicação
 * 
 * @public
 */
global.ROOT = process.cwd()

/**
 * Diretório Log
 * 
 * @public
 */
global.LOG = ROOT + '/tmp/logs'

/**
 * Diretório Core
 * 
 * @public
 */
global.CORE = ROOT + '/modules/core'

/**
 * Diretório Plugins
 * 
 * @public
 */
global.MODULES = ROOT + '/modules'

/**
 * Variávei para guardar o idioma
 *
 * @public
 */
global.LOCALES = {}