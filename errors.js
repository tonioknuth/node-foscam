"use strict"
module.exports = class AdvancedError extends Error{
  constructor(type,message,details){
    super()
    this.type = type
    this.message = message
    if(details) this.details = details
  }
}
