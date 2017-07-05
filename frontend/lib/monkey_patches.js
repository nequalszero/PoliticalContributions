Object.defineProperty(Array.prototype, "empty", {
  get: function empty() {
    return this.length === 0;
  }
})

Object.defineProperty(Array.prototype, "first", {
  get: function first() {
    return this[0];
  }
})

Object.defineProperty(Array.prototype, "second", {
  get: function second() {
    return this[1];
  }
})

Object.defineProperty(Array.prototype, "third", {
  get: function third() {
    return this[2];
  }
})

Object.defineProperty(Array.prototype, "last", {
  get: function last() {
    return this[this.length-1];
  }
})
