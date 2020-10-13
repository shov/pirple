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

    static array(array) {
        return Array.isArray(array);
    }

    static nonEmptyArray(array) {
        return Array.isArray(array) && array.length > 0;
    }

    static allowedString(str, allowedList) {
        return Validator.nonEmptyString(str) && allowedList.includes(str);
    }

    static wholeNumber(num, from = null, to = null) {
        let result = 'number' == typeof num && num % 1 === 0;

        if(!result) {
            return false;
        }

        if(null !== from) {
            result = result && num >= from
        }

        if(null !== to) {
            result = result && num <= to
        }

        return result
    }

    static undefined(value) {
        return 'undefined' === typeof value;
    }
};

module.exports = Validator;