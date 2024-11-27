import transporter from "../config/transporter.config.js";

const enviarEmail = async (options) => {
    try {
        let response = await transporter.sendMail(options)
        console.log(response);

    }
    catch (error) {
        //Para poder trackear el error mejor y poder arreglarlo
        console.error('Error al enviar el mail', error);
        //Para que la funcion que invoquea esta funcion tambie le salte el error
        throw error
    }
}

/* enviarEmail({
    html: 'Hola desde node.js',
    subject: 'Prueba Test',
    to: 'riecanpruebasutn@gmail.com'
}) */

//ERROR AL ENVIAR MAIL:

/* 
node:internal/process/promises:391
//    triggerUncaughtException(err, true /* fromPromise */
//    ^

//Error: self-signed certificate in certificate chain
//    at TLSSocket.onConnectSecure (node:_tls_wrap:1674:34)
//    at TLSSocket.emit (node:events:519:28)
//    at TLSSocket._finishInit (node:_tls_wrap:1085:8)
//    at ssl.onhandshakedone (node:_tls_wrap:871:12) {
//  code: 'ESOCKET',
//  command: 'CONN'
//}

//Node.js v20.15.0
//Failed running './src/server.js'

export default enviarEmail