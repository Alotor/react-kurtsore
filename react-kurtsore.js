var _ = require("lodash"),
    k = require("kurtsore"),
    Immutable = require("immutable");
;

// ================================================================================
// Mixins

var blacklistedProps = ['static', 'children'];


var CursorPropsMixin = {
    shouldComponentUpdate: function(props, state){
        var currentProps = _.omit(this.props, blacklistedProps),
            nextProps = _.omit(props, blacklistedProps);

        var mutableCurrentProps = _.transform(currentProps, nonCursorValues),
            mutableNextProps = _.transform(nextProps, nonCursorValues);

        // Are there different mutable props?
        if (isDifferent(_.keys(mutableCurrentProps), _.keys(mutableNextProps))){
            return true;
        }

        // Have the mutable props changed?
        if (isDifferent(mutableCurrentProps, mutableNextProps, equalsCustomizer)){
            return true;
        }

        var currentCursorProps = _.transform(currentProps, cursorValues),
            nextCursorProps = _.transform(nextProps, cursorValues);

        // Are there different cursors?
        if (isDifferent(_.keys(currentCursorProps), _.keys(nextCursorProps))){
            return true;
        }

        var oldAndNewCursors = _.map(_.keys(currentCursorProps), function(k){
            return [currentCursorProps[k], nextCursorProps[k]];
        });

        // Has any of the cursor snapshots changed?
        if (_.any(oldAndNewCursors, cursorShouldUpdate)) {
            return true;
        }

        // Has the local state changed?
        if (isDifferent(this.state, state)){
            return true;
        }

        return false;
    }
};

// ================================================================================
//  Helpers

var isDifferent = _.negate(_.isEqual);

function collectObjectValuesIf(pred){
    return function(acc, v, k){
        if (pred(v)){
            acc[k] = v;
            return acc;
        }
        return acc;
    };
};

var cursorValues = collectObjectValuesIf(k.isCursor),
    nonCursorValues = collectObjectValuesIf(_.negate(k.isCursor));

function cursorShouldUpdate(cursors){
    var oldC = cursors[0],
        newC = cursors[1];
    return !oldC.hasSameSnapshot(newC);
};

function equalsCustomizer(val1, val2) {
    if (Immutable.Iterable.isIterable(val1) && Immutable.Iterable.isIterable(val2)) {
        return Immutable.is(val1, val2);
    } else if (Immutable.Iterable.isIterable(val1) || Immutable.Iterable.isIterable(val2)) {
        return false;
    } else {
        return undefined;
    }
}

// ================================================================================
//  Public API

module.exports = {
    CursorPropsMixin: CursorPropsMixin
};
