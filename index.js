const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000
const http = require('http');
const bcrypt = require('bcrypt');
app.use(express.static(path.resolve(__dirname, './')));
app.use(express.json()) 
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-credentials", true);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, UPDATE");
    next();
});
const Datastore = require('nedb');
const users = new Datastore({filename : './server/orders', autoload: true });
users.loadDatabase();
app.post('/register', function(request, response){  
     try {
        const {email, password, name, phone, desired, orderMass} = request.body;
        users.findOne({email: email}, function(err, doc) { 
            if (doc) {
                return response.status(400).json( {message: "Пользователь с таким email уже существует"})
            } else{
                const hashPassword = bcrypt.hashSync(password, 7);
                users.insert({email, password: hashPassword, name, phone, desired, orderMass});
                response.json({email, password: hashPassword, name, phone, desired , orderMass});
            }
            return response.status(500).json({err: "ОШИБКА", server: request.body})
        }); 
    } catch (e) {
        console.log(e);
        return response.status(500).json({err: "ОШИБКА в catch", server: request.body})
    }
});
app.post('/login', (request, response)=>{
    try {
        const {email, password} = request.body;
        console.log(request.body)
        users.findOne({email: email},function(err, doc) { 
            if (doc) {
                const validPassword = bcrypt.compareSync(password, doc.password)
                if (!validPassword) {
                    return response.status(400).json( {message:`Введен неверный пароль`}) 
                } else{
                    response.json({doc})
                }
            } else if (!doc){
                return response.status(400).json({message: "Пользователь с таким email не существует"})
            }
            return response.status(500).json({err: "ОШИБКА", server: request.body})
        }); 
    } catch (e) {
        console.log(e);
        return response.status(500).json({err: "ОШИБКА в catch", server: request.body})
    }
})
app.post('/adminLogin', (request, response)=>{
    try {
        const {email, password} = request.body;
        users.findOne({email: email},function(err, doc) { 
            if (doc) {
                const validPassword = bcrypt.compareSync(password, doc.password)
                if (!validPassword) {
                    return response.status(400).json( {message: `Введен неверный пароль`})
                } else{
                    response.json(doc.email)
                }
            }
            return response.status(500).json({err: "ОШИБКА", server: request.body})
        });  
    } catch (e) {
        console.log(e);
        return response.status(500).json({err: "ОШИБКА в catch", server: request.body})
    }
})
app.post('/bag', (request, response)=>{
    try {
        const {email,orderMass } = request.body;
        users.findOne({email: email},function(err, doc) { 
            if (doc) {
                doc.orderMass = orderMass 
                response.json({doc})
                users.update({email: email}, {email: email, password: doc.password, name: doc.name, phone: doc.phone, desired: [], orderMass: orderMass}, {});
                users.loadDatabase();
            }
            return response.status(500).json({err: "ОШИБКА", server: request.body})
        }); 
    } catch (e) {
        console.log(e);
        return response.status(500).json({err: "ОШИБКА в catch", server: request.body})
    }

})
app.post('/getFullOrderLoginAdmin', (request, response)=>{
    try {
        users.findOne({email: request.body.email},function(err, doc) { 
            if (doc) {
                response.json( {message: 'ok'})
                users.update({email: request.body.email}, {email: request.body.email, password: doc.password, name: doc.name, phone: doc.phone, desired: doc.desired, orderMass: request.body}, {});
                users.loadDatabase();
            }
            return response.status(500).json({err: "ОШИБКА", server: request.body})
        }); 
    } catch (e) {
        console.log(e);
        return response.status(500).json({err: "ОШИБКА в catch", server: request.body})
    }

})
app.get('/overwriteMassAdmin', (request, response)=>{
    try {
        users.find({},function(err, doc) { 
            if (doc) {
                response.json({doc})
            }
            return response.status(500).json({err: "ОШИБКА", server: request.body})
        }); 
    } catch (e) {
        console.log(e);
        return response.status(500).json({err: "ОШИБКА в catch", server: request.body})
    }

})
app.post('/overwriteMass', (request, response)=>{
    try {
        users.findOne({email:request.body},function(err, doc) { 
            if (doc) {
                response.json({doc})
            }
            return response.status(500).json({err: "ОШИБКА", server: request.body})
        }); 
    } catch (e) {
        console.log(e);
        return response.status(500).json({err: "ОШИБКА в catch", server: request.body})
    }

})

const start = async ()=>{
try {
    app.listen(PORT, ()=>{
        console.log(`start to http://localhost:${PORT}`);
    })
} 
    catch(e){
    console.log(e);
    }
}
start()
