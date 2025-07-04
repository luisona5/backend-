import Director from "../models/Director.js"
import { sendMailToRegister, sendMailToRecoveryPassword } from "../config/nodemailler.js"


const registro = async (req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
        const directorEmailBDD = await Director.findOne({email})

    if(directorEmailBDD) return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
        const nuevoDirector = await Director(req.body)
    
    //nuevoDirector.password = await nuevoDirector.encrypPassword(password)

    const token = nuevoDirector.crearToken()
    await sendMailToRegister(email,token)

    await nuevoDirector.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})

}

const confirmarMail = async (req,res)=>{
    if (!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    
    //2
    const directorBDD = await Director.findOne({token:req.params.token})

    if(!directorBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    //3
    directorBDD.token = null
    directorBDD.confirmEmail=true
    await directorBDD.save()

    //4
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"})
}

const recuperarPassword = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const directorBDD = await Director.findOne({email})
    if(!directorBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = directorBDD.crearToken()
    directorBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await directorBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}


const comprobarTokenPasword = async (req,res)=>{
    const {token} = req.params
    const directorBDD = await Director.findOne({token})
    if(directorBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await directorBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}


const crearNuevoPassword = async (req,res)=>{
    //1
    const {password, confirmpassword} = req.body
    
    //2
    if(Object.values(req.body).includes("")) return res.status(404).json({msg: "Lo sentimos,debes llenar todos los campos"})

    if(password !== confirmpassword) return res.status(404).json({msg: "Lo sentimos,los password no cinciden"})

    const directorBDD = await Director.findOne({token:req.params.token})

    if(directorBDD.token !== req.params.token) return res.status(404).json({msg: "Lo sentimos, no se puede validar la cuenta"})

    //3 logica - dejando token nulo y encriptacion de contraseña
    directorBDD.token = null
    directorBDD.password = await directorBDD.encrypPassword(password)

    await directorBDD.save()

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
