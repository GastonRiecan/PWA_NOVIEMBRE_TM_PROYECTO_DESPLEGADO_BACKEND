import jwt from "jsonwebtoken"
import ResponseBuilder from "../utils/builders/responseBuilder.js"
import ENVIROMENT from "../config/enviroment.config.js"

//Roles permitidos es un parametro que en caso de estar deberia ser un array de roles o en caso de  no estar debe ser un array vacio

//Se invoca el verifyTokenMiddleware y recibe los roles permitidos, y luego esa funcion retorna el middleware
export const verifyTokenMiddleware = (roles_permitidos = []) => {
    return (req, res, next) => {
        try {
            const auth_header = req.headers['authorization']
            if (!auth_header) {
                const response = new ResponseBuilder()
                    .setOk(false)
                    .setMessage('Falta token de autorizacion')
                    .setStatus(401)
                    .setPayload({
                        detail: 'Se esperaba un toquen de autorizacion'
                    })
                    .build()
                return res.status(401).json(response)
            }

            //'Bearer egfwegvfwegfrgelewbg' => ['Bearer, 'sdfasdfasdfdf'] => arr[1]
            const acces_token = auth_header.split(' ')[1]
            if (!acces_token) {
                const response = new ResponseBuilder()
                    .setOk(false)
                    .setMessage('El token de autorizacion esta mal formado')
                    .setStatus(401)
                    .setPayload({
                        detail: 'Se esperaba un token de autorizacion'
                    })
                    .build()
                return res.status(401).json(response)
            }

            const decoded = jwt.verify(acces_token, ENVIROMENT.JWT_SECRET)
            //Guardamos en la request la informacion del usuario
            req.user = decoded//IMPORTANTE PARA OBTEDNER DATOS DEL USUARIO!!

            //Si hay roles y no esta incluido el rol del usuario dentro de los roles permitidos
            if (roles_permitidos.length && !roles_permitidos.includes(req.user.role)) {
                const response = new ResponseBuilder()
                    .setOk(false)
                    .setMessage('Acceso restringido')
                    .setStatus(403)
                    .setPayload({
                        detail: 'No tienes los permisos necessrios para realizar esta operacion'
                    })
                    .build()
                return res.status(403).json(response)
            }

            return next() //Pasamos al siguiente controlador
        }
        catch (error) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setMessage('Fallo al autentificar')
                .setStatus(401)
                .setPayload({
                    detail: error.message
                })
                .build()
            return res.status(401).json(response)
        }
    }

}

export const verifyApikeyMiddleware = (req, res, next) => {
    console.log('Headers recibidos:', req.headers);  // Verifica los encabezados
    console.log('API Key recibida:', req.headers['x-api-key']);
    console.log('API Key esperada:', ENVIROMENT.API_KEY_INTERN);

    try {
        const apikey_header = req.headers['x-api-key']
        if (!apikey_header) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setMessage('Falta apikey de acceso')
                .setStatus(401)
                .setPayload({
                    detail: 'se esperaba un api-key'
                })
                .build()
            return res.status(401).json(response)
        }

        if (apikey_header !== ENVIROMENT.API_KEY_INTERN) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setMessage('Unauthorized')
                .setStatus(401)
                .setPayload({
                    detail: 'Se esperaba una api-key valida'
                })
                .build()
            return res.status(401).json(response)
        }

        next();

    }
    catch (error) {

        const response = new ResponseBuilder()
            .setOk(false)
            .setMessage('Internal server error')
            .setStatus(401)
            .setPayload({
                detail: 'No se pudo validar la api-key'
            })
            .build()
        return res.status(401).json(response)
    }
}