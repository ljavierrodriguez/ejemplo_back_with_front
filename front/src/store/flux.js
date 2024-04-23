import { toast } from "react-toastify"

const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            url: 'http://127.0.0.1:5000',
            email: '',
            password: '',
            current_user: null,
            access_token: null,
        },
        actions: {
            handleChange: (e) => {
                const { name, value } = e.target
                setStore({
                    [name]: value
                })
            },
            handleLogin: (e) => {
                e.preventDefault()
                const { email, password } = getStore();
                const { login } = getActions()

                login({ email, password })

            },
            handleRegister: (e) => {
                e.preventDefault()
                const { email, password } = getStore();
                const { register } = getActions()

                register({ email, password })
            },
            checkCurrentUser: () => {
                if (sessionStorage.getItem('access_token')) {
                    setStore({
                        access_token: sessionStorage.getItem('access_token'),
                        current_user: JSON.parse(sessionStorage.getItem('current_user'))
                    })
                }
            },
            login: async (credenciales) => {
                try {
                    const { url } = getStore()
                    const option = {
                        method: 'POST',
                        body: JSON.stringify(credenciales),
                        headers: {
                            'Content-type': 'application/json'
                        }
                    }

                    const response = await fetch(`${url}/api/login`, option)
                    const datos = await response.json()

                    if (datos.msg) {
                        console.log(datos)
                        toast.error(datos.msg)
                    } else {
                        console.log(datos)
                        const { access_token, user } = datos
                        setStore({
                            access_token: access_token,
                            current_user: user,
                            email: '',
                            password: ''
                        })
                        sessionStorage.setItem('access_token', access_token)
                        sessionStorage.setItem('current_user', JSON.stringify(user))
                    }

                } catch (error) {
                    console.log(error.message)
                }

            },
            register: async (credenciales) => {
                try {
                    const { url } = getStore()
                    const option = {
                        method: 'POST',
                        body: JSON.stringify(credenciales),
                        headers: {
                            'Content-type': 'application/json'
                        }
                    }

                    const response = await fetch(`${url}/api/register`, option)
                    const datos = await response.json()

                    if (datos.msg) {
                        console.log(datos)
                        toast.error(datos.msg)
                    } else {
                        console.log(datos)
                        const { access_token, user } = datos
                        setStore({
                            access_token: access_token,
                            current_user: user,
                            email: '',
                            password: ''
                        })
                        sessionStorage.setItem('access_token', access_token)
                        sessionStorage.setItem('current_user', JSON.stringify(user))
                    }

                } catch (error) {
                    console.log(error.message)
                }

            },
            logout: () => {
                if (sessionStorage.getItem('access_token')) {
                    setStore({
                        access_token: null,
                        current_user: null,
                        email: '',
                        password: ''
                    })
                    sessionStorage.removeItem('access_token')
                    sessionStorage.removeItem('current_user')
                }
            },
        }
    }
}

export default getState