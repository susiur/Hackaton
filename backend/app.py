# app.py

from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
from datetime import date
import os
from dotenv import load_dotenv
from flask_cors import CORS

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de la conexión a MySQL utilizando variables de entorno
import os
import mysql.connector
from mysql.connector import Error

try:
    conexion = mysql.connector.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),  # Solo 'localhost' sin puerto
        port=3307,  # Se especifica el puerto aquí
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', 'root'),
        database=os.getenv('MYSQL_DATABASE', 'hackaton')
    )
    if conexion.is_connected():
        print('Conexión exitosa a MySQL')

except Error as e:
    print('Error al conectar a MySQL:', e)


def validar_usuario(user_id):
    """
    Verifica si el user_id proporcionado existe en la base de datos.
    """
    try:
        cursor = conexion.cursor()
        cursor.execute("SELECT id FROM user WHERE id = %s", (user_id,))
        return cursor.fetchone() is not None
    except Error as e:
        print('Error al validar el usuario:', e)
        return False

def obtener_usuario():
    """
    Obtiene el user_id desde los parámetros de la solicitud.
    """
    user_id = request.args.get('user_id') or (request.get_json() and request.get_json().get('user_id'))
    if not user_id:
        return None, jsonify({'error': 'user_id es requerido.'}), 400
    if not validar_usuario(user_id):
        return None, jsonify({'error': 'user_id no corresponde a ningún usuario existente.'}), 400
    return user_id, None, None

def get_or_create_null_provider(user_id):
    """
    Obtiene el proveedor 'Nulo'. Si no existe, lo crea asignándolo al usuario proporcionado.
    Retorna el ID del proveedor 'Nulo'.
    """
    try:
        cursor = conexion.cursor()
        cursor.execute("SELECT id FROM supplier WHERE name = %s AND user_id = %s", ('Nulo', user_id))
        proveedor_nulo = cursor.fetchone()
        if not proveedor_nulo:
            insert_null = "INSERT INTO supplier (user_id, name, contact_number) VALUES (%s, %s, %s)"
            cursor.execute(insert_null, (user_id, 'Nulo', None))
            conexion.commit()
            proveedor_nulo_id = cursor.lastrowid
            print(f"Proveedor 'Nulo' creado con ID {proveedor_nulo_id}")
        else:
            proveedor_nulo_id = proveedor_nulo[0]
        return proveedor_nulo_id
    except Error as e:
        print('Error al obtener o crear el proveedor "Nulo":', e)
        return None

# Obtener Usuario por ID
@app.route('/users/{id}', methods=['GET'])
def obtener_usuario_por_id(id):
    try:
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("SELECT id, mail, business_name FROM user WHERE id = %s", (id,))
        usuario = cursor.fetchone()
        if usuario:
            return jsonify(usuario), 200
        else:
            return jsonify({'error': 'Usuario no encontrado.'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Obtener todos los proveedores de un usuario
@app.route('/providers', methods=['GET'])
def obtener_proveedores():
    user_id, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT supplier.id, supplier.name, supplier.contact_number
            FROM supplier
            WHERE supplier.user_id = %s
        """, (user_id,))
        proveedores = cursor.fetchall()
        return jsonify(proveedores), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Crear un nuevo proveedor
@app.route('/providers', methods=['POST'])
def crear_proveedor():
    data = request.get_json()
    required_fields = ['user_id', 'name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'El campo "{field}" es requerido.'}), 400

    user_id = data['user_id']
    if not validar_usuario(user_id):
        return jsonify({'error': 'user_id no corresponde a ningún usuario existente.'}), 400

    try:
        cursor = conexion.cursor()

        insert_supplier = """
            INSERT INTO supplier (user_id, name, contact_number)
            VALUES (%s, %s, %s)
        """
        supplier_data = (
            user_id,
            data['name'],
            data.get('contact_number')
        )
        cursor.execute(insert_supplier, supplier_data)
        conexion.commit()
        supplier_id = cursor.lastrowid
        return jsonify({'message': 'Proveedor creado', 'id': supplier_id}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Eliminar un proveedor
@app.route('/providers/{id}', methods=['DELETE'])
def eliminar_proveedor(id):
    user_id, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor()

        # Verificar si el proveedor existe y pertenece al usuario
        cursor.execute("SELECT * FROM supplier WHERE id = %s AND user_id = %s", (id, user_id))
        proveedor = cursor.fetchone()
        if not proveedor:
            return jsonify({'error': 'Proveedor no encontrado o no pertenece al usuario especificado.'}), 404

        # Obtener o crear el proveedor 'Nulo' para este usuario
        proveedor_nulo_id = get_or_create_null_provider(user_id)
        if proveedor_nulo_id is None:
            return jsonify({'error': 'No se pudo obtener o crear el proveedor "Nulo".'}), 500

        # Actualizar productos que tienen este proveedor estableciendo provider_id al proveedor 'Nulo'
        actualizar_productos = """
            UPDATE product
            SET provider_id = %s
            WHERE provider_id = %s AND user_id = %s
        """
        cursor.execute(actualizar_productos, (proveedor_nulo_id, id, user_id))
        conexion.commit()

        # Eliminar el proveedor
        cursor.execute("DELETE FROM supplier WHERE id = %s AND user_id = %s", (id, user_id))
        conexion.commit()

        return jsonify({'message': 'Proveedor eliminado y productos reasignados al proveedor "Nulo".'}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Crear Producto
@app.route('/productos', methods=['POST'])
def crear_producto():
    data = request.get_json()
    required_fields = ['user_id', 'name', 'price', 'quantity', 'minimum_stock_level']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'El campo "{field}" es requerido.'}), 400

    user_id = data['user_id']
    if not validar_usuario(user_id):
        return jsonify({'error': 'user_id no corresponde a ningún usuario existente.'}), 400

    try:
        cursor = conexion.cursor()

        # Verificar si el provider_id (si se proporciona) pertenece al usuario
        provider_id = data.get('provider_id')
        if provider_id:
            cursor.execute("SELECT id FROM supplier WHERE id = %s AND user_id = %s", (provider_id, user_id))
            proveedor = cursor.fetchone()
            if not proveedor:
                return jsonify({'error': 'provider_id no corresponde a ningún proveedor de este usuario.'}), 400

        insert_product = """
            INSERT INTO product (user_id, provider_id, name, brand, price, quantity, minimum_stock_level, enable)
            VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE)
        """
        product_data = (
            user_id,
            provider_id,
            data['name'],
            data.get('brand'),
            data['price'],
            data['quantity'],
            data['minimum_stock_level']
        )
        cursor.execute(insert_product, product_data)
        conexion.commit()
        product_id = cursor.lastrowid

        insert_registry = """
            INSERT INTO modify_registry (user_id, product_id, date, quantity)
            VALUES (%s, %s, %s, %s)
        """
        registry_data = (user_id, product_id, date.today(), data['quantity'])
        cursor.execute(insert_registry, registry_data)
        conexion.commit()
        return jsonify({'message': 'Producto creado y registrado', 'id': product_id}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Obtener todos los productos de un usuario
@app.route('/productos', methods=['GET'])
def obtener_productos():
    user_id, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT product.*, supplier.name AS supplier_name, supplier.contact_number
            FROM product
            LEFT JOIN supplier ON product.provider_id = supplier.id
            WHERE product.user_id = %s
        """, (user_id,))
        productos = cursor.fetchall()
        return jsonify(productos), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Obtener un producto por ID y Usuario
@app.route('/productos/{id}', methods=['GET'])
def obtener_producto(id):
    user_id, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT product.*, supplier.name AS supplier_name, supplier.contact_number
            FROM product
            LEFT JOIN supplier ON product.provider_id = supplier.id
            WHERE product.id = %s AND product.user_id = %s
        """, (id, user_id))
        producto = cursor.fetchone()
        if producto:
            return jsonify(producto), 200
        else:
            return jsonify({'error': 'Producto no encontrado para el usuario especificado.'}), 404
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Actualizar Producto
@app.route('/productos/{id}', methods=['PUT'])
def actualizar_producto(id):
    user_id, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    data = request.get_json()
    try:
        cursor = conexion.cursor()

        # Verificar si el producto existe y pertenece al usuario
        cursor.execute("SELECT * FROM product WHERE id = %s AND user_id = %s", (id, user_id))
        producto = cursor.fetchone()
        if not producto:
            return jsonify({'error': 'Producto no encontrado o no pertenece al usuario especificado.'}), 404

        # Excluir 'enable' y 'user_id' de los campos a actualizar
        campos = ", ".join(f"{key} = %s" for key in data.keys() if key not in ['enable', 'user_id'])
        valores = [value for key, value in data.items() if key not in ['enable', 'user_id']]
        valores.append(id)

        if not campos:
            return jsonify({'error': 'No hay campos para actualizar.'}), 400

        # Si provider_id está siendo actualizado, verificar que pertenezca al usuario
        if 'provider_id' in data:
            new_provider_id = data['provider_id']
            cursor.execute("SELECT id FROM supplier WHERE id = %s AND user_id = %s", (new_provider_id, user_id))
            proveedor = cursor.fetchone()
            if not proveedor:
                return jsonify({'error': 'El nuevo provider_id no corresponde a ningún proveedor de este usuario.'}), 400

        update_query = f"UPDATE product SET {campos} WHERE id = %s AND user_id = %s"
        cursor.execute(update_query, valores + [user_id])
        conexion.commit()

        # Registrar en modify_registry
        cursor.execute("SELECT quantity FROM product WHERE id = %s AND user_id = %s", (id, user_id))
        resultado = cursor.fetchone()
        if resultado:
            current_quantity = resultado[0]
            insert_registry = """
                INSERT INTO modify_registry (user_id, product_id, date, quantity)
                VALUES (%s, %s, %s, %s)
            """
            registry_data = (user_id, id, date.today(), current_quantity)
            cursor.execute(insert_registry, registry_data)
            conexion.commit()

        return jsonify({'message': 'Producto actualizado y registrado'}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Eliminar Producto (establecer enable a False)
@app.route('/productos/{id}', methods=['DELETE'])
def eliminar_producto(id):
    user_id, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor()

        # Verificar si el producto existe y pertenece al usuario
        cursor.execute("SELECT quantity FROM product WHERE id = %s AND user_id = %s", (id, user_id))
        producto = cursor.fetchone()
        if not producto:
            return jsonify({'error': 'Producto no encontrado o no pertenece al usuario especificado.'}), 404

        current_quantity = producto[0]

        # Establecer enable a False
        actualizar_enable = """
            UPDATE product
            SET enable = FALSE
            WHERE id = %s AND user_id = %s
        """
        cursor.execute(actualizar_enable, (id, user_id))
        conexion.commit()

        # Registrar en modify_registry
        insert_registry = """
            INSERT INTO modify_registry (user_id, product_id, date, quantity)
            VALUES (%s, %s, %s, %s)
        """
        registry_data = (user_id, id, date.today(), current_quantity)
        cursor.execute(insert_registry, registry_data)
        conexion.commit()

        return jsonify({'message': 'Producto deshabilitado y registrado'}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Crear Compra (Factura Cliente)
@app.route('/compras', methods=['POST'])
def crear_compra():
    data = request.get_json()
    required_fields = ['user_id', 'products']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'El campo "{field}" es requerido.'}), 400

    user_id = data['user_id']
    products = data.get('products', [])

    if not validar_usuario(user_id):
        return jsonify({'error': 'user_id no corresponde a ningún usuario existente.'}), 400

    if not products:
        return jsonify({'error': 'No se proporcionaron productos para la compra.'}), 400

    try:
        cursor = conexion.cursor()
        conexion.start_transaction()

        # Crear customer_transaction con user_id
        insert_transaction = """
            INSERT INTO customer_transaction (user_id, date)
            VALUES (%s, %s)
        """
        transaction_data = (user_id, data.get('date', date.today()))
        cursor.execute(insert_transaction, transaction_data)
        customer_transaction_id = cursor.lastrowid

        for item in products:
            product_id = item.get('product_id')
            quantity = item.get('quantity')

            if not product_id or not quantity:
                conexion.rollback()
                return jsonify({'error': 'Cada producto debe tener "product_id" y "quantity".'}), 400

            # Verificar si el producto existe, está habilitado y pertenece al usuario
            cursor.execute("""
                SELECT price, quantity 
                FROM product 
                WHERE id = %s AND enable = TRUE AND user_id = %s
            """, (product_id, user_id))
            producto = cursor.fetchone()
            if not producto:
                conexion.rollback()
                return jsonify({'error': f'Producto con ID {product_id} no encontrado, no está habilitado o no pertenece al usuario.'}), 404

            price, available_quantity = producto

            if available_quantity < quantity:
                conexion.rollback()
                return jsonify({'error': f'Cantidad insuficiente para el producto ID {product_id}.'}), 400

            # Actualizar la cantidad del producto
            new_quantity = available_quantity - quantity
            cursor.execute("UPDATE product SET quantity = %s WHERE id = %s AND user_id = %s", (new_quantity, product_id, user_id))

            # Insertar en product_transaction
            insert_product_transaction = """
                INSERT INTO product_transaction (user_id, product_id, customer_transaction_id, quantity, price)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(insert_product_transaction, (user_id, product_id, customer_transaction_id, quantity, price))

            # Registrar en modify_registry
            insert_registry = """
                INSERT INTO modify_registry (user_id, product_id, date, quantity)
                VALUES (%s, %s, %s, %s)
            """
            registry_data = (user_id, product_id, date.today(), new_quantity)
            cursor.execute(insert_registry, registry_data)

        conexion.commit()
        return jsonify({'message': 'Compra creada exitosamente.', 'customer_transaction_id': customer_transaction_id}), 201
    except Error as e:
        conexion.rollback()
        return jsonify({'error': str(e)}), 500

# Obtener todas las compras (Customer Transactions) de un usuario
@app.route('/compras', methods=['GET'])
def obtener_compras():
    user_id, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT ct.id, ct.date
            FROM customer_transaction ct
            WHERE ct.user_id = %s
        """, (user_id,))
        compras = cursor.fetchall()

        # Obtener los productos de cada compra
        for compra in compras:
            cursor.execute("""
                SELECT pt.id, pt.product_id, p.name, pt.quantity, pt.price
                FROM product_transaction pt
                JOIN product p ON pt.product_id = p.id
                WHERE pt.customer_transaction_id = %s AND pt.user_id = %s
            """, (compra['id'], user_id))
            productos = cursor.fetchall()
            compra['productos'] = productos

        return jsonify(compras), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Obtener una compra por ID y Usuario
@app.route('/compras/{id}', methods=['GET'])
def obtener_compra(id):
    user_id, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor(dictionary=True)
        # Verificar si la compra está asociada al usuario
        cursor.execute("""
            SELECT ct.id, ct.date
            FROM customer_transaction ct
            WHERE ct.id = %s AND ct.user_id = %s
            LIMIT 1
        """, (id, user_id))
        compra = cursor.fetchone()
        if not compra:
            return jsonify({'error': 'Compra no encontrada para el usuario especificado.'}), 404

        # Obtener los detalles de los productos en la compra
        cursor.execute("""
            SELECT pt.id, pt.product_id, p.name, pt.quantity, pt.price
            FROM product_transaction pt
            JOIN product p ON pt.product_id = p.id
            WHERE pt.customer_transaction_id = %s AND pt.user_id = %s
        """, (id, user_id))
        productos = cursor.fetchall()

        compra['productos'] = productos
        return jsonify(compra), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
