const removeSplChar = (val, isNumber) => {
    val = val ? val.replace(/[^\w\s]/gi, '') : null;
    if (isNumber && val) {
        val = Number(val);
    }
    return val;
}

const weightType = (string) => {
    if (string) {
        const splt = string.split(' ');
        if (splt.length === 2) {
            return {
                weight: Number(splt[0]),
                type: splt[1]
            };
        }
    }
}

const weightCalc = ({ weight, type }) => {
    if (type.indexOf('ounce') > -1) {
        return weight * 0.0283495;
    } else if (type.indexOf('pound') > -1) {
        return weight * 0.453592;
    } else {
        return weight;
    }
}

const removeBreaks = (txt) => txt.replace(/(\r\n|\n|\r)/gm, "");
module.exports = { removeSplChar, removeBreaks, weightType, weightCalc };