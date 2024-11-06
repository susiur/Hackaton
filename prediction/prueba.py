from main import ModeloDemanda
import json


if __name__ == '__main__':
    modelo = ModeloDemanda(1)
    # print(modelo.train())
    data=modelo.run('2016-01-23', '2016-03-15', 1)
    with open('json.json', 'w') as json_file:
        json.dump(data, json_file, indent=4) 