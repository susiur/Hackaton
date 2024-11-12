# app.py

from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
from datetime import date
import os
from dotenv import load_dotenv
from flask_cors import CORS
from main import ModeloDemanda

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


def validar_usuario(userId):
    """
    Verifica si el userId proporcionado existe en la base de datos.
    """
    try:
        cursor = conexion.cursor()
        cursor.execute("SELECT id FROM User WHERE id = %s", (userId, ))
        return cursor.fetchone() is not None
    except Error as e:
        print('Error al validar el usuario:', e)
        return False
 
def obtener_usuario():
    """
    Obtiene el userId desde los parámetros de la solicitud.
    """
    userId = request.args.get('userId') or (request.get_json() and request.get_json().get('userId'))
    if not userId:
        return None, jsonify({'error': 'userId es requerido.'}), 400
    if not validar_usuario(userId):
        return None, jsonify({'error': f'userId {userId} no corresponde a ningún usuario existente.'}), 400
    return userId, None, None

# Agregar el endpoint para predicción
@app.route('/predict', methods=['POST'])
def predecir_demanda():
    userId, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code
    data = request.get_json()
    required_fields = ['userId', 'start_date', 'end_date']
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'El campo "{field}" es requerido.'}), 400
    # Extraer los parámetros
    userId = data['userId']
    start_date = data['start_date']
    end_date = data['end_date']

    try:
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT id
            FROM Product
            WHERE userId = %s
        """, (userId,))
        productos_usuario = cursor.fetchall()
        productos_usuario = [producto['id'] for producto in productos_usuario]
        modelo_demanda = ModeloDemanda(userId)

        predicciones = modelo_demanda.run(start_date, end_date, productos_usuario)

        # Devolver las predicciones como respuesta
        return jsonify(predicciones), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_or_create_null_provider(userId):
    """
    Obtiene el proveedor 'Nulo'. Si no existe, lo crea asignándolo al usuario proporcionado.
    Retorna el ID del proveedor 'Nulo'.
    """
    try:
        cursor = conexion.cursor()
        cursor.execute("SELECT id FROM Supplier WHERE name = %s AND userId = %s", ('Nulo', userId))
        proveedor_nulo = cursor.fetchone()
        if not proveedor_nulo:
            insert_null = "INSERT INTO Supplier (userId, name, contactNumber) VALUES (%s, %s, %s)"
            cursor.execute(insert_null, (userId, 'Nulo', None))
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
        cursor.execute("SELECT id, mail, businessName FROM User WHERE id = %s", (id,))
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
    userId, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT Supplier.id, Supplier.name, Supplier.contactNumber
            FROM Supplier
            WHERE Supplier.userId = %s
        """, (userId,))
        proveedores = cursor.fetchall()
        return jsonify(proveedores), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Crear un nuevo proveedor
@app.route('/providers', methods=['POST'])
def crear_proveedor():
    data = request.get_json()
    required_fields = ['userId', 'name']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'El campo "{field}" es requerido.'}), 400

    userId = data['userId']
    if not validar_usuario(userId):
        return jsonify({'error': 'userId no corresponde a ningún usuario existente.'}), 400

    try:
        cursor = conexion.cursor()

        insert_supplier = """
            INSERT INTO Supplier (userId, name, contactNumber)
            VALUES (%s, %s, %s)
        """
        supplier_data = (
            userId,
            data['name'],
            data.get('contactNumber')
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
    userId, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor()

        # Verificar si el proveedor existe y pertenece al usuario
        cursor.execute("SELECT * FROM Supplier WHERE id = %s AND userId = %s", (id, userId))
        proveedor = cursor.fetchone()
        if not proveedor:
            return jsonify({'error': 'Proveedor no encontrado o no pertenece al usuario especificado.'}), 404

        # Obtener o crear el proveedor 'Nulo' para este usuario
        proveedor_nulo_id = get_or_create_null_provider(userId)
        if proveedor_nulo_id is None:
            return jsonify({'error': 'No se pudo obtener o crear el proveedor "Nulo".'}), 500

        # Actualizar productos que tienen este proveedor estableciendo providerId al proveedor 'Nulo'
        actualizar_productos = """
            UPDATE product
            SET providerId = %s
            WHERE providerId = %s AND userId = %s
        """
        cursor.execute(actualizar_productos, (proveedor_nulo_id, id, userId))
        conexion.commit()

        # Eliminar el proveedor
        cursor.execute("DELETE FROM Supplier WHERE id = %s AND userId = %s", (id, userId))
        conexion.commit()

        return jsonify({'message': 'Proveedor eliminado y productos reasignados al proveedor "Nulo".'}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Crear Producto
@app.route('/productos', methods=['POST'])
def crear_producto():
    data = request.get_json()
    required_fields = ['userId', 'name', 'price', 'quantity', 'minimumStockLevel']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'El campo "{field}" es requerido.'}), 400

    userId = data['userId']
    if not validar_usuario(userId):
        return jsonify({'error': 'userId no corresponde a ningún usuario existente.'}), 400

    try:
        cursor = conexion.cursor()

        # Verificar si el providerId (si se proporciona) pertenece al usuario
        providerId = data.get('providerId')
        if providerId:
            cursor.execute("SELECT id FROM Supplier WHERE id = %s AND userId = %s", (providerId, userId))
            proveedor = cursor.fetchone()
            if not proveedor:
                return jsonify({'error': 'providerId no corresponde a ningún proveedor de este usuario.'}), 400

        insert_product = """
            INSERT INTO Product (userId, providerId, name, brand, price, quantity, minimumStockLevel, enable)
            VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE)
        """
        product_data = (
            userId,
            providerId,
            data['name'],
            data.get('brand'),
            data['price'],
            data['quantity'],
            data['minimumStockLevel']
        )
        cursor.execute(insert_product, product_data)
        conexion.commit()
        productId = cursor.lastrowid

        insert_registry = """
            INSERT INTO ModifyRegistry (userId, productId, date, quantity)
            VALUES (%s, %s, %s, %s)
        """
        registry_data = (userId, productId, date.today(), data['quantity'])
        cursor.execute(insert_registry, registry_data)
        conexion.commit()
        return jsonify({'message': 'Producto creado y registrado', 'id': productId}), 201
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Obtener todos los productos de un usuario
@app.route('/productos', methods=['GET'])
def obtener_productos():
    userId, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT Product.*, Supplier.name AS supplierName, Supplier.contactNumber
            FROM Product
            LEFT JOIN Supplier ON Product.providerId = Supplier.id
            WHERE Product.userId = %s
        """, (userId,))
        productos = cursor.fetchall()
        return jsonify(productos), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Obtener un producto por ID y Usuario
@app.route('/productos/{id}', methods=['GET'])
def obtener_producto(id):
    userId, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT Product.*, Supplier.name AS supplierName, Supplier.contactNumber
            FROM product
            LEFT JOIN Supplier ON Product.providerId = Supplier.id
            WHERE Product.id = %s AND Product.userId = %s
        """, (id, userId))
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
    userId, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    data = request.get_json()
    try:
        cursor = conexion.cursor()

        # Verificar si el producto existe y pertenece al usuario
        cursor.execute("SELECT * FROM Product WHERE id = %s AND userId = %s", (id, userId))
        producto = cursor.fetchone()
        if not producto:
            return jsonify({'error': 'Producto no encontrado o no pertenece al usuario especificado.'}), 404

        # Excluir 'enable' y 'userId' de los campos a actualizar
        campos = ", ".join(f"{key} = %s" for key in data.keys() if key not in ['enable', 'userId'])
        valores = [value for key, value in data.items() if key not in ['enable', 'userId']]
        valores.append(id)

        if not campos:
            return jsonify({'error': 'No hay campos para actualizar.'}), 400

        # Si providerId está siendo actualizado, verificar que pertenezca al usuario
        if 'providerId' in data:
            new_providerId = data['providerId']
            cursor.execute("SELECT id FROM Supplier WHERE id = %s AND userId = %s", (new_providerId, userId))
            proveedor = cursor.fetchone()
            if not proveedor:
                return jsonify({'error': 'El nuevo providerId no corresponde a ningún proveedor de este usuario.'}), 400

        update_query = f"UPDATE Product SET {campos} WHERE id = %s AND userId = %s"
        cursor.execute(update_query, valores + [userId])
        conexion.commit()

        # Registrar en modify_registry
        cursor.execute("SELECT quantity FROM Product WHERE id = %s AND userId = %s", (id, userId))
        resultado = cursor.fetchone()
        if resultado:
            current_quantity = resultado[0]
            insert_registry = """
                INSERT INTO ModifyRegistry (userId, productId, date, quantity)
                VALUES (%s, %s, %s, %s)
            """
            registry_data = (userId, id, date.today(), current_quantity)
            cursor.execute(insert_registry, registry_data)
            conexion.commit()

        return jsonify({'message': 'Producto actualizado y registrado'}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Eliminar Producto (establecer enable a False)
@app.route('/productos/{id}', methods=['DELETE'])
def eliminar_producto(id):
    userId, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor()

        # Verificar si el producto existe y pertenece al usuario
        cursor.execute("SELECT quantity FROM Product WHERE id = %s AND userId = %s", (id, userId))
        producto = cursor.fetchone()
        if not producto:
            return jsonify({'error': 'Producto no encontrado o no pertenece al usuario especificado.'}), 404

        current_quantity = producto[0]

        # Establecer enable a False
        actualizar_enable = """
            UPDATE product
            SET enable = FALSE
            WHERE id = %s AND userId = %s
        """
        cursor.execute(actualizar_enable, (id, userId))
        conexion.commit()

        # Registrar en modify_registry
        insert_registry = """
            INSERT INTO ModifyRegistry (userId, productId, date, quantity)
            VALUES (%s, %s, %s, %s)
        """
        registry_data = (userId, id, date.today(), current_quantity)
        cursor.execute(insert_registry, registry_data)
        conexion.commit()

        return jsonify({'message': 'Producto deshabilitado y registrado'}), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Crear Compra (Factura Cliente)
@app.route('/compras', methods=['POST'])
def crear_compra():
    data = request.get_json()
    required_fields = ['userId', 'products']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'El campo "{field}" es requerido.'}), 400

    userId = data['userId']
    products = data.get('products', [])

    if not validar_usuario(userId):
        return jsonify({'error': 'userId no corresponde a ningún usuario existente.'}), 400

    if not products:
        return jsonify({'error': 'No se proporcionaron productos para la compra.'}), 400

    try:
        cursor = conexion.cursor()
        conexion.start_transaction()

        # Crear customerTransaction con userId
        insert_transaction = """
            INSERT INTO CustomerTransaction (userId, date)
            VALUES (%s, %s)
        """
        transaction_data = (userId, data.get('date', date.today()))
        cursor.execute(insert_transaction, transaction_data)
        customerTransactionId = cursor.lastrowid

        for item in products:
            productId = item.get('productId')
            quantity = item.get('quantity')

            if not productId or not quantity:
                conexion.rollback()
                return jsonify({'error': 'Cada producto debe tener "productId" y "quantity".'}), 400

            # Verificar si el producto existe, está habilitado y pertenece al usuario
            cursor.execute("""
                SELECT price, quantity 
                FROM Product 
                WHERE id = %s AND enable = TRUE AND userId = %s
            """, (productId, userId))
            producto = cursor.fetchone()
            if not producto:
                conexion.rollback()
                return jsonify({'error': f'Producto con ID {productId} no encontrado, no está habilitado o no pertenece al usuario.'}), 404

            price, available_quantity = producto

            if available_quantity < quantity:
                conexion.rollback()
                return jsonify({'error': f'Cantidad insuficiente para el producto ID {productId}.'}), 400

            # Actualizar la cantidad del producto
            new_quantity = available_quantity - quantity
            cursor.execute("UPDATE Product SET quantity = %s WHERE id = %s AND userId = %s", (new_quantity, productId, userId))

            # Insertar en productTransaction
            insert_productTransaction = """
                INSERT INTO ProductTransaction (userId, productId, customerTransactionId, quantity, price)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(insert_productTransaction, (userId, productId, customerTransactionId, quantity, price))

            # Registrar en modify_registry
            insert_registry = """
                INSERT INTO ModifyRegistry (userId, productId, date, quantity)
                VALUES (%s, %s, %s, %s)
            """
            registry_data = (userId, productId, date.today(), new_quantity)
            cursor.execute(insert_registry, registry_data)

        conexion.commit()
        return jsonify({'message': 'Compra creada exitosamente.', 'customerTransactionId': customerTransactionId}), 201
    except Error as e:
        conexion.rollback()
        return jsonify({'error': str(e)}), 500

# Obtener todas las compras (Customer Transactions) de un usuario
@app.route('/compras', methods=['GET'])
def obtener_compras():
    userId, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("""
            SELECT ct.id, ct.date
            FROM CustomerTransaction ct
            WHERE ct.userId = %s
        """, (userId,))
        compras = cursor.fetchall()

        # Obtener los productos de cada compra
        for compra in compras:
            cursor.execute("""
                SELECT pt.id, pt.productId, p.name, pt.quantity, pt.price
                FROM ProductTransaction pt
                JOIN Product p ON pt.productId = p.id
                WHERE pt.customerTransactionId = %s AND pt.userId = %s
            """, (compra['id'], userId))
            productos = cursor.fetchall()
            compra['productos'] = productos

        return jsonify(compras), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

# Obtener una compra por ID y Usuario
@app.route('/compras/{id}', methods=['GET'])
def obtener_compra(id):
    userId, error_response, status_code = obtener_usuario()
    if error_response:
        return error_response, status_code

    try:
        cursor = conexion.cursor(dictionary=True)
        # Verificar si la compra está asociada al usuario
        cursor.execute("""
            SELECT ct.id, ct.date
            FROM CustomerTransaction ct
            WHERE ct.id = %s AND ct.userId = %s
            LIMIT 1
        """, (id, userId))
        compra = cursor.fetchone()
        if not compra:
            return jsonify({'error': 'Compra no encontrada para el usuario especificado.'}), 404

        # Obtener los detalles de los productos en la compra
        cursor.execute("""
            SELECT pt.id, pt.productId, p.name, pt.quantity, pt.price
            FROM ProductTransaction pt
            JOIN Product p ON pt.productId = p.id
            WHERE pt.customerTransactionId = %s AND pt.userId = %s
        """, (id, userId))
        productos = cursor.fetchall()

        compra['productos'] = productos
        return jsonify(compra), 200
    except Error as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
