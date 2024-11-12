import pandas as pd
import pickle
import numpy as np
import sqlalchemy
from datetime import datetime
from train import Train
from sqlalchemy import create_engine
import warnings

import os
import mysql.connector
from mysql.connector import Error

warnings.filterwarnings('ignore')


class ModeloDemanda:
    def __init__(self, user_id):
        with open('demanda.pkl', 'rb') as file:
            model = pickle.load(file)
        self.model = model
        self.user_id = user_id
        self.daily_error = 0.6580721220527046

    def connection_db(self):
        engine = create_engine('mysql://root:root@localhost:3307/hackaton')
        connection = engine.connect()

        conexion = mysql.connector.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),  # Solo 'localhost' sin puerto
        port=3307,  # Se especifica el puerto aquí
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', 'root'),
        database=os.getenv('MYSQL_DATABASE', 'hackaton')
        )
        if conexion.is_connected():
            print('Conexión exitosa a MySQL')
        # cursor = conexion.cursor()
        # cursor.execute("SELECT id FROM User WHERE id = %s", (userId,))


        # df_products = pd.read_sql_query(f'SELECT * FROM Products WHERE userId={self.user_id}', connection)
        # df_product_transaction=pd.read_sql_query('SELECT * FROM ProductTransaction', connection)
        # df_customer_transaction=pd.read_sql_query('SELECT * FROM CustomerTransaction', connection)
        # connection.close()
        return None #df_products, df_product_transaction, df_customer_transaction
    
    def df_format(self):
        df_products, df_product_transaction, df_customer_transaction = self.connection_db()
        df_orders = pd.merge(df_products,df_product_transaction, left_on='id', right_on='productId', how='inner')
        df_orders = pd.merge(df_orders,df_customer_transaction, left_on='customerTransactionId', right_on='id', how='inner')
        df_orders=df_orders[['date', 'productId', 'quantity']]
        df_orders['date'] = pd.to_datetime(df_orders['date'])
        df_orders = self.df.groupby(['date', 'productId']).size().reset_index(name='purchaseVolume')
        df_orders=df_orders['productId', 'date']
        df_orders['year'] = df_orders['date'].dt.year
        df_orders['month'] = df_orders['date'].dt.month
        df_orders['day'] = df_orders['date'].dt.day
        df_orders['dayOfWeek'] = df_orders['date'].dt.dayofweek
        return df_orders[['productId', 'year', 'month', 'day', 'dayOfWeek', 'purchaseVolume']]
    
    def train(self):
        formatted = self.df_format()
        trainer = Train(formatted)
        self.model=trainer.train_model()
        self.daily_error, accuracy = trainer.evaluate_model(self.model)
        return self.model, self.daily_error, accuracy
    
    def predict(self, start_date, end_date, product_ids):
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")
        
        date_range = pd.date_range(start=start_date_obj, end=end_date_obj)

        product_ids_repeated = np.repeat(product_ids, len(date_range))

        dates_repeated = np.tile(date_range, len(product_ids))

        data = pd.DataFrame({
        'product_id': product_ids_repeated,
        'date': dates_repeated
        })
    
        # Extraer los componentes de fecha necesarios
        data['year'] = data['date'].dt.year
        data['month'] = data['date'].dt.month
        data['day'] = data['date'].dt.day
        data['day_of_week'] = data['date'].dt.dayofweek
        data = data.drop('date', axis=1)  # Eliminar la columna de fecha si no es necesaria
        
        # Predecir usando el modelo cargado
        prediction = self.model.predict(data)
        data['prediction'] = prediction
        return data
    
    def results_to_json(self, prediction_df):
        json= {'userId': self.user_id, 
               'totalPrediccion': np.ceil(prediction_df['prediction'].sum()),
               'ajuste': np.ceil(prediction_df['prediction'].sum() + (prediction_df.shape[1]*self.daily_error*2)),
               'prediccionPorDia': prediction_df.to_dict(orient='records')}
        return json
        
    def run(self, start_date, end_date, product_ids):
        prediction_df = self.predict(start_date, end_date, product_ids)
        json = self.results_to_json(prediction_df)
        return json