
const inicioDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db');
//linea requerida para comenzar a trabajar con express
const express = require('express');
//instanciar express
const app = express();

//para cargar a config
const config = require('config');
///
//////Configuracion de entornos//////////////
console.log('Aplicacion: '+config.get('nombre'));
console.log('BD server: '+config.get('configDB.host'));

//invocamos a morgan
const morgan = require('morgan');


//Se requiere por que vamos a suar datos con formato json
app.use(express.json())
app.use(express.urlencoded({extend:true}));


//servivios o recursos estaticos
app.use(express.static('public'));

//Para que nos ayude a hacer validaciones
const Joi = require('@hapi/joi');

//Uso de un diddleware de terceros -Morgan
if(app.get('env')=== 'development'){
    app.use(morgan('tiny'));
    //console.log('morgan habilidado');
    inicioDebug('Morgan esta habilitado');
}

///Trabajos con la base de datos
dbDebug('Conectando con la base de datos')



//Inicar a la app, cuales son los metodos que puedo implementar
//indicar las rutas '/' oficial del servidor web
app.get('/', (req, res)=>{
    res.send('Hola mundo desde express');
}); //peticion

app.get('/api/usuarios', (req, res) =>{
    res.send(usuarios)
})



//app.post(); //envio de datos
///app.put(); //actualizacion
//app.delete();  //borrar

//Creando data en codigo
const usuarios =[ 
    {id:1, nombre:'Marcos'},
    {id:2, nombre:'Ale'},
    {id:3, nombre:'Capu'},
]
app.get('/api/usuarios/:id',(req, res) => {
    let usuario = existeUsuario(req.params.id);
    if(!usuario) res.status(404).send('El usuario no fue encontrado');
    res.send(usuario);
    
});

//Enviando parametros
/* app.get('/api/usuarios/:year/:mes',(req, res) => {
    res.send(req.params);
}); */

//PARAMETROS query
/* app.get('/api/usuarios/:year/:mes',(req, res) => {
    res.send(req.query);
}); */

//Vamos a guardar datos
app.post('/api/usuarios',(req, res)=>{
    //Validacion con joi
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    const {error, value} = validarUsuario(req.body.nombre);
   if(!error){
        const usuario = {
        id: usuarios.length +1,
        nombre: value.nombre
    };
    usuarios.push(usuario);
    res.send(usuario);
   }else{
       const mensaje = error.details[0].message;
       res.status(400).send(mensaje);
   }
    //validacion sencilla
    /* if(!req.body.nombre || req.body.nombre.length <= 2){
        res.status(400).send('Debe ingresar un nombre  que tenga minimo 3 caracteres');
        return;
    }

    const usuario = {
        id: usuarios.length +1,
        nombre: req.body.nombre
    };
    usuarios.push(usuario);
    res.send(usuario); */
});

//Modificaciones 

app.put('/api/usuarios/:id', (req, res) =>{
    //Encontrar si existe el usuario
    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = existeUsuario(req.params.id)
    if(!usuario){ 
        res.status(404).send('El usuario no fue encontrado');
        return;
    }

    //Validacion
    const {error, value} = validarUsuario(req.body.nombre);
   if(error){
       const mensaje = error.details[0].message;
       res.status(400).send(mensaje);
       return;
   }
   usuario.nombre = value.nombre;
   res.send(usuario)

});

app.delete('/api/usuarios/:id', (req, res)=>{
    let usuario = existeUsuario(req.params.id)
    if(!usuario){ 
        res.status(404).send('El usuario no fue encontrado');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);
    res.send(usuarios);
});

//Crando una variable de entorno para un puerto
//process.env.PORT ---Esto peertenece a node
const port = process.env.PORT || 3000

//Indicamos el puerto
app.listen(port,()=>{
    console.log(`Escuchando en el puerto ${port}...`);
});

//metodo para verificar si existe un usuario
function existeUsuario(id){
    return(usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    return (schema.validate({ nombre:nom}));
    
}