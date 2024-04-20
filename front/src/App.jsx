import React, { useEffect, useReducer, useState } from 'react'
import './App.css'

const reducer = (state, action) => {
    switch (action.type) {
        case 'LIST_TODOS':
            return { ...state, todos: action.payload }
        case 'ADD_TASK':
            return { ...state, todos: state.todos.concat(action.payload) }
        case 'COMPLETE_TASK':
            const task = state.todos.find((task) => task.id === action.payload)
            task.done = true
            return { ...state }

        case 'DELETE_TASK':
            return { ...state, todos: state.todos.filter(task => task.id !== action.payload) }

        default:
            return state;
    }
}

const App = () => {
    const [url] = useState('http://127.0.0.1:5000')

    const [state, dispatch] = useReducer(reducer, { todos: [{ id: 1, description: 'Comprar Pan', done: false }] })

    useEffect(() => {
        getTodos(`${url}/api/todos`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
    }, [])

    const handleKeyUp = e => {
        if (e.key === 'Enter' && e.target.value !== '') {
            let data = {
                description: e.target.value,
                done: false
            }
            let opcion = {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            addTask(`${url}/api/todos`, opcion)
            e.target.value = ""
        }
    }

    const handleClick = (task) => {
        let response = confirm(`Esta seguro que desea eliminar la tarea\n "${task.description}"?`)
        if (response) {
            let opcion = {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            deleteTask(`${url}/api/todos/${task.id}`, opcion, task.id)
        }
    }

    const handleComplete= (task) => {
        let response = confirm(`Esta seguro que desea completar la tarea\n "${task.description}"?`)
        if (response) {
            let opcion = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            completeTask(`${url}/api/todos/${task.id}`, opcion, task.id)
        }
    }

    const getTodos = (url = '', option = {}) => {
        fetch(url, option)
            .then((response) => response.json())
            .then((responseJson) => {
                dispatch({ type: 'LIST_TODOS', payload: responseJson })
            })
    }

    const addTask = (url = '', option = {}) => {
        fetch(url, option)
            .then((response) => response.json())
            .then((responseJson) => {
                dispatch({ type: 'ADD_TASK', payload: responseJson })
            })
    }

    const deleteTask = (url = '', option = {}, id) => {
        fetch(url, option)
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.success) {
                    dispatch({ type: 'DELETE_TASK', payload: id })
                }
            })
    }

    const completeTask = (url = '', option = {}, id) => {
        fetch(url, option)
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.success) {
                    dispatch({ type: 'COMPLETE_TASK', payload: id })
                }
            })
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12 py-3">
                    <div className="w-75 mx-auto">
                        <input type="search" name="task" id="task" className="form-control" placeholder='Insert Task...' onKeyUp={handleKeyUp} />
                    </div>
                </div>
                <div className="col-md-12">
                    <ul className="list-group w-75 mx-auto">
                        {
                            state.todos.length > 0 &&
                            state.todos.map((task) => {
                                return (
                                    <li key={task.id} className={'list-group-item list-group-item-action d-flex justify-content-between ' + (task.done ? 'ready' : 'pendient')}>
                                        <span>{task.description}</span>
                                        <span>
                                            <button className={'btn btn-sm mx-1 ' + (task.done ? 'btn-success disabled' : 'btn-primary')} onClick={() => handleComplete(task)}><i className="bi bi-check"></i></button>
                                            <button className='btn btn-sm btn-danger mx-1' onClick={() => handleClick(task)}><i className="bi bi-trash-fill"></i></button>
                                        </span>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
                <div className="col-md-12">
                    <div className="w-75 mx-auto">
                        <small>
                            {state.todos.length} Tareas en la lista.
                            Completadas({state.todos.reduce((total, task) => task.done ? total + 1 : total + 0, 0)})
                            Pendientes({state.todos.reduce((total, task) => task.done ? total + 0 : total + 1, 0)})
                        </small>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App