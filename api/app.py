import os
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from models import db, Task, User
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

db.init_app(app)
jwt = JWTManager(app)
CORS(app)

@app.route('/')
def main():
    return jsonify({ "message": "API REST Flask"}), 200

@app.route('/api/login', methods=['POST'])
def login():
    # Capturar los valores para crear al usuario
    email = request.json.get('email')
    password = request.json.get('password')

    if not email:
        return jsonify({"msg": "Email es obligatorio!"}), 400
    if not password:
        return jsonify({"msg": "Password es obligatorio!"}), 400
    
    userFound = User.query.filter_by(email=email).first()

    if not userFound:
        return jsonify({"msg": "Email/Password son incorrectos. Por favor verificar."}), 401
    
    if not check_password_hash(userFound.password, password):
        return jsonify({"msg": "Email/Password son incorrectos. Por favor verificar."}), 401

    expires = datetime.timedelta(hours=3)
    access_token = create_access_token(identity=userFound.id, expires_delta=expires)

    datos = {
        "access_token": access_token,
        "user": userFound.serialize()
    }

    return jsonify(datos), 200

    

@app.route('/api/register', methods=['POST'])
def register():

    # Capturar los valores para crear al usuario
    email = request.json.get('email')
    password = request.json.get('password')

    if not email:
        return jsonify({"msg": "Email es obligatorio!"}), 400
    if not password:
        return jsonify({"msg": "Password es obligatorio!"}), 400
    
    userFound = User.query.filter_by(email=email).first()

    if userFound:
        return jsonify({"msg": "Email ya se encuentra en uso."}), 400
    
    user = User(email=email, password=generate_password_hash(password))
    user.save()

    if user:
        expires = datetime.timedelta(hours=3)
        access_token = create_access_token(identity=user.id, expires_delta=expires)

        datos = {
            "access_token": access_token,
            "user": user.serialize()
        }

        return jsonify(datos), 200

    else:
        return jsonify({ "error": "No se pudo registrar el usuario, por favor intente mas tarde."}), 422


@app.route('/api/todos', methods=['GET'])
@jwt_required() # Ruta Privada
def get_todos():

    current_user = get_jwt_identity()

    # todos = Task.query.all() # Consultando todas las tareas [<Task 1>, <Task 2>]
    todos = Task.query.filter_by(users_id=current_user).all()
    #todos = list(map(lambda task: task.serialize(), todos)) # [{"id": 1, "description": "comprar pan", "done": False }]
    todos = [task.serialize() for task in todos] # [{"id": 1, "description": "comprar pan", "done": False }]

    return jsonify(todos), 200

@app.route('/api/todos', methods=['POST'])
@jwt_required() # Ruta Privada
def add_task():

    current_user = get_jwt_identity() # 1 

    description = request.json.get('description')
    done = request.json.get('done', False)
    users_id = request.json.get('users_id')

    if not description:
        return jsonify({"message": "Description is required!"}), 400
    
    task = Task()
    task.description = description
    task.done = done
    task.users_id = current_user if not users_id else users_id 
    task.save()

    if not task:
        return jsonify({"error": "Please try again later"}), 422

    datos = {
        "success": "Task created successfully",
        "task": task.serialize()
    }
    
    return jsonify(datos), 201

@app.route('/api/todos/<int:id>', methods=['DELETE'])
@jwt_required() # Ruta Privada
def delete_task(id):

    # Usuario actual o activo
    current_user = get_jwt_identity() # obtenemos el identificador del usuario del token

    # task = Task.query.get(id)
    task = Task.query.filter_by(id=id).first()

    if not task:
        return jsonify({"message": f"Task {id} not found!"}), 404
    
    if task.users_id != current_user:
        return jsonify({"message": f"La tarea {id} no puede ser eliminar porque no es el dueño."}), 400
    
    task.delete()

    return jsonify({"success": f"Task {id} was deleted!"}), 200

@app.route('/api/todos/<int:id>', methods=['PUT'])
@jwt_required() # Ruta Privada
def complete_task(id):

    # Usuario actual o activo
    current_user = get_jwt_identity() # obtenemos el identificador del usuario del token

    # task = Task.query.get(id)
    task = Task.query.filter_by(id=id).first()

    if not task:
        return jsonify({"message": f"Task {id} not found!"}), 404

    if task.users_id != current_user:
        return jsonify({"message": f"La tarea {id} no puede ser completada, porque no es el dueño."}), 400
    
    task.done = True
    task.update()

    return jsonify({ "success": f"Task {id} was updated!"}), 200


with app.app_context() as context:
    db.create_all()


if __name__ == '__main__':
    app.run()