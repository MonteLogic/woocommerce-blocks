/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { useShippingData } from '@woocommerce/base-context/hooks';
import { ShippingRatesControl } from '@woocommerce/base-components/cart-checkout';
import { getShippingRatesPackageCount } from '@woocommerce/base-utils';
import { getCurrencyFromPriceResponse } from '@woocommerce/price-format';
import FormattedMonetaryAmount from '@woocommerce/base-components/formatted-monetary-amount';
import { useEditorContext, noticeContexts } from '@woocommerce/base-context';
import { StoreNoticesContainer } from '@woocommerce/blocks-checkout';
import { decodeEntities } from '@wordpress/html-entities';
import { Notice } from 'wordpress-components';
import classnames from 'classnames';
import { getSetting } from '@woocommerce/settings';
import type {
	PackageRateOption,
	CartShippingPackageShippingRate,
} from '@woocommerce/types';
import { createContext, useState } from '@wordpress/element';
import RadioControl from '@woocommerce/base-components/radio-control';
import { store as blockStore } from '@wordpress/block-editor';
import { dispatch, useSelect, select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import NoShippingPlaceholder from './no-shipping-placeholder';
import './style.scss';
/**
 * Renders a shipping rate control option.
 *
 * @param {Object} option Shipping Rate.
 */
const renderShippingRatesControlOption = (
	option: CartShippingPackageShippingRate
): PackageRateOption => {
	const priceWithTaxes = getSetting( 'displayCartPricesIncludingTax', false )
		? parseInt( option.price, 10 ) + parseInt( option.taxes, 10 )
		: parseInt( option.price, 10 );
	return {
		label: decodeEntities( option.name ),
		value: option.rate_id,
		description: decodeEntities( option.description ),
		secondaryLabel: (
			<FormattedMonetaryAmount
				currency={ getCurrencyFromPriceResponse( option ) }
				value={ priceWithTaxes }
			/>
		),
		secondaryDescription: decodeEntities( option.delivery_time ),
	};
};

export const ValueContext = createContext( false );

const Block = ( {
	setAttributes,
	selectedRate,
}: // onSelectRate: ( selectedRateId: string ) => void
{
	selectedRate: CartShippingPackageShippingRate | undefined;
	setAttributes: ( attributes: Record< string, unknown > ) => void;
} ): JSX.Element | null => {
	// I need to bring in state from the shipping methods block.

	const selectedRateId = selectedRate?.rate_id || '';

	// Store selected rate ID in local state so shipping rates changes are shown in the UI instantly.
	// I need to pass this selectedRateId into the shipping-address block.
	const [ selectedOption, setSelectedOption ] = useState( selectedRateId );

	// I need to pass selectedOption here

	const { isEditor } = useEditorContext();
	const getBlocks = useSelect( ( select ) =>
		select( blockStore ).getBlocks()
	);

	// const shippingMethodAttributes =

	const shippingMethodClientID =
		getBlocks[ 0 ].innerBlocks[ 0 ].innerBlocks[ 4 ].clientId;

	// eslint-disable-next-line no-console
	console.log( 1980 );
	// eslint-disable-next-line no-console
	console.log( shippingMethodClientID );

	// eslint-disable-next-line no-console
	console.log( 2010 );

	const shippingMethodBlockAttributes = select(
		'core/block-editor'
	).getBlockAttributes( shippingMethodClientID );

	// eslint-disable-next-line no-console
	console.log( shippingMethodBlockAttributes );

	const setRadioAttributes = ( value: string ) => {
		const newAttributes = {
			...shippingMethodBlockAttributes,
			localPickupString: value,
		};
		dispatch( 'core/block-editor' ).updateBlock(
			shippingMethodClientID,
			newAttributes
		);

		// eslint-disable-next-line no-console
		console.log( 2070 );
	};

	const options = {
		value1: {
			value: 'value1',
			label: 'Label 1',
			disabled: false,
		},
		value2: {
			value: 'value2',
			label: 'Label 2',
			disabled: false,
		},
	};

	const {
		shippingRates,
		needsShipping,
		isLoadingRates,
		hasCalculatedShipping,
	} = useShippingData();

	if ( ! needsShipping ) {
		return null;
	}

	const shippingRatesPackageCount =
		getShippingRatesPackageCount( shippingRates );

	if (
		! isEditor &&
		! hasCalculatedShipping &&
		! shippingRatesPackageCount
	) {
		return (
			<p>
				{ __(
					'Shipping options will be displayed here after entering your full shipping address.',
					'woo-gutenberg-products-block'
				) }
			</p>
		);
	}

	const optionsArray = Object.values( options ).map( ( option ) => ( {
		...option,
	} ) );
	return (
		<>
			<StoreNoticesContainer
				context={ noticeContexts.SHIPPING_METHODS }
			/>

			<RadioControl
				selected={ selectedOption }
				onChange={ ( value: string ) => {
					// eslint-disable-next-line no-console
					console.log( value );
					setSelectedOption( value );

					setRadioAttributes( {
						localPickupString: value,
					} );
					// I don't know what onSelectRate does but it doesn't
					// seem to matter for what I am trying to do.
					// onSelectRate( value );
				} }
				// Within this attriubte needs to be the component RadioControlOption
				options={ optionsArray }
			/>
			<br />
			<br />
			<br />

			{ /* { isEditor && rates.length > 1 ? (
				<RadioControl
					selected={ '' }
					onChange={ function ( value: string ): void {
						throw new Error( 'Function not implemented.' );
					} }
					// Within this attriubte needs to be the component RadioControlOption
					options={ [options] }
				/>
			) : null } */ }

			{ isEditor && ! shippingRatesPackageCount ? (
				<NoShippingPlaceholder />
			) : (
				<ShippingRatesControl
					noResultsMessage={
						<Notice
							isDismissible={ false }
							className={ classnames(
								'wc-block-components-shipping-rates-control__no-results-notice',
								'woocommerce-error'
							) }
						>
							{ __(
								'There are no shipping options available. Please check your shipping address.',
								'woo-gutenberg-products-block'
							) }
						</Notice>
					}
					renderOption={ renderShippingRatesControlOption }
					collapsible={ false }
					shippingRates={ shippingRates }
					isLoadingRates={ isLoadingRates }
					context="woocommerce/checkout"
				/>
			) }
		</>
	);
};

export default Block;
