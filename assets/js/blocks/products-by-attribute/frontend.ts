// assets/js/blocks/products-by-attribute/frontend.ts

import { renderFrontend } from '@woocommerce/base-utils';

/**
 * Internal dependencies
 */
 import Block from './block';
 import metadata from './block.json';
import { blockAttributes } from './attributes';
import { BlockAlignment } from '@wordpress/blocks';

const getProps = ( el: HTMLElement,  ) => {
	return {
        // This is what the other one is saying:
        // attributes: JSON.parse( el.dataset.attributes ),
        
        
        // So I need to build THIS stuff up. 

        
        // So the attribute vars below are apparently requried.
		attributes: {
            var: 4,


		},
		isEditor: false,
	};
};


renderFrontend( {
	selector: '.wp-block-woocommerce-products-by-attribute',
	Block,
    // Okay, so render-frontend does not like this var: 
	getProps,
} );
// I want to console.log the query which is important for getting the products, if 

console.log(5);
console.log(7);




