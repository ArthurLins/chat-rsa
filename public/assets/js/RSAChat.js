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

        this.socket = io("wss://chat-rsa.herokuapp.com:3000", {
            transports: ['websocket']
        });
        this._bindSocketEvents();
        this._bindViewEvents();

    }

    sendMsg(msg) {
        var self = this;
        Object.entries(this.chaves).forEach(([id, chave]) => {
            self.jsencrypt.setPublicKey(chave);
            self.socket.emit("message", {
                id: id,
                payload: self.jsencrypt.encrypt(msg)
            });
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
            self.socket.emit("envia-chave-publica", self.my_public_key);
        });

        this.socket.on('chave-publica', () => {
            self.socket.emit("envia-chave-publica", self.my_public_key);
        })

        this.socket.on('recebe-chave-publica', (data) => {
            self.chaves[data.id] = data.chave_publica;
        })

        this.socket.on('exit', (data) => {
            delete self.chaves[data.id];
        });

        this.socket.on('message', (data) => {
            if (self.chaves[data.id] === undefined) {
                return
            }
            self.jsencrypt.setPrivateKey(self.my_private_key);
            this.ui.addMessage(data.id, self.jsencrypt.decrypt(data.msg));
        });
    }

}