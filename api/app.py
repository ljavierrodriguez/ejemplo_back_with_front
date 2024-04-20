from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Task

app = Flask(__name__)
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'

db.init_app(app)
CORS(app)

@app.route('/')
def main():
    return jsonify({ "message": "API REST Flask"}), 200

@app.route('/api/todos', methods=['GET'])
def get_todos():

    todos = Task.query.all() # Consultando todas las tareas [<Task 1>, <Task 2>]
    #todos = list(map(lambda task: task.serialize(), todos)) # [{"id": 1, "description": "comprar pan", "done": False }]
    todos = [task.serialize() for task in todos] # [{"id": 1, "description": "comprar pan", "done": False }]

    return jsonify(todos), 200

@app.route('/api/todos', methods=['POST'])
def add_task():
    description = request.json.get('description')
    done = request.json.get('done', False)

    if not description:
        return jsonify({"message": "Description is required!"}), 400
    
    task = Task(description=description, done=done)
    #task.description = description
    #task.done = done
    task.save()

    if not task:
        return jsonify({"error": "Please try again later"}), 422
    
    return jsonify(task.serialize()), 201

@app.route('/api/todos/<int:id>', methods=['DELETE'])
def delete_task(id):

    # task = Task.query.get(id)
    task = Task.query.filter_by(id=id).first()

    if not task:
        return jsonify({"message": f"Task {id} not found!"}), 404
    
    task.delete()

    return jsonify({"success": f"Task {id} was deleted!"}), 200

@app.route('/api/todos/<int:id>', methods=['PUT'])
def complete_task(id):
    # task = Task.query.get(id)
    task = Task.query.filter_by(id=id).first()

    if not task:
        return jsonify({"message": f"Task {id} not found!"}), 404
    
    task.done = True
    task.update()

    return jsonify({ "success": f"Task {id} was updated!"}), 200


with app.app_context() as context:
    db.create_all()


if __name__ == '__main__':
    app.run()