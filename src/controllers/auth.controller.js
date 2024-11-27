import ENVIROMENT from "../config/enviroment.config.js";
import User from "../models/user.model.js";
import ResponseBuilder from "../utils/builders/responseBuilder.js"
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import enviarEmail from "../utils/mail.util.js";
import UserRepository from "../repositories/user.repository.js";



export const registerUserController = async (req, res) => {
	try {
		const { name, email, password } = req.body;
		/* const existentUser = await User.findOne({ email: email })

		if (existentUser) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(400)
				.setMessage('Bad request')
				.setPayload(
					{
						detail: 'User already exists'
					}
				)
				.build()
			return res.status(400).json(response)
		} */

		if (!email) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(400)
				.setMessage('Bad request')
				.setPayload(
					{
						detail: 'El mail no es valido'
					}
				)
				.build()
			return res.status(400).json(response)
		}

		//HASHEAR UNA CONTRASEñA CON BCRYPT.
		const hashedPassword = await bcrypt.hash(password, 10)

		const verificationToken = jwt.sign({ email: email }, ENVIROMENT.JWT_SECRET, {
			expiresIn: '1d'
		})

		const url_verification = `http://localhost:${ENVIROMENT.FRONTPORT}/verify/${verificationToken}`

		await enviarEmail({
			to: email,
			subject: 'Valida tu correo electronico',
			html: `
			<h1>Verificacion de correo electronico</h1>
			<p>Da click en el boton de abajo para verificar</p>
			<a href="${url_verification}"
			>Click Aqui</a>
			`
		})


		const newUser = new User({
			name,
			email,
			password: hashedPassword,
			verificationToken: verificationToken,
			emailVerified: false
		})

		// Save() => Metodo que nos permite guardar el objeto en la base de datos de Mongodb
		await newUser.save()

		const response = new ResponseBuilder()
			.setOk(true)
			.setStatus(200)
			.setMessage('Se creo el usuario correctamente!')
			.setPayload({})
			.build()
		res.status(201).json(response)


	} catch (error) {
		if (error.code === 11000) {
			res.sendStatus(400)
		}
		console.error('Error al registrar usuario:', error)
		const response = new ResponseBuilder()
			.setOk(false)
			.setStatus(500)
			.setMessage('Internal server error')
			.setPayload(
				{
					detail: error.message,

				}
			)
			.build()
		return res.status(500).json(response)
	}
}


export const verifyEmailValidationTokenController = async (req, res) => {
	try {
		const { verificationToken } = req.params
		if (!verificationToken) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(400)
				.setMessage('Usuario no encontrado')
				.setPayload({
					detail: 'Falta enviar token de verificación'
				})
				.build()
			return res.json(response)
		}
		//Verificamos que el token de verificación sea el correcto, osea emitido por el mi.
		//Si fallara la lectura/verificacio/expiracion hara un throw
		//La constante decoded tendra el payload de mi token
		const decoded = jwt.verify(verificationToken, ENVIROMENT.JWT_SECRET)

		//Busco al usuario en la base de datos por su email
		const user = await User.findOne({ email: decoded.email })
		if (!user) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(404)
				.setMessage('Usuario no encontrado')
				.setPayload({
					detail: 'El email no esta registrado'
				})
				.build()
			return res.json(response)
		}

		if (user.emailVerified) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(400)
				.setMessage('Email ya verificado')
				.setPayload({
					detail: 'El email ya fue verificado'
				})
				.build()
			return res.json(response)
		}
		//En caso de pasar las verificaciones, cambiamos el estado de emailVerified a true
		user.emailVerified = true
		//user.verificationToken = undefined
		await user.save()

		const response = new ResponseBuilder()
			.setOk(true)
			.setStatus(200)
			.setMessage('Email verificado con exito')
			.setPayload({
				message: 'Usuario validado'
			})
			.build()
		res.status(200).json(response)
	} catch (error) {
		const response = new ResponseBuilder()
			.setOk(false)
			.setStatus(500)
			.setMessage('Internal server error')
			.setPayload({
				detail: error.message
			})
			.build()
		res.status(500).json(response)
	}
}





export const loginController = async (req, res) => {
	try {
		const { email, password } = req.body
		const user = await UserRepository.obtenerPorEmail(email)
		if (!user) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(404)
				.setMessage('Usuario no encontrado')
				.setPayload({
					detail: 'El email no esta registrado'
				})
				.build()
			return res.json(response)
		}
		if (!user.emailVerified) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(403)//contenido prohibido para usuarios sin email verificado.
				.setMessage('Email no verificado')
				.setPayload(
					{
						detail: 'Verifica tu correo electronico antes de iniciar sesion'
					}
				)
				.build()
			return res.json(response)
		}

		const isValidPassword = await bcrypt.compare(password, user.password)
		if (!isValidPassword) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(401)//Credenciales invalidas.
				.setMessage('Credenciales incorrectas')
				.setPayload(
					{
						detail: 'Contaseña incorrecta'
					}
				)
				.build()
			return res.json(response)
		}

		//Hacemos un TOKEN para validar opciones en nuestra app
		const token = jwt.sign({
			email: user.email,
			id: user._id,
			role: user.role
		},
			ENVIROMENT.JWT_SECRET, { expiresIn: '1d' })

		const response = new ResponseBuilder()
			.setOk(true)
			.setStatus(200)
			.setMessage('Logueado')
			.setPayload(
				{
					token,
					user: {
						id: user._id,
						name: user.name,
						email: user.email,
						role: user.role
					}
				}
			)
			.build()
		return res.json(response)
	}
	catch (error) {
		const response = new ResponseBuilder()
			.setOk(false)
			.setStatus(401)
			.setMessage('Internal server error')
			.setPayload(
				{
					detail: error.message
				}
			)
			.build()
		res.json(response)
	}
}


export const forgotPassswordController = async (req, res) => {
	try {
		const { email } = req.body
		if (!email) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(400)
				.setMessage('Email invalido')
				.setPayload({
					detail: 'El email no existe o es incorrecto'
				})
				.build()
			return res.status(400).json(response)
		}

		const user = await UserRepository.obtenerPorEmail(email)
		if (!user) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(404)
				.setMessage('Usuario no encontrado')
				.setPayload({
					detail: 'No se encontro el usuario'
				})
				.build()
			res.status(404).json(response)
		}

		const resetToken = jwt.sign({ email: user.email }, ENVIROMENT.JWT_SECRET, { expiresIn: '1h' })


		const resetURL = `http://localhost:${ENVIROMENT.FRONTPORT}/reset-password/${resetToken}`

		enviarEmail({
			to: user.email,
			subject: 'Recuperacion de contraseña',
			html: `
			<div>
				<h1>Recuperacion de contraseña</h1>
				<p>Da click en el boton de abajo para recuperar tu contraseña</p>
				<a href='${resetURL}'>Restablecer</a>
			</div>
			`
		})

		const response = new ResponseBuilder()
		response
			.setOk(true)
			.setStatus(200)
			.setMessage('Email enviado con exito')
			.setPayload({
				detail: 'Se envio un correo electronico para restablecer tu contraseña'
			})
			.build()
		return res.status(200).json(response)

	}
	catch (error) {
		const response = new ResponseBuilder()
			.setOk(false)
			.setStatus(500)
			.setMessage('Internal server error')
			.setPayload({
				detail: error.message
			})
			.build()
		return res.status(500).json(response)
	}
}


export const resetTokenController = async (req, res) => {
	try {

		const { password } = req.body
		if (!password) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(400)
				.setMessage('Se requiere la nueva contraseña')
				.setPayload({
					detail: 'Falta contraseña nueva'
				})
				.build()
			return res.json(response)
		}

		const { reset_token } = req.params

		if (!reset_token) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(400)
				.setMessage('Token Incorrecto')
				.setPayload({
					detail: 'El reset_token expiro o no es valido'
				})
				.build()
			return res.json(response)
		}

		const decoded = jwt.verify(reset_token, ENVIROMENT.JWT_SECRET)

		console.log(decoded);


		if (!decoded) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(400)
				.setMessage('Token Incorrecto')
				.setPayload({
					detail: 'Fallo token de verificación'
				})
				.build()
			return res.json(response)
		}

		const { email } = decoded

		const user = await UserRepository.obtenerPorEmail(email)

		if (!user) {
			const response = new ResponseBuilder()
				.setOk(false)
				.setStatus(400)
				.setMessage('No se encontro el usuario')
				.setPayload({
					detail: 'Usuario inexistente o invalido'
				}
				)
				.build()
			return res.json(response)
		}

		const encriptedPassword = await bcrypt.hash(password, 10);

		user.password = encriptedPassword

		await user.save()

		const response = new ResponseBuilder()
			.setOk(true)
			.setStatus(200)
			.setMessage('Contraseña restablecida!')
			.setPayload({
				detail: 'Se actualizo la contraseña correctamente'
			})
		res.status(200).json(response)
	}
	catch (error) {
		return res.status(500).json({
			ok: false,
			message: 'Error interno del servidor',
			error: error.message,
		});
	}

}