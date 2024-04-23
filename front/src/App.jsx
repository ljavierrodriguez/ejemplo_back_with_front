import React, { useContext, useEffect, useReducer, useState } from 'react'
import './App.css'
import injectContext, { Context } from './store/AppContext'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import { ToastContainer, toast } from 'react-toastify';

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

    const { store, actions } = useContext(Context)

    const [url] = useState('http://127.0.0.1:5000')

    const [state, dispatch] = useReducer(reducer, { todos: [{ id: 1, description: 'Comprar Pan', done: false }] })

    useEffect(() => {
        if (store?.access_token !== null) {
            getTodos(`${url}/api/todos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${store?.access_token}`
                }
            })
        }
    }, [store.access_token])

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
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${store?.access_token}`
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
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${store?.access_token}`
                }
            }
            deleteTask(`${url}/api/todos/${task.id}`, opcion, task.id)
        }
    }

    const handleComplete = (task) => {
        let response = confirm(`Esta seguro que desea completar la tarea\n "${task.description}"?`)
        if (response) {
            let opcion = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${store?.access_token}`
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
                if(responseJson.success){
                    toast.success(responseJson.success)
                    dispatch({ type: 'ADD_TASK', payload: responseJson.task })
                }
            })
    }

    const deleteTask = (url = '', option = {}, id) => {
        fetch(url, option)
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.success) {
                    toast.success(responseJson.success)
                    dispatch({ type: 'DELETE_TASK', payload: id })
                }else{
                    toast.warning(responseJson.message)
                }
            })
    }

    const completeTask = (url = '', option = {}, id) => {
        fetch(url, option)
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.success) {
                    toast.success(responseJson.success)
                    dispatch({ type: 'COMPLETE_TASK', payload: id })
                }else{
                    toast.warning(responseJson.message)
                }
            })
    }

    return (
        <>

            <div className="container">
                <div className="row">
                    {
                        !!store.access_token ? (
                            <>
                                <div className="col-md-12 py-3">
                                    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                                        <div className="container-fluid">
                                            <a className="navbar-brand" href="#">APP Todos</a>
                                            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                                <span className="navbar-toggler-icon"></span>
                                            </button>
                                            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                                <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                                                    <li className="nav-item dropdown">
                                                        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                            {store?.current_user?.email}
                                                        </a>
                                                        <ul className="dropdown-menu dropdown-menu-end">
                                                            <li><button className="dropdown-item" onClick={actions.logout}>Logout</button></li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </nav>
                                </div>
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
                                                        <span>{task.description} - {task?.user?.email}</span>
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
                            </>
                        ) : (
                            <>
                                <div className="col-md-12">
                                    <div className="w-75 mx-auto my-5">
                                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link active" id="login-tab" data-bs-toggle="tab" data-bs-target="#login-tab-pane" type="button" role="tab" aria-controls="login-tab-pane" aria-selected="true">Login</button>
                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="nav-link" id="register-tab" data-bs-toggle="tab" data-bs-target="#register-tab-pane" type="button" role="tab" aria-controls="register-tab-pane" aria-selected="false">Register</button>
                                            </li>
                                        </ul>
                                        <div className="tab-content" id="myTabContent">
                                            <div className="tab-pane fade show active" id="login-tab-pane" role="tabpanel" aria-labelledby="login-tab" tabIndex="0">
                                                <LoginForm />
                                            </div>
                                            <div className="tab-pane fade" id="register-tab-pane" role="tabpanel" aria-labelledby="register-tab" tabIndex="0">
                                                <RegisterForm />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    }
                </div>
            </div>
            <ToastContainer />
        </>
    )
}

export default injectContext(App)