// src/config/env.js
// Provee configuración global accesible como `window.Config`.
(function(){
	const config = {
		API_URL: "http://localhost:3000",
		APP_NAME: "Mi E-commerce",
		ITEMS_PER_PAGE: 10,
		DATA_URL: '/data/stock.json'
	};

	// Opciones de desarrollo y mocks
	// Por defecto en false para preparación a producción. Cambiar a true
	// solo en entornos de desarrollo/local para probar autenticación con mocks.
	config.USE_MOCK_AUTH = false; // set to true for local/dev testing
	config.MOCK_AUTH_URL = '/mocks/login.json';

	// Exponer en entorno global para scripts no-modulares
	if (typeof window !== 'undefined') window.Config = config;

	// También exportar para entornos modulares (build/test)
	try { if (typeof exports !== 'undefined') exports.Config = config; } catch(e) {}

})();
