module.exports = {
    // Helper to check equality
    if_eq: function(a, b, opts) {
        if (a == b) {
            return opts.fn(this);
        } else {
            return opts.inverse(this);
        }
    },
    // Helper to create a list for loops
    list: function() {
        return Array.prototype.slice.call(arguments, 0, -1);
    }
};