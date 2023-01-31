/**
 * External dependencies
 */
import classnames from 'classnames';
import { withFilteredAttributes } from '@woocommerce/shared-hocs';
import { FormStep } from '@woocommerce/base-components/cart-checkout';
import { useCheckoutAddress } from '@woocommerce/base-context/hooks';
import { useSelect } from '@wordpress/data';
import { CHECKOUT_STORE_KEY } from '@woocommerce/block-data';
/**
 * Internal dependencies
 */
import Block from './block';
import attributes from './attributes';
import { useCheckoutBlockContext } from '../../context';

const FrontendBlock = ( {
	title,
	description,
	showStepNumber,
	children,
	className,
	localPickupString,
}: {
	title: string;
	description: string;
	showStepNumber: boolean;
	children: JSX.Element;
	className?: string;
	localPickupString: string;
} ) => {
	const checkoutIsProcessing = useSelect( ( select ) =>
		select( CHECKOUT_STORE_KEY ).isProcessing()
	);
	const { showShippingFields } = useCheckoutAddress();
	const {
		requireCompanyField,
		requirePhoneField,
		showApartmentField,
		showCompanyField,
		showPhoneField,
	} = useCheckoutBlockContext();

	if ( ! showShippingFields ) {
		return null;
	}

	// eslint-disable-next-line no-console
	console.log( 1556 );
	// eslint-disable-next-line no-console
	console.log( localPickupString );
	// eslint-disable-next-line no-console

	return (
		<FormStep
			id="shipping-fields"
			disabled={ checkoutIsProcessing }
			className={ classnames(
				'wc-block-checkout__shipping-fields',
				className
			) }
			title={ title }
			description={ description }
			showStepNumber={ showStepNumber }
		>
			<Block
				// There needs to be a param here to pass the editable string.
				requireCompanyField={ requireCompanyField }
				requirePhoneField={ requirePhoneField }
				showApartmentField={ showApartmentField }
				showCompanyField={ showCompanyField }
				showPhoneField={ showPhoneField }
				localPickupString={ localPickupString }
			/>
			{ children }
		</FormStep>
	);
};

export default withFilteredAttributes( attributes )( FrontendBlock );
