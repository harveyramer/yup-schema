import * as yup from 'yup';

export default class Rules {
    constructor(rules) {
        this.rules = rules
    }

    isRule(arg) {
        if (Array.isArray(arg) && Array.isArray(arg[0])) {
            return true;
        }

        return false;
    }

    handleObject(obj) {
        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }

            obj[key] = this.isRule(obj[key]) ? new Rules(obj[key]).toYup() : obj[key]
        }

        return obj
    }

    processArgs(args) {
        return args.map(arg => {
            if (typeof arg === 'object' && !Array.isArray(arg)) {
                return this.handleObject(arg)
            } else if (this.isRule(arg)) {
                return new Rules(arg).toYup()
            }

            return arg;
        })
    }

    toYup() {
        var rules = [...this.rules];
        let type = rules.shift()[0]
        if (!type || !yup[type]) {
            throw new Error('Type ' + type + ' does not exist');
        }

        var yupRule = yup[type]();
        rules.forEach(rule => {
            let fn = rule.shift();
            if (!fn || !yupRule[fn]) {
                throw new Error('Method ' + fn + ' does not exist');
            }

            let args = this.processArgs(rule);
            yupRule = yupRule[fn](...args)
        })

        return yupRule
    }
}
