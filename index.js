const socketIO = require('socket.io')
const express = require('express');
const porta = process.env.PORT || 8080;

const app = express()
    .use(express.static('public'))
    .listen(porta, () => console.log(`Listening on ${ porta }`));

const io = socketIO(app);

/**
 * Quando o cliente se conectar
 */
io.on('connection', (socket) => {
    
    console.log(socket.id + ' conectado')

    /**
     * Emite a chave publica para todos os clientes conectados
     */
    socket.broadcast.emit('chave-publica')

    /**
     * Quando um novo cliente necessita da chave dos usuários já conectados.
     * chave = "RSA_CHAVE_PUBICA"
     */
    socket.on('envia-chave-publica', (chave)=>{
        socket.broadcast.emit("recebe-chave-publica", {id: socket.id, chave_publica: chave})
    })

    /**
     * Quando o cliente enviar a mensagem
     * data = {id:"ID_CLIENTE", msg: "MSG_ENCRIPTADO"}
     */
    socket.on('message', (data) => {
        //Verifica se o id está conectado.
        if (io.sockets.connected[data.id] === undefined){
            return;
        }

        //Envia mensagen encryptada para o respectivo destinatirario 
        io.sockets.connected[data.id].emit('message', { id: socket.id, msg: data.payload })
    })
    
    /**
     * Quando o cliente desconectar.
     */
    socket.on('disconnect', () => {
        socket.broadcast.emit('exit', {id: socket.id})
        console.log(socket.id + ' desconectado.')

    })
})
