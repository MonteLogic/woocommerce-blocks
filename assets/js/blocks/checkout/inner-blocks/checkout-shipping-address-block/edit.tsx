/**
 * External dependencies
 */
import classnames from 'classnames';
import { useBlockProps } from '@wordpress/block-editor';
import { innerBlockAreas } from '@woocommerce/blocks-checkout';
import { useCheckoutAddress } from '@woocommerce/base-context/hooks';
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
		isLocalPickupSelected,
	} = useCheckoutBlockContext();

	// eslint-disable-next-line no-console
	console.log( 1410 );
	// eslint-disable-next-line no-console
	console.log( 'showCompanyField = ' + showCompanyField );

	// eslint-disable-next-line no-console
	console.log( 1564 );
	// eslint-disable-next-line no-console
	console.log( isLocalPickupSelected );

	const { addressFieldControls: Controls } =
		useCheckoutBlockControlsContext();
	const { showShippingFields } = useCheckoutAddress();
	if ( ! showShippingFields ) {
		return null;
	}
	return (
		<FormStepBlock
			setAttributes={ setAttributes }
			attributes={ attributes }
			className={ classnames(
				'wc-block-checkout__shipping-fields',
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
				localPickupInfo={ 'Something' }
				isLocalPickupSelected={ isLocalPickupSelected }
			/>
			<AdditionalFields block={ innerBlockAreas.SHIPPING_ADDRESS } />
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
