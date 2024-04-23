import React, { useContext } from 'react'
import { Context } from '../store/AppContext'

const LoginForm = () => {

    const { store, actions } = useContext(Context)

    return (
        <div className="w-50 mx-auto my-5">
            <form onSubmit={actions.handleLogin}>
                <div className="form-group mb-3">
                    <label htmlFor="login_email" className="form-label">Email:</label>
                    <input type="email" className="form-control" id="login_email" name="email" placeholder='user@domain.ext' value={store?.email} onChange={actions.handleChange} />
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="login_password" className="form-label">Password:</label>
                    <input type="password" className="form-control" id="login_password" name="password" placeholder='********' value={store?.password} onChange={actions.handleChange} />
                </div>
                <button className="btn btn-sm btn-primary w-100">
                    Login
                </button>
            </form>
        </div>
    )
}

export default LoginForm