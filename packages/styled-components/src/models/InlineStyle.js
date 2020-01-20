// @flow
/* eslint-disable import/no-unresolved */
import transformDeclPairs from 'css-to-react-native';

import generateComponentId from '../utils/generateComponentId';
import type { RuleSet, StyleSheet } from '../types';
import flatten from '../utils/flatten';
// $FlowFixMe
import parse from '../vendor/postcss-safe-parser/parse';

let generated = {};

export const resetStyleCache = () => {
  generated = {};
};

/*
 InlineStyle takes arbitrary CSS and generates a flat object
 */
export default (styleSheet: StyleSheet) => {
  class InlineStyle {
    rules: RuleSet;

    constructor(rules: RuleSet) {
      this.rules = rules;
    }

    generateStyleObject(executionContext: Object) {
      const flatCSS = flatten(this.rules, executionContext).join('');

      const hash = generateComponentId(flatCSS);
      if (!generated[hash]) {
        const root = parse(flatCSS);
        const declPairs = [];
        root.each(node => {
          if (node.type === 'decl') {
            declPairs.push([node.prop, node.value]);
          } else if (process.env.NODE_ENV !== 'production' && node.type !== 'comment') {
            /* eslint-disable no-console */
            console.warn(`Node of type ${node.type} not supported as an inline style`);
          }
        });
        const styleObject = transformDeclPairs(declPairs);
        const styles = styleSheet.create({
          generated: styleObject,
        });
        generated[hash] = styles.generated;
      }
      return generated[hash];
    }
  }

  return InlineStyle;
};
