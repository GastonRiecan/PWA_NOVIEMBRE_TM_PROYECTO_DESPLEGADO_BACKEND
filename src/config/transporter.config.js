
import nodemailer from 'nodemailer'
import ENVIROMENT from './enviroment.config.js'
//LOGICA DE CONFIGURACION DE NUESTRO EMAIL

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ENVIROMENT.GMAIL_USER,
        pass: ENVIROMENT.GMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
})

export default transporter