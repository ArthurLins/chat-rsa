class ChatView {

    constructor(_elem) {

        this.elem = _elem;
        this.msg_me_template = '<div class="row message-bubble">' +
            '<p class="text-muted">{user}</p>' +
            '<p>{msg}</p>' +
            '</div>'
        this.msg_template = '<div class="row message-bubble reversed">' +
            '<p class="text-muted">{user}</p>' +
            '<p>{msg}</p>' +
            '</div>'

        this.onSend = (msg) => {}
        this._bindUIEvents();
    }

    _bindUIEvents() {
        var self = this;
        $(".send-msg").click(() => {
            var msg = $(".msg-text").val();
            $(".msg-text").val("");
            self.addMeMessage(msg);
            self.onSend(msg);
        })
    }

    _scrollDown() {
        $(this.elem).scrollTop($(this.elem)[0].scrollHeight);
    }

    addMeMessage(msg) {
        $(this.elem).append(this.msg_me_template.replace("{user}", "Você").replace("{msg}", msg));
        this._scrollDown();
    }

    addMessage(name, msg) {
        $(this.elem).append(this.msg_template.replace("{user}", name).replace("{msg}", msg));
        this._scrollDown();
    }

}