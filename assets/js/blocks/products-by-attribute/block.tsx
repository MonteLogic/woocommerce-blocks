// assets/js/blocks/products-by-attribute/block.tsx


/**
 * External dependencies
 */
 import { gridBlockPreview } from '@woocommerce/resource-previews';
 import PropTypes from 'prop-types';
 
 
 /**
  * Internal dependencies
  */
 import { Props } from './types';
 import { Attributes } from './types';
 
 
 const ProductsByAttributeBlock = ({
	  attributes,
	 isEditor = false
 
 } : {
 
	 attributes: Attributes;
	 isEditor: boolean;
 } ) => {
	 const firstVar = 5;
	 return null;
 };
 
 ProductsByAttributeBlock.propTypes = {
	 /**
	  * The attributes for this block.
	  */
	 attributes: PropTypes.object.isRequired,
	 /**
	  * Whether it's in the editor or frontend display.
	  */
	 isEditor: PropTypes.bool,
 };
 
 
 export default ProductsByAttributeBlock;
 
 
 
 