//dev enviroment
var env           = process.env.NODE_ENV || 'production';
var express       = require('express'); 
var middlewares   = require('./middlewares/admin.js');
// var cons       = require('consolidate');
var logger        = require('../lib/logger/logger.js');
var swig          = require('swig');
//routes
var router        = require('./website/router.js');
var RESTnotas     = require('../lib/notas');
//creando el objeto
var ExpressServer = function (config){
	//si vacio, es un objeto vacio
	config = config || {};
	//creo instancia
	this.server = express();
	//middlewares
	for (var middleware in middlewares){
		this.server.use(middlewares[middleware]);
		// logger.info("middleware activado:",middleware);
	}
	/**
	*	template engine - Swig
	*/
	//define engine
	this.server.engine('html', swig.renderFile);
	//como template de vista use html y asi asocia a swig
	this.server.set('view engine', 'html');
	//donde estan los html?
	this.server.set('views', __dirname + '/website/views/templates');
	/**
	*	Dev enviroment configuration
	*/
	if (env == 'development'){
		
		this.server.set('view cache', false);
		// swig.setDefaults({cache: false, varControls:['[[',']]']});
		swig.setDefaults({cache: false});
	}
	logger.info('Environment :', env.toUpperCase());
	/**
	*	routes
	*/
	//Model REST 
	this.server.use(RESTnotas);

	for (var controller in router){
		logger.info("controller: ",controller);
		//identificar los prototipos 
		for (var funcionalidad in router[controller].prototype){
			//si se sigue este formato
			//todas las funciones deben escribirse de esta manera
			//es decir que lo echo por bouritica debe ser modificado
			var method          = funcionalidad.split('_')[0];
			var entorno         = funcionalidad.split('_')[1];
			var data            = funcionalidad.split('_')[2];
			data = (method == 'get' && data !== undefined) ? ':data' : '';
			var url = '/' + controller + '/' + entorno + '/' + data;
			// logger.info("method    : ",method);
			logger.info("entorno   : ",entorno);
			this.router(controller, funcionalidad, method, url);
		}
	}
	// //puedo crear rutas especificas para articulos
	// //view
	// this.server.get('/article/save', function (req, res, next){
	// 	// debugger;
	// 	res.render('article_save', {nombre:"Andres"});
	// });
	// //view
}; 

ExpressServer.prototype.router = function (controller, funcionalidad, method, url){
	logger.info("url   : ",url);
	this.server[method](url, function (req, res, next){
		var conf = {
			'funcionalidad': funcionalidad,
			'req'          : req,
			'res'          : res,
			'next'         : next
		};
		// debugger;
		var Controller = new router[controller](conf);
		Controller.response();
	});
}

module.exports = ExpressServer;