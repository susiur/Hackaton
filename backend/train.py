from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error
import pickle

class Train:
    def __init__(self, df):
        self.df = df

    def train_model(self):
        self.X = self.df[['product_id',	'year',	'month', 'day', 'day_of_week']]
        self.y = self.df['purchase_volume']
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(self.X, self.y, test_size=0.2, shuffle=False)
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(self.X_train, self.y_train)
        with open('demanda.pkl', 'wb') as file:
            pickle.dump(model, file)
        return model
    
    def evaluate_model(self, model):
        y_pred = model.predict(self.X_test)
        mae = mean_absolute_error(self.y_test, y_pred)
        mape = mean_absolute_percentage_error(self.y_test, y_pred)
        return mae, mape