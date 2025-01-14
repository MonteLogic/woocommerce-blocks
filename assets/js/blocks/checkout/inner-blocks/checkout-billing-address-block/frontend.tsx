/**
 * External dependencies
 */
import classnames from 'classnames';
import { withFilteredAttributes } from '@woocommerce/shared-hocs';
import { FormStep } from '@woocommerce/base-components/cart-checkout';
import { useCheckoutAddress, useStoreCart } from '@woocommerce/base-context/hooks';
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
}: {
	title: string;
	description: string;
	showStepNumber: boolean;
	children: JSX.Element;
	className?: string;
} ): JSX.Element | null => {
	const checkoutIsProcessing = useSelect( ( select ) =>
		select( CHECKOUT_STORE_KEY ).isProcessing()
	);
	const {
		requireCompanyField,
		requirePhoneField,
		showApartmentField,
		showCompanyField,
		showPhoneField,
	} = useCheckoutBlockContext();
	const { showBillingFields, forcedBillingAddress } = useCheckoutAddress();

	// const {
	// 	shippingRates,
	// } = useStoreCart();
	// console.log(shippingRates);
	
	
	
	// // So I guess shippingRates is an array. 
	
	// // Looking for method_id 
	// const selectedShippingRates = shippingRates.flatMap(
	// 	( shippingPackage ) => {
	// 		return shippingPackage.shipping_rates
	// 			.filter( ( rate ) => rate.selected )
	// 			.flatMap( ( rate ) => rate.method_id );
	// 	}
	// );
	// // Looking for method_id 



	// console.log(selectedShippingRates[0]);

	// if(selectedShippingRates[0] == "local_pickup"){
	// 	// Local pickup has been selected. 
	// 	return null;
	// }






	if ( ! showBillingFields && ! forcedBillingAddress ) {
		return null;
	}

	return (
		<FormStep
			id="billing-fields"
			disabled={ checkoutIsProcessing }
			className={ classnames(
				'wc-block-checkout__billing-fields',
				className
			) }
			title={ title }
			description={ description }
			showStepNumber={ showStepNumber }
		>
			<Block
				requireCompanyField={ requireCompanyField }
				showApartmentField={ showApartmentField }
				showCompanyField={ showCompanyField }
				showPhoneField={ showPhoneField }
				requirePhoneField={ requirePhoneField }
			/>
			{ children }
		</FormStep>
	);
};

export default withFilteredAttributes( attributes )( FrontendBlock );
