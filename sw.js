// imports
importScripts('js/sw-utils.js');


const STATIC_CACHE    = 'static-v2';
const DYNAMIC_CACHE   = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

// Lo que necesita si o si la aplicación
// menos frameworks tipo bootstrap etc. (Cosas que nohemos hecho nosotros).
const APP_SHELL = [
    // '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'  
];


// Cosas que no van a cambiar nunca
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];


// Después de las constantes haremos la instalación
self.addEventListener('install', e => {


    const cacheStatic = caches.open( STATIC_CACHE ).then(cache => 
        cache.addAll( APP_SHELL ));

    const cacheInmutable = caches.open( INMUTABLE_CACHE ).then(cache => 
        cache.addAll( APP_SHELL_INMUTABLE ));



    e.waitUntil( Promise.all([ cacheStatic, cacheInmutable ])  )
});

/*
Ahora hacemos el proceso para que cada vez que se cambie el SW
se borren los cahes anteriores que ya no sirven
Para eso utilizamos el 'activate'
*/

self.addEventListener('activate', e => {

	/*
	keys son los nombres de las caches: ['static-v1', 'dynamic-v1', 'inmutable-v1']

	Recordar que tenemos definidas unas variables:

	const STATIC_CACHE    = 'static-v1';
	const DYNAMIC_CACHE   = 'dynamic-v1';
	const INMUTABLE_CACHE = 'inmutable-v1';

	que se utilizan en los if de abajo.
	*/

    const respuesta = caches.keys().then( keys => {

        keys.forEach( key => {

            if (  key !== STATIC_CACHE && key.includes('static') ) {
                return caches.delete(key);
            }

            // if (  key !== DYNAMIC_CACHE && key.includes('dynamic') ) {
            //     return caches.delete(key);
            // }

        });

    });

    e.waitUntil( respuesta );

});

/*
Hay que implementar la estrategia del Cache
Empezamos por cache only (no se cargan las fuentes)
Despues hacemos Cache Netwok Fallback
*/



self.addEventListener( 'fetch', e => {


    const respuesta = caches.match( e.request ).then( res => {

        if ( res ) {
            return res;
        } else {

            return fetch( e.request ).then( newRes => {

                return actualizaCacheDinamico( DYNAMIC_CACHE, e.request, newRes );

            });

        }
   

    });



    e.respondWith( respuesta );

});