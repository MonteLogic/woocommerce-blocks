/**
 * External dependencies
 */
import classnames from 'classnames';
import { useBlockProps } from '@wordpress/block-editor';
import { useCheckoutAddress, useShippingData } from '@woocommerce/base-context/hooks';
import { innerBlockAreas } from '@woocommerce/blocks-checkout';

/**
 * Internal dependencies
 */
import {
	FormStepBlock,
	AdditionalFields,
	AdditionalFieldsContent,
} from '../../form-step';
import {
	useCheckoutBlockContext,
	useCheckoutBlockControlsContext,
} from '../../context';
import Block from './block';

export const Edit = ( {
	attributes,
	setAttributes,
}: {
	attributes: {
		title: string;
		description: string;
		showStepNumber: boolean;
		className: string;
	};
	setAttributes: ( attributes: Record< string, unknown > ) => void;
} ): JSX.Element | null => {
	const {
		showCompanyField,
		showApartmentField,
		requireCompanyField,
		showPhoneField,
		requirePhoneField,
	} = useCheckoutBlockContext();
	const { addressFieldControls: Controls } =
		useCheckoutBlockControlsContext();


	const isPickup = useShippingData().selectedRates[ 0 ];
	const { showBillingFields } = useCheckoutAddress();

	if ( ! showBillingFields && isPickup !=  'local_pickup:5'  ) {
		console.log (isPickup);
		return null;
	}

	return (
		<FormStepBlock
			setAttributes={ setAttributes }
			attributes={ attributes }
			className={ classnames(
				'wc-block-checkout__billing-fields',
				attributes?.className
			) }
		>
			<Controls />
			<Block
				showCompanyField={ showCompanyField }
				showApartmentField={ showApartmentField }
				requireCompanyField={ requireCompanyField }
				showPhoneField={ showPhoneField }
				requirePhoneField={ requirePhoneField }
			/>
			<AdditionalFields block={ innerBlockAreas.BILLING_ADDRESS } />
		</FormStepBlock>
	);
};

export const Save = (): JSX.Element => {
	return (
		<div { ...useBlockProps.save() }>
			<AdditionalFieldsContent />
		</div>
	);
};
