import Estudiante from ".../models/Estudiante.js"
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailler.js"


const registro = async (req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
        const estudianteEmailBDD = await Estudiante.findOne({email})

    if(estudianteEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
        const nuevoEstudiante = await Estudiante(req.body)
    
    //nuevoEstudiante.password = await nuevoEstudiante.encrypPassword(password)

    const token = nuevoEstudiante.crearToken()
    await sendMailToRegister(email,token)

    await estudianteBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})

}

const confirmarMail = async (req,res)=>{
    if (!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    
    //2
    const estudianteBDD = await Estudiante.findOne({token:req.params.token})

    if(!estudianteBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    //3
    estudianteBDD.token = null
    estudianteBDD.confirmEmail=true
    await estudianteBDD.save()

    //4
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"})
}

const recuperarPassword = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const estudianteBDD = await Estudiante.findOne({email})
    if(!estudianteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = estudianteBDD.crearToken()
    estudianteBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await estudianteBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}


const comprobarTokenPasword = async (req,res)=>{
    const {token} = req.params
    const estudianteBDD = await Estudiante.findOne({token})
    if(estudianteBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await estudianteBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}


const crearNuevoPassword = async (req,res)=>{
    //1
    const {password, confirmpassword} = req.body
    
    //2
    if(Object.values(req.body).includes("")) return res.status(404).json({msg: "Lo sentimos,debes llenar todos los campos"})

    if(password !== confirmpassword) return res.status(404).json({msg: "Lo sentimos,los password no cinciden"})

    const estudianteBDD = await Estudiante.findOne({token:req.params.token})

    if(estudianteBDD.token !== req.params.token) return res.status(404).json({msg: "Lo sentimos, no se puede validar la cuenta"})

    //3 logica - dejando token nulo y encriptacion de contraseña
    estudianteBDD.token = null
    estudianteBDD.password = await estudianteBDD.encrypPassword(password)

    await estudianteBDD.save()

    //4

    res.status(200).json({msg: "Felicitaciones, ya puedes iniciar sesion con tu nuevo password"})

}



export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword
}
