class Validator {
    static nonEmptyString(str) {
        return 'string' === typeof str && str.trim().length > 0;
    };

    static object(obj) {
        return 'object' === typeof obj;
    };

    static keyInObject(key, obj) {
        return 'object' === typeof obj && key in obj;
    };

    static boolean(bool) {
        return 'boolean' === typeof bool;
    };
};

module.exports = Validator;