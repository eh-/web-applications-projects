"use strict";

(function() {
    const crypto = require("crypto");

    /**
     * Return a salted and hashed password entry from a clear text password.
     * @param {string} clearTextPassword
     * @return {object} passwordEntry where passwordEntry is an object with two
     * string properties:
     *    salt - The salt used for the password.
     *    hash - The sha1 hash of the password and salt.
     */
    const makePasswordEntry = function(clearTextPassword){
        const salt = crypto.randomBytes(8).toString('hex');

        return {
          salt: salt,
          hash: crypto.createHash("sha1").update(clearTextPassword + salt).digest('hex'),
        }
    };

    /**
     * Return true if the specified clear text password and salt generates the
     * specified hash.
     * @param {string} hash
     * @param {string} salt
     * @param {string} clearTextPassword
     * @return {boolean}
     */
    const doesPasswordMatch = function(hash, salt, clearTextPassword){
        const curr_hash = crypto.createHash("sha1").update(clearTextPassword + salt).digest('hex');
        return hash === curr_hash;
    };
    
    exports.makePasswordEntry = makePasswordEntry;
    exports.doesPasswordMatch = doesPasswordMatch;
})();