
import ProductRepository from "../repositories/product.repository.js"
import ResponseBuilder from "../utils/builders/responseBuilder.js"

//Desarrollar cada controlador
export const getAllProductsController = async (req, res) => {

    try {
        const products_from_db = await ProductRepository.getProducts()
        console.log('PRODUCTOS', products_from_db);

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Productos Obtenidos')
            .setPayload({
                products: products_from_db
            })
            .build()
        return res.json(response)
    }
    catch (error) {
        console.error("Error al obtener los productos:", error);
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(500)
            .setMessage('Error al obtener los productos')
            .setPayload({
                detail: error.message || 'Error interno del servidor'
            })
            .build();

        return res.status(500).json(response);
    }
}

export const getAllProductByIDController = async (req, res) => {
    try {
        const { product_id } = req.params;
        console.log("Product ID recibido:", product_id);

        const product_found = await ProductRepository.getProductsById(product_id);

        if (!product_found) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setMessage('Producto no encontrado')
                .setPayload({
                    detail: `No se encontró un producto con ID: ${product_id}`
                })
                .build();

            return res.status(404).json(response);
        } else {
            const response = new ResponseBuilder()
                .setOk(true)
                .setStatus(200)
                .setMessage('Producto obtenido correctamente')
                .setPayload({
                    product: product_found
                })
                .build();

            return res.status(200).json(response);
        }
    } catch (error) {
        console.error("Error al obtener el producto:", error);

        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(500)
            .setMessage('Error al obtener el producto')
            .setPayload({
                detail: error.message || 'Error interno del servidor'
            })
            .build();

        return res.status(500).json(response);
    }
};
export const createProductController = async (req, res) => {
    try {
        console.log("Contenido de req.user:", req.user);
        const { title, price, stock, description, category, image } = req.body
        //El seller_id NO! debe venir del body, sino del inicio de sesion del user.
        const seller_id = req.user.id

        if (!title || !price || !stock || !description || !category) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Datos incompletos para crear el producto')
                .setPayload({
                    detail: 'Se requieren title, price, stock, description, category, image, active, seller_id, fecha _creacion'
                })
                .build();
            return res.status(400).json(response);
        }



        if (image && Buffer.byteLength(image, 'base64') > 2 * 1024 * 1024) {
            console.error('Imagen muy grande');
            return res.sendStatus(400)
        }
        const newProduct = {
            title,
            price,
            stock,
            description: description,
            category,
            image_base_64: image,
            seller_id
        }

        const newProductSaved = await ProductRepository.createProduct(newProduct);

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Producto creado correctamente')
            .setPayload({
                data: {
                    title: newProductSaved.title,
                    price: newProduct.price,
                    stock: newProductSaved.stock,
                    description: newProductSaved.description,
                    category: newProductSaved.category,
                    id: newProductSaved._id
                }
            })
            .build();
        return res.status(200).json(response);


    } catch (error) {
        console.error("Error al crear el producto:", error);
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(500)
            .setMessage('Error al crear el producto')
            .setPayload({
                detail: error.message || 'Error interno del servidor'
            })
            .build();
        return res.status(500).json(response);
    }


}

export const updateProductController = async (req, res) => {
    try {
        const { product_id } = req.params
        const { title, price, stock, description, category } = req.body
        const seller_id = req.user.id

        if (!title || !price || !stock || !description || !category) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('Datos incompletos para crear el producto')
                .setPayload({
                    detail: 'Se requieren title, price, stock, description, category, image, active, seller_id, fecha _creacion'
                })
                .build();
            return res.status(400).json(response);
        }

        const updatedProduct = {
            title,
            price,
            stock,
            description,
            category
        }

        const productFound = await ProductRepository.getProductById(product_id)

        if (seller_id !== productFound.seller_id.toString()) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(403)
                .setMessage('Operacion con acceso denegado')
                .setPayload({
                    detail: 'Se requieren las credenciales correspondientes para actualizar el producto'
                })
                .build();
            return res.status(403).json(response);

        }

        const updatedProductSaved = await ProductRepository.updateProduct(product_id, updatedProduct)

        if (!updatedProductSaved) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setMessage('No se pudo actualizar el producto')
                .setPayload({
                    detail: 'Producto no encontrado'
                })
                .build();
            return res.status(404).json(response);
        }

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Producto actualizado correctamente')
            .setPayload({
                detail: `Se actualizo correcatamente el producto ${updatedProductSaved.title}`
            })
            .build();
        return res.status(200).json(response);



    } catch (error) {
        console.log(error);
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('No se pudo actualizar el producto')
            .setPayload({
                detail: "Internal server error"
            })
            .build();
        return res.status(400).json(response);

    }
}

export const deleteProductController = async (req, res) => {
    try {
        const { product_id } = req.params
        const product_found = await ProductRepository.getProductById(product_id)

        if (!product_found) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setMessage('No se encontro el producto')
                .setPayload({
                    detail: 'El producto no existe'
                })
                .build();
            return res.status(404).json(response);
        }

        if (req.user.role !== "admin" && req.user.id !== product_found.seller_id.toString()) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(400)
                .setMessage('No posee las credenciales para eliminar el producto')
                .setPayload({
                    detail: 'Se requiere las credenciales necesarias'
                })
                .build();
            return res.status(400).json(response);
        }

        const deletedProduct = await ProductRepository.deleteProduct(product_id)


        if (!deletedProduct) {
            const response = new ResponseBuilder()
                .setOk(false)
                .setStatus(404)
                .setMessage('No se pudo eliminar el producto')
                .setPayload({
                    detail: 'Producto no encontrado'
                })
                .build();
            return res.status(404).json(response);

        }

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setMessage('Se elimino el producto')
            .setPayload({
                detail: "Poducto eliminado con exito"
            })
            .build();
        return res.status(200).json(response);

    }
    catch (error) {
        console.log(error);
        const response = new ResponseBuilder()
            .setOk(false)
            .setStatus(400)
            .setMessage('No se pudo eliminar el producto')
            .setPayload({
                detail: "Internal server error"
            })
            .build();
        return res.status(400).json(response);
    }
}