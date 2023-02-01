/**
 * External dependencies
 */
import classnames from 'classnames';
import { useBlockProps, store as blockStore } from '@wordpress/block-editor';
import { innerBlockAreas } from '@woocommerce/blocks-checkout';
import { useCheckoutAddress } from '@woocommerce/base-context/hooks';
import { useSelect } from '@wordpress/data';

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
		deuxPickupString: string;
	};
	setAttributes: ( attributes: Record< string, unknown > ) => void;
} ): JSX.Element | null => {
	const getBlocks = useSelect( ( select ) =>
		select( blockStore ).getBlocks()
	);
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
	const showString =
		getBlocks[ 0 ].innerBlocks[ 0 ].innerBlocks[ 4 ].attributes
			.localPickupString;

	setAttributes( {
		deuxPickupString: showString,
	} );

	// eslint-disable-next-line no-console
	console.log( 1304 );
	// This is only bringing in the default value.
	// eslint-disable-next-line no-console
	console.log( attributes.localPickupString );
	// eslint-disable-next-line no-console
	console.log( 1306 );
	// This is only bringing in the default value.
	// eslint-disable-next-line no-console
	console.log( attributes.deuxPickupString );

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
				showCompanyField={ true }
				showApartmentField={ showApartmentField }
				requireCompanyField={ true }
				showPhoneField={ showPhoneField }
				requirePhoneField={ requirePhoneField }
				localPickupString={ attributes.deuxPickupString }
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
