import pandas as pd
import pickle
import numpy as np
import sqlalchemy
from datetime import datetime
from train import Train
from sqlalchemy import create_engine
import warnings

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
        df_products = pd.read_sql_query(f'SELECT * FROM products WHERE user_id={self.user_id}', connection)
        df_product_transaction=pd.read_sql_query('SELECT * FROM product_transaction', connection)
        df_customer_transaction=pd.read_sql_query('SELECT * FROM customer_transaction', connection)
        connection.close()
        return df_products, df_product_transaction, df_customer_transaction
    
    def df_format(self):
        df_products, df_product_transaction, df_customer_transaction = self.connection_db()
        df_orders = pd.merge(df_products,df_product_transaction, left_on='id', right_on='product_id', how='inner')
        df_orders = pd.merge(df_orders,df_customer_transaction, left_on='df_customer_transaction_id', right_on='id', how='inner')
        df_orders=df_orders[['date', 'product_id', 'quantity']]
        df_orders['date'] = pd.to_datetime(df_orders['date'])
        df_orders = self.df.groupby(['date', 'product_id']).size().reset_index(name='purchase_volume')
        df_orders=df_orders['product_id', 'date']
        df_orders['year'] = df_orders['date'].dt.year
        df_orders['month'] = df_orders['date'].dt.month
        df_orders['day'] = df_orders['date'].dt.day
        df_orders['day_of_week'] = df_orders['date'].dt.dayofweek
        return df_orders[['product_id', 'year', 'month', 'day', 'day_of_week', 'purchase_volume']]
    
    def train(self):
        formatted = self.df_format()
        trainer = Train(formatted)
        self.model=trainer.train_model()
        self.daily_error, accuracy = trainer.evaluate_model(self.model)
        return self.model, self.daily_error, accuracy
    
    def predict(self, start_date, end_date, product_id):
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")
        
        date_range = pd.date_range(start=start_date_obj, end=end_date_obj)

        data = {
            'product_id': [product_id] * len(date_range),
            'year': date_range.year,
            'month': date_range.month,
            'day': date_range.day,
            'date': date_range
        }
        data = pd.DataFrame(data)
        data['day_of_week'] = data['date'].dt.dayofweek
        data=data.drop('date', axis=1)
        prediction = self.model.predict(data)
        data['prediction'] = prediction
        return data
    
    def results_to_json(self, prediction_df):
        json= {'user_id': self.user_id, 
               'total_prediccion': np.ceil(prediction_df['prediction'].sum()),
               'ajuste': np.ceil(prediction_df['prediction'].sum() + (prediction_df.shape[1]*self.daily_error*2)),
               'prediccion_por_dia': prediction_df.to_dict(orient='records')}
        return json
        
    def run(self, start_date, end_date, product_id):
        prediction_df = self.predict(start_date, end_date, product_id)
        json = self.results_to_json(prediction_df)
        return json