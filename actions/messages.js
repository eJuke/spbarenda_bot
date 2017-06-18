let messages = {
    app: undefined,
    setApp: function(app) {
        this.app = app;
    },
    // Отображение сообщения в состоянии default
    defaultStatusReply: function(ctx, texts, uOption) {
        texts.forEach((item, i) => {
            if (i == texts.length - 1){
                var broadcast = (uOption.broadcast) ? '● Выключить трансляцию' : '○ Включить трансляцию';
                let keyboard = this.app.keyboard(
                    [
                        [broadcast],
                        ['⚙ Настройки']
                    ],
                    {
                        once: false,
                        resize: true
                    }
                )
                this.app.sendMessage(ctx.from.id, item, {markup: keyboard});
            }
            else ctx.reply.text(item);
        })
    },
    sendMessage: function(id, text) {
        this.app.sendMessage(id, text);
    },
    sendKeyboardMessage: function(id, text, keyboard){
        this.app.sendMessage(id, text, {markup: keyboard});
    },
    send: function(result) {

    }
}

module.exports = messages;