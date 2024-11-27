import express from 'express'
import { verifyApikeyMiddleware, verifyTokenMiddleware } from '../middlewares/auth.middleware.js'
import { createProductController, deleteProductController, getAllProductByIDController, getAllProductsController, updateProductController } from '../controllers/product.controller.js'


const productRouter = express.Router()


productRouter.get("/", verifyTokenMiddleware(), getAllProductsController)
productRouter.get("/:product_id", verifyTokenMiddleware(), getAllProductByIDController)
productRouter.post('/', verifyTokenMiddleware(['seller', 'admin', 'user']), createProductController)
productRouter.put('/:product_id', verifyTokenMiddleware(['seller', 'admin', 'user']), updateProductController)
productRouter.delete('/:product_id', verifyTokenMiddleware(['seller', 'admin', "user"]), deleteProductController)

export default productRouter