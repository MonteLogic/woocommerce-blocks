// assets/js/blocks/products-by-attribute/attributes.ts


/**
 * External dependencies
 */
 import { __ } from '@wordpress/i18n';

 export const blockAttributes = {
     heading: {
         type: 'string',
         default: __( 'Filter by price', 'woo-gutenberg-products-block' ),
     },
 };
 
