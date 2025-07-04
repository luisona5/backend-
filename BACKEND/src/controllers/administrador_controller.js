import Administrador from "../models/Administrador.js"
import { sendMailToRegister, sendMailToRecoveryPassword} from "../config/nodemailler.js"
import { crearTokenJWT } from "../middlewares/JWT.js"
import mongoose from "mongoose"



const registro = async (req,res)=>{

    const {email,password} = req.body
    console.log('📥 req.body:', req.body); 
    
    //2
    if (Object.values(req.body).includes(" ")) 
        return res.status(400).json({msg:"Lo sentimos, debes llenar todos los campos"})
    
    const administradorEmailBDD = await Administrador.findOne({email})

    if(administradorEmailBDD) 
        return res.status(400).json({msg:"Lo sentimos, el email ya se encuentra registrado"})
    
    
    //3    
    const nuevoAdministrador = await Administrador(req.body)
    
    nuevoAdministrador.password = await nuevoAdministrador.encrypPassword(password)

    const token = nuevoAdministrador.crearToken()

    await sendMailToRegister(email,token)

    await nuevoAdministrador.save()
    //4
    res.status(200).json({msg:"Revisa tu correo electrónico para confirmar tu cuenta"})

}

const confirmarMail = async (req,res)=>{
    //1
    
    
    if (!(req.params.token)) return res.status(400).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    //2
    const administradorBDD = await Administrador.findOne({token:req.params.token})

    if(!administradorBDD?.token) return res.status(404).json({msg:"La cuenta ya ha sido confirmada"})
    //3
    administradorBDD.token = null
    administradorBDD.confirmEmail=true
    await administradorBDD.save()
    //4
    res.status(200).json({msg:"Token confirmado, ya puedes iniciar sesión"})
}

// RECUPERAR CONTRASEÑA

const recuperarPassword = async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const administradorBDD = await Administrador.findOne({email})
    if(!administradorBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = administradorBDD.crearToken()
    administradorBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await administradorBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}


const comprobarTokenPasword = async (req,res)=>{
    const {token} = req.params
    const administradorBDD = await Administrador.findOne({token})
    if(administradorBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await administradorBDD.save()
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}


const crearNuevoPassword = async (req,res)=>{
    //1
    const {password, confirmpassword} = req.body;
    const { token } = req.params;
    
    //2
    if(Object.values(req.body).includes("")) 
        return res.status(404).json({msg: "Lo sentimos,debes llenar todos los campos"})

    if(password !== confirmpassword) 
        return res.status(404).json({msg: "Lo sentimos,los password no cinciden"})

    const administradorBDD = await Administrador.findOne({token:req.params.token})

    //if(administradorBDD.token !== req.params.token) return res.status(404).json({msg: "Lo sentimos, no se puede validar la cuenta"})
    if(!administradorBDD) 
        return res.status(404).json({msg: "Lo sentimos, no se puede validar la cuenta"})

    //3 logica - dejando token nulo y encriptacion de contraseña
    administradorBDD.token = null
    administradorBDD.password = await administradorBDD.encrypPassword(password)

    await administradorBDD.save()

    //4
    res.status(200).json({msg: "Felicitaciones, ya puedes iniciar sesion con tu nuevo password"})

}


const login = async(req,res)=>{
    const {email,password} = req.body;
    if (Object.values(req.body).includes("")) 
        return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
        
    const administradorBDD = await Administrador.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
    
    if(administradorBDD?.confirmEmail===false) 
        return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})
    
    if(!administradorBDD) 
        return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    
    const verificarPassword = await administradorBDD.matchPassword(password)


    if(!verificarPassword) 
        return res.status(401).json({msg:"Lo sentimos, el password no es el correcto"})
    
    const {nombre,apellido,celular,_id,rol} = administradorBDD
    
    res.status(200).json({
        token,
        nombre,
        apellido,
        celular,
        _id,
        rol
    })
}

export {
    registro,
    confirmarMail,
    recuperarPassword,
    comprobarTokenPasword,
    crearNuevoPassword,
    login
}
