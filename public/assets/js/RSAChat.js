class RSAChat {

    constructor(_ChatView) {

        if (!(_ChatView instanceof ChatView)) {
            return;
        }

        this.ui = _ChatView;

        this.chaves = {};
        this.jsencrypt = new JSEncrypt({
            default_key_size: 512
        })

        this.my_public_key = this.jsencrypt.getPublicKey()
        this.my_private_key = this.jsencrypt.getPrivateKey()

        console.log("[🔑] Chave publica criada: \n" + this.my_public_key)
        console.log("[🔑] Chave privada criada: \n" + this.my_private_key)

        this.socket = io({
            transports: ['websocket']
        });
        this._bindSocketEvents();
        this._bindViewEvents();

    }

    sendMsg(msg) {
        var self = this;
        Object.entries(this.chaves).forEach(([id, chave]) => {
            self.jsencrypt.setPublicKey(chave);
            const payload = self.jsencrypt.encrypt(msg);
            self.socket.emit("message", {
                id: id,
                payload: payload
            });
                console.log("[⬆] Enviando para: "+id+" uma mensagem.\nConteudo: ["+payload+"]")
        });
    }

    _bindViewEvents() {
        var self = this;
        this.ui.onSend = (msg) => {
            self.sendMsg(msg);
        }
    }

    _bindSocketEvents() {
        var self = this;

        this.socket.on('connect', () => {
            console.log("[✅] Tunnel de comunicação conectado. Identificador: "+ this.socket.id)
            self.socket.emit("envia-chave-publica", self.my_public_key)
            console.log("[⬆] Enviando sua chave publica para o servidor.")
        });

        this.socket.on('chave-publica', () => {
            console.log("[⬇] Pedido de transmissão da chave publica")
            self.socket.emit("envia-chave-publica", self.my_public_key)
            console.log("[⬆] Enviando sua chave publica para o servidor.")
        })

        this.socket.on('recebe-chave-publica', (data) => {
            console.log("[⬇] Recebe a chave publica de: " + data.id);
            self.chaves[data.id] = data.chave_publica;
            console.log("[✅] Adiciona chave recebida na lista de chaves");
        })

        this.socket.on('exit', (data) => {
            console.log("[⬇] Recebe aviso que o usuário " + data.id + " saiu.");
            delete self.chaves[data.id];
            console.log("[✅] Remove a chave do usuário que saiu");
        });

        this.socket.on('message', (data) => {
            if (self.chaves[data.id] === undefined) {
                return
            }
            console.log("[⬇] Recebe mensagem criptografada de " + data.id + ".\n Conteudo: ["+data.msg+"]");
            self.jsencrypt.setPrivateKey(self.my_private_key);
            const result = self.jsencrypt.decrypt(data.msg)
            console.log("[✅] Descriptografa mensagem. \nResultado: ["+result+"]");
            this.ui.addMessage(data.id, result);
        });
    }

}