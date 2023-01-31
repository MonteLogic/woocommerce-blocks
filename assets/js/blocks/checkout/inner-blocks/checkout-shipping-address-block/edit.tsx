/**
 * External dependencies
 */
import classnames from 'classnames';
import { useBlockProps } from '@wordpress/block-editor';
import { innerBlockAreas } from '@woocommerce/blocks-checkout';
import { useCheckoutAddress } from '@woocommerce/base-context/hooks';
import { select } from '@wordpress/data';

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
		localPickupString: string;
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
	const { showShippingFields } = useCheckoutAddress();
	if ( ! showShippingFields ) {
		return null;
	}
	// eslint-disable-next-line no-console
	console.log( 1304 );
	// eslint-disable-next-line no-console
	console.log( attributes.localPickupString );

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
				localPickupString={ attributes.localPickupString }
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
