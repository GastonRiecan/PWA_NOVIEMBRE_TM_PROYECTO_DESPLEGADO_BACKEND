import database_pool from "../db/configMysql.js";
import Product from "../models/product.model.js";
/* class ProductRepository {

    static async getProducts() {
        return Product.find({ active: true })
    }

    static async getProductById(id) {
        return Product.findById(id)
    }

    static async createProduct(product_data) {
        const new_product = new Product(product_data)
        return new_product.save()
    }

    static async updateProduct(id, new_product_data) {
        return Product.findByIdAndUpdate(id, new_product_data, { new: true })
    }


    static async deleteProduct(id) {
        return Product.findByIdAndUpdate(id, { active: false }, { new: true })
    }
} */


class ProductRepository {
    static async getProducts() {
        const query = 'SELECT * FROM products WHERE active = true'
        const [registros, columnas] = await database_pool.execute(query)//Esto devuelve un array con 2 valores
        //1er valor resultados, rows/ filas /registros(me da vacio por que actualmente no tengo productos)
        //2do valor son las columns de mi tabla.
        console.log(registros);
        return registros

    }

    //Si queremos devolver null cuando no se encuentre
    static async getProductsById(product_id) {
        const query = `SELECT * FROM products WHERE id = ?`
        //Execute espera como 2do parametro un array con los valores que quieras reemplazar en la query.
        const [registros] = await database_pool.execute(query, [product_id])
        return registros.length > 0 ? registros[0] : null
    }

    static async createProduct(product_data) {
        const { title, stock, price, description, seller_id, image_base_64, active } = product_data
        const query = `INSERT INTO products (title, stock, price, description, seller_id, image_base_64, active)
        VALUES 
        (?, ?, ?, ?, ?, ?, true)`

        const [resultado] = await database_pool.execute(query, [title, stock, price, description, seller_id, image_base_64])
        return {
            id: resultado.insertId,
            title,
            stock,
            price,
            description,
            seller_id,
            image_base_64,
            active: true
        }
    }

    static async updateProduct(product_id, product_data) {
        const { title, stock, price, description, seller_id, image_base_64, active } = product_data;

        const query = `
            UPDATE products 
            SET 
                title = ?, 
                stock = ?, 
                price = ?, 
                description = ?, 
                seller_id = ?, 
                image_base_64 = ?, 
                active = ? 
            WHERE id = ?`;

        const [resultado] = await database_pool.execute(query, [
            title, stock, price, description, seller_id, image_base_64, active, product_id
        ]);

        if (resultado.affectedRows > 0) {
            return {
                id: product_id,
                title,
                stock,
                price,
                description,
                seller_id,
                image_base_64,
                active
            };
        } else {
            return null; // Si no se actualizó ningún producto
        }
    }

    static async deleteProduct(product_id) {
        const query = `
            UPDATE products 
            SET active = false 
            WHERE id = ?`;

        const [resultado] = await database_pool.execute(query, [product_id]);

        if (resultado.affectedRows > 0) {
            return { message: 'Producto desactivado correctamente', id: product_id };
        } else {
            return { message: 'Producto no encontrado', id: product_id };
        }
    }

}

export default ProductRepository