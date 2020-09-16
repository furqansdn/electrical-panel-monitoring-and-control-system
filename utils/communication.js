const { client } = require('../app');

class Communication {
  constructor(topic, message) {
    this.topic = topic;
    this.message = message;
  }

  subscribeIncoming() {
    client.subscribe(this.topic);
    return this;
  }

  listenIncoming(execute) {
    const _execute = execute;
    client.on('message', _execute);
  }

  publish() {
    client.publish(this.topic, this.message);
  }
}

module.exports = Communication;
