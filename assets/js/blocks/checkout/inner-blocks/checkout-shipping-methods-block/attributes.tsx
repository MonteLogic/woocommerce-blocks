/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import formStepAttributes from '../../form-step/attributes';

export default {
	...formStepAttributes( {
		defaultTitle: __( 'Shipping options', 'woo-gutenberg-products-block' ),
		defaultDescription: '',
	} ),
	className: {
		type: 'string',
		default: '',
	},
	localPickupString: {
		type: 'string',
		default:
			'Enter here which place the Local Pickup order is going to go.',
	},

	lock: {
		type: 'object',
		default: {
			move: true,
			remove: true,
		},
	},
};
