class DemoSocket {
  constructor() {
    this.handlers = {};
    this.connected = false;
    this._start();
  }

  _start() {
    // simulate async connection
    setTimeout(() => {
      this.connected = true;
      this._emitLocal('connect');
    }, 250);

    // periodic simulated presence updates and typing events
    this._presenceInterval = setInterval(() => {
      const userId = Math.floor(Math.random() * 5) + 2; // random demo ids
      this._emitLocal('presence:update', { userId, status: Math.random() > 0.5 ? 'online' : 'offline' });
    }, 7000);

    this._typingInterval = setInterval(() => {
      const threadId = `thread_${Math.floor(Math.random() * 3) + 1}`;
      const userId = Math.floor(Math.random() * 5) + 2;
      this._emitLocal('typing:started', { threadId, userId });
      setTimeout(() => this._emitLocal('typing:stopped', { threadId, userId }), 2500 + Math.random() * 3000);
    }, 9000);
  }

  _emitLocal(event, data) {
    const list = this.handlers[event] || [];
    list.forEach((h) => h(data));
  }

  on(event, handler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (!this.handlers[event]) return;
    this.handlers[event] = this.handlers[event].filter((h) => h !== handler);
  }

  emit(event, data) {
    // Immediately call local handlers (simulate loopback)
    this._emitLocal(event, data);
    // Also simulate a server-side broadcast for some events
    if (event === 'message:send') {
      setTimeout(() => {
        this._emitLocal('message:received', { ...data, id: `msg_${Date.now()}` });
      }, 400 + Math.random() * 800);
    }
  }

  disconnect() {
    this.connected = false;
    clearInterval(this._presenceInterval);
    clearInterval(this._typingInterval);
    this._emitLocal('disconnect', 'client');
  }

  connect() {
    if (!this.connected) {
      this.connected = true;
      this._emitLocal('connect');
    }
  }
}

export default DemoSocket;
