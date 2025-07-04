import {Router} from 'express'
import { comprobarTokenPasword, confirmarMail, crearNuevoPassword, recuperarPassword, registro, login}  from '../controllers/administrador_controller.js'

const router = Router()

router.post('/registro',registro)

router.get('/confirmar/:token',confirmarMail)

router.post('/login',login)



router.post('/recuperarpassword',recuperarPassword)
router.get('/recuperarpassword/:token',comprobarTokenPasword)
router.post('/nuevopassword/:token',crearNuevoPassword)




export default router