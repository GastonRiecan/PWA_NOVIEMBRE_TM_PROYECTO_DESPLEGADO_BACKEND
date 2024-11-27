import User from "../models/user.model.js";


//Manejamos la logica de comunicacion con la base de datos, relacionada a los usuarios
class UserRepository {


	static async obtenerPorID(id) {
		const user = await User.findOne({ id })
		return user
	}

	static async obtenerPorEmail(email) {
		const user = await User.findOne({ email })
		return user
	}

	static async guardarUsuario(user) {
		return await user.save()
	}

	static async setEmailVerified(value, user_id) {
		const user = await UserRepository.obtenerPorID(user_id)
		user.setEmailVerified = value
		return await UserRepository.guardarUsuario()
	}
}

export default UserRepository