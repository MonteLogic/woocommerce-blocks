/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import formStepAttributes from '../../form-step/attributes';

import checkoutShippingMethodsAttribute from '../checkout-shipping-methods-block/attributes';

export default {
	...formStepAttributes( {
		defaultTitle: __( 'Shipping address', 'woo-gutenberg-products-block' ),
		defaultDescription: __(
			'Enter the address where you want your order delivered.',
			'woo-gutenberg-products-block'
		),
	} ),
	...checkoutShippingMethodsAttribute,

	deuxPickupString: {
		type: 'string',
		default: 'deuxPickupString',
	},

	className: {
		type: 'string',
		default: '',
	},
	lock: {
		type: 'object',
		default: {
			move: true,
			remove: true,
		},
	},
};
